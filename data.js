// Edit your warmups, cooldowns, and weekday workouts here.
// Times are seconds; youtube is optional. Keep keys as shown.
const PROGRAM = {
  warmup: [
    { name: "Joint mobility", seconds: 60 },
    { name: "Jumping jacks", seconds: 45 },
    { name: "Bodyweight squats", seconds: 45 },
  ],
  cooldown: [
    { name: "Hamstring stretch", seconds: 45 },
    { name: "Hip flexor stretch", seconds: 45 },
    { name: "Breathing", seconds: 60 },
  ],
  // 0=Sun ... 6=Sat
  workoutsByWeekday: {
    0: [ // Sunday
      { name: "Full body flow", seconds: 900, youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    ],
    1: [ // Monday
      { name: "Pushups", seconds: 60, youtube: "https://www.youtube.com/watch?v=IODxDxX7oi4" },
      { name: "Incline pushups", seconds: 60, youtube: "https://www.youtube.com/watch?v=E9wS9U4iGFM" },
      { name: "Plank", seconds: 60, youtube: "https://www.youtube.com/watch?v=pSHjTRCQxIw" },
    ],
    2: [ // Tuesday
      { name: "Leg day circuit", seconds: 900, youtube: "https://www.youtube.com/watch?v=C_LG4m1Y5oY" },
    ],
    3: [ // Wednesday
      { name: "Pull day", seconds: 900 },
    ],
    4: [ // Thursday
      { name: "Core burner", seconds: 600 },
    ],
    5: [ // Friday
      { name: "HIIT rounds", seconds: 600 },
    ],
    6: [ // Saturday
      { name: "Mobility flow", seconds: 600 },
    ],
  }
};
