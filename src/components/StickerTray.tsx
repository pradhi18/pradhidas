import { useEffect, useMemo, useRef, useState } from 'react';
import { binding, STICKERS, stickerSvg } from '../lib/doodles';

interface Placed { key: number; id: string; x: number; y: number; rot: number; scale: number; }

const STORE = 'pradhi-stickers';
const BOARD_H = 300;

/** Pick one of Pradhi's flowers and stick it on the page. Stickers stay in the visitor's own browser. */
export default function StickerTray() {
  const svgs = useMemo(() => Object.fromEntries(STICKERS.map((s) => [s.id, stickerSvg(s)])), []);
  const [selected, setSelected] = useState(STICKERS[0].id);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [bindW, setBindW] = useState(0);
  const board = useRef<HTMLDivElement>(null);
  const drag = useRef<{ key: number; dx: number; dy: number } | null>(null);

  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem(STORE) ?? '[]'); if (Array.isArray(saved)) setPlaced(saved); } catch { /* ignore */ }
    const el = board.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBindW(Math.round(el.clientWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify(placed)); } catch { /* ignore */ }
  }, [placed]);

  const bindingSvg = useMemo(() => (bindW ? binding(bindW) : ''), [bindW]);

  function point(e: React.PointerEvent) {
    const r = board.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: e.clientY - r.top };
  }

  function stick(x: number, y: number) {
    setPlaced((p) => [...p.slice(-39), {
      key: Date.now() + Math.random(), id: selected, x, y: Math.max(52, Math.min(BOARD_H - 24, y)),
      rot: Math.round((Math.random() - 0.5) * 40), scale: 0.9 + Math.random() * 0.3,
    }]);
  }

  function onBoardDown(e: React.PointerEvent) {
    if ((e.target as Element).closest('.placed')) return;
    const { x, y } = point(e);
    stick(x, y);
  }

  function onStickerDown(e: React.PointerEvent, s: Placed) {
    e.stopPropagation();
    const { x, y } = point(e);
    drag.current = { key: s.key, dx: x - s.x, dy: y - s.y };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }
  function onStickerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const { x, y } = point(e), d = drag.current;
    setPlaced((p) => p.map((s) => (s.key === d.key ? { ...s, x: Math.min(1, Math.max(0, x - d.dx)), y: Math.min(BOARD_H - 20, Math.max(48, y - d.dy)) } : s)));
  }
  const endDrag = () => { drag.current = null; };
  const peel = (key: number) => setPlaced((p) => p.filter((s) => s.key !== key));

  return (
    <div className="stickers">
      <div className="tray" role="group" aria-label="Pick a flower sticker">
        {STICKERS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="tray-item"
            aria-pressed={selected === s.id}
            aria-label={`${s.id} sticker`}
            onClick={() => setSelected(s.id)}
          >
            <svg viewBox="-32 -32 64 64" className="pencil" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svgs[s.id] }} />
          </button>
        ))}
      </div>

      <div className="sticker-board" ref={board} onPointerDown={onBoardDown} style={{ height: BOARD_H }}>
        <svg className="board-binding pencil" viewBox={`0 0 ${bindW || 600} 38`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: bindingSvg }} />
        {placed.length === 0 && <p className="board-hint hand">pick a flower above, then tap anywhere here to stick it</p>}
        {placed.map((s) => (
          <svg
            key={s.key}
            className="placed pencil"
            viewBox="-32 -32 64 64"
            style={{ left: `${s.x * 100}%`, top: s.y, transform: `translate(-50%, -50%) rotate(${s.rot}deg) scale(${s.scale})` }}
            onPointerDown={(e) => onStickerDown(e, s)}
            onPointerMove={onStickerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDoubleClick={() => peel(s.key)}
            dangerouslySetInnerHTML={{ __html: svgs[s.id] }}
          />
        ))}
      </div>

      <div className="board-tools">
        <button type="button" className="box" onClick={() => stick(0.1 + Math.random() * 0.8, 70 + Math.random() * (BOARD_H - 110))}>stick one somewhere</button>
        <button type="button" className="box" onClick={() => setPlaced([])} disabled={!placed.length}>peel them all off</button>
        <p className="note">drag to move · double-tap to peel off · they stay in your browser</p>
      </div>
    </div>
  );
}
