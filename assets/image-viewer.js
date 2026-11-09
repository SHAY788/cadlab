/* Progressive enhancement: image links still open the image without JavaScript. */
(() => {
  if (!window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) return;
  const links = [...document.querySelectorAll('[data-image-viewer]')];
  if (!links.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'image-viewer';
  dialog.setAttribute('aria-label', 'Image viewer · 이미지 확대 보기');
  const toolbar = document.createElement('div');
  toolbar.className = 'image-viewer-toolbar';
  const zoom = document.createElement('button');
  zoom.type = 'button';
  zoom.textContent = '100% · 실제 크기';
  zoom.setAttribute('aria-pressed', 'false');
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close · 닫기 ×';
  const viewport = document.createElement('div');
  viewport.className = 'image-viewer-viewport';
  viewport.tabIndex = 0;
  viewport.setAttribute('aria-label', 'Image; scroll to inspect at actual size · 실제 크기에서 스크롤하여 보기');
  const image = document.createElement('img');
  image.draggable = false;
  toolbar.append(zoom, close);
  dialog.append(toolbar, viewport);
  document.body.append(dialog);
  let trigger;
  let previousOverflow;
  const reset = () => {
    dialog.classList.remove('actual-size');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = '100% · 실제 크기';
    viewport.scrollTop = viewport.scrollLeft = 0;
  };
  links.forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    trigger = link;
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    viewport.append(image);
    reset();
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    close.focus();
  }));
  zoom.addEventListener('click', () => {
    const actual = dialog.classList.toggle('actual-size');
    zoom.setAttribute('aria-pressed', String(actual));
    zoom.textContent = actual ? 'Fit to screen · 화면에 맞추기' : '100% · 실제 크기';
    viewport.scrollTop = viewport.scrollLeft = 0;
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    image.remove();
    document.body.style.overflow = previousOverflow;
    trigger?.focus({preventScroll: true});
  });
})();
