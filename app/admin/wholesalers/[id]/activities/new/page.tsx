import ActivityForm from "@/components/admin/ActivityForm";

type Params = { params: Promise<{ id: string }> };

export default async function NewPartnerActivityPage({ params }: Params) {
  const { id } = await params;

  return (
    <ActivityForm
      defaultWholesalerId={id}
      redirectTo={`/admin/wholesalers/${id}`}
    />
  );
}
