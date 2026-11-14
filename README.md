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

## Mengimpor database musim 2024/25

`database.js` memuat sampel terkurasi dan menggabungkannya dengan data hasil generator. Untuk mengunduh sumber publik dan menghasilkan catatan pemain/klub aktual yang memiliki penampilan liga pada periode musim tersebut:

```bash
npm run database:build
```

Generator standalone Python mengambil arsip publik dari [dcaribou/transfermarkt-datasets](https://github.com/dcaribou/transfermarkt-datasets), menyaring pertandingan tanggal 1 Juli 2024–30 Juni 2025, menghubungkan penampilan pemain dengan klub/kompetisi, dan menggunakan penilaian pasar bertanggal pada rentang itu. Hasil ditulis ke `database.generated.js`, yang digunakan otomatis oleh aplikasi. Unduhan besar pertama kali mungkin memerlukan waktu; arsip disimpan sementara di direktori temporary OS.

### Batasan dan keakuratan

- Ketersediaan hanya mencakup kompetisi dan penampilan yang ada di sumber upstream. Generator **tidak** mengisi semua 32 negara, tiga divisi penuh, atau memastikan target 100 klub/500 pemain sebelum hasil hitungan diperiksa.
- Dataset upstream memiliki klub, pemain, DOB, posisi, nilai pasar, stadion, dan penampilan; beberapa metadata klub berasal dari snapshot yang lebih baru, bukan selalu nilai historis musim 2024/25.
- Dataset tidak menyediakan rating EA FC, potensi, gaji mingguan, warna kit, atau anggaran transfer yang terverifikasi. OVR keluaran generator adalah **estimasi game dari nilai pasar**, bukan rating resmi. Potential/wage tidak tersedia dan ditandai demikian; anggaran dan warna kit tidak dikarang.
- Jangan memperlakukan estimasi sebagai data faktual. Tinjau [lisensi repository upstream](https://github.com/dcaribou/transfermarkt-datasets/blob/master/LICENSE) dan ketentuan sumber asal sebelum redistribusi atau penggunaan komersial; atributkan sumber dan tanggal snapshot.
- Liga/divisi tanpa data sumber tetap tidak terisi. Tidak ada klub atau pemain duplikat yang dibuat untuk memenuhi kuota.

## Fitur saat ini

- Ringkasan karier, skuad, klasemen untuk klub yang tersedia, taktik, database, transfer, karier, dan keuangan.
- Simulasi teks live dengan menit pertandingan, peluang, gol, pencetak gol, dan hasil akhir.
- Negosiasi pembelian pemain; pemilihan formasi, mentalitas, gaya main, dan latihan.
- Autosave localStorage, ekspor/impor save JSON, dan reset save.
- Tema gelap hitam-hijau neon dengan layout responsif.

## Persistensi

Autosave disimpan pada localStorage browser dengan key `touchline-save`. Save dapat diunduh/diunggah JSON dari halaman Karier. Data lokal terikat pada browser/perangkat dan tidak disinkronkan ke server.
