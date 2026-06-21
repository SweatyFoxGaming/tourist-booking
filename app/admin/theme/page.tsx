import { ThemeEditor } from "@/components/admin/ThemeEditor";

export default function AdminThemePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Theme Builder</h1>
      <p className="text-gray-500">
        Customize colors, fonts, logo, and layout — changes apply site-wide
      </p>
      <div className="mt-8">
        <ThemeEditor />
      </div>
    </div>
  );
}
