import type { Metadata } from "next";
import GuestReviewPage from "./GuestReviewPage";

type Params = { params: Promise<{ token: string }> };

export const metadata: Metadata = {
  title: "Leave a Review | Tourist Booking",
  robots: { index: false },
};

export default async function ReviewPage({ params }: Params) {
  const { token } = await params;
  return <GuestReviewPage token={token} />;
}
