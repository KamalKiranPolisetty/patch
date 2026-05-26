"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface FeedbackModalProps {
  incidentId: string;
  onClose: (resolved: boolean) => void;
}

export default function FeedbackModal({ incidentId, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionType, setResolutionType] = useState<"AI_AGENT" | "MANUAL">("AI_AGENT");
  const [resolvedBy, setResolvedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState(false);

  async function handleSubmit() {
    if (!rating) {
      setRatingError(true);
      return;
    }
    setRatingError(false);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "resolved",
          isResolved: true,
          resolutionType,
          resolutionMethod: resolutionType === "AI_AGENT" ? "Patch Agent" : "Manual",
          resolvedBy: resolutionType === "AI_AGENT" ? "Patch Agent" : resolvedBy.trim() || "Unknown",
          resolutionNotes,
          feedbackRating: rating,
          feedbackText,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to submit feedback");
      } else {
        toast.success("Incident resolved. Thank you for your feedback!");
        onClose(true);
      }
    } catch {
      toast.error("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      data-testid="feedback-modal-overlay"
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg"
        data-testid="feedback-modal"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-1" data-testid="feedback-modal-heading">
          Resolve Incident
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Please provide feedback before we close this incident.
        </p>

        {/* Resolution type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How was this resolved? *
          </label>
          <div className="flex gap-3" data-testid="resolution-type-group">
            <button
              data-testid="resolution-type-ai"
              onClick={() => setResolutionType("AI_AGENT")}
              className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
                resolutionType === "AI_AGENT"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 text-gray-600 hover:border-blue-400"
              }`}
            >
              Patch Agent (AI)
            </button>
            <button
              data-testid="resolution-type-manual"
              onClick={() => setResolutionType("MANUAL")}
              className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
                resolutionType === "MANUAL"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 text-gray-600 hover:border-blue-400"
              }`}
            >
              Manual (Human)
            </button>
          </div>
        </div>

        {/* Resolved by (only for manual) */}
        {resolutionType === "MANUAL" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="resolved-by">
              Resolved by (name or role)
            </label>
            <input
              id="resolved-by"
              data-testid="feedback-resolved-by"
              type="text"
              value={resolvedBy}
              onChange={(e) => setResolvedBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. John Smith or IT Admin"
            />
          </div>
        )}

        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How satisfied are you with the resolution? *
          </label>
          <div className="flex gap-2" data-testid="feedback-rating-group">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                data-testid={`feedback-rating-${n}`}
                onClick={() => { setRating(n); setRatingError(false); }}
                className={`w-10 h-10 rounded-full border-2 text-sm font-bold transition-colors ${
                  rating === n
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 text-gray-600 hover:border-blue-400"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {ratingError && (
            <p className="text-red-500 text-xs mt-1" data-testid="feedback-rating-error">
              Please select a rating
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="resolution-notes">
            Resolution Notes
          </label>
          <textarea
            id="resolution-notes"
            data-testid="feedback-resolution-notes"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How was the issue resolved?"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="feedback-text">
            Additional Comments
          </label>
          <textarea
            id="feedback-text"
            data-testid="feedback-text-input"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any other comments..."
          />
        </div>

        <div className="flex gap-3">
          <button
            data-testid="feedback-cancel-btn"
            onClick={() => onClose(false)}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            data-testid="feedback-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting..." : "Submit & Resolve"}
          </button>
        </div>
      </div>
    </div>
  );
}
