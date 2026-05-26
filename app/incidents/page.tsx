"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Incident {
  _id: string;
  description: string;
  status: string;
  createdAt: string;
  priority?: string;
}

const STATUS_COLORS: Record<string, string> = {
  in_progress: "bg-yellow-100 text-yellow-800",
  escalated: "bg-red-100 text-red-800",
  resolved: "bg-green-100 text-green-800",
};

export default function IncidentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/incidents")
      .then((r) => r.json())
      .then((data) => setIncidents(data))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="incidents-loading">
        <p className="text-gray-500">Loading incidents...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="incidents-page">
      <Navbar username={session?.user?.name} />
      <main className="pt-20 max-w-4xl mx-auto px-4 pb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6" data-testid="incidents-heading">
          My Incidents
        </h1>

        {incidents.length === 0 ? (
          <div className="text-center py-16 text-gray-400" data-testid="incidents-empty">
            <p>No incidents yet. Go to the support page to start one.</p>
            <Link
              href="/"
              className="mt-4 inline-block text-blue-600 hover:underline"
              data-testid="incidents-go-home-link"
            >
              Go to Support
            </Link>
          </div>
        ) : (
          <div className="space-y-3" data-testid="incidents-list">
            {incidents.map((inc) => (
              <Link
                key={inc._id}
                href={`/incidents/${inc._id}`}
                data-testid={`incident-list-item-${inc._id}`}
                className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-gray-900 truncate"
                      data-testid="incident-list-description"
                    >
                      {inc.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1" data-testid="incident-list-date">
                      {new Date(inc.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      STATUS_COLORS[inc.status] || "bg-gray-100 text-gray-600"
                    }`}
                    data-testid="incident-list-status"
                  >
                    {inc.status.replace("_", " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
