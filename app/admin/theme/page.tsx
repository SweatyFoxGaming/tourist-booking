import { ThemeEditor } from "@/components/admin/ThemeEditor";

export default function AdminThemePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Theme Builder</h1>
      <p className="text-slate-300">
        Customize colors, fonts, logo, and layout — changes apply site-wide
      </p>
      <div className="mt-8">
        <ThemeEditor />
      </div>
    </div>
  );
}
