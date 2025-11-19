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
    { name: "Cat-Cow stretch (slow, 10 reps)", seconds: 60, youtube: "https://youtu.be/LIVJZZyZ2qM" },
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
      { name: "Incline Pushups - 3 x 6–8 (single entry)", seconds: 0, youtube: "https://youtu.be/MG8KADiRbOU" },
      { name: "Towel Rows (door) - 2 x 8–10", seconds: 0, youtube: "https://youtu.be/kqJ8C-cq5eE" },
      { name: "Dead Bug - 2 x 8 each side", seconds: 0, youtube: "https://youtube.com/shorts/-8xqJ2xXs2A" },
      { name: "Knee Pushups (slow) - 2 x 6", seconds: 0, youtube: "https://youtu.be/cZU9AwhJgP0" },
      { name: "Plank - 20–25 sec (Set 1)", seconds: 25, youtube: "https://youtube.com/shorts/xe2MXatLTUw" },
      { name: "Plank - 20–25 sec (Set 2)", seconds: 25, youtube: "https://youtube.com/shorts/xe2MXatLTUw" }
    ],

    // DAY 2 — Light Cardio + Mobility
    2: [
      { name: "Walk / March Indoors (steady)", seconds: 600, youtube: "https://youtube.com/shorts/i-tXhCfodUs" },
      { name: "Cat-Cow stretch", seconds: 60, youtube: "https://youtu.be/LIVJZZyZ2qM" },
      { name: "Child’s Pose", seconds: 60, youtube: "https://youtu.be/kH12QrSGedM" },
      { name: "Torso rotations (slow)", seconds: 30, youtube: "https://youtube.com/shorts/L4kDNYVn-d4" },
      { name: "Hamstring wall stretch (Left)", seconds: 60, youtube: "https://youtube.com/shorts/8ggkgq220bA" },
      { name: "Hamstring wall stretch (Right)", seconds: 60, youtube: "https://youtube.com/shorts/8ggkgq220bA" },
      { name: "Shoulder Rolls + Arm Swings", seconds: 60 },
      { name: "Belly Breathing (hands on stomach)", seconds: 120, youtube: "https://youtube.com/shorts/gqS31aGUXq4" }
    ],

    // DAY 3 — Lower Body + Light Core
    3: [
      { name: "Bodyweight Squats - 3 x 8–10", seconds: 0, youtube: "https://youtu.be/aclHkVaku9U" },
      { name: "Reverse Lunge - Left - 2 x 6 reps", seconds: 0, youtube: "https://youtu.be/QOVaa5E8vOI" },
      { name: "Reverse Lunge - Right - 2 x 6 reps", seconds: 0, youtube: "https://youtu.be/QOVaa5E8vOI" },
      { name: "Glute Bridge - 3 x 12", seconds: 0, youtube: "https://youtube.com/shorts/LORVjN2bg5o" },
      { name: "Calf Raises - 2 x 12", seconds: 0, youtube: "https://youtu.be/YyT4wuk0pCI" },
      { name: "Side Plank (Left, knees down) - 15 sec", seconds: 15, youtube: "https://youtube.com/shorts/OxUqMcC944g" },
      { name: "Side Plank (Right, knees down) - 15 sec", seconds: 15, youtube: "https://youtube.com/shorts/OxUqMcC944g" }
    ],

    // DAY 4 — Recovery Mobility + Light Core
    4: [
      { name: "Cat-Cow", seconds: 60, youtube: "https://youtu.be/LIVJZZyZ2qM" },
      { name: "Downward Dog → Cobra Flow (one round)", seconds: 0, youtube: "https://youtube.com/shorts/-blQ3If_HEI" },
      { name: "Downward Dog → Cobra Flow (repeat 4 more rounds)", seconds: 0, youtube: "https://youtube.com/shorts/-blQ3If_HEI" },
      { name: "World’s Greatest Stretch - Left (60 sec)", seconds: 60 },
      { name: "World’s Greatest Stretch - Right (60 sec)", seconds: 60 },
      { name: "Glute Bridge - 2 x 12", seconds: 0 },
      { name: "Bodyweight Squats (slow) - 2 x 10", seconds: 0 },
      { name: "Incline Pushups (easy) - 2 x 8", seconds: 0 },
      { name: "Seated Twist - Left (60 sec)", seconds: 60 },
      { name: "Seated Twist - Right (60 sec)", seconds: 60 }
    ],

    // DAY 5 — Full Body Strength (Light)
    5: [
      { name: "Incline Pushups - 2 x 8", seconds: 0, youtube: "https://youtu.be/MG8KADiRbOU" },
      { name: "Backpack Rows - 2 x 8", seconds: 0, youtube: "https://youtu.be/-koP10y1qZI" },
      { name: "Bodyweight Squats - 2 x 10", seconds: 0 },
      { name: "Glute Bridge - 2 x 12", seconds: 0 },
      { name: "Bird-Dog - Left - 2 x 6 reps", seconds: 0, youtube: "https://youtu.be/v5h2jxiKXn0" },
      { name: "Bird-Dog - Right - 2 x 6 reps", seconds: 0, youtube: "https://youtu.be/v5h2jxiKXn0" }
    ],

    // DAY 6 — Light Cardio + Optional Pelvic Routine
    6: [
      { name: "Walk / March Indoors (steady)", seconds: 600 },
      { name: "Shadow Boxing (light)", seconds: 120, youtube: "https://youtu.be/2wP1t8O4bHQ" },
      { name: "Slow Kegels - 6 reps", seconds: 0 },
      { name: "Fast Kegels - 6 reps", seconds: 0 },
      { name: "Reverse Kegels (10 slow breaths)", seconds: 0 },
      { name: "Glute Bridge - 10 reps", seconds: 0 }
    ],

    // DAY 7 — Rest + Stretch Day
    7: [
      { name: "Light Walk (easy)", seconds: 600 },
      { name: "Full Body Stretch Flow", seconds: 300, youtube: "https://youtu.be/Eml2xnoLpYE" },
      { name: "Deep Breathing (relaxation)", seconds: 120 }
    ]
  }
};
