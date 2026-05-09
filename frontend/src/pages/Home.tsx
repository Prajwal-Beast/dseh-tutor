import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkHealth } from '../api/backendApi';
import { attemptRepository } from '../repositories/attemptRepository';
import SubjectBadge from '../components/SubjectBadge';
import type { Subject } from '../types';

const subjects: Array<{ name: Subject; icon: string; count: number }> = [
  { name: 'Economics', icon: '📈', count: 10 },
  { name: 'Statistics', icon: '📉', count: 10 },
  { name: 'Mathematics', icon: '🔢', count: 10 },
  { name: 'Computer Science', icon: '💻', count: 10 },
];

export default function Home() {
  const navigate = useNavigate();
  const [aiReady, setAiReady] = useState<boolean | null>(null);
  const stats = attemptRepository.getOverallStats();

  useEffect(() => {
    checkHealth()
      .then((h) => setAiReady(h.aiReady))
      .catch(() => setAiReady(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">
          DSEH Tutor
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base">
          Your personal study companion for the{' '}
          <span className="font-semibold text-blue-700">
            University of Milan — Data Science for Economics and Health
          </span>{' '}
          background knowledge test.
        </p>

        {/* AI status pill */}
        {aiReady !== null && (
          <div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${
            aiReady
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
          }`}>
            <span>{aiReady ? '●' : '○'}</span>
            {aiReady ? 'AI tutor ready' : 'AI offline – add GEMINI_API_KEY to backend/.env'}
          </div>
        )}
      </div>

      {/* Quick stats if user has data */}
      {stats.total > 0 && (
        <div className="card border-blue-100 bg-blue-50">
          <p className="text-sm text-blue-700">
            You've answered <strong>{stats.total}</strong> questions with{' '}
            <strong>{Math.round(stats.accuracy * 100)}%</strong> accuracy.{' '}
            <button
              onClick={() => navigate('/dashboard')}
              className="underline hover:no-underline"
            >
              View full dashboard →
            </button>
          </p>
        </div>
      )}

      {/* Test structure */}
      <section className="card space-y-4">
        <h2>Exam Structure</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {subjects.map(({ name, icon, count }) => (
            <div key={name} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center space-y-1">
              <div className="text-2xl">{icon}</div>
              <SubjectBadge subject={name} />
              <div className="text-sm font-semibold text-gray-800">{count} questions</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { label: 'Total questions', value: '40' },
            { label: 'Time limit', value: '60 min' },
            { label: 'To pass', value: '≥ 16 correct' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-lg font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 space-y-1">
          <p className="font-semibold">Pass conditions (ALL must be met):</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>At least <strong>16 correct</strong> out of 40 overall</li>
            <li>At least <strong>8 correct</strong> in Economics + Statistics combined</li>
            <li>At least <strong>8 correct</strong> in Mathematics + Computer Science combined</li>
          </ul>
        </div>
      </section>

      {/* Quick actions */}
      <section className="space-y-3">
        <h2>Get Started</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/practice', { state: { mode: 'exam' } })}
            className="card text-left hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="group-hover:text-blue-700">Full Exam Simulation</h3>
            <p className="text-sm text-gray-500 mt-1">40 questions, 60-minute timer, full pass/fail report</p>
          </button>

          <button
            onClick={() => navigate('/practice', { state: { mode: 'topic' } })}
            className="card text-left hover:border-green-300 hover:shadow-md transition-all group"
          >
            <div className="text-2xl mb-2">📖</div>
            <h3 className="group-hover:text-green-700">Practice by Topic</h3>
            <p className="text-sm text-gray-500 mt-1">Choose subject, difficulty, and number of questions</p>
          </button>

          <button
            onClick={() => navigate('/syllabus')}
            className="card text-left hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="group-hover:text-purple-700">Upload Syllabus</h3>
            <p className="text-sm text-gray-500 mt-1">Paste your notes or bibliography to improve question quality</p>
          </button>
        </div>
      </section>

      {/* Study tips */}
      <section className="card text-sm text-gray-600 space-y-2">
        <h2 className="text-base">Recommended Approach</h2>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>Go to <strong>Syllabus</strong> and paste content from your bibliography for each subject.</li>
          <li>Use <strong>Practice → Topic Practice</strong> to study each subject individually.</li>
          <li>Use <strong>Tutor Chat</strong> when you're stuck on a concept.</li>
          <li>Check <strong>Dashboard</strong> regularly to spot weak areas.</li>
          <li>Run a <strong>Full Exam Simulation</strong> near the test date.</li>
        </ol>
      </section>
    </div>
  );
}
