import { useNavigate } from 'react-router-dom';
import { attemptRepository } from '../repositories/attemptRepository';
import SubjectBadge from '../components/SubjectBadge';
import ProgressBar from '../components/ProgressBar';
import { SUBJECT_BAR_COLORS, ALL_SUBJECTS } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const overall = attemptRepository.getOverallStats();
  const bySubject = attemptRepository.getStatsBySubject();
  const weakTopics = attemptRepository.getWeakSubtopics(3);

  const subjectMap = new Map(bySubject.map((s) => [s.subject, s]));

  function handleClear() {
    if (!confirm('Clear ALL attempt history? This cannot be undone.')) return;
    attemptRepository.clear();
    window.location.reload();
  }

  if (overall.total === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-5xl">📊</div>
        <h1>Dashboard</h1>
        <p className="text-gray-500">No attempts yet. Start practising to see your stats here.</p>
        <button className="btn-primary" onClick={() => navigate('/practice')}>
          Start Practice
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1>Dashboard</h1>
        <button className="text-xs text-gray-400 hover:text-red-500 transition-colors" onClick={handleClear}>
          Clear history
        </button>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Questions answered', value: overall.total },
          { label: 'Correct answers', value: overall.correct },
          { label: 'Overall accuracy', value: `${Math.round(overall.accuracy * 100)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center space-y-1">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Pass prediction */}
      {overall.total >= 20 && (
        <div className="card border-blue-100 bg-blue-50">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Exam Readiness Estimate</h3>
          <div className="space-y-1 text-sm text-blue-700">
            {ALL_SUBJECTS.map((s) => {
              const stat = subjectMap.get(s);
              if (!stat) return null;
              const predicted = Math.round(stat.accuracy * 10);
              return (
                <div key={s} className="flex justify-between">
                  <span>{s}</span>
                  <span className={`font-medium ${predicted >= 8 ? 'text-green-700' : 'text-red-600'}`}>
                    ~{predicted}/10
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-blue-600 mt-2">Based on current accuracy per subject (10 Qs each).</p>
        </div>
      )}

      {/* Per-subject accuracy */}
      <section className="card space-y-5">
        <h2>Accuracy by Subject</h2>
        {ALL_SUBJECTS.map((s) => {
          const stat = subjectMap.get(s);
          if (!stat) {
            return (
              <div key={s} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <SubjectBadge subject={s} />
                  <span className="text-gray-400 text-xs">No data</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full" />
              </div>
            );
          }
          return (
            <div key={s} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <SubjectBadge subject={s} />
                  <span className="text-gray-500 text-xs">{stat.total} attempts</span>
                </div>
                <span className="font-semibold">
                  {stat.correct}/{stat.total} ({Math.round(stat.accuracy * 100)}%)
                </span>
              </div>
              <ProgressBar value={stat.accuracy} colorClass={SUBJECT_BAR_COLORS[s]} showPercent={false} />
            </div>
          );
        })}
      </section>

      {/* Weak areas */}
      <section className="card space-y-4">
        <h2>Weak Areas</h2>
        {weakTopics.length === 0 ? (
          <p className="text-sm text-gray-500">
            Answer at least 3 questions per subtopic to see weak areas here.
          </p>
        ) : (
          <div className="space-y-3">
            {weakTopics.map((w) => (
              <div
                key={`${w.subject}-${w.subtopic}`}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SubjectBadge subject={w.subject} />
                    <span className="text-sm font-medium text-gray-800 truncate">{w.subtopic}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full">
                      <div
                        className={`h-full rounded-full ${w.accuracy < 0.5 ? 'bg-red-500' : 'bg-yellow-500'}`}
                        style={{ width: `${w.accuracy * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${w.accuracy < 0.5 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {Math.round(w.accuracy * 100)}% ({w.total} attempts)
                    </span>
                  </div>
                </div>
                <button
                  className="btn-secondary text-xs shrink-0"
                  onClick={() =>
                    navigate('/practice', { state: { mode: 'weak' } })
                  }
                >
                  Practice →
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <button className="btn-primary" onClick={() => navigate('/practice', { state: { mode: 'exam' } })}>
          Full Exam Simulation
        </button>
        <button className="btn-secondary" onClick={() => navigate('/practice', { state: { mode: 'weak' } })}>
          Practice Weak Areas
        </button>
        <button className="btn-secondary" onClick={() => navigate('/chat')}>
          Ask Tutor
        </button>
      </div>
    </div>
  );
}
