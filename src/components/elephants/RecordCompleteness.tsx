interface RecordCompletenessProps {
  percent: number;
  filled: number;
  total: number;
}

export function RecordCompleteness({ percent, filled, total }: RecordCompletenessProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div>
          <p className="text-sm font-medium text-slate-900">Record completeness</p>
          <p className="text-xs text-slate-500">
            {filled} of {total} key fields populated
          </p>
        </div>
        <p className="text-2xl font-semibold tabular-nums text-forest">{percent}%</p>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-forest transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      {percent < 80 && (
        <p className="mt-2 text-xs text-slate-500">
          Help improve this record —{" "}
          <a href="#contribute" className="text-forest font-medium hover:underline">
            add a photo or suggest a correction
          </a>
          .
        </p>
      )}
    </div>
  );
}
