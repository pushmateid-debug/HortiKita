export type UserRole = "member" | "cohortAdmin" | "platformAdmin";

export type UserProfile = {
  uid: string;
  displayName: string;
  username: string;
  photoURL: string | null;
  bio: string;
  cohortId: string | null;
  role: UserRole;
};

export type EditableProfile = Pick<UserProfile, "displayName" | "username" | "photoURL" | "bio">;

export type MembershipRequestStatus = "pending" | "approved" | "rejected";

export type MembershipRequest = {
  cohortId: string;
  status: MembershipRequestStatus;
};
