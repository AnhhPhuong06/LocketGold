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


  // Independent photo, entrance, drift and scroll layers avoid transform conflicts.
  const heroAnimations = [];
  const avatar = document.getElementById('hero-widget-avatar');
  const captions = ['good-morning', 'sunset-time', null, 'austin-tx', null, null, null, null];
  const captionWidths = { 'good-morning': 68.8, 'sunset-time': 47.6, 'austin-tx': 56.24 };
  const avatars = ['michid','ava','laurel','karima','matt','ava','mika','kyle'];
  const reactions = [['☀️','🤎','😎'],['🌅','🧡','😍'],['✨','💙','😘'],['🥂','💜','😍'],['🌳','💚','👟'],['🌊','🩵','😂'],['🌼','💛','🥰'],['⛵','🤍','😎']];
  const reactionPositions = [[12,0,24],[68,.1,28],[32,.25,22],[84,.4,26],[20,.5,27],[55,.65,22],[76,.8,24],[42,.95,30]];
  let widgetRevealed = reduced.matches;
  let photoTimer;
  let disposed = false;
  if (heroWidget) heroWidget.hidden = !widgetRevealed;

  function animateElement(element, frames, options) {
    if (!element || !element.animate || paused) return;
    const animation = element.animate(frames, options);
    heroAnimations.push(animation);
    animation.finished.then(function () { animation.cancel(); }).catch(function () {});
    return animation;
  }
  function triggerReactions(index) {
    if (paused || !widgetEmojisContainer) return;
    widgetEmojisContainer.textContent = '';
    reactionPositions.forEach(function (position, i) {
      const emoji = document.createElement('span');
      emoji.className = 'widget-fly-emoji';
      emoji.textContent = reactions[index][i % 3];
      emoji.style.left = position[0] + '%';
      emoji.style.animationDelay = (.9 + position[1]) + 's';
      emoji.style.fontSize = position[2] + 'px';
      emoji.addEventListener('animationend', function () { emoji.remove(); }, { once: true });
      widgetEmojisContainer.appendChild(emoji);
    });
  }
  function revealWidget(animate) {
    if (widgetRevealed || !heroWidget) return;
    const slots = Array.from(document.querySelectorAll('.phone-app-slot'));
    const before = slots.map(function (slot) { return slot.getBoundingClientRect(); });
    heroWidget.hidden = false;
    widgetRevealed = true;
    if (!animate || paused) return;
    slots.forEach(function (slot, i) {
      const after = slot.getBoundingClientRect();
      animateElement(slot, [
        { transform: 'translate(' + (before[i].left-after.left) + 'px,' + (before[i].top-after.top) + 'px)' },
        { transform: 'translate(0,0)' }
      ], { duration: 650, easing: 'cubic-bezier(.2,.85,.25,1)' });
    });
    animateElement(heroWidget, [
      { scale: 1.5, translate: '0 -14px', opacity: 0 },
      { scale: .97, translate: '0 1px', opacity: 1, offset: .7 },
      { scale: 1, translate: '0 0', opacity: 1 }
    ], { duration: 720, easing: 'cubic-bezier(.2,.8,.25,1)' });
    triggerReactions(0);
  }
  function syncPhotoDetails(index) {
    if (avatar) avatar.src = './assets/uplocket/index/bubbles/' + avatars[index] + '.webp';
    if (!heroCaption) return;
    const caption = captions[index];
    heroCaption.hidden = !caption;
    if (caption) {
      heroCaption.src = './assets/uplocket/index/captions/' + caption + '.webp';
      heroCaption.style.width = captionWidths[caption] + '%';
    }
  }
  async function nextPhoto() {
    if (!widgetRevealed) { revealWidget(!paused); return; }
    if (photoSwapInProgress || !visiblePhoto || !hiddenPhoto) return;
    photoSwapInProgress = true;
    const nextIndex = photoIndex % 8 + 1;
    const incoming = hiddenPhoto;
    incoming.src = './assets/uplocket/index/bubbles/widget-' + nextIndex + '.webp';
    try { if (incoming.decode) await incoming.decode(); }
    catch (_) { photoSwapInProgress = false; return; }
    if (disposed) { photoSwapInProgress = false; return; }
    incoming.classList.add('is-active');
    visiblePhoto.classList.remove('is-active');
    hiddenPhoto = visiblePhoto;
    visiblePhoto = incoming;
    photoIndex = nextIndex;
    syncPhotoDetails(nextIndex - 1);
    triggerReactions(nextIndex - 1);
    photoSwapInProgress = false;
  }
  if (heroWidget) heroWidget.addEventListener('click', nextPhoto);
  function queuePhoto(delay) {
    photoTimer = setTimeout(function () {
      if (disposed) return;
      const rect = (widgetRevealed ? heroWidget : document.querySelector('.phone-scene'))?.getBoundingClientRect();
      const visible = rect && rect.bottom > 0 && rect.top < window.innerHeight;
      if (!paused && !document.hidden && visible) {
        if (widgetRevealed) nextPhoto(); else revealWidget(true);
        queuePhoto(3400);
      } else queuePhoto(1000);
    }, delay);
  }

  const bubbleSettings = [
    ['.photo-one',24,29,.75,.18], ['.photo-two',94,25,.95,.04],
    ['.photo-three',10,75,.7,.12], ['.photo-four',79,63,.7,.26],
    ['.heart-sticker',13.5,22,.8,.1], ['.bff',11,43,.9,0],
    ['.sparkle',28,54,.7,.22], ['.megaphone',23.5,75,.75,.16],
    ['.love-sticker',74.5,19,.8,.08], ['.gold-sticker',72.5,35,.75,.2],
    ['.tile-sticker',83,41,.85,.14], ['.tiny-heart',95.5,52,.8,.06],
    ['.name-sticker',90,78,.75,.28]
  ];
  const bubbles = bubbleSettings.map(function (item) {
    const element = document.querySelector(item[0]);
    return { element: element, entrance: element?.querySelector('.float-entrance'), scroll: element?.querySelector('.float-scroll'), settings: item };
  });
  if (!paused) {
    bubbles.forEach(function (bubble) {
      const item = bubble.settings;
      animateElement(bubble.entrance, [
        { transform: 'translate(' + ((50-item[1])*.8) + 'vw,' + ((50-item[2])*.8) + 'vh) scale(.1)', opacity: 0 },
        { transform: 'translate(0,0) scale(1)', opacity: 1 }
      ], { duration: item[3]*1000, delay: item[4]*1000, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
    });
    animateElement(document.querySelector('.phone-scene'), [
      { scale: .45, rotate: '-10deg', opacity: 0 },
      { scale: 1, rotate: '0deg', opacity: 1 }
    ], { duration: 1000, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
    animateElement(document.querySelector('.hero-copy'), [{ opacity:0 },{ opacity:1 }], { duration:800, delay:450, fill:'both' });
    animateElement(document.querySelector('.hero-qr'), [{ scale:.3, opacity:0 },{ scale:1, opacity:1 }], { duration:850, delay:450, easing:'cubic-bezier(.16,1,.3,1)', fill:'both' });
  }

  let scrollFrame = 0;
  function updateHeroScroll() {
    scrollFrame = 0;
    document.body.classList.toggle('hero-at-top', window.scrollY < 300);
    const progress = paused ? 0 : Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight)));
    bubbles.forEach(function (bubble) {
      if (!bubble.scroll) return;
      const item = bubble.settings;
      const x = progress * (item[1]-50) * .15 * window.innerWidth / 100;
      const y = progress * (item[2]-50) * .15 * window.innerHeight / 100;
      bubble.scroll.style.transform = 'translate3d('+x.toFixed(2)+'px,'+y.toFixed(2)+'px,0)';
      bubble.scroll.style.opacity = String(1-progress);
    });
  }
  function requestHeroScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateHeroScroll); }
  window.addEventListener('scroll', requestHeroScroll, { passive: true });
  window.addEventListener('resize', requestHeroScroll, { passive: true });

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

  // --- 8. MOTION TOGGLE & ACCESSIBILITY ---
  function updateMotion() {
    document.body.classList.toggle('motion-paused', paused);
    document.body.classList.toggle('motion-enabled', !paused);
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.textContent = paused ? 'Bật chuyển động' : 'Tạm dừng chuyển động';
    }
    heroAnimations.forEach(function (animation) {
      if (animation.playState === 'finished' || animation.playState === 'idle') return;
      if (paused) animation.pause(); else animation.play();
    });
    if (paused) revealWidget(false);
    requestHeroScroll();
  }
  if (motionButton) {
    motionButton.hidden = false;
    motionButton.addEventListener('click', function () {
      paused = !paused;
      updateMotion();
    });
  }
  updateMotion();

  queuePhoto(widgetRevealed ? 3400 : 1200);
  window.addEventListener('pagehide', function (event) {
    if (event.persisted) return;
    disposed = true;
    clearTimeout(photoTimer);
    cancelAnimationFrame(scrollFrame);
    heroAnimations.forEach(function (animation) { animation.cancel(); });
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
  const preview = document.getElementById('preview-frame');
  const overlay = document.getElementById('preview-overlay');
  const download = document.getElementById('frame-download');
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
    const visible = filtered;
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
  }
  input.addEventListener('input', renderFrames);
  document.querySelectorAll('.theme-button').forEach(function (button) { button.addEventListener('click', function () {
    selectedId = ''; overlay.hidden = true; preview.classList.remove('has-art-frame'); download.hidden = true;
    document.getElementById('frame-selected-label').textContent = '';
    gallery.querySelectorAll('.frame-choice').forEach(function (choice) { choice.setAttribute('aria-pressed', 'false'); });
  }); });
  document.getElementById('frame-library').hidden = false;
  selectFrame(frames[0]); renderFrames();
}());
