import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CohortProfile } from "@/components/community/cohort-profile";
import { cohorts } from "@/lib/demo-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cohort = cohorts.find((item) => item.slug === slug);
  return { title: cohort?.name ?? "Angkatan tidak ditemukan" };
}

export default async function CohortPage({ params }: Props) {
  const { slug } = await params;
  const cohort = cohorts.find((item) => item.slug === slug);
  if (!cohort) notFound();
  return <CohortProfile cohort={cohort} />;
}
