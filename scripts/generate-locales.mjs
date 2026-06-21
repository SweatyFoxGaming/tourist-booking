/**
 * Generates locale message files from en.json using built-in translations.
 * Run: node scripts/generate-locales.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const en = JSON.parse(readFileSync(join(root, "messages/en.json"), "utf8"));

const catalogs = {
  af: {
    "metadata.siteTitle": "Toeriste Bespreking — Aktiwiteite",
    "metadata.siteDescription": "Ontdek en bespreek unieke toeriste-aktiwiteite regoor die wêreld.",
    "nav.home": "Tuis",
    "nav.activities": "Aktiwiteite",
    "nav.about": "Oor Ons",
    "nav.contact": "Kontak",
    "nav.findBooking": "Vind Bespreking",
    "nav.terms": "Bepalings & Voorwaardes",
    "nav.privacy": "Privaatheidsbeleid",
    "nav.admin": "Admin",
    "nav.myBookings": "My Besprekings",
    "nav.signIn": "Teken in",
    "nav.signOut": "Teken uit",
    "nav.openMenu": "Maak spyskaart oop",
    "nav.closeMenu": "Maak spyskaart toe",
    "footer.brand": "Toeriste Bespreking",
    "footer.tagline": "Ontdek en bespreek unieke toeriste-aktiwiteite regoor die wêreld. Geen rekening nodig nie — kies 'n ervaring, kies jou datum, en gaan.",
    "footer.pages": "Bladsye",
    "footer.contact": "Kontak",
    "footer.availableWorldwide": "Wêreldwyd beskikbaar",
    "footer.copyright": "© {year} Toeriste Bespreking. Alle regte voorbehou.",
    "footer.termsShort": "Bepalings",
    "footer.privacyShort": "Privaatheid",
    "home.heroCenteredTitle": "Ontdek Buitengewone",
    "home.heroCenteredHighlight": "Toeriste Ervarings",
    "home.heroCenteredSubtitle": "Bespreek unieke aktiwiteite saamgestel deur plaaslike kundiges.",
    "home.browseActivities": "Blaai Aktiwiteite",
    "home.aboutUs": "Oor Ons",
    "home.heroSplitTitle": "Jou Avontuur Wag",
    "home.heroSplitSubtitle": "Handgekose toeriste-aktiwiteite met onmiddellike bespreking — geen aanmelding nodig nie.",
    "home.exploreActivities": "Verken Aktiwiteite",
    "home.learnMore": "Leer Meer",
    "home.heroMinimalTitle": "Welkom by Toeriste Bespreking",
    "home.heroMinimalSubtitle": "Saamgestelde ervarings met buigsame skedulering en gas-afhandeling.",
    "home.viewActivities": "Bekyk Aktiwiteite",
    "home.featureCuratedTitle": "Saamgestelde Ervarings",
    "home.featureCuratedBody": "Elke aktiwiteit word gekontroleer vir kwaliteit, veiligheid en plaaslike insig.",
    "home.featureSecureTitle": "Veilige Bespreking",
    "home.featureSecureBody": "Betaal veilig aanlyn en ontvang onmiddellike e-posbevestiging.",
    "home.featureFastTitle": "Bespreek in Minute",
    "home.featureFastBody": "Kies 'n datum, kies jou tyd, voer jou besonderhede in — geen rekening nodig nie.",
    "home.ctaTitle": "Gereed om te verken?",
    "home.ctaBody": "Blaai deur ons volledige versameling avonture, toere en plaaslike ervarings.",
    "home.seeAllActivities": "Sien Alle Aktiwiteite",
    "activities.title": "Aktiwiteite",
    "activities.subtitle": "Blaai en bespreek uit ons versameling saamgestelde toeriste-ervarings.",
    "activities.searchPlaceholder": "Soek aktiwiteite...",
    "activities.category": "Kategorie",
    "activities.allCategories": "Alle Kategorieë",
    "activities.noResults": "Geen aktiwiteite pas by jou soektog nie.",
    "activities.perPerson": "per persoon",
    "activities.reviews": "{count} resensies",
    "activities.from": "Vanaf",
    "activities.bookNow": "Bespreek Nou",
    "activities.guest": "Gas",
    "booking.title": "Bespreek: {activity}",
    "booking.subtitle": "Kies 'n datum, tyd en aantal gaste — geen rekening nodig nie",
    "booking.stepDate": "1. Kies 'n Datum",
    "booking.stepTime": "2. Kies 'n Tyd",
    "booking.stepDetails": "3. Jou Besonderhede",
    "booking.stepCheckout": "3. Gaste & Betaling",
    "booking.proceedToPayment": "Gaan voort na Betaling — {total}",
    "booking.processing": "Verwerk...",
    "notFound.title": "Bladsy nie gevind nie",
    "notFound.body": "Die bladsy waarna jy soek bestaan nie of is verskuif.",
    "notFound.goHome": "Gaan Tuis",
    "notFound.browseActivities": "Blaai Aktiwiteite",
    "common.guest": "Gas",
    "common.min": "{count} min",
    "common.hoursMinutes": "{hours}u {minutes}m",
    "common.hours": "{hours}u",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.activities": "Activités",
    "nav.about": "À propos",
    "nav.contact": "Contact",
    "nav.findBooking": "Trouver une réservation",
    "nav.terms": "Conditions générales",
    "nav.privacy": "Politique de confidentialité",
    "nav.signIn": "Se connecter",
    "nav.signOut": "Se déconnecter",
    "footer.brand": "Réservation Touristique",
    "footer.tagline": "Découvrez et réservez des activités touristiques uniques dans le monde entier.",
    "home.heroCenteredTitle": "Découvrez des",
    "home.heroCenteredHighlight": "Expériences Touristiques",
    "home.browseActivities": "Parcourir les activités",
    "home.aboutUs": "À propos",
    "activities.title": "Activités",
    "activities.perPerson": "par personne",
    "activities.bookNow": "Réserver",
    "booking.proceedToPayment": "Procéder au paiement — {total}",
    "notFound.title": "Page introuvable",
    "notFound.goHome": "Accueil",
  },
  de: {
    "nav.home": "Startseite",
    "nav.activities": "Aktivitäten",
    "nav.about": "Über uns",
    "nav.contact": "Kontakt",
    "nav.signIn": "Anmelden",
    "nav.signOut": "Abmelden",
    "footer.brand": "Tourist Booking",
    "home.browseActivities": "Aktivitäten entdecken",
    "activities.title": "Aktivitäten",
    "activities.bookNow": "Jetzt buchen",
    "notFound.title": "Seite nicht gefunden",
  },
  es: {
    "nav.home": "Inicio",
    "nav.activities": "Actividades",
    "nav.about": "Sobre nosotros",
    "nav.contact": "Contacto",
    "nav.signIn": "Iniciar sesión",
    "nav.signOut": "Cerrar sesión",
    "home.browseActivities": "Ver actividades",
    "activities.title": "Actividades",
    "activities.bookNow": "Reservar ahora",
    "notFound.title": "Página no encontrada",
  },
  pt: {
    "nav.home": "Início",
    "nav.activities": "Atividades",
    "nav.about": "Sobre nós",
    "nav.contact": "Contacto",
    "nav.signIn": "Entrar",
    "nav.signOut": "Sair",
    "activities.title": "Atividades",
    "activities.bookNow": "Reservar agora",
  },
  nl: {
    "nav.home": "Home",
    "nav.activities": "Activiteiten",
    "nav.about": "Over ons",
    "nav.contact": "Contact",
    "nav.signIn": "Inloggen",
    "nav.signOut": "Uitloggen",
    "activities.title": "Activiteiten",
    "activities.bookNow": "Nu boeken",
  },
  zh: {
    "nav.home": "首页",
    "nav.activities": "活动",
    "nav.about": "关于我们",
    "nav.contact": "联系我们",
    "nav.signIn": "登录",
    "nav.signOut": "退出",
    "home.browseActivities": "浏览活动",
    "activities.title": "活动",
    "activities.bookNow": "立即预订",
    "notFound.title": "页面未找到",
  },
  ja: {
    "nav.home": "ホーム",
    "nav.activities": "アクティビティ",
    "nav.about": "私たちについて",
    "nav.contact": "お問い合わせ",
    "nav.signIn": "ログイン",
    "nav.signOut": "ログアウト",
    "activities.title": "アクティビティ",
    "activities.bookNow": "今すぐ予約",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.activities": "الأنشطة",
    "nav.about": "من نحن",
    "nav.contact": "اتصل بنا",
    "nav.signIn": "تسجيل الدخول",
    "nav.signOut": "تسجيل الخروج",
    "home.browseActivities": "تصفح الأنشطة",
    "activities.title": "الأنشطة",
    "activities.bookNow": "احجز الآن",
    "notFound.title": "الصفحة غير موجودة",
  },
};

function setByPath(obj, path, value) {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

for (const [locale, catalog] of Object.entries(catalogs)) {
  const messages = deepClone(en);
  for (const [path, value] of Object.entries(catalog)) {
    setByPath(messages, path, value);
  }
  writeFileSync(
    join(root, `messages/${locale}.json`),
    `${JSON.stringify(messages, null, 2)}\n`,
    "utf8"
  );
  console.log(`Wrote messages/${locale}.json`);
}
