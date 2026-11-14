# Touchline — Football Manager Text

Game manajer sepak bola berbasis teks, dibuat dengan React, Vite, dan Tailwind CSS. Antarmuka berbahasa Indonesia dan ramah layar ponsel.

## Menjalankan secara lokal

Butuh Node.js 18+ dan Python 3.10+ untuk membangun dataset penuh.

```bash
npm install
npm run dev
```

Buka URL lokal yang dicetak Vite. Untuk build produksi:

```bash
npm run build
npm run preview
```

## Update musim 2024/25 dan 2025/26

Saya menafsirkan permintaan "2025-206" sebagai musim 2025/26. Script generator sekarang mendukung dua jendela data utama:

- 2024/25
- 2025/26

Untuk membangun ulang file database dari sumber publik:

```bash
npm run database:build
```

Generator mengambil snapshot public dari [dcaribou/transfermarkt-datasets](https://github.com/dcaribou/transfermarkt-datasets), menyaring window tanggal yang valid, dan menulis hasil ke `database.generated.js`. Data yang tersedia ditandai dengan musim masing-masing. Tidak ada klub/pemain yang dibuat secara paksa untuk memenuhi kuota.

### Batasan dan keakuratan

- Tidak semua liga/divisi dari permintaan akan tersedia jika sumber upstream tidak memilikinya.
- Dataset upstream memiliki klub, pemain, DOB, posisi, dan nilai pasar. Informasi seperti rating EA FC, gaji mingguan, dan warna jersey tidak tersedia secara resmi di sumber tersebut.
- OVR pada output adalah estimasi gameplay berbasis nilai pasar; bukan rating EA Sports FC resmi.
- Tinjau lisensi sumber upstream sebelum redistribusi atau penggunaan komersial.
- Khusus 2025/26, semua catatan yang tampil hanya yang benar-benar ada di snapshot publik sumber; kalau sumber belum memiliki data tertentu, maka data tersebut tidak dibuat.

## Fitur saat ini

- Ringkasan karier, skuad, klasemen untuk klub yang tersedia, taktik, database, transfer, karier, dan keuangan.
- Simulasi teks live dengan menit pertandingan, peluang, gol, pencetak gol, dan hasil akhir.
- Negosiasi pembelian pemain; pemilihan formasi, mentalitas, gaya main, dan latihan.
- Autosave localStorage, ekspor/impor save JSON, dan reset save.
- Tema gelap hitam-hijau neon dengan layout responsif.

## Persistensi

Autosave disimpan pada localStorage browser dengan key `touchline-save`. Save dapat diunduh/diunggah JSON dari halaman Karier. Data lokal terikat pada browser/perangkat dan tidak disinkronkan ke server.
