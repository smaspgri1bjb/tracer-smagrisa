/**
 * Konfigurasi aplikasi.
 * API_MODE:
 *   'mock' → berjalan 100% offline di localhost (data dummy di browser).
 *   'gas'  → memanggil Web App Google Apps Script yang sudah di-deploy.
 */
const CONFIG = {
  API_MODE: 'mock',

  // Isi dengan URL Web App Apps Script Anda (akhiran /exec) ketika API_MODE = 'gas'
  GAS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbwQQWQDZqqdyhJ6UXRyjri85X6dpVIH2cg6vY2c7ZY1-YnUJxPPbOYWLEP-wKaF0TX6gw/exec',

  NAMA_APLIKASI: 'TRACER SMAGRISA',
  SEKOLAH: 'SMAS PGRI 1 Banjarbaru',
  ALAMAT: 'Jl. Al-Jafri No. 43, RT 11 RW 03, Kemuning, Banjarbaru Selatan, Kota Banjarbaru, Kalimantan Selatan',
  TELEPON: '(0511) 4773217',
  EMAIL: 'smas.pgri1bjb@gmail.com',
  TAHUN_TRACER_AKTIF: 2026,

  // Untuk localhost, simpan gambar di folder assets/.
  // Anda juga bisa tetap memakai URL ibb.co yang sudah disediakan.
  LOGO_URL: 'assets/logo.png',
  FAVICON_URL: 'assets/favicon.png',

  STATUS_LIST: ['Bekerja', 'Kuliah', 'Bekerja + Kuliah', 'Belum']
};