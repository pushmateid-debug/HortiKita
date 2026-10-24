export type UserRole = "member" | "cohortAdmin" | "platformAdmin";

export type UserProfile = {
  uid: string;
  displayName: string;
  username: string;
  cohortId: string | null;
  role: UserRole;
};
