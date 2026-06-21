"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WholesalerFormProps = {
  wholesalerId?: string;
};

export default function WholesalerForm({ wholesalerId }: WholesalerFormProps) {
  const router = useRouter();
  const isEdit = !!wholesalerId;

  const [form, setForm] = useState({
    name: "",
    slug: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    notes: "",
    commissionRate: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!wholesalerId) return;

    fetch(`/api/wholesalers/${wholesalerId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          name: data.name,
          slug: data.slug,
          contactName: data.contactName ?? "",
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone ?? "",
          website: data.website ?? "",
          notes: data.notes ?? "",
          commissionRate:
            data.commissionRate != null ? String(data.commissionRate) : "",
          isActive: data.isActive,
        });
      });
  }, [wholesalerId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(
      isEdit ? `/api/wholesalers/${wholesalerId}` : "/api/wholesalers",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to save wholesaler");
      setLoading(false);
      return;
    }

    router.push(`/admin/wholesalers/${data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">
        {isEdit ? "Edit wholesaler" : "Add wholesaler"}
      </h1>
      <p className="mt-1 text-sm text-slate-300">
        Partner companies whose activities you resell on your site
      </p>

      <Card className="mt-8 border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-white">Partner details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Company name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. cape-adventures"
                className="mt-1"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="contactName">Contact name</Label>
                <Input
                  id="contactName"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="contactPhone">Contact phone</Label>
                <Input
                  id="contactPhone"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="commissionRate">Commission rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.commissionRate}
                onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
                placeholder="Optional — for your internal records"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="notes">Internal notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="mt-1"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active partner
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save wholesaler"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
