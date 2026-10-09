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
      if (hhSlice) {                                             // the loose slice drifts toward the pizza, then off to the right
        var q = progress(hh);
        var from = phone() ? [-120, 0] : [-762, 93], mid = [0, 0], to = phone() ? [220, -30] : [529, -19];
        var pos = q < 0.6 ? lerp2(from, mid, ease(q / 0.6)) : lerp2(mid, to, (q - 0.6) / 0.4);
        hhSlice.style.transform = 'translate(' + pos[0] + 'rem,' + pos[1] + 'rem)';
      }
    }
    if (intro) {
      // The slice cluster spins like a wheel as the page scrolls (about a third of a turn per
      // 100px), and the slices drift outward from the center as the section comes into view.
      var r = intro.getBoundingClientRect(), vh = window.innerHeight;
      var travelled = vh - r.top;                                  // px the section has climbed into view
      wheel.style.transform = 'rotate(' + (-0.3 * travelled) + 'deg)';
      var pi = ease(progress(intro)), ph = phone(), reach = ph ? 70 : 120;
      var cx = ph ? 154 : 150, cy = ph ? 151 : 138;               // cluster center, in rem
      sliceEls.forEach(function (im) {
        var st = im.style, d = im.dataset;
        var x = +getComputedStyle(im).getPropertyValue(ph ? '--px' : '--dx') + (+getComputedStyle(im).getPropertyValue(ph ? '--pw' : '--dw')) / 2;
        var y = +getComputedStyle(im).getPropertyValue(ph ? '--py' : '--dy') + (+getComputedStyle(im).getPropertyValue(ph ? '--ph' : '--dh')) / 2;
        var ang = Math.atan2(y - cy, x - cx);
        st.transform = 'translate(' + (Math.cos(ang) * reach * pi) + 'rem,' + (Math.sin(ang) * reach * pi) + 'rem) rotate(' + getComputedStyle(im).getPropertyValue('--rot') + 'deg)';
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
