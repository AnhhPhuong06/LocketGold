(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#main-nav');
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Mở menu');
    menu.classList.remove('is-open');
  };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    menu.classList.toggle('is-open', open);
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  const desktop = window.matchMedia('(min-width: 681px)');
  if (desktop.addEventListener) desktop.addEventListener('change', closeMenu);

  const stepButtons = [...document.querySelectorAll('.step')];
  stepButtons.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.step;
    stepButtons.forEach(step => {
      const active = step.dataset.step === selected;
      step.classList.toggle('is-active', active);
      step.setAttribute('aria-pressed', String(active));
      document.getElementById(step.getAttribute('aria-controls')).hidden = !active;
    });
  }));

  const photoButton = document.querySelector('#photo-toggle');
  const photo = document.querySelector('#widget-photo');
  const caption = document.querySelector('#widget-caption');
  const photos = [
    { src: './assets/puppy.jpg', alt: 'Ảnh minh họa một chú chó golden nhỏ', caption: 'hôm nay cũng dễ thương!', next: 'cảnh biển' },
    { src: './assets/ocean.jpg', alt: 'Ảnh minh họa sóng biển chạm bờ cát', caption: 'gửi bạn một chút biển xanh', next: 'chú chó nhỏ' }
  ];
  let photoIndex = 0;
  photoButton.addEventListener('click', () => {
    photoIndex = (photoIndex + 1) % photos.length;
    const next = photos[photoIndex];
    photo.src = next.src;
    photo.alt = next.alt;
    caption.textContent = next.caption;
    photoButton.setAttribute('aria-label', `Đổi ảnh minh họa sang ${next.next}`);
  });

  const toast = document.querySelector('#toast');
  let toastTimer;
  const notify = message => {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 4500);
  };
  document.querySelector('#copy-link').addEventListener('click', async () => {
    const url = new URL('./AnhhPhuongg.mobileconfig', document.baseURI).href;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      document.querySelector('#copy-fallback').hidden = true;
      notify('Đã sao chép link tải. Gửi sang iPhone của bạn nhé!');
    } catch {
      const fallback = document.querySelector('#copy-fallback');
      const input = document.querySelector('#download-url');
      fallback.hidden = false;
      input.value = url;
      input.focus();
      input.select();
      notify('Bạn có thể sao chép link trong ô bên dưới.');
    }
  });

  const sticky = document.querySelector('#mobile-download');
  if ('IntersectionObserver' in window) {
    let heroVisible = true;
    let downloadVisible = false;
    const updateSticky = () => sticky.classList.toggle('is-visible', !heroVisible && !downloadVisible);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target.matches('.hero-download')) heroVisible = entry.isIntersecting;
        if (entry.target.matches('.download-card')) downloadVisible = entry.isIntersecting;
      });
      updateSticky();
    });
    observer.observe(document.querySelector('.hero-download'));
    observer.observe(document.querySelector('.download-card'));
  }
})();
