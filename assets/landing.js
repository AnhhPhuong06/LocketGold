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
  const accountEntry = document.getElementById('account-entry');
  const accountTitle = document.getElementById('account-title');
  const accountInstructions = document.getElementById('account-instructions');
  const entryTitle = accountTitle.textContent;
  const entryInstructions = accountInstructions.textContent;
  const lookupConfig = window.LocketLookupConfig || {};
  const lookupEnabled = lookupConfig.enabled === true && typeof lookupConfig.endpoint === 'string';
  const checkLabel = lookupEnabled ? 'Kiểm tra tại Uplocket' : 'Kiểm tra link Locket';
  accountCheck.textContent = checkLabel;
  document.getElementById('account-lookup-notice').hidden = !lookupEnabled;
  if (lookupEnabled) document.getElementById('account-disclaimer').textContent = 'Username được gửi đến Uplocket để tra cứu khi bạn nhấn kiểm tra. Chỉ các trường hiển thị công khai được trả về. Trạng thái từ Uplocket không phải xác nhận thuê bao chính thức từ Locket; không kích hoạt hoặc mua gói tại bước này.';
  const plans = {
    trial: { name: 'Gói dùng thử', duration: '3 ngày', price: 'Miễn phí' },
    year: { name: 'Locket Gold 1 năm', duration: '1 năm', price: '20.000đ' },
    lifetime: { name: 'Locket Gold trọn đời', duration: 'Theo điều kiện Uplocket', price: '30.000đ' }
  };
  let returnFocus = null;
  let account = null;
  let selectedPlan = plans.trial;
  let lookupController = null;
  let lookupResult = null;
  let lookupMessage = '';
  let backgroundState = [];
  function resetAccountResult() {
    if (lookupController) lookupController.abort();
    lookupController = null; lookupResult = null; lookupMessage = '';
    account = null; result.hidden = true; accountCheck.hidden = false;
    accountCheck.textContent = checkLabel;
    form.removeAttribute('aria-busy');
    form.hidden = false;
    accountEntry.hidden = false;
    modal.classList.remove('has-result');
    accountTitle.textContent = entryTitle;
    accountInstructions.textContent = entryInstructions;
    accountInstructions.hidden = false;
    document.getElementById('account-lookup-notice').hidden = !lookupEnabled;
    modal.setAttribute('aria-describedby', 'account-instructions account-disclaimer');
    accountInput.readOnly = false;
    document.getElementById('account-file-details').open = false;
  }
  function showAccountDetails() {
    const profiles = window.LocketPublicProfiles;
    const cached = profiles && Object.prototype.hasOwnProperty.call(profiles, account.username) ? profiles[account.username] : null;
    const profile = lookupResult ? { displayName: lookupResult.name, avatar: lookupResult.avatar || cached?.avatar, checkedAt: lookupResult.checked_at } : cached;
    const currentAccount = account;
    const avatar = document.getElementById('account-avatar');
    const initials = account.username.slice(0, 2).toUpperCase();
    avatar.textContent = initials;
    document.getElementById('account-display-name').textContent = profile?.displayName || account.username;
    document.getElementById('account-detail-name').textContent = profile?.displayName || 'Chưa có dữ liệu';
    const source = document.getElementById('account-photo-source');
    source.hidden = true; source.textContent = '';
    let avatarSource = null;
    if (profile && typeof profile.avatar === 'string') {
      if (profile.avatar.startsWith('./assets/public-profiles/')) avatarSource = profile.avatar;
      else {
        try {
          const url = new URL(profile.avatar);
          if (url.protocol === 'https:' && (url.hostname.endsWith('.locketcamera.com') || url.hostname === 'firebasestorage.googleapis.com')) avatarSource = url.href;
        } catch (_) {}
      }
    }
    if (avatarSource) {
      const photo = document.createElement('img');
      photo.alt = ''; photo.width = 38; photo.height = 38; photo.decoding = 'async';
      photo.referrerPolicy = 'no-referrer';
      photo.addEventListener('error', function () {
        if (account !== currentAccount || !avatar.contains(photo)) return;
        avatar.textContent = initials; if (!lookupResult) source.hidden = true;
      }, { once: true });
      photo.src = avatarSource;
      avatar.replaceChildren(photo);
      const checkedAt = new Date(profile.checkedAt);
      const date = Number.isFinite(checkedAt.getTime()) ? new Intl.DateTimeFormat('vi-VN').format(checkedAt) : '';
      source.textContent = 'Ảnh từ trang cá nhân công khai' + (date ? ' · lưu ngày ' + date : '');
      source.hidden = false;
    }
    if (lookupResult) {
      const checkedAt = new Date(lookupResult.checked_at);
      source.textContent = 'Theo Uplocket' + (Number.isFinite(checkedAt.getTime()) ? ' · tra cứu ' + new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(checkedAt) : '');
      source.hidden = false;
    }
    const profileLink = document.getElementById('account-detail-link');
    profileLink.href = account.url; profileLink.textContent = account.url;
    document.getElementById('account-detail-plan').textContent = selectedPlan.name;
    document.getElementById('account-detail-price').textContent = selectedPlan.price;
    document.getElementById('account-detail-duration').textContent = selectedPlan.duration;
    const gold = lookupResult?.is_gold;
    const badge = modal.querySelector('.account-gold-status');
    badge.dataset.status = gold === true ? 'active' : gold === false ? 'inactive' : 'unknown';
    badge.textContent = gold === true ? 'ĐÃ CÓ GOLD' : gold === false ? 'CHƯA CÓ GOLD' : 'CHƯA XÁC MINH';
    document.getElementById('account-provider-gold').textContent = gold === true ? 'Đã có Gold' : gold === false ? 'Chưa có Gold' : 'Chưa xác minh';
    document.getElementById('account-provider-package').textContent = lookupResult?.package_name || 'Chưa có dữ liệu';
    const packageExpiry = new Date(lookupResult?.expires_at || '');
    document.getElementById('account-provider-expiry').textContent = Number.isFinite(packageExpiry.getTime()) ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(packageExpiry) : 'Chưa có dữ liệu';
    document.getElementById('account-provider-note').textContent = lookupResult ? 'Kết quả do Uplocket cung cấp, không phải xác nhận thuê bao từ Locket. Hồ sơ DNS không tự kích hoạt Gold.' : lookupMessage || 'Trạng thái tài khoản và Gold chưa xác minh. Hồ sơ DNS này không kích hoạt Gold.';
    document.getElementById('account-lookup-retry').hidden = !lookupMessage;
    const primary = document.getElementById('account-primary-action');
    document.getElementById('account-secondary-download').hidden = gold !== false;
    if (gold === false) {
      primary.href = 'https://uplocket.io.vn/'; primary.removeAttribute('download');
      primary.target = '_blank'; primary.rel = 'noopener noreferrer';
      primary.textContent = 'Nâng cấp tại Uplocket ↗';
    } else {
      primary.href = './AnhhPhuongg.mobileconfig'; primary.download = 'AnhhPhuongg.mobileconfig';
      primary.removeAttribute('target'); primary.removeAttribute('rel');
      primary.textContent = 'Tải lại hồ sơ DNS';
    }
    const info = window.LocketProfileInfo;
    const file = info?.profiles?.['AnhhPhuongg.mobileconfig'];
    document.getElementById('account-dns-size').textContent = file && Number.isFinite(file.bytes) ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(file.bytes / 1024) + ' KB' : 'Chưa có dữ liệu';
    document.getElementById('account-dns-protocol').textContent = info?.dns?.protocol || 'Chưa có dữ liệu';
    document.getElementById('account-dns-server').textContent = info?.dns?.serverUrl || 'Chưa có dữ liệu';
    const certExpiry = new Date(info?.certificate?.notAfter || '');
    document.getElementById('account-dns-certificate-expiry').textContent = Number.isFinite(certExpiry.getTime()) ? new Intl.DateTimeFormat('vi-VN').format(certExpiry) : 'Chưa có dữ liệu';
  }
  function clearAccountError() { accountError.hidden = true; accountError.textContent = ''; accountInput.removeAttribute('aria-invalid'); }
  function syncAccountCheck() {
    try { window.LocketLink.parse(accountInput.value); accountCheck.disabled = false; }
    catch (_) { accountCheck.disabled = true; }
  }
  function closeAccountModal() {
    if (lookupController) lookupController.abort();
    lookupController = null;
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
      selectedPlan = plan;
      event.preventDefault(); closeMenu(); returnFocus = link;
      resetAccountResult(); clearAccountError();
      document.getElementById('account-plan-name').textContent = plan.name;
      document.getElementById('account-plan-duration').textContent = plan.duration;
      document.getElementById('account-plan-price').textContent = plan.price;
      syncAccountCheck();
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
      const focusable = Array.from(modal.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), summary, [tabindex="0"]')).filter(function (element) { return !element.closest('[hidden]') && (!element.closest('details:not([open])') || element.tagName === 'SUMMARY'); });
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
  });
  accountInput.addEventListener('input', function () { resetAccountResult(); clearAccountError(); syncAccountCheck(); });
  accountInput.addEventListener('blur', function () {
    if (!accountInput.value.trim()) return;
    try { window.LocketLink.parse(accountInput.value); }
    catch (error) { accountError.textContent = error.message; accountError.hidden = false; accountInput.setAttribute('aria-invalid', 'true'); }
  });
  form.addEventListener('submit', async function (event) {
    event.preventDefault(); clearAccountError();
    if (lookupController) return;
    try { account = window.LocketLink.parse(accountInput.value); }
    catch (error) { accountError.textContent = error.message; accountError.hidden = false; accountInput.setAttribute('aria-invalid', 'true'); accountInput.focus(); return; }
    accountInput.value = account.url;
    const currentAccount = account;
    lookupResult = null; lookupMessage = '';
    if (lookupEnabled) {
      const controller = new AbortController();
      lookupController = controller;
      accountCheck.disabled = true; accountCheck.textContent = 'Đang tra cứu…';
      form.setAttribute('aria-busy', 'true');
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(lookupConfig.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: account.username }), signal: controller.signal, credentials: 'omit' });
        const data = await response.json();
        if (account !== currentAccount || modal.hidden || lookupController !== controller) return;
        if (!response.ok || data.success !== true || data.provider !== 'uplocket' || typeof data.username !== 'string' || data.username.toLowerCase() !== account.username.toLowerCase()) throw new Error('Lookup unavailable');
        lookupResult = data;
      } catch (_) {
        if (account !== currentAccount || modal.hidden || lookupController !== controller) return;
        lookupMessage = 'Chưa kết nối được Uplocket. Trạng thái Gold chưa xác định; bạn có thể thử tra cứu lại.';
      } finally {
        clearTimeout(timeout);
        if (lookupController === controller) {
          lookupController = null;
          accountCheck.textContent = checkLabel; form.removeAttribute('aria-busy'); syncAccountCheck();
        }
      }
      if (account !== currentAccount || modal.hidden) return;
    }
    accountInput.readOnly = true;
    document.getElementById('account-username').textContent = '@' + account.username;
    showAccountDetails();
    document.getElementById('account-profile').href = account.url;
    form.hidden = true;
    modal.classList.add('has-result');
    accountTitle.textContent = 'Xác nhận tài khoản';
    accountInstructions.hidden = true;
    document.getElementById('account-lookup-notice').hidden = true;
    modal.setAttribute('aria-describedby', 'account-disclaimer');
    accountCheck.hidden = true; result.hidden = false;
    accountTitle.focus();
  });
  document.getElementById('account-lookup-retry').addEventListener('click', function () {
    resetAccountResult(); syncAccountCheck(); form.requestSubmit();
  });
  modal.querySelector('.account-edit').addEventListener('click', function () { resetAccountResult(); clearAccountError(); accountInput.focus(); accountInput.select(); });
  if (window.LocketProfileInfo) {
    document.getElementById('cert-fingerprint').textContent = 'SHA-256: ' + window.LocketProfileInfo.certificate.sha256;
    const list = document.getElementById('dns-domains'); list.textContent = '';
    window.LocketProfileInfo.dns.domains.forEach(function (domain) { const item = document.createElement('li'); item.textContent = domain; list.appendChild(item); });
  }
}());
