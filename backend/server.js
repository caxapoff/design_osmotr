const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Разрешённые домены. Добавь свой GitHub Pages домен в ALLOWED_ORIGINS.
// Пример: https://username.github.io
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',');

app.use(cors({
  origin: ALLOWED_ORIGINS.includes('*') ? '*' : (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  }
}));

// Лимит 10 МБ — аватары хранятся как base64
app.use(express.json({ limit: '10mb' }));

// ─── Хранилище данных ────────────────────────────────────────
const DATA_FILE = path.join(__dirname, 'data.json');

const EMPTY = {
  participants: [],
  sessions:     {},
  history:      [],
  bonuses:      {}
};

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return structuredClone(EMPTY);
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return structuredClone(EMPTY);
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data), 'utf8');
}

// ─── Маршруты ────────────────────────────────────────────────

// Получить все данные
app.get('/api/data', (_req, res) => {
  res.json(readData());
});

// Сохранить все данные целиком
app.post('/api/data', (req, res) => {
  const { participants, sessions, history, bonuses } = req.body;
  if (!Array.isArray(participants)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  writeData({ participants, sessions: sessions || {}, history: history || [], bonuses: bonuses || {} });
  res.json({ ok: true });
});

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ─── Запуск ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✓ Дизайн Осмотр backend запущен на порту ${PORT}`);
});
