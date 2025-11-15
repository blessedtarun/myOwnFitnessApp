// Edit your plan here. Times in seconds; youtube optional.
const PROGRAM = {
  warmup: [
  { name: "Neck rolls (slow circles)", seconds: 30 },
  { name: "Shoulder rolls (forward/back)", seconds: 30 },
  { name: "Torso twists", seconds: 30 },
  { name: "Hip circles", seconds: 30 },
  { name: "Ankle rotations (each side)", seconds: 30 },
  { name: "Arm swings (cross + overhead)", seconds: 30 },
  { name: "Leg swings (front/back, 15 sec per leg)", seconds: 30 },
  { name: "Leg swings (side-to-side, 15 sec per leg)", seconds: 30 },
  { name: "Cat-Cow stretch", seconds: 60, youtube: "https://youtu.be/LIVJZZyZ2qM" },
  { name: "World’s Greatest Stretch (alternate sides)", seconds: 60 },
  { name: "Glute bridge activation - 12 reps", seconds: 0 },
  { name: "Dead bug activation - 6 reps each side", seconds: 0 }
],

  cooldown: [
  { name: "Deep breathing (4-6 pattern)", seconds: 60 },
  { name: "Standing forward fold", seconds: 30 },
  { name: "Chest stretch (each side)", seconds: 30 },
  { name: "Seated spinal twist (each side)", seconds: 30 },
  { name: "Hip flexor stretch (each side)", seconds: 30 },
  { name: "Child’s Pose", seconds: 60 }
],
  // Day 1..7
  workoutsByDay: {
    1: [
  { name: "Incline Pushups - 3 x 6–8", seconds: 0, youtube: "https://youtu.be/MG8KADiRbOU" },
  { name: "Towel Rows (door) - 2 x 8–10", seconds: 0, youtube: "https://youtu.be/kqJ8C-cq5eE" },
  { name: "Dead Bug - 2 x 8 each side", seconds: 0, youtube: "https://youtube.com/shorts/-8xqJ2xXs2A" },
  { name: "Knee Pushups (slow) - 2 x 6", seconds: 0, youtube: "https://youtu.be/cZU9AwhJgP0" },
  { name: "Plank - 20–25 sec x 2", seconds: 50, youtube: "https://youtube.com/shorts/xe2MXatLTUw" }
],
    2: [
  { name: "Walk / March Indoors", seconds: 600, youtube: "https://youtube.com/shorts/i-tXhCfodUs" },
  { name: "Cat-Cow stretch", seconds: 60, youtube: "https://youtu.be/LIVJZZyZ2qM" },
  { name: "Child’s Pose", seconds: 60, youtube: "https://youtu.be/kH12QrSGedM" },
  { name: "Torso rotations", seconds: 30, youtube: "https://youtube.com/shorts/L4kDNYVn-d4" },
  { name: "Hamstring wall stretch", seconds: 120, youtube: "https://youtube.com/shorts/8ggkgq220bA" },
  { name: "Shoulder Rolls + Arm Swings", seconds: 60 },
  { name: "Belly Breathing (hands on stomach)", seconds: 120 }
],
    3: [
  { name: "Bodyweight Squats - 3 x 8–10", seconds: 0, youtube: "https://youtu.be/aclHkVaku9U" },
  { name: "Reverse Lunges - 2 x 6 each leg", seconds: 0, youtube: "https://youtu.be/QOVaa5E8vOI" },
  { name: "Glute Bridge - 3 x 12", seconds: 0, youtube: "https://youtube.com/shorts/LORVjN2bg5o" },
  { name: "Calf Raises - 2 x 12", seconds: 0, youtube: "https://youtu.be/YyT4wuk0pCI" },
  { name: "Side Plank (knees down) - 15 sec each side x 2", seconds: 60, youtube: "https://youtube.com/shorts/OxUqMcC944g" }
],
    4: [
  { name: "Cat-Cow", seconds: 60 },
  { name: "Downward Dog → Cobra Flow (5 rounds)", seconds: 0, youtube: "https://youtube.com/shorts/-blQ3If_HEI" },
  { name: "World’s Greatest Stretch - 1 min each side", seconds: 120 },
  { name: "Glute Bridge - 2 x 12", seconds: 0 },
  { name: "Bodyweight Squats (slow) - 2 x 10", seconds: 0 },
  { name: "Incline Pushups (easy) - 2 x 8", seconds: 0 },
  { name: "Seated Twist - 1 min each side", seconds: 120 }
],
    5: [
  { name: "Incline Pushups - 2 x 8", seconds: 0, youtube: "https://youtu.be/MG8KADiRbOU" },
  { name: "Backpack Rows - 2 x 8", seconds: 0, youtube: "https://youtu.be/-koP10y1qZI" },
  { name: "Bodyweight Squats - 2 x 10", seconds: 0 },
  { name: "Glute Bridge - 2 x 12", seconds: 0 },
  { name: "Bird-Dog - 2 x 6 each side", seconds: 0, youtube: "https://youtu.be/v5h2jxiKXn0" }
],
    6: [
  { name: "Walk / March Indoors", seconds: 600 },
  { name: "Shadow Boxing (light)", seconds: 120, youtube: "https://youtu.be/2wP1t8O4bHQ" },
  { name: "Slow Kegels - 6 reps", seconds: 0 },
  { name: "Fast Kegels - 6 reps", seconds: 0 },
  { name: "Reverse Kegels - 10 breaths", seconds: 0 },
  { name: "Glute Bridge - 10 reps", seconds: 0 }
],
    7: [
  { name: "Light Walk", seconds: 600 },
  { name: "Full Body Stretch Flow", seconds: 300, youtube: "https://youtu.be/Eml2xnoLpYE" },
  { name: "Deep Breathing (relaxation)", seconds: 120 }
]
  }
};
