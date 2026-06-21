import WholesalerForm from "@/components/admin/WholesalerForm";

type Params = { params: Promise<{ id: string }> };

export default async function EditWholesalerPage({ params }: Params) {
  const { id } = await params;
  return <WholesalerForm wholesalerId={id} />;
}
