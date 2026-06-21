import type { Metadata } from "next";
import ActivitiesList from "./ActivitiesList";

export const metadata: Metadata = {
  title: "Activities | Tourist Booking",
  description:
    "Browse and book tourist activities — adventures, tours, and local experiences.",
};

export default function ActivitiesPage() {
  return <ActivitiesList />;
}
