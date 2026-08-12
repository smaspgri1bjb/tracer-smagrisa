const ADMIN_NAV_ITEMS = [
  { file: 'admin-dashboard.html',  icon: 'home',    label: 'Dashboard' },
  { file: 'admin-alumni.html',     icon: 'users',   label: 'Data Alumni' },
  { file: 'admin-tracer.html',     icon: 'file',    label: 'Data Tracer' },
  { file: 'admin-statistik.html',  icon: 'bar',     label: 'Statistik' },
  { file: 'admin-laporan.html',    icon: 'printer', label: 'Laporan' },
  { file: 'admin-import.html',     icon: 'upload',  label: 'Import CSV' },
  { file: 'admin-referensi.html',  icon: 'db',      label: 'Referensi' },
  { file: 'admin-pengaturan.html', icon: 'gear',    label: 'Pengaturan' },
  { file: 'admin-log.html',        icon: 'list',    label: 'Log Aktivitas' }
];

// Membangun seluruh shell admin ke #adminRoot. Kembalikan false bila belum login.
function initAdminShell(activeFile, title) {
  if (!sessionStorage.getItem('admin_token')) { window.location.href = 'admin.html'; return false; }
  var root = document.getElementById('adminRoot');
  if (!root) return false;
  root.innerHTML =
    '<div class="admin-shell">' +
      '<aside class="sidebar">' +
        '<div class="sb-brand"><img data-logo src="" alt=""><div><b data-cfg="NAMA_APLIKASI"></b><small>Admin Panel</small></div></div>' +
        '<nav class="sb-nav" id="navList"></nav>' +
        '<div class="sb-foot">' +
          '<div class="sb-user"><div class="av">A</div><div><b id="sbUser">admin</b><small>Administrator</small></div></div>' +
          '<button class="btn btn-sm" style="width:100%;background:rgba(255,255,255,.12);color:#fff" id="btnLogout">' + icon('logout') + ' Keluar</button>' +
        '</div>' +
      '</aside>' +
      '<div class="main">' +
        '<header class="topbar"><h2>' + esc(title) + '</h2><div class="right"><span class="chip">' + icon('clock') + ' Tahun Tracer <span id="tahunAktif"></span></span></div></header>' +
        '<main class="content" id="admContent"></main>' +
      '</div>' +
    '</div>';

  document.getElementById('navList').innerHTML = ADMIN_NAV_ITEMS.map(function (i) {
    var cls = (i.file === activeFile) ? 'sb-item active' : 'sb-item';
    return '<a class="' + cls + '" href="' + i.file + '">' + icon(i.icon) + ' ' + i.label + '</a>';
  }).join('');

  applyConfig();
  document.getElementById('tahunAktif').textContent = CONFIG.TAHUN_TRACER_AKTIF;
  document.getElementById('sbUser').textContent = sessionStorage.getItem('admin_user') || 'admin';
  document.getElementById('btnLogout').addEventListener('click', function () {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    window.location.href = 'admin.html';
  });
  return true;
}