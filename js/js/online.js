/* =====================================================================
   3) ออนไลน์: ล็อกอิน Google · ห้องพร้อมรหัสผ่าน + QR · ซิงก์ผ่าน Firebase
   ---------------------------------------------------------------------
   - เครื่องที่ "สร้างห้อง" คือโฮสต์: รันเกมทั้งหมดและส่งสถานะออกไป
     · public          = สนามที่ทุกคนเห็น (การ์ดในมือถูกปิดหน้า)
     · private/A, B    = การ์ดในมือของแต่ละทีม (กฎฐานข้อมูลให้อ่านได้เฉพาะเจ้าของที่นั่ง + โฮสต์)
   - ผู้เล่นส่งคำสั่งเข้า actions/ แล้วโฮสต์เป็นผู้ตรวจและดำเนินการ
   ===================================================================== */
const APP_VER = '20261118a';
let AUTH = null, DB = null, USER = null;
let ROOM = null, ROOM_PW = '', IS_HOST = false, MYSEAT = null, ROOMINFO = null;
let TEAMS = {}, READY = {}, NAMES = {};
let offFns = [];
let xView = null, zoomCid = null, zoomRoot = null;
let S = null, phoneSel = null, castMenu = false, phoneConn = 'connecting', lastStateAt = 0, pubCache = null, privCache = null;
let ME = null, online = true;

const scrEl = document.getElementById('scr');
function showScr(html){ scrEl.innerHTML = `<div class="overlay scr"><div class="modal">${html}</div></div>`; }
function closeScr(){ scrEl.innerHTML = ''; }
const LOGO = () => `<div class="logo" style="justify-content:center;margin-bottom:1.4vh">${LOTUS}<div><div class="l1">SAMAS CODEBREAKERS</div><div class="l2">FUSION DUEL</div></div>${LOTUS}</div>`;
const qs = new URLSearchParams(location.search);

function fbInit(){
  const cfg = window.FIREBASE_CONFIG;
  if(!window.firebase || !cfg || !cfg.apiKey || /ใส่|YOUR/i.test(cfg.apiKey)) return false;
  try{ firebase.initializeApp(cfg); AUTH = firebase.auth(); DB = firebase.database(); return true; }
  catch(e){ console.error(e); return false; }
}
async function sha256(s){
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join('');
}
const pwHash = (code, pw) => sha256(`samas:${code}:${pw}`);
const rr = p => DB.ref(`rooms/${ROOM}${p ? '/' + p : ''}`);
const myName = () => (USER && (USER.displayName || USER.email)) || 'ผู้เล่น';
const rosterOf = k => Object.entries((TEAMS && TEAMS[k]) || {}).sort((a,b) => (a[1]||0) - (b[1]||0)).map(e => e[0]);
const nameOf = u => (u && NAMES[u]) || 'ผู้เล่น';
const shortName = u => nameOf(u).split(' ')[0];
const teamName = k => { const r = rosterOf(k).map(shortName); return r.length ? `${r.slice(0,3).join(', ')}${r.length>3?` +${r.length-3}`:''}` : `ทีม ${k}`; };
const myUid = () => USER ? USER.uid : null;
const joinLink = code => `${location.origin}${location.pathname}?room=${code}`;
function saveLast(){ try{ localStorage.setItem('fusion-duel-last', JSON.stringify({code:ROOM, pw:ROOM_PW})); }catch(e){} }
function loadLast(){ try{ return JSON.parse(localStorage.getItem('fusion-duel-last') || 'null'); }catch(e){ return null; } }
function fbErr(e){
  const c = (e && (e.code || e.message)) || '';
  if(/PERMISSION_DENIED|permission/i.test(c)) return 'ไม่มีสิทธิ์ (รหัสห้องหรือรหัสผ่านไม่ถูกต้อง)';
  if(/popup-closed|cancelled-popup/i.test(c)) return 'ปิดหน้าต่างล็อกอินก่อนเสร็จ';
  if(/unauthorized-domain/i.test(c)) return 'โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Authentication (ดู README ขั้นที่ 3)';
  if(/network/i.test(c)) return 'เชื่อมต่ออินเทอร์เน็ตไม่ได้';
  return c;
}

/* ---------- หน้าแรก (Landing) ---------- */
function showLanding(html){ scrEl.innerHTML = `<div class="landing">${html}</div>`; scrEl.onclick = null; }
const HERO_CARDS = ['C21','C13','C01','C14','C02'];
function heroHTML(){
  return `<div class="hero">
    <div class="hero-circle">${MAGIC_CIRCLE}</div>
    <div class="hero-fan">${HERO_CARDS.filter(id => COMP[id]).map((id,i) => `<div class="card hc hc${i}">${compFaceHTML(COMP[id])}</div>`).join('')}</div>
    <div class="logo hero-logo">${LOTUS}<div><div class="l1">SAMAS CODEBREAKERS</div><div class="l2">FUSION DUEL</div></div>${LOTUS}</div>
    <p class="tagline">ถอดรหัสคำสมาส–คำสนธิ · ฟิวชันรากศัพท์ · อัญเชิญพลังแห่งคำ</p>
  </div>`;
}
const menuCard = (id, icon, title, sub, cls='') => `<button class="mcardbtn ${cls}" id="${id}"><span class="mi">${icon}</span><span class="mt">${title}</span><span class="ms">${sub}</span></button>`;
const landFoot = () => `<div class="landfoot">เวอร์ชัน ${APP_VER} · <a href="#" onclick="toggleLite();return false">${document.body.classList.contains('lite')?'⚡ โหมดลื่น: เปิด':'⚡ โหมดลื่น: ปิด'}</a></div>`;
function bindCommon(){
  const on = (id, f) => { const b = document.getElementById(id); if(b) b.onclick = f; };
  on('mPrac', () => tutStart());
  on('mGloss', () => showGlossary());
  on('mRules', () => showRulesPop());
  on('mOff', () => startOffline());
  on('mRep', () => showReportList());
}
function showNeedsSetup(){
  showLanding(`${heroHTML()}
    <div class="panel"><h3>ยังไม่ได้ตั้งค่าระบบออนไลน์</h3><p>ใส่ค่า Firebase ในไฟล์ <code>js/firebase-config.js</code> ก่อน (ดู README.md) — ระหว่างนี้ยังฝึกหัดและเล่นเครื่องเดียวได้</p></div>
    <div class="menu">${menuCard('mPrac','🎓','ฝึกหัดการเล่น','เรียนกติกาทีละขั้น ไม่จับเวลา')}${menuCard('mOff','🖥','เล่นเครื่องเดียว','สองทีมแตะเล่นบนจอเดียว')}${menuCard('mGloss','📖','คลังคำ','รากศัพท์ คำอ่าน ความหมาย')}${menuCard('mRules','📜','กติกา','อ่านกติกาทั้งหมด')}</div>${landFoot()}`);
  bindCommon();
}
function showLogin(err=''){
  showLanding(`${heroHTML()}
    ${err?`<p class="note err">${esc(err)}</p>`:''}
    <div class="loginbox"><button class="btn gbtn" id="glogin"><span class="g">G</span> เข้าสู่ระบบด้วย Google</button>
      <div class="zhint">${qs.get('room')?`เพื่อเข้าห้อง <b>${esc(qs.get('room'))}</b>`:'เพื่อสร้างห้องดวล หรือเข้าร่วมห้องของเพื่อน'}</div></div>
    <div class="menu">${menuCard('mPrac','🎓','ฝึกหัดการเล่น','เรียนกติกาทีละขั้น ไม่ต้องล็อกอิน')}${menuCard('mGloss','📖','คลังคำ','รากศัพท์ คำอ่าน ความหมาย')}${menuCard('mRules','📜','กติกา','อ่านกติกาทั้งหมด')}${menuCard('mOff','🖥','เล่นเครื่องเดียว','สองทีมแตะเล่นบนจอเดียว')}</div>${landFoot()}`);
  document.getElementById('glogin').onclick = signIn;
  bindCommon();
}
async function signIn(){
  const prov = new firebase.auth.GoogleAuthProvider();
  prov.setCustomParameters({prompt:'select_account'});
  try{ await AUTH.signInWithPopup(prov); }
  catch(e){
    if(/popup-blocked|operation-not-supported|web-storage/i.test(e.code||'')) return AUTH.signInWithRedirect(prov);
    showLogin(fbErr(e));
  }
}
function showHome(err='', panel=null){
  const last = loadLast(), pre = qs.get('room') || '';
  if(!panel && pre) panel = 'join';
  const core = GD.completedCards.filter(c=>c.release==='core').length, all = GD.completedCards.length;
  const user = `<div class="userbar">${USER.photoURL?`<img src="${esc(USER.photoURL)}" alt="">`:''}<span>${esc(myName())}</span><button class="btn ghost sm" onclick="AUTH.signOut()">ออกจากระบบ</button></div>`;
  let body;
  if(panel === 'join') body = `<div class="panel"><h3>🔑 เข้าร่วมห้อง</h3>
      <label>รหัสห้อง (6 หลัก)</label><input type="text" id="jCode" inputmode="numeric" maxlength="6" value="${esc(pre)}" placeholder="123456">
      <label>รหัสผ่านห้อง</label><input type="text" id="jPw" value="${esc(qs.get('pw')||'')}" autocomplete="off" placeholder="ขอจากครู">
      <div class="mfoot"><button class="btn ghost" id="bBack">← กลับ</button><button class="btn summon" id="bJoin">เข้าห้อง ⚔</button></div>
      ${last && last.code ? `<p class="note">ห้องล่าสุด: <a href="#" id="bLast">${esc(last.code)} — กลับเข้าห้อง</a></p>` : ''}</div>`;
  else if(panel === 'create') body = `<div class="panel"><h3>✨ สร้างห้องดวล</h3>
      <label>ตั้งรหัสผ่านห้อง</label><input type="text" id="cPw" value="${String(1000+Math.floor(Math.random()*9000))}" autocomplete="off">
      <label>เครื่องนี้ทำหน้าที่</label>
      <div class="chk"><input type="radio" name="crole" id="rTV" checked><span>จอกลาง / ครู (ฉายขึ้นทีวี — นักเรียนเล่นบนมือถือ)</span></div>
      <div class="chk"><input type="radio" name="crole" id="rA"><span>ผู้เล่นทีม A (ดวลกับเพื่อนอีกเครื่อง)</span></div>
      <label>ชุดการ์ด</label>
      <div class="chk"><input type="radio" name="crel" id="cCore" checked><span>ชุดหลัก (${core} คำ)</span></div>
      <div class="chk"><input type="radio" name="crel" id="cExp"><span>ชุดหลัก + ส่วนขยาย (${all} คำ)</span></div>
      <label>สมาชิกในทีม</label>
      <div class="chk"><input type="checkbox" id="cRot" checked><span>หมุนเวียน “ผู้คุมการ์ด” ทุกเทิร์น (เมื่อทีมมีหลายเครื่อง) — ผู้ตอบคำถามหมุนเวียนเสมอ</span></div>
      <div class="mfoot"><button class="btn ghost" id="bBack">← กลับ</button><button class="btn summon" id="bCreate">สร้างห้อง ✨</button></div></div>`;
  else body = `<div class="menu">
      ${menuCard('mCreate','⚔','สร้างห้องดวล','สำหรับครู / จอกลาง','hot')}
      ${menuCard('mJoin','🔑','เข้าร่วมห้อง','ใส่รหัสห้องและรหัสผ่าน','hot')}
      ${menuCard('mPrac','🎓','ฝึกหัดการเล่น','เรียนกติกาทีละขั้น ไม่จับเวลา')}
      ${menuCard('mGloss','📖','คลังคำ','รากศัพท์ คำอ่าน ความหมาย')}
      ${menuCard('mRep','📊','รายงานผล','ผลการตอบย้อนหลัง · ดาวน์โหลด CSV')}
      ${menuCard('mRules','📜','กติกา','อ่านกติกาทั้งหมด')}
      ${menuCard('mOff','🖥','เล่นเครื่องเดียว','สองทีมแตะเล่นบนจอเดียว')}</div>`;
  showLanding(`${heroHTML()}${user}${err?`<p class="note err">${esc(err)}</p>`:''}${body}${landFoot()}`);
  bindCommon();
  const on = (id, f) => { const b = document.getElementById(id); if(b) b.onclick = f; };
  on('mCreate', () => showHome('', 'create'));
  on('mJoin', () => showHome('', 'join'));
  on('bBack', () => { history.replaceState(null, '', location.pathname); qs.delete('room'); showHome(); });
  on('bJoin', () => joinRoom(document.getElementById('jCode').value.trim(), document.getElementById('jPw').value.trim()));
  on('bCreate', () => createRoom(document.getElementById('cPw').value.trim(), document.getElementById('rA').checked ? 'A' : null, document.getElementById('cExp').checked, document.getElementById('cRot').checked));
  const bl = document.getElementById('bLast'); if(bl) bl.onclick = e => { e.preventDefault(); joinRoom(last.code, last.pw); };
  if(pre && qs.get('pw') && panel === 'join' && !err) joinRoom(pre, qs.get('pw'));
}
function busy(t){ showLanding(`${heroHTML()}<div class="ph-wait">${esc(t)}</div>`); }

/* ---------- สร้าง / เข้าร่วมห้อง ---------- */
async function createRoom(pw, seat, exp, rot=true){
  if(pw.length < 4) return showHome('รหัสผ่านห้องต้องมีอย่างน้อย 4 ตัวอักษร', 'create');
  busy('กำลังสร้างห้อง…');
  try{
    let code = null;
    for(let i=0;i<8 && !code;i++){
      const c = String(100000 + Math.floor(Math.random()*900000));
      const r = await DB.ref(`rooms/${c}/info`).transaction(cur => cur ? undefined : {host:USER.uid, hostName:myName(), exp:!!exp, rot:!!rot, createdAt:Date.now()});
      if(r.committed) code = c;
    }
    if(!code) throw new Error('สร้างรหัสห้องไม่สำเร็จ ลองใหม่');
    ROOM = code; ROOM_PW = pw;
    const h = await pwHash(code, pw);
    await rr('secret').set({pwHash:h});
    await rr('members/' + USER.uid).set(h);
    await rr('names/' + USER.uid).set(myName());
    if(seat) await joinTeam(seat);
    saveLast(); enterRoom();
  }catch(e){ ROOM = null; showHome('สร้างห้องไม่สำเร็จ: ' + fbErr(e), 'create'); }
}
async function joinRoom(code, pw){
  if(!/^\d{6}$/.test(code)) return showHome('รหัสห้องต้องเป็นตัวเลข 6 หลัก', 'join');
  busy('กำลังเข้าห้อง…');
  try{
    const h = await pwHash(code, pw);
    await DB.ref(`rooms/${code}/members/${USER.uid}`).set(h);
    ROOM = code; ROOM_PW = pw;
    await rr('names/' + USER.uid).set(myName());
    saveLast(); enterRoom();
  }catch(e){ ROOM = null; showHome('เข้าห้องไม่สำเร็จ: ' + fbErr(e), 'join'); }
}
async function joinTeam(k){
  try{ await rr(`teams/${k}/${USER.uid}`).set(firebase.database.ServerValue.TIMESTAMP); }
  catch(e){ throw new Error(/permission/i.test(e.code||e.message||'') ? 'เข้าทีมไม่ได้ — ถ้าเพิ่งอัปเดตเกม ครูต้องอัปเดต Rules ของฐานข้อมูลใน Firebase ด้วย (ดูคู่มือ)' : fbErr(e)); }
}
const gameRunning = () => IS_HOST ? !!(state && !state.winner) : !!(S && !S.none && !S.win);
function leaveRoom(){
  offFns.forEach(f => f()); offFns = [];
  if(ROOM && MYSEAT && !gameRunning()) rr(`teams/${MYSEAT}/${USER.uid}`).remove().catch(()=>{});
  try{ localStorage.removeItem('fusion-duel-last'); }catch(e){}
  location.href = location.pathname;
}
function listen(path, cb, ev='value', onErr){
  const ref = rr(path);
  const fn = ref.on(ev, cb, e => { console.warn(path, e); onErr && onErr(e); });
  const off = () => ref.off(ev, fn);
  offFns.push(off); return off;
}

/* ---------- เข้าห้องแล้ว: ล็อบบี้ ---------- */
async function enterRoom(){
  ROOMINFO = (await rr('info').once('value')).val();
  IS_HOST = ROOMINFO && ROOMINFO.host === USER.uid;
  history.replaceState(null, '', `?room=${ROOM}`);
  listen('teams', s => {
    TEAMS = s.val() || {};
    MYSEAT = ['A','B'].find(k => TEAMS[k] && TEAMS[k][USER.uid]) || null;
    if(IS_HOST && state){ state.teamA.name = teamName('A'); state.teamB.name = teamName('B'); }
    onRoomChange();
  });
  listen('ready', s => { READY = s.val() || {}; onRoomChange(); });
  listen('names', s => { NAMES = s.val() || {}; onRoomChange(); });
  DB.ref('.info/connected').on('value', s => { phoneConn = s.val() ? 'ok' : 'lost'; if(MODE==='P' && S) renderPhone(); });
  if(IS_HOST){
    const saved = loadSave();
    if(saved && saved.state && saved.state.sandhiZone && saved.state.sandhiZone.piles){
      state = saved.state; uidN = saved.uidN || 500; state.pending = null; pendingCb = null; state.phase = 'PREPARATION';
      say('ดำเนินเกมเดิมต่อ'); startTimer();
    }
    listen('actions', snap => { const d = snap.val(); snap.ref.remove().catch(()=>{}); onAction(d); }, 'child_added');
    setInterval(() => { if(state) syncNow(); }, 4000);
  } else {
    listen('public', s => { pubCache = s.val(); composeS(); });
  }
  onRoomChange();
}
let privListening = null;
function onRoomChange(){
  if(!ROOM) return;
  phoneOn = {A: rosterOf('A').length > 0, B: rosterOf('B').length > 0};
  if(!IS_HOST && MYSEAT && privListening !== MYSEAT){
    /* ต่อการ์ดในมือของทีมเรา — ถ้าเซิร์ฟเวอร์ยังไม่ยืนยันการเข้าทีม (ปฏิเสธสิทธิ์อ่าน) ให้ลองใหม่อัตโนมัติ */
    privListening = MYSEAT;
    const seatNow = MYSEAT;
    listen('private/' + seatNow, s => { privCache = s.val(); composeS(); }, 'value', () => {
      privListening = null; privCache = null;
      setTimeout(() => { if(MYSEAT === seatNow) onRoomChange(); }, 1500);
    });
  }
  if(!IS_HOST && !MYSEAT){ privListening = null; privCache = null; }
  if(IS_HOST && !state && phoneOn.A && phoneOn.B && READY.A && READY.B) return hostStart();
  const started = IS_HOST ? !!state : !!(pubCache && pubCache.j && !JSON.parse(pubCache.j).none);
  if(!started) return showLobby();
  closeScr();
  if(IS_HOST && !MYSEAT){ MODE = 'TV'; document.body.classList.remove('phone'); render(); }
  else { goPhone(); if(IS_HOST) render(); else renderPhone(); }
}
function showLobby(){
  const teamBox = k => {
    const r = rosterOf(k), mine = MYSEAT === k;
    return `<div class="seat ${k} ${r.length?'taken':''} ${mine?'mine':''}">
      <div class="tm">ทีม ${k}</div>
      <div class="members">${r.map((u,i) => `<span class="mem ${u===USER.uid?'me':''}">${i===0?'👑 ':''}${esc(shortName(u))}${u===USER.uid?' (คุณ)':''}${IS_HOST && u!==USER.uid?` <a href="#" data-l="kick${k}:${u}" title="ให้ออก">✕</a>`:''}</span>`).join('') || '<span class="zhint">ยังไม่มีสมาชิก</span>'}</div>
      <div class="rd ${READY[k]?'on':''}">${READY[k] ? '✅ ทีมพร้อมแล้ว' : r.length ? '⏳ ยังไม่พร้อม' : ''}</div>
      ${!MYSEAT && !IS_HOST ? `<button class="btn ${k==='A'?'teamA':'teamB'}" data-l="sit${k}">เข้าร่วมทีม ${k}</button>` : ''}
      ${mine ? `<button class="btn ${READY[k]?'ghost':'summon'}" data-l="rdy${k}">${READY[k]?'ยกเลิกพร้อม':'ทีมเราพร้อม ✔'}</button><button class="btn ghost sm" data-l="up${k}">ออกจากทีม</button>` : ''}
    </div>`;
  };
  const link = joinLink(ROOM);
  showScr(`${LOGO()}
    <div class="lobbyhead"><div><div class="zhint">รหัสห้อง</div><div class="code">${ROOM}</div></div>
      ${IS_HOST ? `<div><div class="zhint">รหัสผ่าน</div><div class="code pw">${esc(ROOM_PW)}</div></div>` : ''}
      <div class="qr" id="lobbyQR"></div></div>
    <p class="note" style="text-align:center">สแกน QR หรือเปิด <b>${esc(link)}</b> แล้วใส่รหัสผ่าน · <b>เข้าทีมได้หลายคน (หลายเครื่อง)</b> · กด “ทีมเราพร้อม” — เกมเริ่มเมื่อทั้งสองทีมพร้อม</p>
    <div class="seats">${teamBox('A')}<div class="vs">VS</div>${teamBox('B')}</div>
    <p class="note" style="text-align:center">${IS_HOST ? (MYSEAT ? 'คุณเป็นเจ้าของห้องและอยู่ทีม ' + MYSEAT : 'เครื่องนี้เป็นจอกลาง — ฉายขึ้นทีวีได้เลย') : 'ผู้สร้างห้อง: ' + esc(ROOMINFO ? ROOMINFO.hostName : '')}
      · ในเกม: 👑 ผู้คุมการ์ด${ROOMINFO && ROOMINFO.rot===false?'คือคนแรกของทีม':'หมุนเวียนทุกเทิร์น'} · ✋ ผู้ตอบคำถามหมุนเวียนทุกข้อ · การ์ดในมือเห็นเฉพาะทีมตัวเอง</p>
    <div class="mfoot"><button class="btn ghost" data-l="leave">ออกจากห้อง</button></div>`);
  scrEl.onclick = lobbyClick;
  drawQR('lobbyQR', link, 170);
}
async function lobbyClick(e){
  const b = e.target.closest('[data-l]'); if(!b) return;
  e.preventDefault();
  const v = b.dataset.l, k = v.startsWith('kick') ? v[4] : v.slice(-1);
  try{
    if(v.startsWith('sit')) await joinTeam(k);
    if(v.startsWith('rdy')) await rr('ready/' + k).set(!READY[k]);
    if(v.startsWith('up')){ if(rosterOf(k).length <= 1) await rr('ready/' + k).remove(); await rr(`teams/${k}/${USER.uid}`).remove(); }
    if(v.startsWith('kick')){ const u = v.split(':')[1]; await rr(`teams/${k}/${u}`).remove(); }
    if(v === 'leave') leaveRoom();
  }catch(err){ alertBox(err.message || fbErr(err)); }
}
function alertBox(t){ const n = document.querySelector('.scr .note'); if(n){ n.textContent = t; n.style.color = '#ffb4c4'; } }
function hostStart(){
  newGame(teamName('A'), teamName('B'), !!(ROOMINFO && ROOMINFO.exp));
  onRoomChange();
}
function loadQR(){
  return new Promise(res => {
    if(window.QRCode) return res(true);
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s);
  });
}
async function drawQR(id, text, size){
  if(!(await loadQR())) return;
  const el = document.getElementById(id); if(!el) return;
  el.innerHTML = ''; new QRCode(el, {text, width:size, height:size});
}
function showRoomPanel(){
  if(!ROOM) return showSetup();
  const list = k => rosterOf(k).map(u => `${u===controllerOf(k)?'👑 ':''}${esc(shortName(u))}`).join(', ') || '—';
  openModal(`<h2>🔑 ห้อง ${ROOM}</h2>
    <div class="lobbyhead"><div><div class="zhint">รหัสห้อง</div><div class="code">${ROOM}</div></div>
      ${IS_HOST?`<div><div class="zhint">รหัสผ่าน</div><div class="code pw">${esc(ROOM_PW)}</div></div>`:''}<div class="qr" id="panelQR"></div></div>
    <p>ทีม A: <b>${list('A')}</b><br>ทีม B: <b>${list('B')}</b></p>
    <p class="note">นักเรียนเข้าทีมเพิ่มระหว่างเกมได้: สแกน QR → ใส่รหัสผ่าน → เลือกทีม · ถ้ามือถือหลุด ให้เข้าห้องเดิมด้วยบัญชีเดิม</p>
    <div class="mfoot"><button class="btn ghost" onclick="leaveRoom()">ปิดห้อง / ออก</button><button class="btn" onclick="closeModal()">ปิด</button></div>`);
  drawQR('panelQR', joinLink(ROOM), 150);
}

/* ---------- บทบาทในทีม: 👑 ผู้คุมการ์ด (หมุนเวียนทุกเทิร์น) · ✋ ผู้ตอบคำถาม (หมุนเวียนทุกข้อ) ---------- */
function controllerOf(k){
  if(!ROOM || !state) return null;
  const r = rosterOf(k); if(!r.length) return null;
  const off = (state.ctlOff || {})[k] || 0;
  const n = (ROOMINFO && ROOMINFO.rot === false) ? off : Math.floor((state.turnNo - 1) / 2) + off;
  return r[n % r.length];
}
function rotateController(k){
  state.ctlOff = state.ctlOff || {}; state.ctlOff[k] = (state.ctlOff[k] || 0) + 1;
  say(`👑 ผู้คุมการ์ดทีม ${k} คนใหม่: ${nameOf(controllerOf(k))}`);
}
function assignAnswerer(p, manual=false){
  if(!ROOM || !state || !p) return;
  const k = p.team, r = rosterOf(k); if(!r.length) return;
  state.ansIdx = state.ansIdx || {A:0, B:0};
  const ctl = controllerOf(k);
  let u = null;
  for(let i = 0; i < r.length; i++){
    u = r[(state.ansIdx[k]++) % r.length];
    if(r.length < 2 || u !== ctl) break;
  }
  p.au = u; p.an = nameOf(u);
  if(pendingCb && state.pending === p) pendingCb.at = Date.now();
  if(manual) say(`✋ เปลี่ยนผู้ตอบ: ${p.an}`);
}
function onTurnStart(){
  if(state.practice) return tutTurnStart();
  if(!ROOM) return;
  const r = rosterOf(state.turn);
  if(r.length > 1){ const c = controllerOf(state.turn); say(`${msg.text} · 👑 ${nameOf(c)} คุมการ์ด`); }
}
function ctlHTML(){
  if(!ROOM || !state) return '';
  return `<div class="ctlline">${['A','B'].map(k => { const c = controllerOf(k); return c ? `<span class="${k}">👑 ${k}: ${esc(shortName(c))}</span>` : ''; }).join(' ')}</div>`;
}

/* ---------- โฮสต์: ส่งสถานะ / รับคำสั่ง ---------- */
function snapshot(){
  if(!state) return {none:true};
  const T = t => ({ n:t.name, h:t.hand.map(c=>[c.uid,c.name,c.revealedUntil?1:0]), f:t.fusionZone.map(c=>c?[c.uid,c.name]:null), lk:[0,1].map(i=>isLocked(t,i)?1:0),
    s:t.sandhiSlot?(t.sandhiSlot.mtype||'vowel_sandhi'):0, c:t.completedZone.map(x=>x?x.cid:null), cu:t.completedZone.map(x=>x&&x.used?1:0), x:t.extraDeck.length, xc:t.extraDeck.map(x=>x.cid), m:t.mainDeck.length,
    d:t.discard.length, dt:t.discard.length?t.discard[t.discard.length-1].name:null, df:t.defenses.map(d=>DEF_LABEL[d.kind]) });
  return { turn:state.turn, turnNo:state.turnNo, round:state.round, phase:state.phase, hd:state.hasDrawn?1:0, sm:state.summoned||state.summonLost?1:0,
    win:state.winner, exp:state.exp?1:0, tl:state.timeLeft, tt:state.turnLeft, pz:state.paused?1:0, pr:state.practice?1:0, sz:Object.fromEntries(MTYPES.map(mt=>[mt,pileCount(mt)])),
    ct:{A:controllerOf('A'), B:controllerOf('B')}, hs:(state.history||[]).map(h=>[h.k,h.cid]),
    msg:msg.text, tone:msg.tone, p:state.pending, A:T(state.teamA), B:T(state.teamB) };
}
/* สนามสาธารณะ: ปิดชื่อการ์ดในมือ (ยกเว้นใบที่ถูกเปิดเผย) และตัวเลือกที่เป็นความลับ */
function publicSnap(){
  const s = snapshot(); if(s.none) return s;
  ['A','B'].forEach(k => { s[k].h = s[k].h.map(c => c[2] ? c : [c[0], null, 0]); });
  if(s.p && s.p.type === 'choose' && s.p.opts.some(o => o.root)) s.p = {...s.p, opts: s.p.opts.map(() => ({back: s.p.team}))};
  return s;
}
function privFor(k){
  const t = team(k);
  return { h: t.hand.map(c=>[c.uid,c.name,c.revealedUntil?1:0]), p: state.pending && state.pending.team === k ? state.pending : null };
}
let syncT = null;
function scheduleSync(){ clearTimeout(syncT); syncT = setTimeout(syncNow, 60); }
function syncNow(){
  if(MODE === 'P' && !IS_HOST) return;
  if(state && !state.practice){ try{ localStorage.setItem(SAVE_KEY + (ROOM?'-'+ROOM:''), JSON.stringify({state, uidN})); }catch(e){} }
  if(!ROOM || !IS_HOST || !DB) return;
  const t = Date.now();
  rr('public').set({j: JSON.stringify(publicSnap()), t}).catch(e => console.warn(e));
  if(state){ ['A','B'].forEach(k => rr('private/' + k).set({j: JSON.stringify(privFor(k)), t}).catch(e => console.warn(e))); }
}
/* ตรวจสิทธิ์: ต้องเป็นสมาชิกทีม · ตอบคำถามได้เฉพาะ ✋ ผู้ตอบ · การกระทำอื่นเฉพาะ 👑 ผู้คุมการ์ด */
function onAction(d){
  if(!d || !state) return;
  if(d.team !== 'A' && d.team !== 'B') return;
  if(ROOM){
    if(!(TEAMS[d.team] && TEAMS[d.team][d.uid])) return;
    const p = state.pending;
    if(d.a === 'answer'){ if(p && p.au && p.au !== d.uid) return; }
    else { const c = controllerOf(d.team); if(c && c !== d.uid){ say(`ทีม ${d.team}: เทิร์นนี้ ${nameOf(c)} เป็นผู้คุมการ์ด`, 'bad'); return render(); } }
  }
  handleRemote({data:d});
}
function handleRemote(m){
  const d = m.data || {}; const tk = d.team;
  if(!state || (tk !== 'A' && tk !== 'B')) return;
  const p = state.pending;
  switch(d.a){
    case 'choose': if(p && p.type==='choose' && p.team===tk) answerChoose(+d.i); return;
    case 'offer':  if(p && p.type==='offer' && p.team===tk) answerOffer(!!d.use); return;
    case 'counter': if(p && p.type==='counter' && p.team===tk) answerCounter(d.i == null ? -1 : +d.i); return;   // เฉพาะทีมที่ถูกโจมตี
    case 'answer': if(p && p.type==='question' && p.team===tk && !p.revealed) answerQuestion('pick', +d.i); return;   // ตอบได้เฉพาะทีมผู้อัญเชิญ
  }
  if(state.winner) return;
  if(tk !== state.turn){ say(`ทีม ${tk}: ยังไม่ถึงตาของคุณ`, 'bad'); return render(); }
  switch(d.a){
    case 'draw': return act('main', tk);
    case 'place': state.selected = d.u; return act('fusion', tk, String(+d.s));
    case 'unplace': state.selected = null; return act('fusion', tk, String(+d.s));
    case 'discard': state.selected = d.u; return act('discard', tk);
    case 'cast': return act('sandhiZone', null, d.m);
    case 'uncast': return act('sandhiSlot', tk);
    case 'summon': return act('summon');
    case 'end': return act('endturn');
  }
}
/* โฮสต์ที่เป็นผู้เล่นด้วย (หรือโหมดฝึกหัดบนมือถือ): แสดงมุมมองผู้เล่นจากสถานะในเครื่อง */
function hostPlayerView(){
  if(!(IS_HOST && MYSEAT && state)) return;
  const pub = publicSnap(), pv = privFor(MYSEAT);
  pub[MYSEAT].h = pv.h; if(pv.p) pub.p = pv.p;
  S = pub; lastStateAt = Date.now(); renderPhone();
}

/* =====================================================================
   4) มุมมองผู้เล่น (มือถือแนวตั้ง)
   ===================================================================== */
function composeS(){
  if(!pubCache || !pubCache.j) { S = null; return onRoomChange(); }
  try{
    const pub = JSON.parse(pubCache.j);
    if(!pub.none && MYSEAT && privCache && privCache.j){
      const pv = JSON.parse(privCache.j);
      pub[MYSEAT].h = pv.h; if(pv.p) pub.p = pv.p;
    }
    S = pub; lastStateAt = Date.now();
  }catch(e){ console.warn(e); }
  if(S && !S.none && MYSEAT && phoneSel && !S[MYSEAT].h.some(c=>c[0]===phoneSel)) phoneSel = null;
  if(document.getElementById('scr').innerHTML && !S.none) return onRoomChange();
  renderPhone();
}
function goPhone(){
  MODE = IS_HOST ? 'TV' : 'P'; ME = MYSEAT;
  document.body.classList.add('phone'); document.documentElement.style.overflow = 'auto';
}
function pEmit(data){
  if(IS_HOST) return ROOM ? onAction({team:MYSEAT, uid:USER.uid, ...data}) : handleRemote({data:{team:MYSEAT, ...data}});
  if(!MYSEAT) return;
  rr('actions').push({team:MYSEAT, uid:USER.uid, ...data, t:firebase.database.ServerValue.TIMESTAMP}).catch(e => { phoneConn = 'lost'; renderPhone(); });
}
function renderPhone(){
  const el = document.getElementById('phone');
  if(!ME){ el.innerHTML = `<div class="ph-wait">${LOGO()}คุณยังไม่ได้อยู่ทีมไหน — เลือกทีมเพื่อเข้าร่วมเล่น<br><br>
      <div class="ph-act"><button class="btn teamA" onclick="joinTeam('A').catch(e=>alert(e.message))">เข้าร่วมทีม A</button><button class="btn teamB" onclick="joinTeam('B').catch(e=>alert(e.message))">เข้าร่วมทีม B</button></div><br>
      <button class="btn ghost" onclick="leaveRoom()">ออกจากห้อง</button></div>`; lastPhoneHTML = ''; return; }
  const head = (st, cls) => `<div class="ph-head ${ME}"><span class="tn">ทีม ${ME}</span><span>${S&&S[ME]?esc(S[ME].n):''}</span><span class="st ${cls||''}">${st}</span>
    ${S&&!S.none?`<span class="sub">${S.pr?'🎓 ฝึกหัด':`<b class="ptt" id="ptt">⌛</b>`} · ★ ทีม A ${S.A.c.filter(Boolean).length}/4 · ทีม B ${S.B.c.filter(Boolean).length}/4${S.pr?'':` · ⏱ <span id="ptl"></span>${S.pz?' ⏸':''}`} · รอบ ${S.round}${ROOM?' · ห้อง '+ROOM:''}</span>`:''}</div>`;
  const diag = ROOM ? `<div class="zhint" style="text-align:center;margin-top:16px">เวอร์ชัน ${APP_VER} · ห้อง ${ROOM} · ${phoneConn==='ok'?'🟢 ออนไลน์':'🔴 ขาดการเชื่อมต่อ'} · ${esc(myName())} · <a href="#" onclick="showGlossary();return false">📖 คลังคำ</a> · <a href="#" onclick="leaveRoom();return false">ออกจากห้อง</a></div>`
    : `<div class="zhint" style="text-align:center;margin-top:16px">เวอร์ชัน ${APP_VER} · <a href="#" onclick="showGlossary();return false">📖 คลังคำ</a> · <a href="#" onclick="tutExit();return false">ออกจากโหมดฝึกหัด</a></div>`;
  if(!S || S.none){ el.innerHTML = head('รอเริ่มเกม') + `<div class="ph-wait">รอให้ทั้งสองทีมกดพร้อม…</div>` + diag; return; }
  const me = S[ME], o = S[other(ME)], OK = other(ME), p = S.p;
  const ctl = S.ct && S.ct[ME], iCtl = !ROOM || !ctl || ctl === myUid();
  const myTurn = S.turn === ME && iCtl, teamTurn = S.turn === ME;
  let html = head(S.win ? (S.win===ME?'🏆 ชนะ!':'จบเกม') : myTurn ? '▶ ตาของคุณ' : teamTurn ? '▶ ตาทีมเรา' : `รอทีม ${S.turn}`, teamTurn && !S.win ? 'go' : '');
  if(ROOM && ctl && !S.win) html += `<div class="ph-role ${iCtl?'me':''}">${iCtl ? '👑 คุณเป็น <b>ผู้คุมการ์ด</b> ของทีมในเทิร์นนี้' : `👑 ผู้คุมการ์ดทีมเรา: <b>${esc(nameOf(ctl))}</b> — ช่วยกันวางแผน แต่ให้ผู้คุมเป็นคนกด`}</div>`;
  const smallComp = (arr, cu=[]) => arr.map((cid,i)=> cid ? `<div class="card click ${cu[i]?'used':''}" data-m="z:${cid}">${compFaceHTML(COMP[cid])}${isDefense(COMP[cid])?`<span class="dtag ${cu[i]?'off':''}">${cu[i]?'ใช้แล้ว':'🛡'}</span>`:''}</div>` : `<div class="slot cslot"><span></span></div>`).join('');
  const revealed = o.h.filter(c=>c[2]);
  html += S.pr ? `<div class="ph-timer prac"><div class="lbl">🎓 โหมดฝึกหัด — ไม่จับเวลา (เกมจริงเทิร์นละ 45 วินาที)</div></div>`
    : `<div class="ph-timer ${teamTurn?'me':''}"><div class="lbl">${S.win?'จบเกม':teamTurn?'⏳ เวลาเทิร์นของเรา':'⏳ เวลาเทิร์นทีม '+S.turn}</div>
    <div class="num" id="ptt2"></div><div class="tbar"><i id="ptbar"></i></div>
    ${teamTurn && !S.win ? `<div class="zhint">${S.sm?'✔ อัญเชิญแล้วในเทิร์นนี้ (ได้เทิร์นละ 1 ใบ) — กดจบเทิร์นได้เลย':'อัญเชิญคำสมบูรณ์ได้ 1 ใบ · หมดเวลาจะจบเทิร์นอัตโนมัติ'}</div>`:''}</div>`;
  html += `<section class="ph-side opp ${OK}">
    <div class="ph-tt"><span class="tm">ทีม ${OK}</span>${esc(o.n)} <span class="r">★ ${o.c.filter(Boolean).length}/4</span></div>
    <div class="ph-xrow"><div class="card pile click" data-m="xopp" style="--cw:40px">${backFaceHTML('X')}<span class="count">${o.x}</span></div><span class="zhint">Extra Deck ${OK} · แตะเพื่อดูคำที่ยังอัญเชิญได้</span></div>
    <div class="ph-backs">${o.h.map(c=> c[2] ? `<div class="card" style="--cw:30px">${rootFaceHTML(c[1])}<span class="tag">👁</span></div>` : `<div class="card" style="--cw:30px">${backFaceHTML(OK)}</div>`).join('')}<span class="zhint">มือ ${o.h.length}${revealed.length?` · เปิดเผย ${revealed.map(c=>esc(c[1])).join(', ')}`:''}</span></div>
    <div class="ph-lbl">คำสมบูรณ์ ${OK}</div><div class="ph-row cmp">${smallComp(o.c, o.cu)}</div>
    <div class="ph-lbl">รากศัพท์ที่วางเตรียม ${OK}</div><div class="ph-row fus">${o.f.map((c,i)=> c ? `<div class="card click" data-m="zr:${esc(c[1])}">${rootFaceHTML(c[1])}</div>` : (o.lk&&o.lk[i] ? `<div class="slot locked">🔒</div>` : `<div class="slot">ว่าง</div>`)).join('')}${o.s?`<div class="card mcard">${magicFaceHTML(o.s)}</div>`:''}</div>
    ${o.df.length?`<div class="zhint">${o.df.join(' ')}</div>`:''}
  </section>`;
  html += `<div class="ph-mid"><div class="phases">${PHASES.map(([k,l])=>`<span class="${S.phase===k?'on':''}">${l}</span>`).join('')}</div>
    <div class="ph-msg ${S.tone||''}">${esc(S.msg||'')}</div>
    <div class="ph-act xbtns"><button class="btn" data-m="xme">📜 Extra Deck ของเรา (${me.x})</button><button class="btn ghost" data-m="xopp">📜 Extra Deck ทีม ${OK} (${o.x})</button></div>
    <div class="ph-lbl">กองกลาง · เวทสนธิ (ใช้ร่วมกัน)${myTurn && !me.s && !p ? ' — แตะเพื่อร่าย' : ''}</div>
    <div class="ph-magic">${MTYPES.map(mt => { const n = S.sz[mt]||0, can = myTurn && !me.s && !p && n;
      return `<figure>${n ? `<div class="card pile ${can?'click':''}" ${can?`data-m="cast:${mt}"`:''}>${magicFaceHTML(mt)}<span class="count">${n}</span></div>` : `<div class="slot mslot">ว่าง</div>`}<figcaption>${esc(magicName(mt))}</figcaption></figure>`; }).join('')}</div></div>`;
  html += `<section class="ph-side me ${ME}">
    <div class="ph-lbl">รากศัพท์ที่วางเตรียม (แตะเพื่อคืนขึ้นมือ)</div>
    <div class="ph-row fus big">${me.f.map((c,i)=> c ? `<div class="card ${me.f.every(Boolean)?'linked':''}" data-m="un${i}" data-zr="${esc(c[1])}">${rootFaceHTML(c[1])}</div>` : (me.lk&&me.lk[i] ? `<div class="slot locked">🔒<br>ล็อก</div>` : `<div class="slot ${phoneSel?'target':''}" data-m="pl${i}">ช่อง ${i+1}</div>`)).join('')}
      ${me.s ? `<div class="card mcard" data-m="uncast">${magicFaceHTML(me.s)}</div>` : `<div class="slot mslot" data-m="castmenu">แตะเพื่อ<br>ร่ายเวท<br>สนธิ</div>`}</div>
    <div class="ph-lbl">Extra Deck ${ME} และคำสมบูรณ์ของเรา ★ ${me.c.filter(Boolean).length}/4</div>
    <div class="ph-row cmp"><div class="card pile click xpile" data-m="xme">${backFaceHTML('X')}<span class="count">${me.x}</span></div>${smallComp(me.c, me.cu)}</div>
    <div class="zhint">สำรับ ${me.m} · กองทิ้ง ${me.d}${me.dt?` (บนสุด: ${esc(me.dt)})`:''} · Extra Deck ${me.x}${me.df.length?` · ${me.df.join(' ')}`:''}</div>
    <div class="ph-tt" style="margin-top:8px"><span class="tm">มือทีม ${ME}</span>${me.h.length} ใบ ${phoneSel?'<span class="r">เลือกแล้ว — แตะช่องว่างด้านบน</span>':'<span class="r">แตะการ์ดเพื่อเลือก</span>'}</div>
    <div class="ph-hand ${me.h.length && me.h.length<=6?'fan n'+me.h.length:''}">${me.h.map((c,i)=>`<div class="card ${phoneSel===c[0]?'sel':''}" style="--i:${i - (me.h.length-1)/2}" data-m="h${c[0]}" data-zr="${esc(c[1])}">${rootFaceHTML(c[1])}${c[2]?'<span class="tag">👁</span>':''}</div>`).join('') || '<span class="zhint">ไม่มีการ์ด</span>'}</div>
    <div class="zhint" style="text-align:center">แตะเพื่อเลือก · กดค้างเพื่อขยายดูการ์ด</div>
  </section>`;
  let sheet = '';
  if(false){
  } else if(p){
    if(p.type === 'question'){
      const ours = p.team === ME, mine = ours && (!ROOM || !p.au || p.au === myUid());
      const who = ours ? (p.au && ROOM ? (mine ? '✋ <b>คุณเป็นผู้ตอบข้อนี้!</b> (ปรึกษาทีมได้)' : `✋ ผู้ตอบ: <b>${esc(p.an||'')}</b> — ช่วยกันคิดได้ แต่ให้ผู้ตอบเป็นคนกด`) : 'ทีมเราตอบ') : 'ทีม '+p.team+' ตอบ';
      sheet = `<h4>คำถาม ${p.i+1}/${p.n} · ${who}</h4><div class="qt">${esc(p.q)}</div>
        <div class="qopts">${p.opts.map((o,i)=>{ let cls=''; if(p.revealed){ if(i===p.ci) cls='ok'; else if(i===p.picked) cls='no'; }
          return `<button class="btn qo ${cls}" ${mine && !p.revealed ? `data-m="qa${i}"` : ''}>${esc(o)}</button>`; }).join('')}</div>
        ${p.revealed ? `<div class="ph-msg ${p.correct?'good':'bad'}">${p.correct?'✓ ถูกต้อง!':'✗ ยังไม่ถูก — คำตอบคือ “'+esc(p.a)+'”'}</div>${p.ex?`<div class="qex">💡 ${esc(p.ex)}</div>`:''}` : mine ? '' : `<div class="zhint">${ours?'รอผู้ตอบเลือกคำตอบ…':'รอคู่แข่งตอบ…'}</div>`}`;
    }
    else if(p.type === 'offer' && p.team === ME && iCtl){ const c = COMP[p.cid];
      sheet = `<h4>ใช้เอฟเฟค “${esc(c.effect.name)}” ?</h4><div class="zhint">${esc(c.effect.description)}</div>
        <div class="ph-act"><button class="btn ghost" data-m="offer0">ไม่ใช้</button><button class="btn summon" data-m="offer1">ใช้ (ตอบคำถาม)</button></div>`; }
    else if(p.type === 'counter' && p.team === ME && iCtl)
      sheet = `<h4>🛡 ${esc(p.title)}</h4><div class="zhint">แตะการ์ดป้องกันเพื่อใช้ (ใช้แล้วหมดสิทธิ์) · เหลือ <b id="pct"></b> วินาที</div>
        <div class="mgrid">${p.opts.map((cid,i)=>`<figure><div class="card pick" data-m="ct${i}">${compFaceHTML(COMP[cid])}</div><figcaption>${esc(COMP[cid].name)}<br><small>${esc(DEFENSE[COMP[cid].effect.op].label)}</small></figcaption></figure>`).join('')}</div>
        <div class="ph-act"><button class="btn ghost" data-m="ctnone">ไม่ป้องกัน</button></div>`;
    else if(p.type === 'counter')
      sheet = `<h4>⚔️ รอ${p.team===ME?'ผู้คุมการ์ดทีมเรา':'ทีม '+p.team} ตัดสินใจป้องกัน…</h4><div class="zhint">“${esc(p.atk)}” · เหลือ <b id="pct"></b> วินาที</div>`;
    else if(p.type === 'choose' && p.team === ME && iCtl)
      sheet = `<h4>${esc(p.title)}</h4><div class="zhint">${esc(p.sub)}</div><div class="mgrid">${p.opts.map((o,i)=>`<div class="card pick" data-m="ch${i}">${optFace(o)}</div>`).join('')}</div>`;
    else sheet = `<h4>รอทีม ${p.team}…</h4><div class="zhint">${esc(p.title||'')}</div>`;
  } else if(castMenu && myTurn){
    sheet = `<h4>เลือกเวทสนธิจากกองกลาง</h4><div class="mgrid">${MTYPES.map(mt=>`<figure><div class="card pick" data-m="cast:${mt}" style="${S.sz[mt]?'':'opacity:.35'}">${magicFaceHTML(mt)}</div><figcaption>${esc(magicName(mt))} (${S.sz[mt]||0})</figcaption></figure>`).join('')}</div>
      <div class="ph-act"><button class="btn ghost" data-m="castmenu">ยกเลิก</button></div>`;
  } else if(phoneSel && myTurn){
    const nm = (me.h.find(c=>c[0]===phoneSel)||[])[1] || '';
    sheet = `<h4>“${esc(nm)}”</h4><div class="ph-act"><button class="btn" data-m="pl0">วางช่อง 1</button><button class="btn" data-m="pl1">วางช่อง 2</button><button class="btn no" data-m="disc">ทิ้ง</button><button class="btn ghost" data-m="zr:${esc(nm)}">🔍 ขยาย</button><button class="btn ghost" data-m="h${phoneSel}">ยกเลิก</button></div>`;
  }
  if(S.win) sheet = `<h4>${S.win===ME?'🏆 ทีมเราชนะ!':'จบเกม — ทีม '+S.win+' ชนะ'}</h4><div class="zhint">📖 คำที่อัญเชิญในเกมนี้ — ทบทวนหลักการก่อนคุยกับครู</div>
    <div class="ph-recap">${(S.hs||[]).map(([k,cid]) => { const c = COMP[cid]; return c ? `<div class="rc ${k}"><b>${esc(c.name)}</b> <span class="zhint">${esc(c.reading||'')} · ทีม ${k}</span><div>${esc(cExplain(c))}</div></div>` : ''; }).join('') || '<span class="zhint">ไม่มี</span>'}</div>
    <div class="ph-act">${ROOM?'<button class="btn ghost" onclick="leaveRoom()">ออกจากห้อง</button>':'<button class="btn" onclick="tutExit()">กลับหน้าแรก</button>'}</div>`;
  if(sheet) html += `<div class="ph-sheet">${sheet}</div>`;
  if(teamTurn && !iCtl && !S.win) html += `<div class="ph-bar wait">👑 ${esc(nameOf(ctl))} กำลังคุมการ์ด…</div>`;
  html += myTurn && !S.win ? `<div class="ph-bar"><button class="btn" data-m="draw" ${S.hd?'disabled':''}>จั่ว</button><button class="btn summon" data-m="summon" ${S.sm?'disabled':''}>⚡ อัญเชิญ</button><button class="btn ghost" data-m="end">จบเทิร์น</button></div>` : '';
  const y = window.scrollY;
  const out = html + diag;
  if(out !== lastPhoneHTML){ el.innerHTML = out; lastPhoneHTML = out; window.scrollTo(0, y); }
  phoneTick();
  if(typeof afterRender === 'function' && !IS_HOST) afterRender();
}
let lastPhoneHTML = '';
/* นาฬิกาบนมือถือ: นับถอยหลังเองจากค่าล่าสุดที่ได้รับ — ไม่วาดหน้าจอใหม่ทั้งหน้าทุกวินาที (แก้อาการกระตุก) */
function phoneTick(){
  if(!S || S.none) return;
  const el = Math.floor((Date.now() - lastStateAt) / 1000), p = S.p, run = !S.win && !S.pz && !S.pr;
  const b = document.getElementById('pct');
  if(b && p && p.type === 'counter') b.textContent = Math.max(0, (p.left ?? 15) - (run ? el : 0));
  const tl = document.getElementById('ptl'); if(tl && S.tl != null) tl.textContent = fmtTime(Math.max(0, S.tl - (run ? el : 0)));
  if(S.tt == null) return;
  const frozen = !run || (p && p.type === 'counter') || (p && p.type === 'question' && p.revealed);
  const v = Math.max(0, S.tt - (frozen ? 0 : el));
  const a = document.getElementById('ptt'); if(a){ a.textContent = `⌛ ${v} วิ`; a.classList.toggle('low', v <= 10); }
  const n = document.getElementById('ptt2'); if(n){ n.textContent = v; n.parentElement.classList.toggle('low', v <= 10); }
  const bar = document.getElementById('ptbar'); if(bar) bar.style.width = (100*v/45) + '%';
}
setInterval(phoneTick, 1000);
/* หน้าต่างดู Extra Deck / การ์ด: แยกจากสนาม ไม่ถูกวาดใหม่ตอนข้อมูลเกมอัปเดต (จึงไม่กระตุก) · แตะพื้นที่ว่างรอบ ๆ เพื่อปิด */
let ovEl = null;
function renderOverlay(){
  if(!ovEl){
    ovEl = document.createElement('div'); ovEl.id = 'phov'; document.body.appendChild(ovEl);
    ovEl.addEventListener('click', e => {
      const b = e.target.closest('[data-o]');
      if(!b){ if(!e.target.closest('.ph-ovbox')) closeOverlay(); return; }
      const v = b.dataset.o;
      if(v === 'close') return closeOverlay();
      if(v === 'back'){ zoomCid = null; return xView ? renderOverlay() : closeOverlay(); }
      if(v.startsWith('z:')){ zoomCid = v.slice(2); return renderOverlay(); }
    });
  }
  if(!S || S.none || (!xView && !zoomCid && !zoomRoot)) return closeOverlay();
  let html = '';
  if(zoomRoot && ROOT[zoomRoot]){
    const r = ROOT[zoomRoot];
    const uses = GD.completedCards.filter(c => inRelease(c, S.exp ?? true) && c.rootNames.includes(r.name));
    html = `<div class="ph-zoom big"><div class="card">${rootFaceHTML(r.name)}</div><div><h4>${esc(r.name)}</h4>
      <div class="zhint"><span class="pill root">รากศัพท์</span></div>
      <div class="ph-eff">ความหมาย: <b>${esc(r.meaning)}</b></div></div></div>
      <div class="ph-act"><button class="btn" data-o="close">ปิด</button></div>`;
  } else if(zoomCid && COMP[zoomCid]){
    const c = COMP[zoomCid];
    html = `<div class="ph-zoom"><div class="card">${compFaceHTML(c)}</div><div><h4>${esc(c.name)}</h4>
      <div class="zhint"><span class="pill ${c.type}">${c.type==='samas'?'คำสมาส':'คำสนธิ'}</span> ${esc(c.rootNames.join(' + '))}${c.magic?' + เวท'+esc(magicName(c.magic)):''}</div>
      <div class="ph-eff"><b>${esc(c.effect.name)}</b><br>${esc(c.effect.description)}</div></div></div>
      <div class="ph-act">${xView?'<button class="btn ghost" data-o="back">← กลับไปรายการ</button>':''}<button class="btn" data-o="close">ปิด</button></div>`;
  } else {
    const tk = xView === 'me' ? ME : other(ME), list = (S[tk].xc || []);
    html = `<h4>Extra Deck ${tk} — คำที่ยังอัญเชิญได้ (${list.length})</h4><div class="zhint">แตะการ์ดเพื่อดูสูตรและเอฟเฟค · แตะพื้นที่ว่างเพื่อปิด</div>
      <div class="mgrid xgrid">${list.map(cid=>`<figure><div class="card pick" data-o="z:${cid}">${compFaceHTML(COMP[cid])}</div><figcaption>${esc(COMP[cid].name)}</figcaption></figure>`).join('') || '<span class="zhint">อัญเชิญครบแล้ว</span>'}</div>
      <div class="ph-act"><button class="btn" data-o="close">ปิด</button></div>`;
  }
  const keep = ovEl.querySelector('.ph-ovbox'), st = keep && !zoomCid ? keep.scrollTop : 0;
  ovEl.innerHTML = `<div class="ph-ov"><div class="ph-ovbox">${html}</div></div>`;
  if(st) ovEl.querySelector('.ph-ovbox').scrollTop = st;
  document.documentElement.classList.add('ov-open');
}
function closeOverlay(){
  xView = null; zoomCid = null; zoomRoot = null;
  if(ovEl) ovEl.innerHTML = '';
  document.documentElement.classList.remove('ov-open');
}
function phoneClick(e){
  const b = e.target.closest('[data-m]'); if(!b || b.disabled) return;
  const v = b.dataset.m;
  const ctl = S && S.ct && S.ct[ME];
  if(ROOM && ctl && ctl !== myUid() && /^(draw|summon|end|pl\d|un\d|uncast|cast|castmenu|disc|ch\d|ct|offer|h)/.test(v)){
    return toast(`👑 เทิร์นนี้ ${nameOf(ctl)} เป็นผู้คุมการ์ด — กดค้างที่การ์ดเพื่อขยายดูได้`);
  }
  if(v==='xme'||v==='xopp'){ xView = v==='xme'?'me':'opp'; zoomCid = null; return renderOverlay(); }
  if(v.startsWith('z:')){ zoomCid = v.slice(2); return renderOverlay(); }
  if(v.startsWith('zr:')){ zoomRoot = v.slice(3); xView = null; zoomCid = null; return renderOverlay(); }
  if(v==='castmenu'){ castMenu = !castMenu; phoneSel = null; return renderPhone(); }
  if(v.startsWith('cast:')){ castMenu = false; pEmit({a:'cast', m:v.slice(5)}); return renderPhone(); }
  if(v.startsWith('qa')){ const p = S && S.p; if(ROOM && p && p.au && p.au !== myUid()) return toast(`✋ ผู้ตอบข้อนี้คือ ${p.an}`); return pEmit({a:'answer', i:+v.slice(2)}); }
  if(v==='ctnone') return pEmit({a:'counter', i:null});
  if(v.startsWith('ct')) return pEmit({a:'counter', i:+v.slice(2)});
  if(v[0]==='h'){ castMenu = false; phoneSel = phoneSel === v.slice(1) ? null : v.slice(1); return renderPhone(); }
  if(v.startsWith('pl')){ if(!phoneSel) return; pEmit({a:'place', u:phoneSel, s:+v[2]}); phoneSel = null; return renderPhone(); }
  if(v==='uncast') return pEmit({a:'uncast'});
  if(/^un\d$/.test(v)) return pEmit({a:'unplace', s:+v[2]});
  if(v==='disc'){ if(phoneSel) pEmit({a:'discard', u:phoneSel}); phoneSel = null; return renderPhone(); }
  if(v.startsWith('ch')) return pEmit({a:'choose', i:+v.slice(2)});
  if(v==='offer0'||v==='offer1') return pEmit({a:'offer', use: v==='offer1'});
  const map = {draw:'draw', summon:'summon', end:'end'};
  if(map[v]) pEmit({a:map[v]});
}
document.getElementById('phone').addEventListener('click', e => { if(lpFired){ lpFired = false; e.preventDefault(); return; } phoneClick(e); });
/* กดค้างที่การ์ดเพื่อขยายดู (การ์ดในมือ / ช่องรากศัพท์ / คำสมบูรณ์) */
let lpTimer = null, lpFired = false, lpStart = null;
const phoneEl = document.getElementById('phone');
phoneEl.addEventListener('pointerdown', e => {
  lpFired = false;
  const el = e.target.closest('[data-zr],[data-m^="z:"]'); if(!el) return;
  lpStart = [e.clientX, e.clientY];
  lpTimer = setTimeout(() => {
    lpFired = true; setTimeout(() => { lpFired = false; }, 700);
    if(el.dataset.zr){ zoomRoot = el.dataset.zr; zoomCid = null; xView = null; }
    else { zoomCid = el.dataset.m.slice(2); zoomRoot = null; xView = null; }
    if(navigator.vibrate) try{ navigator.vibrate(15); }catch(_){}
    renderOverlay();
  }, 450);
});
phoneEl.addEventListener('pointermove', e => { if(lpTimer && lpStart && Math.hypot(e.clientX-lpStart[0], e.clientY-lpStart[1]) > 10){ clearTimeout(lpTimer); lpTimer = null; } });
['pointerup','pointercancel','pointerleave'].forEach(ev => phoneEl.addEventListener(ev, () => { clearTimeout(lpTimer); lpTimer = null; }));
phoneEl.addEventListener('contextmenu', e => { if(e.target.closest('[data-zr],[data-m^="z:"]')) e.preventDefault(); });

/* ---------- เริ่มต้นแอป ---------- */
function startOffline(){
  online = false; ROOM = null; closeScr(); MODE = 'TV';
  document.body.classList.remove('phone'); render(); showSetup();
}
(function boot(){
  document.getElementById('sparkles').innerHTML = Array.from({length:24},()=>`<i style="left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${(Math.random()*3).toFixed(2)}s"></i>`).join('');
  render();
  if(!fbInit()) return showNeedsSetup();
  busy('กำลังโหลด…');
  AUTH.getRedirectResult().catch(e => showLogin(fbErr(e)));
  AUTH.onAuthStateChanged(u => {
    USER = u;
    if(!online) return;
    if(!u){ if(ROOM) location.href = location.pathname; return showLogin(); }
    if(!ROOM) showHome();
  });
})();
