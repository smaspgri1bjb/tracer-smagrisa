function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function fmtDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso + 'T00:00:00');
  return isNaN(d) ? iso : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
function pct(a, b) { return b ? Math.round(a / b * 1000) / 10 : 0; }

function toast(msg, type) {
  type = type || 'success';
  var wrap = document.getElementById('toasts');
  if (!wrap) return;
  var el = document.createElement('div');
  el.className = 'toast';
  var ic = type === 'success' ? 'checkc' : (type === 'error' || type === 'warn') ? 'alert' : 'info';
  el.innerHTML = icon(ic) + '<span>' + esc(msg) + '</span>';
  wrap.appendChild(el);
  setTimeout(function () { el.remove(); }, 3600);
}
function showLoading(t) {
  var el = document.getElementById('loading');
  if (!el) return;
  var txt = el.querySelector('.loading-card div:last-child');
  if (txt) txt.textContent = t || 'Memproses…';
  el.style.display = 'flex';
}
function hideLoading() {
  var el = document.getElementById('loading');
  if (el) el.style.display = 'none';
}
function applyConfig() {
  var fav = document.getElementById('favicon');
  if (fav) fav.href = CONFIG.FAVICON_URL;
  document.querySelectorAll('[data-cfg]').forEach(function (el) {
    el.textContent = CONFIG[el.getAttribute('data-cfg')] || '';
  });
  document.querySelectorAll('img[data-logo]').forEach(function (img) {
    img.src = CONFIG.LOGO_URL;
  });
}
document.addEventListener('DOMContentLoaded', function () {
  applyConfig();
  if (window.injectIcons) injectIcons();
});