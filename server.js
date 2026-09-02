/* Kaun Banega Detective — game server
 * Zero external dependencies. Node 16+.
 *
 *   node server.js            -> http://localhost:3000
 *   PORT=8080 node server.js  -> http://localhost:8080
 *
 * Live state is pushed to every connected screen over Server-Sent Events.
 * Correct answers and reasoning are held on the server and released only
 * when the host triggers the reveal, so no player can read them from the page.
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { QUESTIONS } = require('./questions');

const PORT = process.env.PORT || 3000;
const HOST_ID = process.env.HOST_ID || 'Vaibhav4n6';
const HOST_PASS = process.env.HOST_PASS || 'Vaibhav@9461';
const MAX_PLAYERS = parseInt(process.env.MAX_PLAYERS || '40', 10);
const DEFAULT_DURATION = parseInt(process.env.TIMER_SECONDS || '120', 10) * 1000;

const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

/* ------------------------------------------------------------------ state */

const game = {
  phase: 'lobby', // lobby | question | reveal | leaderboard | finished
  qIndex: 0,
  round: 0,
  startedAt: null,
  endsAt: null,
  durationMs: DEFAULT_DURATION,
  paused: false,
  remainingMs: null,
  lockedRound: null // round number whose answers have been revealed
};

/** playerId -> { id, name, joinedAt, answers: {qIndex: {choice, msLeft, correct, points}} } */
const players = new Map();
/** token -> playerId */
const playerTokens = new Map();
const hostTokens = new Set();

const clients = new Set(); // { res, role, playerId }

const nowMs = () => Date.now();
const token = () => crypto.randomBytes(24).toString('hex');
const slug = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

function timeLeft() {
  if (game.phase !== 'question') return 0;
  if (game.paused) return Math.max(0, game.remainingMs || 0);
  if (!game.endsAt) return 0;
  return Math.max(0, game.endsAt - nowMs());
}

function scoreOf(p) {
  let s = 0;
  for (const k in p.answers) s += p.answers[k].points || 0;
  return s;
}

function correctCountOf(p) {
  let c = 0;
  for (const k in p.answers) if (p.answers[k].correct) c++;
  return c;
}

function leaderboard() {
  return [...players.values()]
    .map((p) => ({
      id: p.id,
      name: p.name,
      score: scoreOf(p),
      correct: correctCountOf(p),
      answered: Object.keys(p.answers).length
    }))
    .sort((a, b) => b.score - a.score || b.correct - a.correct || a.name.localeCompare(b.name));
}

/** Question payload. `full` includes the answer key and reasoning (host, or after reveal). */
function questionPayload(full) {
  const q = QUESTIONS[game.qIndex];
  if (!q) return null;
  const base = {
    id: q.id,
    number: game.qIndex + 1,
    total: QUESTIONS.length,
    title: q.title,
    tag: q.tag,
    brief: q.brief,
    prompt: q.prompt,
    image: q.image || null,
    options: q.options
  };
  if (full) {
    base.answer = q.answer;
    base.reasoning = q.reasoning;
  }
  return base;
}

function stateFor(role, playerId) {
  const revealed = game.phase === 'reveal' || game.phase === 'leaderboard' || game.phase === 'finished';
  const showKey = role === 'host' || revealed;
  const me = playerId ? players.get(playerId) : null;
  const q = QUESTIONS[game.qIndex];

  const state = {
    serverTime: nowMs(),
    phase: game.phase,
    round: game.round,
    qIndex: game.qIndex,
    totalQuestions: QUESTIONS.length,
    timeLeftMs: timeLeft(),
    durationMs: game.durationMs,
    paused: game.paused,
    playerCount: players.size,
    maxPlayers: MAX_PLAYERS,
    question: game.phase === 'lobby' ? null : questionPayload(showKey),
    leaderboard: leaderboard()
  };

  if (me) {
    state.me = { id: me.id, name: me.name, score: scoreOf(me), correct: correctCountOf(me) };
    const a = me.answers[game.qIndex];
    state.myAnswer = a ? a.choice : null;
    state.myLastResult = revealed && a ? { correct: a.correct, points: a.points } : null;
  }

  if (role === 'host') {
    const tally = [0, 0, 0, 0];
    let answered = 0;
    for (const p of players.values()) {
      const a = p.answers[game.qIndex];
      if (a && typeof a.choice === 'number') {
        tally[a.choice]++;
        answered++;
      }
    }
    state.host = {
      answered,
      tally,
      roster: [...players.values()].map((p) => ({
        id: p.id,
        name: p.name,
        score: scoreOf(p),
        answered: !!p.answers[game.qIndex]
      })),
      questionList: QUESTIONS.map((x, i) => ({ number: i + 1, title: x.title, tag: x.tag })),
      answerKey: q ? q.answer : null
    };
  }

  return state;
}

/* -------------------------------------------------------------- broadcast */

function send(client) {
  try {
    const payload = JSON.stringify(stateFor(client.role, client.playerId));
    client.res.write(`event: state\ndata: ${payload}\n\n`);
  } catch (_) {
    /* client gone; cleaned up on close */
  }
}

function broadcast() {
  for (const c of clients) send(c);
}

// Heartbeat keeps proxies from closing idle SSE streams and keeps the
// client countdown aligned with server time.
setInterval(() => {
  for (const c of clients) {
    try {
      c.res.write(': ping\n\n');
    } catch (_) {}
  }
}, 20000);

// Push a fresh state when a timer expires so every screen locks together.
let lastExpired = -1;
setInterval(() => {
  if (game.phase === 'question' && !game.paused && game.endsAt && nowMs() >= game.endsAt) {
    if (lastExpired !== game.round) {
      lastExpired = game.round;
      broadcast();
    }
  }
}, 500);

/* ---------------------------------------------------------------- actions */

function startQuestion(index) {
  const i = Math.max(0, Math.min(QUESTIONS.length - 1, index));
  game.qIndex = i;
  game.phase = 'question';
  game.round += 1;
  game.paused = false;
  game.remainingMs = null;
  game.startedAt = nowMs();
  game.endsAt = game.startedAt + game.durationMs;
}

function resetGame() {
  game.phase = 'lobby';
  game.qIndex = 0;
  game.round += 1;
  game.startedAt = null;
  game.endsAt = null;
  game.paused = false;
  game.remainingMs = null;
  for (const p of players.values()) p.answers = {};
}

/* ------------------------------------------------------------------- http */

function json(res, code, body) {
  const s = JSON.stringify(body);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(s);
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 1e5) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch (_) {
        resolve({});
      }
    });
  });
}

function auth(req) {
  const h = req.headers['authorization'] || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (hostTokens.has(t)) return { role: 'host', token: t };
  if (playerTokens.has(t)) return { role: 'player', token: t, playerId: playerTokens.get(t) };
  return { role: 'guest' };
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function serveStatic(req, res, urlPath) {
  let rel = urlPath === '/' ? '/index.html' : urlPath;
  rel = decodeURIComponent(rel.split('?')[0]);
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  fs.readFile(file, (err, buf) => {
    if (err) {
      // Unknown paths fall back to the app shell so /host and /play work.
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (e2, shell) => {
        if (e2) return res.writeHead(404).end('Not found');
        res.writeHead(200, { 'Content-Type': MIME['.html'] }).end(shell);
      });
      return;
    }
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const cache = /\.(jpg|jpeg|png|svg|ico|woff2?)$/i.test(file)
      ? 'public, max-age=86400'
      : 'no-cache';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': cache }).end(buf);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = url.pathname;

  /* ---- live state stream ---- */
  if (p === '/events') {
    const t = url.searchParams.get('token') || '';
    let role = 'guest';
    let playerId = null;
    if (hostTokens.has(t)) role = 'host';
    else if (playerTokens.has(t)) {
      role = 'player';
      playerId = playerTokens.get(t);
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.write('retry: 2000\n\n');

    const client = { res, role, playerId };
    clients.add(client);
    send(client);
    req.on('close', () => clients.delete(client));
    return;
  }

  /* ---- one-shot state (fallback for browsers that drop the stream) ---- */
  if (p === '/api/state' && req.method === 'GET') {
    const a = auth(req);
    return json(res, 200, stateFor(a.role, a.playerId));
  }

  if (p === '/api/host/login' && req.method === 'POST') {
    const body = await readBody(req);
    const givenId = String(body.id || '').trim();
    const givenPass = String(body.pass || '').trim();
    const ok = safeEqual(slug(givenId), slug(HOST_ID)) && safeEqual(givenPass, HOST_PASS);
    if (!ok) {
      // Printed so a failed sign-in can be diagnosed from the server window.
      console.log(`[host login refused] id "${givenId}" (expected "${HOST_ID}"), password ${givenPass ? 'did not match' : 'was empty'}`);
      return json(res, 401, { error: 'Wrong host ID or password.' });
    }
    const t = token();
    hostTokens.add(t);
    return json(res, 200, { token: t, role: 'host' });
  }

  if (p === '/api/join' && req.method === 'POST') {
    const body = await readBody(req);
    const name = String(body.name || '').trim().slice(0, 28);
    if (name.length < 2) return json(res, 400, { error: 'Enter a name of at least 2 characters.' });
    if (slug(name) === slug(HOST_ID)) return json(res, 400, { error: 'That name is reserved.' });

    // Rejoin under the same name keeps the existing score.
    let existing = null;
    for (const pl of players.values()) if (slug(pl.name) === slug(name)) existing = pl;

    let player = existing;
    if (!player) {
      if (players.size >= MAX_PLAYERS)
        return json(res, 403, { error: `The room is full (${MAX_PLAYERS} players).` });
      player = { id: crypto.randomBytes(8).toString('hex'), name, joinedAt: nowMs(), answers: {} };
      players.set(player.id, player);
    }
    const t = token();
    playerTokens.set(t, player.id);
    broadcast();
    return json(res, 200, { token: t, role: 'player', player: { id: player.id, name: player.name } });
  }

  if (p === '/api/answer' && req.method === 'POST') {
    const a = auth(req);
    if (a.role !== 'player') return json(res, 401, { error: 'Join the game first.' });
    const player = players.get(a.playerId);
    if (!player) return json(res, 401, { error: 'Join the game first.' });

    const body = await readBody(req);
    const choice = Number(body.choice);
    if (!(choice >= 0 && choice <= 3)) return json(res, 400, { error: 'Pick one of the four options.' });
    if (game.phase !== 'question') return json(res, 400, { error: 'The question is not open.' });

    const left = timeLeft();
    if (left <= 0) return json(res, 400, { error: 'Time is up for this question.' });
    if (player.answers[game.qIndex]) return json(res, 400, { error: 'Your answer is already locked in.' });

    const q = QUESTIONS[game.qIndex];
    const correct = choice === q.answer;
    const points = correct ? 1000 + Math.round(1000 * (left / game.durationMs)) : 0;
    player.answers[game.qIndex] = { choice, msLeft: left, correct, points };
    broadcast();
    return json(res, 200, { ok: true, locked: choice });
  }

  if (p.startsWith('/api/host/') && req.method === 'POST') {
    const a = auth(req);
    if (a.role !== 'host') return json(res, 401, { error: 'Host access only.' });
    const body = await readBody(req);
    const action = p.slice('/api/host/'.length);

    switch (action) {
      case 'start':
        startQuestion(0);
        break;
      case 'show':
        startQuestion(Number(body.index) || 0);
        break;
      case 'next':
        if (game.qIndex + 1 < QUESTIONS.length) startQuestion(game.qIndex + 1);
        else {
          game.phase = 'finished';
          game.round += 1;
        }
        break;
      case 'previous':
        startQuestion(Math.max(0, game.qIndex - 1));
        break;
      case 'reveal':
        game.phase = 'reveal';
        game.paused = true;
        game.remainingMs = 0;
        game.round += 1;
        break;
      case 'leaderboard':
        game.phase = 'leaderboard';
        game.round += 1;
        break;
      case 'question':
        // Return from the leaderboard to the current question without restarting it.
        if (QUESTIONS[game.qIndex]) {
          game.phase = 'reveal';
          game.round += 1;
        }
        break;
      case 'pause':
        if (game.phase === 'question' && !game.paused) {
          game.remainingMs = timeLeft();
          game.paused = true;
          game.round += 1;
        }
        break;
      case 'resume':
        if (game.phase === 'question' && game.paused) {
          game.endsAt = nowMs() + (game.remainingMs || 0);
          game.paused = false;
          game.remainingMs = null;
          game.round += 1;
        }
        break;
      case 'addtime': {
        const add = Math.max(0, Math.min(600, Number(body.seconds) || 30)) * 1000;
        if (game.paused) game.remainingMs = (game.remainingMs || 0) + add;
        else if (game.endsAt) game.endsAt += add;
        break;
      }
      case 'duration': {
        const secs = Math.max(10, Math.min(1800, Number(body.seconds) || 120));
        game.durationMs = secs * 1000;
        break;
      }
      case 'finish':
        game.phase = 'finished';
        game.round += 1;
        break;
      case 'reset':
        resetGame();
        break;
      case 'clearplayers':
        players.clear();
        playerTokens.clear();
        break;
      case 'kick': {
        const id = String(body.playerId || '');
        players.delete(id);
        for (const [tk, pid] of playerTokens) if (pid === id) playerTokens.delete(tk);
        break;
      }
      default:
        return json(res, 404, { error: 'Unknown host action.' });
    }

    broadcast();
    return json(res, 200, { ok: true });
  }

  if (req.method === 'GET') return serveStatic(req, res, p);
  res.writeHead(405).end('Method not allowed');
});

server.listen(PORT, () => {
  const nets = os.networkInterfaces();
  const lan = [];
  for (const name of Object.keys(nets))
    for (const ni of nets[name] || [])
      if (ni.family === 'IPv4' && !ni.internal) lan.push(ni.address);

  console.log('\n  KAUN BANEGA DETECTIVE');
  console.log('  ' + '-'.repeat(46));
  console.log(`  Players   http://localhost:${PORT}`);
  lan.forEach((ip) => console.log(`            http://${ip}:${PORT}   <- share this on Wi-Fi`));
  console.log(`  Host      http://localhost:${PORT}/host`);
  console.log(`  Host ID   ${HOST_ID}`);
  console.log(`  Questions ${QUESTIONS.length}   Timer ${DEFAULT_DURATION / 1000}s   Capacity ${MAX_PLAYERS}\n`);
});
