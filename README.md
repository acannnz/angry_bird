# 3D Angry Birds Web Game 🎯🐦

Game 3D fisika interaktif bergaya *Angry Birds* yang dibangun menggunakan **React**, **Three.js** (via `@react-three/fiber` & `@react-three/drei`), dan simulasi fisika **Rapier Physics** (`@react-three/rapier`).

---

## 🚀 Fitur Utama

- **Fisika Realistis 2.5D**: Simulasi fisika akurat menggunakan Rapier Physics Engine dengan penguncian sumbu Z untuk gameplay presisi.
- **Model Ketapel & Karet Elastis 3D**: Ketapel kayu dengan bantalan kulit (*leather pouch*) dan tali karet dinamis saat ditarik dan dilepas.
- **Prediksi Trajektori**: Garis titik-titik lintasan parabolik visual yang memandu bidikan pemain secara real-time.
- **3 Karakter Burung Spesial**:
  - 🔴 **Red Bird**: Burung standar seimbang dengan skill dorongan suara (*Battle Cry*).
  - 🟡 **Chuck**: Burung segitiga kuning dengan skill akselerasi kecepatan tinggi (*Speed Boost*) saat diklik di udara.
  - ⚫ **Bomb**: Burung bulat hitam dengan skill ledakan berdaya hancur luas (*AOE Explosion*) yang dapat dipicu manual di udara atau setelah benturan.
- **Efek Ledakan & Partikel**: Efek ledakan visual, shockwave radius fisika, debu benturan, pecahan partikel, serta floating damage text (`-damage`, `💥 POP!`).
- **10 Level Progresif**: Struktur benteng balok kayu, batu, dan es dengan penataan presisi tanpa bug overlap atau babi jatuh sendiri.
- **Sistem Observasi & Skor**:
  - Jeda sinematik kamera (*Victory Watch*) untuk menikmati kehancuran benteng sebelum layar menang muncul.
  - Bonus sisa burung (+10.000 poin per burung yang tersisa).
  - Rating bintang 1–3 berdasarkan total skor yang diperoleh.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Physics Engine**: `@react-three/rapier` (Rapier WASM)
- **State Management**: Zustand
- **Styling**: Tailwind CSS, Lucide React

---

## 📦 Panduan Instalasi & Menjalankan

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/acannnz/angry_bird.git
   cd angry_bird
   ```

2. **Masuk ke Direktori Client & Pasang Dependensi**:
   ```bash
   cd client
   npm install
   ```

3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173`.

4. **Build untuk Produksi**:
   ```bash
   npm run build
   ```

---

## 🎮 Cara Bermain

1. **Tarik & Bidik**: Klik dan tahan burung pada ketapel, tarik ke belakang untuk mengatur sudut dan kekuatan lemparan.
2. **Lepas**: Lepaskan klik untuk meluncurkan burung ke arah benteng musuh.
3. **Gunakan Skill Spesial**:
   - Klik di layar saat **Chuck** sedang terbang untuk mengaktifkan dorongan kecepatan super.
   - Klik di layar saat **Bomb** sedang terbang untuk meledakkannya seketika.
4. **Hancurkan Semua Babi**: Kalahkan seluruh babi di setiap level untuk melanjutkan ke level berikutnya dan kumpulkan 3 bintang!
