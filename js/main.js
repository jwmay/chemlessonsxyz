/* ==========================================================================
   chemlessons.xyz — shared behavior
   (loaded at the end of <body>, so the DOM is ready when this runs)
   ========================================================================== */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Font Awesome fallback ----------
   Pages start with .no-fa on <html>, so every icon shows its data-fb emoji
   immediately. Once the Font Awesome kit is detected, the class is removed
   and real icons take over. If the kit is never configured (or fails to
   load), the emoji simply stay. */
(function detectFontAwesome() {
  let checks = 0;
  const timer = setInterval(() => {
    checks++;
    const probe = document.createElement("i");
    probe.className = "fa-solid fa-flask";
    probe.style.cssText = "position:absolute;visibility:hidden;";
    document.body.appendChild(probe);
    const font = getComputedStyle(probe).fontFamily || "";
    probe.remove();
    const webfont = /font awesome/i.test(font);
    const svgMode = !!document.querySelector("svg.svg-inline--fa");
    if (webfont || svgMode) {
      document.documentElement.classList.remove("no-fa");
      clearInterval(timer);
    } else if (checks >= 40) {
      // ~10s without Font Awesome: give up and keep the emoji fallback
      clearInterval(timer);
    }
  }, 250);
})();

/* ---------- Icon helper (shared with page renderers) ---------- */
function iconHTML(classes, fallback, style = "") {
  return `<i class="${classes}" data-fb="${fallback}" aria-hidden="true"${style ? ` style="${style}"` : ""}></i>`;
}

/* ---------- Course tracks ----------
   The active track (Conceptual vs. Mathematical Chemistry) is shared across
   the homepage tile grid and the curriculum page. Initial track comes from
   the URL hash: #conceptual / #mathematical, or a unit deep link like
   #mathematical-unit-6. */
window.ACTIVE_TRACK = (function initialTrack() {
  if (typeof TRACKS === "undefined") return "";
  const hash = (location.hash || "").slice(1);
  if (TRACKS.some((t) => t.id === hash)) return hash;
  const owner = TRACKS.find((t) => t.units.some((u) => u.id === hash));
  return owner ? owner.id : TRACKS[0].id;
})();

function renderUnitTiles() {
  const tileGrid = document.querySelector("[data-unit-tiles]");
  if (!tileGrid || typeof TRACKS === "undefined") return;
  const track = TRACKS.find((t) => t.id === window.ACTIVE_TRACK) || TRACKS[0];
  tileGrid.innerHTML = track.units
    .map(
      (u) => `
      <a class="unit-tile" data-track="${track.id}" data-badge="${track.badge}" href="curriculum.html#${u.id}">
        <span class="tile-num">${u.num}</span>
        <span class="tile-symbol">${u.symbol}</span>
        <span class="tile-name">${u.title}</span>
      </a>`
    )
    .join("");
}

function setTrack(id) {
  window.ACTIVE_TRACK = id;
  const track = typeof TRACKS !== "undefined" && TRACKS.find((t) => t.id === id);
  document.querySelectorAll("[data-track-switch] .track-btn").forEach((btn) => {
    const on = btn.dataset.track === id;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-selected", String(on));
  });
  document.querySelectorAll("[data-track-tagline]").forEach((el) => {
    el.textContent = track ? track.tagline : "";
  });
  renderUnitTiles();
  document.dispatchEvent(new CustomEvent("trackchange", { detail: id }));
}

/* ---------- Wire shared data into the page ----------
   Runs before the counter/reveal observers below so placeholders like
   data-count="RESOURCES" are resolved before any animation reads them. */
(function wireData() {
  // Footer copyright year — the markup ships a hardcoded year as a no-JS
  // fallback; refresh it to the current year on load so it never goes stale.
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // dynamic stats (homepage)
  if (typeof TRACKS !== "undefined") {
    const allUnits = TRACKS.flatMap((t) => t.units);
    const totalResources = allUnits.reduce((sum, u) => sum + u.resources.length, 0);
    const fill = (placeholder, value) => {
      document.querySelectorAll(`[data-count='${placeholder}']`).forEach((el) => {
        el.dataset.count = value;
      });
    };
    fill("RESOURCES", totalResources);
    fill("UNITS", allUnits.length);
    fill("UNITSPER", Math.max(...TRACKS.map((t) => t.units.length)));
    fill("TRACKS", TRACKS.length);
  }

  // educator-access links from data.js (fall back to assessments page info)
  if (typeof SITE !== "undefined") {
    document.querySelectorAll("[data-request-access]").forEach((el) => {
      if (SITE.requestAccessUrl) {
        // External Google Form — open in a new tab so the site stays put
        el.href = SITE.requestAccessUrl;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
      } else {
        el.href = "assessments.html#request";
      }
    });
    document.querySelectorAll("[data-site-email]").forEach((el) => {
      el.href = `mailto:${SITE.email}`;
      if (!el.textContent.trim()) el.textContent = SITE.email;
    });
    document.querySelectorAll("[data-chem-cash]").forEach((el) => {
      // External app — open in a new tab so the site stays put
      el.href = SITE.chemCashUrl;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    });
  }

  // course track switcher (homepage + curriculum page)
  if (typeof TRACKS !== "undefined") {
    document.querySelectorAll("[data-track-switch]").forEach((wrap) => {
      wrap.setAttribute("role", "tablist");
      wrap.innerHTML = TRACKS.map(
        (t) => `
        <button class="track-btn" role="tab" data-track="${t.id}" aria-selected="false">
          ${iconHTML(t.icon, t.fb)} ${t.label}
        </button>`
      ).join("");
      wrap.addEventListener("click", (e) => {
        const btn = e.target.closest(".track-btn");
        if (btn) setTrack(btn.dataset.track);
      });
    });
    setTrack(window.ACTIVE_TRACK);
  }

  // slide decks gallery (slides page)
  const deckGrid = document.querySelector("[data-deck-grid]");
  if (deckGrid && typeof DECKS !== "undefined") {
    deckGrid.innerHTML = DECKS.map(
      (d) => `
      <article class="deck-card">
        <div class="deck-thumb">${iconHTML(d.icon, d.fb)}</div>
        <div class="deck-body">
          <div class="deck-unit">${d.track ? `${d.track} · ` : ""}${d.unit}</div>
          <h3>${d.title}</h3>
          <p>${d.description}</p>
          <div class="deck-actions">
            <a class="btn btn-primary btn-sm" href="${d.url}">
              ${iconHTML("fa-solid fa-play", "▶")} Open deck
            </a>
          </div>
        </div>
      </article>`
    ).join("");
  }
})();

/* ---------- Header: shadow on scroll ---------- */
const header = document.querySelector(".site-header");
if (header) {
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Mobile nav ---------- */
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  mainNav.addEventListener("click", (e) => {
    if (e.target.closest("a")) mainNav.classList.remove("open");
  });
}

/* ---------- Scroll reveal ---------- */
(function initReveal() {
  const targets = document.querySelectorAll(".reveal, .stagger");
  if (!targets.length) return;
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  targets.forEach((el) => io.observe(el));
})();

/* ---------- Animated counters ---------- */
(function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    if (prefersReducedMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animate);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => io.observe(el));
})();

/* ---------- Hero: floating molecule network ----------
   Atoms drift slowly; nearby atoms get "bonds" drawn between them,
   echoing the node-and-bond letterforms in the logo. */
(function initMoleculeCanvas() {
  const canvas = document.querySelector(".hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const hero = canvas.parentElement;

  const BLUE = [63, 110, 166];
  const ORANGE = [221, 151, 78];
  const BOND_DIST = 130;

  let atoms = [];
  let width = 0;
  let height = 0;
  let raf = null;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = hero.offsetWidth;
    height = hero.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const count = Math.min(Math.floor((width * height) / 24000), 64);
    atoms = Array.from({ length: count }, () => {
      const orange = Math.random() < 0.3;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: orange ? 3 + Math.random() * 3 : 2 + Math.random() * 2.5,
        color: orange ? ORANGE : BLUE,
        alpha: 0.35 + Math.random() * 0.4,
      };
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // bonds
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const a = atoms[i];
        const b = atoms[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < BOND_DIST) {
          const alpha = (1 - dist / BOND_DIST) * 0.22;
          ctx.strokeStyle = `rgba(${BLUE[0]}, ${BLUE[1]}, ${BLUE[2]}, ${alpha})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // atoms
    for (const a of atoms) {
      const [r, g, b] = a.color;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a.alpha})`;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function tick() {
    for (const a of atoms) {
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < -10) a.x = width + 10;
      if (a.x > width + 10) a.x = -10;
      if (a.y < -10) a.y = height + 10;
      if (a.y > height + 10) a.y = -10;
    }
    draw();
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (raf === null && !prefersReducedMotion) raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      draw();
    }, 150);
  });

  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });

  resize();
  draw(); // static frame for reduced-motion users
  start();
})();
