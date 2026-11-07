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
  const modal = document.getElementById('account-modal');
  const form = document.getElementById('account-form');
  const accountInput = document.getElementById('account-link');
  const accountError = document.getElementById('account-error');
  const accountCheck = document.getElementById('account-check');
  const result = document.getElementById('account-result');
  const plans = {
    trial: { name: 'Gói dùng thử', duration: '3 ngày · theo web mẫu', price: 'Miễn phí' },
    year: { name: 'Locket Gold 1 năm', duration: '1 năm · theo web mẫu', price: '15.000đ' },
    lifetime: { name: 'Locket Gold trọn đời', duration: 'Theo điều kiện Uplocket', price: '25.000đ' }
  };
  let returnFocus = null;
  let account = null;
  let backgroundState = [];
  function resetAccountResult() {
    account = null; result.hidden = true; accountCheck.hidden = false;
    document.getElementById('account-copy-status').textContent = '';
    accountInput.readOnly = false;
  }
  function clearAccountError() { accountError.hidden = true; accountError.textContent = ''; accountInput.removeAttribute('aria-invalid'); }
  function closeAccountModal() {
    modal.hidden = true; document.body.classList.remove('modal-open');
    backgroundState.forEach(function (entry) {
      entry.element.inert = entry.inert;
      if (entry.hidden === null) entry.element.removeAttribute('aria-hidden'); else entry.element.setAttribute('aria-hidden', entry.hidden);
    });
    backgroundState = [];
    if (returnFocus) returnFocus.focus();
  }
  document.querySelectorAll('[data-plan]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !window.LocketLink) return;
      const plan = plans[link.dataset.plan]; if (!plan) return;
      event.preventDefault(); closeMenu(); returnFocus = link;
      resetAccountResult(); clearAccountError();
      document.getElementById('account-plan-name').textContent = plan.name;
      document.getElementById('account-plan-duration').textContent = plan.duration;
      document.getElementById('account-plan-price').textContent = plan.price;
      accountCheck.disabled = !accountInput.value.trim();
      modal.hidden = false; document.body.classList.add('modal-open');
      backgroundState = Array.from(document.body.children).filter(function (element) { return element !== modal && !['SCRIPT', 'SVG'].includes(element.tagName.toUpperCase()); }).map(function (element) {
        const entry = { element: element, inert: !!element.inert, hidden: element.getAttribute('aria-hidden') };
        element.inert = true; element.setAttribute('aria-hidden', 'true'); return entry;
      });
      accountInput.focus();
    });
  });
  modal.querySelector('.account-close').addEventListener('click', closeAccountModal);
  modal.addEventListener('click', function (event) { if (event.target === modal) closeAccountModal(); });
  document.addEventListener('keydown', function (event) {
    if (modal.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeAccountModal(); return; }
    if (event.key === 'Tab') {
      const focusable = Array.from(modal.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]')).filter(function (element) { return !element.closest('[hidden]'); });
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
  });
  accountInput.addEventListener('input', function () { resetAccountResult(); clearAccountError(); accountCheck.disabled = !accountInput.value.trim(); });
  form.addEventListener('submit', function (event) {
    event.preventDefault(); clearAccountError();
    try { account = window.LocketLink.parse(accountInput.value); }
    catch (error) { accountError.textContent = error.message; accountError.hidden = false; accountInput.setAttribute('aria-invalid', 'true'); accountInput.focus(); return; }
    accountInput.value = account.url; accountInput.readOnly = true;
    document.getElementById('account-username').textContent = '@' + account.username;
    document.getElementById('account-profile').href = account.url;
    accountCheck.hidden = true; result.hidden = false;
    document.getElementById('account-copy').focus();
  });
  document.getElementById('account-copy').addEventListener('click', async function () {
    if (!account) return;
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(account.url);
      document.getElementById('account-copy-status').textContent = 'Đã sao chép link. Bạn có thể dán vào Uplocket.';
    } catch (_) {
      accountInput.focus(); accountInput.select();
      document.getElementById('account-copy-status').textContent = 'Không sao chép tự động được. Hãy sao chép link đã được chọn trong ô phía trên.';
    }
  });
  modal.querySelector('.account-edit').addEventListener('click', function () { resetAccountResult(); clearAccountError(); accountInput.focus(); accountInput.select(); });
  if (window.LocketProfileInfo) {
    document.getElementById('cert-fingerprint').textContent = 'SHA-256: ' + window.LocketProfileInfo.certificate.sha256;
    const list = document.getElementById('dns-domains'); list.textContent = '';
    window.LocketProfileInfo.dns.domains.forEach(function (domain) { const item = document.createElement('li'); item.textContent = domain; list.appendChild(item); });
  }
}());
