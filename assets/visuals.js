(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.getElementById('motion-toggle');
  const heroWidget = document.getElementById('hero-widget');
  const heroPhoto = document.getElementById('hero-widget-photo');
  let photoIndex = 1;
  let paused = reduced.matches;
  function nextPhoto() {
    photoIndex = photoIndex % 8 + 1;
    heroPhoto.src = './assets/uplocket/index/bubbles/widget-' + photoIndex + '.webp';
  }
  heroWidget.addEventListener('click', nextPhoto);
  function updateMotion() {
    document.body.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? 'Bật chuyển động' : 'Tạm dừng chuyển động';
  }
  motionButton.hidden = false;
  motionButton.addEventListener('click', function () { paused = !paused; updateMotion(); });
  updateMotion();
  const timer = setInterval(function () { if (!paused && !document.hidden) nextPhoto(); }, 6500);
  window.addEventListener('pagehide', function (event) { if (!event.persisted) clearInterval(timer); });
  function motionPreferenceChanged(event) { paused = event.matches; updateMotion(); }
  if (reduced.addEventListener) reduced.addEventListener('change', motionPreferenceChanged);
  else reduced.addListener(motionPreferenceChanged);

  if (window.Lenis && !reduced.matches && window.matchMedia('(hover: hover)').matches) {
    const lenis = new window.Lenis({ smoothWheel: true, lerp: 0.1, prevent: function (node) { return !!node.closest('.account-modal'); } });
    let destroyed = false;
    let rafId;
    function raf(time) { lenis.raf(time); rafId = requestAnimationFrame(raf); }
    rafId = requestAnimationFrame(raf);
    const observer = new MutationObserver(function () { if (document.body.classList.contains('modal-open')) lenis.stop(); else lenis.start(); });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('click', function (event) {
      if (destroyed || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href^="#"]');
      if (!link || !link.hash || link.hash === '#') return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault(); lenis.scrollTo(target, { offset: -24 }); history.pushState(null, '', link.hash);
    });
    function destroyScroll() { if (destroyed) return; destroyed = true; cancelAnimationFrame(rafId); observer.disconnect(); lenis.destroy(); }
    window.addEventListener('pagehide', function (event) { if (!event.persisted) destroyScroll(); });
    function stopForReducedMotion(event) { if (event.matches) destroyScroll(); }
    if (reduced.addEventListener) reduced.addEventListener('change', stopForReducedMotion, { once: true });
    else reduced.addListener(stopForReducedMotion);
  }

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
