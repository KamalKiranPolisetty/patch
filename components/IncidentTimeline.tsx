interface IncidentTimelineProps {
  status: string;
}

const STEPS = [
  { key: "opened", label: "Opened" },
  { key: "in_progress", label: "In Progress" },
  { key: "escalated", label: "Escalated" },
  { key: "resolved", label: "Resolved" },
];

function getStepIndex(status: string) {
  const idx = STEPS.findIndex((s) => s.key === status);
  // treat unknown statuses as in_progress (index 1) for backwards compat
  return idx === -1 ? 1 : idx;
}

export default function IncidentTimeline({ status }: IncidentTimelineProps) {
  const currentIdx = getStepIndex(status);

  return (
    <div className="flex items-center gap-0" data-testid="incident-timeline">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={step.key} className="flex items-center" data-testid={`timeline-step-${step.key}`}>
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  isCompleted
                    ? "bg-blue-600 border-blue-600 text-white"
                    : isCurrent
                    ? "bg-white border-blue-600 text-blue-600"
                    : "bg-white border-gray-300 text-gray-300"
                }`}
                data-testid={`timeline-step-dot-${step.key}`}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>
              <span
                className={`text-xs mt-1 font-medium whitespace-nowrap ${
                  isCurrent ? "text-blue-600" : isCompleted ? "text-blue-400" : "text-gray-400"
                }`}
                data-testid={`timeline-step-label-${step.key}`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-10 mx-1 mb-5 ${isCompleted ? "bg-blue-600" : "bg-gray-200"}`}
                data-testid={`timeline-connector-${idx}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
