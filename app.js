// ===== Persistence (localStorage) =====
const KEY = "fitness.day.state.v1";
const todayKey = () => new Date().toISOString().slice(0,10);
function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return null;
    const s = JSON.parse(raw);
    if(s.date !== todayKey()) return null; // auto-reset by date boundary
    return s;
  }catch(e){ return null; }
}
function saveState(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
function hardReset(){
  localStorage.removeItem(KEY);
  state = freshState();
  render();
}
// Reference: localStorage API persists simple key/values across refresh. [web:40][web:56]

// ===== Program-state helpers =====
const PHASES = ["warmup","workout","cooldown"];
function freshState(){
  const dow = new Date().getDay(); // 0=Sun..6=Sat
  return {
    date: todayKey(),
    started: false,
    phase: "warmup",
    index: 0,
    done: { warmup: [], workout: [], cooldown: [] },
    timers: {}, // activityKey -> remaining seconds
    weekday: dow
  };
}
let state = loadState() || freshState();

// ===== DOM =====
const $today = document.getElementById("today");
const $startBtn = document.getElementById("startBtn");
const $resetDayBtn = document.getElementById("resetDayBtn");
const $phasePill = document.getElementById("phasePill");
const $timeline = document.getElementById("timeline");
const $sectionTitle = document.getElementById("sectionTitle");
const $list = document.getElementById("list");
const $empty = document.getElementById("empty");
const $prev = document.getElementById("prevBtn");
const $skip = document.getElementById("skipBtn");
const $nextPhase = document.getElementById("nextPhaseBtn");
const $toCool = document.getElementById("toCoolBtn");
const $finish = document.getElementById("finishBtn");

// ===== Timers =====
const intervals = new Map(); // activityKey -> setInterval id
function activityKey(phase, idx){ return `${state.date}:${phase}:${idx}`; }
function fmt(sec){
  sec = Math.max(0, Math.floor(sec));
  const m = Math.floor(sec/60).toString().padStart(2,"0");
  const s = (sec%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}
// Use a simple setInterval countdown; when it hits zero, mark as done. [web:21][web:22]
function startTimer(phase, idx, seconds, onTick, onDone){
  const key = activityKey(phase, idx);
  if(intervals.has(key)) clearInterval(intervals.get(key));
  let remain = state.timers[key] ?? seconds;
  onTick(remain);
  const id = setInterval(()=>{
    remain -= 1;
    state.timers[key] = remain;
    onTick(remain);
    if(remain <= 0){
      clearInterval(id);
      intervals.delete(key);
      delete state.timers[key];
      onDone?.();
      saveState(state);
    }else{
      saveState(state);
    }
  }, 1000);
  intervals.set(key, id);
  saveState(state);
}
function stopTimer(phase, idx){
  const key = activityKey(phase, idx);
  if(intervals.has(key)){ clearInterval(intervals.get(key)); intervals.delete(key); }
  delete state.timers[key];
  saveState(state);
}

// ===== Data access =====
function listForPhase(){
  if(state.phase === "warmup") return PROGRAM.warmup;
  if(state.phase === "workout") return PROGRAM.workoutsByWeekday[state.weekday] || [];
  return PROGRAM.cooldown;
}
function nextPhaseLabel(){
  if(state.phase==="warmup") return "Start Workout";
  if(state.phase==="workout") return "Start Cool‑down";
  return "Finish Day";
}

// ===== Actions =====
function startDay(){
  state.started = true;
  state.phase = "warmup";
  state.index = 0;
  saveState(state); render();
}
function markDone(phase, idx){
  const arr = state.done[phase];
  if(!arr.includes(idx)) arr.push(idx);
  if(state.index === idx) state.index = Math.min(idx+1, listForPhase().length-1);
  saveState(state); render();
}
function unmarkDone(phase, idx){
  state.done[phase] = state.done[phase].filter(i=>i!==idx);
  saveState(state); render();
}
function skipActivity(){
  state.index = Math.min(state.index + 1, listForPhase().length - 1);
  saveState(state); render();
}
function prevActivity(){
  state.index = Math.max(0, state.index - 1);
  saveState(state); render();
}
function advancePhase(){
  if(state.phase === "warmup"){ state.phase = "workout"; }
  else if(state.phase === "workout"){ state.phase = "cooldown"; }
  else { finishDay(); return; }
  state.index = 0;
  saveState(state); render();
}
function finishDay(){
  [...intervals.keys()].forEach(k=>clearInterval(intervals.get(k)));
  intervals.clear();
  state = freshState();
  saveState(state);
  render();
}

// ===== Render =====
function render(){
  const d = new Date();
  $today.textContent = d.toLocaleDateString(undefined,{ weekday:"long", year:"numeric", month:"short", day:"numeric" });

  // timeline
  [...$timeline.querySelectorAll(".chip")].forEach(ch=>{
    const p = ch.getAttribute("data-phase");
    ch.classList.toggle("active", state.phase===p && state.started);
  });

  // pill
  if(!state.started){ $phasePill.textContent = "Not started"; }
  else{
    const label = state.phase==="workout"
      ? `Workout (${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][state.weekday]})`
      : state.phase.charAt(0).toUpperCase()+state.phase.slice(1);
    $phasePill.textContent = label;
  }

  // controls
  $startBtn.style.display = state.started ? "none" : "inline-flex";
  $prev.style.display = state.started ? "inline-flex" : "none";
  $skip.style.display = state.started ? "inline-flex" : "none";
  $nextPhase.style.display = state.started && state.phase!=="cooldown" ? "inline-flex" : "none";
  $toCool.style.display = state.started && state.phase==="workout" ? "inline-flex" : "none";
  $finish.style.display = state.started && state.phase==="cooldown" ? "inline-flex" : "none";

  // section title
  if(!state.started){ $sectionTitle.textContent = "Ready"; }
  else if(state.phase==="warmup"){ $sectionTitle.textContent = "Warm‑up"; }
  else if(state.phase==="workout"){ $sectionTitle.textContent = "Workout"; }
  else { $sectionTitle.textContent = "Cool‑down"; }

  // list
  const items = listForPhase();
  $list.innerHTML = "";
  $empty.style.display = items.length ? "none" : "block";
  $empty.textContent = items.length ? "" : "No activities defined for this section.";

  items.forEach((it, i)=>{
    const crossed = state.done[state.phase].includes(i);
    const row = document.createElement("div");
    row.className = "item" + (crossed ? " crossed" : "");

    const left = document.createElement("div");
    left.className = "left";
    const num = document.createElement("div");
    num.className = "num";
    num.textContent = i+1;

    const labWrap = document.createElement("div");
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = it.name;
    const meta = document.createElement("div");
    meta.className = "meta";
    const mins = Math.round((it.seconds||0)/60);
    meta.textContent = `${mins} min${it.youtube ? " • Video" : ""}`;

    labWrap.appendChild(label); labWrap.appendChild(meta);
    left.appendChild(num); left.appendChild(labWrap);

    const actions = document.createElement("div");
    actions.className = "actions";

    const timer = document.createElement("div");
    timer.className = "timer";
    const key = activityKey(state.phase, i);
    const remain = (state.timers[key] ?? it.seconds);
    timer.textContent = fmt(remain || 0);

    const startB = document.createElement("button");
    startB.className = "btn ghost";
    startB.textContent = "Start";
    startB.onclick = ()=>{
      startTimer(state.phase, i, it.seconds||0, s=>{
        timer.textContent = fmt(s);
      }, ()=>{
        markDone(state.phase, i);
      });
    };

    const stopB = document.createElement("button");
    stopB.className = "btn ghost";
    stopB.textContent = "Stop";
    stopB.onclick = ()=>{
      stopTimer(state.phase, i);
      timer.textContent = fmt(it.seconds||0);
    };

    const doneB = document.createElement("button");
    doneB.className = "btn";
    doneB.textContent = crossed ? "Undo" : "Done";
    doneB.onclick = ()=> crossed ? unmarkDone(state.phase, i) : markDone(state.phase, i);

    actions.appendChild(timer);
    actions.appendChild(startB);
    actions.appendChild(stopB);
    actions.appendChild(doneB);

    if(it.youtube){
      const a = document.createElement("a");
      a.className = "yt";
      a.href = it.youtube;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Watch";
      actions.appendChild(a);
    }

    row.appendChild(left);
    row.appendChild(actions);
    $list.appendChild(row);
  });

  // next-phase button label
  const allDone = items.length && state.done[state.phase].length === items.length;
  if(allDone){
    if(state.phase==="warmup"){ $nextPhase.textContent = "Start Workout"; }
    else if(state.phase==="workout"){ $nextPhase.textContent = "Start Cool‑down"; }
    else { $finish.textContent = "Finish Day"; }
  }
}

// Daily auto-reset check on load/open by comparing stored date. [web:47][web:50]
function ensureToday(){
  if(state.date !== todayKey()){
    state = freshState();
    saveState(state);
  }
}

// Wire up
document.getElementById("startBtn").addEventListener("click", startDay);
document.getElementById("resetDayBtn").addEventListener("click", ()=>{ if(confirm("Reset today?")) hardReset(); });
document.getElementById("prevBtn").addEventListener("click", prevActivity);
document.getElementById("skipBtn").addEventListener("click", skipActivity);
document.getElementById("nextPhaseBtn").addEventListener("click", advancePhase);
document.getElementById("toCoolBtn").addEventListener("click", ()=>{ if(state.phase==="workout"){ state.phase="cooldown"; state.index=0; saveState(state); render(); }});
document.getElementById("finishBtn").addEventListener("click", finishDay);

// Init
ensureToday();
render();
