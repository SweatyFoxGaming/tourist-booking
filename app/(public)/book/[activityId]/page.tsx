import BookingFlow from "@/components/booking/BookingFlow";

type Params = { params: Promise<{ activityId: string }> };

export default async function BookPage({ params }: Params) {
  const { activityId } = await params;
  return <BookingFlow activityId={activityId} />;
}
