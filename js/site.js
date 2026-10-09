// Cinders Wood Fired Pizza — small behaviors: phone menu, review slider,
// the scroll-driven motion Wix applies to the Happy Hour band and the pizza
// slices, and a nudge for the background videos.
(function () {
  // Phone navigation overlay.
  var nav = document.querySelector('.mnav');
  var burger = document.querySelector('.hdr__burger');
  if (nav && burger) {
    burger.addEventListener('click', function () { nav.classList.add('is-open'); });
    nav.querySelector('.mnav__close').addEventListener('click', function () { nav.classList.remove('is-open'); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('is-open'); }); });
  }

  // Review slider: fades between reviews every 7s, arrows step through.
  var slides = document.querySelectorAll('.said__slide');
  if (slides.length) {
    var m = slides.length, j = 0, t2;
    function show(k) { slides[j].classList.remove('is-on'); j = (k + m) % m; slides[j].classList.add('is-on'); }
    function arm() { clearInterval(t2); t2 = setInterval(function () { show(j + 1); }, 7000); }
    document.querySelector('.said__prev').addEventListener('click', function () { show(j - 1); arm(); });
    document.querySelector('.said__next').addEventListener('click', function () { show(j + 1); arm(); });
    arm();
  }

  // Scroll-driven motion. Wix moves these as the section travels up the screen:
  // progress 0 = section top at the bottom of the viewport, 1 = section top at the top.
  var rem = function () { return parseFloat(getComputedStyle(document.documentElement).fontSize); };
  function progress(el) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    return Math.max(0, Math.min(1, (vh - r.top) / vh));
  }
  var hh = document.querySelector('.hh');
  var intro = document.querySelector('.intro');
  var sliceEls = intro ? intro.querySelectorAll('.intro__slices img') : [];
  var wheel = intro ? intro.querySelector('.intro__wheel') : null;
  var hhSlide = hh ? hh.querySelectorAll('.hh__slide') : [];
  var hhSlice = hh ? hh.querySelector('.hh__slice') : null;
  var phone = function () { return window.innerWidth <= 750; };
  function ease(p) { return 1 - Math.pow(1 - p, 3); }
  function tick() {
    if (hh) {
      var p = ease(Math.max(0, Math.min(1, (progress(hh) - 0.25) / 0.45))); // starts once the band is a quarter in, settles at 70%
      var dx = (1 - p) * -520;                                   // Happy Hour copy + paddle slide in from the left
      hhSlide.forEach(function (el) { el.style.transform = 'translateX(' + dx + 'rem)'; });
      if (hhSlice) {                                             // the slice rides in with the pie, then shoots out as you scroll on
        var q = Math.max(0, Math.min(1, (progress(hh) - 0.55) / 0.4)), a = (+hhSlice.dataset.ang) * Math.PI / 180;
        var reach = phone() ? 320 : 700, qe = q * q;
        hhSlice.style.transform = 'translate(' + (dx + Math.cos(a) * reach * qe) + 'rem,' + (Math.sin(a) * reach * qe) + 'rem) rotate(' + (60 * q) + 'deg)';
      }
    }
    if (intro) {
      // The eight slices form a whole pie when the section sits mid-screen (progress ~0.75) and
      // spin apart above and below that point, so they assemble and come apart in both directions.
      var p = progress(intro), c = 0.75, t = Math.min(1, Math.abs(p - c) / 0.45), te = ease(t);
      var dir = p < c ? -1 : 1, ph = phone(), reach = ph ? 150 : 170;
      wheel.style.transform = 'rotate(' + (-300 * (p - c)) + 'deg)';
      sliceEls.forEach(function (im) {
        var a = (+im.dataset.ang) * Math.PI / 180;
        im.style.transform = 'translate(' + (Math.cos(a) * reach * te) + 'rem,' + (Math.sin(a) * reach * te) + 'rem) rotate(' + ((+im.dataset.rot) + dir * 140 * te) + 'deg)';
      });
    }
  }
  function lerp2(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  var pending = false;
  function onScroll() { if (!pending) { pending = true; requestAnimationFrame(function () { pending = false; tick(); }); } }
  if (hh || intro) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    tick();
  }
})();

// Background videos: browsers sometimes block autoplay until the page is touched.
(function () {
  var vids = document.querySelectorAll('video');
  function play() { vids.forEach(function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }); }
  play();
  ['click', 'touchstart', 'scroll', 'keydown'].forEach(function (ev) { window.addEventListener(ev, play, { once: true, passive: true }); });
})();
