"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, ExternalLink } from "lucide-react";

type Wholesaler = {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  isActive: boolean;
  _count?: { activities: number };
};

export default function AdminWholesalersPage() {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wholesalers")
      .then((r) => r.json())
      .then(setWholesalers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Wholesalers</h1>
          <p className="text-slate-300">
            Manage partner companies and their resold activities
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/wholesalers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add wholesaler
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="mt-8 h-64 animate-pulse rounded-xl bg-slate-800" />
      ) : wholesalers.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
          <Building2 className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-4 text-slate-200">No wholesalers yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Add a partner to start listing their activities on your site
          </p>
          <Button className="mt-6" asChild>
            <Link href="/admin/wholesalers/new">Add first wholesaler</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-300">
                <th className="p-4 font-medium">Partner</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Activities</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wholesalers.map((wholesaler) => (
                <tr key={wholesaler.id} className="border-b border-slate-800/80 last:border-0">
                  <td className="p-4 font-medium text-white">{wholesaler.name}</td>
                  <td className="p-4 text-slate-200">{wholesaler.contactEmail}</td>
                  <td className="p-4 text-slate-200">{wholesaler._count?.activities ?? 0}</td>
                  <td className="p-4">
                    <Badge variant={wholesaler.isActive ? "success" : "outline"}>
                      {wholesaler.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/wholesalers/${wholesaler.id}`}>
                        <ExternalLink className="mr-1 h-4 w-4" />
                        Manage
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
