/**
 * Backend tiruan lengkap untuk pengembangan localhost.
 * Data disimpan di localStorage sehingga tetap ada setelah refresh.
 */
const MockBackend = (function () {
  const DB_KEY = 'tsmagrisa_db_v1';
  const SES_KEY = 'tsmagrisa_sessions_v1';
  const STATUS = CONFIG.STATUS_LIST;
  let captchaStore = {};
  let attempts = {};

  const SEED_ALUMNI = [
    ['ALM-000001', '0051234001', 'Ahmad Fauzi', 'Laki-laki', 'Banjarbaru', '2005-03-12', '081251000001', 2023],
    ['ALM-000002', '0051234002', 'Nurul Hidayah', 'Perempuan', 'Martapura', '2005-07-25', '081251000002', 2023],
    ['ALM-000003', '0061234003', 'Siti Rahmawati', 'Perempuan', 'Banjarbaru', '2005-11-08', '081251000003', 2024],
    ['ALM-000004', '0071234004', 'Rizka Amalia', 'Perempuan', 'Banjarbaru', '2007-12-01', '081251000004', 2025],
    ['ALM-000005', '0071234005', 'Budi Santoso', 'Laki-laki', 'Banjarmasin', '2007-04-18', '081251000005', 2025]
  ];
  const SEED_TRACER = [
    ['TRC-2025-000001', 'ALM-000001', 2025, '2025-06-10', 86.5, 'Kuliah'],
    ['TRC-2026-000001', 'ALM-000001', 2026, '2026-07-15', 86.5, 'Bekerja + Kuliah'],
    ['TRC-2025-000002', 'ALM-000002', 2025, '2025-06-12', 90.2, 'Kuliah'],
    ['TRC-2026-000002', 'ALM-000002', 2026, '2026-07-16', 90.2, 'Kuliah'],
    ['TRC-2026-000003', 'ALM-000003', 2026, '2026-07-18', 88.0, 'Bekerja']
  ];
  const SEED_PEKERJAAN = [
    ['PKR-000001', 'TRC-2026-000001', 'JP-13', 'PT Banua Digital', 'BU-09', 'PH-3', '2025-02-03'],
    ['PKR-000002', 'TRC-2026-000003', 'JP-01', 'PT Borneo Textile', 'BU-03', 'PH-3', '2024-08-01']
  ];
  const SEED_KULIAH = [
    ['KUL-000001', 'TRC-2025-000001', 'Universitas Lambung Mangkurat', 'S1 Pendidikan Teknologi Informasi', 'S1', '2023-08-14', 'Aktif'],
    ['KUL-000002', 'TRC-2026-000001', 'Universitas Lambung Mangkurat', 'S1 Pendidikan Teknologi Informasi', 'S1', '2023-08-14', 'Aktif'],
    ['KUL-000003', 'TRC-2025-000002', 'UNISKA', 'S1 Manajemen', 'S1', '2023-09-01', 'Aktif'],
    ['KUL-000004', 'TRC-2026-000002', 'UNISKA', 'S1 Manajemen', 'S1', '2023-09-01', 'Aktif']
  ];

  function defaultPengaturan() {
    return { nama_sekolah: CONFIG.SEKOLAH, alamat: CONFIG.ALAMAT, telepon: CONFIG.TELEPON, email: CONFIG.EMAIL, tahun_tracer_aktif: CONFIG.TAHUN_TRACER_AKTIF };
  }
  function load() { try { return JSON.parse(localStorage.getItem(DB_KEY)) || null; } catch (e) { return null; } }
  function save(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
  function seed() {
    const alumni = SEED_ALUMNI.map(r => ({ alumni_id: r[0], nisn: r[1], nama: r[2], jenis_kelamin: r[3], tempat_lahir: r[4], tanggal_lahir: r[5], no_hp: r[6], tahun_lulus: r[7], nik: '', status_data: 'Aktif' }));
    const tracer = SEED_TRACER.map(r => ({ tracer_id: r[0], alumni_id: r[1], tahun_tracer: r[2], tanggal_isi: r[3], nilai_rata_ijazah: r[4], status_saat_ini: r[5], sudah_verifikasi: true }));
    const pekerjaan = SEED_PEKERJAAN.map(r => ({ pekerjaan_id: r[0], tracer_id: r[1], jenis_pekerjaan: r[2], nama_tempat_kerja: r[3], bidang_usaha: r[4], tingkat_penghasilan: r[5], tanggal_mulai: r[6], pekerjaan_utama: 'Ya' }));
    const kuliah = SEED_KULIAH.map(r => ({ kuliah_id: r[0], tracer_id: r[1], perguruan_tinggi: r[2], program_studi: r[3], jenjang: r[4], tanggal_mulai: r[5], status_kuliah: r[6] }));
    const riwayat = tracer.map(t => ({ alumni_id: t.alumni_id, tahun: t.tahun_tracer, status: t.status_saat_ini, tracer_id: t.tracer_id }));
    const logs = [{ waktu: new Date().toISOString(), aktor: 'sistem', aksi: 'Inisialisasi', detail: 'Data dummy dibuat untuk pengembangan lokal' }];
    save({ alumni, tracer, pekerjaan, kuliah, riwayat, logs, pengaturan: defaultPengaturan() });
  }
  function ensure() { if (!load()) seed(); }
  function addLog(db, aktor, aksi, detail) { db.logs = db.logs || []; db.logs.push({ waktu: new Date().toISOString(), aktor, aksi, detail }); }

  function getSessions() { try { return JSON.parse(localStorage.getItem(SES_KEY)) || {}; } catch (e) { return {}; } }
  function setSession(token, alumniId) { const s = getSessions(); s[token] = { alumni_id: alumniId, exp: Date.now() + 30 * 60 * 1000 }; localStorage.setItem(SES_KEY, JSON.stringify(s)); }
  function getSession(token) { const s = getSessions(); const r = s[token]; if (!r) return null; if (r.exp < Date.now()) return null; return r; }

  function refLabel(list, kode) { const f = list.find(x => x.kode === kode); return f ? f.label : kode; }
  function countBy(arr, fn) { const m = {}; arr.forEach(x => { const k = fn(x); m[k] = (m[k] || 0) + 1; }); return Object.entries(m).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count); }

  function computeStats(db, f) {
    const alm = db.alumni.filter(a => !f.tahunLulus || String(a.tahun_lulus) === String(f.tahunLulus));
    const tracers = db.tracer.filter(t => {
      const a = db.alumni.find(x => x.alumni_id === t.alumni_id); if (!a) return false;
      if (f.tahunTracer && String(t.tahun_tracer) !== String(f.tahunTracer)) return false;
      if (f.tahunLulus && String(a.tahun_lulus) !== String(f.tahunLulus)) return false;
      if (f.status && t.status_saat_ini !== f.status) return false;
      return true;
    });
    const sudahSet = {}; tracers.forEach(t => sudahSet[t.alumni_id] = true);
    const sudah = Object.keys(sudahSet).length;
    const statusDist = {}; STATUS.forEach(s => statusDist[s] = 0); tracers.forEach(t => statusDist[t.status_saat_ini]++);
    const years = {}; db.tracer.forEach(t => years[t.tahun_tracer] = true);
    const tahunList = Object.keys(years).map(Number).sort();
    const perTahun = { labels: tahunList, series: {} };
    STATUS.forEach(s => { perTahun.series[s] = tahunList.map(y => db.tracer.filter(t => t.tahun_tracer === y && t.status_saat_ini === s).length); });
    const trIds = {}; tracers.forEach(t => trIds[t.tracer_id] = true);
    const pkr = db.pekerjaan.filter(x => trIds[x.tracer_id]);
    const kul = db.kuliah.filter(x => trIds[x.tracer_id]);
    const tren = { labels: tahunList, responden: tahunList.map(y => new Set(db.tracer.filter(t => t.tahun_tracer === y).map(t => t.alumni_id)).size), series: {} };
    STATUS.forEach(s => { tren.series[s] = tahunList.map(y => db.tracer.filter(t => t.tahun_tracer === y && t.status_saat_ini === s).length); });
    return {
      cards: { totalAlumni: alm.length, sudah, belum: alm.length - sudah, responseRate: alm.length ? Math.round(sudah / alm.length * 1000) / 10 : 0 },
      statusDist, perTahun,
      jenisPekerjaan: countBy(pkr, x => refLabel(REFERENSI.jenisPekerjaanList, x.jenis_pekerjaan)),
      bidangUsaha: countBy(pkr, x => refLabel(REFERENSI.bidangUsahaList, x.bidang_usaha)),
      penghasilan: REFERENSI.tingkatPenghasilanList.map(ph => ({ label: ph.label, count: pkr.filter(x => x.tingkat_penghasilan === ph.kode).length })),
      perguruanTinggi: countBy(kul, x => x.perguruan_tinggi),
      tren
    };
  }

  function parseCSVText(text) {
    text = String(text || '').replace(/^\uFEFF/, '');
    const lines = text.split(/\r?\n/);
    const first = lines.find(l => l.trim()) || '';
    const delim = ((first.match(/;/g) || []).length >= (first.match(/,/g) || []).length) ? ';' : ',';
    const rows = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      const row = []; let cur = '', inQ = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (inQ) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += c; }
        else if (c === '"') inQ = true;
        else if (c === delim) { row.push(cur.trim()); cur = ''; }
        else cur += c;
      }
      row.push(cur.trim()); rows.push(row);
    }
    return rows;
  }
  function validDate(y, mo, d) {
    if (y < 1900 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return '';
    const dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCDate() !== d || dt.getUTCMonth() !== mo - 1) return '';
    return y + '-' + String(mo).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }
  function parseTanggal(s) {
    s = String(s || '').trim();
    let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return validDate(+m[1], +m[2], +m[3]);
    m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if (m) return validDate(+m[3], +m[2], +m[1]);
    return '';
  }

  const handlers = {
    buatCaptcha() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = ''; for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
      const id = 'c' + Date.now() + Math.floor(Math.random() * 999);
      captchaStore[id] = code;
      return { ok: true, data: { id, code } };
    },
    verifikasiAlumni(p) {
      const db = load();
      const nisn = String(p.nisn || '').replace(/\D/g, '');
      if (!/^\d{10}$/.test(nisn)) return { ok: false, msg: 'NISN harus 10 digit angka.' };
      if (!p.tanggalLahir) return { ok: false, msg: 'Tanggal lahir wajib diisi.' };
      const expected = captchaStore[p.captchaId]; delete captchaStore[p.captchaId];
      if (!expected || String(p.captcha || '').trim().toUpperCase() !== expected) return { ok: false, msg: 'Kode CAPTCHA salah.', data: { captcha: true } };
      const key = 'alumni_' + nisn;
      const a = attempts[key] || { count: 0, lockUntil: 0 };
      if (a.lockUntil > Date.now()) return { ok: false, msg: 'Terlalu banyak percobaan. Coba lagi nanti.', data: { captcha: true } };
      const alm = db.alumni.find(x => x.nisn === nisn);
      if (!alm || alm.tanggal_lahir !== p.tanggalLahir) {
        a.count++; if (a.count >= 5) { a.lockUntil = Date.now() + 120000; a.count = 0; }
        attempts[key] = a;
        return { ok: false, msg: 'NISN dan tanggal lahir tidak cocok dengan data sekolah.', data: { captcha: true } };
      }
      delete attempts[key];
      const token = 'TOK-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      setSession(token, alm.alumni_id);
      return { ok: true, data: { token, alumni: alm } };
    },
    logoutAlumni(p, token) { const s = getSessions(); delete s[token]; localStorage.setItem(SES_KEY, JSON.stringify(s)); return { ok: true }; },
    simpanTracer(p, token) {
      const s = getSession(token); if (!s) return { ok: false, msg: 'Sesi berakhir. Verifikasi ulang.' };
      const db = load();
      const alm = db.alumni.find(x => x.alumni_id === s.alumni_id); if (!alm) return { ok: false, msg: 'Alumni tidak ditemukan.' };
      const th = CONFIG.TAHUN_TRACER_AKTIF;
      if (db.tracer.some(t => t.alumni_id === alm.alumni_id && String(t.tahun_tracer) === String(th)))
        return { ok: false, msg: 'Anda sudah mengisi tracer tahun ' + th + '.', code: 'EXIST' };
      const nilai = parseFloat(String(p.nilai).replace(',', '.'));
      if (isNaN(nilai) || nilai < 0 || nilai > 100) return { ok: false, msg: 'Nilai harus 0–100.' };
      if (STATUS.indexOf(p.status) < 0) return { ok: false, msg: 'Status tidak valid.' };
      const needP = (p.status === 'Bekerja' || p.status === 'Bekerja + Kuliah');
      const needK = (p.status === 'Kuliah' || p.status === 'Bekerja + Kuliah');
      if (needP) { const q = p.pekerjaan || {}; if (!q.jenis_pekerjaan || !q.nama_tempat_kerja || !q.bidang_usaha || !q.tingkat_penghasilan || !q.tanggal_mulai) return { ok: false, msg: 'Lengkapi seluruh data pekerjaan.' }; }
      if (needK) { const k = p.kuliah || {}; if (!k.perguruan_tinggi || !k.program_studi || !k.jenjang || !k.tanggal_mulai || !k.status_kuliah) return { ok: false, msg: 'Lengkapi seluruh data kuliah.' }; }
      const tid = 'TRC-' + th + '-' + String(db.tracer.filter(t => String(t.tahun_tracer) === String(th)).length + 1).padStart(6, '0');
      db.tracer.push({ tracer_id: tid, alumni_id: alm.alumni_id, tahun_tracer: th, tanggal_isi: new Date().toISOString().slice(0, 10), nilai_rata_ijazah: nilai, status_saat_ini: p.status, sudah_verifikasi: true });
      if (needP) { const q = p.pekerjaan; db.pekerjaan.push({ pekerjaan_id: 'PKR-' + String(db.pekerjaan.length + 1).padStart(6, '0'), tracer_id: tid, jenis_pekerjaan: q.jenis_pekerjaan, nama_tempat_kerja: q.nama_tempat_kerja, bidang_usaha: q.bidang_usaha, tingkat_penghasilan: q.tingkat_penghasilan, tanggal_mulai: q.tanggal_mulai, pekerjaan_utama: 'Ya' }); }
      if (needK) { const k = p.kuliah; db.kuliah.push({ kuliah_id: 'KUL-' + String(db.kuliah.length + 1).padStart(6, '0'), tracer_id: tid, perguruan_tinggi: k.perguruan_tinggi, program_studi: k.program_studi, jenjang: k.jenjang, tanggal_mulai: k.tanggal_mulai, status_kuliah: k.status_kuliah }); }
      db.riwayat.push({ alumni_id: alm.alumni_id, tahun: th, status: p.status, tracer_id: tid });
      addLog(db, 'alumni', 'Tracer', alm.nama + ' mengisi tracer ' + th + ' (' + p.status + ')');
      save(db);
      return { ok: true, data: { tracer_id: tid } };
    },
    getDashboardStats(p) { const db = load(); return { ok: true, data: computeStats(db, (p && p.filter) || {}) }; },
    getAlumniList() {
      const db = load();
      return { ok: true, data: db.alumni.map(a => { const trs = db.tracer.filter(t => t.alumni_id === a.alumni_id); return Object.assign({}, a, { tracerCount: trs.length, years: trs.map(t => t.tahun_tracer) }); }) };
    },
    getTracerList(p) {
      const db = load(); const f = (p && p.filter) || {};
      const almMap = {}; db.alumni.forEach(a => almMap[a.alumni_id] = a);
      let tr = db.tracer.slice();
      if (f.tahunTracer) tr = tr.filter(t => String(t.tahun_tracer) === String(f.tahunTracer));
      if (f.status) tr = tr.filter(t => t.status_saat_ini === f.status);
      const data = tr.map(t => { const a = almMap[t.alumni_id] || {}; return Object.assign({}, t, { nama: a.nama || '?', tahun_lulus: a.tahun_lulus || '-' }); })
        .sort((a, b) => (b.tahun_tracer - a.tahun_tracer) || String(a.nama).localeCompare(String(b.nama)));
      return { ok: true, data: data };
    },
    getStatistikLongitudinal() {
      const db = load(); const byAl = {};
      db.tracer.forEach(t => { (byAl[t.alumni_id] = byAl[t.alumni_id] || []).push(t); });
      const trans = {};
      Object.keys(byAl).forEach(aid => {
        const list = byAl[aid].sort((a, b) => a.tahun_tracer - b.tahun_tracer);
        for (let i = 1; i < list.length; i++) { const k = list[i - 1].status_saat_ini + ' -> ' + list[i].status_saat_ini; trans[k] = (trans[k] || 0) + 1; }
      });
      const data = Object.keys(trans).map(k => ({ transition: k, count: trans[k] })).sort((a, b) => b.count - a.count);
      return { ok: true, data: data };
    },
    generateLaporan(p) {
      const db = load(); const type = p.type; const f = p.filter || {};
      const almMap = {}; db.alumni.forEach(a => almMap[a.alumni_id] = a);
      const tracers = db.tracer.filter(t => {
        const a = almMap[t.alumni_id]; if (!a) return false;
        if (f.tahunTracer && String(t.tahun_tracer) !== String(f.tahunTracer)) return false;
        if (f.tahunLulus && String(a.tahun_lulus) !== String(f.tahunLulus)) return false;
        return true;
      });
      const trIds = {}; tracers.forEach(t => trIds[t.tracer_id] = true);
      const pkr = db.pekerjaan.filter(x => trIds[x.tracer_id]);
      const kul = db.kuliah.filter(x => trIds[x.tracer_id]);
      const meta = 'Tahun Tracer: ' + (f.tahunTracer || 'Semua') + ' • Dicetak: ' + new Date().toISOString().slice(0, 10);
      let judul = '', tabel = [];
      if (type === 'ringkasan') {
        judul = 'Laporan Ringkasan Tracer Study';
        const sd = {}; tracers.forEach(t => sd[t.alumni_id] = true); const sudah = Object.keys(sd).length;
        tabel.push({ judul: 'Ikhtisar', kolom: ['Indikator', 'Nilai'], baris: [['Total Alumni', db.alumni.length], ['Sudah Mengisi', sudah], ['Response Rate', (db.alumni.length ? Math.round(sudah / db.alumni.length * 1000) / 10 : 0) + '%'], ['Record Tracer', tracers.length], ['Record Pekerjaan', pkr.length], ['Record Kuliah', kul.length]] });
        tabel.push({ judul: 'Distribusi Status', kolom: ['Status', 'Jumlah'], baris: STATUS.map(s => [s, tracers.filter(t => t.status_saat_ini === s).length]) });
      } else if (type === 'status') {
        judul = 'Laporan Status Lulusan';
        STATUS.forEach(s => {
          const rows = tracers.filter(t => t.status_saat_ini === s).map(t => { const a = almMap[t.alumni_id] || {}; return [a.nama || '-', a.tahun_lulus || '-', t.tahun_tracer, t.tanggal_isi]; });
          tabel.push({ judul: s + ' (' + rows.length + ')', kolom: ['Nama', 'Th. Lulus', 'Th. Tracer', 'Tgl Isi'], baris: rows.length ? rows : [['-', '-', '-', '-']] });
        });
      } else if (type === 'pekerjaan') {
        judul = 'Laporan Pekerjaan, Bidang Usaha & Penghasilan';
        const grp = (field, list) => { const m = {}; pkr.forEach(x => { const l = refLabel(list, x[field]); m[l] = (m[l] || 0) + 1; }); return Object.keys(m).map(k => [k, m[k], (pkr.length ? Math.round(m[k] / pkr.length * 1000) / 10 : 0) + '%']).sort((a, b) => b[1] - a[1]); };
        tabel.push({ judul: 'Jenis Pekerjaan', kolom: ['Jenis', 'Jumlah', 'Persentase'], baris: grp('jenis_pekerjaan', REFERENSI.jenisPekerjaanList) });
        tabel.push({ judul: 'Bidang Usaha', kolom: ['Bidang', 'Jumlah', 'Persentase'], baris: grp('bidang_usaha', REFERENSI.bidangUsahaList) });
        tabel.push({ judul: 'Tingkat Penghasilan', kolom: ['Tingkat', 'Jumlah', 'Persentase'], baris: REFERENSI.tingkatPenghasilanList.map(ph => { const n = pkr.filter(x => x.tingkat_penghasilan === ph.kode).length; return [ph.label, n, (pkr.length ? Math.round(n / pkr.length * 1000) / 10 : 0) + '%']; }) });
      } else if (type === 'kuliah') {
        judul = 'Laporan Kuliah / Perguruan Tinggi';
        const g = fn => { const m = {}; kul.forEach(k => { const l = fn(k); m[l] = (m[l] || 0) + 1; }); return Object.keys(m).map(k => [k, m[k]]).sort((a, b) => b[1] - a[1]); };
        tabel.push({ judul: 'Perguruan Tinggi', kolom: ['Perguruan Tinggi', 'Jumlah'], baris: g(k => k.perguruan_tinggi) });
        tabel.push({ judul: 'Program Studi', kolom: ['Program Studi', 'PT', 'Jenjang'], baris: kul.map(k => [k.program_studi, k.perguruan_tinggi, k.jenjang]) });
      } else if (type === 'longitudinal') {
        judul = 'Laporan Longitudinal';
        const years = {}; db.tracer.forEach(t => years[t.tahun_tracer] = true);
        const ylist = Object.keys(years).map(Number).sort();
        tabel.push({ judul: 'Distribusi Status per Tahun', kolom: ['Tahun'].concat(STATUS).concat(['Total']), baris: ylist.map(y => { const tt = db.tracer.filter(t => t.tahun_tracer === y); return [y].concat(STATUS.map(s => tt.filter(t => t.status_saat_ini === s).length)).concat([tt.length]); }) });
        const byAl = {}; db.tracer.forEach(t => { (byAl[t.alumni_id] = byAl[t.alumni_id] || []).push(t); });
        const rows = Object.keys(byAl).map(aid => { const list = byAl[aid].sort((a, b) => a.tahun_tracer - b.tahun_tracer); return [(almMap[aid] || {}).nama || aid, list.map(t => t.tahun_tracer + ': ' + t.status_saat_ini).join(' -> ')]; });
        tabel.push({ judul: 'Perubahan Status per Alumni', kolom: ['Alumni', 'Lintasan Status'], baris: rows });
      } else { judul = 'Laporan'; tabel.push({ judul: '-', kolom: ['-'], baris: [['Tipe tidak dikenal']] }); }
      return { ok: true, data: { judul, meta, tabel } };
    },
    previewImportCSV(p) {
      const db = load();
      const rows = parseCSVText(p.text);
      if (rows.length < 2) return { ok: false, msg: 'File kosong atau tidak ada baris data.' };
      const head = rows[0].map(h => String(h).toLowerCase().replace(/[^a-z0-9]/g, ''));
      const col = names => { for (const n of names) { const i = head.indexOf(n); if (i > -1) return i; } return -1; };
      const idx = { nama: col(['nama', 'namalengkap']), jk: col(['jk', 'jeniskelamin', 'kelamin']), nisn: col(['nisn']), tempat: col(['tempatlahir', 'tmplahir']), tgl: col(['tanggallahir', 'tgllahir']), nik: col(['nik']), hp: col(['hp', 'nohp', 'nomorhp']), tahun: col(['tahunlulus', 'thlulus']) };
      if (idx.nisn < 0 || idx.nama < 0) return { ok: false, msg: 'Header CSV tidak dikenali. Gunakan template.' };
      const exist = {}; db.alumni.forEach(a => exist[a.nisn] = true);
      const seen = {}; const out = []; let valid = 0, dup = 0, err = 0;
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        const get = k => idx[k] > -1 ? String(r[idx[k]] || '').trim() : '';
        const rec = { no: i + 1, nama: get('nama'), jk: get('jk'), nisn: get('nisn'), tempat: get('tempat'), tgl: get('tgl'), nik: get('nik'), hp: get('hp'), tahun: get('tahun'), status: 'valid', alasan: [] };
        if (!/^\d{10}$/.test(rec.nisn)) rec.alasan.push('NISN wajib 10 digit');
        if (rec.nik && !/^\d{16}$/.test(rec.nik)) rec.alasan.push('NIK harus 16 digit');
        const tglIso = parseTanggal(rec.tgl);
        if (!tglIso) rec.alasan.push('Tanggal lahir tidak valid'); else rec.tglIso = tglIso;
        const th = parseInt(rec.tahun, 10);
        if (!th || th < 1950 || th > new Date().getFullYear() + 1) rec.alasan.push('Tahun lulus tidak valid');
        if (rec.alasan.length) { rec.status = 'error'; err++; }
        else if (exist[rec.nisn] || seen[rec.nisn]) { rec.status = 'duplikat'; rec.alasan.push(exist[rec.nisn] ? 'NISN sudah ada di database' : 'Duplikat dalam file'); dup++; }
        else { seen[rec.nisn] = true; valid++; }
        out.push(rec);
      }
      return { ok: true, data: { ringkasan: { total: out.length, valid, duplikat: dup, error: err }, baris: out } };
    },
    importAlumniCSV(p) {
      const db = load(); const rowsValid = p.rowsValid || [];
      let max = 0; db.alumni.forEach(a => { const m = String(a.alumni_id).match(/ALM-(\d+)$/); if (m) max = Math.max(max, parseInt(m[1], 10)); });
      let count = 0;
      rowsValid.forEach(r => {
        max++; const id = 'ALM-' + String(max).padStart(6, '0');
        const jk = /^p/i.test(r.jk) ? 'Perempuan' : 'Laki-laki';
        db.alumni.push({ alumni_id: id, nisn: String(r.nisn), nik: String(r.nik || ''), nama: r.nama, jenis_kelamin: jk, tempat_lahir: r.tempat, tanggal_lahir: r.tglIso, no_hp: String(r.hp || ''), tahun_lulus: parseInt(r.tahun, 10), status_data: 'Aktif' });
        count++;
      });
      addLog(db, 'admin', 'Import CSV', 'Import ' + count + ' alumni valid.');
      save(db);
      return { ok: true, data: { count } };
    },
    getReferensi() { return { ok: true, data: REFERENSI }; },
    getPengaturan() { const db = load(); return { ok: true, data: db.pengaturan || defaultPengaturan() }; },
    savePengaturan(p) { const db = load(); db.pengaturan = Object.assign({}, db.pengaturan || defaultPengaturan(), p.p); addLog(db, 'admin', 'Pengaturan', 'Pengaturan disimpan'); save(db); return { ok: true }; },
    getLog() { const db = load(); return { ok: true, data: (db.logs || []).slice().reverse() }; },
    loginAdmin(p) {
      if (p.username === 'admin' && p.password === 'smagrisa2026') return { ok: true, data: { token: 'ADM-' + Math.random().toString(36).slice(2), user: 'admin' } };
      return { ok: false, msg: 'Username atau password salah.' };
    },
    changeAdminPassword(p) {
      if (p.lama !== 'smagrisa2026') return { ok: false, msg: 'Password lama salah.' };
      if (String(p.baru).length < 8) return { ok: false, msg: 'Password baru minimal 8 karakter.' };
      return { ok: true };
    }
  };

  return {
    call(action, payload, token) {
      ensure();
      return new Promise(function (resolve) {
        setTimeout(function () {
          const fn = handlers[action];
          if (!fn) { resolve({ ok: false, msg: 'Aksi tidak dikenal: ' + action }); return; }
          try { resolve(fn(payload || {}, token)); }
          catch (e) { resolve({ ok: false, msg: e.message }); }
        }, 250);
      });
    },
    reset() { localStorage.removeItem(DB_KEY); seed(); }
  };
})();