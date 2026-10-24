import type { Metadata } from "next";
import { Classroom } from "@/components/classes/classroom";

export const metadata: Metadata = { title: "Ruang Kelas" };
type Props = { params: Promise<{ classId: string }> };

export default async function ClassPage({ params }: Props) {
  const { classId } = await params;
  return <section className="page-content inner-page"><Classroom classId={classId} /></section>;
}
