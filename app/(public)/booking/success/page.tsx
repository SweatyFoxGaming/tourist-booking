import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { getLocale, getTranslations } from "@/lib/i18n/server";

type SearchParams = { searchParams: Promise<{ bookingId?: string }> };

export default async function BookingSuccessPage({ searchParams }: SearchParams) {
  const { bookingId } = await searchParams;
  const t = await getTranslations("bookingSuccess");
  const tHome = await getTranslations("home");
  const locale = await getLocale();

  let booking = null;
  if (bookingId) {
    booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        activity: true,
        slot: true,
      },
    });
  }

  const isConfirmed = booking?.status === "CONFIRMED";

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      <h1 className="mt-6 text-3xl font-bold text-[var(--color-text)]">
        {isConfirmed ? t("confirmedTitle") : t("pendingTitle")}
      </h1>
      <p className="mt-2 text-gray-500">
        {isConfirmed ? t("confirmedBody") : t("pendingBody")}
      </p>

      {booking && (
        <Card className="mt-8 text-left">
          <CardContent className="space-y-3 p-6">
            <div className="flex justify-between">
              <span className="text-gray-500">{t("activity")}</span>
              <span className="font-medium">{booking.activity.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("date")}</span>
              <span className="font-medium">{booking.slot.startTime.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("guests")}</span>
              <span className="font-medium">{booking.guestCount}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-500">{t("total")}</span>
              <span className="font-bold text-[var(--color-primary)]">
                {formatPrice(Number(booking.totalPrice), locale)}
              </span>
            </div>
            <div className="border-t pt-3">
              <span className="text-gray-500">{t("reference")}</span>
              <p className="mt-1 break-all font-mono text-sm">{booking.id}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href="/booking/lookup">{t("findBooking")}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/activities">{tHome("browseActivities")}</Link>
        </Button>
      </div>
    </div>
  );
}
