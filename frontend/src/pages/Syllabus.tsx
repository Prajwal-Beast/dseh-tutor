import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { syllabusRepository } from '../repositories/syllabusRepository';
import SubjectBadge from '../components/SubjectBadge';
import type { Subject, SyllabusTopic } from '../types';
import { ALL_SUBJECTS } from '../types';

const BLANK: Omit<SyllabusTopic, 'id' | 'createdAt'> = {
  subject: 'Economics',
  title: '',
  subtopic: '',
  sourceName: '',
  content: '',
};

export default function Syllabus() {
  const [topics, setTopics] = useState<SyllabusTopic[]>(() => syllabusRepository.getAll());
  const [filter, setFilter] = useState<Subject | 'All'>('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'All' ? topics : topics.filter((t) => t.subject === filter);

  function refresh() {
    setTopics(syllabusRepository.getAll());
  }

  function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return;

    const topic: SyllabusTopic = {
      id: editId ?? uuidv4(),
      subject: form.subject,
      title: form.title.trim(),
      subtopic: form.subtopic?.trim() || undefined,
      sourceName: form.sourceName?.trim() || undefined,
      content: form.content.trim(),
      createdAt: new Date().toISOString(),
    };

    syllabusRepository.saveTopic(topic);
    refresh();
    setShowForm(false);
    setEditId(null);
    setForm(BLANK);
  }

  function handleEdit(t: SyllabusTopic) {
    setForm({
      subject: t.subject,
      title: t.title,
      subtopic: t.subtopic ?? '',
      sourceName: t.sourceName ?? '',
      content: t.content,
    });
    setEditId(t.id);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this syllabus topic?')) return;
    syllabusRepository.deleteTopic(id);
    refresh();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1>Syllabus &amp; Notes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Paste content from your bibliography. The AI uses this to generate better questions.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setForm(BLANK); setEditId(null); setShowForm(true); }}
        >
          + Add Topic
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['All', ...ALL_SUBJECTS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {s} {s !== 'All' && `(${topics.filter((t) => t.subject === s).length})`}
          </button>
        ))}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="card border-blue-200 bg-blue-50 space-y-4">
          <h2 className="text-base">{editId ? 'Edit' : 'New'} Syllabus Topic</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Subject *</label>
              <select
                className="select"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value as Subject }))}
              >
                {ALL_SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Title *</label>
              <input
                className="input"
                placeholder="e.g. Consumer Theory"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Subtopic (optional)</label>
              <input
                className="input"
                placeholder="e.g. Utility Maximisation"
                value={form.subtopic}
                onChange={(e) => setForm((f) => ({ ...f, subtopic: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Source / Book (optional)</label>
              <input
                className="input"
                placeholder="e.g. Varian – Intermediate Microeconomics"
                value={form.sourceName}
                onChange={(e) => setForm((f) => ({ ...f, sourceName: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="label">Content / Notes *</label>
            <textarea
              className="textarea"
              style={{ minHeight: 180 }}
              placeholder="Paste syllabus text, key definitions, formulas, book excerpts, or your own notes here…"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </div>

          <div className="flex gap-2">
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={!form.title.trim() || !form.content.trim()}
            >
              Save Topic
            </button>
            <button
              className="btn-secondary"
              onClick={() => { setShowForm(false); setEditId(null); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Topic list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📚</div>
          <p className="font-medium">No topics yet</p>
          <p className="text-sm mt-1">Add syllabus content to get more accurate practice questions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="card space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SubjectBadge subject={t.subject} />
                    {t.subtopic && (
                      <span className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5">{t.subtopic}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{t.title}</h3>
                  {t.sourceName && (
                    <p className="text-xs text-gray-500 italic">{t.sourceName}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    className="text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50"
                    onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                  >
                    {expandedId === t.id ? 'Hide' : 'View'}
                  </button>
                  <button
                    className="text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50"
                    onClick={() => handleEdit(t)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
                    onClick={() => handleDelete(t.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expandedId === t.id && (
                <pre className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap border border-gray-100 max-h-64 overflow-y-auto">
                  {t.content}
                </pre>
              )}
              {expandedId !== t.id && (
                <p className="text-xs text-gray-500 truncate">{t.content.slice(0, 120)}…</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
