# Product Requirement Document (PRD)
## Web 3D Slingshot Game (Angry Birds Style)

**Author:** Engineering & Product Team  
**Tech Stack:** React 19 / React Three Fiber (R3F), `@react-three/rapier`, Three.js, Laravel 12/13 API / Inertia  
**Status:** Draft / Ready for Development  
**Version:** 1.0.0  

---

## 1. Executive Summary & Objective

### 1.1 Objective
Membangun game web 3D berbasis simulasi fisika terkomputasi (*rigid body dynamics*) yang mengadopsi mekanisme inti game *Angry Birds*. Pemain menggunakan ketapel 3D untuk melontarkan proyektil karakter ke arah struktur rintangan dengan tujuan menghancurkan struktur dan mengeliminasi seluruh musuh.

### 1.2 Target Platform & User Experience
- **Platform:** Web Browser modern (Desktop & Mobile Chrome, Safari, Edge, Brave).
- **Target Performa:** Konsisten 60 FPS pada spesifikasi laptop standar / perangkat smartphone mid-range.
- **Form Factor:** Tampilan horizontal/responsif 16:9 atau fit-to-screen canvas dengan WebGL 2.0.

---

## 2. Architecture & Technology Stack

```
+-------------------------------------------------------------------------+
|                              CLIENT (BROWSER)                           |
|                                                                         |
|  +---------------------------+       +-------------------------------+  |
|  |     React UI Layer        |       |    3D Game Canvas (R3F)       |  |
|  |  - HUD & Score Overlay    | <---> |  - Three.js Scene Graph       |  |
|  |  - Level Selection Modal  |       |  - Rapier Physics Engine      |  |
|  |  - Pause / Settings Menu  |       |  - Slingshot & Trajectory     |  |
|  +---------------------------+       +-------------------------------+  |
+-------------------------------------------------------------------------+
                                    |
                            REST API / Inertia
                                    v
+-------------------------------------------------------------------------+
|                              SERVER (LARAVEL)                           |
|                                                                         |
|  - Auth & Session Management (Sanctum / Breeze)                         |
|  - Level Data Management (JSON schema coordinate loader)                |
|  - Score Verification & Leaderboard Ranking System                      |
|  - User Progress Synchronization (Stars, Highscore, Unlocks)            |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                                DATABASE                                 |
|  - Users, Levels, UserLevelProgress, Leaderboards                       |
+-------------------------------------------------------------------------+
```

### 2.1 Frontend Tech Stack
- **Framework:** React + Vite / Inertia.js React adapter.
- **3D Engine:** Three.js via `@react-three/fiber` (R3F).
- **Physics Engine:** `@react-three/rapier` (WebAssembly-based Rapier Physics).
- **3D Utilities & Helper:** `@react-three/drei` (Kamera, OrbitControls, Environment, Text3D, GLTF loader).
- **State Management:** Zustand / React Context (state game loop, inventory peluru, score, game status).
- **Styling UI:** Tailwind CSS.

### 2.2 Backend Tech Stack
- **Framework:** Laravel 12 / 13.
- **Database:** PostgreSQL / MySQL / SQL Server.
- **Authentication:** Laravel Sanctum / Inertia Session Auth.
- **API Formats:** JSON API untuk scoring dan progression.

---

## 3. Core Gameplay Mechanics

### 3.1 Slingshot Interaction (Ketapel)
- **Pointer Down:** Mendeteksi klik/touch pada proyektil yang berada di bantalan ketapel.
- **Drag & Aim:**
  - Proyektil mengikuti pergerakan pointer di bidang 2.5D/3D (dibatasi radius maksimum tarikan, misal `clamp(distance, 0, MAX_PULL)`).
  - Tali ketapel dirender dinamis (menggunakan mesh line atau silinder berskala dinamis yang menghubungkan 2 tiang ketapel ke proyektil).
- **Trajectory Visualizer:**
  - Mengkalkulasikan vektor lemparan berdasarkan `Vector3(Anchor - Proyektil) * ForceMultiplier`.
  - Merender garis lintasan parabola prediktif menggunakan `Line` / instanced dots sebelum peluru dilepas.
- **Release (Launch):**
  - Mengubah status RigidBody proyektil dari *kinematic/fixed* menjadi *dynamic*.
  - Mengaplikasikan gaya sesaat (`applyImpulse`) searah vektor bidikan.

### 3.2 Physics Simulation & Destructible Structures
- **Material Types:**
  - **Kayu:** Massa sedang, friksi sedang, durabilitas sedang.
  - **Kaca/Es:** Massa ringan, licin (rendah friksi), mudah hancur dengan impak rendah.
  - **Batu:** Massa berat, friksi tinggi, membutuhkan impak berkecepatan tinggi atau proyektil khusus untuk hancur.
- **Damage Threshold & Destruction:**
  - Setiap objek balok memiliki nilai HP / ketahanan impak.
  - Saat event `onCollisionEnter` terpicu, hitung magnitudo impak tumbukan (`linearVelocity` x `mass`).
  - Jika impak > threshold, kurangi HP balok atau langsung trigger hancur (spawning debris/partikel efek lalu `unmount` mesh).
- **Target / Enemy Elimination:**
  - Musuh tereliminasi jika terkena proyektil langsung, tertimpa balok di atas ambang batas kecepatan tertentu, atau jatuh keluar batas arena (*fall boundary*).

### 3.3 Dynamic Camera Flow
1. **Aim Mode:** Kamera fokus pada ketapel dan target dengan sudut pandang isometrik / samping yang nyaman.
2. **Follow Mode:** Saat proyektil melesat, kamera melakukan interpolasi halus (*lerp*) mengikuti posisi peluru.
3. **Observation Mode:** Setelah peluru berhenti atau hilang, kamera kembali ke view overview struktur untuk mengamati sisa kehancuran (3-5 detik).
4. **Reset/End Mode:** Transisi kamera kembali ke ketapel untuk reload peluru baru atau menampilkan popup Win/Lose.

---

## 4. Game Rules, Scoring, & Win/Loss Logic

### 4.1 Win & Lose Conditions
- **Win Condition:** Semua musuh dalam level berhasil dieliminasi.
- **Lose Condition:** Seluruh peluru/burung telah digunakan dan masih ada musuh yang bertahan setelah simulasi fisika berhenti bergerak.

### 4.2 Scoring Formula
$$\text{Total Score} = \text{Base Destruction Score} + (\text{Remaining Birds} \times 10{,}000)$$
- **Penghancuran Balok:** +500 s/d +2,000 poin per balok (tergantung jenis material).
- **Eliminasi Musuh:** +5,000 poin per musuh.
- **Star Rating System:**
  - 1 Bintang: Berhasil menyelesaikan level (minimum score).
  - 2 Bintang: Mencapai skor medium (efisiensi penggunaan peluru).
  - 3 Bintang: Skor tinggi (minimal menyisakan peluru cadangan + banyak struktur runtuh).

---

## 5. Functional Requirements & Feature Matrix

| ID | Modul | Fitur | Deskripsi | Prioritas |
|:---|:---|:---|:---|:---:|
| **F-01** | Physics | RigidBody Environment | Setup gravitasi (-9.81 m/s²), ground static collider, dan boundary wall. | **P0** |
| **F-02** | Mechanics | Slingshot Drag & Pull | Interaksi drag touch/mouse dengan pembatas jarak maksimal (clamp). | **P0** |
| **F-03** | Mechanics | Impulse Launch | Pelontaran peluru dengan besaran dan arah impuls dari vektor tarikan. | **P0** |
| **F-04** | Mechanics | Collision Damage | Pengurangan HP balok & musuh berdasarkan kecepatan tumbukan. | **P0** |
| **F-05** | Gameplay | Level Loader (JSON) | Memuat susunan koordinat 3D, material balok, posisi musuh, dan jumlah peluru. | **P0** |
| **F-06** | Gameplay | Win / Lose Evaluation | Deteksi otomatis status kemenangan/kekalahan ketika pergerakan objek berhenti. | **P0** |
| **F-07** | Mechanics | Trajectory Line | Visualisasi titik-titik proyeksi lintasan parabola sebelum ditembakkan. | **P1** |
| **F-08** | Camera | Dynamic Smooth Follow | Perpindahan fokus kamera otomatis (ketapel -> peluru melayang -> overview). | **P1** |
| **F-09** | UI/HUD | HUD In-Game | Tampilan sisa peluru, skor live, tombol restart, dan tombol pause. | **P1** |
| **F-10** | Backend | Level Progress Sync | Simpan skor, perolehan bintang (1-3), dan status unlock level via API Laravel. | **P1** |
| **F-11** | Backend | Leaderboard API | Menyimpan dan menyajikan leaderboard skor tertinggi per level. | **P2** |
| **F-12** | Audio | Sound FX & Music | SFX tarikan karet, pelontaran peluru, benturan balok, dan background music. | **P2** |

---

## 6. Data Model & Database Schema (Laravel)

### 6.1 Entity Relationship Diagram (Conceptual)
```
[ users ] 1 <--- * [ user_level_progress ] * ---> 1 [ levels ]
   1
   |
   +---------- * [ leaderboards ] * ------------- 1 [ levels ]
```

### 6.2 Table Definitions

#### Table: `levels`
| Field | Type | Attributes | Description |
|:---|:---|:---|:---|
| `id` | BIGINT | PK, Auto Increment | Unique Level ID |
| `level_number` | INT | Unique | Nomor urutan level (1, 2, 3...) |
| `name` | VARCHAR(100) | Nullable | Nama level / chapter |
| `layout_json` | JSON | Not Null | Data posisi 3D balok, tipe material, musuh, & amunisi |
| `star_thresholds` | JSON | Not Null | Nilai batas skor: `{"star1": 15000, "star2": 30000, "star3": 45000}` |
| `created_at` / `updated_at` | TIMESTAMP | | Standard timestamps |

#### Table: `user_level_progress`
| Field | Type | Attributes | Description |
|:---|:---|:---|:---|
| `id` | BIGINT | PK, Auto Increment | Record ID |
| `user_id` | BIGINT | FK -> users.id | ID User |
| `level_id` | BIGINT | FK -> levels.id | ID Level |
| `stars` | TINYINT | Default 0 | Bintang yang diperoleh (0 - 3) |
| `high_score` | INT | Default 0 | Skor terbaik pemain di level ini |
| `is_unlocked` | BOOLEAN | Default false | Status keterbukaan level |
| `created_at` / `updated_at` | TIMESTAMP | | Standard timestamps |

#### Table: `leaderboards`
| Field | Type | Attributes | Description |
|:---|:---|:---|:---|
| `id` | BIGINT | PK, Auto Increment | Leaderboard ID |
| `user_id` | BIGINT | FK -> users.id | ID User |
| `level_id` | BIGINT | FK -> levels.id | ID Level |
| `score` | INT | Not Null, Index | Skor akhir permainan |
| `created_at` / `updated_at` | TIMESTAMP | | Standard timestamps |

---

## 7. Sample Level Configuration (JSON Schema)

```json
{
  "levelId": 1,
  "slingshot": {
    "position": [-8, 0, 0],
    "maxPullRadius": 2.5,
    "forceFactor": 18.0
  },
  "availableBirds": [
    { "type": "standard", "mass": 3.0, "radius": 0.4 },
    { "type": "standard", "mass": 3.0, "radius": 0.4 },
    { "type": "heavy", "mass": 7.0, "radius": 0.6 }
  ],
  "structures": [
    {
      "type": "wood_block",
      "shape": "box",
      "size": [0.5, 3.0, 0.5],
      "position": [4, 1.5, 0],
      "hp": 150
    },
    {
      "type": "wood_block",
      "shape": "box",
      "size": [0.5, 3.0, 0.5],
      "position": [6, 1.5, 0],
      "hp": 150
    },
    {
      "type": "stone_plank",
      "shape": "box",
      "size": [3.0, 0.4, 1.0],
      "position": [5, 3.2, 0],
      "hp": 400
    }
  ],
  "targets": [
    {
      "id": "target_1",
      "type": "standard_pig",
      "position": [5, 0.5, 0],
      "hp": 100,
      "radius": 0.45
    }
  ]
}
```

---

## 8. Non-Functional & Quality Requirements

### 8.1 3D Asset & Graphic Optimization
- **Polygon Count:** Model karakter dan balok dipertahankan low-poly (< 1,500 tris per asset).
- **Format:** Menggunakan format `.glb` yang di-compress dengan Draco atau Meshopt compression.
- **Shadows & Lighting:** Gunakan directional light tunggal dengan kalkulasi shadow map teroptimasi (`mapSize: [1024, 1024]`), ambient light secukupnya. Hindari multiple point lights dinamis berlebihan.
- **Instancing:** Gunakan `instancedMesh` jika ada ratusan balok identik pada level kompleks untuk meminimalkan Draw Calls.

### 8.2 Physics Stability
- **Substepping / Sleep Threshold:** Konfigurasikan auto-sleep pada balok yang diam agar engine Rapier tidak mengonsumsi resource CPU saat tidak ada pergerakan.
- **Tunneling Prevention:** Gunakan CCD (*Continuous Collision Detection*) khusus untuk proyektil burung agar tidak menembus balok pada kecepatan pelontaran tinggi.

### 8.3 Security & Anti-Cheat Logic (Backend)
- Validasi data level completion: Server memeriksa apakah score yang dikirim masuk akal terhadap jumlah balok dan peluru yang tersedia pada konfigurasi level bersangkutan.
- Timestamp validation: Menolak request submit score yang durasi mainnya di bawah threshold minimum yang mungkin dicapai.

---

## 9. Phased Development Roadmap

### Phase 1: Core Physics & Mechanics Prototype (Week 1 - 2)
- Setup proyek React Three Fiber + `@react-three/rapier`.
- Implementasi arena dasar, ground collider, dan susunan balok primitif.
- Implementasi mekanisme drag, calculate vector, dan pelontaran peluru menggunakan impuls fisika.
- Implementasi collision impulse threshold dan penghancuran balok.

### Phase 2: Game Logic, Camera, & Level Pipeline (Week 3 - 4)
- Integrasi garis prediksi trajektori (*trajectory line*).
- Implementasi sistem kamera cerdas (Aiming -> Follow -> Structure view).
- Parser level berbasis file konfigurasi JSON.
- Evaluasi Win / Lose condition dan kalkulasi scoring.

### Phase 3: Visual Polish, Audio, & UI (Week 5)
- Import asset 3D `.glb` (Karakter, ketapel, balok kayu/batu berpola).
- Pembuatan in-game HUD (Overlay peluru tersisa, skor real-time, win/lose popup).
- Integrasi efek suara (SFX) tarikan, tembakan, benturan, dan victory chime.

### Phase 4: Laravel Backend Integration & Release (Week 6)
- Setup database migrations & models di Laravel.
- Endpoint sinkronisasi progres level pemain (`POST /api/levels/{id}/submit-score`).
- Endpoint pemuatan daftar level dan status bintang (`GET /api/levels`).
- Sistem leaderboard skor tertinggi.
- Testing kompatibilitas multi-browser dan optimasi mobile touch.