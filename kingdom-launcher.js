(() => {
  const logo = document.querySelector('#home .artist-logo');
  if (!logo) return;
  const desktop = matchMedia('(hover: hover) and (pointer: fine)');
  const dialog = document.createElement('dialog');
  dialog.className = 'kingdom-dialog';
  dialog.setAttribute('aria-label', 'Draugveil - Cursed Kingdom');
  const close = document.createElement('button');
  close.className = 'kingdom-close';
  close.type = 'button';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Close game');
  const frame = document.createElement('iframe');
  frame.title = 'Draugveil - Cursed Kingdom';
  frame.allow = 'autoplay';
  dialog.append(close, frame);
  document.body.append(dialog);
  let previousOverflow = '';
  function open() {
    if (!desktop.matches || dialog.open) return;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    frame.src = 'draugveil_webgame.html?v=20260929-packed-assets';
    dialog.showModal();
  }
  function dismiss() { if (dialog.open) dialog.close(); }
  dialog.addEventListener('close', () => {
    frame.src = 'about:blank';
    document.body.style.overflow = previousOverflow;
    logo.focus({preventScroll: true});
  });
  close.addEventListener('click', dismiss);
  frame.addEventListener('load', () => {
    if (!dialog.open) return;
    frame.contentWindow?.focus();
    frame.contentDocument?.querySelector('canvas')?.focus();
  });
  window.addEventListener('message', event => {
    if (event.origin === location.origin && event.source === frame.contentWindow && event.data?.type === 'draugveil-close') dismiss();
  });
  logo.addEventListener('click', open);
  logo.addEventListener('keydown', event => {
    if (desktop.matches && (event.key === 'Enter' || event.key === ' ')) {event.preventDefault();open();}
  });
  function update() {
    if (desktop.matches) {
      logo.tabIndex = 0;
      logo.setAttribute('role', 'button');
      logo.setAttribute('aria-label', 'Play Draugveil - Cursed Kingdom');
    } else {
      logo.removeAttribute('tabindex');logo.removeAttribute('role');logo.removeAttribute('aria-label');dismiss();
    }
  }
  desktop.addEventListener('change', update);
  update();
})();
