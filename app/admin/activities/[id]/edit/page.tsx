import ActivityForm from "@/components/admin/ActivityForm";

type Params = { params: Promise<{ id: string }> };

export default async function EditActivityPage({ params }: Params) {
  const { id } = await params;
  return <ActivityForm activityId={id} />;
}
