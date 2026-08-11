/**
 * Backend tiruan untuk pengembangan localhost.
 * Data disimpan di localStorage sehingga tetap ada setelah refresh.
 */
const MockBackend = (function () {
  const DB_KEY = 'tsmagrisa_db_v1';
  const SES_KEY = 'tsmagrisa_sessions_v1';
  const STATUS = CONFIG.STATUS_LIST;
  let captchaStore = {};
  let attempts = {};

  // [alumni_id, nisn, nama, jk, tempat_lahir, tanggal_lahir, hp, tahun_lulus]
  const SEED_ALUMNI = [
    ['ALM-000001', '0051234001', 'Ahmad Fauzi', 'Laki-laki', 'Banjarbaru', '2005-03-12', '081251000001', 2023],
    ['ALM-000002', '0051234002', 'Nurul Hidayah', 'Perempuan', 'Martapura', '2005-07-25', '081251000002', 2023],
    ['ALM-000003', '0061234003', 'Siti Rahmawati', 'Perempuan', 'Banjarbaru', '2005-11-08', '081251000003', 2024],
    ['ALM-000004', '0071234004', 'Rizka Amalia', 'Perempuan', 'Banjarbaru', '2007-12-01', '081251000004', 2025],
    ['ALM-000005', '0071234005', 'Budi Santoso', 'Laki-laki', 'Banjarmasin', '2007-04-18', '081251000005', 2025]
  ];
  // [tracer_id, alumni_id, tahun, tanggal_isi, nilai, status]
  const SEED_TRACER = [
    ['TRC-2025-000001', 'ALM-000001', 2025, '2025-06-10', 86.5, 'Kuliah'],
    ['TRC-2026-000001', 'ALM-000001', 2026, '2026-07-15', 86.5, 'Bekerja + Kuliah'],
    ['TRC-2025-000002', 'ALM-000002', 2025, '2025-06-12', 90.2, 'Kuliah'],
    ['TRC-2026-000002', 'ALM-000002', 2026, '2026-07-16', 90.2, 'Kuliah'],
    ['TRC-2026-000003', 'ALM-000003', 2026, '2026-07-18', 88.0, 'Bekerja']
  ];
  const SEED_PEKERJAAN = [
    ['PKR-000001', 'TRC-2026-000001', 'JP-13', 'PT Banua Digital', 'BU-09', 'PH-3', '2025-02-03', 'Ya'],
    ['PKR-000002', 'TRC-2026-000003', 'JP-01', 'PT Borneo Textile', 'BU-03', 'PH-3', '2024-08-01', 'Ya']
  ];
  const SEED_KULIAH = [
    ['KUL-000001', 'TRC-2025-000001', 'Universitas Lambung Mangkurat', 'S1 Pendidikan Teknologi Informasi', 'S1', '2023-08-14', 'Aktif'],
    ['KUL-000002', 'TRC-2026-000001', 'Universitas Lambung Mangkurat', 'S1 Pendidikan Teknologi Informasi', 'S1', '2023-08-14', 'Aktif'],
    ['KUL-000003', 'TRC-2025-000002', 'UNISKA', 'S1 Manajemen', 'S1', '2023-09-01', 'Aktif'],
    ['KUL-000004', 'TRC-2026-000002', 'UNISKA', 'S1 Manajemen', 'S1', '2023-09-01', 'Aktif']
  ];

  function load() { try { return JSON.parse(localStorage.getItem(DB_KEY)) || null; } catch (e) { return null; } }
  function save(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

  function seed() {
    const alumni = SEED_ALUMNI.map(r => ({ alumni_id: r[0], nisn: r[1], nama: r[2], jenis_kelamin: r[3], tempat_lahir: r[4], tanggal_lahir: r[5], no_hp: r[6], tahun_lulus: r[7], nik: '', status_data: 'Aktif' }));
    const tracer = SEED_TRACER.map(r => ({ tracer_id: r[0], alumni_id: r[1], tahun_tracer: r[2], tanggal_isi: r[3], nilai_rata_ijazah: r[4], status_saat_ini: r[5], sudah_verifikasi: true }));
    const pekerjaan = SEED_PEKERJAAN.map(r => ({ pekerjaan_id: r[0], tracer_id: r[1], jenis_pekerjaan: r[2], nama_tempat_kerja: r[3], bidang_usaha: r[4], tingkat_penghasilan: r[5], tanggal_mulai: r[6], pekerjaan_utama: r[7] }));
    const kuliah = SEED_KULIAH.map(r => ({ kuliah_id: r[0], tracer_id: r[1], perguruan_tinggi: r[2], program_studi: r[3], jenjang: r[4], tanggal_mulai: r[5], status_kuliah: r[6] }));
    const riwayat = tracer.map(t => ({ alumni_id: t.alumni_id, tahun: t.tahun_tracer, status: t.status_saat_ini, tracer_id: t.tracer_id }));
    save({ alumni, tracer, pekerjaan, kuliah, riwayat });
  }
  function ensure() { if (!load()) seed(); }

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
      save(db);
      return { ok: true, data: { tracer_id: tid } };
    },
    getDashboardStats(p) { const db = load(); return { ok: true, data: computeStats(db, (p && p.filter) || {}) }; },
    getAlumniList() {
      const db = load();
      return { ok: true, data: db.alumni.map(a => { const trs = db.tracer.filter(t => t.alumni_id === a.alumni_id); return Object.assign({}, a, { tracerCount: trs.length, years: trs.map(t => t.tahun_tracer) }); }) };
    },
    loginAdmin(p) {
      if (p.username === 'admin' && p.password === 'smagrisa2026') {
        return { ok: true, data: { token: 'ADM-' + Math.random().toString(36).slice(2), user: 'admin' } };
      }
      return { ok: false, msg: 'Username atau password salah.' };
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
        }, 250); // simulasi latensi jaringan
      });
    },
    reset() { localStorage.removeItem(DB_KEY); seed(); }
  };
})();