/**
 * TINKL — Zero-dependency local development & beta testing server
 * 
 * Serves the static PWA with proper MIME types, security headers,
 * and provides secure beta tester authentication, data persistence,
 * and developer feedback review APIs.
 * 
 * Usage:
 *   npm run dev          — HTTP on port 3000 (SW works on localhost)
 *   npm run dev:https    — HTTPS on port 3443 (auto-generates self-signed cert)
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Configuration ──────────────────────────────────────────────────────
const HTTP_PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

// Ensure data directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });

// ── MIME types ─────────────────────────────────────────────────────────
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.toml': 'text/plain; charset=utf-8',
};

// ── Data Helpers ───────────────────────────────────────────────────────
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');

function readJsonFile(filePath, defaultVal = {}) {
  try {
    if (!fs.existsSync(filePath)) return defaultVal;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
    return defaultVal;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error writing ${filePath}:`, e.message);
  }
}

// ── Crypto / Auth Helpers ──────────────────────────────────────────────
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getBearerToken(req) {
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  return null;
}

function authenticateRequest(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  const sessions = readJsonFile(SESSIONS_FILE, {});
  const session = sessions[token];
  if (!session) return null;

  // Check 30-day expiration
  if (Date.now() - session.createdAt > 30 * 24 * 60 * 60 * 1000) {
    delete sessions[token];
    writeJsonFile(SESSIONS_FILE, sessions);
    return null;
  }

  const users = readJsonFile(USERS_FILE, []);
  const user = users.find(u => u.id === session.userId);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'beta_tester',
    token,
  };
}

// Rate limiting map for auth attempts (max 20 attempts per 5 mins per IP)
const authAttempts = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const record = authAttempts.get(ip) || { count: 0, resetAt: now + 5 * 60 * 1000 };
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + 5 * 60 * 1000;
    authAttempts.set(ip, record);
    return false;
  }
  record.count += 1;
  authAttempts.set(ip, record);
  return record.count > 20;
}

// ── JSON Body Parser ───────────────────────────────────────────────────
function parseJsonBody(req, maxBytes = 5 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    let bytes = 0;
    req.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(data));
}

// ── Request Handler ────────────────────────────────────────────────────
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);
  const ip = req.socket.remoteAddress || 'unknown';

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }

  // ── API ROUTES ───────────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Health check
      if (pathname === '/api/health') {
        sendJson(res, 200, { status: 'ok', server: 'TINKL Beta Server', timestamp: Date.now() });
        return;
      }

      // 2. Auth: Register
      if (pathname === '/api/auth/register' && req.method === 'POST') {
        if (isRateLimited(ip)) {
          sendJson(res, 429, { error: 'Too many registration requests. Please wait a few minutes.' });
          return;
        }

        const body = await parseJsonBody(req);
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');
        const name = String(body.name || '').trim() || email.split('@')[0] || 'Tester';

        if (!email || !email.includes('@') || email.length < 5) {
          sendJson(res, 400, { error: 'A valid email address is required.' });
          return;
        }
        if (!password || password.length < 6) {
          sendJson(res, 400, { error: 'Password must be at least 6 characters.' });
          return;
        }

        const users = readJsonFile(USERS_FILE, []);
        if (users.some(u => u.email === email)) {
          sendJson(res, 409, { error: 'An account with this email already exists.' });
          return;
        }

        const salt = generateSalt();
        const passwordHash = hashPassword(password, salt);
        const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        const newUser = {
          id: userId,
          email,
          name,
          salt,
          passwordHash,
          role: 'beta_tester',
          createdAt: Date.now(),
          lastLogin: Date.now(),
        };

        users.push(newUser);
        writeJsonFile(USERS_FILE, users);

        // Generate session
        const token = generateToken();
        const sessions = readJsonFile(SESSIONS_FILE, {});
        sessions[token] = { userId, createdAt: Date.now(), ip };
        writeJsonFile(SESSIONS_FILE, sessions);

        sendJson(res, 201, {
          success: true,
          token,
          user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
        });
        return;
      }

      // 3. Auth: Login
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        if (isRateLimited(ip)) {
          sendJson(res, 429, { error: 'Too many login attempts. Please wait a few minutes.' });
          return;
        }

        const body = await parseJsonBody(req);
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');

        if (!email || !password) {
          sendJson(res, 400, { error: 'Email and password are required.' });
          return;
        }

        const users = readJsonFile(USERS_FILE, []);
        const user = users.find(u => u.email === email);
        if (!user) {
          sendJson(res, 401, { error: 'Invalid email or password.' });
          return;
        }

        const calculatedHash = hashPassword(password, user.salt);
        const match = crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(user.passwordHash));
        if (!match) {
          sendJson(res, 401, { error: 'Invalid email or password.' });
          return;
        }

        user.lastLogin = Date.now();
        writeJsonFile(USERS_FILE, users);

        const token = generateToken();
        const sessions = readJsonFile(SESSIONS_FILE, {});
        sessions[token] = { userId: user.id, createdAt: Date.now(), ip };
        writeJsonFile(SESSIONS_FILE, sessions);

        sendJson(res, 200, {
          success: true,
          token,
          user: { id: user.id, email: user.email, name: user.name, role: user.role || 'beta_tester' },
        });
        return;
      }

      // 4. Auth: Session check
      if (pathname === '/api/auth/session' && req.method === 'GET') {
        const user = authenticateRequest(req);
        if (!user) {
          sendJson(res, 401, { valid: false, error: 'Unauthorized or expired session' });
          return;
        }
        sendJson(res, 200, { valid: true, user });
        return;
      }

      // 5. Auth: Logout
      if (pathname === '/api/auth/logout' && req.method === 'POST') {
        const token = getBearerToken(req);
        if (token) {
          const sessions = readJsonFile(SESSIONS_FILE, {});
          delete sessions[token];
          writeJsonFile(SESSIONS_FILE, sessions);
        }
        sendJson(res, 200, { success: true, message: 'Logged out successfully' });
        return;
      }

      // 6. User Data: Get Backup
      if (pathname === '/api/user/data' && req.method === 'GET') {
        const user = authenticateRequest(req);
        if (!user) {
          sendJson(res, 401, { error: 'Authentication required to access saved data.' });
          return;
        }

        const userBackupFile = path.join(BACKUPS_DIR, `${user.id}.json`);
        if (!fs.existsSync(userBackupFile)) {
          sendJson(res, 200, { success: true, data: null, message: 'No backup found on server.' });
          return;
        }

        const backupData = readJsonFile(userBackupFile, null);
        sendJson(res, 200, { success: true, data: backupData });
        return;
      }

      // 7. User Data: Save Backup (POST or PUT)
      if (pathname === '/api/user/data' && (req.method === 'POST' || req.method === 'PUT')) {
        const user = authenticateRequest(req);
        if (!user) {
          sendJson(res, 401, { error: 'Authentication required to save data.' });
          return;
        }

        const payload = await parseJsonBody(req);
        if (!payload || typeof payload !== 'object') {
          sendJson(res, 400, { error: 'Invalid backup payload.' });
          return;
        }

        const userBackupFile = path.join(BACKUPS_DIR, `${user.id}.json`);
        const backupRecord = {
          userId: user.id,
          userEmail: user.email,
          updatedAt: Date.now(),
          ...payload,
        };

        writeJsonFile(userBackupFile, backupRecord);
        sendJson(res, 200, {
          success: true,
          message: 'Data securely saved to your account.',
          updatedAt: backupRecord.updatedAt,
        });
        return;
      }

      // 8. Beta Feedback: Submit (POST)
      if (pathname === '/api/feedback' && req.method === 'POST') {
        const body = await parseJsonBody(req, 100 * 1024);
        const category = String(body.category || 'general').trim();
        const rating = Number(body.rating) || 5;
        const screen = String(body.screen || 'all').trim();
        const title = String(body.title || '').trim();
        const message = String(body.message || '').trim();

        if (!title && !message) {
          sendJson(res, 400, { error: 'Please provide feedback details or a title.' });
          return;
        }

        const user = authenticateRequest(req);
        const feedbackList = readJsonFile(FEEDBACK_FILE, []);

        const newFeedback = {
          id: `fb_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          category,
          rating,
          screen,
          title: title || (message.length > 40 ? message.slice(0, 40) + '...' : message),
          message,
          testerEmail: user ? user.email : (body.testerEmail || 'anonymous'),
          testerName: user ? user.name : (body.testerName || 'Beta Tester'),
          deviceInfo: body.deviceInfo || { userAgent: req.headers['user-agent'] || 'unknown' },
          timestamp: Date.now(),
          status: 'new', // 'new', 'reviewed', 'resolved'
        };

        feedbackList.unshift(newFeedback); // Newest first
        writeJsonFile(FEEDBACK_FILE, feedbackList);

        sendJson(res, 201, {
          success: true,
          id: newFeedback.id,
          message: 'Thank you! Your beta feedback has been logged.',
        });
        return;
      }

      // 9. Beta Feedback: Retrieve all (GET)
      if (pathname === '/api/feedback' && req.method === 'GET') {
        const feedbackList = readJsonFile(FEEDBACK_FILE, []);
        sendJson(res, 200, { success: true, count: feedbackList.length, feedback: feedbackList });
        return;
      }

      // 10. Beta Feedback: Export (CSV or JSON)
      if (pathname === '/api/feedback/export' && req.method === 'GET') {
        const format = url.searchParams.get('format') || 'csv';
        const feedbackList = readJsonFile(FEEDBACK_FILE, []);

        if (format === 'json') {
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': 'attachment; filename="tinkl_feedback.json"',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify(feedbackList, null, 2));
          return;
        }

        // CSV export
        const headers = ['ID', 'Date', 'Category', 'Rating', 'Screen', 'Title', 'Message', 'Tester Email', 'Status'];
        const csvRows = [headers.join(',')];

        feedbackList.forEach(fb => {
          const dateStr = new Date(fb.timestamp).toISOString();
          const clean = str => `"${String(str || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
          csvRows.push([
            clean(fb.id),
            clean(dateStr),
            clean(fb.category),
            fb.rating,
            clean(fb.screen),
            clean(fb.title),
            clean(fb.message),
            clean(fb.testerEmail),
            clean(fb.status),
          ].join(','));
        });

        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="tinkl_feedback_export.csv"',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(csvRows.join('\r\n'));
        return;
      }

      // 11. Beta Feedback: Delete / Status update
      if (pathname.startsWith('/api/feedback/') && req.method === 'DELETE') {
        const fbId = pathname.replace('/api/feedback/', '');
        let feedbackList = readJsonFile(FEEDBACK_FILE, []);
        const initialLen = feedbackList.length;
        feedbackList = feedbackList.filter(f => f.id !== fbId);
        writeJsonFile(FEEDBACK_FILE, feedbackList);

        sendJson(res, 200, {
          success: true,
          deleted: feedbackList.length < initialLen,
        });
        return;
      }

      // Unknown API route
      sendJson(res, 404, { error: 'API endpoint not found' });
      return;
    } catch (err) {
      console.error('API Error:', err);
      sendJson(res, 500, { error: err.message || 'Internal Server Error' });
      return;
    }
  }

  // ── STATIC FILE SERVING ──────────────────────────────────────────────
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.join(ROOT, pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Try to serve the file
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA fallback: serve index.html for navigation requests
      const acceptsHtml = (req.headers.accept || '').includes('text/html');
      if (acceptsHtml && !pathname.includes('.')) {
        serveFile(path.join(ROOT, 'index.html'), '.html', res, pathname);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    serveFile(filePath, ext, res, pathname);
  });
}

function serveFile(filePath, ext, res, pathname) {
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const headers = {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
  };

  // Service worker: must not be cached, needs proper scope header
  if (pathname === '/sw.js') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Service-Worker-Allowed'] = '/';
  }
  // HTML: no cache during development
  else if (ext === '.html') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  }
  // Manifest
  else if (ext === '.webmanifest') {
    headers['Cache-Control'] = 'no-cache';
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  });
  res.writeHead(200, headers);
  stream.pipe(res);
}

// ── Start Server ───────────────────────────────────────────────────────
function start() {
  const server = http.createServer(handleRequest);
  
  server.listen(HTTP_PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════════════╗');
    console.log('  ║                                                      ║');
    console.log('  ║   🐾  TINKL. — Beta Server & Local Dev Ready         ║');
    console.log('  ║                                                      ║');
    console.log(`  ║   🌐  http://localhost:${HTTP_PORT}                        ║`);
    console.log('  ║                                                      ║');
    console.log('  ║   🔐  Beta Tester Auth:    /api/auth/*               ║');
    console.log('  ║   💾  User Data Backup:    /api/user/data            ║');
    console.log('  ║   📋  Beta Feedback API:   /api/feedback             ║');
    console.log('  ║   ✅  Service Worker:      enabled (localhost)       ║');
    console.log('  ║   ✅  PWA Install:         enabled                   ║');
    console.log('  ║                                                      ║');
    console.log('  ╚══════════════════════════════════════════════════════╝');
    console.log('');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${HTTP_PORT} is already in use.`);
    } else {
      console.error('❌ Server error:', err);
    }
    process.exit(1);
  });
}

start();
