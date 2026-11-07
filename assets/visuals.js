(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionButton = document.getElementById('motion-toggle');
  const heroWidget = document.getElementById('hero-widget');
  const heroPhoto = document.getElementById('hero-widget-photo');
  const nextHeroPhoto = document.getElementById('hero-widget-photo-next');
  const heroCaption = document.getElementById('hero-widget-caption');
  const widgetEmojisContainer = document.getElementById('widget-emojis');
  const collage = document.querySelector('.collage');
  const phoneApps = document.querySelectorAll('.phone-app');

  let paused = reduced.matches;
  let photoIndex = 1;
  let visiblePhoto = heroPhoto;
  let hiddenPhoto = nextHeroPhoto;
  let photoSwapInProgress = false;

  // --- 1. CLICK EMOJIS (Particle Burst on Click) ---
  const clickEmojiList = ["❤️", "🔥", "😂", "😍", "🥰", "😊", "✨", "🎉", "😄", "😆", "💕", "💖", "💯", "🙌", "🤩", "⭐", "💫", "👀", "😎", "😁"];
  const clickLayer = document.getElementById('click-emojis-layer');
  let recentClickedEmojis = [];

  function randRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function handleDesktopClick(event) {
    if (paused || !desktopPointer.matches || !clickLayer) return;
    // Don't trigger if clicked on interactive elements
    let target = event.target;
    while (target && target !== document.body) {
      const tag = target.tagName;
      if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'SUMMARY' || target.dataset.noEmoji !== undefined || target.closest('.account-modal')) {
        return;
      }
      target = target.parentElement;
    }

    const available = clickEmojiList.filter(e => !recentClickedEmojis.includes(e));
    const chosenEmoji = available[Math.floor(Math.random() * available.length)] || clickEmojiList[0];
    recentClickedEmojis.push(chosenEmoji);
    if (recentClickedEmojis.length > 3) recentClickedEmojis.shift();

    const count = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.className = 'click-emoji-particle';
      span.textContent = chosenEmoji;
      const size = randRange(26, 42);
      const startX = event.clientX + randRange(-16, 16);
      const startY = event.clientY;
      const driftX = randRange(-48, 48);
      const duration = randRange(1400, 2200);
      const delay = i * randRange(50, 140);

      span.style.left = startX + 'px';
      span.style.top = startY + 'px';
      span.style.fontSize = size + 'px';
      clickLayer.appendChild(span);

      if (span.animate) {
        const anim = span.animate([
          { transform: 'translate(-50%, -50%) translate3d(0, 0, 0) scale(0.35)', opacity: 0, filter: 'blur(8px)' },
          { opacity: 0.95, filter: 'blur(0px)', offset: 0.12 },
          { opacity: 0.9, filter: 'blur(0px)', offset: 0.75 },
          { transform: `translate(-50%, -50%) translate3d(${driftX}px, -290px, 0) scale(0.8)`, opacity: 0, filter: 'blur(6px)', offset: 1 }
        ], {
          duration: duration,
          delay: delay,
          easing: 'cubic-bezier(0, 0, 0.2, 1)',
          fill: 'forwards'
        });
        anim.onfinish = function () { span.remove(); };
      } else {
        setTimeout(function () { span.remove(); }, duration + delay);
      }
    }
  }
  document.addEventListener('click', handleDesktopClick);

  // --- 2. PHONE WIDGET AUTO-ROTATION WITH FLYING EMOJIS & APP SQUISH ---
  const captions = ['good-morning', 'sunset-time', 'hiiiiii', 'austin-tx', 'miss-you', 'weather-62f'];
  const widgetEmojiSets = [
    ["☀️", "🤎", "😎"],
    ["🌅", "🧡", "😍"],
    ["✨", "💙", "😘"],
    ["🥂", "💜", "😍"],
    ["🌳", "💚", "👟"],
    ["🌊", "🩵", "😂"],
    ["🌼", "💛", "🥰"],
    ["⛵", "🤍", "😎"]
  ];
  const widgetEmojiSpawns = [
    { x: 12, d: 0, s: 20 },
    { x: 68, d: 0.1, s: 24 },
    { x: 32, d: 0.25, s: 18 },
    { x: 84, d: 0.4, s: 22 },
    { x: 20, d: 0.5, s: 23 },
    { x: 55, d: 0.65, s: 19 },
    { x: 76, d: 0.8, s: 20 },
    { x: 42, d: 0.95, s: 25 }
  ];

  function triggerFlyingEmojis(setIndex) {
    if (!widgetEmojisContainer || paused) return;
    const emojiSet = widgetEmojiSets[setIndex % widgetEmojiSets.length];
    widgetEmojiSpawns.forEach(function (sp, i) {
      const emoji = emojiSet[i % emojiSet.length];
      const span = document.createElement('span');
      span.className = 'widget-fly-emoji';
      span.textContent = emoji;
      span.style.left = sp.x + '%';
      span.style.fontSize = sp.s + 'px';
      span.style.animationDelay = (0.7 + sp.d) + 's';
      widgetEmojisContainer.appendChild(span);
      setTimeout(function () { span.remove(); }, 2600);
    });
  }

  function triggerAppSquish() {
    if (paused || !phoneApps.length) return;
    const delays = [0.05, 0.12, 0.22, 0.15, 0.22, 0.32, 0.2, 0.28, 0.38, 0.26, 0.34, 0.42];
    phoneApps.forEach(function (app, idx) {
      app.classList.remove('squish');
      void app.offsetWidth;
      app.style.animationDelay = (delays[idx % delays.length]) + 's';
      app.classList.add('squish');
    });
  }

  async function nextPhoto() {
    if (photoSwapInProgress || !visiblePhoto || !hiddenPhoto) return;
    photoSwapInProgress = true;
    const nextIndex = photoIndex % 8 + 1;
    hiddenPhoto.src = './assets/uplocket/index/bubbles/widget-' + nextIndex + '.webp';
    try { if (hiddenPhoto.decode) await hiddenPhoto.decode(); } catch (_) {}
    hiddenPhoto.classList.add('is-active');
    visiblePhoto.classList.remove('is-active');

    // Update caption if available
    if (heroCaption) {
      const cap = captions[nextIndex % captions.length];
      heroCaption.src = './assets/uplocket/index/captions/' + cap + '.webp';
    }

    // Trigger reactions
    triggerFlyingEmojis(nextIndex - 1);
    triggerAppSquish();

    const previousPhoto = visiblePhoto;
    visiblePhoto = hiddenPhoto;
    hiddenPhoto = previousPhoto;
    photoIndex = nextIndex;
    photoSwapInProgress = false;
  }
  if (heroWidget) heroWidget.addEventListener('click', nextPhoto);

  // --- 3. 3D PERSPECTIVE TILT ON COLLAGE ---
  function resetCollageTilt() {
    if (!collage) return;
    collage.style.setProperty('--tilt-x', '0deg');
    collage.style.setProperty('--tilt-y', '0deg');
  }
  function moveCollage(event) {
    if (!collage || paused) return;
    const rect = collage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    collage.style.setProperty('--tilt-x', (x * 2.6).toFixed(2) + 'deg');
    collage.style.setProperty('--tilt-y', (y * -2.2).toFixed(2) + 'deg');
  }
  if (collage && desktopPointer.matches && !reduced.matches) {
    collage.addEventListener('pointermove', moveCollage, { passive: true });
    collage.addEventListener('pointerleave', resetCollageTilt, { passive: true });
  }

  // --- 4. HERO ENTRANCE EXPLOSION & SCROLL DISPERSION ---
  const floatingElements = [
    { selector: '.photo-one', l: 16, t: 20, dur: 0.75, delay: 0.18 },
    { selector: '.photo-two', l: 94, t: 15, dur: 0.95, delay: 0.04 },
    { selector: '.photo-three', l: 1, t: 76, dur: 0.70, delay: 0.12 },
    { selector: '.photo-four', l: 79, t: 73, dur: 0.70, delay: 0.26 },
    { selector: '.heart-sticker', l: 5, t: 9, dur: 0.80, delay: 0.10 },
    { selector: '.bff', l: 2, t: 45, dur: 0.90, delay: 0.00 },
    { selector: '.love-sticker', l: 74, t: 4, dur: 0.80, delay: 0.08 },
    { selector: '.gold-sticker', l: 78, t: 35, dur: 0.75, delay: 0.20 },
    { selector: '.sparkle', l: 23, t: 62, dur: 0.70, delay: 0.22 },
    { selector: '.tiny-heart', l: 95, t: 55, dur: 0.80, delay: 0.06 },
    { selector: '.name-sticker', l: 90, t: 83, dur: 0.75, delay: 0.28 },
    { selector: '.hero-ticket', l: 52, t: 63, dur: 0.85, delay: 0.14 }
  ];

  if (!reduced.matches) {
    // Initial explosion animation on load
    floatingElements.forEach(function (item) {
      const el = document.querySelector(item.selector);
      if (!el || !el.animate) return;
      const offsetX = (50 - item.l) * 0.75;
      const offsetY = (50 - item.t) * 0.75;
      el.animate([
        { transform: `translate(${offsetX}vw, ${offsetY}vh) scale(0.15)`, opacity: 0 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 }
      ], {
        duration: item.dur * 1000,
        delay: item.delay * 1000,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'both'
      });
    });

    const phoneEl = document.querySelector('.phone');
    if (phoneEl && phoneEl.animate) {
      phoneEl.animate([
        { transform: 'scale(0.45) rotate(-14deg)', opacity: 0 },
        { transform: 'scale(1) rotate(-8deg)', opacity: 1 }
      ], {
        duration: 1000,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'both'
      });
    }

    // Scroll dispersion parallax: bubbles spread outward and fade on scroll
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking || paused) return;
      ticking = true;
      requestAnimationFrame(function () {
        const scrollY = window.scrollY;
        const heroH = window.innerHeight * 0.8;
        const progress = Math.min(1, Math.max(0, scrollY / heroH));

        if (progress > 0 && progress < 1) {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          floatingElements.forEach(function (item) {
            const el = document.querySelector(item.selector);
            if (!el) return;
            const dispX = (progress * (item.l - 50) * 0.18 * vw) / 100;
            const dispY = (progress * (item.t - 50) * 0.18 * vh) / 100;
            const opacity = Math.max(0, 1 - progress * 1.25);
            el.style.transform = `translate3d(${dispX.toFixed(1)}px, ${dispY.toFixed(1)}px, 0)`;
            el.style.opacity = opacity.toFixed(2);
          });
        } else if (progress === 0) {
          floatingElements.forEach(function (item) {
            const el = document.querySelector(item.selector);
            if (!el) return;
            el.style.transform = '';
            el.style.opacity = '';
          });
        }
        ticking = false;
      });
    }, { passive: true });
  }

  // --- 5. NAVBAR GLIDING PILL WITH MOTION BLUR ---
  const navElement = document.getElementById('navigation');
  const navPill = document.getElementById('nav-pill');
  const blurElement = document.getElementById('nav-blur-elem');

  if (navElement && navPill && desktopPointer.matches) {
    let lastX = 0;
    let lastTime = 0;
    let blurTimeout;

    const navLinks = navElement.querySelectorAll('a');
    navLinks.forEach(function (link) {
      link.addEventListener('pointerenter', function () {
        if (paused) return;
        const rect = link.getBoundingClientRect();
        const navRect = navElement.getBoundingClientRect();
        const now = performance.now();
        const currentX = rect.left - navRect.left;
        const dt = Math.max(1, now - lastTime);
        const velocity = (currentX - lastX) / dt;

        // Apply motion blur
        if (blurElement && lastTime > 0) {
          const blurX = Math.min(Math.abs(velocity) * 2.2, 10).toFixed(2);
          if (parseFloat(blurX) > 0.4) {
            blurElement.setAttribute('stdDeviation', `${blurX} 0`);
            navPill.style.filter = 'url(#nav-pill-motion-blur)';
            clearTimeout(blurTimeout);
            blurTimeout = setTimeout(function () {
              blurElement.setAttribute('stdDeviation', '0 0');
              navPill.style.filter = 'none';
            }, 90);
          }
        }

        lastX = currentX;
        lastTime = now;

        navPill.style.left = (link.offsetLeft) + 'px';
        navPill.style.top = (link.offsetTop) + 'px';
        navPill.style.width = (link.offsetWidth) + 'px';
        navPill.style.height = (link.offsetHeight) + 'px';
        navPill.style.opacity = '1';
      });
    });

    navElement.addEventListener('pointerleave', function () {
      navPill.style.opacity = '0';
      if (blurElement) blurElement.setAttribute('stdDeviation', '0 0');
      navPill.style.filter = 'none';
      lastTime = 0;
    });
  }

  // --- 6. SHORTCUTS SECTION CARDS (Mobile Scroll-InView Trigger) ---
  const shortcutCards = document.querySelectorAll('.shortcut-card');
  if (shortcutCards.length && 'IntersectionObserver' in window) {
    const cardObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
        } else {
          entry.target.classList.remove('is-inview');
        }
      });
    }, { threshold: 0.35 });

    shortcutCards.forEach(function (card) {
      cardObserver.observe(card);
    });
  }

  // --- 7. LIVE RECENT UPGRADES TOAST NOTIFICATION ---
  const upgradeToast = document.getElementById('upgrade-toast');
  const toastAv = document.getElementById('upgrade-toast-av');
  const toastName = document.getElementById('upgrade-toast-name');
  const toastText = document.getElementById('upgrade-toast-text');
  const toastTime = document.getElementById('upgrade-toast-time');
  const toastClose = document.getElementById('upgrade-toast-close');

  const simulatedUpgrades = [
    { name: 'Thảo Linh', plan: 'Locket Gold 1 Năm', time: 'vừa xong', av: 'L' },
    { name: 'Tuấn Anh', plan: 'VIP Trọn Đời', time: '1 phút trước', av: 'A' },
    { name: 'Phương Uyên', plan: 'Locket Gold 1 Năm', time: 'vừa xong', av: 'U' },
    { name: 'Hoàng Nam', plan: 'VIP Trọn Đời', time: '2 phút trước', av: 'N' },
    { name: 'Minh Thư', plan: 'Gói dùng thử 3 ngày', time: 'vừa xong', av: 'T' }
  ];

  let upgradeIndex = 0;
  let upgradeTimer;
  let upgradeDismissed = false;

  try {
    if (sessionStorage.getItem('gold-toast-dismissed') === '1') {
      upgradeDismissed = true;
    }
  } catch (_) {}

  function showNextUpgrade() {
    if (upgradeDismissed || !upgradeToast || paused || document.hidden) return;
    const up = simulatedUpgrades[upgradeIndex % simulatedUpgrades.length];
    upgradeIndex++;

    toastAv.textContent = up.av;
    toastName.textContent = up.name;
    toastText.textContent = 'vừa nâng cấp ' + up.plan;
    toastTime.textContent = up.time;

    upgradeToast.hidden = false;
    upgradeToast.classList.remove('is-hiding');

    setTimeout(function () {
      if (!upgradeToast.hidden) {
        upgradeToast.classList.add('is-hiding');
        setTimeout(function () {
          upgradeToast.hidden = true;
          upgradeToast.classList.remove('is-hiding');
        }, 350);
      }
    }, 4500);
  }

  if (toastClose) {
    toastClose.addEventListener('click', function () {
      upgradeDismissed = true;
      try { sessionStorage.setItem('gold-toast-dismissed', '1'); } catch (_) {}
      upgradeToast.classList.add('is-hiding');
      setTimeout(function () { upgradeToast.hidden = true; }, 350);
      clearInterval(upgradeTimer);
    });
  }

  if (!upgradeDismissed) {
    setTimeout(function () {
      showNextUpgrade();
      upgradeTimer = setInterval(showNextUpgrade, 9500);
    }, 4000);
  }

  // --- 8. MOTION TOGGLE & ACCESSIBILITY ---
  function updateMotion() {
    document.body.classList.toggle('motion-paused', paused);
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.textContent = paused ? 'Bật chuyển động' : 'Tạm dừng chuyển động';
    }
    if (paused) resetCollageTilt();
  }
  if (motionButton) {
    motionButton.hidden = false;
    motionButton.addEventListener('click', function () {
      paused = !paused;
      updateMotion();
    });
  }
  updateMotion();

  // Widget auto-timer: every 3.8 seconds
  const photoTimer = setInterval(function () {
    if (!paused && !document.hidden) nextPhoto();
  }, 3800);
  window.addEventListener('pagehide', function (event) {
    if (!event.persisted) {
      clearInterval(photoTimer);
      clearInterval(upgradeTimer);
    }
  });

  function motionPreferenceChanged(event) {
    paused = event.matches;
    updateMotion();
  }
  if (reduced.addEventListener) reduced.addEventListener('change', motionPreferenceChanged);
  else reduced.addListener(motionPreferenceChanged);

  // --- 9. SCROLL REVEALS FOR SECTIONS ---
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll('.section-heading, .price-card, .download-card, .guide-step, .shortcut-card');
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -28px 0px' });

    revealTargets.forEach(function (target, index) {
      target.classList.add('motion-reveal');
      target.style.setProperty('--reveal-delay', (index % 4 * 85) + 'ms');
      revealObserver.observe(target);
    });
  }

  // --- 10. LENIS SMOOTH SCROLLING ---
  if (window.Lenis && !reduced.matches && window.matchMedia('(hover: hover)').matches) {
    const lenis = new window.Lenis({
      smoothWheel: true,
      lerp: 0.1,
      prevent: function (node) { return !!node.closest('.account-modal'); }
    });
    let destroyed = false;
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    const observer = new MutationObserver(function () {
      if (document.body.classList.contains('modal-open')) lenis.stop();
      else lenis.start();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('click', function (event) {
      if (destroyed || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href^="#"]');
      if (!link || !link.hash || link.hash === '#') return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -24 });
      history.pushState(null, '', link.hash);
    });
    function destroyScroll() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      lenis.destroy();
    }
    window.addEventListener('pagehide', function (event) { if (!event.persisted) destroyScroll(); });
    function stopForReducedMotion(event) { if (event.matches) destroyScroll(); }
    if (reduced.addEventListener) reduced.addEventListener('change', stopForReducedMotion, { once: true });
    else reduced.addListener(stopForReducedMotion);
  }

  // --- 11. FRAMES LIBRARY ---
  const frames = window.LocketFrames;
  if (!Array.isArray(frames) || !frames.length) return;
  const gallery = document.getElementById('frame-gallery');
  const input = document.getElementById('frame-search');
  const more = document.getElementById('frame-more');
  const preview = document.getElementById('preview-frame');
  const overlay = document.getElementById('preview-overlay');
  const download = document.getElementById('frame-download');
  let limit = 8;
  let selectedId = '';
  function normalize(text) { return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function selectFrame(frame) {
    selectedId = frame.id;
    overlay.src = frame.src; overlay.hidden = false; preview.classList.add('has-art-frame');
    document.getElementById('frame-selected-label').textContent = frame.name;
    download.href = frame.src; download.download = frame.src.split('/').pop(); download.hidden = false;
    gallery.querySelectorAll('.frame-choice').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.frameId === frame.id)); });
    document.querySelectorAll('.theme-button').forEach(function (button) { button.classList.remove('active'); button.setAttribute('aria-pressed', 'false'); });
  }
  function renderFrames() {
    const query = normalize(input.value.trim());
    const filtered = frames.filter(function (frame) { return normalize(frame.name).includes(query); });
    const visible = filtered.slice(0, limit);
    const fragment = document.createDocumentFragment();
    visible.forEach(function (frame) {
      const button = document.createElement('button'); button.className = 'frame-choice'; button.type = 'button'; button.dataset.frameId = frame.id;
      button.setAttribute('aria-label', 'Xem thử khung ' + frame.name); button.setAttribute('aria-pressed', String(frame.id === selectedId));
      const image = document.createElement('img'); image.src = frame.src; image.alt = ''; image.width = 160; image.height = 160; image.loading = 'lazy'; image.decoding = 'async';
      const label = document.createElement('span'); label.textContent = frame.name; button.title = frame.name;
      button.append(image, label); button.addEventListener('click', function () { selectFrame(frame); }); fragment.appendChild(button);
    });
    gallery.textContent = ''; gallery.appendChild(fragment);
    document.getElementById('frame-count').textContent = 'Đang hiện ' + visible.length + '/' + filtered.length + ' khung · ' + frames.length + ' khung trong thư viện';
    document.getElementById('frame-empty').hidden = filtered.length !== 0;
    more.hidden = filtered.length <= limit;
  }
  input.addEventListener('input', function () { limit = 8; renderFrames(); });
  more.addEventListener('click', function () { limit += 8; renderFrames(); if (more.hidden) gallery.lastElementChild.focus(); });
  document.querySelectorAll('.theme-button').forEach(function (button) { button.addEventListener('click', function () {
    selectedId = ''; overlay.hidden = true; preview.classList.remove('has-art-frame'); download.hidden = true;
    document.getElementById('frame-selected-label').textContent = '';
    gallery.querySelectorAll('.frame-choice').forEach(function (choice) { choice.setAttribute('aria-pressed', 'false'); });
  }); });
  document.getElementById('frame-library').hidden = false;
  selectFrame(frames[0]); renderFrames();
}());
