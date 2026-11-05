/* ══════════════════════════════════════════
   SEU SITE AQUI — interações
   ══════════════════════════════════════════ */
(function () {
  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Ano no rodapé ── */
  document.getElementById('ano').textContent = new Date().getFullYear();

  /* ── Header: borda ao rolar ── */
  var header = document.querySelector('.header');
  var progresso = document.getElementById('progresso');
  var trilhoFill = document.getElementById('trilhoFill');
  var anoLat = document.getElementById('anoLateral');
  if (anoLat) anoLat.textContent = new Date().getFullYear();

  /* Lateral esquerda: marca a seção atual e as que já passaram */
  var pontos = document.querySelectorAll('.trilho--esq a');
  var alvos = Array.prototype.map.call(pontos, function (a) { return document.getElementById(a.dataset.sec); });
  function marcaTrilho() {
    var meio = window.innerHeight * 0.45, atual = 0;
    alvos.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= meio) atual = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) atual = alvos.length - 1;
    pontos.forEach(function (p, i) {
      p.classList.toggle('ativo', i === atual);
      p.classList.toggle('passou', i < atual);
    });
  }
  window.addEventListener('scroll', marcaTrilho, { passive: true });
  marcaTrilho();
  function checaScroll() {
    header.classList.toggle('rolou', window.scrollY > 10);
    /* barra de progresso de leitura */
    var total = document.documentElement.scrollHeight - window.innerHeight;
    var pct = total > 0 ? window.scrollY / total : 0;
    progresso.style.transform = 'scaleX(' + pct + ')';
    if (trilhoFill) trilhoFill.style.height = (pct * 100) + '%';
    /* botão do WhatsApp aparece depois do topo */
    document.body.classList.toggle('mostra-zap', window.scrollY > 500);
  }
  window.addEventListener('scroll', checaScroll, { passive: true });
  checaScroll();

  /* ── Menu mobile ── */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function fechaMenu() {
    nav.classList.remove('aberto');
    document.body.classList.remove('menu-aberto');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
  }
  burger.addEventListener('click', function () {
    var abrir = !nav.classList.contains('aberto');
    nav.classList.toggle('aberto', abrir);
    document.body.classList.toggle('menu-aberto', abrir);
    burger.setAttribute('aria-expanded', String(abrir));
    burger.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', fechaMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechaMenu(); });

  /* ── Link ativo no menu conforme a seção ── */
  var links = nav.querySelectorAll('a:not(.nav__cta)');
  var secoes = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute('href')); });
  function marcaMenu() {
    var meio = window.innerHeight * 0.45, atual = 0;
    secoes.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= meio) atual = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) atual = secoes.length - 1;
    links.forEach(function (a, i) { a.classList.toggle('ativo', i === atual); });
  }
  window.addEventListener('scroll', marcaMenu, { passive: true });
  marcaMenu();

  /* ── Mini gráfico do topo: troca o título junto com o redesenho (4s) ── */
  var rot = document.getElementById('fltRot');
  if (rot && !reduzido) {
    var titulos = ['Vendas', 'Novos clientes', 'Conversões', 'Faturamento'], t = 0;
    setInterval(function () {
      rot.classList.add('troca');
      setTimeout(function () {
        t = (t + 1) % titulos.length;
        rot.textContent = titulos[t];
        rot.classList.remove('troca');
      }, 300);
    }, 4000);
  }

  /* ══════════ EFEITOS ══════════ */

  /* 18 · Contador de números */
  function contar(el) {
    var alvo = parseFloat(el.dataset.alvo);
    var casas = (el.dataset.casas | 0);
    var sufixo = el.dataset.sufixo || '';
    if (reduzido) { el.textContent = alvo.toFixed(casas).replace('.', ',') + sufixo; return; }
    var dur = 1600, ini = null;
    function passo(t) {
      if (ini === null) ini = t;
      var p = Math.min(1, (t - ini) / dur);
      var suave = 1 - Math.pow(1 - p, 3);
      el.textContent = (alvo * suave).toFixed(casas).replace('.', ',') + sufixo;
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  /* 16 · Revelar palavra por palavra
     As palavras listadas na regex abaixo ficam em laranja. */
  function prepararSplit(el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (p) {
      var destaque = /^(encontrados|lembrados|escolhidos)/i.test(p);
      return '<span class="palavra' + (destaque ? ' destaque' : '') + '">' + p + '</span>';
    }).join(' ');
  }
  function revelarSplit(el) {
    el.querySelectorAll('.palavra').forEach(function (p, i) {
      setTimeout(function () { p.classList.add('dentro'); }, reduzido ? 0 : i * 70);
    });
  }
  document.querySelectorAll('.js-split').forEach(prepararSplit);

  /* 25 · Gráfico de barras — dados reais (fontes no rodapé do gráfico, no index.html)
     cinza:true = barra de contraste (oportunidade), em cinza */
  function montarBarras(area) {
    var dados = [
      { r: 'Visibilidade', v: 87 },              // BrightLocal 2023: usam o Google p/ achar negócios locais
      { r: 'Confiança', v: 84 },                 // Verisign 2015: site > só rede social
      { r: 'Preferem o site', v: 92 },           // Verisign 2015: preferem info no site
      { r: 'Pesquisam antes de comprar', v: 74 } // TNS, citado pelo Sebrae
    ];
    area.innerHTML = dados.map(function (d) {
      return '<div class="col' + (d.cinza ? ' cinza' : '') + '"><span class="val">0%</span>' +
        '<span class="poco"><span class="haste"></span></span><span class="rot">' + d.r + '</span></div>';
    }).join('');
    area.querySelectorAll('.col').forEach(function (col, i) {
      var haste = col.querySelector('.haste'), val = col.querySelector('.val');
      var alvo = dados[i].v;
      if (reduzido) { haste.style.height = alvo + '%'; val.textContent = alvo + '%'; return; }
      setTimeout(function () {
        haste.style.transition = 'height 1.1s cubic-bezier(.16,1,.3,1)';
        haste.style.height = alvo + '%';
        var ini = null;
        (function conta(t) {
          if (!ini) ini = t;
          var p = Math.min(1, (t - ini) / 1100);
          val.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3))) + '%';
          if (p < 1) requestAnimationFrame(conta);
        })(performance.now());
      }, i * 140);
    });
  }

  /* ── Disparo: tudo dentro de .animar roda quando aparece na tela ── */
  function rodar(bloco) {
    bloco.classList.add('run');
    bloco.querySelectorAll('.fx-count').forEach(contar);
    bloco.querySelectorAll('.js-split').forEach(revelarSplit);
    bloco.querySelectorAll('.js-barras').forEach(montarBarras);
  }

  var blocos = document.querySelectorAll('.animar');
  if (!('IntersectionObserver' in window)) { blocos.forEach(rodar); return; }

  var obs = new IntersectionObserver(function (itens, o) {
    itens.forEach(function (it) {
      if (!it.isIntersecting) return;
      rodar(it.target);
      o.unobserve(it.target); /* acontece uma vez só */
    });
  }, { threshold: 0.2 });
  blocos.forEach(function (b) { obs.observe(b); });
})();
