// mock → MockBackend (offline). gas → fetch ke Apps Script.
const API = {
  call: function (action, payload, token) {
    if (CONFIG.API_MODE === 'mock') {
      return MockBackend.call(action, payload, token);
    }
    var params = new URLSearchParams();
    params.set('action', action);
    if (payload !== undefined) params.set('payload', JSON.stringify(payload));
    if (token) params.set('token', token);
    return fetch(CONFIG.GAS_WEB_APP_URL + '?' + params.toString())
      .then(function (r) { return r.json(); })
      .catch(function (e) { return { ok: false, msg: 'Kesalahan jaringan: ' + e.message }; });
  }
};