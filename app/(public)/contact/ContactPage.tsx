"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { getWhatsAppChatUrl } from "@/lib/whatsapp-public";

export default function ContactPageClient() {
  const whatsAppUrl = getWhatsAppChatUrl("Hi! I have a question about Tourist Booking.");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setError("Failed to send message. Please try again.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div>
      <section className="border-b border-gray-200 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-[var(--color-text)]">Contact Us</h1>
          <p className="mt-3 text-gray-600">
            Questions about a booking, activity, or partnership? We&apos;re here to help.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-6">
          <div className="flex gap-3">
            <Mail className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-gray-500">support@touristbooking.com</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
            <div>
              <p className="font-medium">Coverage</p>
              <p className="text-sm text-gray-500">Activities available worldwide</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
            <div>
              <p className="font-medium">Response time</p>
              <p className="text-sm text-gray-500">Within 1–2 business days</p>
            </div>
          </div>
          {whatsAppUrl && (
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-[var(--radius)] border border-[#25D366]/30 bg-[#25D366]/5 p-4 transition-colors hover:bg-[#25D366]/10"
            >
              <MessageCircle className="h-5 w-5 shrink-0 text-[#25D366]" />
              <div>
                <p className="font-medium text-[var(--color-text)]">WhatsApp</p>
                <p className="text-sm text-gray-500">Chat with us instantly</p>
              </div>
            </a>
          )}
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <p className="text-green-600">
                Thank you! Your message has been sent. We&apos;ll get back to you soon.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={5}
                    className="mt-1"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
