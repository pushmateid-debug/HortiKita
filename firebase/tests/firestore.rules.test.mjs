import { readFile } from "node:fs/promises";
import { after, afterEach, before, describe, it } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

const projectId = "hortikita-firestore-rules-test";
let environment;

before(async () => {
  const rules = await readFile(new URL("../firestore.rules", import.meta.url), "utf8");
  environment = await initializeTestEnvironment({ projectId, firestore: { rules } });
});

afterEach(async () => {
  await environment.clearFirestore();
});

after(async () => {
  if (environment) await environment.cleanup();
});

async function seedData() {
  await environment.withSecurityRulesDisabled(async (context) => {
    const database = context.firestore();
    await Promise.all([
      setDoc(doc(database, "users/member"), { displayName: "Anggota", username: "anggota", email: "member@example.com", photoURL: null, bio: "", cohortId: null, role: "member", createdAt: "seed", updatedAt: "seed" }),
      setDoc(doc(database, "users/cohort-admin"), { displayName: "Pengurus", username: "pengurus", email: "admin@example.com", photoURL: null, bio: "", cohortId: "angkatan-26", role: "cohortAdmin", createdAt: "seed", updatedAt: "seed" }),
      setDoc(doc(database, "users/cohort-admin-27"), { displayName: "Pengurus 27", username: "pengurus27", email: "admin27@example.com", photoURL: null, bio: "", cohortId: "angkatan-27", role: "cohortAdmin", createdAt: "seed", updatedAt: "seed" }),
      setDoc(doc(database, "users/platform-admin"), { displayName: "Platform", username: "platform", email: "platform@example.com", photoURL: null, bio: "", cohortId: null, role: "platformAdmin", createdAt: "seed", updatedAt: "seed" }),
      setDoc(doc(database, "users/other-member"), { displayName: "Anggota lain", username: "lain", email: "other@example.com", photoURL: null, bio: "", cohortId: null, role: "member", createdAt: "seed", updatedAt: "seed" }),
      setDoc(doc(database, "classes/angkatan-26"), {
        name: "Angkatan 26",
        cohortId: "angkatan-26",
        memberIds: ["member", "cohort-admin"],
        adminIds: ["cohort-admin"],
      }),
      setDoc(doc(database, "classes/angkatan-27"), {
        name: "Angkatan 27",
        cohortId: "angkatan-27",
        memberIds: ["other-member"],
        adminIds: [],
      }),
      setDoc(doc(database, "classes/angkatan-26/announcements/jadwal"), {
        title: "Jadwal praktik",
        createdAt: "2026-10-01",
      }),
    ]);
  });
}

describe("Firestore access rules", () => {
  it("denies unauthenticated access to class and account data while allowing public catalog reads", async () => {
    await seedData();
    const database = environment.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(database, "classes/angkatan-26")));
    await assertFails(getDoc(doc(database, "users/member")));
    await assertSucceeds(getDoc(doc(database, "products/sample")));
  });

  it("allows members to read only their own class and prevents self-promotion", async () => {
    await seedData();
    const database = environment.authenticatedContext("member").firestore();
    await assertSucceeds(getDoc(doc(database, "classes/angkatan-26")));
    await assertSucceeds(getDoc(doc(database, "classes/angkatan-26/announcements/jadwal")));
    await assertFails(getDoc(doc(database, "classes/angkatan-27")));
    await assertFails(updateDoc(doc(database, "users/member"), { role: "cohortAdmin" }));
    await assertFails(updateDoc(doc(database, "users/member"), { cohortId: "angkatan-27" }));
    await assertSucceeds(updateDoc(doc(database, "users/member"), {
      displayName: "Nama Baru",
      bio: "Bio anggota",
      updatedAt: serverTimestamp(),
    }));
  });

  it("lets authenticated users request cohort membership but not verify themselves", async () => {
    await seedData();
    const memberDb = environment.authenticatedContext("other-member").firestore();
    const requestRef = doc(memberDb, "membershipRequests/other-member_angkatan-26");
    await assertSucceeds(setDoc(requestRef, {
      userId: "other-member",
      cohortId: "angkatan-26",
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }));
    await assertFails(updateDoc(requestRef, {
      status: "approved",
      updatedAt: serverTimestamp(),
      reviewedAt: serverTimestamp(),
      reviewedBy: "other-member",
    }));
    await assertFails(getDoc(doc(memberDb, "membershipRequests/member_angkatan-26")));

    const otherCohortAdmin = environment.authenticatedContext("cohort-admin-27").firestore();
    await assertFails(updateDoc(doc(otherCohortAdmin, "membershipRequests/other-member_angkatan-26"), {
      status: "approved",
      updatedAt: serverTimestamp(),
      reviewedAt: serverTimestamp(),
      reviewedBy: "cohort-admin-27",
    }));
  });

  it("allows only the assigned cohort admin to verify a membership request", async () => {
    await seedData();
    const memberDb = environment.authenticatedContext("other-member").firestore();
    const requestRef = doc(memberDb, "membershipRequests/other-member_angkatan-26");
    await assertSucceeds(setDoc(requestRef, {
      userId: "other-member",
      cohortId: "angkatan-26",
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }));

    const adminDb = environment.authenticatedContext("cohort-admin").firestore();
    await assertSucceeds(updateDoc(doc(adminDb, "membershipRequests/other-member_angkatan-26"), {
      status: "approved",
      updatedAt: serverTimestamp(),
      reviewedAt: serverTimestamp(),
      reviewedBy: "cohort-admin",
    }));
    await assertSucceeds(getDoc(doc(memberDb, "classes/angkatan-26")));
  });

  it("does not allow members to create elevated profiles or claim an email", async () => {
    await seedData();
    const database = environment.authenticatedContext("new-user", { email: "new@example.com" }).firestore();
    const baseProfile = {
      displayName: "Anggota Baru",
      username: "anggota.baru",
      email: "new@example.com",
      photoURL: null,
      bio: "",
      cohortId: null,
      role: "member",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await assertSucceeds(setDoc(doc(database, "users/new-user"), baseProfile));
    const elevatedUserDb = environment.authenticatedContext("imposter", { email: "new@example.com" }).firestore();
    await assertFails(setDoc(doc(elevatedUserDb, "users/imposter"), {
      ...baseProfile,
      role: "cohortAdmin",
      cohortId: "angkatan-26",
    }));
    const emailClaimDb = environment.authenticatedContext("email-claimant", { email: "claimant@example.com" }).firestore();
    await assertFails(setDoc(doc(emailClaimDb, "users/email-claimant"), {
      ...baseProfile,
      email: "admin@example.com",
    }));
  });

  it("allows platform admins to assign a cohort-scoped role", async () => {
    await seedData();
    const platformDb = environment.authenticatedContext("platform-admin").firestore();
    await assertSucceeds(updateDoc(doc(platformDb, "users/member"), {
      role: "cohortAdmin",
      cohortId: "angkatan-26",
      updatedAt: serverTimestamp(),
    }));

    const assignedAdminDb = environment.authenticatedContext("member").firestore();
    await assertSucceeds(setDoc(doc(assignedAdminDb, "classes/angkatan-26/announcements/baru"), {
      title: "Pengumuman oleh admin yang ditugaskan",
      createdAt: "2026-10-10",
    }));
    await assertFails(setDoc(doc(assignedAdminDb, "classes/angkatan-27/announcements/baru"), {
      title: "Tidak boleh mengelola angkatan lain",
    }));
  });

  it("denies access to members of another class", async () => {
    await seedData();
    const database = environment.authenticatedContext("other-member").firestore();
    await assertSucceeds(getDoc(doc(database, "classes/angkatan-27")));
    await assertFails(getDoc(doc(database, "classes/angkatan-26")));
    await assertFails(getDoc(doc(database, "classes/angkatan-26/announcements/jadwal")));
  });

  it("lets cohort admins manage only their class content", async () => {
    await seedData();
    const database = environment.authenticatedContext("cohort-admin").firestore();
    await assertSucceeds(setDoc(doc(database, "classes/angkatan-26/announcements/pengingat"), {
      title: "Pengingat kelas",
      createdAt: "2026-10-02",
    }));
    await assertFails(setDoc(doc(database, "classes/angkatan-27/announcements/pengingat"), {
      title: "Tidak diizinkan",
    }));
    await assertFails(getDoc(doc(database, "users/member")));
  });

  it("lets platform admins access private class data", async () => {
    await seedData();
    const database = environment.authenticatedContext("platform-admin").firestore();
    await assertSucceeds(getDoc(doc(database, "classes/angkatan-26")));
    await assertSucceeds(getDoc(doc(database, "classes/angkatan-27")));
    await assertSucceeds(setDoc(doc(database, "classes/angkatan-27/transactions/pemasukan"), {
      description: "Koreksi pengurus",
      income: 1000,
    }));
  });
});
