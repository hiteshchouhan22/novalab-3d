export type Lab = {
  id: string;
  title: string;
  subject: "Physics" | "Chemistry" | "Biology";
  classLevel: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  aim: string;
  theory: string[];
  procedure: string[];
  gradient: string;
  accent: string;
  emoji: string;
  concepts: string[];
};

export const labs: Lab[] = [
  {
    id: "pendulum",
    title: "Simple Pendulum",
    subject: "Physics",
    classLevel: "Class 11",
    duration: "15 min",
    difficulty: "Easy",
    description: "Change length & gravity, watch the period change live. Measure T, verify T = 2π√(L/g) with a real-time graph.",
    aim: "To study how the time period of a simple pendulum depends on length and gravity.",
    theory: ["T = 2π √(L / g) - period depends only on length and gravity, not on mass.", "For small angles (<15°), motion is simple harmonic.", "Increasing length increases period; increasing gravity decreases it."],
    procedure: ["Set the string length using the slider.", "Choose a planet to change gravity.", "Drag / set release angle and press Play.", "Observe the live graph and period readout, compare with theory."],
    gradient: "from-indigo-500 via-violet-500 to-fuchsia-500",
    accent: "#818cf8",
    emoji: "⏱️",
    concepts: ["SHM", "Time Period", "Gravity"],
  },
  {
    id: "projectile",
    title: "Projectile Motion",
    subject: "Physics",
    classLevel: "Class 11",
    duration: "12 min",
    difficulty: "Easy",
    description: "Launch from a cannon, tune angle & speed, hit the target. See trajectory, range, max height calculated live.",
    aim: "To study projectile motion and verify range R = v² sin(2θ) / g.",
    theory: ["Horizontal velocity stays constant; vertical motion is under gravity.", "Range is maximum at 45°.", "Trajectory is a parabola: y = x tanθ - gx²/(2v²cos²θ)."],
    procedure: ["Set launch angle and initial speed.", "Press Fire and watch the trajectory trace.", "Try to hit the target - move it and retry.", "Note range & height for different angles."],
    gradient: "from-orange-500 via-rose-500 to-red-500",
    accent: "#fb7185",
    emoji: "🎯",
    concepts: ["Kinematics", "Range", "Parabola"],
  },
  {
    id: "solar-system",
    title: "Solar System & Orbits",
    subject: "Physics",
    classLevel: "Class 9-10",
    duration: "10 min",
    difficulty: "Easy",
    description: "A beautiful, to-scale-feel solar system. Speed up time, click a planet, learn its facts while it orbits.",
    aim: "To understand planetary orbits, relative sizes and orbital periods.",
    theory: ["Planets orbit the Sun due to gravity - Kepler's laws govern the motion.", "Inner planets orbit much faster than outer planets.", "Orbital period² ∝ distance³ (Kepler's 3rd law)."],
    procedure: ["Drag to orbit, scroll to zoom.", "Use time speed to fast-forward years.", "Click any planet in the list to focus it.", "Compare orbital periods."],
    gradient: "from-cyan-500 via-blue-600 to-indigo-700",
    accent: "#22d3ee",
    emoji: "🪐",
    concepts: ["Gravity", "Kepler Laws", "Orbits"],
  },
  {
    id: "molecule",
    title: "Molecule Builder",
    subject: "Chemistry",
    classLevel: "Class 10-11",
    duration: "14 min",
    difficulty: "Medium",
    description: "Build H₂O, CO₂, CH₄, NH₃ in true 3D ball-and-stick. See bond angles, geometry and polarity - not flat diagrams.",
    aim: "To visualise molecular geometry, bond angles and VSEPR shapes.",
    theory: ["VSEPR: electron pairs repel and arrange to minimise repulsion.", "CH₄ is tetrahedral (109.5°), NH₃ trigonal pyramidal (107°), H₂O bent (104.5°).", "Shape decides polarity and properties."],
    procedure: ["Pick a molecule from the list.", "Rotate and zoom to see its true shape.", "Toggle electron cloud / labels.", "Compare bond angles across molecules."],
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    accent: "#34d399",
    emoji: "🧪",
    concepts: ["VSEPR", "Bonds", "Geometry"],
  },
  {
    id: "optics",
    title: "Lens & Light Rays",
    subject: "Physics",
    classLevel: "Class 10",
    duration: "13 min",
    difficulty: "Medium",
    description: "Move the candle, change focal length, watch real rays bend and form a real / virtual image instantly.",
    aim: "To study image formation by a convex lens using ray diagrams.",
    theory: ["Lens formula: 1/f = 1/v - 1/u.", "Object beyond 2F gives a real, inverted, diminished image.", "Object inside F gives a virtual, erect, magnified image."],
    procedure: ["Drag object distance with the slider.", "Change focal length.", "Observe where rays meet - that is the image.", "Check image nature in the live readout."],
    gradient: "from-amber-500 via-yellow-500 to-lime-500",
    accent: "#fbbf24",
    emoji: "🔍",
    concepts: ["Refraction", "Focal Length", "Ray Diagram"],
  },
  {
    id: "dna",
    title: "DNA Double Helix",
    subject: "Biology",
    classLevel: "Class 12",
    duration: "11 min",
    difficulty: "Medium",
    description: "Unwind the double helix, see A-T and G-C base pairs in colour, and understand why DNA twists the way it does.",
    aim: "To understand the structure of DNA - sugar-phosphate backbone and base pairing.",
    theory: ["DNA is two antiparallel strands twisted into a double helix.", "A pairs with T (2 H-bonds), G pairs with C (3 H-bonds).", "One full turn = 10 base pairs, length 3.4 nm."],
    procedure: ["Rotate the helix and zoom into a base pair.", "Use Unwind slider to open the helix.", "Toggle labels to identify bases.", "Change speed and observe the structure."],
    gradient: "from-pink-500 via-rose-500 to-purple-600",
    accent: "#f472b6",
    emoji: "🧬",
    concepts: ["Genetics", "Base Pairs", "Helix"],
  },
];

export const getLab = (id: string) => labs.find((l) => l.id === id);
