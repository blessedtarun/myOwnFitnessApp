// ===== State (localStorage only) =====
const KEY = "fitness.day.state.v5";
const todayKey = () => new Date().toISOString().slice(0,10);
function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return null;
    const s = JSON.parse(raw);
    if(s.date !== todayKey()){
      return { date: todayKey(), started: false, phase: "home", index: 0,
        done:{warmup:[],workout:[],cooldown:[]}, timers:{},
        selectedDay: s.selectedDay ?? 1, completedDays: s.completedDays ?? {},
        settings: s.settings ?? { wakeLock:true, voice:true, restSeconds:30 },
        overrides: {} };
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
    selectedDay: 1,
    completedDays: {},
    settings: { wakeLock:true, voice:true, restSeconds:30 },
    overrides: {} // per-day temporary seconds overrides: { "phase:index": seconds }
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
const $settingsBtn = document.getElementById("settingsBtn");
const $settingsDialog = document.getElementById("settingsDialog");
const $wakeLockToggle = document.getElementById("wakeLockToggle");
const $voiceToggle = document.getElementById("voiceToggle");
const $restSecondsInput = document.getElementById("restSecondsInput");
const $restBanner = document.getElementById("restBanner");
const $restRemain = document.getElementById("restRemain");
const $restSkipBtn = document.getElementById("restSkipBtn");

// ===== Utilities =====
const intervals = new Map(); // activityKey -> setInterval id
let restInterval = null;
let wakeLock = null;

function activityKey(phase, idx){ return `${state.date}:${phase}:${idx}`; }
function fmt(sec){
  sec = Math.max(0, Math.floor(sec||0));
  const m = Math.floor(sec/60).toString().padStart(2,"0");
  const s = (sec%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}
function itemSeconds(phase, i, base){
  const k = `${phase}:${i}`;
  return state.overrides[k] ?? base ?? 0;
}
function speak(text){
  try{
    if(!state.settings.voice) return;
    if(!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05; u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }catch(_){}
}

// Wake Lock helpers
async function requestWakeLock(){
  if(!state.settings.wakeLock) return;
  try{
    if('wakeLock' in navigator){
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', ()=>{ /* released */ });
    }
  }catch(_){}
}
async function releaseWakeLock(){
  try{ if(wakeLock){ await wakeLock.release(); wakeLock = null; } }catch(_){}
}

// ===== Data access =====
function listForPhase(){
  if(state.phase === "warmup") return PROGRAM.warmup;
  if(state.phase === "workout"){
    const d = state.selectedDay;
    return PROGRAM.workoutsByDay[d] || [];
  }
  if(state.phase === "cooldown") return PROGRAM.cooldown;
  return [];
}

// ===== Timer core with last-5s cues =====
function updateTimerClass(timerEl, remain){
  if(remain <= 5){ timerEl.classList.add("last5"); if(state.settings.voice && remain > 0) speak(String(remain)); }
  else{ timerEl.classList.remove("last5"); }
}
function startTimer(phase, idx, seconds, onTick, onDone){
  const key = activityKey(phase, idx);
  if(intervals.has(key)) clearInterval(intervals.get(key));
  let remain = state.timers[key] ?? seconds;
  onTick(remain);
  requestWakeLock();
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
      // if no more active timers, we’ll keep wake lock during rest; released on Finish Day or Reset
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

// ===== Rest timer =====
function startRest(seconds, onFinish){
  clearRest();
  if(seconds <= 0){ onFinish?.(); return; }
  let r = seconds;
  $restRemain.textContent = fmt(r);
  $restBanner.style.display = "flex";
  requestWakeLock();
  restInterval = setInterval(()=>{
    r -= 1;
    $restRemain.textContent = fmt(r);
    if(r <= 5 && r > 0){ if(state.settings.voice) speak(String(r)); }
    if(r <= 0){
      clearRest();
      onFinish?.();
    }
  }, 1000);
}
function clearRest(){
  if(restInterval){ clearInterval(restInterval); restInterval = null; }
  $restBanner.style.display = "none";
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
      if(compact){ $dayDialog.close(); if(state.phase==="warmup"){ toWorkout(); } else if(state.phase==="workout"){ render(); } }
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
  // After completing an activity during warmup/workout, auto-start rest unless next is phase change
  if(phase !== "cooldown"){
    const items = listForPhase();
    const more = arr.length < items.length;
    if(more && state.settings.restSeconds > 0){
      startRest(state.settings.restSeconds, ()=>{ /* rest finished */ });
    }
  }
}
function unmarkDone(phase, idx){
  state.done[phase] = state.done[phase].filter(i=>i!==idx);
  saveState(state); render();
}
function skipActivity(){
  const items = listForPhase();
  state.index = Math.min(state.index + 1, Math.max(0, items.length - 1));
  saveState(state); render();
}
function prevActivity(){
  state.index = Math.max(0, state.index - 1);
  saveState(state); render();
}
function advancePhase(){
  clearRest();
  if(state.phase === "warmup"){
    $dayDialog.showModal(); // choose then to workout
  } else if(state.phase === "workout"){
    state.phase = "cooldown";
    state.index = 0;
    saveState(state); render();
  } else {
    finishDay();
  }
}
function finishDay(){
  clearRest();
  state.completedDays[state.selectedDay] = true;
  // stop any timers
  [...intervals.keys()].forEach(k=>clearInterval(intervals.get(k)));
  intervals.clear();
  releaseWakeLock();
  state.done = { warmup:[], workout:[], cooldown:[] };
  state.phase = "home";
  state.index = 0;
  state.overrides = {};
  saveState(state);
  hideWork();
  renderDays();
}
function resetToday(){
  if(confirm("Reset today's progress?")){
    clearRest();
    releaseWakeLock();
    state.date = todayKey();
    state.started = false;
    state.phase = "home";
    state.index = 0;
    state.done = { warmup:[], workout:[], cooldown:[] };
    state.timers = {};
    state.overrides = {};
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
  // titles and pill
  if(state.phase==="warmup"){ $sectionTitle.textContent = "Warm‑up"; $phasePill.textContent = "Warm‑up"; }
  else if(state.phase==="workout"){ $sectionTitle.textContent = `Workout • Day ${state.selectedDay}`; $phasePill.textContent = `Workout (Day ${state.selectedDay})`; }
  else if(state.phase==="cooldown"){ $sectionTitle.textContent = "Cool‑down"; $phasePill.textContent = "Cool‑down"; }

  // timeline chips
  [...$timeline.querySelectorAll(".chip")].forEach(ch=>{
    const p = ch.getAttribute("data-phase");
    ch.classList.toggle("active", state.phase===p && state.started);
  });

  // mid choose-day button
  $chooseDayMidBtn.style.display = state.started && state.phase==="workout" ? "inline-flex" : "none";
  $chooseDayMidBtn.onclick = ()=> $dayDialog.showModal();

  // controls
  $prev.onclick = prevActivity;
  $skip.onclick = skipActivity;
  $nextPhase.onclick = advancePhase;
  $finish.style.display = state.started && state.phase==="cooldown" ? "inline-flex" : "none";
  $nextPhase.textContent = state.phase==="warmup" ? "Choose Day → Start Workout"
                       : state.phase==="workout" ? "Start Cool‑down"
                       : "Finish Day";

  // list
  const items = listForPhase();
  $list.innerHTML = "";
  $empty.style.display = items.length ? "none" : "block";
  $empty.textContent = items.length ? "" : "No activities defined.";

  items.forEach((it, i)=>{
    const crossed = state.done[state.phase].includes(i);
    const item = document.createElement("div");
    item.className = "item" + (crossed ? " completed" : "");

    // Row 1: number + name (wrap naturally, no meta minutes)
    const head = document.createElement("div");
    head.className = "itemHead";
    const num = document.createElement("div");
    num.className = "num"; num.textContent = i+1;
    const labelWrap = document.createElement("div");
    labelWrap.className = "labelWrap";
    const label = document.createElement("div");
    label.className = "label"; label.textContent = it.name;
    labelWrap.appendChild(label);
    head.appendChild(num); head.appendChild(labelWrap);

    // Row 2: timer (if seconds > 0) + controls + watch
    const controls = document.createElement("div");
    controls.className = "itemControls";

    const baseSecs = itemSeconds(state.phase, i, it.seconds);
    const hasTimer = (baseSecs || 0) > 0;

    let timer = null;
    if(hasTimer){
      timer = document.createElement("div");
      timer.className = "timer";
      const key = activityKey(state.phase, i);
      const remainInit = (state.timers[key] ?? baseSecs);
      timer.textContent = fmt(remainInit);
      updateTimerClass(timer, remainInit);
      controls.appendChild(timer);
    }

    const startB = document.createElement("button");
    startB.className = "btn ghost";
    startB.textContent = hasTimer ? "Start" : "Done";
    startB.onclick = ()=> {
      if(!hasTimer){ markDone(state.phase, i); return; }
      startTimer(state.phase, i, baseSecs, s=>{
        if(timer){ timer.textContent = fmt(s); updateTimerClass(timer, s); }
      }, ()=>{
        markDone(state.phase, i);
      });
    };

    const stopB = document.createElement("button");
    stopB.className = "btn ghost";
    stopB.textContent = hasTimer ? "Stop" : "Undo";
    stopB.onclick = ()=> {
      if(!hasTimer){ unmarkDone(state.phase, i); return; }
      stopTimer(state.phase, i);
      if(timer){ timer.textContent = fmt(baseSecs); updateTimerClass(timer, baseSecs); }
    };

    const doneB = document.createElement("button");
    doneB.className = "btn";
    doneB.textContent = crossed ? "Undo" : "Done";
    doneB.onclick = ()=> crossed ? unmarkDone(state.phase, i) : markDone(state.phase, i);

    controls.appendChild(startB);
    controls.appendChild(stopB);
    controls.appendChild(doneB);

    if(it.youtube){
      const a = document.createElement("a");
      a.className = "btn white"; // no underline
      a.href = it.youtube; a.target = "_blank"; a.rel = "noopener";
      a.textContent = "Watch Video";
      controls.appendChild(a);
    }

    // Long‑press to edit seconds for today only
    let pressTimer = null;
    const onPressStart = ()=>{ pressTimer = setTimeout(()=> openQuickEdit(state.phase, i, baseSecs, timer), 600); };
    const onPressEnd = ()=>{ clearTimeout(pressTimer); pressTimer = null; };
    item.addEventListener("pointerdown", onPressStart);
    item.addEventListener("pointerup", onPressEnd);
    item.addEventListener("pointerleave", onPressEnd);

    item.appendChild(head);
    item.appendChild(controls);
    $list.appendChild(item);
  });
}

// Quick edit prompt
function openQuickEdit(phase, idx, current, timerEl){
  const val = prompt("Set seconds for this activity (today only). Use 0 to remove timer:", String(current));
  if(val == null) return;
  const secs = Math.max(0, Math.floor(Number(val)||0));
  const key = `${phase}:${idx}`;
  if(secs === 0) delete state.overrides[key];
  else state.overrides[key] = secs;
  saveState(state);
  if(timerEl){
    if(secs > 0){
      timerEl.style.display = "";
      timerEl.textContent = fmt(secs);
      updateTimerClass(timerEl, secs);
    }else{
      timerEl.style.display = "none";
    }
  }
  render();
}

// ===== Settings wiring =====
function loadSettingsUI(){
  $wakeLockToggle.checked = !!state.settings.wakeLock;
  $voiceToggle.checked = !!state.settings.voice;
  $restSecondsInput.value = state.settings.restSeconds ?? 30;
}
function saveSettingsUI(){
  state.settings.wakeLock = $wakeLockToggle.checked;
  state.settings.voice = $voiceToggle.checked;
  state.settings.restSeconds = Math.max(0, Math.floor(Number($restSecondsInput.value)||30));
  saveState(state);
}
$settingsBtn.addEventListener("click", ()=>{ loadSettingsUI(); $settingsDialog.showModal(); });
$settingsDialog.addEventListener("close", saveSettingsUI);

// ===== Home / Work routing =====
function route(){
  if(!state.started || state.phase==="home"){ showHome(); }
  else { showWork(); }
  syncChipDay();
  renderDays();
  render();
}

// ===== Wire up (global) =====
document.getElementById("startWarmupBtn").addEventListener("click", startWarmup);
$resetDayBtn.addEventListener("click", resetToday);
$resetCompletedBtn.addEventListener("click", resetCompletedDays);
document.getElementById("nextPhaseBtn").addEventListener("click", advancePhase);
document.getElementById("finishBtn").addEventListener("click", finishDay);
document.getElementById("prevBtn").addEventListener("click", prevActivity);
document.getElementById("skipBtn").addEventListener("click", skipActivity);
$restSkipBtn.addEventListener("click", ()=>{ clearRest(); });

route();
