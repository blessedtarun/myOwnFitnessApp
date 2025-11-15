// ===== Stable core (localStorage only) =====
const KEY = "fitness.day.state.stable1";
const todayKey = () => new Date().toISOString().slice(0,10);

function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return null;
    const s = JSON.parse(raw);
    const base = {
      date: todayKey(), started:false, phase:"home", index:0,
      done:{warmup:[],workout:[],cooldown:[]}, timers:{},
      selectedDay:1, completedDays:{},
      settings:{ wakeLock:true, voice:true, restSeconds:30 },
      overrides:{}
    };
    // day rollover
    if(s.date !== todayKey()) return { ...base, selectedDay: s.selectedDay ?? 1, completedDays: s.completedDays ?? {} };
    return { ...base, ...s, settings:{...base.settings, ...(s.settings||{})}, overrides:s.overrides||{} };
  }catch{ return null; }
}
function saveState(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
let state = loadState() || {
  date: todayKey(), started:false, phase:"home", index:0,
  done:{warmup:[],workout:[],cooldown:[]}, timers:{},
  selectedDay:1, completedDays:{},
  settings:{ wakeLock:true, voice:true, restSeconds:30 },
  overrides:{}
};

// ===== DOM safe-get =====
const $ = id => document.getElementById(id);
const $homeCard = $("homeCard"), $workSection=$("workSection");
const $chipDay=$("chipDay"), $phasePill=$("phasePill"), $timeline=$("timeline");
const $sectionTitle=$("sectionTitle"), $list=$("list"), $empty=$("empty");
const $prev=$("prevBtn"), $skip=$("skipBtn"), $next=$("nextPhaseBtn"), $finish=$("finishBtn");
const $startWarmup=$("startWarmupBtn"), $resetDay=$("resetDayBtn"), $resetCompleted=$("resetCompletedBtn");
const $chooseDayMid=$("chooseDayMidBtn"), $dayDialog=$("dayDialog"), $dialogDays=$("dialogDays");
const $settingsBtn=$("settingsBtn"), $settingsDialog=$("settingsDialog");
const $wakeLockToggle=$("wakeLockToggle"), $voiceToggle=$("voiceToggle"), $restSecondsInput=$("restSecondsInput");
const $daysGrid=$("daysGrid"), $restBanner=$("restBanner"), $restRemain=$("restRemain"), $restSkip=$("restSkipBtn");

// ===== Helpers =====
const intervals = new Map(); // key -> timeout id
let restInterval = null; let wakeLock = null;

function activityKey(phase, idx){ return `${state.date}:${phase}:${idx}`; }
function fmt(sec){ sec=Math.max(0,Math.floor(sec||0)); const m=String(Math.floor(sec/60)).padStart(2,"0"); const s=String(sec%60).padStart(2,"0"); return `${m}:${s}`; }
function itemSeconds(phase,i,base){ const k=`${phase}:${i}`; return state.overrides[k] ?? base ?? 0; }
function listForPhase(){
  if(state.phase==="warmup") return (PROGRAM.warmup||[]);
  if(state.phase==="workout"){ const d=state.selectedDay; return (PROGRAM.workoutsByDay[d]||[]); }
  if(state.phase==="cooldown") return (PROGRAM.cooldown||[]);
  return [];
}
function speak(text){
  try{
    if(!state.settings.voice || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text); u.rate=1.3; u.pitch=1.0; speechSynthesis.speak(u);
  }catch{}
}
async function requestWakeLock(){ if(!state.settings.wakeLock) return;
  try{ if('wakeLock' in navigator && !wakeLock){ wakeLock=await navigator.wakeLock.request('screen'); } }catch{} }
async function releaseWakeLock(){ try{ if(wakeLock){ await wakeLock.release(); wakeLock=null; } }catch{} }
function updateTimerClass(el,remain){ if(!el) return; if(remain<=5){ el.classList.add("last5"); if(remain>=1) speak(String(remain)); } else el.classList.remove("last5"); }

// Drift-free timer
function startTimer(phase, idx, seconds, onTick, onDone){
  const key=activityKey(phase,idx);
  if(intervals.has(key)) clearTimeout(intervals.get(key));
  const startRemain = (state.timers[key] != null ? state.timers[key] : seconds);
  const end = Date.now() + startRemain*1000;
  requestWakeLock();
  let last=-1;
  const tick=()=>{
    const remain=Math.max(0, Math.ceil((end-Date.now())/1000));
    if(remain!==last){ state.timers[key]=remain; onTick(remain); saveState(state); last=remain; }
    if(remain<=0){ delete state.timers[key]; intervals.delete(key); onDone?.(); saveState(state); return; }
    const id=setTimeout(tick,200); intervals.set(key,id);
  };
  onTick(startRemain);
  const id=setTimeout(tick,200); intervals.set(key,id); saveState(state);
}
function stopTimer(phase, idx){
  const key=activityKey(phase,idx);
  if(intervals.has(key)) clearTimeout(intervals.get(key));
  intervals.delete(key); delete state.timers[key]; saveState(state);
}

// Rest timer
function startRest(seconds, cb){
  clearRest(); if(seconds<=0){ cb?.(); return; }
  const end=Date.now()+seconds*1000; $restBanner.style.display="flex"; requestWakeLock();
  let last=-1;
  const step=()=>{
    const r=Math.max(0, Math.ceil((end-Date.now())/1000));
    if(r!==last){ $restRemain.textContent=fmt(r); if(r<=5&&r>=1) speak(String(r)); last=r; }
    if(r<=0){ clearRest(); cb?.(); return; }
    restInterval=setTimeout(step,200);
  }; step();
}
function clearRest(){ if(restInterval){ clearTimeout(restInterval); restInterval=null; } $restBanner.style.display="none"; }

// ===== UI Actions =====
function renderDaysGrid(container, compact){
  container.innerHTML="";
  for(let d=1; d<=7; d++){
    const b=document.createElement("button");
    b.type="button";
    b.className="dayBtn"+(state.completedDays[d]?" completed":"")+(state.selectedDay===d?" selected":"");
    b.textContent=d; b.title=`Workout Day ${d}`;
    b.onclick=()=>{
      state.selectedDay=d; saveState(state); syncChipDay(); renderDays();
      if(compact){ $dayDialog.close(); if(state.phase==="warmup") toWorkout(); else if(state.phase==="workout") render(); }
    };
    container.appendChild(b);
  }
}
function renderDays(){ renderDaysGrid($daysGrid,false); renderDaysGrid($dialogDays,true); }
function syncChipDay(){ $chipDay.textContent=String(state.selectedDay); }

function showHome(){ $homeCard.style.display="block"; $workSection.style.display="none"; }
function showWork(){ $homeCard.style.display="none"; $workSection.style.display="block"; }

function startWarmup(){ state.started=true; state.phase="warmup"; state.index=0; saveState(state); showWork(); render(); }
function toWorkout(){ state.phase="workout"; state.index=0; saveState(state); render(); }
function finishDay(){
  clearRest(); for(const id of intervals.values()) clearTimeout(id);
  intervals.clear(); releaseWakeLock();
  state.completedDays[state.selectedDay]=true;
  state.done={warmup:[],workout:[],cooldown:[]};
  state.phase="home"; state.index=0; state.timers={}; state.overrides={};
  saveState(state); showHome(); renderDays();
}

function markDone(phase, idx){
  const arr=state.done[phase]; if(!arr.includes(idx)) arr.push(idx);
  saveState(state); render();
  if(phase!=="cooldown"){
    const items=listForPhase(); const more=arr.length<items.length;
    if(more && state.settings.restSeconds>0) startRest(state.settings.restSeconds, ()=>{});
  }
}
function unmarkDone(phase, idx){ state.done[phase]=state.done[phase].filter(i=>i!==idx); saveState(state); render(); }

function prevActivity(){ state.index=Math.max(0,state.index-1); saveState(state); render(); }
function skipActivity(){ const n=listForPhase().length; state.index=Math.min(state.index+1, Math.max(0,n-1)); saveState(state); render(); }
function advancePhase(){
  clearRest();
  if(state.phase==="warmup"){ $dayDialog.showModal(); }
  else if(state.phase==="workout"){ state.phase="cooldown"; state.index=0; saveState(state); render(); }
  else { finishDay(); }
}

// ===== Render =====
function render(){
  // Titles
  if(state.phase==="warmup"){ $sectionTitle.textContent="Warm‑up"; $phasePill.textContent="Warm‑up"; }
  else if(state.phase==="workout"){ $sectionTitle.textContent=`Workout • Day ${state.selectedDay}`; $phasePill.textContent=`Workout (Day ${state.selectedDay})`; }
  else { $sectionTitle.textContent="Cool‑down"; $phasePill.textContent="Cool‑down"; }

  // Timeline
  [...$timeline.querySelectorAll(".chip")].forEach(ch=>{
    const p=ch.getAttribute("data-phase");
    ch.classList.toggle("active", state.phase===p && state.started);
  });

  // Mid choose-day
  $chooseDayMid.style.display = (state.started && state.phase==="workout") ? "inline-flex" : "none";
  $chooseDayMid.onclick = ()=> $dayDialog.showModal();

  // Buttons
  $finish.style.display = (state.started && state.phase==="cooldown") ? "inline-flex" : "none";
  $next.textContent = state.phase==="warmup" ? "Choose Day → Start Workout" : state.phase==="workout" ? "Start Cool‑down" : "Finish Day";

  // List
  const items=listForPhase();
  $list.innerHTML="";
  $empty.style.display = items.length ? "none":"block";
  $empty.textContent = items.length ? "" : "No activities defined.";

  items.forEach((it,i)=>{
    const crossed=state.done[state.phase].includes(i);

    const item=document.createElement("div");
    item.className="item"+(crossed?" completed":"");

    // Row 1
    const head=document.createElement("div"); head.className="itemHead";
    const num=document.createElement("div"); num.className="num"; num.textContent=i+1;
    const labelWrap=document.createElement("div"); labelWrap.className="labelWrap";
    const label=document.createElement("div"); label.className="label"; label.textContent=it.name;
    labelWrap.appendChild(label); head.appendChild(num); head.appendChild(labelWrap);

    // Row 2
    const controls=document.createElement("div"); controls.className="itemControls";
    const baseSecs=itemSeconds(state.phase,i,it.seconds); const hasTimer=(baseSecs||0)>0;

    let timer=null;
    if(hasTimer){
      timer=document.createElement("div"); timer.className="timer";
      const key=activityKey(state.phase,i);
      const remainInit=(state.timers[key] ?? baseSecs);
      timer.textContent=fmt(remainInit); updateTimerClass(timer,remainInit);
      controls.appendChild(timer);
    }

    const startB=document.createElement("button"); startB.className="btn ghost";
    startB.textContent=hasTimer?"Start":"Done";
    startB.onclick=()=>{
      if(!hasTimer){ markDone(state.phase,i); return; }
      startTimer(state.phase,i,baseSecs, s=>{ if(timer){ timer.textContent=fmt(s); updateTimerClass(timer,s);} }, ()=>{ markDone(state.phase,i); });
    };

    const stopB=document.createElement("button"); stopB.className="btn ghost";
    stopB.textContent=hasTimer?"Stop":"Undo";
    stopB.onclick=()=>{
      if(!hasTimer){ unmarkDone(state.phase,i); return; }
      stopTimer(state.phase,i);
      if(timer){ timer.textContent=fmt(baseSecs); updateTimerClass(timer,baseSecs); }
    };

    const doneB=document.createElement("button"); doneB.className="btn";
    doneB.textContent=crossed?"Undo":"Done";
    doneB.onclick=()=> crossed ? unmarkDone(state.phase,i) : markDone(state.phase,i);

    controls.appendChild(startB); controls.appendChild(stopB); controls.appendChild(doneB);

    if(it.youtube){
      const a=document.createElement("a"); a.className="btn white"; a.href=it.youtube; a.target="_blank"; a.rel="noopener"; a.textContent="Watch Video";
      controls.appendChild(a);
    }

    // Long-press override
    let pressTimer=null;
    const onDown=()=>{ pressTimer=setTimeout(()=> openQuickEdit(state.phase,i,baseSecs,timer),600); };
    const onUp=()=>{ clearTimeout(pressTimer); pressTimer=null; };
    item.addEventListener("pointerdown",onDown); item.addEventListener("pointerup",onUp); item.addEventListener("pointerleave",onUp);

    item.appendChild(head); item.appendChild(controls); $list.appendChild(item);
  });
}

function openQuickEdit(phase, idx, current, timerEl){
  const val=prompt("Set seconds for this activity (today only). Use 0 to remove timer:", String(current??0));
  if(val==null) return;
  const secs=Math.max(0,Math.floor(Number(val)||0)); const key=`${phase}:${idx}`;
  if(secs===0) delete state.overrides[key]; else state.overrides[key]=secs;
  saveState(state); if(timerEl){ if(secs>0){ timerEl.style.display=""; timerEl.textContent=fmt(secs); updateTimerClass(timerEl,secs); } else { timerEl.style.display="none"; } }
  render();
}

// ===== Settings (defensive) =====
function loadSettingsUI(){ if(!$wakeLockToggle) return;
  $wakeLockToggle.checked=!!state.settings.wakeLock;
  $voiceToggle.checked=!!state.settings.voice;
  $restSecondsInput.value=state.settings.restSeconds??30;
}
function saveSettingsUI(){ if(!$wakeLockToggle) return;
  state.settings.wakeLock=$wakeLockToggle.checked;
  state.settings.voice=$voiceToggle.checked;
  state.settings.restSeconds=Math.max(0, Math.floor(Number($restSecondsInput.value)||30));
  saveState(state);
}

// ===== Route and bind =====
function route(){
  if(!state.started || state.phase==="home"){ showHome(); }
  else { showWork(); }
  syncChipDay(); renderDays(); render();
}

// Global bindings (idempotent)
$startWarmup?.addEventListener("click", startWarmup);
$resetDay?.addEventListener("click", ()=>{ if(confirm("Reset today's progress?")){ clearRest(); releaseWakeLock();
  state={...state, date:todayKey(), started:false, phase:"home", index:0, done:{warmup:[],workout:[],cooldown:[]}, timers:{}, overrides:{}}; saveState(state); route(); }});
$resetCompleted?.addEventListener("click", ()=>{ if(confirm("Clear all completed days?")){ state.completedDays={}; saveState(state); renderDays(); }});
$next?.addEventListener("click", advancePhase);
$finish?.addEventListener("click", finishDay);
$prev?.addEventListener("click", prevActivity);
$skip?.addEventListener("click", skipActivity);
$chooseDayMid?.addEventListener("click", ()=> $dayDialog.showModal());
$restSkip?.addEventListener("click", ()=> clearRest());
$settingsBtn?.addEventListener("click", ()=>{ if($settingsDialog){ loadSettingsUI(); $settingsDialog.showModal(); }});
$settingsDialog?.addEventListener("close", saveSettingsUI);

route();
