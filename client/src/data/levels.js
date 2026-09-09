export const LEVELS_DATA = [
  // LEVEL 1: PELATIHAN PERTAMA (EASY)
  {
    levelId: 1,
    name: "Level 1: Pelatihan Pertama",
    slingshot: {
      position: [-9, 1.2, 0],
      maxPullRadius: 2.5,
      forceFactor: 28.0,
    },
    cameraAimPos: [-4, 3.5, 14],
    cameraTargetPos: [0, 2.5, 0],
    starThresholds: { star1: 5000, star2: 16000, star3: 25000 },
    availableBirds: [
      { id: "l1_b1", type: "standard", name: "Red", mass: 3.5, radius: 0.45, color: "#dc2626", skill: "Battle Cry" },
      { id: "l1_b2", type: "speedy", name: "Chuck", mass: 2.8, radius: 0.42, color: "#facc15", skill: "Speed Boost" }
    ],
    structures: [
      { id: "l1_w1", type: "wood", size: [0.6, 2.4, 0.6], position: [4.0, 1.22, 0], hp: 70 },
      { id: "l1_w2", type: "wood", size: [0.6, 2.4, 0.6], position: [7.0, 1.22, 0], hp: 70 },
      { id: "l1_w3", type: "wood", size: [3.8, 0.4, 1.0], position: [5.5, 2.64, 0], hp: 80 },
      { id: "l1_i1", type: "ice", size: [2.2, 0.3, 0.8], position: [5.5, 3.02, 0], hp: 35 }
    ],
    targets: [
      { id: "l1_p1", type: "standard_pig", name: "Babi Dasar", position: [5.5, 0.46, 0], hp: 50, radius: 0.45 },
      { id: "l1_p2", type: "standard_pig", name: "Babi Atap", position: [5.5, 3.6, 0], hp: 50, radius: 0.4 }
    ]
  },

  // LEVEL 2: BLOKADE KACA & ES
  {
    levelId: 2,
    name: "Level 2: Blokade Kaca & Es",
    slingshot: {
      position: [-9, 1.2, 0],
      maxPullRadius: 2.5,
      forceFactor: 28.0,
    },
    cameraAimPos: [-4, 3.5, 14],
    cameraTargetPos: [0, 2.5, 0],
    starThresholds: { star1: 7000, star2: 20000, star3: 32000 },
    availableBirds: [
      { id: "l2_b1", type: "speedy", name: "Chuck", mass: 2.8, radius: 0.42, color: "#facc15", skill: "Speed Boost" },
      { id: "l2_b2", type: "standard", name: "Red", mass: 3.5, radius: 0.45, color: "#dc2626", skill: "Battle Cry" }
    ],
    structures: [
      { id: "l2_i1", type: "ice", size: [0.5, 2.5, 0.5], position: [3.6, 1.27, 0], hp: 35 },
      { id: "l2_i2", type: "ice", size: [0.5, 2.5, 0.5], position: [5.5, 1.27, 0], hp: 35 },
      { id: "l2_i3", type: "ice", size: [0.5, 2.5, 0.5], position: [7.4, 1.27, 0], hp: 35 },
      { id: "l2_w1", type: "wood", size: [4.6, 0.35, 1.0], position: [5.5, 2.72, 0], hp: 75 },
      { id: "l2_i4", type: "ice", size: [0.5, 1.8, 0.5], position: [4.2, 3.82, 0], hp: 30 },
      { id: "l2_i5", type: "ice", size: [0.5, 1.8, 0.5], position: [6.8, 3.82, 0], hp: 30 },
      { id: "l2_i6", type: "ice", size: [3.2, 0.3, 0.8], position: [5.5, 4.9, 0], hp: 30 }
    ],
    targets: [
      { id: "l2_p1", type: "standard_pig", name: "Babi Kiri", position: [4.5, 0.46, 0], hp: 50, radius: 0.42 },
      { id: "l2_p2", type: "standard_pig", name: "Babi Kanan", position: [6.5, 0.46, 0], hp: 50, radius: 0.42 }
    ]
  },

  // LEVEL 3: BUNKER BATU PERTAMA
  {
    levelId: 3,
    name: "Level 3: Bunker Batu Pertama",
    slingshot: {
      position: [-9, 1.2, 0],
      maxPullRadius: 2.6,
      forceFactor: 29.0,
    },
    cameraAimPos: [-4, 3.5, 15],
    cameraTargetPos: [0, 2.5, 0],
    starThresholds: { star1: 8000, star2: 22000, star3: 35000 },
    availableBirds: [
      { id: "l3_b1", type: "heavy", name: "Bomb", mass: 5.8, radius: 0.58, color: "#1f2937", skill: "Explosion" },
      { id: "l3_b2", type: "speedy", name: "Chuck", mass: 2.8, radius: 0.42, color: "#facc15", skill: "Speed Boost" }
    ],
    structures: [
      { id: "l3_s1", type: "stone", size: [0.8, 2.6, 0.8], position: [3.8, 1.32, 0], hp: 220 },
      { id: "l3_s2", type: "stone", size: [0.8, 2.6, 0.8], position: [7.2, 1.32, 0], hp: 220 },
      { id: "l3_s3", type: "stone", size: [4.4, 0.5, 1.2], position: [5.5, 2.9, 0], hp: 240 },
      { id: "l3_w1", type: "wood", size: [0.6, 1.6, 0.6], position: [3.8, 4.0, 0], hp: 65 },
      { id: "l3_w2", type: "wood", size: [0.6, 1.6, 0.6], position: [7.2, 4.0, 0], hp: 65 },
      { id: "l3_w3", type: "wood", size: [4.2, 0.35, 1.0], position: [5.5, 5.0, 0], hp: 70 }
    ],
    targets: [
      { id: "l3_p1", type: "standard_pig", name: "Babi Dalam Bunker", position: [5.5, 0.46, 0], hp: 60, radius: 0.45 },
      { id: "l3_p2", type: "standard_pig", name: "Babi Lantai 2", position: [5.5, 3.6, 0], hp: 50, radius: 0.42 }
    ]
  },

  // LEVEL 4: MENARA KEMBAR DOMINO
  {
    levelId: 4,
    name: "Level 4: Menara Kembar Domino",
    slingshot: {
      position: [-10, 1.2, 0],
      maxPullRadius: 2.6,
      forceFactor: 30.0,
    },
    cameraAimPos: [-4, 4.0, 16],
    cameraTargetPos: [1, 2.8, 0],
    starThresholds: { star1: 10000, star2: 25000, star3: 40000 },
    availableBirds: [
      { id: "l4_b1", type: "standard", name: "Red", mass: 3.5, radius: 0.45, color: "#dc2626", skill: "Battle Cry" },
      { id: "l4_b2", type: "speedy", name: "Chuck", mass: 2.8, radius: 0.42, color: "#facc15", skill: "Speed Boost" },
      { id: "l4_b3", type: "heavy", name: "Bomb", mass: 5.8, radius: 0.58, color: "#1f2937", skill: "Explosion" }
    ],
    structures: [
      // Menara Kiri
      { id: "l4_w1", type: "wood", size: [0.6, 3.2, 0.6], position: [3.0, 1.62, 0], hp: 70 },
      { id: "l4_w2", type: "wood", size: [0.6, 3.2, 0.6], position: [5.0, 1.62, 0], hp: 70 },
      { id: "l4_w3", type: "wood", size: [2.6, 0.4, 1.0], position: [4.0, 3.44, 0], hp: 75 },
      // Menara Kanan
      { id: "l4_w4", type: "wood", size: [0.6, 3.2, 0.6], position: [7.5, 1.62, 0], hp: 70 },
      { id: "l4_w5", type: "wood", size: [0.6, 3.2, 0.6], position: [9.5, 1.62, 0], hp: 70 },
      { id: "l4_w6", type: "wood", size: [2.6, 0.4, 1.0], position: [8.5, 3.44, 0], hp: 75 },
      // Jembatan Penghubung Atas
      { id: "l4_i1", type: "ice", size: [3.2, 0.3, 0.8], position: [6.25, 3.82, 0], hp: 35 }
    ],
    targets: [
      { id: "l4_p1", type: "standard_pig", name: "Babi Menara 1", position: [4.0, 4.1, 0], hp: 50, radius: 0.42 },
      { id: "l4_p2", type: "standard_pig", name: "Babi Menara 2", position: [8.5, 4.1, 0], hp: 50, radius: 0.42 },
      { id: "l4_p3", type: "standard_pig", name: "Babi Tengah", position: [6.25, 0.46, 0], hp: 50, radius: 0.45 }
    ]
  },

  // LEVEL 5: BENTENG TIGA LAPIS
  {
    levelId: 5,
    name: "Level 5: Benteng Tiga Lapis",
    slingshot: {
      position: [-10, 1.2, 0],
      maxPullRadius: 2.6,
      forceFactor: 30.0,
    },
    cameraAimPos: [-4, 4.0, 16],
    cameraTargetPos: [1, 2.8, 0],
    starThresholds: { star1: 12000, star2: 28000, star3: 45000 },
    availableBirds: [
      { id: "l5_b1", type: "heavy", name: "Bomb", mass: 5.8, radius: 0.58, color: "#1f2937", skill: "Explosion" },
      { id: "l5_b2", type: "speedy", name: "Chuck", mass: 2.8, radius: 0.42, color: "#facc15", skill: "Speed Boost" },
      { id: "l5_b3", type: "standard", name: "Red", mass: 3.5, radius: 0.45, color: "#dc2626", skill: "Battle Cry" }
    ],
    structures: [
      // Tembok Depan Batu
      { id: "l5_s1", type: "stone", size: [0.8, 2.8, 0.8], position: [2.8, 1.42, 0], hp: 220 },
      // Kerangka Tengah Kayu
      { id: "l5_w1", type: "wood", size: [0.6, 2.6, 0.6], position: [4.8, 1.32, 0], hp: 70 },
      { id: "l5_w2", type: "wood", size: [0.6, 2.6, 0.6], position: [7.4, 1.32, 0], hp: 70 },
      { id: "l5_s2", type: "stone", size: [3.4, 0.4, 1.0], position: [6.1, 2.84, 0], hp: 200 },
      // Lantai Atas Es
      { id: "l5_i1", type: "ice", size: [0.5, 1.8, 0.5], position: [5.0, 3.96, 0], hp: 35 },
      { id: "l5_i2", type: "ice", size: [0.5, 1.8, 0.5], position: [7.2, 3.96, 0], hp: 35 },
      { id: "l5_i3", type: "ice", size: [2.8, 0.3, 0.8], position: [6.1, 5.04, 0], hp: 30 }
    ],
    targets: [
      { id: "l5_p1", type: "standard_pig", name: "Babi Depan", position: [3.8, 0.46, 0], hp: 50, radius: 0.42 },
      { id: "l5_p2", type: "standard_pig", name: "Babi Tengah", position: [6.1, 0.46, 0], hp: 60, radius: 0.45 },
      { id: "l5_p3", type: "standard_pig", name: "Babi Atap", position: [6.1, 5.5, 0], hp: 50, radius: 0.4 }
    ]
  },

  // LEVEL 6: LABIRIN GANTUNG
  {
    levelId: 6,
    name: "Level 6: Labirin Gantung",
    slingshot: {
      position: [-10, 1.2, 0],
      maxPullRadius: 2.6,
      forceFactor: 30.0,
    },
    cameraAimPos: [-4, 4.5, 17],
    cameraTargetPos: [1, 3.2, 0],
    starThresholds: { star1: 14000, star2: 32000, star3: 48000 },
    availableBirds: [
      { id: "l6_b1", type: "speedy", name: "Chuck", mass: 2.8, radius: 0.42, color: "#facc15", skill: "Speed Boost" },
      { id: "l6_b2", type: "heavy", name: "Bomb", mass: 5.8, radius: 0.58, color: "#1f2937", skill: "Explosion" },
      { id: "l6_b3", type: "standard", name: "Red", mass: 3.5, radius: 0.45, color: "#dc2626", skill: "Battle Cry" }
    ],
    structures: [
      { id: "l6_w1", type: "wood", size: [0.5, 4.2, 0.5], position: [3.5, 2.12, 0], hp: 75 },
      { id: "l6_w2", type: "wood", size: [0.5, 4.2, 0.5], position: [8.5, 2.12, 0], hp: 75 },
      { id: "l6_s1", type: "stone", size: [6.0, 0.4, 1.2], position: [6.0, 4.44, 0], hp: 240 },
      { id: "l6_i1", type: "ice", size: [0.5, 1.5, 0.5], position: [4.2, 5.4, 0], hp: 30 },
      { id: "l6_i2", type: "ice", size: [0.5, 1.5, 0.5], position: [7.8, 5.4, 0], hp: 30 },
      { id: "l6_i3", type: "ice", size: [4.0, 0.3, 0.8], position: [6.0, 6.32, 0], hp: 30 }
    ],
    targets: [
      { id: "l6_p1", type: "standard_pig", name: "Babi Bawah", position: [4.8, 0.46, 0], hp: 50, radius: 0.42 },
      { id: "l6_p2", type: "standard_pig", name: "Babi Tengah Bawah", position: [7.2, 0.46, 0], hp: 50, radius: 0.42 },
      { id: "l6_p3", type: "standard_pig", name: "Babi Geladak", position: [6.0, 5.1, 0], hp: 60, radius: 0.45 }
    ]
  },

  // LEVEL 7: BENTENG PIRAMIDA BATU
  {
    levelId: 7,
    name: "Level 7: Benteng Piramida Batu",
    slingshot: {
      position: [-11, 1.2, 0],
      maxPullRadius: 2.7,
      forceFactor: 32.0,
    },
    cameraAimPos: [-4, 4.5, 18],
    cameraTargetPos: [1, 3.2, 0],
    starThresholds: { star1: 15000, star2: 35000, star3: 52000 },
    availableBirds: [
      { id: "l7_b1", type: "heavy", name: "Bomb", mass: 6.0, radius: 0.6, color: "#1f2937", skill: "Explosion" },
      { id: "l7_b2", type: "heavy", name: "Bomb", mass: 6.0, radius: 0.6, color: "#1f2937", skill: "Explosion" },
      { id: "l7_b3", type: "speedy", name: "Chuck", mass: 2.8, radius: 0.42, color: "#facc15", skill: "Speed Boost" }
    ],
    structures: [
      { id: "l7_s1", type: "stone", size: [0.8, 2.5, 0.8], position: [2.5, 1.27, 0], hp: 220 },
      { id: "l7_s2", type: "stone", size: [0.8, 2.5, 0.8], position: [5.5, 1.27, 0], hp: 220 },
      { id: "l7_s3", type: "stone", size: [0.8, 2.5, 0.8], position: [8.5, 1.27, 0], hp: 220 },
      { id: "l7_s4", type: "stone", size: [7.2, 0.45, 1.2], position: [5.5, 2.76, 0], hp: 250 },
      { id: "l7_s5", type: "stone", size: [0.8, 2.0, 0.8], position: [3.8, 4.0, 0], hp: 200 },
      { id: "l7_s6", type: "stone", size: [0.8, 2.0, 0.8], position: [7.2, 4.0, 0], hp: 200 },
      { id: "l7_s7", type: "stone", size: [4.4, 0.45, 1.0], position: [5.5, 5.24, 0], hp: 220 }
    ],
    targets: [
      { id: "l7_p1", type: "standard_pig", name: "Pengawal Kiri", position: [4.0, 0.46, 0], hp: 50, radius: 0.42 },
      { id: "l7_p2", type: "standard_pig", name: "Pengawal Kanan", position: [7.0, 0.46, 0], hp: 50, radius: 0.42 },
      { id: "l7_p3", type: "standard_pig", name: "Pengawal Tengah", position: [5.5, 3.5, 0], hp: 55, radius: 0.42 },
      { id: "l7_p4", type: "king_pig", name: "Raja Babi Piramida", position: [5.5, 6.0, 0], hp: 80, radius: 0.52 }
    ]
  },

  // LEVEL 8: ISTANA KRISTAL ES
  {
    levelId: 8,
    name: "Level 8: Istana Kristal Es",
    slingshot: {
      position: [-11, 1.2, 0],
      maxPullRadius: 2.7,
      forceFactor: 32.0,
    },
    cameraAimPos: [-4, 5.0, 19],
    cameraTargetPos: [1, 3.5, 0],
    starThresholds: { star1: 18000, star2: 40000, star3: 60000 },
    availableBirds: [
      { id: "l8_b1", type: "speedy", name: "Chuck", mass: 2.8, radius: 0.42, color: "#facc15", skill: "Speed Boost" },
      { id: "l8_b2", type: "heavy", name: "Bomb", mass: 6.0, radius: 0.6, color: "#1f2937", skill: "Explosion" },
      { id: "l8_b3", type: "speedy", name: "Chuck", mass: 2.8, radius: 0.42, color: "#facc15", skill: "Speed Boost" },
      { id: "l8_b4", type: "standard", name: "Red", mass: 3.5, radius: 0.45, color: "#dc2626", skill: "Battle Cry" }
    ],
    structures: [
      { id: "l8_s1", type: "stone", size: [0.8, 2.0, 0.8], position: [2.8, 1.02, 0], hp: 220 },
      { id: "l8_s2", type: "stone", size: [0.8, 2.0, 0.8], position: [8.2, 1.02, 0], hp: 220 },
      { id: "l8_w1", type: "wood", size: [6.4, 0.4, 1.2], position: [5.5, 2.24, 0], hp: 85 },
      { id: "l8_i1", type: "ice", size: [0.5, 2.6, 0.5], position: [3.8, 3.76, 0], hp: 35 },
      { id: "l8_i2", type: "ice", size: [0.5, 2.6, 0.5], position: [7.2, 3.76, 0], hp: 35 },
      { id: "l8_i3", type: "ice", size: [4.4, 0.35, 1.0], position: [5.5, 5.25, 0], hp: 30 }
    ],
    targets: [
      { id: "l8_p1", type: "standard_pig", name: "Babi Dasar Kiri", position: [4.2, 0.46, 0], hp: 50, radius: 0.42 },
      { id: "l8_p2", type: "standard_pig", name: "Babi Dasar Kanan", position: [6.8, 0.46, 0], hp: 50, radius: 0.42 },
      { id: "l8_p3", type: "standard_pig", name: "Babi Balkon", position: [5.5, 2.9, 0], hp: 50, radius: 0.42 },
      { id: "l8_p4", type: "king_pig", name: "Raja Kristal", position: [5.5, 5.9, 0], hp: 80, radius: 0.52 }
    ]
  },

  // LEVEL 9: GERBANG BESI & BAJA
  {
    levelId: 9,
    name: "Level 9: Gerbang Besi & Baja",
    slingshot: {
      position: [-11, 1.2, 0],
      maxPullRadius: 2.7,
      forceFactor: 32.0,
    },
    cameraAimPos: [-4, 5.0, 19],
    cameraTargetPos: [1, 3.5, 0],
    starThresholds: { star1: 20000, star2: 45000, star3: 65000 },
    availableBirds: [
      { id: "l9_b1", type: "heavy", name: "Bomb", mass: 6.2, radius: 0.6, color: "#1f2937", skill: "Explosion" },
      { id: "l9_b2", type: "speedy", name: "Chuck", mass: 2.8, radius: 0.42, color: "#facc15", skill: "Speed Boost" },
      { id: "l9_b3", type: "heavy", name: "Bomb", mass: 6.2, radius: 0.6, color: "#1f2937", skill: "Explosion" }
    ],
    structures: [
      { id: "l9_s1", type: "stone", size: [0.9, 3.2, 0.9], position: [2.5, 1.62, 0], hp: 250 },
      { id: "l9_s2", type: "stone", size: [0.9, 3.2, 0.9], position: [5.5, 1.62, 0], hp: 250 },
      { id: "l9_s3", type: "stone", size: [0.9, 3.2, 0.9], position: [8.5, 1.62, 0], hp: 250 },
      { id: "l9_s4", type: "stone", size: [7.2, 0.5, 1.2], position: [5.5, 3.48, 0], hp: 280 },
      { id: "l9_w1", type: "wood", size: [0.6, 2.0, 0.6], position: [3.4, 4.74, 0], hp: 80 },
      { id: "l9_w2", type: "wood", size: [0.6, 2.0, 0.6], position: [7.6, 4.74, 0], hp: 80 },
      { id: "l9_w3", type: "wood", size: [5.0, 0.4, 1.0], position: [5.5, 5.96, 0], hp: 85 }
    ],
    targets: [
      { id: "l9_p1", type: "standard_pig", name: "Penjaga Kiri", position: [4.0, 0.46, 0], hp: 60, radius: 0.45 },
      { id: "l9_p2", type: "standard_pig", name: "Penjaga Kanan", position: [7.0, 0.46, 0], hp: 60, radius: 0.45 },
      { id: "l9_p3", type: "standard_pig", name: "Pemanah Atas 1", position: [4.6, 4.25, 0], hp: 50, radius: 0.4 },
      { id: "l9_p4", type: "standard_pig", name: "Pemanah Atas 2", position: [6.4, 4.25, 0], hp: 50, radius: 0.4 }
    ]
  },

  // LEVEL 10: TAHTA RAJA BABI (FINAL BOSS FIGHT)
  {
    levelId: 10,
    name: "Level 10: Tahta Raja Babi (Boss Fight)",
    slingshot: {
      position: [-12, 1.2, 0],
      maxPullRadius: 2.8,
      forceFactor: 34.0,
    },
    cameraAimPos: [-4, 5.5, 21],
    cameraTargetPos: [2, 4.0, 0],
    starThresholds: { star1: 25000, star2: 55000, star3: 85000 },
    availableBirds: [
      { id: "l10_b1", type: "heavy", name: "Bomb", mass: 6.2, radius: 0.6, color: "#1f2937", skill: "Explosion" },
      { id: "l10_b2", type: "speedy", name: "Chuck", mass: 2.8, radius: 0.42, color: "#facc15", skill: "Speed Boost" },
      { id: "l10_b3", type: "heavy", name: "Bomb", mass: 6.2, radius: 0.6, color: "#1f2937", skill: "Explosion" },
      { id: "l10_b4", type: "standard", name: "Red", mass: 3.5, radius: 0.45, color: "#dc2626", skill: "Battle Cry" }
    ],
    structures: [
      // Lantai 1: Fondasi Istana Batu Kokoh
      { id: "l10_s1", type: "stone", size: [0.9, 3.2, 0.9], position: [2.0, 1.62, 0], hp: 260 },
      { id: "l10_s2", type: "stone", size: [0.9, 3.2, 0.9], position: [5.5, 1.62, 0], hp: 260 },
      { id: "l10_s3", type: "stone", size: [0.9, 3.2, 0.9], position: [9.0, 1.62, 0], hp: 260 },
      { id: "l10_s4", type: "stone", size: [8.2, 0.5, 1.4], position: [5.5, 3.48, 0], hp: 300 },
      // Lantai 2: Galeri Kerajaan Kayu (Tiang di X=2.8 dan X=8.2 agar tengah X=3.5-7.5 lapang)
      { id: "l10_w1", type: "wood", size: [0.6, 2.6, 0.6], position: [2.8, 5.04, 0], hp: 85 },
      { id: "l10_w2", type: "wood", size: [0.6, 2.6, 0.6], position: [8.2, 5.04, 0], hp: 85 },
      { id: "l10_w3", type: "wood", size: [6.6, 0.4, 1.2], position: [5.5, 6.55, 0], hp: 95 },
      // Lantai 3: Kubah Tahta Es (Tiang di X=3.8 dan X=7.2)
      { id: "l10_i1", type: "ice", size: [0.5, 2.0, 0.5], position: [3.8, 7.76, 0], hp: 40 },
      { id: "l10_i2", type: "ice", size: [0.5, 2.0, 0.5], position: [7.2, 7.76, 0], hp: 40 },
      { id: "l10_i3", type: "ice", size: [4.4, 0.35, 1.0], position: [5.5, 8.95, 0], hp: 35 }
    ],
    targets: [
      // Babi Lantai 1 (Di antara tiang lantai 1)
      { id: "l10_p1", type: "standard_pig", name: "Pengawal Bawah Kiri", position: [3.75, 0.46, 0], hp: 60, radius: 0.45 },
      { id: "l10_p2", type: "standard_pig", name: "Pengawal Bawah Kanan", position: [7.25, 0.46, 0], hp: 60, radius: 0.45 },
      // Babi Lantai 2 (Berdiri bebas di atas slab batu l10_s4, di antara tiang kayu)
      { id: "l10_p3", type: "standard_pig", name: "Jenderal Kiri", position: [4.3, 4.22, 0], hp: 70, radius: 0.45 },
      { id: "l10_p4", type: "standard_pig", name: "Jenderal Kanan", position: [6.7, 4.22, 0], hp: 70, radius: 0.45 },
      // RAJA BABI (Berdiri di tahta tengah lantai 3 di atas slab kayu l10_w3)
      { id: "l10_boss", type: "king_pig", name: "RAJA BABI AGUNG (BOSS)", position: [5.5, 7.42, 0], hp: 120, radius: 0.6 }
    ]
  }
]
