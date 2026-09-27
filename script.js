(function () {
  'use strict';

  /* ---------- filtros por categoría ---------- */
  var chips = document.querySelectorAll('.chip');
  var cards = document.querySelectorAll('.card');
  var empty = document.getElementById('empty');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');

      var f = chip.getAttribute('data-filter');
      var shown = 0;

      cards.forEach(function (card) {
        var match = (f === 'all') || (card.getAttribute('data-cat') === f);
        card.classList.toggle('is-hidden', !match);
        if (match) { shown++; }
      });

      if (empty) { empty.hidden = shown !== 0; }
    });
  });

  /* ---------- reveal al hacer scroll ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.card, .feat, .section-head, .cta h2, .cta p');

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('rv', 'in'); });
  } else {
    targets.forEach(function (el) { el.classList.add('rv'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- brillo que sigue al cursor en las tarjetas ---------- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ---------- contador animado ---------- */
  var nums = document.querySelectorAll('[data-count]');
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduce) { el.textContent = target; return; }
    var start = performance.now(), dur = 1100;
    (function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
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

  /* ---------- fallback de miniaturas ---------- */
  document.querySelectorAll('.card-media img').forEach(function (img) {
    img.addEventListener('error', function () { this.style.opacity = '0'; });
    if (img.complete && img.naturalWidth === 0) { img.style.opacity = '0'; }
  });
})();
