export default function handler(_req: any, res: any) {
  res.json({ status: 'ok', aiReady: Boolean(process.env.GEMINI_API_KEY) });
}
