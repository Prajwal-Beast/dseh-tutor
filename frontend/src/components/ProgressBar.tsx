interface Props {
  value: number;  // 0..1
  colorClass?: string;
  label?: string;
  showPercent?: boolean;
}

export default function ProgressBar({
  value,
  colorClass = 'bg-blue-500',
  label,
  showPercent = true,
}: Props) {
  const pct = Math.round(value * 100);
  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          {label && <span>{label}</span>}
          {showPercent && <span className="font-medium">{pct}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
