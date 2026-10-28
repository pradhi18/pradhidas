import { useEffect } from 'react';
import { flower, rand, seed, SPROUT_TYPES } from '../lib/doodles';

/** Click anywhere on the paper and a little flower grows there, then fades. */
export default function Sprouts() {
  useEffect(() => {
    let n = 0;
    function onClick(e: MouseEvent) {
      const t = e.target as Element;
      if (t.closest('a, button, input, textarea, select, label, iframe, .bloom, .sticker-board, .no-sprout')) return;
      if (String(getSelection())) return;
      seed(Date.now() % 100000 + n++);
      const type = SPROUT_TYPES[Math.floor(rand() * SPROUT_TYPES.length)];
      const sp = document.createElement('span');
      sp.className = 'sprout pencil';
      sp.style.left = `${e.pageX}px`;
      sp.style.top = `${e.pageY}px`;
      sp.innerHTML = `<svg viewBox="-25 -25 50 50" width="50" height="50" aria-hidden="true">${flower(type, 19, Math.floor(rand() * 4))}</svg>`;
      document.body.appendChild(sp);
      setTimeout(() => sp.remove(), 3300);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
