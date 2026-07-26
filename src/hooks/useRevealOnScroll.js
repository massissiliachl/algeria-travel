import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const inViewport = (el) => {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.bottom > 40 && rect.top < vh * 0.95;
};

/**
 * Active les éléments [data-reveal] au scroll (classe .is-in).
 * Relancé à chaque changement de route (pathname).
 */
export function useRevealOnScroll() {
  const location = useLocation();

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = new WeakSet();

    const mark = (el) => {
      el.classList.add('is-in', 'revealed');
    };

    const io = reduce
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const el = entry.target;
              const delay = Number(el.getAttribute('data-delay') || 0);
              window.setTimeout(() => mark(el), delay);
              io.unobserve(el);
            });
          },
          { threshold: 0.05, rootMargin: '0px 0px -4% 0px' }
        );

    const attach = (el) => {
      if (!(el instanceof Element) || seen.has(el)) return;
      seen.add(el);

      if (reduce || inViewport(el)) {
        const delay = Number(el.getAttribute('data-delay') || 0);
        if (reduce || delay === 0) mark(el);
        else window.setTimeout(() => mark(el), delay);
        return;
      }

      io.observe(el);
    };

    const scan = () => {
      document.querySelectorAll('[data-reveal]').forEach(attach);
    };

    // Double rAF : laisse React peindre la page détail avant le scan
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      scan();
      raf2 = window.requestAnimationFrame(scan);
    });

    // Sécurité : si quelque chose reste invisible, on révèle après paint
    const safety = window.setTimeout(scan, 120);

    const mo = new MutationObserver(() => {
      scan();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(safety);
      mo.disconnect();
      io?.disconnect();
    };
  }, [location.pathname]);
}

export default useRevealOnScroll;
