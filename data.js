// Edit your plan here. Times in seconds; youtube optional.
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
  // Day 1..7
  workoutsByDay: {
    1: [
      { name: "Pushups", seconds: 60, youtube: "https://www.youtube.com/watch?v=IODxDxX7oi4" },
      { name: "Incline pushups", seconds: 60, youtube: "https://www.youtube.com/watch?v=E9wS9U4iGFM" },
      { name: "Plank", seconds: 60, youtube: "https://www.youtube.com/watch?v=pSHjTRCQxIw" },
    ],
    2: [
      { name: "Leg day circuit", seconds: 900, youtube: "https://www.youtube.com/watch?v=C_LG4m1Y5oY" },
    ],
    3: [
      { name: "Pull day", seconds: 900 },
    ],
    4: [
      { name: "Core burner", seconds: 600 },
    ],
    5: [
      { name: "HIIT rounds", seconds: 600 },
    ],
    6: [
      { name: "Mobility flow", seconds: 600 },
    ],
    7: [
      { name: "Full body flow", seconds: 900 },
    ]
  }
};
