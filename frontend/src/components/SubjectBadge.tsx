import type { Subject } from '../types';
import { SUBJECT_COLORS } from '../types';

interface Props {
  subject: Subject;
  size?: 'sm' | 'md';
}

export default function SubjectBadge({ subject, size = 'sm' }: Props) {
  const c = SUBJECT_COLORS[subject];
  return (
    <span
      className={`badge ${c.bg} ${c.text} border ${c.border} ${
        size === 'md' ? 'text-sm px-3 py-1' : ''
      }`}
    >
      {subject}
    </span>
  );
}
