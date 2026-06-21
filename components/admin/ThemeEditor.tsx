"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FONT_OPTIONS, themeToCssVariables } from "@/lib/theme";

type Theme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  layoutVariant: string;
  borderRadius: string;
  headerStyle: string;
};

export function ThemeEditor() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/theme")
      .then((r) => r.json())
      .then(setTheme);
  }, []);

  async function handleSave() {
    if (!theme) return;
    setSaving(true);
    setSaved(false);

    await fetch("/api/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.url) {
      setTheme((prev) => (prev ? { ...prev, logoUrl: data.url } : prev));
    }
    setUploading(false);
  }

  if (!theme) {
    return <div className="h-96 animate-pulse rounded-[var(--radius)] bg-gray-200" />;
  }

  const previewCss = themeToCssVariables(theme as Parameters<typeof themeToCssVariables>[0]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Colors</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["primaryColor", "Primary"],
                ["secondaryColor", "Secondary"],
                ["accentColor", "Accent"],
                ["backgroundColor", "Background"],
                ["textColor", "Text"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label>{label}</Label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={(e) =>
                      setTheme({ ...theme, [key]: e.target.value })
                    }
                    className="h-10 w-12 cursor-pointer rounded border"
                  />
                  <Input
                    value={theme[key]}
                    onChange={(e) =>
                      setTheme({ ...theme, [key]: e.target.value })
                    }
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Typography & Layout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Font Family</Label>
              <Select
                value={theme.fontFamily}
                onValueChange={(v) => setTheme({ ...theme, fontFamily: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Layout Variant</Label>
              <Select
                value={theme.layoutVariant}
                onValueChange={(v) => setTheme({ ...theme, layoutVariant: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero_centered">Hero Centered</SelectItem>
                  <SelectItem value="hero_split">Hero Split</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Border Radius</Label>
              <Select
                value={theme.borderRadius}
                onValueChange={(v) => setTheme({ ...theme, borderRadius: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sharp">Sharp</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="pill">Pill</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Header Style</Label>
              <Select
                value={theme.headerStyle}
                onValueChange={(v) => setTheme({ ...theme, headerStyle: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="transparent">Transparent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
          </CardHeader>
          <CardContent>
            {theme.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={theme.logoUrl}
                alt="Logo preview"
                className="mb-4 h-12 w-auto"
              />
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploading}
            />
            <p className="mt-2 text-sm text-gray-500">
              Or enter a URL:
            </p>
            <Input
              value={theme.logoUrl ?? ""}
              onChange={(e) =>
                setTheme({ ...theme, logoUrl: e.target.value || null })
              }
              placeholder="https://..."
              className="mt-1"
            />
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "Saving..." : saved ? "Saved!" : "Save & Publish"}
        </Button>
      </div>

      <div>
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <style dangerouslySetInnerHTML={{ __html: previewCss }} />
            <div
              className="overflow-hidden rounded-[var(--radius)] border"
              style={{
                backgroundColor: "var(--color-background)",
                color: "var(--color-text)",
                fontFamily: "var(--font-family)",
              }}
            >
              <div
                className="px-4 py-3"
                style={{
                  backgroundColor:
                    theme.headerStyle === "solid"
                      ? "white"
                      : "transparent",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div className="flex items-center gap--2">
                  {theme.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={theme.logoUrl} alt="" className="h-8" />
                  ) : (
                    <div
                      className="flex h-8 w-8 items-center justify-center text-xs font-bold text-white"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        borderRadius: "var(--radius)",
                      }}
                    >
                      TB
                    </div>
                  )}
                  <span className="font-bold">Tourist Booking</span>
                </div>
              </div>
              <div
                className="px-6 py-10 text-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor}15, ${theme.secondaryColor}10)`,
                }}
              >
                <h2
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-text)" }}
                >
                  Discover Adventures
                </h2>
                <p className="mt-2 text-sm opacity-70">
                  Book unique tourist experiences
                </p>
                <button
                  className="mt-4 px-6 py-2 text-sm font-medium text-white"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  Browse Activities
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden border"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <div
                      className="h-20"
                      style={{
                        background: `linear-gradient(${theme.primaryColor}, ${theme.secondaryColor})`,
                      }}
                    />
                    <div className="p-2">
                      <p className="text-xs font-semibold">Activity {i}</p>
                      <p
                        className="text-xs font-bold"
                        style={{ color: "var(--color-primary)" }}
                      >
                        $89.99
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
