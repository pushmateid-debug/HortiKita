import type { Metadata } from "next";
import { ProfileContent } from "@/components/community/profile-content";

type ProfilePageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  return { title: `Profil ${username}` };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  return <section className="page-content inner-page"><ProfileContent username={username} /></section>;
}
