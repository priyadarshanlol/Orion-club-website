import { useEffect } from 'react';
import { subscribeMotion } from '../lib/motionInput';

/*
 * Site-wide gyroscope depth for phones. Smooths the tilt from motionInput and
 * writes it to CSS variables on <html>; index.css turns those into the card
 * tilt, glare and floating content. Desktop never gets the .gyro-on class, so
 * nothing changes there.
 */
export default function GyroDepth() {
  useEffect(() => {
    const root = document.documentElement;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;
    let on = false;
    let last = performance.now();

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = 1 - Math.exp(-dt * 9);
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;
      root.style.setProperty('--gx', cur.x.toFixed(3));
      root.style.setProperty('--gy', cur.y.toFixed(3));
      root.style.setProperty('--gm', Math.min(1, Math.hypot(cur.x, cur.y)).toFixed(3));
      if (Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.002) raf = requestAnimationFrame(frame);
      else raf = 0;
    };

    const stop = subscribeMotion(({ x, y, source }) => {
      if (source !== 'gyro') return;
      if (!on) {
        on = true;
        root.classList.add('gyro-on');
      }
      target.x = x;
      target.y = y;
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });

    return () => {
      stop();
      cancelAnimationFrame(raf);
      root.classList.remove('gyro-on');
    };
  }, []);

  return null;
}
