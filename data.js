// Edit your plan here. Times in seconds; youtube optional.
const PROGRAM = {
  warmup: [
    { name: "Neck rolls (slow, full circle)", seconds: 30 },
    { name: "Shoulder rolls (forward/back)", seconds: 30 },
    { name: "Torso twists (hands at chest, rotate left-right)", seconds: 30 },
    { name: "Hip circles (big, controlled)", seconds: 30 },
    { name: "Ankle rolls (each direction)", seconds: 30 },
    { name: "Wrist rotations (fingers spread wide)", seconds: 30 },
    { name: "Jumping jacks (30 sec)", seconds: 30 },
    { name: "High knees (30 sec)", seconds: 30 },
    { name: "Arm swings (cross-body + overhead)", seconds: 60 },
    { name: "Leg swings (forward/back, side to side)", seconds: 60 },
    { name: "Cat-Cow stretch (breathe slow and deep)", seconds: 60 },
    { name: "World’s Greatest Stretch (alternate sides)", seconds: 60 },
    { name: "Bodyweight squats (slow, full range)", seconds: 60 },
    { name: "Push-ups or Wall push-ups", seconds: 60 },
    { name: "Glute bridges", seconds: 60 },
  ],
  cooldown: [
    { name: "Standing Forward Fold (touch toes gently)", seconds: 30 },
    { name: "Chest Open Stretch (hands behind back, push out chest)", seconds: 30 },
    { name: "Seated Spinal Twist (each side)", seconds: 30 },
    { name: "Kneeling Hip Flexor Stretch (each side)", seconds: 30 },
    { name: "Child’s Pose", seconds: 60 },
    { name: "Cobra Stretch → Downward Dog (alternate slowly)", seconds: 60 },
  ],
  // Day 1..7
  workoutsByDay: {
    1: [
      { name: "Pushups", seconds: 60, youtube: "https://www.youtube.com/watch?v=IODxDxX7oi4" },
    ],
    2: [
      { name: "March or walk indoors", seconds: 300, youtube: "https://youtube.com/shorts/i-tXhCfodUs?si=D7UxBsGZzfbSMSfy" },
      { name: "Cat Cow stretch", seconds: 60, youtube: "https://youtu.be/LIVJZZyZ2qM?si=piJqDWOfPGXRu6Kg" },
      { name: "Child’s Pose", seconds: 60, youtube: "https://youtu.be/kH12QrSGedM?si=HxC7F0nzup6RolYV" },
      { name: "Torso rotations", seconds: 60, youtube: "https://youtube.com/shorts/L4kDNYVn-d4?si=PvUkrIpQC-_YAaAh" },
      { name: "Glute Bridge (slow) - 10 x 3", seconds: 0, youtube: "https://youtube.com/shorts/LORVjN2bg5o?si=DpPW58kycVvVd9t7" },
      { name: "Seated Forward Fold - 30 sec x 2", seconds: 30, youtube: "https://youtube.com/shorts/1E-84p0itDs?si=8V4OUCWxMX3BAkD4" },
      { name: "Shoulder Rolls + Arm Swings", seconds: 120, youtube: "https://youtube.com/shorts/n6rM7N-PPGA?si=KkftkeBA5H9xRExu" },
      { name: "Hamstring wall stretch", seconds: 120, youtube: "https://youtube.com/shorts/8ggkgq220bA?si=GvDPwgidznLhMDsX" },
      { name: "Belly breathing (hands on stomach)", seconds: 180, youtube: "https://youtube.com/shorts/gqS31aGUXq4?si=d-y63C6_V-QjzFvt" },
    ],
    3: [
      { name: "Glute Bridge - 15 x 3", seconds: 0, youtube: "https://youtube.com/shorts/LORVjN2bg5o?si=lQ06URgYlV76NyLR" },
      { name: "Dead Bug (slow) - 16 x 2", seconds: 0, youtube: "https://youtube.com/shorts/-8xqJ2xXs2A?si=XcPysxvaXMBbn0GF" },
      { name: "Plank - 20 sec x 3", seconds: 180, youtube: "https://youtube.com/shorts/xe2MXatLTUw?si=tzpTXPa9VL9t8I_v" },
      { name: "Side Plank (knees down) - 20 sec x 2", seconds: 180, youtube: "https://youtube.com/shorts/OxUqMcC944g?si=uNOXh6rd6Jwa-V1F" },
      { name: "Standing Side Bends - 15 x 3", seconds: 0, youtube: "https://youtube.com/shorts/H5bjGU7hUeA?si=qHI5fsXhYaQEwe4F" },
      { name: "Cobra Stretch → Down Dog - 5 rounds", seconds: 0, youtube: "https://youtube.com/shorts/-blQ3If_HEI?si=Zm-SQvVwPmWNx-zl" },
    ],
    4: [
      { name: "Cat-Cow", seconds: 60, youtube: "" },
      { name: "Downward Dog → Cobra Flow - 5 Rounds", seconds: 0, youtube: "" },
      { name: "World’s Greatest Stretch - 1 min/side", seconds: 120, youtube: "" },
      { name: "Bodyweight Squats (slow) - 10 x 2", seconds: 0, youtube: "" },
      { name: "Incline Pushups (easy angle) - 10 x 2", seconds: 0, youtube: "" },
      { name: "Glute Bridge - 12 x 2", seconds: 0, youtube: "" },
      { name: "Torso Rotations", seconds: 60, youtube: "" },
      { name: "Seated twist - 1 min/side", seconds: 120, youtube: "" },
    ],
    5: [
      { name: "", seconds: 180, youtube: "" },
    ],
    6: [
      { name: "", seconds: 180, youtube: "" },
    ],
    7: [
      { name: "", seconds: 180, youtube: "" },
    ]
  }
};
