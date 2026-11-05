/* ══════════════════════════════════════════
   SEU SITE AQUI — interações
   ══════════════════════════════════════════ */
(function () {
  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Ano no rodapé ── */
  document.getElementById('ano').textContent = new Date().getFullYear();

  /* ── Elementos ── */
  var header = document.querySelector('.header');
  var progresso = document.getElementById('progresso');
  var trilhoFill = document.getElementById('trilhoFill');
  var anoLat = document.getElementById('anoLateral');
  if (anoLat) anoLat.textContent = new Date().getFullYear();
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  /* Lateral esquerda (só telas largas) */
  var pontos = document.querySelectorAll('.trilho--esq a');
  var alvos = Array.prototype.map.call(pontos, function (a) { return document.getElementById(a.dataset.sec); });
  var mqLateral = window.matchMedia('(min-width:1560px)');
  var mqMobile = window.matchMedia('(max-width:860px)');

  /* Links do menu */
  var links = nav.querySelectorAll('a:not(.nav__cta)');
  var secoes = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute('href')); });

  function secaoAtual(lista) {
    var meio = window.innerHeight * 0.45, atual = 0;
    for (var i = 0; i < lista.length; i++) {
      if (lista[i] && lista[i].getBoundingClientRect().top <= meio) atual = i;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) atual = lista.length - 1;
    return atual;
  }

  /* ── Um único handler de rolagem, no máximo 1x por quadro ── */
  var ultimoY = window.scrollY, agendado = false;
  function aoRolar() {
    agendado = false;
    var y = window.scrollY;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    var pct = total > 0 ? y / total : 0;

    header.classList.toggle('rolou', y > 10);
    progresso.style.transform = 'scaleX(' + pct + ')';
    document.body.classList.toggle('mostra-zap', y > 500);

    /* celular: menu some ao descer e volta ao subir */
    if (mqMobile.matches && !nav.classList.contains('aberto')) {
      if (y > ultimoY + 6 && y > 140) header.classList.add('escondido');
      else if (y < ultimoY - 6 || y <= 140) header.classList.remove('escondido');
    } else {
      header.classList.remove('escondido');
    }
    ultimoY = y;

    var a = secaoAtual(secoes);
    links.forEach(function (l, i) { l.classList.toggle('ativo', i === a); });

    if (mqLateral.matches) {
      if (trilhoFill) trilhoFill.style.height = (pct * 100) + '%';
      var t = secaoAtual(alvos);
      pontos.forEach(function (p, i) {
        p.classList.toggle('ativo', i === t);
        p.classList.toggle('passou', i < t);
      });
    }
  }
  function pedeQuadro() { if (!agendado) { agendado = true; requestAnimationFrame(aoRolar); } }
  window.addEventListener('scroll', pedeQuadro, { passive: true });
  window.addEventListener('resize', pedeQuadro);
  aoRolar();

  /* ── Menu mobile ── */
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
    header.classList.remove('escondido');
    burger.setAttribute('aria-expanded', String(abrir));
    burger.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', fechaMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechaMenu(); });

  /* ── Pausa as animações do topo quando ele sai da tela (economiza bateria/CPU) ── */
  var hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (itens) {
      hero.classList.toggle('pausado', !itens[0].isIntersecting);
    }).observe(hero);
  }

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
