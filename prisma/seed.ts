import { hash } from "bcryptjs";
import { prisma } from "../lib/db";

async function main() {
  const adminPassword = await hash("admin123", 12);
  const customerPassword = await hash("customer123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      name: "Jane Traveler",
      passwordHash: customerPassword,
      role: "CUSTOMER",
    },
  });

  await prisma.siteTheme.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
    },
  });

  const activities = [
    {
      title: "Sunset Kayak Adventure",
      slug: "sunset-kayak-adventure",
      description:
        "Paddle through calm waters as the sun sets over the horizon. Perfect for beginners and experienced kayakers alike. Includes equipment, safety briefing, and a local guide.",
      location: "Marina Bay, California",
      duration: 120,
      price: 89.99,
      images: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      ],
      category: "Water Sports",
      isPublished: true,
    },
    {
      title: "Old Town Walking Tour",
      slug: "old-town-walking-tour",
      description:
        "Discover hidden gems and centuries of history on this guided walking tour through the historic district. Visit landmarks, hear local stories, and enjoy tastings at artisan shops.",
      location: "Historic District, Charleston",
      duration: 180,
      price: 45.0,
      images: [
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
      ],
      category: "Culture",
      isPublished: true,
    },
    {
      title: "Mountain Hiking Expedition",
      slug: "mountain-hiking-expedition",
      description:
        "A full-day guided hike through scenic mountain trails with breathtaking views. Moderate difficulty. Lunch and transportation included.",
      location: "Rocky Mountain National Park",
      duration: 480,
      price: 129.0,
      images: [
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
      ],
      category: "Adventure",
      isPublished: true,
    },
    {
      title: "Wine Country Tasting Tour",
      slug: "wine-country-tasting-tour",
      description:
        "Visit three boutique wineries, enjoy guided tastings, and learn about local viticulture. Includes round-trip transport and cheese pairings.",
      location: "Napa Valley, California",
      duration: 360,
      price: 159.0,
      images: [
        "https://images.unsplash.com/photo-1506377247727-904aaa979cf5?w=800",
      ],
      category: "Food & Drink",
      isPublished: true,
    },
  ];

  for (const activity of activities) {
    const created = await prisma.activity.upsert({
      where: { slug: activity.slug },
      update: activity,
      create: activity,
    });

    const existingSlots = await prisma.activitySlot.count({
      where: { activityId: created.id },
    });

    if (existingSlots === 0) {
      const now = new Date();
      for (let day = 1; day <= 14; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() + day);
        date.setHours(9, 0, 0, 0);

        const end = new Date(date);
        end.setMinutes(end.getMinutes() + activity.duration);

        await prisma.activitySlot.create({
          data: {
            activityId: created.id,
            startTime: date,
            endTime: end,
            capacity: 12,
            bookedCount: 0,
          },
        });

        const afternoon = new Date(date);
        afternoon.setHours(14, 0, 0, 0);
        const afternoonEnd = new Date(afternoon);
        afternoonEnd.setMinutes(afternoonEnd.getMinutes() + activity.duration);

        await prisma.activitySlot.create({
          data: {
            activityId: created.id,
            startTime: afternoon,
            endTime: afternoonEnd,
            capacity: 12,
            bookedCount: 0,
          },
        });
      }
    }
  }

  console.log("Seed complete:");
  console.log(`  Admin: ${admin.email} / admin123`);
  console.log(`  Customer: ${customer.email} / customer123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
