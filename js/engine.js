/* =====================================================================
   SAMAS CODEBREAKERS: FUSION DUEL
   - จอทีวี (ลิงก์ปกติ) = ตัวคุมเกมหลัก + ปุ่มครู
   - มือถือทีม (ลิงก์ #a-รหัส / #b-รหัส) = มือการ์ดของทีม
   ===================================================================== */
const GD = window.GD;
const RULES = GD.rules;
const MAGIC = {}; GD.magicCards.forEach(m => MAGIC[m.type] = m);
const MTYPES = GD.magicCards.map(m => m.type);
const SANDHI_POOL = 3;                         // ค่าเริ่มต้นจำนวนการ์ดเวทแต่ละชนิด (ถ้า JSON ไม่ระบุ copies)
const ROOT = {}; GD.roots.forEach(r => ROOT[r.name] = r);
const COMP = {}; GD.completedCards.forEach(c => COMP[c.id] = c);
const PHASES = [['DRAW','จั่ว'],['PREPARATION','เตรียม'],['FUSION','ฟิวชัน'],['KNOWLEDGE_CHECK','ตอบคำถาม'],['EFFECT','เอฟเฟค'],['END','จบเทิร์น']];

let MODE = 'TV';                 // 'TV' = เครื่องที่รันเกม (จอกลาง/โฮสต์) · 'P' = มือถือผู้เล่น

let uidN = 0;
const uid = p => p + (++uidN);
const shuffle = a => { for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const pick = a => a[Math.floor(Math.random()*a.length)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inRelease = (x, exp) => x.release === 'core' || exp;
const filled = arr => arr.filter(Boolean);
const other = k => k === 'A' ? 'B' : 'A';
const fmtTime = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
const fsz = s => { const L=[...s].length; return L<=3?.3:L<=5?.25:L<=7?.2:L<=9?.165:.14; };
const DEF_LABEL = {shieldRoots:'🛡 เกราะรากศัพท์', counterAny:'✋ ยกเลิกเอฟเฟค', counterDestroyDiscard:'✋ กันทำลาย/ทิ้ง',
  shieldStaged:'🛡 กันทำลายช่องเตรียม', shieldStagedAll:'🛡 กันทั้ง 2 ช่องเตรียม', shieldHandOne:'🛡 กันมือ 1', shieldStagedOne:'🛡 กันสนาม 1'};

/* ---------- หน้าการ์ด (ใช้ร่วมทุกจอ) ---------- */
function rootFaceHTML(name){
  if(!name) return `<div class="face img back-root"></div>`;
  const r = ROOT[name];
  if(r && r.imgClass) return `<div class="face img ${r.imgClass}"></div>`;
  return `<div class="face root"><span class="ft">รากศัพท์</span><span class="fw" style="--f:${fsz(name)}">${esc(name)}</span><span class="fm">${esc(r?r.meaning:'')}</span></div>`;
}
function compFaceHTML(c){
  if(c.imgClass) return `<div class="face img ${c.imgClass}"></div>`;
  return `<div class="face word ${c.type}"><span class="ft">${c.type==='samas'?'คำสมาส':'คำสนธิ'}</span><span class="fw" style="--f:${fsz(c.name)*.95}">${esc(c.name)}</span>
    <span class="fm">${esc(c.rootNames.join(' + '))}${c.magic?' + เวท':''}<br>${esc(c.effect.name)}</span></div>`;
}
const magicName = mt => (MAGIC[mt] && MAGIC[mt].name) || 'เวทสนธิ';
const magicFaceHTML = mt => { const m = MAGIC[mt || 'vowel_sandhi'];
  if(m && m.imgClass) return `<div class="face img ${m.imgClass}"></div>`;
  return `<div class="face magic"><span class="ft">การ์ดเวท</span><span class="fw">${esc(m?m.name:'เวทสนธิ')}</span><span class="fo">✦</span></div>`; };
/* หลังการ์ด: ม่วง = รากศัพท์ (สำรับ/มือ), ขาว = Extra Deck · ขอบสีบอกทีม */
const backFaceHTML = (cls) => cls==='X' ? `<div class="face img back-extra"></div>` : `<div class="face img back-root tb-${cls}"></div>`;
const optFace = o => o.root ? rootFaceHTML(o.root) : backFaceHTML(o.back, '?');

const LOTUS = `<svg viewBox="0 0 64 40"><g fill="#ff9fd0" stroke="#ffe9a3" stroke-width="1.2"><path d="M32 4C26 14 26 26 32 36C38 26 38 14 32 4Z"/><path d="M32 36C22 32 16 22 16 12C24 16 30 26 32 36Z"/><path d="M32 36C42 32 48 22 48 12C40 16 34 26 32 36Z"/><path d="M32 36C20 36 8 30 4 22C14 22 26 28 32 36Z" fill="#e66aa8"/><path d="M32 36C44 36 56 30 60 22C50 22 38 28 32 36Z" fill="#e66aa8"/></g></svg>`;
const KANOK = gem => `<svg viewBox="0 0 40 40"><path d="M2 38C2 16 16 2 38 2C26 6 19 12 17 22C23 15 31 14 36 19C28 19 23 24 21 32C17 28 12 30 10 38Z" fill="#f6cf6a" stroke="#7a4a0c" stroke-width="1"/><path d="M9 9l4 -4 4 4 -4 4z" fill="${gem}" stroke="#fff" stroke-width=".8"/></svg>`;
const corners = k => ['tl','tr','bl','br'].map(c=>`<span class="corner ${c}">${KANOK(k==='A'?'#8fe3ff':'#ff3d62')}</span>`).join('');
const MAGIC_CIRCLE = `<svg viewBox="0 0 200 200"><g fill="none" stroke="#e9d8ff" stroke-width="1.2"><circle cx="100" cy="100" r="96"/><circle cx="100" cy="100" r="86" stroke-dasharray="3 5"/><circle cx="100" cy="100" r="62"/><polygon points="100,14 174,143 26,143"/><polygon points="100,186 26,57 174,57"/><circle cx="100" cy="100" r="30" stroke="#f6cf6a"/></g><g fill="#f6cf6a">${Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return `<circle cx="${100+91*Math.cos(a)}" cy="${100+91*Math.sin(a)}" r="2.6"/>`}).join('')}</g></svg>`;

/* =====================================================================
   1) เครื่องยนต์เกม (ทำงานบนจอทีวีเท่านั้น)
   ===================================================================== */
let state = null, msg = {text:'', tone:''};
let view = 'B', showAllHands = false, timerHandle = null;
let pendingCb = null;                       // callback ของขั้นตอนที่รออยู่ (เก็บเฉพาะบนทีวี)
let phoneOn = {A:false, B:false};           // มือถือทีมเชื่อมต่ออยู่หรือไม่
let roomCode = null, R = null, roomState = 'idle';

function buildMainDeck(key, exp){
  const roots = GD.roots.filter(r => inRelease(r, exp));
  const names = roots.map(r => r.name);
  if(names.length < RULES.mainDeckSizePerTeam){
    const usage = {};
    GD.completedCards.filter(c => inRelease(c, exp)).forEach(c => c.rootNames.forEach(n => usage[n] = (usage[n]||0) + 1));
    const order = roots.slice().sort((a,b) => (usage[b.name]||0) - (usage[a.name]||0) || a.id.localeCompare(b.id));
    for(let i=0; names.length < RULES.mainDeckSizePerTeam; i++) names.push(order[i % order.length].name);
  }
  return shuffle(names.map(n => ({uid:uid(key+'r'), kind:'root', owner:key, name:n})));
}
function makeTeam(key, name, exp){
  const t = { key, name,
    extraDeck: GD.completedCards.filter(c => inRelease(c, exp)).map(c => ({uid:uid(key+'x'), kind:'extra', owner:key, cid:c.id})),
    mainDeck: buildMainDeck(key, exp), discard: [], hand: [],
    fusionZone: Array(RULES.fusionSlotsPerTeam).fill(null), sandhiSlot: null,
    completedZone: Array(RULES.completedSlotsPerTeam).fill(null), defenses: [] };
  for(let i=0;i<RULES.openingHandSize;i++) t.hand.push(t.mainDeck.pop());
  return t;
}
function newGame(nameA, nameB, exp){
  uidN = 0;
  state = { turn:'A', turnNo:1, round:1, phase:'DRAW', hasDrawn:false, summoned:false, summonLost:false,
    selected:null, winner:null, exp, timeLeft:RULES.timeLimitMinutes*60, paused:false, timeUpShown:false, pending:null, uidN:0,
    sandhiZone:{ piles: Object.fromEntries(GD.magicCards.map(m => [m.type, Array.from({length:m.copies||SANDHI_POOL}, (_,i)=>({uid:m.id+'-'+(i+1), kind:'magic', mtype:m.type}))])) },
    teamA: makeTeam('A', nameA, exp), teamB: makeTeam('B', nameB, exp) };
  pendingCb = null; closeModal(); startTurn(); startTimer();
}
const team = k => k === 'A' ? state.teamA : state.teamB;
const active = () => team(state.turn);
function say(text, tone=''){ msg = {text, tone}; }
const compOf = x => COMP[x.cid];

function startTurn(){
  const t = active();
  Object.assign(state, {hasDrawn:false, summoned:false, summonLost:false, selected:null, phase:'DRAW', turnLeft:TURN_SECONDS});
  if(state.turnNo === 1 && RULES.firstTeamSkipsFirstDraw){ state.hasDrawn = true; state.phase = 'PREPARATION'; say(`${t.name} เริ่มก่อน — ทีมแรกงดจั่วในเทิร์นแรก`); }
  else say(`ตาของ ${t.name} — จั่วการ์ด ${RULES.drawPerTurn} ใบ`);
  render();
}
function returnMagic(t){ if(t.sandhiSlot){ const mt = t.sandhiSlot.mtype || 'vowel_sandhi'; (state.sandhiZone.piles[mt] = state.sandhiZone.piles[mt] || []).push(t.sandhiSlot); t.sandhiSlot = null; } }
const pileCount = mt => (state.sandhiZone.piles[mt] || []).length;
function drawCards(t, n){ let got = 0; for(let i=0;i<n;i++){ if(!t.mainDeck.length) break; t.hand.push(t.mainDeck.pop()); got++; } return got; }
function endTurn(){
  const t = active();
  returnMagic(t);
  state.turnNo++; state.round = Math.ceil(state.turnNo/2); state.turn = other(state.turn);
  [state.teamA, state.teamB].forEach(x => {
    x.defenses = x.defenses.filter(d => d.until >= state.turnNo);
    x.hand.forEach(c => { if(c.revealedUntil && c.revealedUntil < state.turnNo) delete c.revealedUntil; });
  });
  startTurn();
}

/* การกระทำ (จากการแตะบนทีวี หรือคำสั่งจากมือถือ) */
function act(a, k, x){
  if(!state || state.winner) return;
  const t = k ? team(k) : null;
  const isActive = k === state.turn;
  switch(a){
    case 'extra': return showExtraDeck(t);
    case 'completed': { const c=t.completedZone[x]; if(c) showZoomComp(compOf(c), t.key); return; }
  }
  if(state.pending){ say('รอให้ขั้นตอนปัจจุบันเสร็จก่อน', 'bad'); return render(); }
  if(a === 'discard'){
    if(isActive && state.selected){
      const i = t.hand.findIndex(c=>c.uid===state.selected);
      if(i>=0){ const c=t.hand.splice(i,1)[0]; t.discard.push(c); state.selected=null; state.phase='PREPARATION'; say(`${t.name} ทิ้ง “${c.name}” ลงกองทิ้ง ${t.key}`); }
      return render();
    }
    if(MODE === 'TV') return showList(`กองทิ้ง ${t.key}`, `${t.discard.length} ใบ`, t.discard);
    return;
  }
  if(t && !isActive){ say(`ตอนนี้เป็นตาของ ${active().name}`, 'bad'); return render(); }
  switch(a){
    case 'hand':
      state.selected = state.selected === x ? null : x;
      if(state.selected) say('เลือกแล้ว — แตะช่องรากศัพท์เพื่อวาง หรือแตะกองทิ้งเพื่อทิ้ง');
      break;
    case 'main':
      if(state.hasDrawn){ say(`จั่วได้เทิร์นละ ${RULES.drawPerTurn} ใบ`, 'bad'); break; }
      state.hasDrawn = true; state.phase = 'PREPARATION';
      say(drawCards(t, RULES.drawPerTurn) ? `${t.name} จั่วการ์ด ${RULES.drawPerTurn} ใบ` : `สำรับ ${t.key} หมด — ข้ามการจั่ว`);
      break;
    case 'fusion': {
      const i = +x;
      if(state.selected){
        const hi = t.hand.findIndex(c=>c.uid===state.selected);
        if(hi < 0){ state.selected = null; break; }
        const card = t.hand.splice(hi,1)[0];
        if(t.fusionZone[i]) t.hand.push(t.fusionZone[i]);
        t.fusionZone[i] = card; state.selected = null; state.phase = 'PREPARATION';
        say(t.fusionZone.every(Boolean) ? 'รากศัพท์ 2 ใบเชื่อมพลังกันแล้ว — กด ⚡ อัญเชิญ' : `วาง “${card.name}” ลงช่องรากศัพท์ ${i+1}`);
      } else if(t.fusionZone[i]){ t.hand.push(t.fusionZone[i]); t.fusionZone[i] = null; say('คืนการ์ดกลับขึ้นมือ'); }
      break;
    }
    case 'sandhiZone': {
      const at = active(), mt = MTYPES.includes(x) ? x : 'vowel_sandhi';
      if(at.sandhiSlot){ say(`${at.name} ถือเวท${magicName(at.sandhiSlot.mtype)}อยู่แล้ว — แตะการ์ดเวทเพื่อคืนก่อน`, 'bad'); break; }
      if(!pileCount(mt)){ say(`กองเวท${magicName(mt)}ว่าง`, 'bad'); break; }
      at.sandhiSlot = state.sandhiZone.piles[mt].pop(); say(`${at.name} ร่ายเวท${magicName(mt)}จากกองกลาง ✦`);
      render(); burstAtCenter(); return;
    }
    case 'sandhiSlot':
      if(t.sandhiSlot){ const nm = magicName(t.sandhiSlot.mtype); returnMagic(t); say(`คืนเวท${nm}สู่กองกลาง`); }
      break;
    case 'summon': return trySummon(active());
    case 'endturn': return endTurn();
  }
  render();
}

/* ต้องวางให้ตรงช่อง: ช่อง 1 = รากศัพท์ตัวแรก, ช่อง 2 = รากศัพท์ตัวที่สอง ตามสูตรบนการ์ด */
const sameRoots = (c, names) => c.rootNames[0]===names[0] && c.rootNames[1]===names[1];
const swappedRoots = (c, names) => c.rootNames[0]===names[1] && c.rootNames[1]===names[0];
function trySummon(t){
  if(state.summoned){ say(`เทิร์นนี้อัญเชิญคำสมบูรณ์ไปแล้ว — ลงคำสมบูรณ์ได้เทิร์นละ ${RULES.summonsPerTurn} ใบเท่านั้น`, 'bad'); return render(); }
  if(state.summonLost){ say('เทิร์นนี้เสียสิทธิ์อัญเชิญแล้ว (ตอบคำถามผิด)', 'bad'); return render(); }
  const mats = filled(t.fusionZone);
  if(mats.length < RULES.fusionSlotsPerTeam){ say('วางรากศัพท์ใน Fusion Zone ให้ครบ 2 ช่องก่อน', 'bad'); return render(); }
  const names = mats.map(c=>c.name);
  const cands = t.extraDeck.filter(x => sameRoots(compOf(x), names));
  if(!cands.length){
    const sw = t.extraDeck.find(x => swappedRoots(compOf(x), names));
    if(sw){ say(`วางรากศัพท์ผิดช่อง — อัญเชิญไม่ได้ · ตรวจลำดับ ช่อง 1 / ช่อง 2 ตามสูตรการ์ดอีกครั้ง`, 'bad'); return render(); }   // ไม่บอกชื่อคำ เพื่อไม่เฉลยคำถาม
    const done = filled(t.completedZone).some(x => sameRoots(compOf(x), names));
    const inOther = team(other(t.key)).extraDeck.some(x => sameRoots(compOf(x), names));
    say(done ? `${names.join(' + ')} — ทีมนี้อัญเชิญคำนี้ไปแล้ว` : inOther ? `${names.join(' + ')} มีใน Extra Deck ${other(t.key)} เท่านั้น — ห้ามใช้การ์ดข้ามทีม!` : `${names.join(' + ')} ไม่ตรงกับคำใดใน Extra Deck ${t.key}`, 'bad');
    return render();
  }
  const held = t.sandhiSlot ? (t.sandhiSlot.mtype || 'vowel_sandhi') : null;
  const x = cands.find(c => (compOf(c).magic || null) === held);
  if(!x){
    const need = compOf(cands[0]).magic;
    say(need ? (held ? `ร่ายเวทผิดชนิด — คำนี้ต้องใช้เวท${magicName(need)} ไม่ใช่${magicName(held)}` : `สูตรนี้เป็นคำสนธิ — ต้องร่ายเวทสนธิที่ถูกชนิดจากกองกลางก่อน`)
      : 'สูตรนี้เป็นคำสมาส ไม่ต้องใช้เวทสนธิ — คืนการ์ดเวทสู่กองกลางก่อน', 'bad');
    return render();
  }
  const hasMagic = held;
  state.phase = 'KNOWLEDGE_CHECK';
  askQuestions(t.key, `ทีม ${t.key} อัญเชิญ`, summonQuestions(compOf(x), names, hasMagic), () => commitSummon(t.key, x.uid), () => failSummon(t));
}

/* ---------- ขั้นตอนที่รอการตอบ (ทีวีแสดง / มือถือตอบ) ---------- */
function mcq(correct, pool){
  const others = shuffle([...new Set(pool.filter(x => x && x !== correct))]).slice(0, 3);
  const opts = shuffle([correct, ...others]);
  return {opts, ci: opts.indexOf(correct)};
}
const activeComps = () => GD.completedCards.filter(c => inRelease(c, state.exp));
const activeRoots = () => GD.roots.filter(r => inRelease(r, state.exp));
function meaningQ(n){ return {q:`รากศัพท์ “${n}” หมายความว่าอะไร?`, a:ROOT[n].meaning, ...mcq(ROOT[n].meaning, activeRoots().map(r=>r.meaning))}; }
function summonQuestions(c, names, magic){
  const q1 = {q:`รวม ${names.join(' + ')}${magic?' + เวท'+magicName(magic):''} ได้คำว่าอะไร?`, a:c.name, cid:c.id, ...mcq(c.name, activeComps().map(x=>x.name))};
  const typeQ = {q:`คำว่า “${c.name}” เป็นคำสมาสหรือคำสนธิ?`, a: c.type==='samas'?'คำสมาส':'คำสนธิ', opts:['คำสมาส','คำสนธิ'], ci: c.type==='samas'?0:1};
  return [q1, pick([typeQ, ...c.rootNames.map(meaningQ)])].slice(0, RULES.questionsPerSummon);
}
function effectQuestion(c){
  const j = x => x.rootNames.join(' + ');
  const rq = {q:`คำว่า “${c.name}” ประกอบด้วยรากศัพท์ใดบ้าง?`, a:j(c), ...mcq(j(c), activeComps().map(j))};
  return [pick([rq, ...c.rootNames.map(meaningQ)])].slice(0, RULES.questionsPerEffect);
}
/* คำถามแบบเลือกตอบ: ทีมที่ตอบเลือกบนมือถือ หรือครูกดแทนบนจอกลาง — ระบบตรวจคำตอบเอง */
function askQuestions(teamKey, title, qs, onPass, onFail, i=0){
  const q = qs[i];
  state.pending = {type:'question', team:teamKey, title, i, n:qs.length, q:q.q, opts:q.opts, cid:q.cid||null, revealed:false, picked:null};
  pendingCb = {qs, onPass, onFail, title, teamKey, i, ci:q.ci, a:q.a};
  render();
}
function answerQuestion(kind, idx){
  const p = state && state.pending; if(!p || p.type !== 'question') return;
  const cb = pendingCb;
  if(kind === 'pick'){
    if(p.revealed || !(idx >= 0 && idx < p.opts.length)) return;
    Object.assign(p, {revealed:true, picked:idx, ci:cb.ci, a:cb.a, correct: idx === cb.ci});
    render();
    setTimeout(() => { if(state && state.pending === p) answerQuestion(p.correct ? 'ok' : 'no'); }, 2200);
    return;
  }
  if(!p.revealed) return;
  state.pending = null; pendingCb = null;
  if(kind === 'ok'){ cb.i+1 < cb.qs.length ? askQuestions(cb.teamKey, cb.title, cb.qs, cb.onPass, cb.onFail, cb.i+1) : cb.onPass(); }
  else cb.onFail();
}
function failSummon(t){
  state.summonLost = true; state.phase = 'PREPARATION';
  returnMagic(t);
  say('ตอบผิด — อัญเชิญไม่สำเร็จ รากศัพท์ยังอยู่ใน Fusion Zone และเสียสิทธิ์อัญเชิญในเทิร์นนี้', 'bad');
  render();
}
function commitSummon(k, xUid){
  const t = team(k);
  const x = t.extraDeck.find(c=>c.uid===xUid); if(!x) return;
  const c = compOf(x), usedMagic = !!t.sandhiSlot;
  t.extraDeck = t.extraDeck.filter(e=>e.uid!==xUid);
  const slot = t.completedZone.findIndex(e=>!e);
  t.completedZone[slot] = x;
  filled(t.fusionZone).forEach(r => t.discard.push(r));
  t.fusionZone = Array(RULES.fusionSlotsPerTeam).fill(null);
  returnMagic(t);
  state.summoned = true;
  const n = filled(t.completedZone).length;
  say(`✨ ${t.name} อัญเชิญ “${c.name}” สำเร็จ! (${n}/${RULES.winAtCompletedCards})`, 'good');
  if(n >= RULES.winAtCompletedCards) state.winner = k;
  render();
  if(usedMagic) burstAtCenter();
  const game = state;
  animateSummon(k, slot, c);                                   // แอนิเมชันอย่างเดียว ไม่ผูกกับขั้นตอนเกม
  setTimeout(() => {                                           // ไปขั้นเอฟเฟคเสมอ แม้แอนิเมชันไม่จบ (เช่น แท็บอยู่เบื้องหลัง)
    if(state !== game || state.pending) return;
    if(state.winner) return showWin(t);
    if(isDefense(c)){ say(`🛡 “${c.name}” เป็นการ์ดป้องกัน — พร้อมใช้เมื่อถูกฝ่ายตรงข้ามโจมตี (ใช้ได้ 1 ครั้ง)`, 'good'); state.phase = 'PREPARATION'; return render(); }
    offerEffect(t, c);
  }, 1100);
}
function offerEffect(t, c){
  state.phase = 'EFFECT';
  closeModal();
  state.pending = {type:'offer', team:t.key, cid:c.id};
  pendingCb = {t, c};
  render();
}
function answerOffer(use){
  const p = state && state.pending; if(!p || p.type !== 'offer') return;
  const {t, c} = pendingCb; state.pending = null; pendingCb = null;
  if(!use){ say(`${t.name} ไม่ใช้เอฟเฟค`); state.phase='PREPARATION'; return render(); }
  askQuestions(t.key, `เอฟเฟค “${c.effect.name}”`, effectQuestion(c), () => resolveEffect(t, c),
    () => { say(`ตอบผิด — เอฟเฟค “${c.effect.name}” ไม่ทำงาน`, 'bad'); state.phase='PREPARATION'; render(); });
}
/* ให้ทีมเลือกการ์ด: items = การ์ด (หรือ {c,i}); hidden = แสดงหลังการ์ด */
function chooseCard(chooser, title, sub, items, cb, hidden=false){
  state.pending = {type:'choose', team:chooser, title, sub, opts: items.map(it => hidden ? {back: (it.c||it).owner} : {root:(it.c||it).name})};
  pendingCb = {items, cb};
  render();
}
function answerChoose(idx){
  const p = state && state.pending; if(!p || p.type !== 'choose') return;
  const {items, cb} = pendingCb; if(!(idx >= 0 && idx < items.length)) return;
  state.pending = null; pendingCb = null; cb(items[idx]);
}
function done(text, tone=''){ state.pending = null; pendingCb = null; if(text) say(text, tone); state.phase='PREPARATION'; render(); }

/* ---------- เอฟเฟค ---------- */
/* การ์ดป้องกัน: ไม่ใช้ตอนอัญเชิญ แต่วางพร้อมใช้ใน Completed Word Zone
   เมื่อฝ่ายตรงข้ามใช้เอฟเฟคโจมตี เจ้าของเลือกเปิดใช้เพื่อยกเลิกได้ — ใช้แล้วหมดสิทธิ์ (ใช้ได้ครั้งเดียวต่อใบ) */
const DEFENSE = {
  shield_roots:                       {blocks:'any',            label:'ป้องกันเอฟเฟคที่เล็งรากศัพท์ของเรา'},
  counter_destroy_discard:            {blocks:'destroyDiscard', label:'ยกเลิกการทำลายหรือบังคับทิ้ง'},
  shield_staged:                      {blocks:'stagedDestroy',  label:'กันการทำลายรากศัพท์ที่วางเตรียม'},
  counter_effect:                     {blocks:'any',            label:'ยกเลิกเอฟเฟคฝ่ายตรงข้าม'},
  shield_hand_and_staged:             {blocks:'any',            label:'ป้องกันรากศัพท์ในมือและบนสนาม'},
  shield_then_draw:                   {blocks:'any', bonus:'draw',    label:'ป้องกัน แล้วจั่ว 1 ใบ'},
  counter_and_reveal:                 {blocks:'any', bonus:'reveal',  label:'ยกเลิก แล้วเปิดเผยมือฝ่ายตรงข้าม 1 ใบ'},
  counter_new_summon_effect_and_draw: {blocks:'any', bonus:'draw',    label:'ยกเลิกเอฟเฟคคำที่เพิ่งอัญเชิญ แล้วจั่ว 1 ใบ'},
  shield_both_staged_and_draw:        {blocks:'staged', bonus:'draw', label:'กันรากศัพท์ที่วางเตรียมทั้ง 2 ช่อง แล้วจั่ว 1 ใบ'},
  counter_and_recover:                {blocks:'destroyDiscard', bonus:'recover', label:'ยกเลิกการทำลาย/บังคับทิ้ง แล้วนำรากศัพท์จากกองทิ้งขึ้นมือ 1 ใบ'}
};
const isDefense = c => !!DEFENSE[c.effect.op];
function defenseFits(c, info){
  const b = DEFENSE[c.effect.op].blocks;
  if(b === 'any') return true;
  if(b === 'destroyDiscard') return info.cat === 'destroy' || info.cat === 'discard';
  if(b === 'stagedDestroy') return info.target === 'staged' && info.cat === 'destroy';
  if(b === 'staged') return info.target === 'staged';
  return false;
}
const readyDefenses = (t, info) => filled(t.completedZone).filter(x => !x.used && isDefense(compOf(x)) && (!info || defenseFits(compOf(x), info)));
const COUNTER_SECONDS = 15;
const TURN_SECONDS = 45;
function addDef(t, kind, charges, span, src, extra={}){ t.defenses.push({kind, charges, until: state.turnNo + span, src, ...extra}); }
const DEF_ORDER = ['shieldStagedAll','shieldStaged','shieldStagedOne','shieldHandOne','counterDestroyDiscard','shieldRoots','counterAny'];
function defApplies(d, info){
  switch(d.kind){
    case 'shieldStagedAll': case 'shieldStagedOne': return info.target === 'staged';
    case 'shieldStaged': return info.target === 'staged' && info.cat === 'destroy';
    case 'shieldHandOne': return info.target === 'hand';
    case 'counterDestroyDiscard': return info.cat === 'destroy' || info.cat === 'discard';
    default: return true;
  }
}
function hostile(tgt, info, hasTarget, apply){
  if(!hasTarget()) return done(`เอฟเฟค “${info.name}” ไม่มีเป้าหมาย — ไม่เกิดผล`, 'bad');
  const ready = readyDefenses(tgt, info);
  if(!ready.length) return apply();
  /* เปิดช่วงให้ฝ่ายถูกโจมตีตัดสินใจเคาน์เตอร์ */
  state.pending = {type:'counter', team:tgt.key, attacker:other(tgt.key), atk:info.name,
    title:`ทีม ${other(tgt.key)} ใช้ “${info.name}” — จะป้องกันไหม?`, opts: ready.map(x => x.cid), left: COUNTER_SECONDS};
  pendingCb = {tgt, ready, apply, info};
  say(`⚔️ ทีม ${other(tgt.key)} ใช้ “${info.name}” — รอทีม ${tgt.key} ตัดสินใจป้องกัน`);
  render();
}
function answerCounter(idx){
  const p = state && state.pending; if(!p || p.type !== 'counter') return;
  const {tgt, ready, apply, info} = pendingCb;
  state.pending = null; pendingCb = null;
  if(!(idx >= 0 && idx < ready.length)){ say(`ทีม ${tgt.key} ไม่ป้องกัน`); return apply(); }
  const x = ready[idx], c = compOf(x), d = DEFENSE[c.effect.op];
  x.used = true;                                                     // ใช้แล้วหมดสิทธิ์
  let extra = '';
  if(d.bonus === 'draw' && drawCards(tgt, 1)) extra = ' และจั่ว 1 ใบ';
  if(d.bonus === 'reveal'){ const o = team(other(tgt.key)); if(o.hand.length){ const v = pick(o.hand); v.revealedUntil = state.turnNo + 2; extra = ` และเปิดเผย “${v.name}” ในมือทีม ${o.key}`; } }
  if(d.bonus === 'recover' && tgt.discard.length){
    say(`🛡 ทีม ${tgt.key} ใช้ “${c.name}” ยกเลิก “${info.name}” สำเร็จ!`, 'good');
    return recover(tgt, r => done(`🛡 ทีม ${tgt.key} ใช้ “${c.name}” ยกเลิก “${info.name}” สำเร็จ! · ${r}`, 'good'));
  }
  done(`🛡 ทีม ${tgt.key} ใช้ “${c.name}” ยกเลิก “${info.name}” สำเร็จ!${extra}`, 'good');
}
const stagedOf = t => t.fusionZone.map((c,i)=>c?{c,i}:null).filter(Boolean);
const lookTop = (t, n) => t.mainDeck.slice(-n).reverse();
const removeFromDeck = (t, c) => t.mainDeck.splice(t.mainDeck.indexOf(c), 1);
function recover(t, then){
  if(!t.discard.length) return then ? then('กองทิ้งว่าง') : done(`กองทิ้ง ${t.key} ว่าง — ไม่มีการ์ดให้นำกลับ`, 'bad');
  chooseCard(t.key, 'นำรากศัพท์กลับขึ้นมือ', `เลือก 1 ใบจากกองทิ้ง ${t.key}`, t.discard, c => {
    t.discard.splice(t.discard.indexOf(c),1); t.hand.push(c);
    then ? then(`นำ “${c.name}” กลับขึ้นมือ`) : done(`${t.name} นำ “${c.name}” จากกองทิ้งกลับขึ้นมือ`, 'good');
  });
}
function resolveEffect(t, c){
  const o = team(other(t.key)), e = c.effect, p = e.params || {}, nm = e.name, K = t.key;
  switch(e.op){
    case 'random_opponent_discard':
      return hostile(o, {name:nm, target:'hand', cat:'discard'}, () => o.hand.length, () => {
        const v = pick(o.hand); o.hand.splice(o.hand.indexOf(v),1); o.discard.push(v);
        done(`🌊 ${nm}: สุ่ม “${v.name}” จากมือทีม ${o.key} ลงกองทิ้ง`, 'good'); });
    case 'destroy_opponent_staged':
      return hostile(o, {name:nm, target:'staged', cat:'destroy'}, () => stagedOf(o).length, () =>
        chooseCard(K, nm, `เลือกรากศัพท์ที่ทีม ${o.key} วางเตรียมไว้ 1 ใบเพื่อทำลาย`, stagedOf(o), s => {
          o.fusionZone[s.i] = null; o.discard.push(s.c); done(`🔥 ${nm}: ทำลาย “${s.c.name}” ของทีม ${o.key}`, 'good'); }));
    case 'opponent_hand_shuffle_redraw':
      return hostile(o, {name:nm, target:'hand', cat:'other'}, () => o.hand.length, () =>
        chooseCard(K, nm, `เลือกการ์ดในมือทีม ${o.key} 1 ใบแบบไม่เห็นหน้า`, o.hand, v => {
          o.hand.splice(o.hand.indexOf(v),1); o.mainDeck.push(v); shuffle(o.mainDeck); drawCards(o,1);
          done(`🌪 ${nm}: สับการ์ด 1 ใบของทีม ${o.key} กลับสำรับ แล้วทีม ${o.key} จั่วใหม่ 1 ใบ`, 'good'); }, true));
    case 'reveal_opponent_hand':
      return hostile(o, {name:nm, target:'hand', cat:'other'}, () => o.hand.length, () => {
        const two = shuffle(o.hand.slice()).slice(0, p.look || 2);
        chooseCard(K, nm, `สุ่มดูการ์ดในมือทีม ${o.key} ${two.length} ใบ — เลือก ${p.reveal||1} ใบให้เปิดเผย`, two, v => {
          v.revealedUntil = state.turnNo + 2; done(`👁 ${nm}: เปิดเผย “${v.name}” ในมือทีม ${o.key}`, 'good'); }); });
    case 'opponent_choice_discard':
      return hostile(o, {name:nm, target:'hand', cat:'discard'}, () => o.hand.length, () =>
        chooseCard(o.key, nm, `ทีม ${o.key} เลือกรากศัพท์ในมือตนเอง 1 ใบส่งลงกองทิ้ง`, o.hand, v => {
          o.hand.splice(o.hand.indexOf(v),1); o.discard.push(v); done(`☄️ ${nm}: ทีม ${o.key} ทิ้ง “${v.name}”`, 'good'); }));
    case 'bounce_opponent_staged':
      return hostile(o, {name:nm, target:'staged', cat:'other'}, () => stagedOf(o).length, () =>
        chooseCard(K, nm, `เลือกรากศัพท์ที่ทีม ${o.key} เตรียมไว้ 1 ใบ ส่งกลับขึ้นมือเจ้าของ`, stagedOf(o), s => {
          o.fusionZone[s.i] = null; o.hand.push(s.c); done(`🌊 ${nm}: “${s.c.name}” กลับขึ้นมือทีม ${o.key}`, 'good'); }));
    case 'return_staged_to_deck_and_peek': {
      say('');
      const peek = () => { const top = lookTop(t, p.peek||1);
        if(!top.length) return done('สำรับว่าง — ไม่มีการ์ดให้ดู');
        chooseCard(K, 'ดูการ์ดบนสุดของสำรับตนเอง', 'แตะการ์ดเพื่อปิด', top, () => done(`${msg.text?msg.text+' · ':''}${t.name} ดูการ์ดบนสุดของสำรับแล้ว`, 'good')); };
      if(!stagedOf(o).length){ say(`ทีม ${o.key} ไม่มีรากศัพท์ที่วางไว้`); return peek(); }
      return hostile(o, {name:nm, target:'staged', cat:'other'}, () => true, () =>
        chooseCard(K, nm, `เลือกรากศัพท์ที่ทีม ${o.key} วางไว้ 1 ใบ ส่งกลับสำรับแล้วสับ`, stagedOf(o), s => {
          o.fusionZone[s.i] = null; o.mainDeck.push(s.c); shuffle(o.mainDeck); say(`👑 ${nm}: ส่ง “${s.c.name}” กลับสำรับทีม ${o.key}`, 'good'); peek(); }));
    }
    case 'look_top_take_one': {
      const top = lookTop(t, p.look||3);
      if(!top.length) return done(`สำรับ ${K} ว่าง`, 'bad');
      return chooseCard(K, nm, `ดู ${top.length} ใบบนสุด เลือกขึ้นมือ 1 ใบ (ที่เหลือสับกลับ)`, top, v => {
        removeFromDeck(t, v); t.hand.push(v); shuffle(t.mainDeck); done(`📜 ${nm}: ${t.name} เลือกการ์ดขึ้นมือ 1 ใบ`, 'good'); });
    }
    case 'recover_discard': return recover(t);
    case 'shield_roots':            addDef(t,'shieldRoots', p.charges||1, 2, nm); return done(`🛡 ${nm}: ป้องกันรากศัพท์ทีม ${K} 1 ครั้งในรอบถัดไป`, 'good');
    case 'counter_destroy_discard': addDef(t,'counterDestroyDiscard', p.charges||1, 2, nm); return done(`✋ ${nm}: พร้อมยกเลิกการทำลาย/บังคับทิ้ง 1 ครั้ง`, 'good');
    case 'shield_staged':           addDef(t,'shieldStaged', p.charges||1, 2, nm); return done(`🐘 ${nm}: ป้องกันรากศัพท์ที่วางเตรียมไว้จากการทำลาย 1 ครั้ง`, 'good');
    case 'counter_effect':          addDef(t,'counterAny', p.charges||1, 2, nm); return done(`⚡ ${nm}: พร้อมยกเลิกเอฟเฟคฝ่ายตรงข้าม 1 ครั้ง`, 'good');
    case 'shield_hand_and_staged':
      addDef(t,'shieldHandOne', p.hand||1, 1, nm); addDef(t,'shieldStagedOne', p.staged||1, 1, nm);
      return done(`🐘 ${nm}: ป้องกันรากศัพท์ในมือ 1 ครั้ง และบนสนาม 1 ครั้ง จนจบเทิร์นถัดไป`, 'good');
    case 'shield_then_draw': addDef(t,'shieldRoots', p.charges||1, 2, nm, {onBlockDraw:p.draw||1}); return done(`🛡 ${nm}: ป้องกัน 1 ครั้ง (ป้องกันสำเร็จจะจั่ว 1 ใบ)`, 'good');
    case 'look_take_and_stack': {
      const top = lookTop(t, p.look||4);
      if(!top.length) return done(`สำรับ ${K} ว่าง`, 'bad');
      return chooseCard(K, nm, `ดู ${top.length} ใบบนสุด — เลือกขึ้นมือ 1 ใบ`, top, v => {
        removeFromDeck(t, v); t.hand.push(v);
        const rest = top.filter(c=>c!==v);
        if(!rest.length){ shuffle(t.mainDeck); return done(`${nm}: เลือกการ์ดขึ้นมือแล้ว`, 'good'); }
        chooseCard(K, nm, 'เลือกอีก 1 ใบวางไว้บนสุดของสำรับ (ที่เหลือสับกลับ)', rest, s => {
          removeFromDeck(t, s); shuffle(t.mainDeck); t.mainDeck.push(s);
          done(`👑 ${nm}: เลือกการ์ดขึ้นมือ 1 ใบ และวางอีกใบไว้บนสุดของสำรับ`, 'good'); }); });
    }
    case 'draw_then_bottom': {
      const got = drawCards(t, p.draw||2);
      if(!t.hand.length) return done(`${nm}: จั่วได้ ${got} ใบ`);
      return chooseCard(K, nm, `จั่ว ${got} ใบแล้ว — เลือกการ์ดในมือ 1 ใบวางไว้ใต้สำรับ`, t.hand, v => {
        t.hand.splice(t.hand.indexOf(v),1); t.mainDeck.unshift(v); done(`🌅 ${nm}: จั่ว ${got} ใบ และวาง 1 ใบไว้ใต้สำรับ`, 'good'); });
    }
    case 'counter_and_reveal':
      addDef(t,'counterAny', p.charges||1, 2, nm);
      return hostile(o, {name:nm, target:'hand', cat:'other'}, () => o.hand.length, () => {
        const v = pick(o.hand); v.revealedUntil = state.turnNo + 2;
        done(`🌙 ${nm}: พร้อมยกเลิกเอฟเฟค 1 ครั้ง และเปิดเผย “${v.name}” ในมือทีม ${o.key}`, 'good'); });
    case 'counter_new_summon_effect_and_draw':
      addDef(t,'counterAny', p.charges||1, 2, nm); drawCards(t, p.draw||1);
      return done(`🌑 ${nm}: พร้อมยกเลิกเอฟเฟคคำสมบูรณ์ที่ฝ่ายตรงข้ามอัญเชิญ 1 ครั้ง และจั่ว 1 ใบ`, 'good');
    case 'look_take_discard_bottom': {
      const top = lookTop(t, p.look||3);
      if(!top.length) return done(`สำรับ ${K} ว่าง`, 'bad');
      return chooseCard(K, nm, `เปิด ${top.length} ใบบนสุด — เลือกขึ้นมือ 1 ใบ`, top, v => {
        removeFromDeck(t, v); t.hand.push(v);
        const rest = top.filter(c=>c!==v);
        if(!rest.length) return done(`${nm}: เลือกการ์ดขึ้นมือแล้ว`, 'good');
        chooseCard(K, nm, 'เลือก 1 ใบส่งลงกองทิ้ง (ใบที่เหลือวางใต้สำรับ)', rest, d => {
          removeFromDeck(t, d); t.discard.push(d);
          rest.filter(c=>c!==d).forEach(b => { removeFromDeck(t, b); t.mainDeck.unshift(b); });
          done(`✨ ${nm}: เลือกขึ้นมือ 1 ใบ, “${d.name}” ลงกองทิ้ง`, 'good'); }); });
    }
    case 'shield_both_staged_and_draw':
      addDef(t,'shieldStagedAll', null, 1, nm); drawCards(t, p.draw||1);
      return done(`🏯 ${nm}: ป้องกันรากศัพท์ที่วางเตรียมไว้ทั้ง 2 ช่องจนจบเทิร์นถัดไป และจั่ว 1 ใบ`, 'good');
    case 'counter_and_recover':
      addDef(t,'counterDestroyDiscard', p.charges||1, 2, nm);
      return recover(t, r => done(`🕊 ${nm}: พร้อมยกเลิกการทำลาย/บังคับทิ้ง 1 ครั้ง · ${r}`, 'good'));
    case 'recover_and_reorder':
      return recover(t, r => {
        const top = lookTop(t, p.look||2);
        if(top.length < 2) return done(`🤝 ${nm}: ${r}`, 'good');
        chooseCard(K, nm, `${r} — เลือกใบที่จะอยู่บนสุดของสำรับ`, top, v => {
          removeFromDeck(t, v); t.mainDeck.push(v); done(`🤝 ${nm}: ${r} และจัดลำดับ 2 ใบบนสุดแล้ว`, 'good'); }); });
    default:
      return done(`เอฟเฟค “${nm}” ยังไม่รองรับในระบบ — ให้ครูตัดสินด้วยตนเอง`, 'bad');
  }
}

/* =====================================================================
   2) แสดงผลบนจอทีวี
   ===================================================================== */
const da = (a,k,x) => `data-a="${a}"${k?` data-k="${k}"`:''}${x!==undefined?` data-x="${x}"`:''}`;
const sideOf = k => k === view ? 'near' : 'far';
const tvHidesHand = (k, isAct) => phoneOn[k] || (!isAct && !showAllHands);

function handHTML(t, isAct){
  const n = t.hand.length;
  if(!n) return `<span class="zhint">ไม่มีการ์ดบนมือ</span>`;
  const step = Math.min(1.1, n>1 ? 3.6/(n-1) : 1.1);
  return t.hand.map((c,i) => {
    const hidden = tvHidesHand(t.key, isAct) && !c.revealedUntil;
    const ml = i ? `margin-left:calc(var(--cw) * ${(step-1).toFixed(3)})` : '';
    if(hidden) return `<div class="card" style="${ml}">${backFaceHTML(t.key,'SAMAS')}</div>`;
    const clickable = isAct && !phoneOn[t.key];
    return `<div class="card ${clickable?'click':''} ${state.selected===c.uid?'sel':''}" style="${ml}" ${clickable?da('hand',t.key,c.uid):''} data-uid="${c.uid}">${rootFaceHTML(c.name)}${c.revealedUntil?'<span class="tag">👁</span>':''}</div>`;
  }).join('');
}
function teamHTML(t, side){
  const isAct = state.turn === t.key, sel = isAct && !!state.selected;
  const done = filled(t.completedZone).length, linked = t.fusionZone.every(Boolean);
  const completed = t.completedZone.map((x,i)=> x
    ? `<div class="card click ${x.used?'used':''}" ${da('completed',t.key,i)} data-slot="${i}" data-uid="${x.uid}">${compFaceHTML(compOf(x))}${isDefense(compOf(x))?`<span class="dtag ${x.used?'off':''}">${x.used?'ใช้แล้ว':'🛡 พร้อม'}</span>`:''}</div>`
    : `<div class="slot cslot" data-slot="${i}"><span>${i+1}</span></div>`).join('');
  const fusion = t.fusionZone.map((c,i)=> c
    ? `<div class="card ${isAct?'click':''} ${linked?'linked':''}" ${da('fusion',t.key,i)} data-uid="${c.uid}">${rootFaceHTML(c.name)}</div>`
    : `<div class="slot ${isAct?'click':''} ${sel?'target':''}" ${da('fusion',t.key,i)}>รากศัพท์ ${i+1}</div>`).join('');
  const magic = t.sandhiSlot ? `<div class="card mcard click linked" ${da('sandhiSlot',t.key)} title="${esc(magicName(t.sandhiSlot.mtype))}">${magicFaceHTML(t.sandhiSlot.mtype)}</div>` : `<div class="slot mslot">เวท<br>สนธิ</div>`;
  const top = t.discard[t.discard.length-1];
  const discard = top
    ? `<div class="card pile click ${sel?'glow':''}" ${da('discard',t.key)} data-uid="${top.uid}">${rootFaceHTML(top.name)}<span class="count">${t.discard.length}</span></div>`
    : `<div class="slot click ${sel?'target':''}" ${da('discard',t.key)}>ทิ้ง<br>การ์ด</div>`;
  const extra = t.extraDeck.length ? `<div class="card pile click" ${da('extra',t.key)}>${backFaceHTML('X','EXTRA')}<span class="count">${t.extraDeck.length}</span></div>` : `<div class="slot click" ${da('extra',t.key)}>ว่าง</div>`;
  const main = t.mainDeck.length ? `<div class="card pile click ${isAct && !state.hasDrawn?'glow':''}" ${da('main',t.key)}>${backFaceHTML(t.key,'MAIN')}<span class="count">${t.mainDeck.length}</span></div>` : `<div class="slot click" ${da('main',t.key)}>หมด</div>`;
  const defs = t.defenses.map(d=>`<span class="def">${DEF_LABEL[d.kind]}${d.charges!=null?` ×${d.charges}`:''}</span>`).join('');
  return `<section class="team-area team-${t.key.toLowerCase()}-area ${side} ${isAct?'active':'idle'}" data-team="${t.key}">
    ${corners(t.key)}
    <div class="team-banner"><span class="tm">ทีม ${t.key}</span><span>${esc(t.name)}</span>
      <span class="stat">★ คำสมบูรณ์ ${done}/${RULES.winAtCompletedCards}</span><span class="side">${side==='far'?'▲ ฝั่งบน':'▼ ฝั่งล่าง'} · มือ ${t.hand.length}</span>
      <span class="conn ${phoneOn[t.key]?'':'off'}">📱 ${phoneOn[t.key]?'มือถือเชื่อมแล้ว':'ไม่มีมือถือ'}</span>
      ${isAct?'<span class="turnflag">▶ ตาของทีมนี้</span>':''}<span class="defs">${defs}</span></div>
    <div class="zone extra-deck-zone" data-team="${t.key}"><div class="zlabel">EXTRA DECK ${t.key}</div>${extra}</div>
    <div class="zone completed-word-zone" data-team="${t.key}"><div class="zlabel">โซนคำสมบูรณ์ ${t.key}</div><div class="slots">${completed}</div></div>
    <div class="zone fusion-zone" data-team="${t.key}"><div class="zlabel">โซนรากศัพท์ (Fusion) ${t.key}</div><div class="slots">${fusion}${magic}${linked?'<div class="beam"></div>':''}</div></div>
    <div class="zone hand-zone"><div class="zlabel">มือทีม ${t.key}${phoneOn[t.key]?' (อยู่บนมือถือ)':tvHidesHand(t.key,isAct)?' (ซ่อน)':''}</div><div class="hand-cards">${handHTML(t, isAct)}</div></div>
    <div class="zone main-deck-zone"><div class="zlabel">สำรับ ${t.key}</div>${main}</div>
    <div class="zone discard-pile-zone"><div class="zlabel">กองทิ้ง ${t.key}</div>${discard}</div>
  </section>`;
}
function headerHTML(){
  const sA = state ? filled(state.teamA.completedZone).length : 0, sB = state ? filled(state.teamB.completedZone).length : 0;
  return `<header class="logo-bar">
    <div class="scoreboard"><span class="A">ทีม A ★ ${sA}/4</span><span class="B">ทีม B ★ ${sB}/4</span>
      ${state?`<span class="timer ${state.turnLeft<=10?'low':''}" id="tturn" data-ui="pause">⌛ ${state.turnLeft ?? TURN_SECONDS} วิ</span><span class="timer ${state.timeLeft<=300?'low':''}" id="timer" data-ui="pause">⏱ ${fmtTime(state.timeLeft)}${state.paused?' ⏸':''}</span>`:''}</div>
    <div class="logo">${LOTUS}<div><div class="l1">SAMAS CODEBREAKERS</div><div class="l2">FUSION DUEL</div></div>${LOTUS}</div>
    <div class="tools">
      ${ROOM?`<button class="tbtn" data-ui="join">🔑 ห้อง ${ROOM}</button>`:''}
      <button class="tbtn" data-ui="view">⇅ สลับฝั่ง</button>
      <button class="tbtn" data-ui="hands">👁 ${showAllHands?'ซ่อนมือ':'แสดงมือ'}</button>
      <button class="tbtn" data-ui="fs">⛶ เต็มจอ</button>
      <button class="tbtn" data-ui="rules">กติกา</button>
      <button class="tbtn" data-ui="setup">เริ่มใหม่</button>
    </div></header>`;
}
function centerHTML(){
  const at = active();
  const casting = !!(state.teamA.sandhiSlot || state.teamB.sandhiSlot);
  return `<section class="center-magic-area">
    <div class="turn-box"><div class="turn">รอบที่ ${state.round} · ตาของ <span class="${at.key}">ทีม ${at.key} ${esc(at.name)}</span>
      <span class="bigtime ${(state.turnLeft??TURN_SECONDS)<=10?'low':''}" id="tturn2">⌛ ${state.turnLeft ?? TURN_SECONDS}</span></div>
      <div class="tbar"><i id="tbar" style="width:${100*(state.turnLeft??TURN_SECONDS)/TURN_SECONDS}%"></i></div>
      <div class="phases">${PHASES.map(([k,l])=>`<span class="${state.phase===k?'on':''}">${l}</span>`).join('')}</div>
      <div class="msg ${msg.tone}">${esc(msg.text)}</div></div>
    <div class="sandhi-zone">
      <div class="magic-circle ${casting?'active':''}">${MAGIC_CIRCLE}</div>
      <div class="sandhi-info"><div class="zlabel">กองกลาง · SANDHI MAGIC</div><div class="zhint">ใช้ร่วมกัน · แตะกองที่ต้องการร่าย</div></div>
      ${MTYPES.map(mt => { const n = pileCount(mt); return `<figure class="mfig">${n ? `<div class="card pile mpile click" ${da('sandhiZone',null,mt)}>${magicFaceHTML(mt)}<span class="count">${n}</span></div>` : `<div class="slot mslot">ว่าง</div>`}<figcaption>${esc(magicName(mt))}</figcaption></figure>`; }).join('')}
    </div>
    <div class="ctrl">
      <button class="btn summon" ${da('summon')} ${state.summoned||state.summonLost?'disabled':''}>⚡ อัญเชิญ · ทีม ${at.key}</button>
      <button class="btn" ${da('endturn')}>จบเทิร์น ➜</button>
    </div></section>`;
}
/* หน้าต่างของขั้นตอนที่รอ (ครูกดบนทีวีได้เสมอ) */
function pendingHTML(){
  const p = state.pending; if(!p) return '';
  const tk = p.team, onPhone = phoneOn[tk];
  if(p.type === 'question'){
    const c = p.cid ? COMP[p.cid] : null;
    return `<div class="overlay"><div class="modal">
      <h2>${esc(p.title)}</h2>
      <div style="text-align:center"><span class="qnum">คำถามที่ ${p.i+1}/${p.n} · ทีม ${tk} ตอบ</span></div>
      <div class="qbox">${esc(p.q)}</div>
      <div class="qopts">${p.opts.map((o,i)=>{ let cls=''; if(p.revealed){ if(i===p.ci) cls='ok'; else if(i===p.picked) cls='no'; }
        const can = !p.revealed && !(ROOM && onPhone);
        return `<button class="btn qo ${cls}" ${can?`data-p="q${i}"`:'disabled'}>${esc(o)}</button>`; }).join('')}</div>
      ${p.revealed ? `${c && p.correct ? `<div class="mgrid"><div class="card" style="--cw:clamp(100px,20vh,200px)">${compFaceHTML(c)}</div></div>`:''}
        <div class="ans" style="font-size:clamp(20px,4vh,44px)">${p.correct?'✓ ถูกต้อง!':'✗ ยังไม่ถูก — คำตอบคือ “'+esc(p.a)+'”'}</div>`
      : `<p style="text-align:center">${ROOM && onPhone?`📱 รอทีม ${tk} (ผู้อัญเชิญ) เลือกคำตอบบนมือถือ`:`ให้ทีม ${tk} ตอบ แล้วกดตัวเลือก`}</p>`}
    </div></div>`;
  }
  if(p.type === 'offer'){
    const c = COMP[p.cid];
    return `<div class="overlay"><div class="modal"><div class="zoomwrap"><div class="card">${compFaceHTML(c)}</div>
      <div class="zoominfo"><h3>${esc(c.effect.name)}</h3><div class="eff">${esc(c.effect.description)}</div>
      <p class="note">ทีม ${tk} เลือกว่าจะใช้เอฟเฟคหรือไม่${onPhone?' (กดบนมือถือได้)':''} — ต้องตอบคำถามเพิ่ม ${RULES.questionsPerEffect} ข้อให้ถูก</p></div></div>
      <div class="mfoot"><button class="btn ghost" data-p="skip">ไม่ใช้เอฟเฟค</button><button class="btn summon" data-p="use">ตอบคำถามเพื่อใช้เอฟเฟค</button></div></div></div>`;
  }
  if(p.type === 'counter'){
    return `<div class="overlay"><div class="modal"><h2>${esc(p.title)}</h2>
      <p>ทีม ${tk} มีการ์ดป้องกันที่ใช้ได้ · เหลือเวลา <b id="ctime">${p.left}</b> วินาที (หมดเวลา = ไม่ป้องกัน)</p>
      ${ROOM && onPhone ? `<div class="qbox">📱 ทีม ${tk} กำลังตัดสินใจบนมือถือ…</div>` : ''}
      <div class="mgrid">${p.opts.map((cid,i)=>`<figure><div class="card ${ROOM&&onPhone?'':'pick'}" ${ROOM&&onPhone?'':`data-p="k${i}"`}>${compFaceHTML(COMP[cid])}</div><figcaption>${esc(COMP[cid].name)}<br><small>${esc(DEFENSE[COMP[cid].effect.op].label)}</small></figcaption></figure>`).join('')}</div>
      ${ROOM && onPhone ? '' : `<div class="mfoot"><button class="btn ghost" data-p="knone">ไม่ป้องกัน</button></div>`}
    </div></div>`;
  }
  if(p.type === 'choose'){
    const secret = onPhone && p.opts.some(o => o.root) ;
    return `<div class="overlay"><div class="modal"><h2>${esc(p.title)}</h2><p>${esc(p.sub)}</p>
      ${secret ? `<div class="qbox">📱 ทีม ${tk} กำลังเลือกบนมือถือ…</div>
          <div class="mgrid">${p.opts.map(o=>`<div class="card">${backFaceHTML(tk,'?')}</div>`).join('')}</div>
          <div class="mfoot"><button class="btn ghost" data-p="peek">ครูเลือกแทน (เปิดการ์ดบนทีวี)</button></div>`
      : `<div class="mgrid">${p.opts.map((o,i)=>`<div class="card pick" data-p="c${i}">${optFace(o)}</div>`).join('')}</div>`}
    </div></div>`;
  }
  return '';
}
let teacherPeek = false;
function render(){
  if(MODE !== 'TV') return;
  const board = document.getElementById('board');
  if(!state){ board.innerHTML = headerHTML(); return; }
  board.innerHTML = headerHTML() + teamHTML(team(other(view)),'far') + centerHTML() + teamHTML(team(view),'near');
  let ph = pendingHTML();
  if(teacherPeek && state.pending && state.pending.type==='choose'){
    const p = state.pending;
    ph = `<div class="overlay"><div class="modal"><h2>${esc(p.title)}</h2><p>${esc(p.sub)}</p><div class="mgrid">${p.opts.map((o,i)=>`<div class="card pick" data-p="c${i}">${optFace(o)}</div>`).join('')}</div></div></div>`;
  }
  if(!state.pending) teacherPeek = false;
  document.getElementById('pend').innerHTML = ph;
  scheduleSync();
  if(typeof hostPlayerView === 'function') hostPlayerView();
}
document.getElementById('pend').addEventListener('click', e => {
  const b = e.target.closest('[data-p]'); if(!b) return;
  const v = b.dataset.p;
  if(v[0]==='q'){ const p = state && state.pending; if(ROOM && p && phoneOn[p.team]) return; return answerQuestion('pick', +v.slice(1)); }
  if(v==='knone') return answerCounter(-1);
  if(v[0]==='k') return answerCounter(+v.slice(1));
  if(v==='use') return answerOffer(true);
  if(v==='skip') return answerOffer(false);
  if(v==='peek'){ teacherPeek = true; return render(); }
  if(v[0]==='c') return answerChoose(+v.slice(1));
});

/* ---------- เวลา ---------- */
function startTimer(){
  clearInterval(timerHandle);
  timerHandle = setInterval(() => {
    if(!state || state.paused || state.winner) return;
    if(state.timeLeft > 0) state.timeLeft--;
    const el = document.getElementById('timer');
    if(el){ el.textContent = '⏱ ' + fmtTime(state.timeLeft); el.classList.toggle('low', state.timeLeft<=300); }
    if(state.timeLeft % 5 === 0) scheduleSync();
    if(state.timeLeft === 0 && !state.timeUpShown){ state.timeUpShown = true; showTimeUp(); }
    tickTurn();
  }, 1000);
}
/* เวลาต่อเทิร์น 45 วินาที — หยุดเดินระหว่างรอฝ่ายตรงข้ามตัดสินใจป้องกัน (มีเวลานับของตัวเอง 15 วินาที) */
function tickTurn(){
  const p = state.pending;
  if(p && p.type === 'counter'){
    p.left = Math.max(0, (p.left ?? COUNTER_SECONDS) - 1);
    const el = document.getElementById('ctime'); if(el) el.textContent = p.left;
    if(p.left === 0) answerCounter(-1); else scheduleSync();
    return;
  }
  if(p && p.type === 'question' && p.revealed) return;               // กำลังแสดงเฉลย
  if(state.turnLeft == null) state.turnLeft = TURN_SECONDS;
  state.turnLeft = Math.max(0, state.turnLeft - 1);
  const el = document.getElementById('tturn');
  if(el){ el.textContent = `⌛ ${state.turnLeft} วิ`; el.classList.toggle('low', state.turnLeft <= 10); }
  const e2 = document.getElementById('tturn2'); if(e2){ e2.textContent = `⌛ ${state.turnLeft}`; e2.classList.toggle('low', state.turnLeft <= 10); }
  const e3 = document.getElementById('tbar'); if(e3){ e3.style.width = (100*state.turnLeft/TURN_SECONDS) + '%'; e3.classList.toggle('low', state.turnLeft <= 10); }
  if(state.turnLeft <= 10 || state.turnLeft % 5 === 0) scheduleSync();
  if(state.turnLeft === 0) turnTimeout();
}
function turnTimeout(){
  const p = state.pending, t = active();
  if(p){
    if(p.type === 'question'){ state.pending = null; const cb = pendingCb; pendingCb = null; say(`⌛ หมดเวลา — ทีม ${t.key} ตอบไม่ทัน`, 'bad'); cb.onFail(); }
    else if(p.type === 'offer'){ state.pending = null; pendingCb = null; }
    else if(p.type === 'choose'){ return answerChoose(Math.floor(Math.random() * p.opts.length)); }   // เลือกแบบสุ่มแทน แล้วนับเวลาต่อ
  }
  endTurn();
  say(`⌛ ${t.name} หมดเวลา ${TURN_SECONDS} วินาที · ${msg.text}`, 'bad'); render();
}
function showTimeUp(){
  const a = filled(state.teamA.completedZone).length, b = filled(state.teamB.completedZone).length;
  if(a !== b){ state.winner = a > b ? 'A' : 'B'; render(); return showWin(team(state.winner), 'หมดเวลา — '); }
  openModal(`<div style="text-align:center"><h2>⏱ หมดเวลา ${RULES.timeLimitMinutes} นาที</h2><div class="ans">เสมอ ${a} : ${b}</div><p>ตัดสินเสมอ หรือให้ครูตัดสินผู้ชนะ</p></div>
    <div class="mfoot"><button class="btn ghost" onclick="closeModal()">เสมอ</button>
    <button class="btn" onclick="state.winner='A';render();showWin(team('A'),'ครูตัดสิน — ')">ทีม A ชนะ</button>
    <button class="btn" onclick="state.winner='B';render();showWin(team('B'),'ครูตัดสิน — ')">ทีม B ชนะ</button></div>`);
}
function burstAtCenter(){
  if(MODE !== 'TV') return;
  const z = document.querySelector('.magic-circle'); if(!z) return;
  const r = z.getBoundingClientRect(), b = document.createElement('div'); b.className = 'burst';
  Object.assign(b.style,{left:(r.left+r.width/2)+'px',top:(r.top+r.height/2)+'px',width:r.width*.5+'px',height:r.width*.5+'px'});
  document.body.appendChild(b); setTimeout(()=>b.remove(), 950);
}
function animateSummon(k, slot, c, then){
  const from = document.querySelector(`.extra-deck-zone[data-team="${k}"] .card, .extra-deck-zone[data-team="${k}"] .slot`);
  const to = document.querySelector(`.completed-word-zone[data-team="${k}"] [data-slot="${slot}"]`);
  if(!from || !to || !to.animate || document.hidden){ then && then(); return; }
  const fr = from.getBoundingClientRect(), tr = to.getBoundingClientRect();
  to.style.visibility = 'hidden';
  const fly = document.createElement('div'); fly.className = 'fly';
  fly.style.cssText = `left:${fr.left}px;top:${fr.top}px;width:${fr.width}px;height:${fr.height}px;--cw:${fr.width}px`;
  fly.innerHTML = compFaceHTML(c); document.body.appendChild(fly);
  const dx = tr.left-fr.left, dy = tr.top-fr.top, s = tr.width/fr.width, lift = sideOf(k)==='far' ? 50 : -50;
  fly.animate([{transform:'translate(0,0) scale(1)', filter:'brightness(2.2)'},
    {transform:`translate(${dx*.5}px,${dy*.5+lift}px) scale(${s*1.6})`, filter:'brightness(1.5)', offset:.55},
    {transform:`translate(${dx}px,${dy}px) scale(${s})`, filter:'brightness(1)'}], {duration:1000, easing:'cubic-bezier(.3,.7,.3,1)'})
    .onfinish = () => { fly.remove(); const t2 = document.querySelector(`.completed-word-zone[data-team="${k}"] [data-slot="${slot}"]`); if(t2){ t2.style.visibility=''; t2.classList.add('landed'); } then && then(); };
  setTimeout(() => { fly.remove(); document.querySelectorAll('.completed-word-zone [data-slot]').forEach(e => e.style.visibility=''); }, 1600);
}

/* ---------- คลิกบนทีวี ---------- */
const boardEl = document.getElementById('board');
let pressTimer = null, suppressClick = false;
boardEl.addEventListener('pointerdown', e=>{ const el = e.target.closest('[data-uid]'); if(!el) return;
  pressTimer = setTimeout(()=>{ suppressClick = true; showZoom(el.dataset.uid); }, 480); });
['pointerup','pointerleave','pointercancel'].forEach(ev=>boardEl.addEventListener(ev, ()=>clearTimeout(pressTimer)));
boardEl.addEventListener('contextmenu', e=>{ const el = e.target.closest('[data-uid]'); if(!el) return; e.preventDefault(); showZoom(el.dataset.uid); });
boardEl.addEventListener('click', e=>{
  if(suppressClick){ suppressClick = false; return; }
  const ui = e.target.closest('[data-ui]');
  if(ui){
    const u = ui.dataset.ui;
    if(u==='view'){ view = other(view); if(state) state.selected = null; return render(); }
    if(u==='hands'){ showAllHands = !showAllHands; return render(); }
    if(u==='pause'){ if(state){ state.paused = !state.paused; render(); } return; }
    if(u==='join') return showRoomPanel();
    if(u==='fs') return toggleFullscreen();
    if(u==='rules') return showRules();
    if(u==='setup') return ROOM ? showRoomPanel() : showSetup();
  }
  const el = e.target.closest('[data-a]');
  if(el) act(el.dataset.a, el.dataset.k, el.dataset.x);
});
async function toggleFullscreen(){
  try{ if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch(err){ say('เบราว์เซอร์นี้ไม่อนุญาตโหมดเต็มจอ — ลองกด F11', 'bad'); render(); }
}

/* ---------- หน้าต่างทั่วไปบนทีวี ---------- */
const modalEl = document.getElementById('modal');
function openModal(html){ modalEl.innerHTML = `<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">${html}</div></div>`; }
function closeModal(){ modalEl.innerHTML = ''; }
function findCard(id){
  for(const t of [state.teamA, state.teamB]){
    const c = [...t.hand, ...t.fusionZone, ...t.discard, ...t.completedZone, ...t.extraDeck].find(c=>c && c.uid===id);
    if(c) return c;
  }
}
function showZoom(id){
  const c = state && findCard(id); if(!c) return;
  if(c.kind === 'extra') return showZoomComp(compOf(c), c.owner);
  const r = ROOT[c.name];
  openModal(`<div class="zoomwrap"><div class="card">${rootFaceHTML(c.name)}</div><div class="zoominfo">
    <h3>${esc(r.name)}</h3><p><span class="pill root">รากศัพท์</span>${r.release==='expansion'?'<span class="pill exp">ส่วนขยาย</span>':''} ทีม ${c.owner}</p>
    <div class="eff">ความหมาย: ${esc(r.meaning)}</div></div></div><div class="mfoot"><button class="btn" onclick="closeModal()">ปิด</button></div>`);
}
function showZoomComp(c, k){
  openModal(`<div class="zoomwrap"><div class="card">${compFaceHTML(c)}</div><div class="zoominfo">
    <h3>${esc(c.name)}</h3><p><span class="pill ${c.type}">${c.type==='samas'?'คำสมาส':'คำสนธิ'}</span>${c.release==='expansion'?'<span class="pill exp">ส่วนขยาย</span>':''}${k?` ทีม ${k}`:''}</p>
    <p>วัตถุดิบ: ${esc(c.rootNames.join(' + '))}${c.magic?' + เวท'+magicName(c.magic):''}</p>
    <div class="eff"><b>${esc(c.effect.name)}</b><br>${esc(c.effect.description)}${isDefense(c)?`<br><span class="pill samas">การ์ดป้องกัน</span> ใช้ตอบโต้เมื่อถูกโจมตี · ใช้ได้ 1 ครั้ง`:''}</div>
    ${c.artName && c.artName!==c.name?`<p class="note">ชื่อบนภาพการ์ด: ${esc(c.artName)}</p>`:''}</div></div>
    <div class="mfoot"><button class="btn" onclick="closeModal()">ปิด</button></div>`);
}
function showExtraDeck(t){
  if(MODE !== 'TV') return;
  openModal(`<h2>Extra Deck <span class="${t.key}">${t.key}</span> · ${esc(t.name)}</h2>
    <p>คำสมบูรณ์ที่ทีม ${t.key} ยังอัญเชิญได้ <b>${t.extraDeck.length}</b> ใบ — แตะการ์ดเพื่อดูเอฟเฟค</p>
    <div class="mgrid" style="--cw:clamp(80px,14vh,150px)">${t.extraDeck.map(x=>{const c=compOf(x);return `<figure><div class="card pick" onclick="showZoomComp(COMP['${c.id}'],'${t.key}')">${compFaceHTML(c)}</div><figcaption>${esc(c.name)}</figcaption></figure>`}).join('') || '<p>อัญเชิญครบทุกใบแล้ว</p>'}</div>
    <div class="mfoot"><button class="btn" onclick="closeModal()">ปิด</button></div>`);
}
function showList(title, sub, cards){
  openModal(`<h2>${esc(title)}</h2><p>${esc(sub)}</p><div class="mgrid">${cards.map(c=>`<div class="card">${rootFaceHTML(c.name)}</div>`).join('') || '<p>ยังไม่มีการ์ด</p>'}</div>
    <div class="mfoot"><button class="btn" onclick="closeModal()">ปิด</button></div>`);
}
function showWin(t, prefix=''){
  openModal(`<div style="text-align:center"><h2>${prefix}🏆 ทีม ${t.key} ชนะ!</h2><div class="ans">${esc(t.name)}</div>
    <div class="mgrid">${filled(t.completedZone).map(x=>`<div class="card">${compFaceHTML(compOf(x))}</div>`).join('')}</div></div>
    <div class="mfoot"><button class="btn ghost" onclick="closeModal()">ดูสนาม</button><button class="btn" onclick="showSetup()">เล่นใหม่</button></div>`);
  scheduleSync();
}
function showRules(){
  openModal(`<h2>กติกา FUSION DUEL</h2><ol class="rules">
    <li>2 ทีม ทีมละ ${RULES.playersPerTeam} คน ใช้มือร่วมกัน · ทีม A ฝั่งบน (น้ำเงิน) ทีม B ฝั่งล่าง (แดง)</li>
    <li>เล่นได้ 2 แบบ: เครื่องเดียว (แตะบนจอ) หรือออนไลน์ — ล็อกอิน Google สร้างห้องพร้อมรหัสผ่าน ให้ผู้เล่นสแกน QR เข้าห้อง เลือกทีม แล้วกด “พร้อม” ทั้งสองฝ่ายเกมจึงเริ่ม · การ์ดในมือของแต่ละทีมเห็นเฉพาะทีมตัวเอง</li>
    <li>สำรับทีมละ ${RULES.mainDeckSizePerTeam} ใบ · เริ่มถือ ${RULES.openingHandSize} ใบ · จั่วเทิร์นละ ${RULES.drawPerTurn} ใบ (ทีมแรกงดจั่วเทิร์นแรก) · สำรับหมดให้ข้ามการจั่ว</li>
    <li>ลำดับเทิร์น: จั่ว → เตรียม → ฟิวชัน → ตอบคำถาม → เอฟเฟค → จบเทิร์น</li>
    <li>วางรากศัพท์ 2 ใบ (คำสนธิต้องร่ายเวทสนธิให้ถูกชนิด: สระสนธิ / พยัญชนะสนธิ / นิคหิตสนธิ) แล้วกด “⚡ อัญเชิญ” ได้เทิร์นละ ${RULES.summonsPerTurn} ครั้ง</li>
    <li>ต้องตอบคำถามแบบเลือกตอบถูก ${RULES.questionsPerSummon} ข้อ จึงอัญเชิญสำเร็จ · ตอบผิด: รากศัพท์ค้างในช่องและเสียสิทธิ์อัญเชิญในเทิร์นนั้น</li>
    <li>การ์ดโจมตี/สนับสนุน: ใช้เอฟเฟคได้ตอนอัญเชิญ (ต้องตอบคำถามเพิ่ม ${RULES.questionsPerEffect} ข้อให้ถูก)</li>
    <li>การ์ดป้องกัน (🛡): ไม่ใช้ตอนอัญเชิญ — เมื่อฝ่ายตรงข้ามใช้เอฟเฟคโจมตี ทีมเรามี ${COUNTER_SECONDS} วินาทีเลือกเปิดการ์ดป้องกันเพื่อยกเลิก · ใช้แล้วหมดสิทธิ์ใช้ซ้ำ</li>
    <li>ลงคำสมบูรณ์ (อัญเชิญ) ได้เทิร์นละ 1 ใบเท่านั้น</li>
    <li>ต้องวางรากศัพท์ให้ตรงช่องตามสูตรบนการ์ด: ช่อง 1 = รากศัพท์ตัวหน้า, ช่อง 2 = รากศัพท์ตัวหลัง (เช่น อุทกภัย = ช่อง 1 อุทก · ช่อง 2 ภัย) — วางสลับช่องจะอัญเชิญไม่ได้</li>
    <li>เวลาเทิร์นละ ${TURN_SECONDS} วินาที — หมดเวลาจะจบเทิร์นอัตโนมัติ (ถ้ากำลังตอบคำถามจะนับว่าตอบผิด)</li>
    <li>ทีมแรกที่มีคำสมบูรณ์ครบ ${RULES.winAtCompletedCards} ใบชนะ · ครบ ${RULES.timeLimitMinutes} นาทีให้นับคำสมบูรณ์</li></ol>
    <div class="mfoot"><button class="btn" onclick="closeModal()">เข้าใจแล้ว</button></div>`);
}
const SAVE_KEY = 'fusion-duel-save';
function loadSave(){ try{ const s = JSON.parse(localStorage.getItem(SAVE_KEY + (ROOM?'-'+ROOM:''))||'null'); return s && s.state && !s.state.winner ? s : null; }catch(e){ return null; } }
function resumeGame(){
  const s = loadSave(); if(!s) return;
  if(!s.state.sandhiZone || !s.state.sandhiZone.piles) return showSetup();
  state = s.state; uidN = s.uidN || 500; msg = {text:'ดำเนินเกมเดิมต่อ', tone:''};
  if(state.pending){ state.pending = null; state.phase = 'PREPARATION'; }
  pendingCb = null; closeModal(); startTimer(); render();
}
function showSetup(){
  const a = state ? state.teamA.name : 'ทีมนักถอดรหัส', b = state ? state.teamB.name : 'ทีมจอมเวท';
  const core = GD.completedCards.filter(c=>c.release==='core').length, all = GD.completedCards.length;
  const rc = GD.roots.filter(r=>r.release==='core').length, saved = loadSave();
  openModal(`<div class="setup" style="text-align:center"><div class="logo" style="justify-content:center">${LOTUS}<div><div class="l1">SAMAS CODEBREAKERS</div><div class="l2">FUSION DUEL</div></div>${LOTUS}</div></div>
    <div class="setup">
    <label>ชื่อทีม A (ฝั่งบน · สีน้ำเงิน)</label><input type="text" id="nA" value="${esc(a)}">
    <label>ชื่อทีม B (ฝั่งล่าง · สีแดง)</label><input type="text" id="nB" value="${esc(b)}">
    <label>ชุดการ์ด</label>
    <div class="chk"><input type="radio" name="rel" id="relCore" checked><span>ชุดหลัก — รากศัพท์ ${rc} แบบ · คำสมบูรณ์ ${core} ใบ</span></div>
    <div class="chk"><input type="radio" name="rel" id="relExp"><span>ชุดหลัก + ส่วนขยาย — รากศัพท์ ${GD.roots.length} แบบ · คำสมบูรณ์ ${all} ใบ</span></div>
    <p class="note">โหมดเครื่องเดียว: ทั้งสองทีมแตะเล่นบนจอนี้ · ถ้าต้องการให้แต่ละทีมเล่นบนมือถือของตัวเอง ให้ออกไปหน้าแรกแล้วสร้างห้องออนไลน์</p>
    <div class="mfoot">${saved?`<button class="btn ghost" onclick="resumeGame()">เล่นต่อเกมเดิม (รอบ ${saved.state.round})</button>`:''}<button class="btn ghost" onclick="showRules()">กติกา</button>
      <button class="btn summon" onclick="newGame(document.getElementById('nA').value.trim()||'ทีม A',document.getElementById('nB').value.trim()||'ทีม B',document.getElementById('relExp').checked)">เริ่มดวล ⚔</button></div></div>`);
}

