/**
 * Public site behaviour: typing headline, sticky header state, scroll progress,
 * mobile navigation, scroll reveal and active section tracking.
 */

type TypedConstructor = new (el: string, options: Record<string, unknown>) => unknown;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Typing headline */
const typing = document.querySelector<HTMLElement>('.typing');
const Typed = (window as unknown as { Typed?: TypedConstructor }).Typed;

if (typing && Typed && !reduceMotion) {
  let strings = [typing.textContent ?? ''];
  try {
    const parsed = JSON.parse(typing.dataset.strings ?? '[]');
    if (Array.isArray(parsed) && parsed.length) strings = parsed.map(String);
  } catch {
    /* keep the fallback string */
  }

  new Typed('.typing', {
    strings,
    loop: true,
    typeSpeed: 70,
    backSpeed: 35,
    backDelay: 1800,
    smartBackspace: true,
  });
}

/* Header state, scroll progress and back-to-top */
const header = document.getElementById('site-header');
const toTop = document.querySelector<HTMLElement>('.to-top');
const progress = document.querySelector<HTMLElement>('.scroll-progress');

function onScroll() {
  const y = window.scrollY || window.pageYOffset;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;

  header?.classList.toggle('is-scrolled', y > 16);
  toTop?.classList.toggle('is-visible', y > 600);

  if (progress) {
    progress.style.transform = `scaleX(${scrollable > 0 ? Math.min(y / scrollable, 1) : 0})`;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* Mobile menu */
const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
const mobileNav = document.getElementById('mobile-nav');

function setMenu(open: boolean) {
  document.body.classList.toggle('menu-open', open);
  toggle?.setAttribute('aria-expanded', String(open));
  toggle?.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  mobileNav?.setAttribute('aria-hidden', String(!open));
  mobileNav?.classList.toggle('is-open', open);
}

toggle?.addEventListener('click', () => {
  setMenu(!document.body.classList.contains('menu-open'));
});

mobileNav?.addEventListener('click', (event) => {
  if ((event.target as HTMLElement).closest('a')) setMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) setMenu(false);
});

/* Scroll reveal */
const revealItems = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );

  revealItems.forEach((el) => revealObserver.observe(el));
}

/* Active nav link */
const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-links a'));
const sections = navLinks
  .map((link) => document.querySelector<HTMLElement>(link.getAttribute('href') ?? ''))
  .filter((section): section is HTMLElement => Boolean(section));

if ('IntersectionObserver' in window && sections.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of navLinks) {
          const isActive = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('is-active', isActive);
          if (isActive) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        }
      }
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  );

  sections.forEach((section) => navObserver.observe(section));
}
