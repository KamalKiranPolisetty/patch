"use client";

import { useRef } from "react";
import toast from "react-hot-toast";

interface DeviceTileProps {
  label: string;
  icon: string;
  incidentId: string | null;
  onSelect: (label: string) => void;
  onFileUploaded: (fileName: string) => void;
}

export default function DeviceTile({
  label,
  icon,
  incidentId,
  onSelect,
  onFileUploaded,
}: DeviceTileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleTileClick() {
    onSelect(label);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      e.target.value = "";
      return;
    }

    if (!incidentId) {
      toast.error("Please start a conversation first by clicking the tile");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("incidentId", incidentId);

    const toastId = toast.loading("Uploading document...");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Upload failed", { id: toastId });
      } else {
        toast.success("Document uploaded successfully", { id: toastId });
        onFileUploaded(file.name);
      }
    } catch {
      toast.error("Upload failed", { id: toastId });
    }
    e.target.value = "";
  }

  return (
    <div
      data-testid={`device-tile-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
    >
      <div
        className="p-6 flex flex-col items-center gap-3"
        onClick={handleTileClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleTileClick()}
      >
        <span className="text-4xl" data-testid={`device-tile-icon-${label.toLowerCase()}`}>
          {icon}
        </span>
        <span
          className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors"
          data-testid={`device-tile-label-${label.toLowerCase()}`}
        >
          {label}
        </span>
      </div>

      <div className="border-t border-gray-100 px-4 py-3">
        <button
          data-testid={`device-tile-upload-btn-${label.toLowerCase().replace(/\s+/g, "-")}`}
          onClick={() => fileInputRef.current?.click()}
          className="w-full text-xs text-gray-500 hover:text-blue-600 flex items-center justify-center gap-1 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload PDF
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
          data-testid={`device-tile-file-input-${label.toLowerCase().replace(/\s+/g, "-")}`}
          multiple
        />
      </div>
    </div>
  );
}
