(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= marquee infinito ================= */
  /* clona la tanda para que el translateX(-100%) sea un bucle sin costura */
  var run = document.querySelector('.marquee-run');
  if (run) {
    for (var c = 0; c < 3; c++) {
      var clone = run.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a').forEach(function (a) { a.setAttribute('tabindex', '-1'); });
      run.parentNode.appendChild(clone);
    }
  }

  /* ================= filtros + buscador ================= */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var search = document.getElementById('q');
  var empty = document.getElementById('empty');
  var current = 'all';

  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

  function apply() {
    var term = norm(search ? search.value.trim() : '');
    var shown = 0;

    cards.forEach(function (card) {
      var catOk = (current === 'all') || (card.getAttribute('data-cat') === current);
      var textOk = !term || norm(card.getAttribute('data-name') + ' ' + card.textContent).indexOf(term) !== -1;
      var show = catOk && textOk;
      card.classList.toggle('is-hidden', !show);
      if (show) { shown++; }
    });

    if (empty) { empty.hidden = shown !== 0; }
    if (rail && rail.resetRail) { rail.resetRail(); }
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      current = chip.getAttribute('data-filter');
      apply();
    });
  });

  if (search) {
    var t;
    search.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(apply, 130);
    });
    search.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { search.value = ''; apply(); }
    });
  }

  /* ================= reveal al hacer scroll ================= */
  /* las tarjetas se revelan aparte, con el riel como raiz (horizontal) */
  var targets = document.querySelectorAll('.steps li, .feat, .section-head, .cta, .toolbar');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('rv', 'in'); });
  } else {
    targets.forEach(function (el) { el.classList.add('rv'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ================= brillo que sigue al cursor ================= */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ================= contador ================= */
  var nums = document.querySelectorAll('[data-count]');
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduce) { el.textContent = target; return; }
    var start = performance.now(), dur = 1200;
    (function step(now) {
      var p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) { requestAnimationFrame(step); }
    })(start);
  }
  if (nums.length) {
    if (!('IntersectionObserver' in window)) {
      nums.forEach(countUp);
    } else {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { countUp(e.target); io2.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      nums.forEach(function (n) { io2.observe(n); });
    }
  }

  /* ================= carrusel: arrastre, flechas y progreso ================= */
  var rail = document.getElementById('grid');
  var prevBtn = document.getElementById('railPrev');
  var nextBtn = document.getElementById('railNext');
  var track = document.getElementById('railThumb');

  if (rail) {
    /* En un riel horizontal el observador de ventana no sirve: las tarjetas de
       la derecha nunca "entran" y se quedan invisibles. Aqui la raiz es el riel,
       y ademas se comprueba a mano en cada scroll para que nada quede oculto. */
    rail.querySelectorAll('.card').forEach(function (c) { c.classList.add('rv'); });
    if (reduce || !('IntersectionObserver' in window)) {
      rail.querySelectorAll('.card').forEach(function (c) { c.classList.add('in'); });
    } else {
      var ioCards = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); ioCards.unobserve(e.target); }
        });
      }, { root: rail, rootMargin: '0px 70px 0px 70px', threshold: 0.12 });
      rail.querySelectorAll('.card').forEach(function (c) { ioCards.observe(c); });
    }

    function revealInRail() {
      var r = rail.getBoundingClientRect();
      var pend = rail.querySelectorAll('.card.rv:not(.in)');
      for (var i = 0; i < pend.length; i++) {
        var b = pend[i].getBoundingClientRect();
        if (b.right > r.left - 70 && b.left < r.right + 70) { pend[i].classList.add('in'); }
      }
    }
    rail.addEventListener('scroll', revealInRail, { passive: true });
    window.addEventListener('load', revealInRail);
    window.addEventListener('resize', revealInRail);
    revealInRail();

    /* red de seguridad: pase lo que pase, ninguna tarjeta se queda invisible */
    setTimeout(function () {
      rail.querySelectorAll('.card.rv:not(.in)').forEach(function (c) { c.classList.add('in'); });
    }, 3500);

    /* los <a> son arrastrables por defecto: el drag nativo cancela el puntero */
    rail.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* --- barra de progreso --- */
    function syncRail() {
      var max = rail.scrollWidth - rail.clientWidth;
      var ratio = max > 4 ? rail.scrollLeft / max : 0;
      if (track) {
        var w = Math.max(12, (max > 4 ? rail.clientWidth / rail.scrollWidth : 1) * 100);
        track.style.width = w + '%';
        track.style.transform = 'translateX(' + ((ratio * (100 - w)) / w * 100) + '%)';
      }
      if (prevBtn) { prevBtn.disabled = rail.scrollLeft <= 4; }
      if (nextBtn) { nextBtn.disabled = rail.scrollLeft >= max - 4; }
    }

    var rafPending = false;
    rail.addEventListener('scroll', function () {
      if (rafPending) { return; }
      rafPending = true;
      requestAnimationFrame(function () { rafPending = false; syncRail(); });
    }, { passive: true });

    window.addEventListener('resize', syncRail);
    window.addEventListener('load', syncRail);
    syncRail();

    /* --- flechas: avanzan un ancho de tarjeta --- */
    function step(dir) {
      var first = rail.querySelector('.card:not(.is-hidden)');
      var amount = first ? first.getBoundingClientRect().width + 18 : rail.clientWidth * 0.8;
      var max = rail.scrollWidth - rail.clientWidth;
      rail.scrollTo({ left: Math.max(0, Math.min(max, rail.scrollLeft + dir * amount)), behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prevBtn) { prevBtn.addEventListener('click', function () { step(-1); }); }
    if (nextBtn) { nextBtn.addEventListener('click', function () { step(1); }); }

    /* --- arrastre con mouse (en celular el deslizamiento es nativo) --- */
    var dragging = false, startX = 0, startLeft = 0, moved = 0, lastPos = 0, offsets = null;

    function cardOffsets() {
      var railRect = rail.getBoundingClientRect();
      var list = rail.querySelectorAll('.card:not(.is-hidden)');
      var out = [];
      for (var i = 0; i < list.length; i++) {
        out.push(list[i].getBoundingClientRect().left - railRect.left + rail.scrollLeft);
      }
      return out;
    }

    function nearest(pos) {
      var max = rail.scrollWidth - rail.clientWidth;
      var best = 0, bestD = Infinity;
      for (var i = 0; i < offsets.length; i++) {
        var d = Math.abs(offsets[i] - pos);
        if (d < bestD) { bestD = d; best = offsets[i]; }
      }
      return Math.max(0, Math.min(max, best));
    }

    rail.addEventListener('mousedown', function (e) {
      if (e.button !== 0) { return; }
      dragging = true; moved = 0;
      startX = e.clientX; startLeft = rail.scrollLeft; lastPos = startLeft;
      offsets = cardOffsets();
      rail.classList.add('is-dragging');
      /* evita el arrastre nativo del <a> y la seleccion de texto */
      e.preventDefault();
    });

    window.addEventListener('mousemove', function (e) {
      if (!dragging) { return; }
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 3) { moved = Math.max(moved, Math.abs(dx)); }
      lastPos = startLeft - dx;
      rail.scrollLeft = lastPos;
    });

    var settleTimer;
    window.addEventListener('mouseup', function () {
      if (!dragging) { return; }
      dragging = false;
      if (moved > 6) {
        /* el snap se apaga ANTES de soltar is-dragging, si no gana el navegador */
        rail.classList.add('is-settling');
        rail.classList.remove('is-dragging');
        var target = nearest(lastPos);
        rail.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' });
        clearTimeout(settleTimer);
        settleTimer = setTimeout(function () {
          rail.classList.remove('is-settling');
          syncRail();
        }, reduce ? 0 : 450);
      } else {
        rail.classList.remove('is-dragging');
        syncRail();
      }
    });

    /* un arrastre no debe abrir el sitio */
    rail.addEventListener('click', function (e) {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    /* --- al filtrar, vuelve al inicio --- */
    rail.resetRail = function () {
      rail.scrollTo({ left: 0, behavior: 'auto' });
      setTimeout(syncRail, 60);
    };
  }

  /* ================= miniaturas: fallback al gradiente ================= */
  document.querySelectorAll('img').forEach(function (img) {
    function fail() { img.style.opacity = '0'; }
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) { fail(); }
  });
})();
