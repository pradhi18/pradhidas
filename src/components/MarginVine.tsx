import { useEffect, useRef, useState } from 'react';
import { marginVine } from '../lib/doodles';

/**
 * The hole-punch vine down the left margin. It is drawn to the page's height,
 * redrawn when the page changes size, and animates in once per visit.
 */
export default function MarginVine() {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const svg = ref.current;
    const wrap = svg?.closest<HTMLElement>('.wrap');
    if (!svg || !wrap) return;
    const measure = () => {
      const w = svg.clientWidth || 76, h = wrap.offsetHeight;
      setSize((s) => (Math.abs(s.w - w) < 1 && Math.abs(s.h - h) < 60 ? s : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const svg = ref.current;
    if (!svg || !size.h) return;
    svg.innerHTML = marginVine(size.w, size.h);
    animateOnce(svg);
  }, [size]);

  // bloom on click
  function onClick(e: React.MouseEvent) {
    const b = (e.target as Element).closest('.bloom');
    if (!b || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    b.animate([{ transform: 'rotate(0deg) scale(1.2)' }, { transform: 'rotate(360deg) scale(1.2)' }], { duration: 700, easing: 'cubic-bezier(.34,1.3,.64,1)' });
  }

  return (
    <svg
      ref={ref}
      className="margin-vine"
      viewBox={`0 0 ${size.w || 76} ${size.h || 1000}`}
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      onClick={onClick}
    />
  );
}

function animateOnce(svg: SVGSVGElement) {
  let seen = false;
  try { seen = sessionStorage.getItem('vine-drawn') === '1'; sessionStorage.setItem('vine-drawn', '1'); } catch { /* storage blocked */ }
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const vine = svg.querySelector<SVGPathElement>('.vine');
  if (!vine) return;
  const L = vine.getTotalLength(), dur = Math.min(3600, 900 + L * 0.5);
  vine.style.strokeDasharray = String(L);
  vine.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: dur, easing: 'linear', fill: 'backwards' });
  const leaves = svg.querySelectorAll('.leaves > g');
  leaves.forEach((el, i) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: (dur * (i + 0.5)) / (leaves.length + 1), fill: 'backwards' }));
  const blooms = svg.querySelectorAll('.bloom');
  blooms.forEach((el, i) => el.animate(
    [{ transform: 'scale(0) rotate(-50deg)' }, { transform: 'scale(1) rotate(0deg)' }],
    { duration: 560, delay: (dur * i) / Math.max(1, blooms.length - 1), easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' },
  ));
}
