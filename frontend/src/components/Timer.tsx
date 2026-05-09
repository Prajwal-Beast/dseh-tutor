import { useEffect, useState } from 'react';

interface Props {
  totalSeconds: number;
  onExpire?: () => void;
}

export default function Timer({ totalSeconds, onExpire }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire?.();
      return;
    }
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft, onExpire]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = secondsLeft / totalSeconds;
  const urgent = secondsLeft <= 300; // last 5 min

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-semibold ${
      urgent
        ? 'bg-red-50 border-red-200 text-red-700'
        : 'bg-gray-50 border-gray-200 text-gray-700'
    }`}>
      <span>{urgent ? '⏰' : '⏱'}</span>
      <span>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${urgent ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}
