import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../api/backendApi';
import { syllabusRepository } from '../repositories/syllabusRepository';
import type { ChatMessage, Subject, SyllabusTopic } from '../types';
import { ALL_SUBJECTS } from '../types';

const STARTERS = [
  'Can you explain the concept of price elasticity of demand?',
  'What is the Central Limit Theorem and why does it matter?',
  'Explain the difference between a matrix and a vector.',
  'What is Big-O notation and how is it used?',
  'Give me a practice question on Bayes\' theorem.',
  'What topics should I focus on most for the DSEH test?',
];

export default function TutorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getContextTopics(): SyllabusTopic[] {
    if (selectedSubject === 'All') return syllabusRepository.getAll().slice(0, 8);
    return syllabusRepository.getBySubject(selectedSubject).slice(0, 6);
  }

  async function send(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const history: ChatMessage[] = messages.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp }));
      const reply = await sendChatMessage({
        message: text.trim(),
        history,
        syllabusTopics: getContextTopics(),
      });

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1>Tutor Chat</h1>
          <p className="text-sm text-gray-500">Ask concepts, request explanations, or generate a practice question.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Context:</span>
          <select
            className="select w-auto text-xs"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as Subject | 'All')}
          >
            <option value="All">All subjects</option>
            {ALL_SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="space-y-4 py-4">
            <div className="text-center space-y-2">
              <div className="text-4xl">🤖</div>
              <h2 className="text-base text-gray-700">Hi! I'm your DSEH study tutor.</h2>
              <p className="text-sm text-gray-500">
                I'll help you understand concepts and practice questions for Economics, Statistics,
                Mathematics, and Computer Science. I'll ask you to try first before giving full answers!
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Starter questions</p>
              <div className="flex flex-wrap gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:border-blue-400 hover:text-blue-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-sm">🤖</div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
              <span className="inline-flex gap-1 items-center text-gray-400 text-sm">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          className="input flex-1"
          placeholder="Ask a question or request a practice problem…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="btn-primary px-5"
          disabled={!input.trim() || loading}
        >
          Send
        </button>
      </form>

      {messages.length > 0 && (
        <button
          className="mt-2 text-xs text-gray-400 hover:text-gray-600 self-start"
          onClick={() => setMessages([])}
        >
          Clear conversation
        </button>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${
        isUser ? 'bg-blue-600 text-white' : 'bg-blue-100'
      }`}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
        }`}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {message.content}
      </div>
    </div>
  );
}
