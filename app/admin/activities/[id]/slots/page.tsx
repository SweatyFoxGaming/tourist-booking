import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import SlotManager from "@/components/admin/SlotManager";

type Params = { params: Promise<{ id: string }> };

export default async function AdminSlotsPage({ params }: Params) {
  const { id } = await params;

  const activity = await prisma.activity.findUnique({
    where: { id },
    select: { id: true, title: true },
  });

  if (!activity) notFound();

  return <SlotManager activityId={activity.id} activityTitle={activity.title} />;
}
