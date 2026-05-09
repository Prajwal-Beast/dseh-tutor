import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { questionsRouter } from './routes/questions.js';
import { chatRouter } from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({ status: 'ok', aiReady: hasKey });
});

app.use('/api/questions', questionsRouter);
app.use('/api/chat', chatRouter);

app.listen(PORT, () => {
  console.log(`✅ DSEH Tutor API listening on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY not set – get a free key at https://aistudio.google.com/apikey and add it to backend/.env');
  }
});
