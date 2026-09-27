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
  var targets = document.querySelectorAll('.card, .steps li, .feat, .section-head, .cta, .toolbar');
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

  /* ================= miniaturas: fallback al gradiente ================= */
  document.querySelectorAll('img').forEach(function (img) {
    function fail() { img.style.opacity = '0'; }
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) { fail(); }
  });
})();
