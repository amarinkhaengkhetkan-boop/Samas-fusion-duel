/* =====================================================================
   5) ฟีเจอร์สำหรับการเรียนรู้
   - บันทึกคำตอบอัตโนมัติ + รายงานครู + ดาวน์โหลด CSV
   - จอสรุปบทเรียนหลังเกม (ช่วงสะท้อนคิด)
   - คลังคำ · โหมดฝึกหัดการเล่นแบบมีผู้แนะนำ · โหมดลื่น
   ===================================================================== */

/* ---------- หน้าต่างลอยที่อยู่เหนือทุกหน้าจอ (ใช้ได้ทั้งหน้าแรกและในเกม) ---------- */
function pop(html, cls=''){
  let el = document.getElementById('pop');
  if(!el){ el = document.createElement('div'); el.id = 'pop'; document.body.appendChild(el); }
  el.innerHTML = `<div class="overlay popov" onclick="if(event.target===this)closePop()"><div class="modal ${cls}">${html}</div></div>`;
  document.documentElement.classList.add('pop-open');
  return el;
}
function closePop(){ const el = document.getElementById('pop'); if(el) el.innerHTML = ''; document.documentElement.classList.remove('pop-open'); }
function toast(t){
  let el = document.getElementById('toast');
  if(!el){ el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
  el.textContent = t; el.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 2600);
}
function showRulesPop(){ showRules(); const m = document.getElementById('modal'); const html = m.querySelector('.modal').innerHTML; closeModal(); pop(html.replace(/closeModal\(\)/g, 'closePop()')); }

/* ---------- โหมดลื่น: ปิดเอฟเฟกต์หนัก ๆ สำหรับเครื่องสเปกต่ำ ---------- */
function toggleLite(){
  const on = !document.body.classList.contains('lite');
  document.body.classList.toggle('lite', on);
  try{ localStorage.setItem('fusion-duel-lite', on ? '1' : '0'); }catch(e){}
  toast(on ? '⚡ เปิดโหมดลื่น — ลดเอฟเฟกต์ภาพ' : 'ปิดโหมดลื่น');
  if(typeof state !== 'undefined' && state && MODE === 'TV') render();
  const f = document.querySelector('.landfoot'); if(f) f.innerHTML = landFoot().replace(/^<div class="landfoot">|<\/div>$/g, '');
}
try{ if(localStorage.getItem('fusion-duel-lite') === '1') document.body.classList.add('lite'); }catch(e){}

/* =====================================================================
   บันทึกคำตอบ & รายงาน
   ===================================================================== */
const TYPE_KEY = c => c ? (c.type === 'samas' ? 'samas' : (c.magic || 'vowel_sandhi')) : 'other';
const TYPE_LABEL = {samas:'คำสมาส', vowel_sandhi:'สระสนธิ', consonant_sandhi:'พยัญชนะสนธิ', niggahit_sandhi:'นิคหิตสนธิ', other:'อื่น ๆ'};
function logAnswer(p, cb, idx){
  if(!state || state.practice || !p || !cb) return;
  const c = COMP[cb.qs && cb.qs[cb.i] ? cb.qs[cb.i].cid : p.cid];
  (state.log = state.log || []).push({
    t: Date.now(), turn: state.turnNo, team: p.team,
    uid: p.au || null, who: p.an || (team(p.team) ? team(p.team).name : 'ทีม ' + p.team),
    kind: cb.kind || 'summon', qt: cb.qt || '', cid: c ? c.id : '', word: c ? c.name : '', wtype: TYPE_KEY(c),
    q: p.q, pick: idx >= 0 ? p.opts[idx] : '(หมดเวลา)', ans: cb.a, ok: idx === cb.ci ? 1 : 0,
    sec: Math.max(0, Math.round((Date.now() - (cb.at || Date.now())) / 1000))
  });
  persistLog();
}
let persistT = null;
function persistLog(){
  clearTimeout(persistT);
  persistT = setTimeout(() => {
    saveReport();
    if(typeof ROOM !== 'undefined' && ROOM && IS_HOST && DB && state) rr('log').set(state.log || []).catch(e => console.warn(e));
  }, 400);
}
const REP_KEY = 'fusion-duel-reports';
function loadReports(){ try{ return JSON.parse(localStorage.getItem(REP_KEY) || '[]'); }catch(e){ return []; } }
function reportFromState(){
  if(!state) return null;
  return { id: state.gid || 'g', date: state.startedAt || Date.now(), room: state.room || (typeof ROOM !== 'undefined' ? ROOM : null),
    A: state.teamA.name, B: state.teamB.name, winner: state.winner || null, practice: !!state.practice, drill: !!state.drill,
    score: {A: filled(state.teamA.completedZone).length, B: filled(state.teamB.completedZone).length},
    history: state.history || [], log: state.log || [] };
}
function saveReport(){
  const r = reportFromState(); if(!r || r.practice || !r.log.length) return;
  const all = loadReports().filter(x => x.id !== r.id);
  all.unshift(r);
  try{ localStorage.setItem(REP_KEY, JSON.stringify(all.slice(0, 40))); }catch(e){}
}
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
const fmtDate = t => { const d = new Date(t); return d.toLocaleDateString('th-TH', {day:'numeric', month:'short', year:'2-digit'}) + ' ' + d.toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}); };
function groupBy(log, keyFn){
  const m = {};
  log.forEach(e => { const k = keyFn(e); (m[k] = m[k] || {n:0, ok:0, sec:0, items:[]}); m[k].n++; m[k].ok += e.ok; m[k].sec += e.sec; m[k].items.push(e); });
  return m;
}
const barCell = (ok, n) => `<td class="num">${ok}/${n}</td><td class="barc"><div class="pbar ${pct(ok,n)>=80?'hi':pct(ok,n)>=60?'mid':'lo'}"><i style="width:${pct(ok,n)}%"></i></div><b>${pct(ok,n)}%</b></td>`;
function showReport(r){
  if(!r) return pop(`<h2>📊 รายงานผล</h2><p>ยังไม่มีเกมที่กำลังเล่น</p><div class="mfoot"><button class="btn" onclick="showReportList()">ดูรายงานย้อนหลัง</button><button class="btn ghost" onclick="closePop()">ปิด</button></div>`);
  const log = r.log || [];
  if(!log.length) return pop(`<h2>📊 รายงานผล</h2><p>ยังไม่มีการตอบคำถามในเกมนี้ — รายงานจะเริ่มบันทึกเมื่อมีทีมอัญเชิญหรือใช้เอฟเฟค</p>
    <div class="mfoot"><button class="btn ghost" onclick="showReportList()">รายงานย้อนหลัง</button><button class="btn" onclick="closePop()">ปิด</button></div>`, 'wide');
  const tot = log.reduce((a, e) => a + e.ok, 0);
  const byTeam = groupBy(log, e => e.team), byWho = groupBy(log, e => e.team + '|' + e.who), byType = groupBy(log, e => e.wtype), byQt = groupBy(log, e => e.qt);
  const wrong = groupBy(log.filter(e => !e.ok), e => e.cid);
  const top = Object.entries(wrong).sort((a, b) => b[1].n - a[1].n).slice(0, 5);
  const rows = (m, label) => Object.entries(m).sort((a,b) => a[0].localeCompare(b[0])).map(([k, v]) => `<tr><td>${label(k)}</td>${barCell(v.ok, v.n)}<td class="num">${(v.sec / v.n).toFixed(1)} วิ</td></tr>`).join('');
  const head = `<tr><th></th><th>ถูก/ทั้งหมด</th><th>ร้อยละที่ถูก</th><th>เวลาเฉลี่ย</th></tr>`;
  pop(`<h2>📊 รายงานผลการตอบ</h2>
    <p>${fmtDate(r.date)}${r.room ? ' · ห้อง ' + r.room : ''}${r.drill ? ' · 🏋️ โหมดซ้อม' : ''} · ทีม A: <b>${esc(r.A)}</b> (${r.score ? r.score.A : '-'}/4) · ทีม B: <b>${esc(r.B)}</b> (${r.score ? r.score.B : '-'}/4)${r.winner ? ' · 🏆 ทีม ' + r.winner + ' ชนะ' : ''}</p>
    <div class="kpis"><div><b>${log.length}</b><span>คำถามที่ตอบ</span></div><div><b>${pct(tot, log.length)}%</b><span>ตอบถูกรวม</span></div><div><b>${(log.reduce((a,e)=>a+e.sec,0)/log.length).toFixed(1)} วิ</b><span>เวลาเฉลี่ยต่อข้อ</span></div><div><b>${(r.history||[]).length}</b><span>คำที่อัญเชิญ</span></div></div>
    <h3>รายทีม</h3><table class="rtab">${head}${rows(byTeam, k => 'ทีม ' + k)}</table>
    <h3>รายคน (ผู้ตอบ)</h3><table class="rtab">${head}${rows(byWho, k => { const [t, w] = k.split('|'); return `<span class="tchip ${t}">${t}</span> ${esc(w)}`; })}</table>
    <h3>แยกตามชนิดคำ</h3><table class="rtab">${head}${rows(byType, k => TYPE_LABEL[k] || k)}</table>
    <h3>แยกตามประเภทคำถาม</h3><table class="rtab">${head}${rows(byQt, k => QT_LABEL[k] || k)}</table>
    <h3>คำที่ตอบผิดบ่อยที่สุด</h3>${top.length ? `<ol class="toplist">${top.map(([cid, v]) => `<li><b>${esc(COMP[cid] ? COMP[cid].name : cid)}</b> — ผิด ${v.n} ครั้ง <span class="zhint">${esc(COMP[cid] ? cExplain(COMP[cid]) : '')}</span></li>`).join('')}</ol>` : '<p>ไม่มีข้อที่ตอบผิด 🎉</p>'}
    <p class="note">ร้อยละที่ตอบถูกระหว่างเล่น ใช้ประกอบคะแนนระหว่างเรียน (E1) ได้ · ไฟล์ CSV เปิดด้วย Excel หรือ Google Sheets</p>
    <div class="mfoot"><button class="btn ghost" onclick="showReportList()">รายงานย้อนหลัง</button><button class="btn" onclick="downloadCSV('${esc(r.id)}')">⬇ ดาวน์โหลด CSV</button><button class="btn summon" onclick="closePop()">ปิด</button></div>`, 'wide');
}
function findReport(id){ const cur = reportFromState(); if(cur && cur.id === id) return cur; return loadReports().find(x => x.id === id); }
function downloadCSV(id){
  const r = findReport(id); if(!r) return;
  const cols = ['เวลา','ห้อง','ทีม','ผู้ตอบ','ช่วง','ประเภทคำถาม','คำ','ชนิดคำ','คำถาม','คำตอบที่เลือก','คำตอบที่ถูก','ถูก(1)/ผิด(0)','วินาที'];
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [cols.map(q).join(',')].concat((r.log || []).map(e => [new Date(e.t).toLocaleString('th-TH'), r.room || '', e.team, e.who, e.kind === 'effect' ? 'ใช้เอฟเฟค' : 'อัญเชิญ',
    QT_LABEL[e.qt] || e.qt, e.word, TYPE_LABEL[e.wtype] || e.wtype, e.q, e.pick, e.ans, e.ok, e.sec].map(q).join(',')));
  const blob = new Blob(['﻿' + lines.join('\r\n')], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `fusion-duel-${new Date(r.date).toISOString().slice(0,10)}-${r.room || 'local'}.csv`;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function showReportList(){
  const all = loadReports(), cur = reportFromState();
  pop(`<h2>📊 รายงานผลย้อนหลัง</h2><p>เก็บไว้ในเครื่องนี้ (เครื่องที่เป็นจอกลาง) สูงสุด 40 เกมล่าสุด</p>
    ${cur && !cur.practice ? `<button class="btn summon" style="margin-bottom:10px" onclick="showReport(reportFromState())">เกมที่กำลังเล่นอยู่</button>` : ''}
    <div class="replist">${all.map(r => `<button class="repitem" onclick="showReport(findReport('${esc(r.id)}'))"><b>${fmtDate(r.date)}</b>${r.room ? ' · ห้อง ' + r.room : ''}${r.drill ? ' · 🏋️ ซ้อม' : ' · ⚔ จริง'}<br>
      <span class="zhint">A: ${esc(r.A)} (${r.score ? r.score.A : 0}) · B: ${esc(r.B)} (${r.score ? r.score.B : 0}) · ตอบ ${r.log.length} ข้อ · ถูก ${pct(r.log.reduce((a,e)=>a+e.ok,0), r.log.length)}%</span></button>`).join('') || '<p class="zhint">ยังไม่มีรายงาน — เล่นเกมบนเครื่องนี้ก่อน</p>'}</div>
    <div class="mfoot"><button class="btn" onclick="closePop()">ปิด</button></div>`, 'wide');
}

/* =====================================================================
   จอสรุปบทเรียนหลังเกม (สะท้อนคิด)
   ===================================================================== */
function debriefQuestions(){
  const cs = (state.history || []).map(h => COMP[h.cid]).filter(Boolean);
  const sam = cs.filter(c => c.type === 'samas'), san = cs.filter(c => c.type === 'sandhi');
  const qs = [];
  if(san.length){ const w = pick(san); qs.push(`“${w.name}” มาจาก ${w.rootNames.join(' + ')} — เสียงตรงรอยต่อเปลี่ยนไปอย่างไร และทำไมจึงไม่ใช่คำสมาส?`); }
  if(sam.length && san.length){ qs.push(`เปรียบเทียบ “${pick(sam).name}” กับ “${pick(san).name}” — วิธีสร้างคำสองคำนี้ต่างกันอย่างไร?`); }
  if(sam.length){ const s = pick(sam); qs.push(`ถ้าแปล “${s.name}” จากหน้าไปหลังจะผิดอย่างไร? ความหมายที่ถูกต้องคืออะไร?`); }
  const log = state.log || [], wrong = groupBy(log.filter(e => !e.ok), e => e.cid);
  const most = Object.entries(wrong).sort((a, b) => b[1].n - a[1].n)[0];
  if(most && COMP[most[0]]) qs.push(`คำที่ห้องเราตอบผิดบ่อยที่สุดคือ “${COMP[most[0]].name}” — ช่วยกันอธิบายหลักการของคำนี้ให้เพื่อนฟัง`);
  const roots = [...new Set(cs.flatMap(c => c.rootNames))];
  qs.push(roots.length ? `ลองคิดคำใหม่ที่ใช้รากศัพท์ “${pick(roots)}” แล้วบอกว่าเป็นคำสมาสหรือคำสนธิ เพราะอะไร?` : 'ลองยกตัวอย่างคำสมาส 1 คำและคำสนธิ 1 คำ แล้วอธิบายความต่าง');
  return qs.slice(0, 3);
}
function showDebrief(){
  if(!state) return;
  const rows = k => (state.history || []).filter(h => h.k === k).map(h => { const c = COMP[h.cid]; return c ? `<div class="drow"><div class="card">${compFaceHTML(c)}</div><div>
      <div class="dname">${esc(c.name)} <span class="pill ${c.type}">${c.type==='samas'?'คำสมาส':magicName(c.magic)}</span></div>
      <div class="zhint">อ่านว่า ${esc(c.reading || '-')} · ${esc(c.rootNames.join(' + '))}${c.magic?' + เวท'+esc(magicName(c.magic)):''}</div>
      <div class="dex">💡 ${esc(cExplain(c))}</div></div></div>` : ''; }).join('') || '<p class="zhint">ยังไม่ได้อัญเชิญคำ</p>';
  openModal(`<h2>📖 สรุปบทเรียนจากเกมนี้</h2>
    <div class="dgrid"><section><h3 class="A">ทีม A · ${esc(state.teamA.name)}</h3>${rows('A')}</section><section><h3 class="B">ทีม B · ${esc(state.teamB.name)}</h3>${rows('B')}</section></div>
    <h3>💬 คำถามชวนคิด</h3><ol class="dq">${debriefQuestions().map(q => `<li>${esc(q)}</li>`).join('')}</ol>
    <div class="mfoot"><button class="btn ghost" onclick="showReport(reportFromState())">📊 รายงานผล</button><button class="btn ghost" onclick="closeModal()">ดูสนาม</button><button class="btn" onclick="${typeof ROOM!=='undefined'&&ROOM?'showRoomPanel()':'showSetup()'}">เล่นใหม่</button></div>`);
  const m = document.querySelector('#modal .modal'); if(m) m.classList.add('wide');
}

/* =====================================================================
   คลังคำ
   ===================================================================== */
let glossTab = 'all', glossQ = '';
function showGlossary(){
  const tabs = [['all','ทั้งหมด'],['samas','คำสมาส'],['vowel_sandhi','สระสนธิ'],['consonant_sandhi','พยัญชนะสนธิ'],['niggahit_sandhi','นิคหิตสนธิ'],['roots','รากศัพท์']];
  const q = glossQ.trim();
  let body;
  if(glossTab === 'roots'){
    const list = GD.roots.filter(r => !q || r.name.includes(q) || r.meaning.includes(q));
    body = `<div class="glist roots">${list.map(r => `<div class="gitem"><div class="card">${rootFaceHTML(r.name)}</div><div><div class="gname">${esc(r.name)}</div><div>${esc(r.meaning)}</div>
      ${r.title?`<div class="zhint">“${esc(r.title)}”</div>`:''}<div class="zhint">ใช้ใน: ${esc(GD.completedCards.filter(c => c.rootNames.includes(r.name)).map(c => c.name).join(', ') || 'ยังไม่มีคำในเกม (รอการ์ดคำสมบูรณ์)')}</div>${r.release==='expansion'?'<span class="pill exp">ส่วนขยาย</span>':''}</div></div>`).join('')}</div>`;
  } else {
    const list = GD.completedCards.filter(c => (glossTab === 'all' || TYPE_KEY(c) === glossTab) && (!q || c.name.includes(q) || (c.meaning||'').includes(q) || c.rootNames.join('').includes(q)));
    body = `<div class="glist">${list.map(c => `<div class="gitem"><div class="card">${compFaceHTML(c)}</div><div>
      <div class="gname">${esc(c.name)} <span class="pill ${c.type}">${c.type==='samas'?'คำสมาส':magicName(c.magic)}</span>${c.rarity?`<span class="pill rar ${c.rarity}">${c.rarity}</span>`:''}${c.release==='expansion'?'<span class="pill exp">ส่วนขยาย</span>':''}</div>
      <div class="zhint">อ่านว่า <b>${esc(c.reading || '-')}</b></div>
      <div>${esc(c.rootNames.map(n => `${n} (${ROOT[n] ? ROOT[n].meaning : ''})`).join(' + '))}${c.magic?' + เวท'+esc(magicName(c.magic)):''}</div>
      <div class="dex">💡 ${esc(cExplain(c))}</div>
      <div class="zhint">พลัง: ${esc(c.effect.name)} — ${esc(c.effect.description)}</div></div></div>`).join('') || '<p class="zhint">ไม่พบคำที่ค้นหา</p>'}</div>`;
  }
  pop(`<h2>📖 คลังคำ FUSION DUEL</h2>
    <div class="gtabs">${tabs.map(([k, l]) => `<button class="gtab ${glossTab===k?'on':''}" onclick="glossTab='${k}';showGlossary()">${l}</button>`).join('')}</div>
    <input class="gsearch" type="search" placeholder="ค้นหาคำ รากศัพท์ หรือความหมาย…" value="${esc(q)}" oninput="glossQ=this.value;clearTimeout(window._gq);window._gq=setTimeout(()=>{showGlossary();const i=document.querySelector('.gsearch');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length);}},350)">
    ${body}
    <p class="note">คำอ่านและความหมายเป็นข้อมูลประกอบการเรียน — ครูตรวจสอบกับพจนานุกรมฉบับราชบัณฑิตยสถานอีกครั้ง</p>
    <div class="mfoot"><button class="btn" onclick="closePop()">ปิด</button></div>`, 'wide gloss');
}

/* =====================================================================
   โหมดฝึกหัดการเล่น — มี “ผู้พิทักษ์รหัส” แนะนำทีละขั้น ไม่จับเวลา คู่ฝึกเล่นอัตโนมัติ
   ===================================================================== */
let TUT = null;
const tutLayout = () => (window.innerWidth < 820 || window.innerHeight > window.innerWidth) ? 'P' : 'TV';
const tA = () => state.teamA;
const handUid = name => { const c = tA().hand.find(c => c.name === name); return c ? c.uid : null; };
const compCount = () => filled(tA().completedZone).length;
const TUT_STEPS = [
  { say: 'สวัสดี! ฉันคือ <b>ผู้พิทักษ์รหัส</b> ✨ เป้าหมายของเกมคือ <b>อัญเชิญคำสมบูรณ์ให้ครบ 4 ใบก่อนคู่แข่ง</b> โดยนำการ์ดรากศัพท์มาฟิวชันกัน — มาลองทีละขั้นกัน', next: true },
  { say: 'ทุกเทิร์นเริ่มด้วยการ <b>จั่วการ์ด 1 ใบ</b> — แตะปุ่ม <b>จั่ว</b>', hl: {P:'[data-m="draw"]', TV:'[data-a="main"][data-k="A"]'}, done: () => state.hasDrawn },
  { say: 'ในมือมี <b>อุทก</b> (น้ำ) และ <b>ภัย</b> (อันตราย) — แตะการ์ด <b>อุทก</b> แล้ววางลง <b>ช่อง 1</b>', hl: () => ({P:`[data-m="h${handUid('อุทก')}"],[data-m="pl0"]`, TV:`[data-uid="${handUid('อุทก')}"],[data-a="fusion"][data-k="A"][data-x="0"]`}),
    done: () => tA().fusionZone[0] && tA().fusionZone[0].name === 'อุทก' },
  { say: 'ต่อไปแตะ <b>ภัย</b> แล้ววางลง <b>ช่อง 2</b> — ต้องวางให้ตรงช่องตามสูตรเสมอ: ช่อง 1 = คำหน้า · ช่อง 2 = คำหลัง', hl: () => ({P:`[data-m="h${handUid('ภัย')}"],[data-m="pl1"]`, TV:`[data-uid="${handUid('ภัย')}"],[data-a="fusion"][data-k="A"][data-x="1"]`}),
    done: () => tA().fusionZone[1] && tA().fusionZone[1].name === 'ภัย' && tA().fusionZone[0] && tA().fusionZone[0].name === 'อุทก' },
  { say: 'ครบ 2 ช่องแล้ว! กด <b>⚡ อัญเชิญ</b> แล้วตอบคำถามให้ถูก 2 ข้อ — <b>อุทก + ภัย</b> เป็นคำสมาส ต่อกันได้เลยโดยไม่เปลี่ยนรูป', hl: {P:'[data-m="summon"]', TV:'[data-a="summon"]'}, done: () => compCount() >= 1 },
  { say: 'อัญเชิญสำเร็จ! 🎉 คำสมบูรณ์แต่ละใบมี <b>พลังพิเศษ</b> ตามความหมายของคำ — ลองกด <b>ใช้</b> แล้วตอบคำถามอีก 1 ข้อเพื่อเปิดพลัง', hl: {P:'[data-m="offer1"]', TV:'[data-p="use"]'},
    done: () => TUT.sawOffer && !state.pending, watch: () => { if(state.pending && state.pending.type === 'offer') TUT.sawOffer = true; } },
  { say: 'ลงคำสมบูรณ์ได้ <b>เทิร์นละ 1 ใบ</b> — กด <b>จบเทิร์น</b> เพื่อส่งตาให้คู่ฝึก', hl: {P:'[data-m="end"]', TV:'[data-a="endturn"]'}, done: () => state.turn === 'B' },
  { say: 'คู่ฝึกกำลังเล่น… รอสักครู่', done: () => state.turn === 'A' && state.turnNo >= 3 },
  { say: 'กลับมาเป็นตาเราแล้ว — <b>จั่ว</b> ก่อนเหมือนเดิม', hl: {P:'[data-m="draw"]', TV:'[data-a="main"][data-k="A"]'}, done: () => state.hasDrawn },
  { say: 'คราวนี้ลอง <b>คำสนธิ</b>: วาง <b>นร</b> (คน) ลงช่อง 1 และ <b>อินทร์</b> (ผู้เป็นใหญ่) ลงช่อง 2', hl: () => ({P:`[data-m="h${handUid('นร') || handUid('อินทร์')}"],[data-m="pl0"],[data-m="pl1"]`, TV:`[data-uid="${handUid('นร') || handUid('อินทร์')}"],[data-a="fusion"][data-k="A"]`}),
    done: () => tA().fusionZone[0] && tA().fusionZone[0].name === 'นร' && tA().fusionZone[1] && tA().fusionZone[1].name === 'อินทร์' },
  { say: 'คำสนธิต้องใช้ <b>เวทสนธิ</b> จากกองกลางช่วยหลอมเสียง — <b>นร + อินทร์</b> สระ อะ กลมกลืนกับ อิ จึงต้องใช้ <b>เวทสระสนธิ</b> แตะที่กองเวทสระสนธิ', hl: {P:'[data-m="cast:vowel_sandhi"],[data-m="castmenu"]', TV:'[data-a="sandhiZone"][data-x="vowel_sandhi"]'},
    done: () => tA().sandhiSlot && (tA().sandhiSlot.mtype || 'vowel_sandhi') === 'vowel_sandhi' },
  { say: 'พร้อมแล้ว! กด <b>⚡ อัญเชิญ</b> — สังเกตว่า อะ + อิ → อิ จึงได้ <b>นรินทร์</b> (ผู้เป็นใหญ่ในหมู่คน = พระราชา)', hl: {P:'[data-m="summon"]', TV:'[data-a="summon"]'}, done: () => compCount() >= 2 },
  { say: 'เยี่ยม! จะใช้พลังของ <b>นรินทร์</b> หรือไม่ก็ได้ — ลองเลือกดู', done: () => TUT.sawOffer2 && !state.pending,
    watch: () => { if(state.pending && state.pending.type === 'offer') TUT.sawOffer2 = true; if(!state.pending && compCount() >= 2 && !TUT.sawOffer2 && TUT.stepAt && Date.now() - TUT.stepAt > 2500) TUT.sawOffer2 = true; } },
  { say: 'ฉันมอบการ์ด <b>เทวินทร์</b> 🛡 ให้ทีมเรา (ดูที่ช่องคำสมบูรณ์) — <b>การ์ดป้องกัน</b> ไม่ใช้ตอนอัญเชิญ แต่เก็บไว้ใช้ตอนถูกโจมตี ใช้ได้ครั้งเดียว · กด <b>จบเทิร์น</b> แล้วระวังคู่ฝึกให้ดี!', hl: {P:'[data-m="end"]', TV:'[data-a="endturn"]'},
    enter: () => { const t = tA(), i = t.completedZone.findIndex(x => !x); if(i >= 0){ t.completedZone[i] = {uid:'tutDef', kind:'extra', owner:'A', cid:'C14'}; t.extraDeck = t.extraDeck.filter(x => x.cid !== 'C14'); } },
    done: () => state.turn === 'B' },
  { say: '⚔️ คู่ฝึกใช้พลัง <b>อุทกภัย</b> โจมตีการ์ดในมือเรา! แตะ <b>เทวินทร์</b> เพื่อป้องกัน (เกมจริงมีเวลา 15 วินาที)', hl: {P:'[data-m="ct0"]', TV:'[data-p="k0"]'},
    done: () => { const x = tA().completedZone.find(x => x && x.cid === 'C14'); return x && x.used; } },
  { say: '🛡 ป้องกันสำเร็จ! <b>สรุปกติกา:</b> จั่ว → วางรากศัพท์ให้ตรงช่อง → (คำสนธิร่ายเวทให้ถูกชนิด) → อัญเชิญ + ตอบคำถาม → ใช้พลัง → จบเทิร์น · เกมจริงมีเวลา <b>เทิร์นละ 45 วินาที</b> และทีมแรกที่ครบ <b>4 ใบ</b> ชนะ', final: true }
];
function tutStart(){
  closePop(); closeScr(); closeModal();
  online = false; ROOM = null; IS_HOST = true; MYSEAT = 'A'; ME = 'A';
  TUT = { i: 0, layout: tutLayout(), sawOffer:false, sawOffer2:false, botBusy:false };
  newGame('ทีมของเรา', 'คู่ฝึก', false);
  state.practice = true; state.turnLeft = null;
  const t = tA(), mk = n => ({uid: uid('Ar'), kind:'root', owner:'A', name:n});
  t.hand = ['อุทก','ภัย','นร','อินทร์','คุณ'].map(mk);
  t.mainDeck.push(mk('ธรรม'));                      // ใบบนสุด = ธรรม (จั่วเทิร์นแรก)
  state.hasDrawn = false; state.phase = 'DRAW'; say('โหมดฝึกหัด — ทำตามผู้พิทักษ์รหัส');
  if(TUT.layout === 'P'){ goPhone(); } else { MODE = 'TV'; view = 'A'; document.body.classList.remove('phone'); }
  render();
}
function tutExit(){ TUT = null; state = null; try{ history.replaceState(null, '', location.pathname); }catch(e){} location.href = location.pathname; }
function tutTurnStart(){
  if(!TUT) return;
  if(state.turn !== 'B') return;
  const step = TUT_STEPS[TUT.i] || {};
  setTimeout(() => {
    if(!TUT || state.turn !== 'B') return;
    if(TUT.i >= 13){                                   // ขั้นสาธิตการ์ดป้องกัน
      say('⚔️ คู่ฝึกใช้พลัง “กระแสน้ำกวาดล้าง” ของอุทกภัย!');
      resolveEffect(state.teamB, COMP['C01']);
      const wait = setInterval(() => { if(!TUT){ clearInterval(wait); return; } if(!state.pending){ clearInterval(wait); setTimeout(() => { if(TUT && state.turn === 'B') endTurn(); }, 1500); } }, 400);
    } else {
      say('คู่ฝึกจั่วการ์ดและวางแผน…'); drawCards(state.teamB, 1); render();
      setTimeout(() => { if(TUT && state.turn === 'B'){ endTurn(); } }, 1800);
    }
  }, 900);
}
function coachEl(){
  let el = document.getElementById('coach');
  if(!el){ el = document.createElement('div'); el.id = 'coach'; document.body.appendChild(el);
    el.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if(!b) return; const v = b.dataset.c;
      if(v === 'next'){ tutGo(TUT.i + 1); } if(v === 'exit') tutExit(); if(v === 'again') tutStart(); if(v === 'min'){ el.classList.toggle('min'); } }); }
  return el;
}
function tutGo(i){
  TUT.i = i; TUT.stepAt = Date.now();
  const st = TUT_STEPS[i]; if(st && st.enter) st.enter();
  render();
}
function afterRender(){
  if(!TUT || !state || !state.practice) { const c = document.getElementById('coach'); if(c) c.remove(); return; }
  const st = TUT_STEPS[TUT.i]; if(!st) return;
  if(st.watch) st.watch();
  if(state.summonLost){ state.summonLost = false; say('ไม่เป็นไร — ในโหมดฝึกหัดลองใหม่ได้เลย ดูคำอธิบาย 💡 แล้วกดอัญเชิญอีกครั้ง', 'bad'); setTimeout(render, 0); return; }
  if(st.done && st.done() && !TUT.advancing){
    TUT.advancing = true;
    setTimeout(() => { TUT.advancing = false; if(TUT && TUT_STEPS[TUT.i] === st) tutGo(TUT.i + 1); }, 700);
  }
  const el = coachEl();
  const n = TUT_STEPS.length;
  el.className = `coach ${TUT.layout === 'P' ? 'p' : 'tv'} ${el.classList.contains('min') ? 'min' : ''}`;
  el.innerHTML = `<div class="orb">✨</div><div class="cb"><div class="ctop"><span>ฝึกหัด ${Math.min(TUT.i + 1, n)}/${n}</span><button data-c="min">–</button></div>
    <div class="ctext">${st.say}</div>
    <div class="cact">${st.next ? '<button class="btn summon sm" data-c="next">ถัดไป ➜</button>' : ''}${st.final ? '<button class="btn summon sm" data-c="exit">เริ่มเล่นจริง ⚔</button><button class="btn ghost sm" data-c="again">ฝึกอีกครั้ง</button>' : '<button class="btn ghost sm" data-c="exit">ออก</button>'}</div></div>`;
  document.querySelectorAll('.coach-hl').forEach(e => e.classList.remove('coach-hl'));
  const hl = typeof st.hl === 'function' ? st.hl() : st.hl;
  if(hl && hl[TUT.layout]) setTimeout(() => { try{ document.querySelectorAll(hl[TUT.layout]).forEach(e => e.classList.add('coach-hl')); }catch(e){} }, 30);
}
