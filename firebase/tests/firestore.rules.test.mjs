import { readFile } from "node:fs/promises";
import { after, afterEach, before, describe, it } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

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
  await environment.cleanup();
});

async function seedData() {
  await environment.withSecurityRulesDisabled(async (context) => {
    const database = context.firestore();
    await Promise.all([
      setDoc(doc(database, "users/member"), { displayName: "Anggota", username: "anggota", cohortId: "angkatan-26", role: "member" }),
      setDoc(doc(database, "users/cohort-admin"), { displayName: "Pengurus", username: "pengurus", cohortId: "angkatan-26", role: "cohortAdmin" }),
      setDoc(doc(database, "users/platform-admin"), { displayName: "Platform", username: "platform", cohortId: null, role: "platformAdmin" }),
      setDoc(doc(database, "users/other-member"), { displayName: "Anggota lain", username: "lain", cohortId: "angkatan-27", role: "member" }),
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
