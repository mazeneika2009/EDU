import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'knowledge_garden',
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 200,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

let memoryDb = null;

function parseRow(row, jsonFields) {
  const r = { ...row };
  for (const f of jsonFields) {
    if (typeof r[f] === 'string') { try { r[f] = JSON.parse(r[f]); } catch { } }
  }
  return r;
}

function pluck(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return val; } }
  return val;
}

async function loadAll() {
  const db = {};
  const start = Date.now();

  const [
    [users],
    [emails],
    [gardens],
    [seedRows],
    [payments],
    [growth],
    [qRows],
    [replies],
    [otp],
    [qq],
    [qa],
  ] = await Promise.all([
    pool.query('SELECT * FROM users'),
    pool.query('SELECT * FROM emails'),
    pool.query('SELECT * FROM gardens'),
    pool.query('SELECT s.*, GROUP_CONCAT(st.tag) AS tags FROM seeds s LEFT JOIN seed_tags st ON st.seedId = s.id GROUP BY s.id'),
    pool.query('SELECT * FROM payments'),
    pool.query('SELECT * FROM student_growth'),
    pool.query('SELECT * FROM queries'),
    pool.query('SELECT * FROM query_replies'),
    pool.query('SELECT * FROM otp_verifications'),
    pool.query('SELECT * FROM quiz_questions'),
    pool.query('SELECT * FROM quiz_answers'),
  ]);

  db.users = users.map(u => parseRow(u, ['paidGardens']));
  db.emails = emails.map(e => parseRow(e, ['isRead', 'isGrowthReport', 'isWelcome']));
  db.gardens = gardens;
  db.seeds = seedRows.map(s => ({ ...s, tags: s.tags ? s.tags.split(',') : [] }));
  db.payments = payments;
  db.student_growth = growth;

  const replyMap = new Map();
  for (const r of replies) {
    if (!replyMap.has(r.queryId)) replyMap.set(r.queryId, []);
    replyMap.get(r.queryId).push({ author: r.author, text: r.text, timestamp: r.timestamp });
  }
  db.queries = qRows.map(q => ({
    ...q,
    replies: replyMap.get(q.id) || [],
  }));

  db.otp_verifications = otp.map(o => parseRow(o, ['isUsed']));
  db.quiz_questions = qq.map(q => ({
    ...q,
    optionsEn: pluck(q.optionsEn),
    optionsAr: pluck(q.optionsAr),
    optionsTr: pluck(q.optionsTr),
  }));
  db.quiz_answers = qa;

  console.log(`[DB] Cache loaded in ${Date.now() - start}ms: ${db.users.length} users, ${db.gardens.length} gardens, ${db.seeds.length} seeds`);
  return db;
}

function emptyDb() {
  return {
    users: [], emails: [], gardens: [], seeds: [], payments: [],
    student_growth: [], queries: [], otp_verifications: [],
    quiz_questions: [], quiz_answers: [], notebooks: {},
  };
}

export async function initializeDB() {
  console.log('[DB] Loading all data from MySQL...');
  try {
    const fromMySql = await loadAll();
    if (!loadFromCache()) {
      memoryDb = fromMySql;
    } else {
      // Merge: MySQL is source of truth for known tables, cache supplements extras
      for (const key of ['users', 'emails', 'gardens', 'seeds', 'payments',
        'student_growth', 'queries', 'otp_verifications',
        'quiz_questions', 'quiz_answers']) {
        if (fromMySql[key]) memoryDb[key] = fromMySql[key];
      }
    }
    console.log('[DB] Loaded', memoryDb.users.length, 'users,', memoryDb.gardens.length, 'gardens,',
      memoryDb.seeds.length, 'seeds,', memoryDb.quiz_questions.length, 'questions,',
      memoryDb.payments.length, 'payments');
  } catch (err) {
    console.error('[DB] Failed to load from MySQL, using empty store:', err);
    memoryDb = emptyDb();
  }
}

const DB_DEFAULTS = emptyDb();

export function readDB() {
  if (!memoryDb) memoryDb = emptyDb();
  for (const k of Object.keys(DB_DEFAULTS)) {
    if (!(k in memoryDb)) memoryDb[k] = DB_DEFAULTS[k];
  }
  return memoryDb;
}

const DB_CACHE_PATH = path.join(__dirname, '..', 'data', 'db.json');

export function writeDB(_db) {
  if (!_db) return;
  try {
    const dir = path.dirname(DB_CACHE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_CACHE_PATH, JSON.stringify(_db, null, 2), 'utf8');
    memoryDb = _db;
  } catch (err) {
    console.error('[DB] Failed to write cache:', err);
  }
}

export function loadFromCache() {
  try {
    if (fs.existsSync(DB_CACHE_PATH)) {
      const raw = fs.readFileSync(DB_CACHE_PATH, 'utf8');
      const cached = JSON.parse(raw);
      if (cached && typeof cached === 'object') {
        memoryDb = cached;
        console.log('[DB] Restored from JSON cache');
        return true;
      }
    }
  } catch (err) {
    console.warn('[DB] Cache load failed:', err);
  }
  return false;
}

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function getUserById(id) {
  const rows = await query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function createUser(user) {
  await pool.execute(
    `INSERT INTO users (id, email, phone, passwordHash, isVerified, verificationCode, createdAt, current_session_id, paidGardens)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE email=VALUES(email), phone=VALUES(phone), passwordHash=VALUES(passwordHash),
       isVerified=VALUES(isVerified), verificationCode=VALUES(verificationCode), current_session_id=VALUES(current_session_id),
       paidGardens=VALUES(paidGardens)`,
    [user.id, user.email, user.phone, user.passwordHash, user.isVerified ? 1 : 0,
     user.verificationCode || '', user.createdAt, user.current_session_id ?? null,
     JSON.stringify(user.paidGardens || [])]
  );
}

export async function updateUserSession(userId, sessionId) {
  await pool.execute('UPDATE users SET current_session_id = ? WHERE id = ?', [sessionId, userId]);
}

export async function setPaymentStatus(paymentId, status) {
  await pool.execute('UPDATE payments SET status = ? WHERE id = ?', [status, paymentId]);
}
