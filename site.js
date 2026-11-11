/* Mugi Jaya - skrip bersama semua halaman: menu, Firebase, sebelum/sesudah, estimasi, form lead */
(function () {
  'use strict';

  var WA = '6285959986535';
  var PRICE_DESAIN = 20000;
  var PRICE_RUANG = 350000;
  var PAGE = document.body.getAttribute('data-page') || 'beranda';

  function $(id) { return document.getElementById(id); }
  function rp(n) { return 'Rp' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function num(n) { return String(n).replace('.', ','); }
  function waUrl(text) { return 'https://wa.me/' + WA + (text ? '?text=' + encodeURIComponent(text) : ''); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Firebase ---------- */
  var firebaseConfig = {
    apiKey: "AIzaSyC0_UbeQQHevjknv0eowHyga1rmUhdQdUw",
    authDomain: "mugi-jaya-179bc.firebaseapp.com",
    projectId: "mugi-jaya-179bc",
    storageBucket: "mugi-jaya-179bc.firebasestorage.app",
    messagingSenderId: "973130984990",
    appId: "1:973130984990:web:6c821e9614ec886aac880f",
    measurementId: "G-B98EDSQR2X"
  };
  var fb = { db: null, analytics: null };
  try {
    if (window.firebase) {
      firebase.initializeApp(firebaseConfig);
      try { firebase.setLogLevel('error'); } catch (e) {}
      fb.db = firebase.firestore();
      if (firebase.analytics && firebase.analytics.isSupported) {
        firebase.analytics.isSupported().then(function (ok) {
          if (ok) { try { fb.analytics = firebase.analytics(); } catch (e) {} }
        }).catch(function () {});
      }
    }
  } catch (e) { fb.db = null; }

  function track(name, params) {
    try { if (fb.analytics) fb.analytics.logEvent(name, params || {}); } catch (e) {}
  }

  /* ---------- Konversi Google Ads ---------- */
  var ADS_CONV = 'AW-18562986075/paoUCK7E47QdENvgwpNF';
  function gtagPush() { window.dataLayer = window.dataLayer || []; window.dataLayer.push(arguments); }
  function adsConversion(txId) {
    try {
      var p = { send_to: ADS_CONV };
      if (txId) p.transaction_id = String(txId);
      gtagPush('event', 'conversion', p);
    } catch (e) {}
  }

  /* klik WhatsApp (termasuk tombol yang dibuat belakangan).
     Tombol "after_lead" tidak dihitung lagi, karena form yang sama sudah dihitung sebagai konversi. */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('.wa-link') : null;
    if (!a) return;
    var ev = a.getAttribute('data-ev') || 'link';
    track('contact_whatsapp', { placement: ev, page: PAGE });
    if (ev !== 'after_lead') adsConversion();
  });

  /* ---------- Menu ponsel ---------- */
  var hdr = document.querySelector('header.top');
  var menuBtn = $('menuBtn');
  var mainNav = $('mainNav');
  function closeMenu() {
    if (!hdr) return;
    hdr.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (hdr && menuBtn && mainNav) {
    menuBtn.addEventListener('click', function () {
      var open = hdr.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mainNav.addEventListener('click', function (e) {
      if (e.target && e.target.tagName === 'A') closeMenu();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Sebelum / sesudah ---------- */
  var projects = {
    'dapur': { title: 'Dapur', desc: 'Kabinet baru, dinding marmer, dan lampu LED di bawah kabinet.' },
    'ruang-tamu': { title: 'Ruang tamu', desc: 'Plafon dengan lampu tersembunyi, panel dinding, dan area TV baru.' },
    'kamar-mandi': { title: 'Kamar mandi', desc: 'Keramik dinding dan lantai baru, shower, dan rak ceruk berlampu.' },
    'tampak-depan': { title: 'Tampak depan rumah', desc: 'Atap baru, cat ulang, lampu dinding, dan pagar.' }
  };
  var ba = $('ba');
  if (ba) {
    var baRange = $('baRange');
    var baBefore = $('baBefore');
    var baAfter = $('baAfter');
    var setPos = function (v) { ba.style.setProperty('--pos', v + '%'); };
    baRange.addEventListener('input', function () { setPos(baRange.value); });

    var pick = function (key) {
      var p = projects[key];
      if (!p) return;
      baBefore.src = key + '-sebelum.jpg';
      baAfter.src = key + '-sesudah.jpg';
      baBefore.alt = p.title + ' sebelum renovasi';
      baAfter.alt = p.title + ' sesudah renovasi';
      if ($('baTitle')) $('baTitle').textContent = p.title;
      if ($('baDesc')) $('baDesc').textContent = p.desc;
      baRange.value = 50;
      setPos(50);
      var btns = document.querySelectorAll('.proj');
      for (var j = 0; j < btns.length; j++) {
        btns[j].setAttribute('aria-pressed', btns[j].getAttribute('data-k') === key ? 'true' : 'false');
      }
      track('view_before_after', { project: key, page: PAGE });
    };
    var projBtns = document.querySelectorAll('.proj');
    for (var k = 0; k < projBtns.length; k++) {
      projBtns[k].addEventListener('click', function () { pick(this.getAttribute('data-k')); });
    }
    setTimeout(function () {
      Object.keys(projects).forEach(function (key) {
        new Image().src = key + '-sebelum.jpg';
        new Image().src = key + '-sesudah.jpg';
      });
    }, 1500);
  }

  /* ---------- Form lead (+ estimasi di halaman harga) ---------- */
  var form = $('lead');
  if (form) {
    var namaEl = $('nama');
    var telpEl = $('telp');
    var catEl = $('catatan');
    var luasEl = $('luas');
    var ruangEl = $('ruang');
    var useEl = $('useDesain');
    var sendBtn = $('send');
    var statusEl = $('status');
    var estWa = $('estWa');
    var hasEst = !!(luasEl && ruangEl && useEl);
    var topic = form.getAttribute('data-topic') || 'renovasi rumah';
    var state = { luas: 0, ruang: 0, pakaiDesain: false, desain: 0, reno: 0, paket: false, total: 0 };

    var buildMessage = function (withName) {
      var nama = (namaEl.value || '').trim();
      var lines = ['Halo Mugi Jaya, saya ' + (withName && nama ? nama + ', ' : '') + 'ingin konsultasi ' + topic + '.'];
      var cat = catEl ? (catEl.value || '').trim() : '';
      if (cat) lines.push('Keterangan: ' + cat);
      if (hasEst) {
        if (state.pakaiDesain) lines.push('Desain & arsitektur: ' + num(state.luas) + ' meter (' + rp(state.desain) + ').');
        if (state.ruang === 1) lines.push('Renovasi: 1 ruangan (' + rp(PRICE_RUANG) + ').');
        if (state.paket) lines.push('Renovasi: ' + state.ruang + ' ruangan (paket renovasi rumah).');
        if (state.pakaiDesain || state.ruang > 0) lines.push('Perkiraan total di website: ' + rp(state.total) + '.');
      }
      return lines.join('\n');
    };

    var update = function () {
      if (hasEst) {
        var luas = Math.max(0, parseFloat(luasEl.value) || 0);
        var ruang = Math.max(0, parseInt(ruangEl.value, 10) || 0);
        var pakaiDesain = useEl.checked;
        var desain = pakaiDesain ? luas * PRICE_DESAIN : 0;
        var reno = ruang === 1 ? PRICE_RUANG : 0;
        var paket = ruang > 1;
        state = { luas: luas, ruang: ruang, pakaiDesain: pakaiDesain, desain: desain, reno: reno, paket: paket, total: desain + reno };

        $('rDesain').textContent = pakaiDesain ? rp(desain) : '-';
        $('sDesain').textContent = pakaiDesain ? num(luas) + ' m × ' + rp(PRICE_DESAIN) : 'Tidak dipilih';
        $('tReno').textContent = paket ? 'Paket renovasi rumah' : 'Renovasi ruangan';
        $('rReno').textContent = paket ? 'Hubungi admin' : (ruang === 1 ? rp(reno) : '-');
        $('sReno').textContent = ruang === 0 ? 'Tidak ada ruangan' : ruang + ' ruangan';
        $('rTotal').textContent = rp(state.total);
        $('pkgNote').hidden = !paket;
      }
      if (estWa) estWa.href = waUrl(buildMessage(false));
    };

    [namaEl, catEl, luasEl, ruangEl, useEl].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', update);
      el.addEventListener('change', update);
    });
    update();

    var normalizePhone = function (raw) {
      var d = String(raw || '').replace(/\D/g, '');
      if (d.indexOf('0') === 0) d = '62' + d.slice(1);
      else if (d.indexOf('8') === 0) d = '62' + d;
      return d;
    };
    var mark = function (el, bad) { el.setAttribute('aria-invalid', bad ? 'true' : 'false'); };
    var setStatus = function (kind, html) {
      statusEl.className = 'status' + (kind ? ' ' + kind : '');
      statusEl.innerHTML = html;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nama = (namaEl.value || '').trim();
      var telp = normalizePhone(telpEl.value);
      var badNama = nama.length < 2;
      var badTelp = telp.length < 9 || telp.length > 15;
      mark(namaEl, badNama);
      mark(telpEl, badTelp);
      if (badNama || badTelp) {
        setStatus('err', 'Lengkapi nama dan nomor WhatsApp yang aktif agar admin bisa menghubungi Anda.');
        (badNama ? namaEl : telpEl).focus();
        return;
      }
      update();

      var lead = { nama: nama, telepon: telp, halaman: PAGE, sumber: 'website' };
      var cat = catEl ? (catEl.value || '').trim().slice(0, 300) : '';
      if (cat) lead.catatan = cat;
      if (hasEst) {
        lead.luasMeter = state.luas;
        lead.jumlahRuangan = state.ruang;
        lead.butuhDesain = state.pakaiDesain;
        lead.estimasiTotal = state.total;
        lead.paketRenovasi = state.paket;
      }

      sendBtn.disabled = true;
      setStatus('', 'Mengirim permintaan Anda...');

      var timeout = new Promise(function (_, reject) { setTimeout(function () { reject(new Error('timeout')); }, 7000); });
      var save;
      if (fb.db) {
        lead.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        save = Promise.race([fb.db.collection('leads').add(lead), timeout]);
      } else {
        save = Promise.reject(new Error('no-firebase'));
      }

      var wa = waUrl(buildMessage(true));
      save.then(function (ref) {
        track('generate_lead', { page: PAGE, value: hasEst ? state.total : 0, currency: 'IDR' });
        adsConversion(ref && ref.id);
        setStatus('ok', '<div class="done"><span>Terima kasih, ' + escapeHtml(nama) + '. Permintaan Anda sudah masuk. Admin akan menghubungi lewat WhatsApp.</span><a class="btn sm wa-link" data-ev="after_lead" href="' + wa + '" target="_blank" rel="noopener">Percepat lewat chat WhatsApp</a></div>');
        sendBtn.disabled = false;
      }).catch(function () {
        track('lead_save_failed', { page: PAGE });
        setStatus('err', '<div class="done"><span>Permintaan belum bisa tersimpan di sistem. Kirim lewat WhatsApp supaya tetap sampai ke admin.</span><a class="btn sm wa-link" data-ev="lead_fallback" href="' + wa + '" target="_blank" rel="noopener">Kirim lewat WhatsApp</a></div>');
        sendBtn.disabled = false;
      });
    });
  }
})();
