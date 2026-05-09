import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateQuestions, generateExamQuestions } from '../api/backendApi';
import { syllabusRepository } from '../repositories/syllabusRepository';
import { questionRepository } from '../repositories/questionRepository';
import { attemptRepository } from '../repositories/attemptRepository';
import SubjectBadge from '../components/SubjectBadge';
import Timer from '../components/Timer';
import type { Question, Subject, Difficulty, QuestionAttempt } from '../types';
import { ALL_SUBJECTS, SUBJECT_COLORS } from '../types';

type Mode = 'exam' | 'topic' | 'weak';
type Phase = 'select' | 'config' | 'generating' | 'quiz' | 'results';

interface Config {
  subject: Subject;
  subtopic: string;
  numQuestions: number;
  difficulty: Difficulty;
}

interface LiveAttempt {
  questionIndex: number;
  chosenIndex: number;
  correct: boolean;
}

const DEFAULT_CONFIG: Config = {
  subject: 'Economics',
  subtopic: '',
  numQuestions: 10,
  difficulty: 'Medium',
};

export default function Practice() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationMode = (location.state as { mode?: Mode } | null)?.mode;

  const [phase, setPhase] = useState<Phase>('select');
  const [mode, setMode] = useState<Mode>(locationMode ?? 'topic');
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [liveAttempts, setLiveAttempts] = useState<LiveAttempt[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examExpired, setExamExpired] = useState(false);

  // Jump straight to config/exam if navigated with state
  useEffect(() => {
    if (locationMode === 'exam') {
      setMode('exam');
      setPhase('config');
    } else if (locationMode === 'topic') {
      setMode('topic');
      setPhase('config');
    }
  }, [locationMode]);

  const startGenerate = useCallback(async () => {
    setPhase('generating');
    setError(null);
    try {
      let qs: Question[] = [];
      if (mode === 'exam') {
        const topics = syllabusRepository.getAll();
        qs = await generateExamQuestions(topics);
      } else {
        const topics = syllabusRepository.getBySubject(config.subject);
        const content = topics.map((t) => t.content).join('\n\n');
        qs = await generateQuestions({
          subject: config.subject,
          subtopic: config.subtopic || undefined,
          difficulty: config.difficulty,
          numQuestions: config.numQuestions,
          syllabusContent: content || undefined,
        });
      }

      if (qs.length === 0) throw new Error('No questions returned.');

      questionRepository.saveMany(qs);
      setQuestions(qs);
      setCurrentIdx(0);
      setLiveAttempts([]);
      setSelectedOption(null);
      setShowExplanation(false);
      setExamExpired(false);
      setPhase('quiz');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
      setPhase('config');
    }
  }, [mode, config]);

  function handleAnswer(optionIdx: number) {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    setShowExplanation(true);
  }

  function handleNext() {
    if (selectedOption === null) return;

    const q = questions[currentIdx];
    setLiveAttempts((prev) => [
      ...prev,
      { questionIndex: currentIdx, chosenIndex: selectedOption, correct: selectedOption === q.correctIndex },
    ]);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      finishQuiz([
        ...liveAttempts,
        { questionIndex: currentIdx, chosenIndex: selectedOption, correct: selectedOption === q.correctIndex },
      ]);
    }
  }

  function finishQuiz(attempts: LiveAttempt[]) {
    const sessionId = crypto.randomUUID();
    const saved: QuestionAttempt[] = attempts.map((a) => ({
      id: crypto.randomUUID(),
      questionId: questions[a.questionIndex].id,
      subject: questions[a.questionIndex].subject,
      subtopic: questions[a.questionIndex].subtopic,
      chosenIndex: a.chosenIndex,
      correct: a.correct,
      timestamp: new Date().toISOString(),
      sessionId,
    }));
    attemptRepository.saveMany(saved);
    setLiveAttempts(attempts);
    setPhase('results');
  }

  function handleTimerExpire() {
    setExamExpired(true);
    // Auto-submit remaining unanswered as wrong
    const remaining: LiveAttempt[] = questions
      .map((_, i) => i)
      .filter((i) => !liveAttempts.find((a) => a.questionIndex === i))
      .map((i) => ({ questionIndex: i, chosenIndex: -1, correct: false }));
    finishQuiz([...liveAttempts, ...remaining]);
  }

  // ── Render phases ─────────────────────────────────────────────────────────

  if (phase === 'select') return <ModeSelect onSelect={(m) => { setMode(m); setPhase('config'); }} />;

  if (phase === 'config') {
    return (
      <ConfigScreen
        mode={mode}
        config={config}
        onChange={setConfig}
        onStart={startGenerate}
        onBack={() => setPhase('select')}
        error={error}
      />
    );
  }

  if (phase === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin text-4xl">⚙️</div>
        <p className="text-gray-600 font-medium">
          {mode === 'exam' ? 'Generating 40 exam questions (4 API calls)…' : 'Generating questions…'}
        </p>
        <p className="text-sm text-gray-400">This may take 15–30 seconds.</p>
      </div>
    );
  }

  if (phase === 'quiz') {
    const q = questions[currentIdx];
    const isExam = mode === 'exam';

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <SubjectBadge subject={q.subject} />
            {q.subtopic && <span className="text-xs text-gray-500">{q.subtopic}</span>}
            <span className={`badge text-xs ${
              q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
              q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>{q.difficulty}</span>
          </div>
          <div className="flex items-center gap-3">
            {isExam && !examExpired && (
              <Timer totalSeconds={3600} onExpire={handleTimerExpire} />
            )}
            <span className="text-sm text-gray-500">
              {currentIdx + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="card space-y-4">
          <p className="text-base font-medium text-gray-900 leading-relaxed">{q.text}</p>

          <div className="space-y-2">
            {q.options.map((opt, i) => {
              let style = 'border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer';
              if (selectedOption !== null) {
                if (i === q.correctIndex) style = 'border-2 border-green-500 bg-green-50';
                else if (i === selectedOption && i !== q.correctIndex)
                  style = 'border-2 border-red-400 bg-red-50';
                else style = 'border border-gray-200 bg-white opacity-60';
              }

              return (
                <button
                  key={i}
                  className={`w-full text-left rounded-lg px-4 py-3 text-sm transition-all ${style}`}
                  onClick={() => handleAnswer(i)}
                  disabled={selectedOption !== null}
                >
                  <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`rounded-lg p-4 text-sm border ${
            selectedOption === q.correctIndex
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="font-semibold mb-1">
              {selectedOption === q.correctIndex ? '✅ Correct!' : '❌ Incorrect'}
            </p>
            <p className="leading-relaxed text-gray-700">{q.explanation}</p>
          </div>
        )}

        <button
          className="btn-primary w-full"
          onClick={handleNext}
          disabled={selectedOption === null}
        >
          {currentIdx < questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
        </button>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <ResultsScreen
        questions={questions}
        attempts={liveAttempts}
        mode={mode}
        examExpired={examExpired}
        onRetry={() => setPhase('config')}
        onHome={() => navigate('/')}
        onDashboard={() => navigate('/dashboard')}
      />
    );
  }

  return null;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ModeSelect({ onSelect }: { onSelect: (m: Mode) => void }) {
  const modes: Array<{ id: Mode; title: string; icon: string; desc: string }> = [
    { id: 'exam', title: 'Full Exam Simulation', icon: '🎯', desc: '40 questions · 60 min · full pass/fail report' },
    { id: 'topic', title: 'Topic Practice', icon: '📖', desc: 'Choose subject, difficulty, and question count' },
    { id: 'weak', title: 'Weak-Area Practice', icon: '🔍', desc: 'Auto-focus on your lowest-accuracy topics' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-center">Choose Practice Mode</h1>
      <div className="space-y-3">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className="w-full card text-left hover:border-blue-300 hover:shadow-md transition-all group flex items-center gap-4"
          >
            <span className="text-3xl">{m.icon}</span>
            <div>
              <h3 className="group-hover:text-blue-700">{m.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{m.desc}</p>
            </div>
            <span className="ml-auto text-gray-400 group-hover:text-blue-500">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ConfigScreen({
  mode,
  config,
  onChange,
  onStart,
  onBack,
  error,
}: {
  mode: Mode;
  config: Config;
  onChange: (c: Config) => void;
  onStart: () => void;
  onBack: () => void;
  error: string | null;
}) {
  const subtopics = syllabusRepository
    .getBySubject(config.subject)
    .map((t) => t.subtopic)
    .filter(Boolean) as string[];

  if (mode === 'exam') {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
        <div className="card space-y-4">
          <h2>Full Exam Simulation</h2>
          <p className="text-sm text-gray-600">
            40 questions will be generated (10 per subject) at medium difficulty.
            You'll have 60 minutes. Syllabus topics you've saved will be used to improve question quality.
          </p>
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-sm text-blue-700">
            <strong>Tip:</strong> Add syllabus content first on the Syllabus page for more accurate questions.
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <button className="btn-primary w-full" onClick={onStart}>
            Generate &amp; Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'weak') {
    const weakTopics = attemptRepository.getWeakSubtopics(3);
    return (
      <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
        <div className="card space-y-4">
          <h2>Weak-Area Practice</h2>
          {weakTopics.length === 0 ? (
            <p className="text-sm text-gray-500">
              Not enough attempt data yet. Answer at least 3 questions per topic, then come back here.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600">Topics detected with lowest accuracy:</p>
              <div className="space-y-2">
                {weakTopics.slice(0, 5).map((w) => (
                  <div key={`${w.subject}-${w.subtopic}`} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <SubjectBadge subject={w.subject} />
                      <span>{w.subtopic}</span>
                    </span>
                    <span className={`font-semibold ${w.accuracy < 0.5 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {Math.round(w.accuracy * 100)}%
                    </span>
                  </div>
                ))}
              </div>
              <button
                className="btn-primary w-full"
                onClick={() => {
                  const worst = weakTopics[0];
                  onChange({ ...config, subject: worst.subject, subtopic: worst.subtopic, numQuestions: 10 });
                  onStart();
                }}
              >
                Practice Weakest Topic
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Topic practice config
  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
      <div className="card space-y-4">
        <h2>Topic Practice</h2>

        <div>
          <label className="label">Subject</label>
          <div className="grid grid-cols-2 gap-2">
            {ALL_SUBJECTS.map((s) => {
              const c = SUBJECT_COLORS[s];
              return (
                <button
                  key={s}
                  onClick={() => onChange({ ...config, subject: s, subtopic: '' })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    config.subject === s
                      ? `${c.bg} ${c.text} border-current ring-2 ${c.ring}`
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {subtopics.length > 0 && (
          <div>
            <label className="label">Subtopic (optional)</label>
            <select
              className="select"
              value={config.subtopic}
              onChange={(e) => onChange({ ...config, subtopic: e.target.value })}
            >
              <option value="">All subtopics</option>
              {subtopics.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="label">Difficulty</label>
          <div className="flex gap-2">
            {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => onChange({ ...config, difficulty: d })}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${
                  config.difficulty === d
                    ? d === 'Easy' ? 'bg-green-100 text-green-800 border-green-400'
                      : d === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-400'
                      : 'bg-red-100 text-red-800 border-red-400'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Number of Questions</label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => onChange({ ...config, numQuestions: n })}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${
                  config.numQuestions === n
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <button className="btn-primary w-full" onClick={onStart}>
          Generate {config.numQuestions} Questions →
        </button>
      </div>
    </div>
  );
}

function ResultsScreen({
  questions,
  attempts,
  mode,
  examExpired,
  onRetry,
  onHome,
  onDashboard,
}: {
  questions: Question[];
  attempts: LiveAttempt[];
  mode: Mode;
  examExpired: boolean;
  onRetry: () => void;
  onHome: () => void;
  onDashboard: () => void;
}) {
  const total = questions.length;
  const correct = attempts.filter((a) => a.correct).length;
  const accuracy = total > 0 ? correct / total : 0;

  // Per-subject stats
  const subjectStats = ALL_SUBJECTS.map((s) => {
    const subQs = questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => q.subject === s);
    const subCorrect = subQs.filter(({ i }) => attempts.find((a) => a.questionIndex === i)?.correct).length;
    return { subject: s, total: subQs.length, correct: subCorrect };
  }).filter((s) => s.total > 0);

  // Pass/fail for exam mode
  const ecoStatsCorrect = subjectStats
    .filter((s) => s.subject === 'Economics' || s.subject === 'Statistics')
    .reduce((sum, s) => sum + s.correct, 0);
  const mathCSCorrect = subjectStats
    .filter((s) => s.subject === 'Mathematics' || s.subject === 'Computer Science')
    .reduce((sum, s) => sum + s.correct, 0);

  const passOverall = correct >= 16;
  const passEcoStats = ecoStatsCorrect >= 8;
  const passMathCS = mathCSCorrect >= 8;
  const passed = passOverall && passEcoStats && passMathCS;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-center">
        {mode === 'exam' ? (examExpired ? '⏰ Time\'s Up!' : '📋 Exam Complete') : '✅ Practice Complete'}
      </h1>

      {/* Score card */}
      <div className={`card text-center space-y-2 ${mode === 'exam' ? (passed ? 'border-green-300 bg-green-50' : 'border-red-200 bg-red-50') : ''}`}>
        <div className="text-5xl font-bold text-gray-900">{correct}<span className="text-2xl text-gray-400">/{total}</span></div>
        <div className="text-lg text-gray-600">{Math.round(accuracy * 100)}% correct</div>

        {mode === 'exam' && (
          <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-semibold text-sm ${
            passed ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'
          }`}>
            {passed ? '🎉 PASS' : '❌ FAIL'}
          </div>
        )}
      </div>

      {/* Pass conditions for exam */}
      {mode === 'exam' && (
        <div className="card space-y-3">
          <h3>Pass Conditions</h3>
          {[
            { label: `Overall ≥ 16 correct`, value: correct, pass: passOverall },
            { label: `Economics + Statistics ≥ 8 (you got ${ecoStatsCorrect})`, value: ecoStatsCorrect, pass: passEcoStats },
            { label: `Mathematics + CS ≥ 8 (you got ${mathCSCorrect})`, value: mathCSCorrect, pass: passMathCS },
          ].map(({ label, pass }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <span className={pass ? 'text-green-600' : 'text-red-500'}>{pass ? '✅' : '❌'}</span>
              <span className={pass ? 'text-green-800' : 'text-red-700'}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Per-subject breakdown */}
      <div className="card space-y-3">
        <h3>Subject Breakdown</h3>
        {subjectStats.map((s) => {
          const c = SUBJECT_COLORS[s.subject];
          const pct = s.total > 0 ? s.correct / s.total : 0;
          return (
            <div key={s.subject} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className={`badge ${c.bg} ${c.text}`}>{s.subject}</span>
                <span className="font-medium">{s.correct}/{s.total}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div
                  className={`h-full rounded-full ${pct >= 0.8 ? 'bg-green-500' : pct >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button className="btn-primary flex-1" onClick={onRetry}>Try Again</button>
        <button className="btn-secondary flex-1" onClick={onDashboard}>View Dashboard</button>
        <button className="btn-secondary flex-1" onClick={onHome}>Home</button>
      </div>
    </div>
  );
}
