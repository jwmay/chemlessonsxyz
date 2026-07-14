/* ==========================================================================
   chemlessons.xyz — curriculum page renderer
   Renders TRACKS (js/data.js) into per-course panels of semester sections
   with filterable, accordion-style unit cards. The course switcher lives in
   main.js (setTrack) and broadcasts "trackchange" events.
   ========================================================================== */

(function () {
  const root = document.querySelector("[data-curriculum]");
  if (!root || typeof TRACKS === "undefined") return;

  const KIND_ORDER = ["notebook", "slides", "assignment", "lab", "activity", "assessment"];

  // Resource types whose Google Drive file exposes a first-page thumbnail we
  // can show as a hover preview. Others (gform, html, video, link) don't.
  const PREVIEWABLE = new Set(["gdoc", "gsheet", "gslides", "pdf"]);
  // Pull the Drive file id out of a /d/<id>/ style url (preview or /view).
  function driveId(url) {
    const m = /\/d\/([^/?#]+)/.exec(url || "");
    return m ? m[1] : "";
  }

  let activeKind = "all";
  let searchTerm = "";

  /* ---------- rendering ---------- */

  function resourceHTML(res) {
    const type = RESOURCE_TYPES[res.type] || RESOURCE_TYPES.link;
    const soon = !res.url;
    const previewId = !soon && PREVIEWABLE.has(res.type) ? driveId(res.url) : "";
    const title = soon
      ? `<span>${res.title}</span>`
      : `<a href="${res.url}" target="_blank" rel="noopener"${previewId ? ` data-preview="${previewId}"` : ""}>${res.title}</a>`;
    const badge = soon
      ? `<span class="soon-badge">In progress</span>`
      : `<span class="type-badge" style="background:${type.color}">${type.label}</span>`;
    const copy = res.copyUrl
      ? `<a class="copy-link" href="${res.copyUrl}" target="_blank" rel="noopener">${iconHTML("fa-solid fa-copy", "📋")} Make a copy</a>`
      : "";
    return `
      <li class="resource-item${soon ? " soon" : ""}" data-kind="${res.kind}" data-search="${(res.title + " " + type.label).toLowerCase()}">
        <span class="resource-icon" style="background:${type.color}">${iconHTML(type.icon, type.fb)}</span>
        <span class="resource-title">${title}</span>
        <span class="resource-actions">${badge}${copy}</span>
      </li>`;
  }

  function unitHTML(unit, track) {
    const groups = KIND_ORDER.filter((k) => unit.resources.some((r) => r.kind === k));
    const groupsHTML = groups
      .map((kind) => {
        const meta = RESOURCE_KINDS[kind];
        const items = unit.resources.filter((r) => r.kind === kind).map(resourceHTML).join("");
        const lock =
          kind === "assessment"
            ? `<a class="lock-note" data-request-access href="assessments.html">
                 ${iconHTML("fa-solid fa-lock", "🔒")} Verified educators only — request access
               </a>`
            : "";
        return `
          <div class="resource-group" data-group="${kind}">
            <div class="resource-group-label">${iconHTML(meta.icon, meta.fb)} ${meta.label}</div>
            <ul class="resource-list">${items}</ul>
            ${lock}
          </div>`;
      })
      .join("");

    const trackChip = `<span class="track-chip">${track.short}</span>`;

    // Optional companion-game chip (unit.game in data.js) → Chem Cash deep link
    // (the #slug fragment scrolls to the games section with that game's tab active)
    const gameChip = unit.game
      ? `<a class="game-note" href="${SITE.chemCashUrl}#${unit.game.slug}"
            target="_blank" rel="noopener noreferrer">
            ${iconHTML("fa-duotone fa-solid fa-gamepad", "🎮")} Companion game on Chem Cash: ${unit.game.title}
         </a>`
      : "";

    return `
      <article class="unit" id="${unit.id}" data-track="${track.id}"
               data-search="${(unit.title + " " + unit.topics.join(" ")).toLowerCase()}">
        <button class="unit-header" aria-expanded="false" aria-controls="${unit.id}-panel">
          <span class="unit-element">
            <span class="el-num">${unit.num}</span>
            <span class="el-symbol">${unit.symbol}</span>
          </span>
          <span class="unit-title-wrap">
            <h3>Unit ${unit.num}: ${unit.title}${trackChip}</h3>
            <span class="unit-meta">
              <span>${iconHTML("fa-duotone fa-solid fa-calendar-days", "🗓️")} ${unit.weeks}</span>
              <span>${iconHTML("fa-duotone fa-solid fa-files", "📚")} <span data-res-count>${unit.resources.length}</span> resources</span>
            </span>
          </span>
          <span class="unit-chevron">${iconHTML("fa-solid fa-chevron-down", "▾")}</span>
        </button>
        <div class="unit-panel" id="${unit.id}-panel">
          <div class="unit-panel-inner">
            <div class="unit-body">
              <p class="unit-desc">${unit.description}</p>
              <div class="topic-tags">
                ${unit.topics.map((t) => `<span class="topic-tag">${t}</span>`).join("")}
              </div>
              ${gameChip}
              ${groupsHTML}
            </div>
          </div>
        </div>
      </article>`;
  }

  function trackPanelHTML(track) {
    const semesters = [...new Set(track.units.map((u) => u.semester))].sort();
    const sections = semesters
      .map((sem) => {
        const units = track.units
          .filter((u) => u.semester === sem)
          .map((u) => unitHTML(u, track))
          .join("");
        return `
          <section class="semester" data-semester="${sem}">
            <div class="semester-heading">
              <h2>Semester ${sem}</h2>
            </div>
            ${units}
          </section>`;
      })
      .join("");
    return `<div class="track-panel" data-track-panel="${track.id}">${sections}</div>`;
  }

  function render() {
    root.innerHTML =
      TRACKS.map(trackPanelHTML).join("") +
      `
      <div class="no-results">
        <span class="hand">No reaction detected!</span>
        <p>No resources match that filter. Try a different search or type.</p>
      </div>`;

    // accordion toggles
    root.querySelectorAll(".unit-header").forEach((btn) => {
      btn.addEventListener("click", () => {
        const unit = btn.closest(".unit");
        const open = unit.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      });
    });

    // re-wire request-access links injected here
    if (typeof SITE !== "undefined") {
      root.querySelectorAll("[data-request-access]").forEach((el) => {
        el.href = SITE.requestAccessUrl || "assessments.html#request";
      });
    }
  }

  /* ---------- hover thumbnail preview ----------
     On hover/focus of a resource link, float a card with the Drive file's
     first-page thumbnail. Desktop pointers only; the card only appears once
     the image actually loads, so files that aren't public (or have no
     thumbnail yet) simply show nothing — never a broken image. */
  function initResourcePreview() {
    const fine =
      window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;

    const pop = document.createElement("div");
    pop.className = "res-preview";
    pop.setAttribute("aria-hidden", "true");
    pop.innerHTML =
      '<div class="res-preview-frame"><img alt="" decoding="async" referrerpolicy="no-referrer"></div>';
    document.body.appendChild(pop);
    const img = pop.querySelector("img");

    const failed = new Set();
    let currentId = null;
    let anchor = null;
    let timer = null;

    function position() {
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      const pw = pop.offsetWidth;
      const ph = pop.offsetHeight;
      const left = Math.max(12, Math.min(r.left, window.innerWidth - pw - 12));
      let top = r.top - ph - 10;
      if (top < 12) top = r.bottom + 10;
      pop.style.left = left + "px";
      pop.style.top = top + "px";
    }

    function show(a) {
      const id = a.dataset.preview;
      if (!id || failed.has(id)) return;
      currentId = id;
      anchor = a;
      pop.classList.add("open");
      pop.classList.remove("ready");
      if (img.dataset.id === id && img.complete && img.naturalWidth > 0) {
        pop.classList.add("ready");
      } else {
        img.dataset.id = id;
        img.src = "https://drive.google.com/thumbnail?id=" + id + "&sz=w600";
      }
      position();
    }

    function hide() {
      clearTimeout(timer);
      timer = null;
      currentId = null;
      anchor = null;
      pop.classList.remove("open", "ready");
    }

    img.addEventListener("load", () => {
      if (img.dataset.id === currentId && img.naturalWidth > 0) {
        pop.classList.add("ready");
        position();
      }
    });
    img.addEventListener("error", () => {
      failed.add(img.dataset.id);
      if (img.dataset.id === currentId) hide();
    });

    root.addEventListener("mouseover", (e) => {
      const a = e.target.closest("a[data-preview]");
      if (!a || a === anchor) return;
      clearTimeout(timer);
      timer = setTimeout(() => show(a), 140);
    });
    root.addEventListener("mouseout", (e) => {
      const a = e.target.closest("a[data-preview]");
      if (a && !(e.relatedTarget && a.contains(e.relatedTarget))) hide();
    });
    root.addEventListener("focusin", (e) => {
      const a = e.target.closest("a[data-preview]");
      if (a) show(a);
    });
    root.addEventListener("focusout", (e) => {
      if (e.target.closest("a[data-preview]")) hide();
    });
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hide();
    });
  }

  /* ---------- track visibility ---------- */

  function showActiveTrack() {
    root.querySelectorAll(".track-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.trackPanel === window.ACTIVE_TRACK);
    });
    applyFilters();
  }

  /* ---------- filtering (scoped to the active track panel) ---------- */

  function applyFilters() {
    const activePanel = root.querySelector(".track-panel.active");
    if (!activePanel) return;
    const term = searchTerm.trim().toLowerCase();
    let visibleResources = 0;

    activePanel.querySelectorAll(".unit").forEach((unitEl) => {
      let unitMatches = 0;

      unitEl.querySelectorAll(".resource-item").forEach((item) => {
        const kindOk = activeKind === "all" || item.dataset.kind === activeKind;
        const searchOk =
          !term ||
          item.dataset.search.includes(term) ||
          unitEl.dataset.search.includes(term);
        const show = kindOk && searchOk;
        item.style.display = show ? "" : "none";
        if (show) unitMatches++;
      });

      // hide groups with no visible items
      unitEl.querySelectorAll(".resource-group").forEach((group) => {
        const any = [...group.querySelectorAll(".resource-item")].some(
          (i) => i.style.display !== "none"
        );
        group.style.display = any ? "" : "none";
      });

      unitEl.style.display = unitMatches ? "" : "none";
      const countEl = unitEl.querySelector("[data-res-count]");
      if (countEl) countEl.textContent = unitMatches;

      // auto-expand while filtering
      const filtering = activeKind !== "all" || term;
      if (filtering && unitMatches) {
        unitEl.classList.add("open");
        unitEl.querySelector(".unit-header").setAttribute("aria-expanded", "true");
      }

      visibleResources += unitMatches;
    });

    // hide empty semester sections
    activePanel.querySelectorAll(".semester").forEach((sem) => {
      const any = [...sem.querySelectorAll(".unit")].some((u) => u.style.display !== "none");
      sem.style.display = any ? "" : "none";
    });

    const empty = root.querySelector(".no-results");
    if (empty) empty.style.display = visibleResources ? "none" : "block";

    const counter = document.querySelector("[data-filter-count]");
    if (counter) {
      counter.textContent = `${visibleResources} resource${visibleResources === 1 ? "" : "s"}`;
    }
  }

  const searchInput = document.querySelector("[data-search-input]");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchTerm = searchInput.value;
      applyFilters();
    });
  }

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeKind = chip.dataset.kind;
      applyFilters();
    });
  });

  /* ---------- boot ---------- */

  render();
  initResourcePreview();

  // main.js has already resolved the initial track from the URL hash
  showActiveTrack();

  // course switch (fired by setTrack in main.js)
  document.addEventListener("trackchange", (e) => {
    showActiveTrack();
    // keep the hash meaningful when the user switches courses manually,
    // unless it already points at a unit in the newly selected track
    const hash = (location.hash || "").slice(1);
    const track = TRACKS.find((t) => t.id === e.detail);
    if (track && !track.units.some((u) => u.id === hash)) {
      history.replaceState(null, "", "#" + track.id);
    }
  });

  // deep link: curriculum.html#mathematical-unit-6 opens that unit in its course
  const hash = (location.hash || "").slice(1);
  if (hash) {
    const target = document.getElementById(hash);
    if (target && target.classList.contains("unit")) {
      target.classList.add("open");
      target.querySelector(".unit-header").setAttribute("aria-expanded", "true");
      setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }
  }
})();
