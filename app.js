// ===== Persistence (localStorage only; per device) =====
const KEY = "fitness.day.state.v3";
const todayKey = () => new Date().toISOString().slice(0,10);
function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return null;
    const s = JSON.parse(raw);
    if(s.date !== todayKey()){
      return { date: todayKey(), started: false, phase: "home", index: 0,
        done:{warmup:[],workout:[],cooldown:[]}, timers:{},
        selectedDay: s.selectedDay ?? 1, completedDays: s.completedDays ?? {} };
    }
    return s;
  }catch(e){ return null; }
}
function saveState(s){ localStorage.setItem(KEY, JSON.stringify(s)); }

function freshState(){
  return {
    date: todayKey(),
    started: false,
    phase: "home",
    index: 0,
    done: { warmup: [], workout: [], cooldown: [] },
    timers: {},
    selectedDay: 1,      // 1..7
    completedDays: {}    // {1:true,...}
  };
}
let state = loadState() || freshState();

// ===== DOM =====
const $homeCard = document.getElementById("homeCard");
const $daysGrid = document.getElementById("daysGrid");
const $workSection = document.getElementById("workSection");
const $chipDay = document.getElementById("chipDay");
const $phasePill = document.getElementById("phasePill");
const $timeline = document.getElementById("timeline");
const $sectionTitle = document.getElementById("sectionTitle");
const $list = document.getElementById("list");
const $empty = document.getElementById("empty");
const $prev = document.getElementById("prevBtn");
const $skip = document.getElementById("skipBtn");
const $nextPhase = document.getElementById("nextPhaseBtn");
const $finish = document.getElementById("finishBtn");
const $startWarmupBtn = document.getElementById("startWarmupBtn");
const $resetDayBtn = document.getElementById("resetDayBtn");
const $resetCompletedBtn = document.getElementById("resetCompletedBtn");
const $chooseDayMidBtn = document.getElementById("chooseDayMidBtn");
const $dayDialog = document.getElementById("dayDialog");
const $dialogDays = document.getElementById("dialogDays");

// ===== Helpers =====
const intervals = new Map(); // activityKey -> setInterval id
function activityKey(phase, idx){ return `${state.date}:${phase}:${idx}`; }
function fmt(sec){
  sec = Math.max(0, Math.floor(sec||0));
  const m = Math.floor(sec/60).toString().padStart(2,"0");
  const s = (sec%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

// ===== Data access =====
function listForPhase(){
  if(state.phase === "warmup") return PROGRAM.warmup;
  if(state.phase === "workout"){
    const d = state.selectedDay; // 1..7
    return PROGRAM.workoutsByDay[d] || [];
  }
  if(state.phase === "cooldown") return PROGRAM.cooldown;
  return [];
}

// ===== Timers =====
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
    } else {
      saveState(state);
    }
  }, 1000);
  intervals.set(key, id);
  saveState(state);
}
function stopTimer(phase, idx){
  const key = activityKey(phase, idx);
  if(intervals.has(key)) clearInterval(intervals.get(key));
  intervals.delete(key);
  delete state.timers[key];
  saveState(state);
}

// ===== Actions =====
function renderDaysGrid(container, compact=false){
  container.innerHTML = "";
  for(let d=1; d<=7; d++){
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dayBtn" + (state.completedDays[d] ? " completed":"") + (state.selectedDay===d ? " selected":"");
    btn.textContent = d;
    btn.title = `Workout Day ${d}`;
    btn.onclick = ()=>{
      state.selectedDay = d;
      saveState(state);
      syncChipDay();
      renderDays();
      if(compact){ $dayDialog.close(); if(state.phase==="warmup"){ toWorkout(); } }
    };
    container.appendChild(btn);
  }
}
function renderDays(){
  renderDaysGrid($daysGrid, false);
  renderDaysGrid($dialogDays, true);
}
function startWarmup(){
  state.started = true;
  state.phase = "warmup";
  state.index = 0;
  saveState(state);
  showWork();
  render();
}
function toWorkout(){
  state.phase = "workout";
  state.index = 0;
  saveState(state);
  render();
}
function markDone(phase, idx){
  const arr = state.done[phase];
  if(!arr.includes(idx)) arr.push(idx);
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
  if(state.phase === "warmup"){
    $dayDialog.showModal(); // choose day then move to workout
  } else if(state.phase === "workout"){
    state.phase = "cooldown";
    state.index = 0;
    saveState(state); render();
  } else {
    finishDay();
  }
}
function finishDay(){
  state.completedDays[state.selectedDay] = true;
  [...intervals.keys()].forEach(k=>clearInterval(intervals.get(k)));
  intervals.clear();
  state.done = { warmup:[], workout:[], cooldown:[] };
  state.phase = "home";
  state.index = 0;
  saveState(state);
  hideWork();
  renderDays();
}
function resetToday(){
  if(confirm("Reset today's progress?")){
    state.date = todayKey();
    state.started = false;
    state.phase = "home";
    state.index = 0;
    state.done = { warmup:[], workout:[], cooldown:[] };
    state.timers = {};
    saveState(state);
    hideWork();
    renderDays();
  }
}
function resetCompletedDays(){
  if(confirm("Clear all completed days?")){
    state.completedDays = {};
    saveState(state);
    renderDays();
  }
}

// ===== Routing/UI =====
function showHome(){ $homeCard.style.display = "block"; $workSection.style.display = "none"; }
function showWork(){ $homeCard.style.display = "none"; $workSection.style.display = "block"; }
function hideWork(){ showHome(); }
function syncChipDay(){ $chipDay.textContent = String(state.selectedDay); }

function render(){
  if(state.phase==="warmup"){ $sectionTitle.textContent = "Warm‑up"; $phasePill.textContent = "Warm‑up"; }
  else if(state.phase==="workout"){ $sectionTitle.textContent = `Workout • Day ${state.selectedDay}`; $phasePill.textContent = `Workout (Day ${state.selectedDay})`; }
  else if(state.phase==="cooldown"){ $sectionTitle.textContent = "Cool‑down"; $phasePill.textContent = "Cool‑down"; }

  [...$timeline.querySelectorAll(".chip")].forEach(ch=>{
    const p = ch.getAttribute("data-phase");
    ch.classList.toggle("active", state.phase===p && state.started);
  });

  $chooseDayMidBtn.style.display = state.started && state.phase==="workout" ? "inline-flex" : "none";
  $prev.style.display = state.started ? "inline-flex" : "none";
  $skip.style.display = state.started ? "inline-flex" : "none";
  $nextPhase.style.display = state.started ? "inline-flex" : "none";
  $finish.style.display = state.started && state.phase==="cooldown" ? "inline-flex" : "none";
  $nextPhase.textContent = state.phase==="warmup" ? "Choose Day → Start Workout"
                       : state.phase==="workout" ? "Start Cool‑down"
                       : "Finish Day";

  const items = listForPhase();
  $list.innerHTML = "";
  $empty.style.display = items.length ? "none" : "block";
  $empty.textContent = items.length ? "" : "No activities defined.";

  items.forEach((it, i)=>{
    const crossed = state.done[state.phase].includes(i);

    const item = document.createElement("div");
    item.className = "item" + (crossed ? " crossed" : "");

    // Row 1: number + name + meta
    const head = document.createElement("div");
    head.className = "itemHead";

    const num = document.createElement("div");
    num.className = "num";
    num.textContent = i+1;

    const labelWrap = document.createElement("div");
    labelWrap.className = "labelWrap";
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = it.name;
    const meta = document.createElement("div");
    meta.className = "meta";
    const mins = Math.max(1, Math.round((it.seconds||60)/60));
    meta.textContent = `${mins} min${it.youtube ? " • Video" : ""}`;

    labelWrap.appendChild(label);
    labelWrap.appendChild(meta);
    head.appendChild(num);
    head.appendChild(labelWrap);

    // Row 2: timer + controls + watch
    const controls = document.createElement("div");
    controls.className = "itemControls";

    const timer = document.createElement("div");
    timer.className = "timer";
    const key = activityKey(state.phase, i);
    const remain = (state.timers[key] ?? (it.seconds||60));
    timer.textContent = fmt(remain);

    const startB = document.createElement("button");
    startB.className = "btn ghost";
    startB.textContent = "Start";
    startB.onclick = ()=> startTimer(state.phase, i, it.seconds||60, s=>{ timer.textContent = fmt(s); }, ()=>{ markDone(state.phase, i); });

    const stopB = document.createElement("button");
    stopB.className = "btn ghost";
    stopB.textContent = "Stop";
    stopB.onclick = ()=>{ stopTimer(state.phase, i); timer.textContent = fmt(it.seconds||60); };

    const doneB = document.createElement("button");
    doneB.className = "btn";
    doneB.textContent = crossed ? "Undo" : "Done";
    doneB.onclick = ()=> crossed ? unmarkDone(state.phase, i) : markDone(state.phase, i);

    controls.appendChild(timer);
    controls.appendChild(startB);
    controls.appendChild(stopB);
    controls.appendChild(doneB);

    if(it.youtube){
      const a = document.createElement("a");
      a.className = "btn white";
      a.href = it.youtube;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Watch Video";
      controls.appendChild(a);
    }

    item.appendChild(head);
    item.appendChild(controls);
    $list.appendChild(item);
  });
}

// ===== Routing / init =====
function route(){
  if(!state.started || state.phase==="home"){ showHome(); }
  else { showWork(); }
  syncChipDay();
  renderDays();
  render();
}

// ===== Wire up =====
document.getElementById("startWarmupBtn").addEventListener("click", startWarmup);
$resetDayBtn.addEventListener("click", resetToday);
$resetCompletedBtn.addEventListener("click", resetCompletedDays);
$chooseDayMidBtn.addEventListener("click", ()=> $dayDialog.showModal());
document.getElementById("prevBtn").addEventListener("click", prevActivity);
document.getElementById("skipBtn").addEventListener("click", skipActivity);
document.getElementById("nextPhaseBtn").addEventListener("click", advancePhase);
document.getElementById("finishBtn").addEventListener("click", finishDay);

route();
