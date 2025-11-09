/* app.js
   Phone-first single-file logic for My Own Fitness App.

   Edit the DATA object below to add your exercises, durations (in seconds)
   and YouTube links. This file controls the flow: Warmup -> Workout -> Cooldown.

   Persistence: localStorage under key "mofa_state".
*/

const STORAGE_KEY = 'mofa_state_v1';

/* ====== EDIT THIS: exercises, durations (seconds), youtube links ======
   Warmup and cooldown arrays are used every day.
   workouts is an object keyed by weekday names (Sunday..Saturday)
   Each activity: { id, name, seconds, youtube } - youtube optional
*/
const DATA = {
  warmup: [
    { id: 'wu1', name: 'Arm Circles', seconds: 30 },
    { id: 'wu2', name: 'High Knees (march)', seconds: 30 },
    { id: 'wu3', name: 'Leg Swings', seconds: 30 }
  ],
  workouts: {
    // Sunday (0) through Saturday (6)
    Sunday: [
      { id: 's-w1', name: 'Push-ups', seconds: 45, youtube: 'https://www.youtube.com/watch?v=_l3ySVKYVJ8' },
      { id: 's-w2', name: 'Bodyweight Squats', seconds: 60, youtube: 'https://www.youtube.com/watch?v=aclHkVaku9U' }
    ],
    Monday: [
      { id: 'm-w1', name: 'Plank', seconds: 60, youtube: 'https://www.youtube.com/watch?v=pSHjTRCQxIw' },
      { id: 'm-w2', name: 'Lunges', seconds: 45, youtube: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U' }
    ],
    Tuesday: [
      { id: 't-w1', name: 'Jumping Jacks', seconds: 45 },
      { id: 't-w2', name: 'Glute Bridges', seconds: 50 }
    ],
    Wednesday: [
      { id: 'w-w1', name: 'Mountain Climbers', seconds: 40 },
      { id: 'w-w2', name: 'Tricep Dips', seconds: 45 }
    ],
    Thursday: [
      { id: 'th-w1', name: 'Burpees', seconds: 30 },
      { id: 'th-w2', name: 'Calf Raises', seconds: 45 }
    ],
    Friday: [
      { id: 'f-w1', name: 'Bicycle Crunches', seconds: 45 },
      { id: 'f-w2', name: 'Supermans', seconds: 40 }
    ],
    Saturday: [
      { id: 'sa-w1', name: 'Shadow Boxing', seconds: 60 },
      { id: 'sa-w2', name: 'Side Plank', seconds: 45 }
    ]
  },
  cooldown: [
    { id: 'cd1', name: 'Hamstring Stretch', seconds: 30 },
    { id: 'cd2', name: 'Child Pose', seconds: 45 },
    { id: 'cd3', name: 'Deep Breaths', seconds: 30 }
  ]
};
/* ====== end of editable section ====== */

/* App state shape stored in localStorage:
{
  dayOffset: 0, // number of advanced days from today (incremented when user starts next day)
  stage: 'home' | 'warmup' | 'workout' | 'cooldown' | 'summary',
  warmupCompleted: { id: true, ... },
  workoutCompleted: { id: true, ... },
  cooldownCompleted: { id: true, ... }
}
*/
const DEFAULT_STATE = {
  dayOffset: 0,
  stage: 'home',
  warmupCompleted: {},
  workoutCompleted: {},
  cooldownCompleted: {},
  // Currently running timer metadata (not persisted across reload)
  _runningTimer: null
};

let state = loadState();

/* ====== Helper utilities ====== */
function saveState() {
  const copy = { ...state };
  // don't persist transient fields (start timers)
  delete copy._runningTimer;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...DEFAULT_STATE };
  try {
    return Object.assign({}, DEFAULT_STATE, JSON.parse(raw));
  } catch (e) {
    console.error('Failed to parse state, resetting', e);
    return { ...DEFAULT_STATE };
  }
}

function resetProgress() {
  state.warmupCompleted = {};
  state.workoutCompleted = {};
  state.cooldownCompleted = {};
  state.stage = 'home';
  saveState();
  render();
}

function advanceDay() {
  // increments dayOffset so weekday changes
  state.dayOffset = (state.dayOffset || 0) + 1;
  resetProgress();
  saveState();
}

/* get effective weekday name based on dayOffset */
function getEffectiveDate() {
  const d = new Date();
  d.setDate(d.getDate() + (state.dayOffset || 0));
  return d;
}
function getWeekdayNameForState() {
  const d = getEffectiveDate();
  return weekdayName(d.getDay());
}
function weekdayName(n) {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][n];
}

/* ====== DOM references ====== */
const screens = {
  home: document.getElementById('screen-home'),
  warmup: document.getElementById('screen-warmup'),
  workout: document.getElementById('screen-workout'),
  cooldown: document.getElementById('screen-cooldown'),
  summary: document.getElementById('screen-summary')
};
const dateDisplay = document.getElementById('dateDisplay');
const homeDayName = document.getElementById('home-day-name');
const startDayBtn = document.getElementById('start-day-btn');
const viewConfigBtn = document.getElementById('view-config-btn');

const warmupList = document.getElementById('warmup-list');
const skipWarmupBtn = document.getElementById('skip-warmup-btn');

const workoutHeading = document.getElementById('workout-heading');
const workoutSubtitle = document.getElementById('workout-subtitle');
const workoutList = document.getElementById('workout-list');
const startCooldownBtn = document.getElementById('start-cooldown-btn');
const resetDayAfterWorkoutBtn = document.getElementById('reset-day-after-workout-btn');

const cooldownList = document.getElementById('cooldown-list');
const finishDayBtn = document.getElementById('finish-day-btn');
const resetDayCooldownBtn = document.getElementById('reset-day-cooldown-btn');

const summaryBody = document.getElementById('summary-body');
const advanceDayBtn = document.getElementById('advance-day-btn');
const resetDayBtn = document.getElementById('reset-day-btn');

// Timer modal
const timerModal = document.getElementById('timer-modal');
const timerTitle = document.getElementById('timer-title');
const timerActivityText = document.getElementById('timer-activity');
const timerDisplay = document.getElementById('timer-display');
const timerPauseBtn = document.getElementById('timer-pause');
const timerCancelBtn = document.getElementById('timer-cancel');

const dingAudio = document.getElementById('ding-audio');

/* ====== Event bindings ====== */
startDayBtn.addEventListener('click', () => {
  // start day: go to warmup
  state.stage = 'warmup';
  saveState();
  render();
});
viewConfigBtn.addEventListener('click', () => {
  alert('Edit exercises, durations and YouTube links inside app.js in the DATA object.');
});

skipWarmupBtn.addEventListener('click', () => {
  // mark all warmup done and move to workout
  DATA.warmup.forEach(a => state.warmupCompleted[a.id] = true);
  state.stage = 'workout';
  saveState();
  render();
});

startCooldownBtn.addEventListener('click', () => {
  state.stage = 'cooldown';
  saveState();
  render();
});
resetDayAfterWorkoutBtn.addEventListener('click', () => {
  if (confirm('Reset today progress?')) resetProgress();
});

finishDayBtn.addEventListener('click', () => {
  state.stage = 'summary';
  saveState();
  render();
});
resetDayCooldownBtn.addEventListener('click', () => {
  if (confirm('Reset today progress?')) resetProgress();
});

advanceDayBtn.addEventListener('click', () => {
  advanceDay();
});
resetDayBtn.addEventListener('click', () => {
  if (confirm('Reset today progress?')) resetProgress();
});

/* Timer controls */
timerPauseBtn.addEventListener('click', () => {
  togglePauseTimer();
});
timerCancelBtn.addEventListener('click', () => {
  cancelTimer();
});

/* ====== Render functions ====== */
function hideAllScreens() {
  Object.values(screens).forEach(s => s.classList.add('hidden'));
}
function showScreen(name) {
  hideAllScreens();
  screens[name].classList.remove('hidden');
}

function renderDateHeader() {
  const d = getEffectiveDate();
  const opts = { weekday: 'long', month: 'short', day: 'numeric' };
  dateDisplay.textContent = d.toLocaleDateString(undefined, opts);
  homeDayName.textContent = `Today is ${weekdayName(d.getDay())}.`;
}

function render() {
  renderDateHeader();
  // decide which screen
  const stage = state.stage || 'home';
  if (stage === 'home') {
    showScreen('home');
  } else if (stage === 'warmup') {
    showScreen('warmup');
    renderWarmup();
  } else if (stage === 'workout') {
    showScreen('workout');
    renderWorkout();
  } else if (stage === 'cooldown') {
    showScreen('cooldown');
    renderCooldown();
  } else if (stage === 'summary') {
    showScreen('summary');
    renderSummary();
  } else {
    showScreen('home');
  }
}

/* --- Warmup rendering & interaction --- */
function renderWarmup() {
  warmupList.innerHTML = '';
  DATA.warmup.forEach((act, idx) => {
    const li = document.createElement('li');
    if (state.warmupCompleted[act.id]) li.classList.add('completed');

    const left = document.createElement('div');
    left.className = 'activity-left';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = act.name;
    const meta = document.createElement('div');
    meta.className = 'activity-meta';
    meta.textContent = `${act.seconds}s`;

    left.appendChild(title);
    left.appendChild(meta);

    const right = document.createElement('div');
    right.className = 'activity-controls';
    const startBtn = document.createElement('button');
    startBtn.textContent = state.warmupCompleted[act.id] ? 'Done' : 'Start';
    startBtn.disabled = !!state.warmupCompleted[act.id];
    startBtn.addEventListener('click', () => {
      startActivityTimer(act, () => {
        state.warmupCompleted[act.id] = true;
        saveState();
        render();
        // auto-scroll to next
        const next = idx + 1;
        if (next < DATA.warmup.length) {
          const el = warmupList.children[next];
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // finished warmup -> move to workout
          state.stage = 'workout';
          saveState();
          setTimeout(render, 700);
        }
      });
    });

    right.appendChild(startBtn);

    li.appendChild(left);
    li.appendChild(right);

    warmupList.appendChild(li);
  });
}

/* --- Workout rendering & interaction --- */
function renderWorkout() {
  workoutList.innerHTML = '';
  const weekday = getWeekdayNameForState();
  workoutHeading.textContent = `${weekday} Workout`;
  workoutSubtitle.textContent = `Exercises for ${weekday}`;
  const todayExercises = DATA.workouts[weekday] || [];

  todayExercises.forEach((act, idx) => {
    const li = document.createElement('li');
    if (state.workoutCompleted[act.id]) li.classList.add('completed');

    const left = document.createElement('div');
    left.className = 'activity-left';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = act.name;
    const meta = document.createElement('div');
    meta.className = 'activity-meta';
    meta.textContent = `${act.seconds}s`;

    left.appendChild(title);
    left.appendChild(meta);

    const right = document.createElement('div');
    right.className = 'activity-controls';

    if (act.youtube) {
      const yt = document.createElement('button');
      yt.className = 'secondary';
      yt.textContent = 'Watch';
      yt.addEventListener('click', () => {
        window.open(act.youtube, '_blank', 'noopener');
      });
      right.appendChild(yt);
    }

    const startBtn = document.createElement('button');
    startBtn.textContent = state.workoutCompleted[act.id] ? 'Done' : 'Start';
    startBtn.disabled = !!state.workoutCompleted[act.id];
    startBtn.addEventListener('click', () => {
      startActivityTimer(act, () => {
        state.workoutCompleted[act.id] = true;
        saveState();
        render();
      });
    });
    right.appendChild(startBtn);

    // Manual complete button
    const manual = document.createElement('button');
    manual.className = 'secondary';
    manual.textContent = 'Mark';
    manual.addEventListener('click', () => {
      if (confirm(`Mark "${act.name}" as complete?`)) {
        state.workoutCompleted[act.id] = true;
        saveState();
        render();
      }
    });
    right.appendChild(manual);

    li.appendChild(left);
    li.appendChild(right);
    workoutList.appendChild(li);
  });

  // Show start-cooldown once all workout exercises are complete
  const allDone = todayExercises.length > 0 && todayExercises.every(a => state.workoutCompleted[a.id]);
  startCooldownBtn.classList.toggle('hidden', !allDone);
  resetDayAfterWorkoutBtn.classList.toggle('hidden', false);
}

/* --- Cooldown rendering & interaction --- */
function renderCooldown() {
  cooldownList.innerHTML = '';
  DATA.cooldown.forEach((act, idx) => {
    const li = document.createElement('li');
    if (state.cooldownCompleted[act.id]) li.classList.add('completed');

    const left = document.createElement('div');
    left.className = 'activity-left';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = act.name;
    const meta = document.createElement('div');
    meta.className = 'activity-meta';
    meta.textContent = `${act.seconds}s`;

    left.appendChild(title);
    left.appendChild(meta);

    const right = document.createElement('div');
    right.className = 'activity-controls';
    const startBtn = document.createElement('button');
    startBtn.textContent = state.cooldownCompleted[act.id] ? 'Done' : 'Start';
    startBtn.disabled = !!state.cooldownCompleted[act.id];
    startBtn.addEventListener('click', () => {
      startActivityTimer(act, () => {
        state.cooldownCompleted[act.id] = true;
        saveState();
        render();
        // if finished all cooldown then summary
        const allCd = DATA.cooldown.every(a => state.cooldownCompleted[a.id]);
        if (allCd) {
          state.stage = 'summary';
          saveState();
          setTimeout(render, 600);
        }
      });
    });

    right.appendChild(startBtn);
    li.appendChild(left);
    li.appendChild(right);
    cooldownList.appendChild(li);
  });

  const allDone = DATA.cooldown.length > 0 && DATA.cooldown.every(a => state.cooldownCompleted[a.id]);
  finishDayBtn.classList.toggle('hidden', !allDone);
}

/* --- Summary --- */
function renderSummary() {
  const d = getEffectiveDate();
  const weekday = weekdayName(d.getDay());
  const todayExercises = DATA.workouts[weekday] || [];

  const warmDone = DATA.warmup.map(a => ({ name: a.name, done: !!state.warmupCompleted[a.id] }));
  const workDone = todayExercises.map(a => ({ name: a.name, done: !!state.workoutCompleted[a.id] }));
  const cdDone = DATA.cooldown.map(a => ({ name: a.name, done: !!state.cooldownCompleted[a.id] }));

  const fragment = document.createElement('div');

  const hWarm = document.createElement('h3'); hWarm.textContent = 'Warm Up';
  fragment.appendChild(hWarm);
  const ul1 = document.createElement('ul');
  warmDone.forEach(it => {
    const li = document.createElement('li'); li.textContent = `${it.name} — ${it.done ? '✓' : '✗'}`; ul1.appendChild(li);
  });
  fragment.appendChild(ul1);

  const hWork = document.createElement('h3'); hWork.textContent = `${weekday} Workout`;
  fragment.appendChild(hWork);
  const ul2 = document.createElement('ul');
  workDone.forEach(it => {
    const li = document.createElement('li'); li.textContent = `${it.name} — ${it.done ? '✓' : '✗'}`; ul2.appendChild(li);
  });
  fragment.appendChild(ul2);

  const hCd = document.createElement('h3'); hCd.textContent = 'Cool Down';
  fragment.appendChild(hCd);
  const ul3 = document.createElement('ul');
  cdDone.forEach(it => {
    const li = document.createElement('li'); li.textContent = `${it.name} — ${it.done ? '✓' : '✗'}`; ul3.appendChild(li);
  });
  fragment.appendChild(ul3);

  summaryBody.innerHTML = '';
  summaryBody.appendChild(fragment);
}

/* ====== Timer implementation ====== */
let timerInterval = null;
let currentTimer = null;

function startActivityTimer(activity, onComplete) {
  if (currentTimer) {
    if (!confirm('A timer is already running. Stop it and start a new one?')) return;
    cancelTimer();
  }
  // prepare modal
  timerTitle.textContent = 'Activity Timer';
  timerActivityText.textContent = activity.name;
  timerDisplay.textContent = formatTime(activity.seconds);
  timerModal.classList.remove('hidden');

  currentTimer = {
    activity,
    remaining: activity.seconds,
    running: true,
    onComplete
  };
  timerPauseBtn.textContent = 'Pause';

  timerInterval = setInterval(() => {
    if (!currentTimer || !currentTimer.running) return;
    currentTimer.remaining -= 1;
    if (currentTimer.remaining < 0) {
      completeTimer();
      return;
    }
    timerDisplay.textContent = formatTime(currentTimer.remaining);
  }, 1000);

  // play a subtle start sound if available
  tryPlayBeep(0.06);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function togglePauseTimer() {
  if (!currentTimer) return;
  currentTimer.running = !currentTimer.running;
  timerPauseBtn.textContent = currentTimer.running ? 'Pause' : 'Resume';
}

function cancelTimer() {
  if (!currentTimer) {
    timerModal.classList.add('hidden');
    return;
  }
  clearInterval(timerInterval);
  timerInterval = null;
  currentTimer = null;
  timerModal.classList.add('hidden');
}

function completeTimer() {
  // fire ding
  tryPlayBeep(0.2);
  clearInterval(timerInterval);
  timerInterval = null;
  timerModal.classList.add('hidden');

  const finish = currentTimer && currentTimer.onComplete;
  currentTimer = null;
  if (typeof finish === 'function') {
    finish();
  }
}

/* tiny beep using WebAudio to avoid shipping audio files */
function tryPlayBeep(vol = 0.12) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = vol;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    o.stop(ctx.currentTime + 0.12);
  } catch (e) {
    // ignore
  }
}

/* ====== Initialization ====== */
function ensureStageTransitions() {
  // if warmup all complete but still at warmup stage, move forward
  if (state.stage === 'warmup') {
    const allWarm = DATA.warmup.length === 0 || DATA.warmup.every(a => state.warmupCompleted[a.id]);
    if (allWarm) {
      state.stage = 'workout';
      saveState();
    }
  }
  // if workout complete and stage is workout, show cooldown controls
  if (state.stage === 'workout') {
    const weekday = getWeekdayNameForState();
    const todayExercises = DATA.workouts[weekday] || [];
    const allWork = todayExercises.length === 0 || todayExercises.every(a => state.workoutCompleted[a.id]);
    if (allWork) {
      // let user decide to start cooldown - UI will show button
    }
  }
}

function boot() {
  ensureStageTransitions();
  render();
}

boot();

/* Expose some functions for debugging in console (optional) */
window.MOFA = {
  DATA, state, saveState, resetProgress, advanceDay, startActivityTimer
};
