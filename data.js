// Week 1 — Split (left/right) version for your app
const PROGRAM = {
  warmup: [
    { name: "Neck rolls (slow circles)", seconds: 30 },
    { name: "Shoulder rolls (forward/back)", seconds: 30 },
    { name: "Torso twists (hands at chest)", seconds: 30 },
    { name: "Hip circles (big, controlled)", seconds: 30 },
    { name: "Ankle rotation (Left)", seconds: 15 },
    { name: "Ankle rotation (Right)", seconds: 15 },
    { name: "Arm swings (cross + overhead)", seconds: 30 },
    { name: "Leg swings - Forward/Back (Left) - 15 sec", seconds: 15 },
    { name: "Leg swings - Forward/Back (Right) - 15 sec", seconds: 15 },
    { name: "Leg swings - Side-to-Side (Left) - 15 sec", seconds: 15 },
    { name: "Leg swings - Side-to-Side (Right) - 15 sec", seconds: 15 },
    { name: "Cat-Cow stretch (slow, 10 reps)", seconds: 0, youtube: "https://youtu.be/LIVJZZyZ2qM" },
    { name: "World’s Greatest Stretch - Left (30 sec)", seconds: 30 },
    { name: "World’s Greatest Stretch - Right (30 sec)", seconds: 30 },
    { name: "Glute bridge activation - 12 reps", seconds: 0, youtube: "https://youtube.com/shorts/LORVjN2bg5o" },
    { name: "Dead bug activation - 6 reps each side", seconds: 0, youtube: "https://youtube.com/shorts/-8xqJ2xXs2A" }
  ],
  cooldown: [
    { name: "Deep breathing (4 sec in / 6 sec out)", seconds: 60 },
    { name: "Standing forward fold", seconds: 30 },
    { name: "Chest stretch (Left)", seconds: 30 },
    { name: "Chest stretch (Right)", seconds: 30 },
    { name: "Seated spinal twist (Left)", seconds: 30 },
    { name: "Seated spinal twist (Right)", seconds: 30 },
    { name: "Hip flexor stretch (Left)", seconds: 30 },
    { name: "Hip flexor stretch (Right)", seconds: 30 },
    { name: "Child’s Pose", seconds: 60 }
  ],
  workoutsByDay: {
    // DAY 1 — Upper Body + Core (Push focus)
    1: [
  { name: "Incline Pushups - 3 x 8–10", seconds: 0, youtube: "https://youtu.be/MG8KADiRbOU" },

  { name: "Pushup Negative (slow 3-sec drop) - 2 reps x 2 sets", seconds: 0, youtube: "https://youtu.be/2MZyADwI83o" },

  { name: "Towel Rows (door) - 3 x 10", seconds: 0, youtube: "https://youtu.be/kqJ8C-cq5eE" },

  { name: "Dead Bug - 2 x 10 each side", seconds: 0, youtube: "https://youtube.com/shorts/-8xqJ2xXs2A" },

  { name: "Modified Side Plank (Left) - 20 sec", seconds: 20, youtube: "https://youtube.com/shorts/OxUqMcC944g" },
  { name: "Modified Side Plank (Right) - 20 sec", seconds: 20, youtube: "https://youtube.com/shorts/OxUqMcC944g" },

  { name: "Plank Hold - 25 sec (Set 1)", seconds: 25, youtube: "https://youtube.com/shorts/xe2MXatLTUw" },
  { name: "Plank Hold - 25 sec (Set 2)", seconds: 25, youtube: "https://youtube.com/shorts/xe2MXatLTUw" }
],


    // DAY 2 — Light Cardio + Mobility
    2: [
  { name: "Walk / March Indoors", seconds: 720, youtube: "https://youtube.com/shorts/i-tXhCfodUs" },

  { name: "Cat-Cow stretch", seconds: 60 },
  { name: "Child’s Pose", seconds: 60 },

  { name: "Torso rotations", seconds: 30 },

  { name: "Hamstring wall stretch (Left)", seconds: 60 },
  { name: "Hamstring wall stretch (Right)", seconds: 60 },

  { name: "Standing Quad Stretch (Left)", seconds: 30 },
  { name: "Standing Quad Stretch (Right)", seconds: 30 },

  { name: "Belly Breathing (hands on stomach)", seconds: 120 }
],

    // DAY 3 — Lower Body + Light Core
    3: [
  { name: "Bodyweight Squats - 3 x 12", seconds: 0 },

  { name: "Reverse Lunges - Left - 2 x 8 reps", seconds: 0 },
  { name: "Reverse Lunges - Right - 2 x 8 reps", seconds: 0 },

  { name: "Glute Bridge - 3 x 15", seconds: 0 },

  { name: "Hip Hinge (no weight) - 2 x 10", seconds: 0, youtube: "https://youtu.be/8lH4Gq9rA5k" },

  { name: "Calf Raises - 3 x 12", seconds: 0 },

  { name: "Side Plank (Left, knees down) - 20 sec", seconds: 20 },
  { name: "Side Plank (Right, knees down) - 20 sec", seconds: 20 }
],

    // DAY 4 — Recovery Mobility + Light Core
    4: [
  { name: "Cat-Cow", seconds: 60 },

  { name: "Downward Dog → Cobra Flow (6 rounds)", seconds: 0 },

  { name: "World’s Greatest Stretch - Left (60 sec)", seconds: 60 },
  { name: "World’s Greatest Stretch - Right (60 sec)", seconds: 60 },

  { name: "Glute Bridge - 2 x 15", seconds: 0 },

  { name: "Bird-Dog - Left - 8 reps", seconds: 0 },
  { name: "Bird-Dog - Right - 8 reps", seconds: 0 },

  { name: "Seated Twist - Left (60 sec)", seconds: 60 },
  { name: "Seated Twist - Right (60 sec)", seconds: 60 }
],

    // DAY 5 — Full Body Strength (Light)
    5: [
  { name: "Incline Pushups - 3 x 8–10", seconds: 0 },

  { name: "Backpack Rows - 3 x 10", seconds: 0 },

  { name: "Bodyweight Squats - 3 x 12", seconds: 0 },

  { name: "Glute Bridge March - Left - 10 reps", seconds: 0, youtube: "https://youtu.be/YUajPZnxxSs" },
  { name: "Glute Bridge March - Right - 10 reps", seconds: 0, youtube: "https://youtu.be/YUajPZnxxSs" },

  { name: "Plank with Knee Taps - 20 sec", seconds: 20, youtube: "https://youtu.be/LvRr0TMT6hA" }
],

    // DAY 6 — Light Cardio + Optional Pelvic Routine
    6: [
  { name: "Walk / March Indoors", seconds: 720 },

  { name: "Shadow Boxing (steady pace)", seconds: 150, youtube: "https://youtu.be/2wP1t8O4bHQ" },

  // Pelvic routine
  { name: "Slow Kegels - 8 reps", seconds: 0 },
  { name: "Fast Kegels - 10 reps", seconds: 0 },
  { name: "Reverse Kegels (10 breaths)", seconds: 0 },
  { name: "Glute Bridge - 12 reps", seconds: 0 }
],

    // DAY 7 — Rest + Stretch Day
    7: [
  { name: "Light Walk (easy)", seconds: 600 },

  { name: "Full Body Stretch Flow", seconds: 360, youtube: "https://youtu.be/Eml2xnoLpYE" },

  { name: "Deep Breathing (relaxation)", seconds: 150 }
]

  }
};
