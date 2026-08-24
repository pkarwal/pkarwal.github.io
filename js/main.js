(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky nav scroll state
  var nav = document.getElementById('site-nav');
  if (nav) {
    var setScrolled = function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  // Mobile nav toggle
  var toggle = document.getElementById('nav-toggle');
  var mobileMenu = document.getElementById('nav-mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scroll reveal — content is visible by default ;
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && !reduceMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-ready');

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });

    // Safety net: force-reveal anything the observer hasn't caught within 2s
    // (covers any edge case where a section never registers as intersecting).
    window.setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
    }, 2000);
  }

  var numberEls = document.querySelectorAll('.number-value');
  if (numberEls.length && !reduceMotion && window.requestAnimationFrame && document.visibilityState === 'visible') {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute('data-count-to'));
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var isDecimal = String(target).indexOf('.') !== -1;
      var finalText = prefix + target + suffix;
      var start = null;
      var duration = 800;
      var done = false;

      function finish() {
        if (done) return;
        done = true;
        el.textContent = finalText;
        document.removeEventListener('visibilitychange', onVisChange);
      }

      function onVisChange() {
        if (document.visibilityState !== 'visible') finish();
      }
      document.addEventListener('visibilitychange', onVisChange);

      function step(timestamp) {
        if (done) return;
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var current = target * progress;
        el.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          finish();
        }
      }
      window.requestAnimationFrame(step);
    };

    numberEls.forEach(animateCount);
  }
})();
