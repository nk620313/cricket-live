// ===== DATA =====
const IPL_TEAMS = [
  { short: "MI",   name: "Mumbai Indians",            color: "#004BA0", accent: "#D1AB3E", emoji: "🔵" },
  { short: "CSK",  name: "Chennai Super Kings",        color: "#F9CD05", accent: "#0081E9", emoji: "🟡" },
  { short: "RCB",  name: "Royal Challengers Bengaluru",color: "#EC1C24", accent: "#2D2D2D", emoji: "🔴" },
  { short: "KKR",  name: "Kolkata Knight Riders",      color: "#3A225D", accent: "#F4CA30", emoji: "🟣" },
  { short: "DC",   name: "Delhi Capitals",             color: "#00008B", accent: "#EF1B23", emoji: "🔵" },
  { short: "PBKS", name: "Punjab Kings",               color: "#ED1C24", accent: "#A7A9AC", emoji: "🔴" },
  { short: "RR",   name: "Rajasthan Royals",           color: "#EA1A85", accent: "#254AA5", emoji: "🩷" },
  { short: "SRH",  name: "Sunrisers Hyderabad",        color: "#F26522", accent: "#000000", emoji: "🟠" },
  { short: "GT",   name: "Gujarat Titans",             color: "#1C4E9D", accent: "#C8A84B", emoji: "🔵" },
  { short: "LSG",  name: "Lucknow Super Giants",       color: "#A4C8E1", accent: "#0057A8", emoji: "🩵" },
];

const MATCHES = [
  { id:1, t1:"MI",  t2:"CSK",  s1:"187/4", s2:"142/6", o1:"20",  o2:"16.3", status:"LIVE",      venue:"Wankhede Stadium, Mumbai",         stage:"Batting: CSK — Need 46 off 21 balls" },
  { id:2, t1:"RCB", t2:"KKR",  s1:"203/5", s2:"204/3", o1:"20",  o2:"19.2", status:"COMPLETED",  venue:"M. Chinnaswamy, Bengaluru",         stage:"KKR won by 7 wickets" },
  { id:3, t1:"SRH", t2:"RR",   s1:"-",     s2:"-",     o1:"-",   o2:"-",    status:"UPCOMING",   venue:"Rajiv Gandhi Stadium, Hyderabad",   stage:"Kal, 7:30 PM IST" },
  { id:4, t1:"DC",  t2:"GT",   s1:"165/8", s2:"89/3",  o1:"20",  o2:"11.0", status:"LIVE",       venue:"Arun Jaitley Stadium, Delhi",       stage:"Batting: GT — CRR 8.09" },
  { id:5, t1:"PBKS",t2:"LSG",  s1:"178/6", s2:"180/4", o1:"20",  o2:"19.4", status:"COMPLETED",  venue:"PCA Stadium, Mohali",               stage:"LSG won by 6 wickets" },
  { id:6, t1:"MI",  t2:"RR",   s1:"-",     s2:"-",     o1:"-",   o2:"-",    status:"UPCOMING",   venue:"Wankhede Stadium, Mumbai",          stage:"Parso, 3:30 PM IST" },
];

const POINTS = [
  { pos:1, team:"CSK",  p:10, w:7, l:3, pts:14, nrr:"+0.892" },
  { pos:2, team:"MI",   p:10, w:6, l:4, pts:12, nrr:"+0.541" },
  { pos:3, team:"RCB",  p:10, w:6, l:4, pts:12, nrr:"+0.312" },
  { pos:4, team:"KKR",  p:10, w:5, l:5, pts:10, nrr:"+0.123" },
  { pos:5, team:"GT",   p:10, w:5, l:5, pts:10, nrr:"-0.045" },
  { pos:6, team:"SRH",  p:10, w:4, l:6, pts:8,  nrr:"-0.231" },
  { pos:7, team:"RR",   p:10, w:4, l:6, pts:8,  nrr:"-0.445" },
  { pos:8, team:"DC",   p:10, w:3, l:7, pts:6,  nrr:"-0.678" },
  { pos:9, team:"PBKS", p:10, w:3, l:7, pts:6,  nrr:"-0.712" },
  { pos:10,team:"LSG",  p:10, w:2, l:8, pts:4,  nrr:"-0.981" },
];

const TICKER = [
  "🔥 MI vs CSK: CSK needs 46 off 21 balls! THRILLER!",
  "⚡ DC vs GT: GT crossing 90 runs in 11 overs — CRR 8.09",
  "🏆 Orange Cap: Virat Kohli (RCB) — 612 runs this season",
  "🎯 Purple Cap: Jasprit Bumrah (MI) — 19 wickets",
  "📊 CSK top of table with 14 points",
  "🔴 2 matches LIVE right now — tap to see AI commentary!",
];

function getTeam(s) {
  return IPL_TEAMS.find(t => t.short === s) || { short:s, name:s, color:"#333", accent:"#888", emoji:"🏏" };
}

// ===== STATE =====
let activeTab = 'matches';
let selectedMatch = null;
let tickerIdx = 0;
let deferredInstallPrompt = null;

// ===== PWA INSTALL =====
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  setTimeout(() => {
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.add('show');
  }, 3000);
});

document.addEventListener('click', e => {
  if (e.target.id === 'install-btn' && deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    document.getElementById('install-banner').classList.remove('show');
  }
  if (e.target.id === 'dismiss-btn') {
    document.getElementById('install-banner').classList.remove('show');
  }
});

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ===== RENDER =====
function render() {
  document.getElementById('app').innerHTML = `
    ${renderHeader()}
    ${renderTicker()}
    ${renderTabs()}
    <div style="padding:16px 16px 90px;max-width:500px;margin:0 auto;" class="tab-content">
      ${activeTab === 'matches' ? renderMatches() : ''}
      ${activeTab === 'points'  ? renderPoints()  : ''}
      ${activeTab === 'teams'   ? renderTeams()   : ''}
    </div>
    ${renderBottomNav()}
    ${selectedMatch ? renderModal() : ''}
  `;
  bindEvents();
}

function renderHeader() {
  const liveCount = MATCHES.filter(m => m.status === 'LIVE').length;
  return `
    <div style="background:linear-gradient(135deg,#1a0533,#0d1b4b);padding:14px 18px;
      border-bottom:1px solid rgba(255,255,255,0.08);position:sticky;top:0;z-index:100;
      backdrop-filter:blur(10px);">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:26px">🏏</span>
          <div>
            <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px;
              background:linear-gradient(90deg,#ffd700,#ff8c00);-webkit-background-clip:text;
              -webkit-text-fill-color:transparent;">CricketLIVE</div>
            <div style="font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:3px;margin-top:-2px;">IPL 2026</div>
          </div>
        </div>
        <div style="background:rgba(255,80,80,0.15);border:1px solid rgba(255,80,80,0.3);
          border-radius:20px;padding:5px 12px;display:flex;align-items:center;gap:6px;">
          <div style="width:7px;height:7px;border-radius:50%;background:#ff4444;animation:pulse 1s infinite;"></div>
          <span style="font-size:11px;color:#ff8080;font-weight:700;">${liveCount} LIVE</span>
        </div>
      </div>
    </div>`;
}

function renderTicker() {
  const msg1 = TICKER[tickerIdx % TICKER.length];
  const msg2 = TICKER[(tickerIdx+1) % TICKER.length];
  const msg3 = TICKER[(tickerIdx+2) % TICKER.length];
  return `
    <div style="background:linear-gradient(90deg,#ffd700,#ff8c00);padding:6px 0;overflow:hidden;white-space:nowrap;">
      <span style="display:inline-block;color:#000;font-weight:700;font-size:11px;
        animation:ticker 18s linear infinite;padding-left:100%;">
        ${msg1} &nbsp;•&nbsp; ${msg2} &nbsp;•&nbsp; ${msg3} &nbsp;•&nbsp; ${msg1} &nbsp;•&nbsp; ${msg2} &nbsp;•&nbsp; ${msg3}
      </span>
    </div>`;
}

function renderTabs() {
  const tabs = [
    { id:'matches', label:'🏏 Matches' },
    { id:'points',  label:'📊 Points'  },
    { id:'teams',   label:'👥 Teams'   },
  ];
  return `
    <div style="display:flex;border-bottom:1px solid rgba(255,255,255,0.08);
      background:rgba(10,10,25,0.8);padding:0 12px;position:sticky;top:58px;z-index:90;
      backdrop-filter:blur(8px);">
      ${tabs.map(t => `
        <button class="tab-btn" data-tab="${t.id}" style="flex:1;background:none;border:none;
          color:${activeTab===t.id ? '#ffd700' : 'rgba(255,255,255,0.4)'};
          padding:13px 6px;cursor:pointer;font-size:12px;font-weight:700;
          border-bottom:2px solid ${activeTab===t.id ? '#ffd700' : 'transparent'};
          transition:all 0.2s;font-family:'Noto Sans',sans-serif;letter-spacing:0.3px;">
          ${t.label}
        </button>`).join('')}
    </div>`;
}

function renderMatches() {
  const live = MATCHES.filter(m => m.status === 'LIVE');
  const upcoming = MATCHES.filter(m => m.status === 'UPCOMING');
  const completed = MATCHES.filter(m => m.status === 'COMPLETED');
  return `
    <div class="section-label">🔴 LIVE MATCHES</div>
    ${live.map(renderMatchCard).join('')}
    <div class="section-label" style="margin-top:20px;">🕐 UPCOMING</div>
    ${upcoming.map(renderMatchCard).join('')}
    <div class="section-label" style="margin-top:20px;">✅ RECENT RESULTS</div>
    ${completed.map(renderMatchCard).join('')}
    <div style="margin-top:16px;padding:12px 16px;border-radius:12px;
      background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);
      color:rgba(255,255,255,0.6);font-size:12px;text-align:center;">
      💡 Kisi bhi match pe tap karo — AI commentary milegi!
    </div>`;
}

function renderMatchCard(m) {
  const t1 = getTeam(m.t1), t2 = getTeam(m.t2);
  const isLive = m.status === 'LIVE';
  const isDone = m.status === 'COMPLETED';
  const stageBg = isLive ? 'rgba(255,80,80,0.1)' : isDone ? 'rgba(100,200,100,0.1)' : 'rgba(255,200,50,0.1)';
  const stageColor = isLive ? '#ff8080' : isDone ? '#6fcf97' : '#f2c94c';
  const stageBorder = isLive ? 'rgba(255,80,80,0.2)' : isDone ? 'rgba(100,200,100,0.2)' : 'rgba(255,200,50,0.2)';

  return `
    <div class="match-card ${isLive ? 'live' : ''}" data-match="${m.id}">
      ${isLive ? '<div class="live-strip"></div>' : ''}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span style="color:rgba(255,255,255,0.4);font-size:10px;">📍 ${m.venue}</span>
        ${isLive
          ? `<span style="display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,#ff2d2d,#ff6b6b);
               color:#fff;font-size:10px;font-weight:800;padding:3px 8px;border-radius:20px;letter-spacing:1.5px;">
               <span style="width:6px;height:6px;border-radius:50%;background:#fff;display:inline-block;animation:pulse 1s infinite;"></span>LIVE</span>`
          : `<span style="background:${isDone?'rgba(100,200,100,0.15)':'rgba(255,200,50,0.15)'};
               color:${isDone?'#6fcf97':'#f2c94c'};
               border:1px solid ${isDone?'rgba(111,207,151,0.3)':'rgba(242,201,76,0.3)'};
               padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:1px;">
               ${isDone ? '✅ ENDED' : '🕐 UPCOMING'}</span>`
        }
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="text-align:center;flex:1;">
          <div class="team-badge" style="background:linear-gradient(135deg,${t1.color},${t1.accent});
            box-shadow:0 4px 15px ${t1.color}50;">${t1.emoji}</div>
          <div style="font-weight:900;font-size:20px;font-family:'Bebas Neue',sans-serif;letter-spacing:1px;">${t1.short}</div>
          ${m.s1!=='-' ? `<div style="color:#e0e0e0;font-size:15px;font-weight:700;margin-top:3px;">${m.s1}</div>
          <div style="color:rgba(255,255,255,0.35);font-size:11px;">(${m.o1} ov)</div>` : ''}
        </div>
        <div style="text-align:center;padding:0 10px;">
          <div style="background:rgba(255,255,255,0.08);border-radius:50%;width:36px;height:36px;
            display:flex;align-items:center;justify-content:center;font-size:16px;margin:0 auto;">🏏</div>
          <div style="color:rgba(255,255,255,0.3);font-size:10px;margin-top:5px;font-weight:700;">VS</div>
        </div>
        <div style="text-align:center;flex:1;">
          <div class="team-badge" style="background:linear-gradient(135deg,${t2.color},${t2.accent});
            box-shadow:0 4px 15px ${t2.color}50;">${t2.emoji}</div>
          <div style="font-weight:900;font-size:20px;font-family:'Bebas Neue',sans-serif;letter-spacing:1px;">${t2.short}</div>
          ${m.s2!=='-' ? `<div style="color:${isLive?'#ffd700':'#e0e0e0'};font-size:15px;font-weight:700;margin-top:3px;">${m.s2}</div>
          <div style="color:rgba(255,255,255,0.35);font-size:11px;">(${m.o2} ov)</div>` : ''}
        </div>
      </div>
      ${(isLive||isDone||m.status==='UPCOMING') ? `
        <div style="margin-top:12px;padding:8px 12px;border-radius:8px;
          background:${stageBg};border:1px solid ${stageBorder};
          color:${stageColor};font-size:12px;font-weight:600;text-align:center;">
          ${m.stage}
        </div>` : ''}
    </div>`;
}

function renderPoints() {
  return `
    <div class="section-label">📊 IPL 2026 POINTS TABLE</div>
    <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;
      overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
      <div class="points-row" style="background:rgba(255,215,0,0.1);border-bottom:1px solid rgba(255,255,255,0.08);">
        <span style="color:rgba(255,255,255,0.5);font-size:9px;font-weight:700;letter-spacing:1px;">#</span>
        <span style="color:rgba(255,255,255,0.5);font-size:9px;font-weight:700;letter-spacing:1px;">TEAM</span>
        <span style="color:rgba(255,255,255,0.5);font-size:9px;font-weight:700;text-align:center;">P</span>
        <span style="color:rgba(255,255,255,0.5);font-size:9px;font-weight:700;text-align:center;">W</span>
        <span style="color:rgba(255,255,255,0.5);font-size:9px;font-weight:700;text-align:center;">L</span>
        <span style="color:rgba(255,255,255,0.5);font-size:9px;font-weight:700;text-align:center;">PTS</span>
        <span style="color:rgba(255,255,255,0.5);font-size:9px;font-weight:700;text-align:right;">NRR</span>
      </div>
      ${POINTS.map((r,i) => {
        const t = getTeam(r.team);
        const isPlayoff = i < 4;
        return `
          <div class="points-row" style="${i<POINTS.length-1?'border-bottom:1px solid rgba(255,255,255,0.04);':''}
            ${isPlayoff?'background:rgba(100,200,100,0.03);':''}">
            <span style="color:${isPlayoff?'#6fcf97':'rgba(255,255,255,0.3)'};font-weight:700;font-size:13px;">${r.pos}</span>
            <div style="display:flex;align-items:center;gap:7px;">
              <div style="width:26px;height:26px;border-radius:50%;flex-shrink:0;
                background:linear-gradient(135deg,${t.color},${t.accent});
                display:flex;align-items:center;justify-content:center;font-size:11px;">${t.emoji}</div>
              <span style="font-weight:700;font-size:12px;">${r.team}</span>
            </div>
            <span style="color:rgba(255,255,255,0.5);font-size:11px;text-align:center;">${r.p}</span>
            <span style="color:#6fcf97;font-size:12px;font-weight:700;text-align:center;">${r.w}</span>
            <span style="color:#ff8080;font-size:12px;text-align:center;">${r.l}</span>
            <div style="background:rgba(255,215,0,0.15);color:#ffd700;border-radius:6px;
              padding:2px 0;font-weight:800;font-size:12px;text-align:center;">${r.pts}</div>
            <span style="color:${r.nrr.startsWith('+')?'#6fcf97':'#ff8080'};font-size:10px;font-weight:600;text-align:right;">${r.nrr}</span>
          </div>`;
      }).join('')}
    </div>
    <div style="margin-top:10px;color:rgba(255,255,255,0.35);font-size:11px;display:flex;gap:16px;">
      <span>🟢 Playoff zone (top 4)</span>
    </div>`;
}

function renderTeams() {
  return `
    <div class="section-label">👥 ALL IPL 2026 TEAMS</div>
    <div class="team-grid">
      ${IPL_TEAMS.map(t => `
        <div class="team-card" style="background:linear-gradient(135deg,${t.color}33,${t.accent}22);
          border:1px solid ${t.color}44;">
          <div style="width:50px;height:50px;border-radius:50%;margin:0 auto 10px;
            background:linear-gradient(135deg,${t.color},${t.accent});
            display:flex;align-items:center;justify-content:center;font-size:22px;
            box-shadow:0 4px 15px ${t.color}60;">${t.emoji}</div>
          <div style="font-weight:900;font-size:16px;font-family:'Bebas Neue',sans-serif;letter-spacing:1px;">${t.short}</div>
          <div style="color:rgba(255,255,255,0.45);font-size:10px;margin-top:4px;line-height:1.4;">${t.name}</div>
        </div>`).join('')}
    </div>`;
}

function renderBottomNav() {
  const navItems = [
    { id:'matches', icon:'🏏', label:'Matches' },
    { id:'points',  icon:'📊', label:'Points'  },
    { id:'teams',   icon:'👥', label:'Teams'   },
  ];
  return `
    <nav class="bottom-nav">
      ${navItems.map(n => `
        <button class="nav-btn ${activeTab===n.id?'active':''}" data-nav="${n.id}">
          <span>${n.icon}</span>
          <span>${n.label}</span>
        </button>`).join('')}
    </nav>`;
}

function renderModal() {
  const m = selectedMatch;
  const t1 = getTeam(m.t1), t2 = getTeam(m.t2);
  return `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-box">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
          <div>
            <div style="font-weight:900;font-size:18px;font-family:'Bebas Neue',sans-serif;letter-spacing:1px;">
              ${t1.short} vs ${t2.short}
            </div>
            <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:2px;">📍 ${m.venue}</div>
          </div>
          <button id="close-modal" style="background:rgba(255,255,255,0.1);border:none;color:#fff;
            width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:18px;
            display:flex;align-items:center;justify-content:center;">×</button>
        </div>

        <div style="background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.15);
          border-radius:12px;padding:16px;min-height:120px;" id="commentary-box">
          <div style="text-align:center;color:rgba(255,255,255,0.4);padding:20px 0;">
            <div style="font-size:30px;animation:spin 1s linear infinite;display:inline-block;">🏏</div>
            <div style="margin-top:8px;font-size:13px;">AI commentary aa rahi hai...</div>
          </div>
        </div>

        <div style="margin-top:14px;text-align:center;color:rgba(255,255,255,0.25);font-size:10px;letter-spacing:1px;">
          ✨ Powered by Claude AI
        </div>
      </div>
    </div>`;
}

// ===== EVENTS =====
function bindEvents() {
  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      render();
    });
  });

  // Bottom nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.nav;
      render();
    });
  });

  // Match cards
  document.querySelectorAll('.match-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.match);
      selectedMatch = MATCHES.find(m => m.id === id);
      render();
      fetchCommentary();
    });
  });

  // Close modal
  const closeBtn = document.getElementById('close-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      selectedMatch = null;
      render();
    });
  }

  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        selectedMatch = null;
        render();
      }
    });
  }
}

// ===== AI COMMENTARY =====
async function fetchCommentary() {
  const m = selectedMatch;
  if (!m) return;
  const t1 = getTeam(m.t1), t2 = getTeam(m.t2);

  let prompt;
  if (m.status === 'LIVE') {
    prompt = `IPL 2026 LIVE match: ${t1.name} (${m.s1} in ${m.o1} overs) vs ${t2.name} (${m.s2} in ${m.o2} overs) at ${m.venue}. Status: ${m.stage}. Cricket expert ki tarah exciting Hindi+English mixed commentary do. Situation ka analysis karo, winning chances batao. 5-6 lines max, energetic tone.`;
  } else if (m.status === 'COMPLETED') {
    prompt = `IPL 2026 result: ${t1.name} (${m.s1}) vs ${t2.name} (${m.s2}) at ${m.venue}. Result: ${m.stage}. Hindi+English mixed match summary do — key moments, man of the match prediction, aur dono teams ki performance. 5 lines max.`;
  } else {
    prompt = `IPL 2026 upcoming: ${t1.name} vs ${t2.name} at ${m.venue} — ${m.stage}. Exciting Hindi+English preview do — form analysis, key players, prediction. 5 lines max.`;
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 350,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.map(c => c.text || '').join('') || 'Commentary unavailable.';

    const box = document.getElementById('commentary-box');
    if (box) {
      box.innerHTML = `<p style="color:#e8e8e8;font-size:14px;line-height:1.85;font-family:'Noto Sans',sans-serif;margin:0;">${text}</p>`;
    }
  } catch {
    const box = document.getElementById('commentary-box');
    if (box) {
      box.innerHTML = `<p style="color:rgba(255,255,255,0.5);font-size:13px;text-align:center;margin:0;padding:16px 0;">
        Yaar, commentary load nahi ho rahi 😅<br>Net check karo aur dobara try karo!</p>`;
    }
  }
}

// ===== TICKER AUTO-ROTATE =====
setInterval(() => {
  tickerIdx++;
  const ticker = document.querySelector('[style*="animation:ticker"]');
  if (ticker) {
    const msg1 = TICKER[tickerIdx % TICKER.length];
    const msg2 = TICKER[(tickerIdx+1) % TICKER.length];
    const msg3 = TICKER[(tickerIdx+2) % TICKER.length];
    ticker.textContent = `${msg1}   •   ${msg2}   •   ${msg3}   •   ${msg1}   •   ${msg2}   •   ${msg3}`;
  }
}, 6000);

// ===== INIT =====
render();
