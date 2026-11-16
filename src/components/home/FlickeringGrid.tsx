import { useEffect, useRef } from 'react';

/* Flickering grid background, after the Magic UI "Flickering Grid" pattern (MIT).
   A canvas of small squares that slowly fade in and out in one colour. Kept very
   faint and masked to a soft ellipse so it sits behind content without competing. */

type Props = {
  color?: string;        // rgb triplet, e.g. '230, 25, 43'
  squareSize?: number;
  gap?: number;
  maxOpacity?: number;
  flicker?: number;      // share of squares that change per second
  className?: string;
};

export function FlickeringGrid({ color = '230, 25, 43', squareSize = 4, gap = 6, maxOpacity = 0.22, flicker = 0.25, className = '' }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current, cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    let cols = 0, rows = 0, cells = new Float32Array(0), raf = 0, last = 0, visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const size = () => {
      const { width, height } = el.getBoundingClientRect();
      cv.width = Math.max(1, Math.floor(width * dpr));
      cv.height = Math.max(1, Math.floor(height * dpr));
      cv.style.width = `${width}px`;
      cv.style.height = `${height}px`;
      cols = Math.ceil(width / (squareSize + gap));
      rows = Math.ceil(height / (squareSize + gap));
      cells = new Float32Array(cols * rows);
      for (let i = 0; i < cells.length; i++) cells[i] = Math.random() * maxOpacity;
    };

    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      const s = squareSize * dpr, step = (squareSize + gap) * dpr;
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          ctx.fillStyle = `rgba(${color}, ${cells[x * rows + y]})`;
          ctx.fillRect(x * step, y * step, s, s);
        }
      }
    };

    const tick = (t: number) => {
      const dt = last ? (t - last) / 1000 : 0;
      last = t;
      if (visible) {
        for (let i = 0; i < cells.length; i++) if (Math.random() < flicker * dt) cells[i] = Math.random() * maxOpacity;
        draw();
      }
      raf = requestAnimationFrame(tick);
    };

    size();
    draw();
    raf = requestAnimationFrame(tick);
    const ro = new ResizeObserver(() => { size(); draw(); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [color, squareSize, gap, maxOpacity, flicker]);

  return (
    <div ref={wrap} aria-hidden="true" className={`pointer-events-none ${className}`}>
      <canvas ref={canvas} className="block" />
    </div>
  );
}
