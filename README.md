# Touchline — Football Manager Text

Game manajer sepak bola berbasis teks, dibuat dengan React, Vite, dan Tailwind CSS. Antarmuka berbahasa Indonesia dan ramah layar ponsel.

## Menjalankan secara lokal

Butuh Node.js 18+ dan npm.

```bash
npm install
npm run dev
```

Buka URL lokal yang dicetak Vite. Untuk build produksi:

```bash
npm run build
npm run preview
```

## Fitur saat ini

- Ringkasan karier, skuad, klasemen untuk klub yang ada pada sampel, taktik, database, transfer, karier, dan keuangan.
- Simulasi teks live dengan menit pertandingan, peluang, gol, pencetak gol, dan hasil akhir.
- Negosiasi pembelian pemain; pemilihan formasi, mentalitas, gaya main, dan latihan.
- Autosave localStorage, ekspor/impor save JSON, dan reset save.
- Tema gelap hitam-hijau neon dengan layout responsif.

## Status dan batasan data

`database.js` adalah **sampel data terkurasi musim 2024/25**, bukan dump lengkap. Ia belum berisi 100+ klub, 500+ pemain, daftar penuh 3 divisi untuk seluruh 32 kompetisi, jadwal historis lengkap, atau feed resmi EA SPORTS FC/Transfermarkt. Rating, nilai pasar, gaji, kapasitas, anggaran, dan kit perlu diverifikasi; jangan menganggap perkiraan game sebagai data resmi. Saya sengaja tidak membuat nama palsu atau menggandakan profil untuk memenuhi target hitungan.

Untuk melengkapi database secara akurat, tambahkan dataset berlisensi/terverifikasi dan pertahankan sumber serta tanggal snapshot per record. Sampel ini tidak menyertakan lisensi nama, logo, atau atribut klub/pemain.

## Persistensi

Autosave disimpan pada localStorage browser dengan key `touchline-save`. Save dapat diunduh/diunggah JSON dari halaman Karier. Data lokal terikat pada browser/perangkat dan tidak disinkronkan ke server.
