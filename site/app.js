/* ArtFlix Slides — galeria de 200 aulas de Arte: catálogo por área e estilo, apresentador em tela cheia,
   editor (salvo neste navegador), criação de aulas novas e exportação para PowerPoint editável. */
(function () {
  'use strict';
  var BASE = window.DECKS || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  /* ---------- os 13 estilos ---------- */
  var ESTILOS = {
    abstrato: { nome: 'Abstrato', cores: ['#121019', '#f2545b', '#3fa7d6'] },
    galeria: { nome: 'Galeria', cores: ['#16110d', '#d9b25f', '#c97b4a'] },
    barroco: { nome: 'Barroco', cores: ['#120709', '#e0b25a', '#c2313d'] },
    impressao: { nome: 'Impressionista', cores: ['#f5efe2', '#d8693f', '#3f7fb4'] },
    expressao: { nome: 'Expressionista', cores: ['#0f1a33', '#ff6a3d', '#f6c234'] },
    cubo: { nome: 'Cubista', cores: ['#e8dbc1', '#b5651d', '#3f5866'] },
    sonho: { nome: 'Surrealista', cores: ['#3d2468', '#ffd27a', '#f0a27e'] },
    pop: { nome: 'Pop Art', cores: ['#ffe14d', '#ff2d6f', '#1e73ff'] },
    bauhaus: { nome: 'Bauhaus', cores: ['#f2ead8', '#d6382c', '#1f4fa3'] },
    brasil: { nome: 'Cordel', cores: ['#f2e4c4', '#c4362b', '#1f7a4d'] },
    raiz: { nome: 'Raízes', cores: ['#2a1a12', '#e08a33', '#e8c170'] },
    atelie: { nome: 'Ateliê', cores: ['#efe6d2', '#e0533c', '#2f6fb0'] },
    cena: { nome: 'Palco', cores: ['#0d0a12', '#ffcf5a', '#e0424d'] },
    som: { nome: 'Música', cores: ['#0f1726', '#5ee3c1', '#ff7a59'] }
  };
  var amostra = function (e) { var c = (ESTILOS[e] || ESTILOS.galeria).cores; return 'background:conic-gradient(' + c[1] + ' 0 33%,' + c[2] + ' 0 66%,' + c[0] + ' 0)'; };
  var AREAS = ['Artes Visuais', 'História da Arte', 'Arte Brasileira', 'Música', 'Teatro', 'Dança'];

  /* ---------- armazenamento das edições (só neste navegador) ---------- */
  var CHAVE = 'artflix-slides:v1', estado = null;
  function st() {
    if (estado) return estado;
    var d = null;
    try { d = JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch (e) { d = null; }
    estado = d && typeof d === 'object' ? d : {};
    estado.edits = estado.edits || {}; estado.novos = estado.novos || [];
    return estado;
  }
  function grava() { try { localStorage.setItem(CHAVE, JSON.stringify(st())); return true; } catch (e) { return false; } }
  function decks() { var s = st(); return s.novos.concat(BASE.map(function (d) { return s.edits[d.slug] || d; })); }
  function acha(slug) { return decks().filter(function (d) { return d.slug === slug; })[0]; }
  function ehNovo(slug) { return st().novos.some(function (d) { return d.slug === slug; }); }
  function ehEditado(slug) { return !!st().edits[slug]; }
  function original(slug) { return BASE.filter(function (d) { return d.slug === slug; })[0]; }
  function guarda(deck) {
    var s = st();
    if (ehNovo(deck.slug)) s.novos = s.novos.map(function (d) { return d.slug === deck.slug ? deck : d; });
    else s.edits[deck.slug] = deck;
    return grava();
  }
  var novoSlug = function () { return 'minha-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); };

  var ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.4-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z"/></svg>',
    grade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    impr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/></svg>',
    lapis: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
    ppt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5"/><path d="M4 17v3h16v-3"/></svg>',
    copia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
    mais: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    debate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12Z"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.8 1c0 1.5-2.3 2-2.3 3.5M12 17h.01"/></svg>',
    olho: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    pincel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18.4 2.6a2 2 0 0 1 2.9 2.8L13 13.7l-2.8-2.8 8.2-8.3Z"/><path d="M10.2 10.9 8 13.1a3 3 0 0 0-3.6 3.1c0 1.6-.9 2.6-2.4 3.3 2.7 1.2 7.1.9 8.8-1.5a3 3 0 0 0-.4-3.9l2.4-2.4"/></svg>',
    lampada: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z"/></svg>',
    estrela: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg>',
    duvida: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.8 1c0 1.5-2.3 2-2.3 3.5M12 17h.01"/></svg>'
  };

  /* ---------- desenhos de cada estilo (SVG próprio, nada de obra de terceiros) ---------- */
  function sv(x, y, w, h, vb, corpo, extra) { return '<svg style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px' + (extra || '') + '" viewBox="' + vb + '" preserveAspectRatio="' + (w * 10 < h ? 'none' : 'xMidYMid meet') + '" fill="none" aria-hidden="true">' + corpo + '</svg>'; }
  function dv(css) { return '<div style="position:absolute;' + css + '"></div>'; }
  var BLOB = ['M60 10c40-10 90 20 95 60s-20 80-70 85S-5 120 5 75 20 20 60 10Z', 'M70 5c30 0 70 25 75 60 5 30-30 75-75 80S0 110 5 70 40 5 70 5Z', 'M50 20c35-25 100-10 105 35s-35 95-80 85S5 120 10 80 15 45 50 20Z'];
  function bandeirinhas(y, cores) {
    var s = '<path d="M0 ' + (y + 10) + ' Q960 ' + (y + 60) + ' 1920 ' + (y + 10) + '" stroke="#1a1410" stroke-width="4"/>', i;
    for (i = 0; i < 24; i++) {
      var x = 20 + i * 80, t = (x / 1920), yy = y + 10 + 50 * 4 * t * (1 - t) * .5 * 2;
      s += '<path d="M' + x + ' ' + yy + ' l60 2 l-28 70 Z" fill="' + cores[i % cores.length] + '" stroke="#1a1410" stroke-width="3"/>';
    }
    return sv(0, 0, 1920, 200, '0 0 1920 200', s);
  }
  function zigue(y, cor, h) { var s = '', i; for (i = 0; i < 49; i++) s += '<path d="M' + (i * 40) + ' ' + h + ' l20 -' + h + ' l20 ' + h + ' Z" fill="' + cor + '"/>'; return sv(0, y, 1920, h, '0 0 1920 ' + h, s); }
  function grafismo(y, cor) {
    var s = '<defs><pattern id="gr' + y + '" width="80" height="60" patternUnits="userSpaceOnUse"><path d="M0 30 L20 10 L40 30 L60 10 L80 30 M0 50 L20 30 L40 50 L60 30 L80 50" stroke="' + cor + '" stroke-width="5"/><path d="M40 0 L50 10 L40 20 L30 10 Z" fill="' + cor + '"/></pattern></defs><rect width="1920" height="60" fill="url(#gr' + y + ')"/>';
    return sv(0, y, 1920, 60, '0 0 1920 60', s, ';opacity:.75');
  }
  function deco(e, capa, temImg) {
    var h = '';
    switch (e) {
      case 'abstrato':
        var ring = function (cx, cy, rs, cs) { return rs.map(function (r, k) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + cs[k % cs.length] + '"/>'; }).join(''); };
        h = sv(1640, 40, 240, 240, '0 0 240 240', ring(120, 120, [110, 78, 50, 24], ['#3fa7d6', '#f7b32b', '#f2545b', '#121019'])) +
          sv(820, 975, 420, 105, '0 0 520 150', '<path d="M0 140 L180 20 L330 120 L520 10" stroke="#f7b32b" stroke-width="10" fill="none"/><path d="M40 150 L120 60" stroke="#f2545b" stroke-width="22"/><circle cx="420" cy="110" r="26" fill="#7c5cff"/>', ';opacity:.85');
        if (capa && !temImg) h += sv(1060, 90, 820, 900, '0 0 820 900',
          '<rect x="430" y="40" width="330" height="330" fill="#3fa7d6" transform="rotate(12 595 205)"/>' + ring(300, 330, [250, 190, 130, 70, 28], ['#f2545b', '#121019', '#f7b32b', '#7c5cff', '#fdf6e3']) +
          '<path d="M520 860 L700 520 L800 860 Z" fill="#f7b32b"/><path d="M20 700 C180 560 330 860 520 640 S760 560 820 700" stroke="#fdf6e3" stroke-width="14" fill="none"/>' +
          '<path d="M60 80 L760 820" stroke="#fdf6e3" stroke-width="6"/><path d="M90 860 L640 60" stroke="#fdf6e3" stroke-width="3" opacity=".6"/>' +
          '<rect x="80" y="760" width="160" height="34" fill="#f2545b"/><circle cx="700" cy="760" r="40" fill="none" stroke="#3fa7d6" stroke-width="12"/><path d="M640 300 l40 -40 l40 40 l-40 40 Z" fill="#fdf6e3"/>');
        break;
      case 'galeria':
        h = dv('inset:30px;border:2px solid rgba(217,178,95,.4)') + dv('inset:42px;border:1px solid rgba(217,178,95,.2)');
        if (capa && temImg) h += dv('right:60px;top:-60px;width:760px;height:400px;background:radial-gradient(50% 100% at 50% 0,rgba(255,226,160,.35),transparent 75%)');
        if (capa && !temImg) h += sv(1120, 130, 660, 820, '0 0 660 820', '<defs><linearGradient id="go" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7dd9c"/><stop offset=".3" stop-color="#b8862f"/><stop offset=".55" stop-color="#fbe7b0"/><stop offset=".8" stop-color="#9c6f26"/><stop offset="1" stop-color="#e9c776"/></linearGradient><linearGradient id="ce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9a86a"/><stop offset=".55" stop-color="#f6d8a0"/><stop offset="1" stop-color="#7f9a74"/></linearGradient></defs><rect x="0" y="0" width="660" height="820" fill="url(#go)"/><rect x="44" y="44" width="572" height="732" fill="#3a2808"/><rect x="54" y="54" width="552" height="712" fill="url(#ce)"/><circle cx="420" cy="300" r="70" fill="#fff3d6" opacity=".9"/><path d="M54 560 Q200 430 330 520 T606 470 V766 H54 Z" fill="#5f7a58"/><path d="M54 640 Q260 560 420 640 T606 620 V766 H54 Z" fill="#3e5a42"/><path d="M160 640 v-120 m0 30 q-40-30-60 0 m60-10 q40-40 70-10" stroke="#2b3b2c" stroke-width="10" stroke-linecap="round"/><rect x="230" y="790" width="200" height="0"/>') + dv('left:1290px;top:972px;width:320px;height:46px;background:linear-gradient(135deg,#f3dc9f,#c39a4c);box-shadow:0 6px 14px rgba(0,0,0,.5)') + dv('left:1060px;top:20px;width:780px;height:280px;background:radial-gradient(50% 100% at 50% 0,rgba(255,226,160,.3),transparent 75%)');
        break;
      case 'barroco':
        var vol = '<path d="M10 150 C10 60 80 10 160 10 C230 10 260 70 220 100 C190 122 150 100 160 70 M10 150 C40 120 70 120 90 140" stroke="#e0b25a" stroke-width="7" stroke-linecap="round"/><circle cx="160" cy="70" r="9" fill="#e0b25a"/>';
        h = sv(18, 14, 150, 96, '0 0 280 180', vol) + sv(1752, 970, 150, 96, '0 0 280 180', vol, ';transform:rotate(180deg)');
        if (capa) h += sv(0, -20, 1920, 190, '0 0 1920 190', '<path d="M0 0 H1920 V60 C1700 170 1500 40 1300 120 C1100 190 820 40 620 120 C420 190 220 50 0 150 Z" fill="#6e0f1b"/><path d="M0 150 C220 50 420 190 620 120 C820 40 1100 190 1300 120 C1500 40 1700 170 1920 60" stroke="#e0b25a" stroke-width="6"/>');
        if (capa && !temImg) h += sv(1140, 210, 620, 700, '0 0 620 700', '<defs><radialGradient id="vl"><stop offset="0" stop-color="#ffe6a8" stop-opacity=".8"/><stop offset="1" stop-color="#ffe6a8" stop-opacity="0"/></radialGradient></defs><circle cx="310" cy="300" r="300" fill="url(#vl)"/><path d="M310 40 C460 40 560 140 560 300 C560 470 420 560 310 660 C200 560 60 470 60 300 C60 140 160 40 310 40Z" stroke="#e0b25a" stroke-width="10"/><path d="M310 90 C430 90 510 170 510 300 C510 440 400 520 310 600 C220 520 110 440 110 300 C110 170 190 90 310 90Z" stroke="#e0b25a" stroke-width="3" opacity=".6"/><path d="M60 300 C0 290 -10 220 40 200 C80 186 100 230 70 240 M560 300 C620 290 630 220 580 200 C540 186 520 230 550 240 M310 660 C290 690 260 700 240 700 M310 660 C330 690 360 700 380 700" stroke="#e0b25a" stroke-width="8" stroke-linecap="round"/><path d="M290 380 h40 v-130 c0-30-40-30-40 0 Z" fill="#f6e7cf"/><path d="M310 230 c-14-20 0-40 0-60 c10 20 18 40 0 60Z" fill="#ffcf5a"/>');
        break;
      case 'impressao':
        var tr = function (x, y, c, r) { return '<path d="M' + x + ' ' + y + ' q30 -14 60 0" stroke="' + c + '" stroke-width="16" stroke-linecap="round" opacity=".55" transform="rotate(' + r + ' ' + x + ' ' + y + ')"/>'; };
        var t = '', i;
        for (i = 0; i < 14; i++) t += tr(30 + (i % 7) * 34, 40 + Math.floor(i / 7) * 34 + (i % 3) * 8, ['#d8693f', '#3f7fb4', '#789f57', '#f2c45c'][i % 4], (i * 23) % 50 - 25);
        h = sv(1620, 860, 280, 160, '0 0 280 160', t);
        if (capa && !temImg) {
          var ag = '';
          for (i = 0; i < 70; i++) { var yy = 560 + (i % 14) * 26, xx = 60 + ((i * 97) % 520), c = (Math.abs(xx - 320) < 70 && yy < 760) ? '#f08a4b' : ['#4a7fae', '#7aa6c9', '#e3b38d', '#3b6a90'][i % 4]; ag += '<path d="M' + xx + ' ' + yy + ' h' + (40 + (i % 5) * 12) + '" stroke="' + c + '" stroke-width="14" stroke-linecap="round" opacity=".8"/>'; }
          h += sv(1140, 120, 640, 860, '0 0 640 860', '<rect x="0" y="0" width="640" height="560" rx="40" fill="#cfd9d6"/><rect x="0" y="0" width="640" height="560" rx="40" fill="url(#ce2)"/><defs><linearGradient id="ce2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9c1d6"/><stop offset="1" stop-color="#f2c9a4"/></linearGradient></defs><circle cx="330" cy="400" r="64" fill="#ef7b3c"/><rect x="0" y="540" width="640" height="320" rx="40" fill="#6f93b5"/>' + ag);
        }
        break;
      case 'expressao':
        h = sv(1380, -40, 600, 330, '0 0 600 330', '<path d="M20 120 C120 20 220 200 330 90 S520 40 590 140" stroke="#ff6a3d" stroke-width="34" stroke-linecap="round" opacity=".85"/><path d="M60 220 C160 130 260 290 370 190 S540 160 600 230" stroke="#f6c234" stroke-width="22" stroke-linecap="round" opacity=".75"/><path d="M0 40 C140 -20 260 90 380 20" stroke="#ef3f5d" stroke-width="18" stroke-linecap="round" opacity=".7"/>');
        if (capa && !temImg) h += sv(1080, 140, 800, 840, '0 0 800 840', '<path d="M0 160 C120 40 220 260 360 130 S600 60 800 180" stroke="#ff6a3d" stroke-width="56" stroke-linecap="round"/><path d="M0 290 C140 170 260 380 420 250 S640 200 800 320" stroke="#f6c234" stroke-width="44" stroke-linecap="round"/><path d="M0 410 C160 300 300 500 460 380 S660 340 800 440" stroke="#ef3f5d" stroke-width="36" stroke-linecap="round"/><path d="M-20 840 L800 470" stroke="#d4a373" stroke-width="70"/><path d="M-20 840 L800 470" stroke="#5b3a29" stroke-width="10" stroke-dasharray="30 40"/><path d="M220 840 c-10-120 0-200 40-230 c50-40 110 0 100 60 c-8 50-40 70-60 70 c-30 120-20 100-20 100" fill="#e9d7b3" stroke="#1b1b1b" stroke-width="10"/><ellipse cx="300" cy="640" rx="12" ry="20" fill="#1b1b1b"/><ellipse cx="260" cy="640" rx="12" ry="20" fill="#1b1b1b"/><ellipse cx="282" cy="690" rx="14" ry="22" fill="#1b1b1b"/>');
        break;
      case 'cubo':
        h = sv(1835, 0, 85, 1080, '0 0 160 1080', '<path d="M40 0 H160 V300 L0 220 Z" fill="#b5651d"/><path d="M0 220 L160 300 V620 L60 560 Z" fill="#3f5866"/><path d="M60 560 L160 620 V1080 H20 Z" fill="#8c3a2b"/><path d="M40 0 L0 220 L60 560 L20 1080" stroke="#2a2420" stroke-width="6"/>');
        if (capa && !temImg) h += sv(1100, 130, 720, 820, '0 0 720 820', '<path d="M120 60 L460 0 L620 260 L300 340 Z" fill="#b5651d" stroke="#2a2420" stroke-width="8"/><path d="M300 340 L620 260 L700 560 L380 620 Z" fill="#3f5866" stroke="#2a2420" stroke-width="8"/><path d="M40 300 L300 340 L380 620 L80 700 Z" fill="#d9c49c" stroke="#2a2420" stroke-width="8"/><path d="M80 700 L380 620 L520 820 L120 820 Z" fill="#8c3a2b" stroke="#2a2420" stroke-width="8"/><circle cx="330" cy="470" r="90" fill="#2a2420"/><circle cx="330" cy="470" r="60" fill="#e8dbc1"/><path d="M330 120 V820 M200 330 L520 610" stroke="#2a2420" stroke-width="6" opacity=".7"/><path d="M520 140 h120 v120" stroke="#2a2420" stroke-width="8"/>');
        break;
      case 'sonho':
        h = sv(1640, 50, 220, 220, '0 0 220 220', '<path d="M140 20 A90 90 0 1 0 200 160 A70 70 0 1 1 140 20Z" fill="#ffd27a"/>') + sv(0, 1030, 1920, 120, '0 0 1920 120', '<defs><pattern id="xd" width="80" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="20" fill="#1b1446"/><rect x="40" y="20" width="40" height="20" fill="#1b1446"/><rect x="40" width="40" height="20" fill="#fff6e8"/><rect y="20" width="40" height="20" fill="#fff6e8"/></pattern></defs><rect width="1920" height="120" fill="url(#xd)" opacity=".35"/>');
        if (capa && !temImg) h += sv(1060, 100, 820, 900, '0 0 820 900', '<defs><radialGradient id="es" cx=".35" cy=".3"><stop offset="0" stop-color="#fff6e8"/><stop offset=".5" stop-color="#ffd27a"/><stop offset="1" stop-color="#c46b5a"/></radialGradient><radialGradient id="es2" cx=".35" cy=".3"><stop offset="0" stop-color="#e9fffb"/><stop offset="1" stop-color="#3f9b93"/></radialGradient></defs><path d="M0 900 L250 560 H570 L820 900 Z" fill="#fff6e8" opacity=".9"/><path d="M0 900 L250 560 M120 900 L300 560 M240 900 L350 560 M360 900 L410 560 M480 900 L460 560 M600 900 L520 560 M720 900 L570 560 M820 900 L570 560" stroke="#1b1446" stroke-width="5"/><path d="M80 820 H740 M150 720 H670 M200 640 H620" stroke="#1b1446" stroke-width="5"/><ellipse cx="420" cy="620" rx="110" ry="22" fill="#1b1446" opacity=".35"/><circle cx="420" cy="330" r="130" fill="url(#es)"/><ellipse cx="660" cy="720" rx="60" ry="12" fill="#1b1446" opacity=".35"/><circle cx="660" cy="560" r="60" fill="url(#es2)"/><rect x="140" y="190" width="120" height="210" rx="60" fill="none" stroke="#fff6e8" stroke-width="10"/><path d="M200 400 v120" stroke="#fff6e8" stroke-width="6" stroke-dasharray="10 12"/><path d="M560 120 c40-30 90-30 120 0 c30-20 70 0 70 30 H520 c0-20 20-30 40-30Z" fill="#fff6e8" opacity=".85"/>');
        break;
      case 'pop':
        var star = function (cx, cy, r1, r2, n) { var p = '', i; for (i = 0; i < n * 2; i++) { var r = i % 2 ? r2 : r1, a = Math.PI * i / n; p += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(0) + ' ' + (cy + r * Math.sin(a)).toFixed(0); } return p + 'Z'; };
        h = sv(1650, 30, 240, 240, '0 0 240 240', '<path d="' + star(120, 120, 115, 70, 12) + '" fill="#ff2d6f" stroke="#111" stroke-width="7"/><text x="120" y="148" text-anchor="middle" font-family="Bangers, Impact, sans-serif" font-size="90" fill="#fff" stroke="#111" stroke-width="3">!</text>');
        if (capa && !temImg) h += sv(1080, 140, 760, 820, '0 0 760 820', '<path d="' + star(380, 380, 370, 220, 14) + '" fill="#ff2d6f" stroke="#111" stroke-width="12"/><path d="' + star(380, 380, 250, 160, 14) + '" fill="#1e73ff" stroke="#111" stroke-width="8"/><text x="380" y="450" text-anchor="middle" font-family="Bangers, Impact, sans-serif" font-size="200" fill="#ffe14d" stroke="#111" stroke-width="8" transform="rotate(-8 380 400)">UAU!</text><path d="M440 660 c160 0 280 40 280 100 s-120 60-200 60 l-80 0 -60 60 10-62 c-90-8-150-30-150-60 0-60 80-98 200-98Z" fill="#fff" stroke="#111" stroke-width="8"/><circle cx="470" cy="760" r="12" fill="#111"/><circle cx="530" cy="760" r="12" fill="#111"/><circle cx="590" cy="760" r="12" fill="#111"/>');
        break;
      case 'bauhaus':
        h = sv(1690, 30, 200, 200, '0 0 200 200', '<circle cx="70" cy="70" r="60" fill="#d6382c"/><rect x="110" y="100" width="80" height="80" fill="#1f4fa3"/><path d="M20 190 L70 110 L120 190 Z" fill="#f2b705"/>');
        if (capa && !temImg) h += sv(1080, 110, 780, 860, '0 0 780 860', '<rect x="420" y="0" width="360" height="360" fill="#1f4fa3"/><circle cx="330" cy="420" r="260" fill="#d6382c"/><path d="M380 860 L600 440 L780 860 Z" fill="#f2b705"/><rect x="0" y="720" width="460" height="22" fill="#1b1b1b"/><rect x="120" y="60" width="22" height="440" fill="#1b1b1b"/><circle cx="640" cy="580" r="60" fill="none" stroke="#1b1b1b" stroke-width="14"/><rect x="40" y="800" width="120" height="60" fill="#1b1b1b"/>');
        break;
      case 'brasil':
        h = bandeirinhas(10, ['#c4362b', '#e8a317', '#1f7a4d', '#2f5fa8', '#f2e4c4']) + zigue(1040, '#1a1410', 40);
        if (capa && !temImg) {
          var raios = '', i2; for (i2 = 0; i2 < 18; i2++) { var a2 = i2 * Math.PI / 9; raios += '<path d="M' + (300 + 150 * Math.cos(a2)).toFixed(0) + ' ' + (260 + 150 * Math.sin(a2)).toFixed(0) + ' L' + (300 + 250 * Math.cos(a2 + .09)).toFixed(0) + ' ' + (260 + 250 * Math.sin(a2 + .09)).toFixed(0) + ' L' + (300 + 250 * Math.cos(a2 - .09)).toFixed(0) + ' ' + (260 + 250 * Math.sin(a2 - .09)).toFixed(0) + 'Z" fill="#1a1410"/>'; }
          h += sv(1130, 190, 640, 750, '0 0 700 820', raios + '<circle cx="300" cy="260" r="130" fill="#e8a317" stroke="#1a1410" stroke-width="12"/><path d="M240 250 q30 30 60 0 M300 250 q30 30 60 0 M250 320 q50 40 100 0" stroke="#1a1410" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M0 820 Q200 600 380 700 T700 640 V820Z" fill="#1a1410"/><path d="M540 820 V470 c0-40 60-40 60 0 V820 M540 600 h-60 c-20 0-30-10-30-30 v-80 c0-30 40-30 40 0 v70 h50 M600 650 h50 c20 0 30-10 30-30 v-60 c0-30-40-30-40 0 v50 h-40" fill="#1f7a4d" stroke="#1a1410" stroke-width="10" stroke-linejoin="round"/><path d="M40 760 q80-40 160 0 M120 720 q60-30 120 0" stroke="#f2e4c4" stroke-width="8" fill="none"/>');
        }
        break;
      case 'raiz':
        h = grafismo(34, '#e8c170') + grafismo(1036, '#e08a33');
        if (capa && !temImg) {
          var an = '', r3;
          for (r3 = 0; r3 < 6; r3++) { var R = 380 - r3 * 58; an += '<circle cx="390" cy="420" r="' + R + '" fill="' + ['#c24a2c', '#2a1a12', '#e08a33', '#2a1a12', '#e8c170', '#2a1a12'][r3] + '" stroke="#e8c170" stroke-width="4"/>'; }
          var zz = '', k; for (k = 0; k < 36; k++) { var a3 = k * Math.PI / 18; zz += '<path d="M' + (390 + 300 * Math.cos(a3)).toFixed(0) + ' ' + (420 + 300 * Math.sin(a3)).toFixed(0) + ' L' + (390 + 345 * Math.cos(a3 + .087)).toFixed(0) + ' ' + (420 + 345 * Math.sin(a3 + .087)).toFixed(0) + ' L' + (390 + 300 * Math.cos(a3 + .174)).toFixed(0) + ' ' + (420 + 300 * Math.sin(a3 + .174)).toFixed(0) + '" stroke="#2a1a12" stroke-width="10" fill="none"/>'; }
          h += sv(1080, 120, 780, 840, '0 0 780 840', an + zz + '<path d="M390 290 L450 420 L390 550 L330 420 Z" fill="#e8c170" stroke="#2a1a12" stroke-width="8"/><path d="M390 330 L425 420 L390 510 L355 420 Z" fill="#c24a2c"/>');
        }
        break;
      case 'atelie':
        h = sv(1790, 800, 150, 150, '0 0 160 160', '<path d="' + BLOB[0] + '" fill="#e0533c" opacity=".85"/><circle cx="30" cy="20" r="10" fill="#e0533c"/><circle cx="150" cy="140" r="7" fill="#e0533c"/>') + sv(1720, 60, 140, 140, '0 0 160 160', '<path d="' + BLOB[1] + '" fill="#f2b632" opacity=".85"/>') + dv('left:-30px;top:40px;width:220px;height:54px;background:rgba(242,226,170,.8);transform:rotate(-30deg)') + dv('right:-30px;bottom:40px;width:220px;height:54px;background:rgba(242,226,170,.8);transform:rotate(-30deg)');
        if (capa && !temImg) h += sv(1080, 170, 780, 760, '0 0 780 760', '<path d="M380 20 C620 0 780 140 760 330 C745 470 640 470 600 540 C560 610 640 700 520 740 C320 800 40 680 20 420 C0 170 160 40 380 20Z" fill="#c99a6a" stroke="#8a6440" stroke-width="10"/><circle cx="560" cy="220" r="60" fill="#efe6d2" stroke="#8a6440" stroke-width="8"/><path d="' + BLOB[0] + '" fill="#e0533c" transform="translate(120 110) scale(.8)"/><path d="' + BLOB[1] + '" fill="#2f6fb0" transform="translate(300 60) scale(.7)"/><path d="' + BLOB[2] + '" fill="#f2b632" transform="translate(120 360) scale(.8)"/><path d="' + BLOB[0] + '" fill="#3f9b57" transform="translate(320 470) scale(.7)"/><path d="' + BLOB[1] + '" fill="#2c2a26" transform="translate(480 330) scale(.55)"/><path d="M660 760 L300 380" stroke="#8a6440" stroke-width="26" stroke-linecap="round"/><path d="M300 380 L250 330" stroke="#c7c7c7" stroke-width="30"/><path d="M250 330 C230 300 200 290 170 300 C190 320 210 350 250 330Z" fill="#e0533c"/>');
        break;
      case 'cena':
        var cort = function (x, w, flip) { return '<div style="position:absolute;top:0;bottom:0;left:' + x + 'px;width:' + w + 'px;background:repeating-linear-gradient(90deg,#5a0c14 0 18px,#8f1a26 18px 40px,#5a0c14 40px 60px);' + (flip ? 'border-left' : 'border-right') + ':6px solid #ffcf5a;box-shadow:0 0 60px rgba(0,0,0,.6)"></div>'; };
        h = capa ? cort(0, 70) + cort(1850, 70, 1) + '<div style="position:absolute;left:0;right:0;top:0;height:70px;background:repeating-linear-gradient(90deg,#6e0f1b 0 60px,#8f1a26 60px 120px);border-bottom:6px solid #ffcf5a"></div>' : cort(0, 26) + cort(1894, 26, 1);
        if (capa && !temImg) h += sv(1100, 140, 680, 820, '0 0 680 820', '<defs><linearGradient id="fx" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6a8" stop-opacity=".5"/><stop offset="1" stop-color="#ffe6a8" stop-opacity="0"/></linearGradient></defs><path d="M300 0 L40 820 H620 Z" fill="url(#fx)"/><ellipse cx="330" cy="780" rx="290" ry="40" fill="#ffcf5a" opacity=".25"/><path d="M150 300 c0-90 70-150 150-150 s140 60 140 150 c0 110-70 190-140 190 s-150-80-150-190Z" fill="#f7efe3" stroke="#1b1416" stroke-width="10"/><path d="M220 290 q30-30 60 0 M340 290 q30-30 60 0 M240 380 q70 60 140 0" stroke="#1b1416" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M330 420 c0-80 60-130 130-130 s120 50 120 130 c0 100-60 160-120 160 s-130-60-130-160Z" fill="#ffcf5a" stroke="#1b1416" stroke-width="10" transform="rotate(18 460 440)"/><path d="M400 430 q25 20 50 0 M490 450 q25 20 50 0 M420 520 q50-40 100 0" stroke="#1b1416" stroke-width="10" fill="none" stroke-linecap="round" transform="rotate(18 460 440)"/>');
        break;
      case 'som':
        var bar = '', b; for (b = 0; b < 14; b++) { var hh = 30 + ((b * 47) % 110); bar += '<rect x="' + (b * 20) + '" y="' + (150 - hh) + '" width="12" height="' + hh + '" rx="6" fill="' + (b % 3 ? '#5ee3c1' : '#ff7a59') + '"/>'; }
        h = sv(1600, 800, 260, 140, '0 0 280 150', bar, ';opacity:.8') + sv(1460, 60, 420, 130, '0 0 420 130', '<path d="M0 20 H420 M0 45 H420 M0 70 H420 M0 95 H420 M0 120 H420" stroke="#a7b3cf" stroke-width="2" opacity=".35"/><ellipse cx="120" cy="95" rx="16" ry="12" fill="#5ee3c1"/><path d="M136 95 V30" stroke="#5ee3c1" stroke-width="5"/><ellipse cx="220" cy="70" rx="16" ry="12" fill="#ffd166"/><path d="M236 70 V10" stroke="#ffd166" stroke-width="5"/><ellipse cx="320" cy="45" rx="16" ry="12" fill="#ff7a59"/><path d="M336 45 V-15 L370 0" stroke="#ff7a59" stroke-width="5"/>', ';opacity:.8');
        if (capa && !temImg) { var sul = '', g; for (g = 0; g < 9; g++) sul += '<circle cx="390" cy="420" r="' + (360 - g * 26) + '" stroke="#2a3550" stroke-width="3"/>'; h += sv(1080, 110, 780, 860, '0 0 780 860', '<circle cx="390" cy="420" r="380" fill="#0b0f17"/>' + sul + '<circle cx="390" cy="420" r="120" fill="#ff7a59"/><circle cx="390" cy="420" r="16" fill="#0b0f17"/><path d="M220 140 a300 300 0 0 1 340 0" stroke="#5ee3c1" stroke-width="10" opacity=".7"/><path d="M0 800 Q100 700 200 800 T400 800 T600 800 T800 800" stroke="#5ee3c1" stroke-width="12" fill="none"/><path d="M0 840 Q100 760 200 840 T400 840 T600 840 T800 840" stroke="#ffd166" stroke-width="8" fill="none" opacity=".8"/>'); }
        break;
    }
    return '<div class="s-deco">' + h + '</div>';
  }

  /* ---------- montagem de um slide (1920×1080) ---------- */
  function lista(itens, cls) { itens = itens || []; return '<ul class="s-lista' + (itens.length > 5 ? ' s-lista--6' : '') + (cls || '') + '">' + itens.map(function (t, i) { return '<li class="a" style="--d:' + (i + 2) + '">' + esc(t) + '</li>'; }).join('') + '</ul>'; }
  function quadro(src, cred) { return '<div class="s-quadro"><img src="' + esc(src) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add(\'s-quadro--erro\')"></div>' + (cred ? '<div class="s-cred">Imagem: Wikimedia Commons</div>' : ''); }
  function moldura(deck, cls, corpo, i, total, extra, capa) {
    var e = ESTILOS[deck.estilo] ? deck.estilo : 'galeria';
    return '<div class="slide e-' + e + ' ' + cls + '"><div class="s-fundo"></div>' + deco(e, capa, !!deck.img) + (extra || '') +
      (capa ? '' : '<div class="s-topo a">' + esc(deck.area || 'Arte') + ' · ' + esc(deck.titulo) + '</div>') +
      '<div class="s-corpo">' + corpo + '</div><div class="s-marca">Art<i>flix</i></div><div class="s-num">' + (i + 1) + ' / ' + total + '</div></div>';
  }
  var tam = function (t, a, b) { return t.length > b ? ' s-frase--g' : t.length > a ? ' s-frase--m' : ''; };
  function slideHTML(deck, i) {
    var total = deck.slides.length + 1, t = deck.titulo || '';
    if (i === 0) {
      var extra = deck.img ? '<div class="s-obra-capa a" style="--d:2">' + quadro(deck.img, deck.cred) + '</div>' : '';
      var longa = Math.max.apply(null, t.split(/\s+/).map(function (w) { return w.length; }));
      var corpo = '<h1 class="s-tit a' + (longa > 13 || t.length > 34 ? ' s-tit--xg' : t.length > 22 || longa > 11 ? ' s-tit--g' : t.length > 12 || longa > 9 ? ' s-tit--m' : '') + '" style="--d:1">' + esc(t) + '</h1><p class="s-sub a" style="--d:2">' + esc(deck.sub) + '</p>' +
        '<div class="s-tags a" style="--d:3"><span>' + esc(deck.area || 'Arte') + '</span>' + (deck.tema ? '<span>' + esc(deck.tema) + '</span>' : '') + '</div>';
      return moldura(deck, 's-capa' + (deck.img ? '' : ' s-capa--sem'), corpo, i, total, extra, true);
    }
    var s = deck.slides[i - 1] || {}, c = '';
    switch (s.t) {
      case 'roteiro': c = '<h2 class="s-tit a" style="--d:1">' + esc(s.titulo) + '</h2>' + lista(s.itens); return moldura(deck, 's-roteiro', c, i, total);
      case 'leitura':
        c = '<div class="s-leit-img a" style="--d:1">' + (deck.img ? quadro(deck.img) : '') + '</div><div><h2 class="s-tit a" style="--d:2">' + esc(s.titulo) + '</h2><div style="height:34px"></div>' + lista(s.itens) + '</div>';
        return moldura(deck, 's-leit', c, i, total);
      case 'topicos': c = '<h2 class="s-tit a" style="--d:1">' + esc(s.titulo) + '</h2>' + lista(s.itens); return moldura(deck, 's-top', c, i, total);
      case 'conceito': c = '<h2 class="s-termo a" style="--d:1">' + esc(s.termo) + '</h2><p class="s-def a" style="--d:2">' + esc(s.def) + '</p>' + (s.ex ? '<div class="s-ex s-caixa a" style="--d:3">' + ICON.lampada + '<p>' + esc(s.ex) + '</p></div>' : ''); return moldura(deck, 's-con', c, i, total);
      case 'citacao': var tx = s.texto || ''; c = '<div class="s-aspas a" style="--d:1">“</div><p class="s-frase a' + tam(tx, 60, 100) + '" style="--d:2">' + esc(tx) + '</p><p class="s-autor a" style="--d:3">' + esc(s.autor) + (s.obra ? '<small>' + esc(s.obra) + '</small>' : '') + '</p>'; return moldura(deck, 's-cit', c, i, total);
      case 'compara':
        var col = function (o, d) { o = o || { nome: '', itens: [] }; return '<div class="s-col s-caixa a" style="--d:' + d + '"><h3>' + esc(o.nome) + '</h3><ul>' + (o.itens || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>'; };
        c = '<h2 class="s-tit a" style="--d:1">' + esc(s.titulo) + '</h2><div class="s-cols">' + col(s.a, 2) + col(s.b, 3) + '</div>'; return moldura(deck, 's-cmp', c, i, total);
      case 'tempo': c = '<h2 class="s-tit a" style="--d:1">' + esc(s.titulo) + '</h2><div class="s-tempo">' + (s.marcos || []).map(function (m, k) { return '<div class="s-marco a" style="--d:' + (k + 2) + '"><b>' + esc(m[0]) + '</b><p>' + esc(m[1]) + '</p></div>'; }).join('') + '</div>'; return moldura(deck, 's-tem', c, i, total);
      case 'bio': c = '<h2 class="s-tit a" style="--d:1">' + esc(s.nome) + '</h2><p class="s-datas a" style="--d:2">' + esc(s.datas) + '</p>' + lista(s.itens); return moldura(deck, 's-bio', c, i, total);
      case 'debate': var pg = s.pergunta || ''; c = '<div class="s-deb-ic a" style="--d:1">' + ICON.debate + '</div><h2 class="s-perg a' + (pg.length > 75 ? ' s-perg--g' : pg.length > 48 ? ' s-perg--m' : '') + '" style="--d:2">' + esc(pg) + '</h2><ul>' + (s.itens || []).map(function (x, k) { return '<li class="a" style="--d:' + (k + 3) + '">' + esc(x) + '</li>'; }).join('') + '</ul>'; return moldura(deck, 's-deb', c, i, total);
      case 'resumo': c = '<h2 class="s-tit a" style="--d:1">Para <em>lembrar</em></h2>' + lista(s.itens) + (s.enem ? '<div class="s-enem s-caixa a" style="--d:6"><b>ENEM</b><p>' + esc(s.enem) + '</p></div>' : ''); return moldura(deck, 's-res', c, i, total);
      case 'obra':
        var f = s.ficha || [], ficha = '<div class="s-etiqueta a" style="--d:1"><h2>' + esc(s.titulo) + '</h2>' + f.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</div>';
        c = (s.img ? '<div class="s-obra-img a" style="--d:1">' + quadro(s.img) + '</div>' : ficha) + '<div class="s-observe a" style="--d:2">' + (s.img ? '<p style="font-size:30px;font-weight:800;letter-spacing:.06em;margin-bottom:14px">' + esc(s.titulo) + ' · ' + esc(f.slice(0, 2).join(', ')) + '</p>' : '') + '<h3>' + ICON.olho + ' Observe</h3><ul>' + (s.itens || []).map(function (x, k) { return '<li class="a" style="--d:' + (k + 3) + '">' + esc(x) + '</li>'; }).join('') + '</ul></div>';
        return moldura(deck, 's-obra', c, i, total);
      case 'paleta':
        c = '<h2 class="s-tit a" style="--d:1">' + esc(s.titulo) + '</h2><div class="s-cores">' + (s.cores || []).map(function (p, k) { return '<div class="s-cor a" style="--d:' + (k + 2) + ';--c:' + esc(p[0]) + '"><i></i><b>' + esc(p[1]) + '</b><small>' + esc(p[0]) + '</small></div>'; }).join('') + '</div>' + (s.texto ? '<p class="s-pal-tx a" style="--d:8">' + esc(s.texto) + '</p>' : '');
        return moldura(deck, 's-pal', c, i, total);
      case 'atividade':
        c = '<h2 class="s-tit a s-maos" style="--d:1">' + ICON.pincel + '<span>Mãos à obra: <em>' + esc(s.titulo) + '</em></span></h2><div class="s-ativ-cols"><div class="s-mat s-caixa a" style="--d:2"><h3>Materiais</h3><ul>' + (s.materiais || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div><div class="a" style="--d:3"><h3>Passo a passo</h3><ol class="s-passos">' + (s.passos || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></div></div>';
        return moldura(deck, 's-ativ', c, i, total);
      case 'galeria':
        var ob = s.obras || [];
        c = '<h2 class="s-tit a" style="--d:1">' + esc(s.titulo) + '</h2><div class="s-gal s-gal--' + ob.length + '">' + ob.map(function (o, k) {
          return '<figure class="a" style="--d:' + (k + 2) + '"><div class="s-gal-q"><img src="' + esc(o[0]) + '" alt="' + esc(o[1]) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add(\'s-gal-q--erro\')"></div><figcaption>' + esc(o[1]) + '</figcaption></figure>';
        }).join('') + '</div>';
        return moldura(deck, 's-galeria', c, i, total);
      case 'saida':
        var ic = [ICON.lampada, ICON.estrela, ICON.duvida];
        c = '<h2 class="s-tit a" style="--d:1">' + esc(s.titulo) + '</h2><div class="s-tickets">' + (s.itens || []).map(function (x, k) { return '<div class="s-ticket a" style="--d:' + (k + 2) + '">' + ic[k % 3] + '<p>' + esc(x) + '</p><span></span><span></span></div>'; }).join('') + '</div>';
        return moldura(deck, 's-saida', c, i, total);
    }
    return moldura(deck, '', '', i, total);
  }

  /* encolhe o conteúdo quando um texto editado fica grande demais para o slide */
  function encaixa(raiz) {
    (raiz || document).querySelectorAll('.slide .s-corpo').forEach(function (c) {
      var f = c.children, k, z = 1;
      for (k = 0; k < f.length; k++) f[k].style.zoom = '';
      while ((c.scrollHeight > c.clientHeight + 2 || c.scrollWidth > c.clientWidth + 2) && z > .5) { z -= .05; for (k = 0; k < f.length; k++) f[k].style.zoom = z.toFixed(2); }
    });
  }

  /* ---------- escala: o slide 1920×1080 cabe no quadro ---------- */
  var ro = 'ResizeObserver' in window ? new ResizeObserver(function (es) { es.forEach(function (e) { ajusta(e.target); }); }) : null;
  function ajusta(el) { var w = el.clientWidth; if (w) el.style.setProperty('--k', (w / 1920).toFixed(5)); }
  function observa(raiz) { (raiz || document).querySelectorAll('.tela, .quadro').forEach(function (el) { ajusta(el); if (ro) ro.observe(el); }); encaixa(raiz); }
  window.addEventListener('resize', function () { observa(); });
  function tela(deck, i) { return '<div class="tela" aria-hidden="true">' + slideHTML(deck, i) + '</div>'; }
  function rotulo(s) { return s.titulo || s.termo || s.nome || (s.t === 'citacao' ? 'Citação: ' + (s.autor || '') : s.t === 'debate' ? 'Debate' : s.t === 'resumo' ? 'Para lembrar' : 'Slide'); }

  /* ---------- catálogo: salas por área e tema ---------- */
  var filtro = 'Todas', estiloF = '', termo = '';
  var semAc = function (t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  function passa(d) {
    if (filtro === 'Minhas') { if (!ehNovo(d.slug) && !ehEditado(d.slug)) return false; }
    else if (filtro !== 'Todas' && d.area !== filtro) return false;
    if (estiloF && d.estilo !== estiloF) return false;
    if (!termo) return true;
    var alvo = semAc([d.titulo, d.sub, d.tema, d.area].concat(d.slides.map(function (s) { return [s.titulo, s.termo, s.nome, s.autor, s.pergunta].join(' '); })).join(' '));
    return alvo.indexOf(semAc(termo)) >= 0;
  }
  function cartao(d, n) {
    var qtd = d.slides.length + 1;
    return '<button type="button" class="cartao" style="--n:' + Math.min(n, 12) + '" data-abrir="' + esc(d.slug) + '" aria-label="' + esc(d.titulo + ', ' + qtd + ' slides') + '"><span class="moldura">' +
      tela(d, 0) + '</span><span class="qtd">' + qtd + ' slides</span>' + (ehEditado(d.slug) ? '<span class="tag-ed">Editada</span>' : '') + '<span class="play">' + ICON.play + '</span>' +
      '<span class="cartao-info"><b>' + esc(d.titulo) + '</b><span><span class="estilo-tag"><i style="' + amostra(d.estilo) + '"></i>' + esc((ESTILOS[d.estilo] || {}).nome || '') + '</span> · ' + qtd + ' slides</span></span></button>';
  }
  var CRIAR = '<button type="button" class="cartao cartao--criar" data-criar><span class="moldura"><span class="tela"><span class="criar-ic">' + ICON.mais + '</span><span class="criar-tx">Criar aula</span></span></span><span class="cartao-info"><b>Nova apresentação</b><span>Em branco, no estilo que quiser</span></span></button>';
  function catalogo() {
    var ds = decks().filter(passa), html = '';
    if (termo || filtro !== 'Todas' || estiloF) {
      var cab = termo ? 'Resultados' : filtro === 'Minhas' ? 'Minhas apresentações' : (filtro !== 'Todas' ? filtro : 'Estilo ' + ESTILOS[estiloF].nome);
      if (filtro !== 'Todas' && filtro !== 'Minhas' && !termo) {
        html = '<div class="area-cab wrap"><h2>' + esc(filtro) + '</h2><span>' + ds.length + ' apresentações</span></div>';
        temasDe(ds).forEach(function (tm) { var l = ds.filter(function (d) { return d.tema === tm; }); html += '<section class="fileira wrap"><div class="fileira-cab"><h3>' + esc(tm) + '</h3><span>' + l.length + '</span></div><div class="grade">' + l.map(cartao).join('') + '</div></section>'; });
      } else {
        html = '<section class="fileira wrap"><div class="area-cab" style="padding-top:20px"><h2>' + esc(cab) + '</h2><span>' + ds.length + ' apresentações</span></div>' +
          (ds.length || filtro === 'Minhas' ? '<div class="grade">' + (filtro === 'Minhas' && !termo ? CRIAR : '') + ds.map(cartao).join('') + '</div>' : '<p class="vazio">Nenhuma apresentação encontrada. Tente outro termo.</p>') + '</section>';
      }
    } else {
      var minhas = ds.filter(function (d) { return ehNovo(d.slug); });
      html += '<section class="fileira wrap"><div class="area-cab" style="padding-top:16px"><h2>Minhas <em>aulas</em></h2><span>' + (minhas.length ? minhas.length + ' criadas por você' : 'Crie a sua ou edite qualquer apresentação') + '</span></div><div class="trilho">' + CRIAR + minhas.map(cartao).join('') + '</div></section>';
      AREAS.forEach(function (ar) {
        var g = ds.filter(function (d) { return d.area === ar && !ehNovo(d.slug); });
        if (!g.length) return;
        html += '<div class="area-cab wrap"><h2>' + esc(ar) + '</h2><span>' + g.length + ' apresentações · ' + g.reduce(function (a, d) { return a + d.slides.length + 1; }, 0) + ' slides</span></div>';
        temasDe(g).forEach(function (tm) {
          var l = g.filter(function (d) { return d.tema === tm; });
          html += '<section class="fileira wrap"><div class="fileira-cab"><h3>' + esc(tm) + '</h3><span>' + l.length + '</span></div><div class="trilho">' + l.map(cartao).join('') + '</div></section>';
        });
      });
    }
    $('#catalogo').innerHTML = html;
    observa($('#catalogo'));
  }
  function temasDe(ds) { var t = []; ds.forEach(function (d) { if (t.indexOf(d.tema) < 0) t.push(d.tema); }); return t; }
  function chipsEstilo() {
    $('#estilos').innerHTML = '<b>Estilos</b>' + Object.keys(ESTILOS).map(function (k) { return '<button type="button" class="chip-estilo" data-estilo="' + k + '" aria-pressed="' + (estiloF === k) + '"><i style="' + amostra(k) + '"></i>' + ESTILOS[k].nome + '</button>'; }).join('');
  }

  /* ---------- destaque ---------- */
  var DESTAQUES = ['tarsila-do-amaral', 'van-gogh', 'pop-art', 'barroco-mineiro', 'surrealismo', 'samba', 'teatro-grego', 'bauhaus'];
  function destaque() {
    var lista = DESTAQUES.map(acha).filter(Boolean), n = 0;
    if (!lista.length) lista = decks().slice(0, 1);
    function mostra(d) {
      $('#destaque-txt').innerHTML = '<span class="eyebrow">200 aulas de Arte prontas e editáveis</span><h1>' + esc(d.titulo) + ': <em>' + esc(d.sub) + '</em></h1>' +
        '<p>Slides para projetar em sala, cada aula num estilo artístico próprio. Obra em foco, paleta de cores, linha do tempo, debate e atividade de ateliê. Edite, crie as suas e baixe em PowerPoint.</p>' +
        '<div class="meta"><span class="badge">' + esc(d.area) + '</span><span>' + (d.slides.length + 1) + ' slides</span><span class="estilo-tag"><i style="' + amostra(d.estilo) + '"></i>Estilo ' + esc(ESTILOS[d.estilo].nome) + '</span></div>' +
        '<div class="acoes"><button type="button" class="btn btn--ouro" data-apresentar="' + esc(d.slug) + '">' + ICON.play + ' Apresentar</button><button type="button" class="btn btn--glass" data-abrir="' + esc(d.slug) + '">' + ICON.grade + ' Ver os slides</button></div>';
      $('#destaque-tela').innerHTML = '<div class="luz"></div><div class="moldura-ouro">' + tela(d, 0) + '</div><div class="placa">' + esc(d.titulo) + ' · Estilo ' + esc(ESTILOS[d.estilo].nome) + '</div>';
      observa($('#destaque'));
    }
    mostra(lista[0]);
    clearInterval(destaque.t);
    destaque.t = setInterval(function () {
      if (document.hidden || !$('#apresentador').hidden || !$('#editor').hidden || !$('#painel').hidden) return;
      n = (n + 1) % lista.length; mostra(lista[n]);
    }, 6000);
  }

  /* ---------- página da apresentação ---------- */
  function abrir(slug) {
    var d = acha(slug);
    if (!d) return;
    var p = $('#painel');
    p.innerHTML = '<div class="painel-caixa" role="dialog" aria-modal="true" aria-labelledby="painel-t"><button type="button" class="fechar" data-fechar aria-label="Fechar">' + ICON.x + '</button>' +
      '<div class="painel-topo"><div><span class="eyebrow">' + esc(d.area) + ' · ' + esc(d.tema) + '</span><h2 id="painel-t">' + esc(d.titulo) + '</h2><p>' + esc(d.sub) + '</p>' +
      '<div class="meta"><span class="badge">' + esc(d.area) + '</span><span>' + (d.slides.length + 1) + ' slides</span><span class="estilo-tag"><i style="' + amostra(d.estilo) + '"></i>Estilo ' + esc((ESTILOS[d.estilo] || ESTILOS.galeria).nome) + '</span>' + (ehEditado(slug) ? '<span class="tag-ed tag-ed--inline">Editada por você</span>' : '') + (ehNovo(slug) ? '<span class="tag-ed tag-ed--inline">Criada por você</span>' : '') + '</div>' +
      '<div class="acoes"><button type="button" class="btn btn--ouro" data-apresentar="' + esc(slug) + '">' + ICON.play + ' Apresentar</button>' +
      '<button type="button" class="btn btn--glass" data-editar="' + esc(slug) + '">' + ICON.lapis + ' Editar</button>' +
      '<button type="button" class="btn btn--glass" data-pptx="' + esc(slug) + '">' + ICON.ppt + ' PowerPoint</button>' +
      '<button type="button" class="btn btn--glass" data-imprimir="' + esc(slug) + '">' + ICON.impr + ' PDF</button></div>' +
      (d.cred ? '<p class="credito">Imagem: <a href="' + esc(d.cred) + '" target="_blank" rel="noopener">Wikimedia Commons (autor e licença)</a></p>' : '') +
      '</div><div class="moldura-ouro">' + tela(d, 0) + '</div></div>' +
      '<div class="lista-slides"><h3>Todos os slides</h3><div class="mini-grade">' + d.slides.map(function (s, k) { return '<button type="button" class="mini" data-apresentar="' + esc(slug) + '" data-ir="' + (k + 1) + '">' + tela(d, k + 1) + '<span>' + (k + 2) + '. ' + esc(rotulo(s)) + '</span></button>'; }).join('') + '</div></div></div>';
    p.hidden = false;
    document.body.style.overflow = 'hidden';
    observa(p);
    $('.fechar', p).focus();
    try { history.replaceState(null, '', '#' + slug); } catch (e) {}
  }
  function fechar() { var p = $('#painel'); p.hidden = true; p.innerHTML = ''; document.body.style.overflow = ''; try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }

  /* ---------- apresentador ---------- */
  var atual = null, idx = 0, timerOculta, notasLigadas = false;
  function apresentar(slug, ir) {
    atual = acha(slug); if (!atual) return;
    idx = ir || 0;
    var a = $('#apresentador'); a.hidden = false; document.body.style.overflow = 'hidden';
    $('#ap-titulo').textContent = atual.titulo + ' · ' + atual.sub;
    $('#ap-notas').hidden = !notasLigadas; $('#ap-faixa').hidden = true; $('#bt-grade').setAttribute('aria-pressed', 'false');
    $('#ap-quadro').innerHTML = '';
    mostra(0); mexeu(); ajustaQuadro();
    try { if (a.requestFullscreen && window.matchMedia('(pointer: fine)').matches) a.requestFullscreen().catch(function () {}); } catch (e) {}
  }
  function ajustaQuadro() { var q = $('#ap-quadro'), p = $('#ap-palco'); if (!p.clientWidth) return; var w = Math.min(p.clientWidth, p.clientHeight * 16 / 9); q.style.width = Math.floor(w) + 'px'; ajusta(q); }
  function mostra(dir) {
    var q = $('#ap-quadro'), total = atual.slides.length + 1, velho = q.querySelector('.slide:not(.sai)');
    var tmp = document.createElement('div'); tmp.innerHTML = slideHTML(atual, idx); var novo = tmp.firstChild;
    if (dir) novo.classList.add(dir > 0 ? 'entra-dir' : 'entra-esq');
    if (velho) { velho.classList.add('sai'); setTimeout(function () { if (velho.parentNode) velho.parentNode.removeChild(velho); }, 450); }
    q.appendChild(novo); encaixa(q);
    $('#ap-cont').textContent = (idx + 1) + ' / ' + total;
    $('#ap-prog').style.width = ((idx + 1) / total * 100) + '%';
    var s = idx ? atual.slides[idx - 1] : null;
    $('#ap-notas').innerHTML = '<b>Nota para o professor</b>' + esc(s && s.n ? s.n : 'Sem nota para este slide.');
    if (!$('#ap-faixa').hidden) marcaFaixa();
  }
  function vai(d) { var total = atual.slides.length + 1, n = Math.max(0, Math.min(total - 1, idx + d)); if (n === idx) return; idx = n; mostra(d); }
  function vaiPara(n) { var d = n > idx ? 1 : -1; if (n === idx) return; idx = n; mostra(d); }
  function sair() { $('#apresentador').hidden = true; document.body.style.overflow = ($('#painel').hidden && $('#editor').hidden) ? '' : 'hidden'; try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {} $('#ap-quadro').innerHTML = ''; }
  function faixa() {
    var f = $('#ap-faixa'), on = f.hidden; f.hidden = !on; $('#bt-grade').setAttribute('aria-pressed', String(on));
    if (on) { f.innerHTML = [null].concat(atual.slides).map(function (s, k) { return '<button type="button" class="mini" data-ir-ap="' + k + '">' + tela(atual, k) + '<span>' + (k + 1) + (k ? '. ' + esc(rotulo(s)) : '. Capa') + '</span></button>'; }).join(''); observa(f); marcaFaixa(); }
  }
  function marcaFaixa() { $('#ap-faixa').querySelectorAll('.mini').forEach(function (m, k) { m.setAttribute('aria-current', String(k === idx)); if (k === idx) m.scrollIntoView({ block: 'nearest', inline: 'center' }); }); }
  function mexeu() { var a = $('#apresentador'); a.classList.remove('oculto'); clearTimeout(timerOculta); timerOculta = setTimeout(function () { if ($('#ap-faixa').hidden) a.classList.add('oculto'); }, 2600); }
  function telaCheia() { var a = $('#apresentador'); try { if (document.fullscreenElement) document.exitFullscreen(); else if (a.requestFullscreen) a.requestFullscreen(); } catch (e) {} }

  /* ---------- impressão / PDF ---------- */
  function imprimir(slug) {
    var d = acha(slug); if (!d) return;
    var box = $('#impressao');
    box.innerHTML = [0].concat(d.slides.map(function (_, k) { return k + 1; })).map(function (k) { return tela(d, k); }).join('');
    box.hidden = false; observa(box);
    box.querySelectorAll('.tela').forEach(function (t) { t.style.setProperty('--k', (1122 / 1920).toFixed(5)); });
    box.querySelectorAll('img').forEach(function (i) { i.loading = 'eager'; });
    setTimeout(function () { window.print(); box.hidden = true; }, 900);
  }

  /* ---------- editor ---------- */
  var CAMPOS = {
    capa: [['titulo', 'Título', 'linha'], ['sub', 'Subtítulo', 'linha'], ['area', 'Área', 'area'], ['tema', 'Tema', 'linha'], ['estilo', 'Estilo artístico', 'estilo'], ['img', 'Imagem da capa', 'img']],
    roteiro: [['titulo', 'Título', 'linha'], ['itens', 'Roteiro da aula (um por linha)', 'lista']],
    leitura: [['titulo', 'Título', 'linha'], ['itens', 'Perguntas de leitura (uma por linha)', 'lista']],
    topicos: [['titulo', 'Título', 'linha'], ['itens', 'Tópicos (um por linha)', 'lista']],
    conceito: [['termo', 'Conceito', 'linha'], ['def', 'Definição', 'texto'], ['ex', 'Exemplo', 'texto']],
    obra: [['titulo', 'Nome da obra', 'linha'], ['ficha', 'Ficha técnica (artista, ano, técnica, local: um por linha)', 'lista'], ['itens', 'O que observar (um por linha)', 'lista'], ['img', 'Imagem da obra (opcional)', 'imgslide']],
    paleta: [['titulo', 'Título', 'linha'], ['cores', 'Cores (uma por linha, assim: #E63B2E Vermelho)', 'cores'], ['texto', 'Comentário', 'texto']],
    citacao: [['texto', 'Citação', 'texto'], ['autor', 'Autor', 'linha'], ['obra', 'Obra ou fonte', 'linha']],
    compara: [['titulo', 'Título', 'linha'], ['a.nome', 'Coluna 1: nome', 'linha'], ['a.itens', 'Coluna 1: itens (um por linha)', 'lista'], ['b.nome', 'Coluna 2: nome', 'linha'], ['b.itens', 'Coluna 2: itens (um por linha)', 'lista']],
    tempo: [['titulo', 'Título', 'linha'], ['marcos', 'Marcos (um por linha, assim: data | acontecimento)', 'marcos']],
    bio: [['nome', 'Nome', 'linha'], ['datas', 'Datas', 'linha'], ['itens', 'Tópicos (um por linha)', 'lista']],
    atividade: [['titulo', 'Nome da atividade', 'linha'], ['materiais', 'Materiais (um por linha)', 'lista'], ['passos', 'Passo a passo (um por linha)', 'lista']],
    debate: [['pergunta', 'Pergunta', 'texto'], ['itens', 'Pistas para o debate (uma por linha)', 'lista']],
    resumo: [['itens', 'Pontos para lembrar (um por linha)', 'lista'], ['enem', 'Dica para o Enem', 'texto']],
    saida: [['titulo', 'Título', 'linha'], ['itens', 'Perguntas do bilhete (uma por linha)', 'lista']],
    galeria: [['titulo', 'Título', 'linha'], ['obras', 'Obras (uma por linha, assim: endereço da imagem | legenda). Até 4.', 'obras']]
  };
  var NOMES = { topicos: 'Tópicos', conceito: 'Conceito', obra: 'Obra em foco', paleta: 'Paleta de cores', leitura: 'Primeiro olhar (imagem)', citacao: 'Citação', compara: 'Comparação', tempo: 'Linha do tempo', bio: 'Biografia', atividade: 'Mãos à obra', debate: 'Debate', resumo: 'Resumo e Enem', saida: 'Bilhete de saída', roteiro: 'Roteiro da aula', galeria: 'Galeria de obras' };
  var MODELO = {
    topicos: { t: 'topicos', titulo: 'Novo tópico', itens: ['Primeiro ponto', 'Segundo ponto', 'Terceiro ponto'] },
    conceito: { t: 'conceito', termo: 'Conceito', def: 'Escreva aqui a definição.', ex: 'Um exemplo do dia a dia.' },
    obra: { t: 'obra', titulo: 'Nome da obra', ficha: ['Artista', 'Ano', 'Técnica', 'Onde está'], itens: ['Detalhe para observar', 'Outro detalhe', 'Uma pergunta sobre a obra'] },
    paleta: { t: 'paleta', titulo: 'Paleta de cores', cores: [['#E63B2E', 'Vermelho'], ['#F2C230', 'Amarelo'], ['#2459A8', 'Azul'], ['#3E9B4F', 'Verde']], texto: 'Comente o uso das cores.' },
    leitura: { t: 'leitura', titulo: 'Primeiro olhar', itens: ['O que você vê?', 'Como a imagem está organizada?', 'O que ela pode significar?', 'Que sensação ela provoca?'] },
    citacao: { t: 'citacao', texto: 'Escreva aqui a citação.', autor: 'Autor', obra: 'Obra' },
    compara: { t: 'compara', titulo: 'Comparação', a: { nome: 'Lado A', itens: ['Característica', 'Característica'] }, b: { nome: 'Lado B', itens: ['Característica', 'Característica'] } },
    tempo: { t: 'tempo', titulo: 'Linha do tempo', marcos: [['Data', 'Acontecimento'], ['Data', 'Acontecimento'], ['Data', 'Acontecimento']] },
    bio: { t: 'bio', nome: 'Nome do artista', datas: 'nascimento – morte', itens: ['Fato importante', 'Obra principal', 'Ideia central'] },
    atividade: { t: 'atividade', titulo: 'Nome da atividade', materiais: ['papel', 'lápis de cor'], passos: ['Primeiro passo', 'Segundo passo', 'Terceiro passo'] },
    debate: { t: 'debate', pergunta: 'Pergunta para a turma?', itens: ['Pista 1', 'Pista 2', 'Pista 3'] },
    resumo: { t: 'resumo', itens: ['Ponto 1', 'Ponto 2', 'Ponto 3'], enem: '' },
    saida: { t: 'saida', titulo: 'Bilhete de saída', itens: ['Uma coisa que aprendi hoje', 'Uma imagem ou som que ficou na memória', 'Uma pergunta que ainda tenho'] },
    roteiro: { t: 'roteiro', titulo: 'Nesta aula', itens: ['Primeira parte', 'Segunda parte', 'Debate e mãos à obra'] },
    galeria: { t: 'galeria', titulo: 'Galeria de obras', obras: [['', 'Obra 1, artista, ano'], ['', 'Obra 2, artista, ano'], ['', 'Obra 3, artista, ano']] }
  };
  var ed = { deck: null, i: 0, tSalva: 0, tPrev: 0, confirma: '' };
  function pega(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function poe(o, p, v) { var ks = p.split('.'), a = o; for (var k = 0; k < ks.length - 1; k++) { if (a[ks[k]] == null) a[ks[k]] = {}; a = a[ks[k]]; } a[ks[ks.length - 1]] = v; }
  var linhas = function (v) { return String(v || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean); };

  function editar(slug) {
    var d = acha(slug); if (!d) return;
    ed.deck = clone(d); ed.i = 0; ed.confirma = '';
    fechar();
    $('#editor').hidden = false; document.body.style.overflow = 'hidden';
    montaEditor();
    try { history.replaceState(null, '', '#editar-' + slug); } catch (er) {}
  }
  function montaEditor() {
    var d = ed.deck;
    $('#ed-nome').textContent = d.titulo || 'Sem título';
    $('#ed-lista').innerHTML = [null].concat(d.slides).map(function (s, k) {
      return '<div class="ed-item' + (k === ed.i ? ' ed-item--on' : '') + '"><button type="button" class="mini" data-ed-ir="' + k + '">' + tela(d, k) + '<span>' + (k + 1) + '. ' + esc(k ? rotulo(s) : 'Capa') + '</span></button>' +
        (k ? '<div class="ed-acoes"><button type="button" data-ed-acao="sobe" data-k="' + k + '" aria-label="Subir slide ' + (k + 1) + '"' + (k < 2 ? ' disabled' : '') + '>↑</button><button type="button" data-ed-acao="desce" data-k="' + k + '" aria-label="Descer slide ' + (k + 1) + '"' + (k === d.slides.length ? ' disabled' : '') + '>↓</button><button type="button" data-ed-acao="dup" data-k="' + k + '" aria-label="Duplicar slide ' + (k + 1) + '">⧉</button><button type="button" data-ed-acao="apaga" data-k="' + k + '" aria-label="Apagar slide ' + (k + 1) + '"' + (d.slides.length < 2 ? ' disabled' : '') + '>✕</button></div>' : '') + '</div>';
    }).join('') + '<div class="ed-novo"><label for="ed-tipo">Novo slide</label><select id="ed-tipo">' + Object.keys(NOMES).map(function (k) { return '<option value="' + k + '">' + NOMES[k] + '</option>'; }).join('') + '</select><button type="button" class="btn btn--glass btn--peq" data-ed-add>' + ICON.mais + ' Adicionar</button></div>';
    observa($('#ed-lista'));
    var it = $('#ed-lista .ed-item--on'); if (it) it.scrollIntoView({ block: 'nearest' });
    previa(); formulario();
  }
  function previa() { var q = $('#ed-quadro'); q.innerHTML = slideHTML(ed.deck, ed.i); ajusta(q); if (ro) ro.observe(q); encaixa(q); }
  function campo(f, val) {
    var id = 'f-' + f[0].replace('.', '-'), rot = '<label for="' + id + '">' + esc(f[1]) + '</label>';
    if (f[2] === 'linha') return '<div class="ed-campo">' + rot + '<input id="' + id + '" type="text" data-campo="' + f[0] + '" data-tipo="linha" value="' + esc(val) + '"></div>';
    if (f[2] === 'texto') return '<div class="ed-campo">' + rot + '<textarea id="' + id + '" rows="3" data-campo="' + f[0] + '" data-tipo="texto">' + esc(val) + '</textarea></div>';
    if (f[2] === 'lista') return '<div class="ed-campo">' + rot + '<textarea id="' + id + '" rows="6" data-campo="' + f[0] + '" data-tipo="lista">' + esc((val || []).join('\n')) + '</textarea></div>';
    if (f[2] === 'marcos') return '<div class="ed-campo">' + rot + '<textarea id="' + id + '" rows="6" data-campo="' + f[0] + '" data-tipo="marcos">' + esc((val || []).map(function (m) { return m[0] + ' | ' + m[1]; }).join('\n')) + '</textarea></div>';
    if (f[2] === 'obras') return '<div class="ed-campo">' + rot + '<textarea id="' + id + '" rows="6" data-campo="' + f[0] + '" data-tipo="obras">' + esc((val || []).map(function (m) { return (/^data:/.test(m[0]) ? '(imagem enviada)' : m[0]) + ' | ' + m[1]; }).join('\n')) + '</textarea><p class="ed-dica">Cole o endereço de imagens livres ou suas.</p></div>';
    if (f[2] === 'cores') return '<div class="ed-campo">' + rot + '<textarea id="' + id + '" rows="6" data-campo="' + f[0] + '" data-tipo="cores">' + esc((val || []).map(function (m) { return m[0] + ' ' + m[1]; }).join('\n')) + '</textarea></div>';
    if (f[2] === 'area') return '<div class="ed-campo">' + rot + '<select id="' + id + '" data-campo="area" data-tipo="linha">' + AREAS.map(function (a) { return '<option' + (val === a ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select></div>';
    if (f[2] === 'estilo') return '<div class="ed-campo"><label>' + esc(f[1]) + '</label><div class="ed-estilos">' + Object.keys(ESTILOS).map(function (k) { return '<button type="button" data-ed-estilo="' + k + '" aria-pressed="' + (val === k) + '"><i style="' + amostra(k) + '"></i>' + ESTILOS[k].nome + '</button>'; }).join('') + '</div></div>';
    if (f[2] === 'img' || f[2] === 'imgslide') {
      var ext = val && !/^data:/.test(val) ? val : '';
      return '<div class="ed-campo">' + rot + '<input id="' + id + '" type="url" inputmode="url" placeholder="Cole o endereço de uma imagem (https://...)" data-campo="img" data-tipo="linha" value="' + esc(ext) + '">' +
        '<div class="ed-img-acoes"><label class="btn btn--glass btn--peq">Enviar do computador<input type="file" accept="image/*" data-ed-arquivo hidden></label>' + (val ? '<button type="button" class="btn btn--glass btn--peq" data-ed-semimg>Remover imagem</button>' : '') + '</div>' +
        '<p class="ed-dica">Use imagens livres ou suas. A imagem enviada fica guardada só neste navegador.</p></div>';
    }
    return '';
  }
  function formulario() {
    var d = ed.deck, k = ed.i, s = k ? d.slides[k - 1] : d, fs = k ? (CAMPOS[s.t] || []) : CAMPOS.capa, html = '';
    html += '<h3>' + (k ? 'Slide ' + (k + 1) + ' · ' + esc(NOMES[s.t] || '') : 'Capa e estilo da aula') + '</h3>';
    html += fs.map(function (f) { return campo(f, pega(s, f[0])); }).join('');
    if (k) html += campo(['n', 'Nota para o professor (aparece só no modo apresentação)', 'texto'], s.n || '');
    html += '<div class="ed-rodape">';
    if (ehNovo(d.slug)) html += '<button type="button" class="btn btn--perigo btn--peq" data-ed-excluir>' + (ed.confirma === 'excluir' ? 'Clique de novo para excluir' : 'Excluir apresentação') + '</button>';
    else html += '<button type="button" class="btn btn--glass btn--peq" data-ed-restaurar' + (ehEditado(d.slug) ? '' : ' disabled') + '>' + (ed.confirma === 'restaurar' ? 'Clique de novo para desfazer tudo' : 'Restaurar original') + '</button>';
    html += '<button type="button" class="btn btn--glass btn--peq" data-ed-duplicar>' + ICON.copia + ' Duplicar apresentação</button></div>';
    $('#ed-form').innerHTML = html;
  }
  function alterou(imediato) {
    clearTimeout(ed.tPrev); clearTimeout(ed.tSalva);
    $('#ed-status').textContent = 'Salvando…';
    ed.tPrev = setTimeout(function () {
      previa();
      var mini = $('#ed-lista .ed-item--on .tela'); if (mini) { mini.innerHTML = slideHTML(ed.deck, ed.i); encaixa(mini); }
      var lab = $('#ed-lista .ed-item--on .mini span'); if (lab) lab.textContent = (ed.i + 1) + '. ' + (ed.i ? rotulo(ed.deck.slides[ed.i - 1]) : 'Capa');
      $('#ed-nome').textContent = ed.deck.titulo || 'Sem título';
    }, imediato ? 0 : 120);
    ed.tSalva = setTimeout(salvaAgora, imediato ? 0 : 500);
  }
  function salvaAgora() {
    clearTimeout(ed.tSalva);
    if (!ed.deck) return true;
    var ok = guarda(clone(ed.deck));
    $('#ed-status').textContent = ok ? 'Salvo neste navegador' : 'Não deu para salvar: o espaço do navegador acabou. Use imagens menores ou endereços de imagem.';
    $('#ed-status').classList.toggle('ed-status--erro', !ok);
    var rs = $('[data-ed-restaurar]'); if (rs && ok && !ehNovo(ed.deck.slug)) rs.disabled = false;
    return ok;
  }
  function fechaEditor() {
    var slug = ed.deck && ed.deck.slug;
    salvaAgora();
    $('#editor').hidden = true; document.body.style.overflow = '';
    $('#ed-quadro').innerHTML = ''; $('#ed-lista').innerHTML = '';
    ed.deck = null; catalogo(); destaque();
    if (slug && acha(slug)) abrir(slug); else { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
  }
  function lerArquivo(f) {
    if (!f || !/^image\//.test(f.type)) return;
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        var max = 1280, w = im.naturalWidth, h = im.naturalHeight, r = Math.min(1, max / Math.max(w, h));
        var c = document.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(h * r);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        var alvo = ed.i ? ed.deck.slides[ed.i - 1] : ed.deck;
        alvo.img = c.toDataURL('image/jpeg', .82); if (!ed.i) delete ed.deck.cred;
        formulario(); alterou(true); setTimeout(montaEditor, 10);
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(f);
  }
  function acaoSlide(a, k) {
    var sl = ed.deck.slides, j = k - 1;
    if (a === 'sobe' && j > 0) { sl.splice(j - 1, 0, sl.splice(j, 1)[0]); ed.i = k - 1; }
    else if (a === 'desce' && j < sl.length - 1) { sl.splice(j + 1, 0, sl.splice(j, 1)[0]); ed.i = k + 1; }
    else if (a === 'dup') { sl.splice(j + 1, 0, clone(sl[j])); ed.i = k + 1; }
    else if (a === 'apaga' && sl.length > 1) { sl.splice(j, 1); ed.i = Math.min(k, sl.length); }
    ed.confirma = ''; montaEditor(); alterou(true);
  }
  function criar(base) {
    var d = base ? clone(base) : { area: filtro !== 'Todas' && filtro !== 'Minhas' ? filtro : 'Artes Visuais', titulo: 'Nova aula', sub: 'Escreva o subtítulo', tema: 'Minhas aulas', estilo: estiloF || 'atelie', img: '',
      slides: [clone(MODELO.roteiro), clone(MODELO.conceito), clone(MODELO.obra), clone(MODELO.paleta), clone(MODELO.debate), clone(MODELO.atividade), clone(MODELO.resumo), clone(MODELO.saida)] };
    d.slug = novoSlug();
    if (base) { d.titulo = d.titulo + ' (cópia)'; d.tema = 'Minhas aulas'; }
    st().novos.unshift(d);
    if (!grava()) { st().novos.shift(); aviso('Não há espaço no navegador para criar outra apresentação.'); return; }
    editar(d.slug);
  }

  /* ---------- PowerPoint (editável), com as cores e formas de cada estilo ---------- */
  var PT = {
    abstrato: { bg: '121019', ink: 'FDF6E3', mut: 'B9B3C9', acc: 'F2545B', acc2: '3FA7D6', card: '1D1A27', ft: 'Arial Black', up: true },
    galeria: { bg: '16110D', ink: 'F4EAD8', mut: 'B8A98F', acc: 'D9B25F', acc2: 'C97B4A', card: '231B14', ft: 'Georgia', up: false },
    barroco: { bg: '120709', ink: 'F6E7CF', mut: 'C4A98A', acc: 'E0B25A', acc2: 'C2313D', card: '24100F', ft: 'Georgia', up: false, it: true },
    impressao: { bg: 'F5EFE2', ink: '1D3346', mut: '5D6F7D', acc: 'D8693F', acc2: '3F7FB4', card: 'FFFFFF', ft: 'Georgia', up: false, it: true },
    expressao: { bg: '0F1A33', ink: 'FFF3E0', mut: 'B9C1D8', acc: 'FF6A3D', acc2: 'F6C234', card: '1A2647', ft: 'Impact', up: true },
    cubo: { bg: 'E8DBC1', ink: '2A2420', mut: '6E6052', acc: 'B5651D', acc2: '3F5866', card: 'F7F0E2', ft: 'Arial Black', up: true },
    sonho: { bg: '2C1C58', ink: 'FFF6E8', mut: 'E5CFE3', acc: 'FFD27A', acc2: '7FE0D6', card: '3D2A6E', ft: 'Georgia', up: false, it: true },
    pop: { bg: 'FFE14D', ink: '111111', mut: '3D3D3D', acc: 'FF2D6F', acc2: '1E73FF', card: 'FFFFFF', ft: 'Impact', up: true },
    bauhaus: { bg: 'F2EAD8', ink: '1B1B1B', mut: '5A554C', acc: 'D6382C', acc2: '1F4FA3', card: 'FFFFFF', ft: 'Impact', up: true },
    brasil: { bg: 'F2E4C4', ink: '1A1410', mut: '5B4B38', acc: 'C4362B', acc2: '1F7A4D', card: 'FBF3DD', ft: 'Rockwell', up: false },
    raiz: { bg: '2A1A12', ink: 'F6E7D0', mut: 'CDB497', acc: 'E08A33', acc2: 'E8C170', card: '3A261B', ft: 'Impact', up: true },
    atelie: { bg: 'EFE6D2', ink: '2C2A26', mut: '6B6457', acc: 'E0533C', acc2: '2F6FB0', card: 'FFFDF6', ft: 'Segoe Print', up: false },
    cena: { bg: '0D0A12', ink: 'F7EFE3', mut: 'BDB0A2', acc: 'FFCF5A', acc2: 'E0424D', card: '1B1520', ft: 'Georgia', up: false },
    som: { bg: '0F1726', ink: 'EEF3FF', mut: 'A7B3CF', acc: '5EE3C1', acc2: 'FF7A59', card: '18233A', ft: 'Impact', up: true }
  };
  function carregaPptx() {
    if (window.PptxGenJS) return Promise.resolve();
    if (carregaPptx.p) return carregaPptx.p;
    carregaPptx.p = new Promise(function (ok, falha) {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@4.0.1/dist/pptxgen.bundle.js';
      s.onload = function () { ok(); }; s.onerror = function () { carregaPptx.p = null; falha(new Error('script')); };
      document.head.appendChild(s);
    });
    return carregaPptx.p;
  }
  function carregaImagem(src) {
    if (!src) return Promise.resolve(null);
    var pg = /^data:/.test(src) ? Promise.resolve(src) : fetch(src, { mode: 'cors', referrerPolicy: 'no-referrer' }).then(function (r) { if (!r.ok) throw new Error('img'); return r.blob(); }).then(function (b) {
      return new Promise(function (ok) { var fr = new FileReader(); fr.onload = function () { ok(fr.result); }; fr.readAsDataURL(b); });
    });
    return pg.then(function (du) { return new Promise(function (ok) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { ok(null); }; im.src = du; }); }).catch(function () { return null; });
  }
  function recorte(im, bw, bh) {
    var ar = bw / bh, w = im.naturalWidth, h = im.naturalHeight, sw, sh, sx, sy;
    if (w / h > ar) { sh = h; sw = h * ar; sx = (w - sw) / 2; sy = 0; } else { sw = w; sh = w / ar; sx = 0; sy = (h - sh) * .25; }
    var c = document.createElement('canvas'); c.width = Math.round(Math.min(1200, sw)); c.height = Math.round(c.width / ar);
    c.getContext('2d').drawImage(im, sx, sy, sw, sh, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', .86).replace(/^data:/, '');
  }
  function montaPptx(d, im, gim) {
    gim = gim || {};
    var p = new window.PptxGenJS(), T = PT[d.estilo] || PT.galeria, S = p.ShapeType;
    p.layout = 'LAYOUT_WIDE'; p.title = d.titulo; p.author = 'ArtFlix'; p.subject = d.area + ' · ' + (d.tema || '');
    var TXT = 'Calibri', total = d.slides.length + 1;
    var tt = function (t) { return T.up ? String(t || '').toUpperCase() : String(t || ''); };
    var tit = function (o) { return Object.assign({ fontFace: T.ft, color: T.ink, italic: !!T.it, bold: T.ft === 'Georgia' || T.ft === 'Rockwell', fit: 'shrink', valign: 'top' }, o); };
    function enfeite(s, capa) {
      var e = d.estilo;
      if (e === 'abstrato') { [[11.6, .3, 1.4, '3FA7D6'], [11.85, .55, .9, 'F7B32B'], [12.05, .75, .5, 'F2545B']].forEach(function (c) { s.addShape(S.ellipse, { x: c[0], y: c[1], w: c[2], h: c[2], fill: { color: c[3] }, line: { type: 'none' } }); }); s.addShape(S.line, { x: 0, y: 6.4, w: 3, h: 1, line: { color: 'F7B32B', width: 4 } }); }
      if (e === 'galeria') { s.addShape(S.rect, { x: .25, y: .25, w: 12.83, h: 7, fill: { type: 'none' }, line: { color: T.acc, width: 1.5 } }); }
      if (e === 'barroco') { s.addShape(S.rect, { x: 0, y: 0, w: 13.33, h: capa ? .7 : .12, fill: { color: '6E0F1B' }, line: { color: T.acc, width: 2 } }); }
      if (e === 'impressao') { [['D8693F', .2, 6.6], ['3F7FB4', 11.6, .3], ['789F57', 12, 6.7], ['F2C45C', .4, .4]].forEach(function (c) { s.addShape(S.ellipse, { x: c[1], y: c[2], w: 1.2, h: .35, fill: { color: c[0], transparency: 45 }, line: { type: 'none' } }); }); }
      if (e === 'expressao') { s.addShape(S.ellipse, { x: 10.5, y: -1.2, w: 4, h: 2.2, fill: { type: 'none' }, line: { color: T.acc, width: 10 } }); s.addShape(S.ellipse, { x: 11.2, y: -.9, w: 3.2, h: 1.5, fill: { type: 'none' }, line: { color: T.acc2, width: 6 } }); }
      if (e === 'cubo') { s.addShape(S.rtTriangle, { x: 12.3, y: 0, w: 1.03, h: 2.4, fill: { color: T.acc }, line: { color: T.ink, width: 2 } }); s.addShape(S.rect, { x: 12.6, y: 2.4, w: .73, h: 2.6, fill: { color: T.acc2 }, line: { color: T.ink, width: 2 } }); s.addShape(S.rtTriangle, { x: 12.3, y: 5, w: 1.03, h: 2.5, fill: { color: '8C3A2B' }, line: { color: T.ink, width: 2 }, flipH: true }); }
      if (e === 'sonho') { s.addShape(S.ellipse, { x: 11.8, y: .35, w: 1, h: 1, fill: { color: T.acc }, line: { type: 'none' } }); s.addShape(S.ellipse, { x: 11.2, y: 6.4, w: .5, h: .5, fill: { color: T.acc2 }, line: { type: 'none' } }); }
      if (e === 'pop') { s.addShape(S.star10 || S.star8 || S.star5, { x: 11.7, y: .2, w: 1.4, h: 1.4, fill: { color: T.acc }, line: { color: '111111', width: 3 } }); }
      if (e === 'bauhaus') { s.addShape(S.ellipse, { x: 11.9, y: .25, w: .8, h: .8, fill: { color: 'D6382C' }, line: { type: 'none' } }); s.addShape(S.rect, { x: 12.4, y: .7, w: .6, h: .6, fill: { color: '1F4FA3' }, line: { type: 'none' } }); s.addShape(S.triangle, { x: 11.75, y: 1, w: .7, h: .6, fill: { color: 'F2B705' }, line: { type: 'none' } }); s.addShape(S.rect, { x: 0, y: 6.75, w: 13.33, h: .06, fill: { color: '1B1B1B' }, line: { type: 'none' } }); }
      if (e === 'brasil') { var cs = ['C4362B', 'E8A317', '1F7A4D', '2F5FA8']; for (var i = 0; i < 16; i++) s.addShape(S.triangle, { x: .1 + i * .83, y: .05, w: .6, h: .55, fill: { color: cs[i % 4] }, line: { color: '1A1410', width: 1.5 }, flipV: true }); }
      if (e === 'raiz') { for (var j = 0; j < 26; j++) { s.addShape(S.triangle, { x: j * .52, y: .2, w: .5, h: .25, fill: { color: T.acc2 }, line: { type: 'none' } }); s.addShape(S.triangle, { x: j * .52, y: 7.05, w: .5, h: .25, fill: { color: T.acc }, line: { type: 'none' } }); } }
      if (e === 'atelie') { s.addShape(S.ellipse, { x: 12.2, y: 6.2, w: .9, h: .8, fill: { color: T.acc, transparency: 15 }, line: { type: 'none' } }); s.addShape(S.rect, { x: -.3, y: .25, w: 1.6, h: .38, fill: { color: 'F2E2AA', transparency: 20 }, line: { type: 'none' }, rotate: -30 }); }
      if (e === 'cena') { s.addShape(S.rect, { x: 0, y: 0, w: capa ? .6 : .22, h: 7.5, fill: { color: '8F1A26' }, line: { color: T.acc, width: 2 } }); s.addShape(S.rect, { x: capa ? 12.73 : 13.11, y: 0, w: capa ? .6 : .22, h: 7.5, fill: { color: '8F1A26' }, line: { color: T.acc, width: 2 } }); }
      if (e === 'som') { for (var b = 0; b < 10; b++) { var hh = .2 + ((b * 47) % 110) / 110 * .8; s.addShape(S.roundRect, { x: 11.3 + b * .17, y: 7.1 - hh, w: .1, h: hh, fill: { color: b % 3 ? T.acc : T.acc2 }, line: { type: 'none' }, rectRadius: .05 }); } }
    }
    function base(i, capa) {
      var s = p.addSlide(); s.background = { color: T.bg };
      enfeite(s, capa);
      if (!capa) s.addText(String(d.area + ' · ' + d.titulo).toUpperCase(), { x: .7, y: d.estilo === 'brasil' || d.estilo === 'raiz' ? .75 : .4, w: 10.3, h: .4, fontFace: TXT, fontSize: 11, bold: true, color: T.acc, charSpacing: 2 });
      s.addText([{ text: 'Art', options: { color: T.ink } }, { text: 'flix', options: { color: T.acc, italic: true } }], { x: .7, y: 6.82, w: 2, h: .4, fontFace: 'Georgia', fontSize: 16, bold: true });
      s.addText((i + 1) + ' / ' + total, { x: 10.9, y: 6.82, w: 1.7, h: .4, align: 'right', fontFace: TXT, fontSize: 12, color: T.mut });
      return s;
    }
    var bul = function (itens, o) { return (itens || []).map(function (t) { return { text: t, options: Object.assign({ bullet: { indent: 18 }, paraSpaceAfter: 8 }, o || {}) }; }); };
    var num = function (itens) { return (itens || []).map(function (t) { return { text: t, options: { bullet: { type: 'number', indent: 26 }, paraSpaceAfter: 10 } }; }); };
    var caixa = function (o) { return Object.assign({ fill: { color: T.card }, line: { color: T.acc, width: 1.5 }, margin: 14, fontFace: TXT, color: T.ink, valign: 'top', fit: 'shrink' }, o); };
    // capa
    var s = base(0, true);
    if (im) { s.addShape(S.rect, { x: 7.85, y: .95, w: 4.75, h: 5.6, fill: { color: T.acc }, line: { color: T.ink, width: 2 } }); s.addImage({ data: recorte(im, 4.35, 5.2), x: 8.05, y: 1.15, w: 4.35, h: 5.2 }); }
    var tl = (d.titulo || '').length, longa = Math.max.apply(null, (d.titulo || 'x').split(/\s+/).map(function (w) { return w.length; }));
    s.addText(tt(d.titulo), tit({ x: .7, y: 1.2, w: im ? 6.8 : 8.5, h: 2.9, fontSize: Math.min(tl > 22 ? 44 : tl > 12 ? 56 : 68, Math.floor((im ? 6.8 : 8.5) * 72 / (longa * .62))), valign: 'bottom' }));
    s.addText(d.sub || '', { x: .7, y: 4.25, w: im ? 6.6 : 8, h: 1.1, fontFace: TXT, fontSize: 22, color: T.ink, valign: 'top', fit: 'shrink' });
    s.addText((d.area || '') + (d.tema ? '  ·  ' + d.tema : ''), { x: .7, y: 5.5, w: 6, h: .45, fontFace: TXT, fontSize: 13, bold: true, color: T.acc });
    if (im && d.cred) s.addText('Imagem: Wikimedia Commons', { x: 7.85, y: 6.6, w: 4.75, h: .3, fontSize: 9, color: T.mut, align: 'center', fontFace: TXT });
    d.slides.forEach(function (sl, k) {
      var s = base(k + 1), top = d.estilo === 'brasil' || d.estilo === 'raiz' ? 1.25 : .95;
      var titulo = function (t, cor) { s.addText(tt(t), tit({ x: .7, y: top, w: 11.9, h: 1.05, fontSize: 38, color: cor || T.ink })); };
      switch (sl.t) {
        case 'roteiro': case 'topicos': case 'leitura':
          titulo(sl.titulo);
          if (sl.t === 'leitura' && im) { s.addImage({ data: recorte(im, 4.6, 4.6), x: .7, y: top + 1.25, w: 4.6, h: 4.6 }); s.addText(num(sl.itens), { x: 5.7, y: top + 1.25, w: 6.9, h: 4.6, fontFace: TXT, fontSize: 22, color: T.ink, valign: 'top', fit: 'shrink' }); }
          else s.addText(num(sl.itens), { x: .8, y: top + 1.25, w: 11.7, h: 4.4, fontFace: TXT, fontSize: (sl.itens || []).length > 5 ? 20 : 23, color: T.ink, valign: 'top', fit: 'shrink' });
          break;
        case 'conceito':
          s.addText(tt(sl.termo), tit({ x: .7, y: top + .1, w: 11.9, h: 1.3, fontSize: 48, color: T.acc }));
          s.addText(sl.def || '', { x: .7, y: top + 1.55, w: 11.9, h: 1.9, fontFace: TXT, fontSize: 25, bold: true, color: T.ink, valign: 'top', fit: 'shrink' });
          if (sl.ex) s.addText(sl.ex, caixa({ x: .7, y: top + 3.6, w: 11.9, h: 1.6, fontSize: 19, valign: 'middle' }));
          break;
        case 'citacao':
          s.addText('“', { x: .6, y: top - .1, w: 1.5, h: 1.4, fontFace: 'Georgia', fontSize: 110, color: T.acc });
          s.addText(tt(sl.texto), tit({ x: .7, y: top + 1.1, w: 11.9, h: 3, fontSize: (sl.texto || '').length > 100 ? 30 : 38, valign: 'middle' }));
          s.addText([{ text: sl.autor || '', options: { bold: true, fontSize: 22, color: T.ink, breakLine: true } }, { text: sl.obra || '', options: { fontSize: 15, color: T.mut } }], { x: .7, y: top + 4.25, w: 11.9, h: 1.1, fontFace: TXT, valign: 'top' });
          break;
        case 'compara':
          titulo(sl.titulo);
          [sl.a || {}, sl.b || {}].forEach(function (c, j) { s.addText([{ text: tt(c.nome), options: { fontFace: T.ft, fontSize: 26, bold: true, color: j ? T.acc2 : T.acc, breakLine: true, paraSpaceAfter: 10 } }].concat(bul(c.itens, { fontSize: 18, color: T.ink })), caixa({ x: .7 + j * 6.05, y: top + 1.25, w: 5.85, h: 4.4, line: { color: j ? T.acc2 : T.acc, width: 1.5 } })); });
          break;
        case 'tempo':
          titulo(sl.titulo);
          var ms = sl.marcos || [], cw = 11.9 / Math.max(1, ms.length);
          s.addShape(S.line, { x: .7, y: top + 1.55, w: 11.9, h: 0, line: { color: T.acc, width: 3 } });
          ms.forEach(function (m, j) { s.addShape(S.ellipse, { x: .7 + j * cw, y: top + 1.4, w: .3, h: .3, fill: { color: T.acc }, line: { color: T.acc } }); s.addText([{ text: tt(m[0]), options: { fontFace: T.ft, fontSize: 22, bold: true, color: T.acc, breakLine: true, paraSpaceAfter: 6 } }, { text: m[1] || '', options: { fontFace: TXT, fontSize: 15, color: T.ink } }], { x: .7 + j * cw, y: top + 1.9, w: cw - .2, h: 3.6, valign: 'top', fit: 'shrink' }); });
          break;
        case 'bio':
          s.addText(tt(sl.nome), tit({ x: .7, y: top, w: 11.9, h: 1.1, fontSize: 44 }));
          s.addText(sl.datas || '', { x: .7, y: top + 1.15, w: 8, h: .5, fontFace: TXT, fontSize: 18, bold: true, color: T.acc });
          s.addText(num(sl.itens), { x: .8, y: top + 1.8, w: 11.7, h: 3.9, fontFace: TXT, fontSize: 21, color: T.ink, valign: 'top', fit: 'shrink' });
          break;
        case 'obra':
          s.addText([{ text: 'OBRA EM FOCO', options: { fontSize: 11, bold: true, color: '8A7D68', charSpacing: 3, breakLine: true, paraSpaceAfter: 6 } }, { text: sl.titulo || '', options: { fontFace: 'Georgia', fontSize: 28, bold: true, color: '1E1A14', breakLine: true, paraSpaceAfter: 8 } }].concat((sl.ficha || []).map(function (x) { return { text: x, options: { fontSize: 16, color: '4A4134', breakLine: true, paraSpaceAfter: 4 } }; })),
            { x: .7, y: top + .4, w: 5.6, h: 4.9, fill: { color: 'FBF7EE' }, line: { color: 'D9CFBE', width: 1 }, margin: 20, fontFace: TXT, valign: 'top', fit: 'shrink' });
          s.addText([{ text: 'OBSERVE', options: { fontFace: T.ft, fontSize: 28, bold: true, color: T.acc, breakLine: true, paraSpaceAfter: 10 } }].concat(bul(sl.itens, { fontSize: 20, color: T.ink })), { x: 6.8, y: top + .4, w: 5.8, h: 4.9, fontFace: TXT, valign: 'top', fit: 'shrink' });
          break;
        case 'paleta':
          titulo(sl.titulo);
          var cs2 = sl.cores || [], wc = Math.min(2, 11.9 / Math.max(1, cs2.length) - .25);
          cs2.forEach(function (c, j) { var cor = String(c[0] || '#888').replace('#', ''); s.addShape(S.roundRect, { x: .7 + j * (wc + .25), y: top + 1.3, w: wc, h: 2.6, fill: { color: cor }, line: { color: T.ink, width: 1 }, rectRadius: .15 }); s.addText([{ text: c[1] || '', options: { bold: true, fontSize: 16, color: T.ink, breakLine: true } }, { text: '#' + cor, options: { fontSize: 12, color: T.mut } }], { x: .7 + j * (wc + .25), y: top + 4, w: wc, h: .8, fontFace: TXT, valign: 'top' }); });
          if (sl.texto) s.addText(sl.texto, { x: .7, y: top + 4.9, w: 11.9, h: .8, fontFace: TXT, fontSize: 17, color: T.ink, fit: 'shrink' });
          break;
        case 'atividade':
          titulo('Mãos à obra: ' + (sl.titulo || ''), T.acc);
          s.addText([{ text: 'MATERIAIS', options: { bold: true, fontSize: 14, color: T.acc, charSpacing: 2, breakLine: true, paraSpaceAfter: 8 } }].concat(bul(sl.materiais, { fontSize: 17, color: T.ink })), caixa({ x: .7, y: top + 1.3, w: 4.4, h: 4.3 }));
          s.addText([{ text: 'PASSO A PASSO', options: { bold: true, fontSize: 14, color: T.acc2, charSpacing: 2, breakLine: true, paraSpaceAfter: 8 } }].concat(num(sl.passos).map(function (x) { x.options.fontSize = 18; x.options.color = T.ink; return x; })), { x: 5.5, y: top + 1.3, w: 7.1, h: 4.3, fontFace: TXT, valign: 'top', fit: 'shrink' });
          break;
        case 'debate':
          s.addShape(S.ellipse, { x: 6.27, y: top - .05, w: .8, h: .8, fill: { color: T.acc }, line: { color: T.acc } });
          s.addText('?', { x: 6.27, y: top - .05, w: .8, h: .8, align: 'center', valign: 'middle', fontFace: TXT, bold: true, fontSize: 28, color: T.bg });
          s.addText(tt(sl.pergunta), tit({ x: .9, y: top + .9, w: 11.5, h: 2.8, fontSize: (sl.pergunta || '').length > 75 ? 32 : 40, align: 'center', valign: 'middle' }));
          s.addText((sl.itens || []).join('     •     '), { x: .9, y: top + 3.95, w: 11.5, h: 1.3, fontFace: TXT, fontSize: 17, color: T.mut, align: 'center', valign: 'top', fit: 'shrink' });
          break;
        case 'resumo':
          s.addText([{ text: tt('Para '), options: { color: T.ink } }, { text: tt('lembrar'), options: { color: T.acc } }], tit({ x: .7, y: top, w: 11.9, h: 1.05, fontSize: 38 }));
          s.addText((sl.itens || []).map(function (t) { return { text: t, options: { bullet: { code: '2713', indent: 26 }, paraSpaceAfter: 8 } }; }), { x: .8, y: top + 1.2, w: 11.7, h: sl.enem ? 3 : 4.4, fontFace: TXT, fontSize: 21, color: T.ink, valign: 'top', fit: 'shrink' });
          if (sl.enem) s.addText([{ text: 'ENEM   ', options: { bold: true, fontSize: 20, color: T.acc } }, { text: sl.enem, options: { fontSize: 16, color: T.ink } }], caixa({ x: .7, y: top + 4.35, w: 11.9, h: 1.25, valign: 'middle' }));
          break;
        case 'galeria':
          titulo(sl.titulo);
          var gs = sl.obras || [], gw = 11.9 / Math.max(1, gs.length);
          gs.forEach(function (o, j) {
            var gi = gim[k] && gim[k][j], x = .7 + j * gw;
            s.addShape(S.rect, { x: x, y: top + 1.25, w: gw - .25, h: 3.7, fill: { color: T.card }, line: { color: T.acc, width: 1 } });
            if (gi) { var r = Math.min((gw - .45) / gi.naturalWidth, 3.5 / gi.naturalHeight), iw = gi.naturalWidth * r, ih = gi.naturalHeight * r; s.addImage({ data: recorte(gi, iw, ih), x: x + (gw - .25 - iw) / 2, y: top + 1.35 + (3.5 - ih) / 2, w: iw, h: ih }); }
            s.addText(o[1] || '', { x: x, y: top + 5.05, w: gw - .25, h: .7, fontFace: TXT, fontSize: 13, color: T.ink, valign: 'top', fit: 'shrink' });
          });
          break;
        case 'saida':
          titulo(sl.titulo);
          (sl.itens || []).forEach(function (x, j) { s.addText(x, caixa({ x: .7 + j * 4.05, y: top + 1.4, w: 3.8, h: 3.6, fontSize: 22, bold: true, valign: 'middle', align: 'center', line: { color: T.acc, width: 2, dashType: 'dash' } })); });
          break;
      }
      if (sl.n) s.addNotes(sl.n);
    });
    return p;
  }
  function baixarPptx(slug, bt) {
    var d = acha(slug); if (!d) return;
    var txt = bt ? bt.innerHTML : '';
    if (bt) { bt.disabled = true; bt.textContent = 'Preparando…'; }
    var volta = function (m) { if (bt) { bt.disabled = false; bt.innerHTML = txt; } if (m) aviso(m); };
    var gal = {}, pend = [];
    d.slides.forEach(function (s, k) { if (s.t === 'galeria') (s.obras || []).forEach(function (o, j) { pend.push(carregaImagem(o[0]).then(function (im) { (gal[k] = gal[k] || [])[j] = im; })); }); });
    Promise.all([carregaPptx(), carregaImagem(d.img)].concat(pend)).then(function (r) {
      return montaPptx(d, r[1], gal).writeFile({ fileName: (d.titulo || 'aula').replace(/[\\/:*?"<>|]+/g, '').slice(0, 60) + '.pptx' }).then(function () { volta(r[1] || !d.img ? 'PowerPoint baixado. Abra no PowerPoint, Google Apresentações ou Keynote para editar.' : 'PowerPoint baixado sem a imagem (ela não pôde ser copiada).'); });
    }).catch(function () { volta('Não foi possível gerar o PowerPoint agora. Verifique a internet e tente de novo.'); });
  }
  function aviso(m) { var a = $('#aviso'); a.textContent = m; a.hidden = false; clearTimeout(aviso.t); aviso.t = setTimeout(function () { a.hidden = true; }, 5200); }

  /* ---------- backup das edições e créditos ---------- */
  function exportaEdicoes() {
    var b = new Blob([JSON.stringify(st())], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = 'artflix-slides-minhas-edicoes.json'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function importaEdicoes(f) {
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var d = JSON.parse(fr.result), s = st(); if (!d || typeof d !== 'object') throw 0;
        Object.keys(d.edits || {}).forEach(function (k) { if (original(k)) s.edits[k] = d.edits[k]; });
        (d.novos || []).forEach(function (n) { if (n && n.slug && n.slides && !ehNovo(n.slug)) s.novos.push(n); });
        aviso(grava() ? 'Edições importadas.' : 'Não coube no espaço do navegador.'); catalogo(); destaque();
      } catch (e) { aviso('Arquivo inválido.'); }
    };
    fr.readAsText(f);
  }
  function creditos() {
    var p = $('#painel'), ds = decks().filter(function (d) { return d.cred || d.slides.some(function (s) { return s.t === 'galeria' || s.cred; }); });
    p.innerHTML = '<div class="painel-caixa painel-caixa--texto" role="dialog" aria-modal="true" aria-labelledby="cred-t"><button type="button" class="fechar" data-fechar aria-label="Fechar">' + ICON.x + '</button>' +
      '<h2 id="cred-t">Créditos das imagens</h2><p>As imagens das capas vêm do Wikimedia Commons, em domínio público ou com licença livre. Em cada link estão o autor e a licença de uso. Os desenhos de cada estilo foram criados para esta plataforma.</p><ul class="cred-lista">' +
      ds.map(function (d) {
        var ls = (d.cred ? [['capa', d.cred]] : []);
        d.slides.forEach(function (s) { if (s.cred) ls.push([s.titulo, s.cred]); (s.obras || []).forEach(function (o) { if (o[2]) ls.push([o[1], o[2]]); }); });
        return '<li><b>' + esc(d.titulo) + '</b><span>' + ls.map(function (x) { return '<a href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + esc(x[0]) + '</a>'; }).join(' · ') + '</span></li>';
      }).join('') + '</ul></div>';
    p.hidden = false; document.body.style.overflow = 'hidden'; $('.fechar', p).focus();
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : e.target.parentElement; if (!t) return;
    var x;
    if ((x = t.closest('[data-apresentar]'))) { if (!$('#editor').hidden) salvaAgora(); apresentar(x.dataset.apresentar, +(x.dataset.ir || 0)); return; }
    if ((x = t.closest('[data-editar]'))) { editar(x.dataset.editar); return; }
    if ((x = t.closest('[data-pptx]'))) { baixarPptx(x.dataset.pptx, x); return; }
    if (t.closest('[data-criar]')) { criar(); return; }
    if ((x = t.closest('[data-abrir]'))) { abrir(x.dataset.abrir); return; }
    if (t.closest('[data-fechar]')) { fechar(); return; }
    if ((x = t.closest('[data-imprimir]'))) { imprimir(x.dataset.imprimir); return; }
    if ((x = t.closest('[data-filtro]'))) { filtro = x.dataset.filtro; document.querySelectorAll('[data-filtro]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === x)); }); catalogo(); return; }
    if ((x = t.closest('[data-estilo]'))) { estiloF = estiloF === x.dataset.estilo ? '' : x.dataset.estilo; chipsEstilo(); catalogo(); return; }
    if ((x = t.closest('[data-ir-ap]'))) { vaiPara(+x.dataset.irAp); return; }
    if (t.closest('[data-creditos]')) { creditos(); return; }
    if (t.closest('[data-exportar]')) { exportaEdicoes(); return; }
    if (t.closest('[data-ed-fechar]')) { fechaEditor(); return; }
    if ((x = t.closest('[data-ed-ir]'))) { ed.i = +x.dataset.edIr; ed.confirma = ''; montaEditor(); return; }
    if ((x = t.closest('[data-ed-acao]'))) { acaoSlide(x.dataset.edAcao, +x.dataset.k); return; }
    if ((x = t.closest('[data-ed-estilo]'))) { ed.deck.estilo = x.dataset.edEstilo; formulario(); alterou(true); setTimeout(montaEditor, 10); return; }
    if (t.closest('[data-ed-add]')) { var tp = $('#ed-tipo').value; ed.deck.slides.splice(ed.i, 0, clone(MODELO[tp])); ed.i = ed.i + 1; montaEditor(); alterou(true); return; }
    if (t.closest('[data-ed-semimg]')) { var alvo = ed.i ? ed.deck.slides[ed.i - 1] : ed.deck; alvo.img = ''; if (!ed.i) delete ed.deck.cred; formulario(); alterou(true); setTimeout(montaEditor, 10); return; }
    if (t.closest('[data-ed-apresentar]')) { salvaAgora(); apresentar(ed.deck.slug, ed.i); return; }
    if (t.closest('[data-ed-pptx]')) { salvaAgora(); baixarPptx(ed.deck.slug, t.closest('[data-ed-pptx]')); return; }
    if (t.closest('[data-ed-duplicar]')) { salvaAgora(); var base = clone(ed.deck); $('#editor').hidden = true; criar(base); return; }
    if (t.closest('[data-ed-restaurar]')) {
      if (ed.confirma !== 'restaurar') { ed.confirma = 'restaurar'; formulario(); return; }
      delete st().edits[ed.deck.slug]; grava(); ed.deck = clone(original(ed.deck.slug)); ed.i = 0; ed.confirma = ''; montaEditor(); $('#ed-status').textContent = 'Original restaurado'; return;
    }
    if (t.closest('[data-ed-excluir]')) {
      if (ed.confirma !== 'excluir') { ed.confirma = 'excluir'; formulario(); return; }
      var sl = ed.deck.slug; st().novos = st().novos.filter(function (d) { return d.slug !== sl; }); grava(); ed.deck = null; $('#editor').hidden = true; document.body.style.overflow = ''; catalogo(); return;
    }
    if (t === $('#painel')) fechar();
  });
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!ed.deck || !el.closest || !el.closest('#ed-form') || !el.dataset.campo) return;
    var s = ed.i ? ed.deck.slides[ed.i - 1] : ed.deck, v = el.value, tp = el.dataset.tipo;
    if (tp === 'lista') v = linhas(v);
    else if (tp === 'marcos') v = linhas(v).map(function (l) { var j = l.indexOf('|'); return j < 0 ? [l, ''] : [l.slice(0, j).trim(), l.slice(j + 1).trim()]; });
    else if (tp === 'obras') { var antes = (s.obras || []); v = linhas(v).slice(0, 4).map(function (l, k) { var j = l.indexOf('|'), u = (j < 0 ? l : l.slice(0, j)).trim(), lg = j < 0 ? '' : l.slice(j + 1).trim(); if (u === '(imagem enviada)' && antes[k]) u = antes[k][0]; return [u, lg]; }); }
    else if (tp === 'cores') v = linhas(v).map(function (l) { var m = l.match(/^(#?[0-9a-fA-F]{6})\s*(.*)$/); return m ? ['#' + m[1].replace('#', '').toUpperCase(), m[2]] : ['#888888', l]; });
    if (el.dataset.campo === 'img') { v = v.trim(); if (!ed.i) delete ed.deck.cred; }
    poe(s, el.dataset.campo, v);
    ed.confirma = ''; alterou();
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.matches && el.matches('[data-ed-arquivo]') && el.files && el.files[0]) lerArquivo(el.files[0]);
    if (el.matches && el.matches('[data-importar]') && el.files && el.files[0]) { importaEdicoes(el.files[0]); el.value = ''; }
    if (el.matches && el.matches('#ed-form select[data-campo]')) { alterou(true); }
  });
  $('#busca').addEventListener('input', function (e) { termo = e.target.value.trim(); catalogo(); });
  $('#zona-esq').addEventListener('click', function () { vai(-1); });
  $('#zona-dir').addEventListener('click', function () { vai(1); });
  $('#bt-ant').addEventListener('click', function () { vai(-1); });
  $('#bt-prox').addEventListener('click', function () { vai(1); });
  $('#bt-sair').addEventListener('click', sair);
  $('#bt-tela').addEventListener('click', telaCheia);
  $('#bt-grade').addEventListener('click', faixa);
  $('#bt-notas').addEventListener('click', function () { notasLigadas = !notasLigadas; $('#ap-notas').hidden = !notasLigadas; this.setAttribute('aria-pressed', String(notasLigadas)); });
  $('#apresentador').addEventListener('mousemove', mexeu);
  document.addEventListener('keydown', function (e) {
    if (!$('#apresentador').hidden) {
      var k = e.key;
      if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); vai(1); }
      else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); vai(-1); }
      else if (k === 'Home') vaiPara(0);
      else if (k === 'End') vaiPara(atual.slides.length);
      else if (k === 'Escape') { if (!document.fullscreenElement) sair(); }
      else if (k === 'f' || k === 'F') telaCheia();
      else if (k === 'g' || k === 'G') faixa();
      else if (k === 'n' || k === 'N') $('#bt-notas').click();
      mexeu(); return;
    }
    if (e.key === 'Escape' && !$('#editor').hidden && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { fechaEditor(); return; }
    if (e.key === 'Escape' && !$('#painel').hidden) fechar();
  });
  var x0 = null;
  $('#ap-palco').addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  $('#ap-palco').addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) vai(dx < 0 ? 1 : -1); x0 = null; }, { passive: true });
  document.addEventListener('fullscreenchange', ajustaQuadro);
  if ('ResizeObserver' in window) new ResizeObserver(ajustaQuadro).observe($('#ap-palco'));
  window.addEventListener('pagehide', function () { if (ed.deck) salvaAgora(); });

  window.ARTFLIX = { decks: decks, slideHTML: slideHTML, encaixa: encaixa, montaPptx: montaPptx, editar: editar, acha: acha, observa: observa };
  chipsEstilo(); catalogo(); destaque();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { encaixa(); });
  var h = location.hash.replace('#', '');
  if (h.indexOf('editar-') === 0 && acha(h.slice(7))) editar(h.slice(7));
  else if (h && acha(h)) abrir(h);
})();
