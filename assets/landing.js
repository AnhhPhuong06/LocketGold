(function () {
  'use strict';
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('.nav');
  menu.hidden = false;
  function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Mở menu'); }
  menu.addEventListener('click', function () {
    const open = !nav.classList.contains('open'); nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  });
  nav.addEventListener('click', function (event) { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
  const preview = document.getElementById('preview-frame');
  const themes = document.querySelectorAll('.theme-button');
  document.querySelector('.frame-options').hidden = false;
  themes.forEach(function (button) { button.addEventListener('click', function () {
    preview.dataset.theme = button.dataset.theme;
    themes.forEach(function (item) { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  }); });
  let ocean = false;
  preview.addEventListener('click', function () {
    ocean = !ocean; const photo = document.getElementById('preview-photo');
    photo.src = ocean ? './assets/ocean.jpg' : './assets/puppy.jpg';
    photo.alt = ocean ? 'Ảnh minh họa: bờ biển xanh' : 'Ảnh minh họa: chú chó nhỏ';
    document.getElementById('preview-caption').textContent = ocean ? 'hôm nay mình đi trốn một chút ☀' : 'gửi bạn một chút dễ thương ♡';
  });
  const steps = document.querySelectorAll('.guide-step'); const panels = document.querySelectorAll('.guide-panel');
  function selectStep(id) {
    panels.forEach(function (panel) { panel.hidden = panel.id !== id; });
    steps.forEach(function (step) { const active = step.hash === '#' + id; step.classList.toggle('selected', active); if (active) step.setAttribute('aria-current', 'step'); else step.removeAttribute('aria-current'); });
  }
  steps.forEach(function (step) { step.addEventListener('click', function (event) { event.preventDefault(); selectStep('guide-' + step.dataset.step); }); });
  selectStep(/^#guide-[123]$/.test(location.hash) ? location.hash.slice(1) : 'guide-1');
  window.addEventListener('hashchange', function () { if (/^#guide-[123]$/.test(location.hash)) selectStep(location.hash.slice(1)); });
  const copy = document.getElementById('copy-profile'); copy.hidden = false; let toastTimer;
  copy.addEventListener('click', async function () {
    const url = new URL('./AnhhPhuongg.mobileconfig', location.href).href;
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      const toast = document.getElementById('toast'); toast.textContent = 'Đã sao chép link hồ sơ'; toast.classList.add('visible');
      clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('visible'); }, 3000);
      document.getElementById('copy-fallback').hidden = true;
    } catch (_) {
      document.getElementById('copy-fallback').hidden = false;
      const input = document.getElementById('profile-url'); input.value = url; input.focus(); input.select();
    }
  });
  if (window.LocketProfileInfo) {
    document.getElementById('cert-fingerprint').textContent = 'SHA-256: ' + window.LocketProfileInfo.certificate.sha256;
    const list = document.getElementById('dns-domains'); list.textContent = '';
    window.LocketProfileInfo.dns.domains.forEach(function (domain) { const item = document.createElement('li'); item.textContent = domain; list.appendChild(item); });
  }
}());
