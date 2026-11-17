/* =========================================================
   ENGINE — modo Apresentação e modo Studio (starter-kit do Presentation Studio Builder)
   • Entrou no slide → o motion toca sozinho (sem scroll).
   • Setas: → avança (ou libera uma pausa) · ← volta ao slide anterior já no estado final;
     toques repetidos em ← continuam retrocedendo, slide a slide.
   • Ritmo = preset v2 por slide: velocidade global + TRECHOS de velocidade + PAUSAS em qualquer
     instante da linha do tempo (automáticas em segundos ou manuais).
   • ?studio abre o Studio (linha do tempo, cursor, marcas). Sem ?studio = Apresentação (travada).
   ========================================================= */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const params = new URLSearchParams(location.search);
  const STUDIO = params.has("studio") || params.has("preset");
  const CFG = Object.assign({ storageKey: "psb.deck.v1", sectionLabel: "Seção", sectionTotal: "", glow: {}, studioTitle: "Modo Studio" }, window.PSB_CONFIG || {});
  const LS_KEY = CFG.storageKey;
  const TOTAL = (window.PSB_DEFS || []).length;
  const PANEL_W = 600;
  const stage = $("#stage");
  const cue = $(".next-cue");
  const r2 = (n) => Math.round(n * 20) / 20; // grade de 0,05 s

  /* ---------------- escala do palco ---------------- */
  function fit() {
    const pw = STUDIO && document.body.classList.contains("preset-open") ? PANEL_W : 0;
    document.documentElement.style.setProperty("--panel-w", pw + "px");
    const w = window.innerWidth - pw, h = window.innerHeight;
    stage.style.setProperty("--s", Math.min(w / 1920, h / 1080));
  }
  addEventListener("resize", fit);

  /* ---------------- slides: o HTML original é restaurado e a timeline reconstruída ao entrar ---------------- */
  function mount(rt) {
    if (rt.tl) rt.tl.kill();
    rt.el.innerHTML = rt.pristine;
    rt.el.removeAttribute("style");
    gsap.set(rt.el, { autoAlpha: 0 });
    const built = rt.def.build(rt.el);
    const tl = built.tl, dur = tl.duration();
    rt.tl = tl; rt.layout = built.layout; rt.exit = built.exit; rt.onTick = built.onTick;
    const labels = built.beats.map(([id, name]) => ({ id, name, from: tl.labels[id] }));
    labels.forEach((b, i) => { b.to = i + 1 < labels.length ? labels[i + 1].from : dur; });
    rt.beats = labels;
  }
  // Slides em ordem de apresentação; seções com "html" são criadas aqui (as demais já estão no index.html)
  const DEFS = [...window.PSB_DEFS].sort((a, b) => +a.num - +b.num);
  DEFS.forEach((d) => { if (d.html && !$(`.slide[data-id="${d.id}"]`)) $(".slides").insertAdjacentHTML("beforeend", `<section class="slide ${d.cls || ""}" data-id="${d.id}">${d.html}</section>`); });
  const RT = DEFS.map((def) => {
    const el = $(`.slide[data-id="${def.id}"]`);
    const rt = { ...def, def, el, pristine: el.innerHTML, tl: null };
    mount(rt);
    return rt;
  });

  /* ---------------- preset v2 ----------------
     slides[id] = { speed, pauses:[{t, hold, mode:'auto'|'manual'}], ramps:[{from, to, speed}] } */
  const dur = (rt) => rt.tl.duration();
  function norm(rt, s) {
    const D = dur(rt), out = { speed: 1, theme: rt.theme || "light", hidden: false, pauses: [], ramps: [] };
    if (!s) return out;
    out.theme = ["dark", "light", "paper"].includes(s.theme) ? s.theme : out.theme;
    out.hidden = !!s.hidden;
    out.speed = Math.min(3, Math.max(0.2, +s.speed || 1));
    (s.pauses || []).forEach((p) => { const t = r2(Math.min(D, Math.max(0.05, +p.t || 0))); out.pauses.push({ t, hold: Math.max(0, +p.hold || 0), mode: p.mode === "manual" ? "manual" : "auto" }); });
    out.pauses.sort((a, b) => a.t - b.t);
    (s.ramps || []).forEach((r) => { const f = r2(Math.max(0, +r.from || 0)), to = r2(Math.min(D, +r.to || 0)); if (to - f >= 0.1) out.ramps.push({ from: f, to, speed: Math.min(3, Math.max(0.2, +r.speed || 1)) }); });
    return out;
  }
  function resolveDefault(rt, d) {
    const o = { speed: d.speed, theme: d.theme, hidden: d.hidden, pauses: [], ramps: [] };
    (d.pauses || []).forEach((p) => { let t = p.t; if (p.after) { const b = rt.beats.find((x) => x.id === p.after); if (!b) return; t = b.to; } o.pauses.push({ t, hold: p.hold == null ? 1 : p.hold, mode: p.mode }); });
    (d.ramps || []).forEach((r) => { let f = r.from, to = r.to; if (r.beat) { const b = rt.beats.find((x) => x.id === r.beat); if (!b) return; f = b.from; to = b.to; } o.ramps.push({ from: f, to, speed: r.speed }); });
    return o;
  }
  function loadPreset() {
    const p = { version: 2, slides: {} };
    const def = window.PSB_PRESET_DEFAULT && window.PSB_PRESET_DEFAULT.slides || {};
    let saved = null;
    try { const s = localStorage.getItem(LS_KEY); if (s) saved = JSON.parse(s); } catch (e) { /* ignora */ }
    RT.forEach((rt) => {
      // sem marcação salva nem padrão explícito: respiro automático de 0,6 s depois de cada momento (exceto o último)
      const auto = { speed: 1, theme: rt.theme, hidden: false, ramps: [], pauses: rt.beats.slice(0, -1).map((b) => ({ t: b.to, hold: 0.6, mode: "auto" })) };
      const src = saved && saved.slides && saved.slides[rt.id] ? saved.slides[rt.id] : (def[rt.id] ? resolveDefault(rt, def[rt.id]) : auto);
      p.slides[rt.id] = norm(rt, src);
    });
    return p;
  }
  let preset = loadPreset();
  const cfg = (rt) => preset.slides[rt.id];
  const isHidden = (rt) => !!cfg(rt).hidden;
  // próximo/anterior slide VISÍVEL a partir de base (slides ocultos são pulados por completo)
  function step(base, dir) { for (let i = base + dir; i >= 0 && i < RT.length; i += dir) if (!isHidden(RT[i])) return i; return -1; }
  function applyTheme(rt) {
    const t = cfg(rt).theme;
    ["light", "paper"].forEach((n) => { stage.classList.toggle("theme-" + n, t === n); document.body.classList.toggle("theme-" + n, t === n); });
  }
  const pad2 = (n) => String(n).padStart(2, "0");

  /* ---------------- estado e motor de reprodução ---------------- */
  const S = { idx: -1, pos: 0, state: "idle", holdLeft: 0, armT: 0, exitTl: null, pendingIdx: null, last: performance.now() };
  const rampAt = (c, pos) => { let s = 1; c.ramps.forEach((r) => { if (pos >= r.from && pos < r.to) s = r.speed; }); return s; };

  function tick() {
    const now = performance.now(), dt = Math.min(0.1, (now - S.last) / 1000); S.last = now;
    const rt = RT[S.idx]; if (!rt) return;
    if (S.state === "armed") { S.armT -= dt; if (S.armT <= 0) S.state = "playing"; }
    else if (S.state === "hold") { S.holdLeft -= dt; if (S.holdLeft <= 0) S.state = "playing"; }
    else if (S.state === "playing") {
      const c = cfg(rt), D = dur(rt);
      let np = S.pos + dt * Math.max(0.05, c.speed * rampAt(c, S.pos));
      const p = c.pauses.find((x) => x.t > S.pos + 1e-6 && x.t <= np + 1e-9);
      if (p) np = p.t;
      if (np >= D) np = D;
      S.pos = np; rt.tl.time(np);
      if (p) {
        if (p.mode === "manual") { S.state = "waiting"; cue.classList.add("show"); }
        else if (p.hold > 0) { S.state = "hold"; S.holdLeft = p.hold; }
      }
      if (np >= D && S.state === "playing") S.state = "done";
    }
    if (rt.onTick && S.state !== "idle") rt.onTick(gsap.ticker.time);
    ui.onProgress();
  }
  gsap.ticker.add(tick);

  const glow = CFG.glow; // { slideId: [x, y, scale] } desloca o brilho do fundo por slide
  function hud(rt) {
    $("#hudAct").innerHTML = `${CFG.sectionLabel} <strong>${rt.act}</strong>${CFG.sectionTotal ? " / " + CFG.sectionTotal : ""} · ${rt.actName}`;
    // paginação do rodapé considera os slides ocultos (o guia da marca pede "n / total" corretos)
    const hiddenAll = RT.filter(isHidden), before = hiddenAll.filter((r) => +r.num < +rt.num).length;
    $("#footNum").innerHTML = `<b>${pad2(+rt.num - before)}</b> / ${TOTAL - hiddenAll.length}`;
    const [ai, at] = rt.actPage.split("/").map(Number), sameAct = hiddenAll.filter((r) => r.act === rt.act);
    $("#footAct").textContent = `${CFG.sectionLabel} ${rt.act} · ${ai - sameAct.filter((r) => +r.num < +rt.num).length}/${at - sameAct.length}`;
    const g = glow[rt.id] || [0, 0, 1];
    gsap.to(".bg__glow", { x: g[0], y: g[1], scale: g[2], duration: 1.4, ease: "power2.out", overwrite: true });
  }

  // modos: "play" (toca sozinho), "final" (estado final), "paused" (parado no começo — Studio)
  function activate(i, mode) {
    const rt = RT[i];
    S.idx = i; S.pos = 0;
    cue.classList.remove("show");
    stage.classList.remove("on-paper");
    applyTheme(rt);
    RT.forEach((o) => { if (o !== rt) gsap.set(o.el, { autoAlpha: 0 }); });
    mount(rt);
    gsap.set(rt.el, { autoAlpha: 1 });
    if (rt.layout) rt.layout();
    hud(rt);
    if (mode === "final") { rt.tl.progress(1); S.pos = dur(rt); S.state = "done"; gsap.fromTo(rt.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }); }
    else if (mode === "paused") S.state = "paused";
    else { S.state = "armed"; S.armT = 0.3; }
    ui.onSlide();
  }

  function goTo(i, opts = {}) {
    if (i < 0 || i >= RT.length) return;
    if (S.exitTl) { S.exitTl.kill(); S.exitTl = null; }       // toque novo interrompe a transição anterior
    if (i === S.idx && !opts.force) {
      // voltou para o slide de onde estava saindo: cancela o avanço e mostra o slide atual completo
      if (S.pendingIdx != null) { S.pendingIdx = null; activate(S.idx, "final"); }
      return;
    }
    S.pendingIdx = i;                                         // destino em andamento (toques rápidos somam)
    const leaving = S.idx >= 0 ? RT[S.idx] : null;
    S.state = "idle"; cue.classList.remove("show");
    const enter = () => { S.exitTl = null; S.pendingIdx = null; activate(i, opts.mode || "play"); };
    if (leaving && !opts.instant) {
      const x = leaving.exit ? leaving.exit() : gsap.timeline().to(leaving.el, { autoAlpha: 0, duration: 0.35, ease: "power2.in" });
      S.exitTl = x; x.eventCallback("onComplete", enter);
    } else enter();
  }

  // posiciona a timeline em t (para voltar no tempo, reconstrói o slide: estado sempre limpo)
  function seek(t) {
    const rt = RT[S.idx]; if (!rt) return;
    t = Math.max(0, Math.min(dur(rt), t));
    if (t < S.pos - 1e-6) { stage.classList.remove("on-paper"); mount(rt); gsap.set(rt.el, { autoAlpha: 1 }); if (rt.layout) rt.layout(); }
    rt.tl.time(t); S.pos = t; S.state = "paused"; cue.classList.remove("show");
  }
  function playFrom(t) { seek(t); S.state = "playing"; }

  function next() {
    if (S.state === "waiting" || S.state === "hold") { cue.classList.remove("show"); S.state = "playing"; return; }
    const t = step(S.pendingIdx != null ? S.pendingIdx : S.idx, 1);
    if (t >= 0) goTo(t);
  }
  function prev() {
    const t = step(S.pendingIdx != null ? S.pendingIdx : S.idx, -1);
    if (t >= 0) goTo(t, { mode: "final", instant: true });
    else if (S.pendingIdx != null) goTo(S.idx, { mode: "final", instant: true }); // cancela um avanço em andamento
  }
  function replay() { goTo(S.idx, { force: true, instant: true }); }

  /* ---------------- ir para o slide N ---------------- */
  const gotoBox = document.createElement("div");
  gotoBox.className = "goto"; gotoBox.innerHTML = `<label>Ir para o slide <input type="text" inputmode="numeric" maxlength="2" id="gotoIn" placeholder="${RT.map((r) => r.num).join(" · ")}"></label>`;
  $(".viewport").appendChild(gotoBox);
  const gotoIn = $("#gotoIn", gotoBox);
  function openGoto() { gotoBox.classList.add("show"); gotoIn.value = ""; gotoIn.focus(); }
  function closeGoto() { gotoBox.classList.remove("show"); gotoIn.blur(); }
  gotoIn.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeGoto();
    if (e.key === "Enter") { const i = RT.findIndex((r) => r.num === gotoIn.value.padStart(2, "0") && !isHidden(r)); closeGoto(); if (i >= 0) goTo(i, { mode: "play", instant: true, force: true }); }
    e.stopPropagation();
  });

  /* ---------------- teclado ---------------- */
  addEventListener("keydown", (e) => {
    if (e.target.closest && e.target.closest("input,select,textarea")) return;
    const k = e.key;
    if (["ArrowRight", "PageDown", " ", "Enter"].includes(k)) { e.preventDefault(); next(); }
    else if (["ArrowLeft", "PageUp", "Backspace"].includes(k)) { e.preventDefault(); prev(); }
    else if (k === "Home") { e.preventDefault(); const f = step(-1, 1); if (f >= 0) goTo(f, { mode: "play", instant: true, force: true }); }
    else if (k === "End") { e.preventDefault(); const l = step(RT.length, -1); if (l >= 0) goTo(l, { mode: "final", instant: true }); }
    else if (k === "g" || k === "G") { e.preventDefault(); openGoto(); }
    else if (STUDIO && (k === "r" || k === "R")) replay();
    else if (STUDIO && (k === "p" || k === "P")) ui.toggle();
    else if (STUDIO && (k === "m" || k === "M")) ui.markNow();
  });

  /* =========================================================
     STUDIO
     ========================================================= */
  const ui = { onProgress() {}, onSlide() {}, toggle() {}, markNow() {} };
  if (STUDIO) {
    document.body.classList.add("preset-mode", "preset-open");
    const panel = document.createElement("aside");
    panel.className = "preset-panel pp studio";
    panel.innerHTML = `<div class="pp__head"><h2>${CFG.studioTitle}</h2><p>Clique ou arraste na <b>linha do tempo</b> para ver qualquer instante. Marque <b>pausas</b> (por tempo ou manuais) e <b>trechos de velocidade</b> em qualquer ponto. Ao salvar, o modo Apresentação (sem <b>?studio</b>) respeita exatamente isso.</p><div class="pp__total" id="ppTotal"></div><div class="pp__state" id="ppState"></div></div><div class="pp__list" id="ppList"></div><div class="pp__foot"><button class="primary" id="ppSave">Salvar</button><button id="ppExport">Exportar JSON</button><button id="ppImport">Importar JSON</button><button id="ppCopy">Copiar JSON</button><button id="ppReset">Restaurar padrão</button><input type="file" id="ppFile" accept="application/json,.json" hidden></div>`;
    document.body.appendChild(panel);
    const toast = document.createElement("div"); toast.className = "pp__toast"; document.body.appendChild(toast);
    const badge = document.createElement("div"); badge.className = "pp__badge"; badge.textContent = "MODO STUDIO · M marca pausa agora · P painel · R repete o slide · G vai ao slide"; document.body.appendChild(badge);
    const say = (m) => { toast.textContent = m; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 1700); };
    const fmt = (s) => { const m = Math.floor(s / 60), r = Math.round(s % 60); return m ? `${m}min ${String(r).padStart(2, "0")}s` : `${r}s`; };
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    // duração estimada de um slide com o ritmo atual (integra a velocidade ao longo do tempo da timeline)
    function slideDur(rt) {
      const c = cfg(rt), D = dur(rt); let t = 0, x = 0, manual = 0;
      while (x < D) { const dx = Math.min(0.02, D - x); t += dx / (c.speed * rampAt(c, x)); x += dx; }
      c.pauses.forEach((p) => { if (p.mode === "manual") manual++; else t += p.hold; });
      return { t, manual };
    }
    function calcTotals() {
      let total = 0, man = 0;
      let hid = 0;
      RT.forEach((rt) => { const { t, manual } = slideDur(rt); if (isHidden(rt)) hid++; else { total += t; man += manual; } const d = $(`.ps[data-id="${rt.id}"] [data-dur]`); if (d) d.textContent = isHidden(rt) ? "oculto da apresentação" : `≈ ${fmt(t)}${manual ? ` · ${manual} pausa(s) manual` : ""}`; });
      $("#ppTotal").textContent = `Total (${RT.length - hid} slides): ≈ ${fmt(total)}${man ? ` + ${man} pausa(s) manual` : ""}${hid ? ` · ${hid} oculto(s)` : ""}`;
    }

    let ruler = null; // régua do slide aberto
    function drawRuler(rt) {
      if (!ruler) return;
      const c = cfg(rt), D = dur(rt), x = (t) => (t / D) * 100 + "%";
      let h = "";
      for (let s = 0; s <= Math.floor(D); s++) h += `<div class="tl-tick" style="left:${x(s)}"><b>${s}s</b></div>`;
      rt.beats.forEach((b, i) => { h += `<div class="tl-flag" style="left:${x(b.from)};top:${i % 2 ? 22 : 4}px">${b.name}</div>`; });
      c.ramps.forEach((r, i) => { h += `<div class="tl-ramp" data-ramp="${i}" style="left:${x(r.from)};width:${((r.to - r.from) / D) * 100}%"><i data-ramp="${i}" data-edge="L"></i><span>V${i + 1} · ${r.speed}×</span><i data-ramp="${i}" data-edge="R"></i></div>`; });
      c.pauses.forEach((p, i) => { h += `<div class="tl-pause ${p.mode}" data-pause="${i}" title="Pausa ${i + 1} · ${p.mode === "manual" ? "manual" : p.hold + "s"}" style="left:${x(p.t)}"><b data-pause="${i}">${i + 1}</b></div>`; });
      h += `<div class="tl-cursor" style="left:${x(S.pos)}"></div>`;
      ruler.innerHTML = h;
    }

    function rowsHTML(rt) {
      const c = cfg(rt);
      const pr = c.pauses.map((p, i) => `<div class="tr tr--p" data-pi="${i}"><span class="num ${p.mode === "manual" ? "num--m" : ""}">${i + 1}</span><input type="number" step="0.05" min="0.05" value="${p.t}" data-f="t"><input type="number" step="0.5" min="0" value="${p.hold}" data-f="hold" ${p.mode === "manual" ? "disabled" : ""}><select data-f="mode"><option value="auto" ${p.mode === "auto" ? "selected" : ""}>auto</option><option value="manual" ${p.mode === "manual" ? "selected" : ""}>manual</option></select><button data-act="seek" title="Ir para este ponto">⌖</button><button data-act="del-p" title="Remover">✕</button></div>`).join("");
      const rr = c.ramps.map((r, i) => `<div class="tr tr--r" data-ri="${i}"><span class="num num--r">V${i + 1}</span><input type="number" step="0.05" min="0" value="${r.from}" data-f="from"><input type="number" step="0.05" min="0" value="${r.to}" data-f="to"><input type="number" step="0.05" min="0.2" max="3" value="${r.speed}" data-f="speed"><button data-act="seek-r" title="Ir para o começo do trecho">⌖</button><button data-act="del-r" title="Remover">✕</button></div>`).join("");
      return `<div class="tr tr--h"><span></span><span>Pausa em (s)</span><span>Duração (s)</span><span>Tipo</span><span></span><span></span></div>${pr || `<div class="empty">Nenhuma pausa. Use “Pausar aqui” ou a tecla M.</div>`}<div class="tr tr--h tr--hr"><span></span><span>Trecho de (s)</span><span>até (s)</span><span>Veloc.</span><span></span><span></span></div>${rr || `<div class="empty">Velocidade normal em todo o slide.</div>`}`;
    }

    function renderList() {
      const list = $("#ppList"); list.innerHTML = ""; ruler = null;
      RT.forEach((rt, idx) => {
        const open = idx === S.idx;
        const hid = isHidden(rt), th = cfg(rt).theme;
        const sec = document.createElement("section"); sec.className = "ps" + (open ? " open cur" : "") + (hid ? " is-hidden" : ""); sec.dataset.id = rt.id;
        sec.innerHTML = `<div class="ps__top" data-act="open"><div><b>Slide ${rt.num} · ${rt.title}</b>${hid ? `<span class="ps__tag">OCULTO</span>` : ""}<div class="ps__dur" data-dur></div></div><label class="ps__hide" title="Ocultar este slide por completo da apresentação"><input type="checkbox" data-hide ${hid ? "checked" : ""}> Ocultar</label><span class="ps__chev">${open ? "▾" : "▸"}</span></div>` + (open ? `
          <div class="tl-theme"><span>Fundo do slide</span><button class="${th === "light" ? "on" : ""}" data-act="theme-light">Claro</button><button class="${th === "dark" ? "on" : ""}" data-act="theme-dark">Escuro</button><button class="${th === "paper" ? "on" : ""}" data-act="theme-paper">Papel (recortes)</button></div>
          <div class="tl-tools"><button data-act="play-slide">▶ Slide</button><button data-act="play-cursor">▶ Do cursor</button><button class="warn" data-act="add-pause">⏸ Pausar aqui</button><button data-act="add-ramp">⏩ Velocidade aqui</button></div>
          <label class="ps__speed"><span>Velocidade do slide</span><input type="range" min="0.3" max="2" step="0.05" value="${cfg(rt).speed}" data-speed><output data-out>${cfg(rt).speed.toFixed(2)}×</output></label>
          <div class="tl-ruler" data-ruler></div>
          <div class="tl-legend"><span><i class="lg lg--p"></i>pausa automática</span><span><i class="lg lg--m"></i>pausa manual</span><span><i class="lg lg--r"></i>trecho de velocidade</span></div>
          <div class="tl-rows" data-rows>${rowsHTML(rt)}</div>` : "");
        list.appendChild(sec);
        if (open) { ruler = $("[data-ruler]", sec); drawRuler(rt); }
      });
      calcTotals();
    }
    ui.onSlide = renderList;

    ui.onProgress = () => {
      const rt = RT[S.idx]; if (!rt) return;
      const cur = ruler && $(".tl-cursor", ruler); if (cur) cur.style.left = (S.pos / dur(rt)) * 100 + "%";
      const label = { playing: "▶ reproduzindo", hold: "⏸ pausa automática", waiting: "⏸ pausa manual (→ continua)", paused: "● parado no cursor", done: "■ fim do slide", armed: "… iniciando", idle: "" }[S.state] || "";
      const e = $("#ppState"); if (e) e.textContent = `Slide ${rt.num} · ${S.pos.toFixed(2)}s / ${dur(rt).toFixed(2)}s · ${label}`;
    };
    ui.toggle = () => { document.body.classList.toggle("preset-open"); fit(); };

    function refreshSlide() { const rt = RT[S.idx]; const rows = $("[data-rows]", panel); if (rows) rows.innerHTML = rowsHTML(rt); drawRuler(rt); calcTotals(); }
    function addPause(t, hold = 2, mode = "auto") { const rt = RT[S.idx], c = cfg(rt); c.pauses.push({ t: r2(clamp(t, 0.05, dur(rt))), hold, mode }); c.pauses.sort((a, b) => a.t - b.t); refreshSlide(); }
    ui.markNow = () => { addPause(S.pos); say(`Pausa marcada em ${r2(S.pos).toFixed(2)}s`); };

    /* cliques do painel */
    panel.addEventListener("click", (e) => {
      if (e.target.closest(".ps__hide")) return;             // a caixa "Ocultar" não abre/fecha o cartão
      const b = e.target.closest("[data-act]"); if (!b) return;
      const sec = b.closest(".ps"), rt = byId(sec.dataset.id), idx = RT.indexOf(rt), act = b.dataset.act;
      if (/^theme-(light|dark|paper)$/.test(act)) { cfg(rt).theme = act.slice(6); if (rt === RT[S.idx]) applyTheme(rt); renderList(); return; }
      if (act === "open") { if (idx !== S.idx) goTo(idx, { instant: true, mode: "paused", force: true }); return; }
      if (act === "play-slide") goTo(idx, { instant: true, mode: "play", force: true });
      if (act === "play-cursor") playFrom(S.state === "done" ? 0 : S.pos);
      if (act === "add-pause") { addPause(S.pos); }
      if (act === "add-ramp") { const c = cfg(rt), f = r2(S.pos), to = r2(Math.min(dur(rt), f + 2)); if (to - f >= 0.1) { c.ramps.push({ from: f, to, speed: 0.6 }); refreshSlide(); } }
      const row = b.closest(".tr");
      if (act === "del-p" && row) { cfg(rt).pauses.splice(+row.dataset.pi, 1); refreshSlide(); }
      if (act === "del-r" && row) { cfg(rt).ramps.splice(+row.dataset.ri, 1); refreshSlide(); }
      if (act === "seek" && row) { seek(cfg(rt).pauses[+row.dataset.pi].t); }
      if (act === "seek-r" && row) { seek(cfg(rt).ramps[+row.dataset.ri].from); }
    });
    /* edição por campos */
    panel.addEventListener("input", (e) => {
      const sec = e.target.closest(".ps"); if (!sec) return;
      const rt = byId(sec.dataset.id), c = cfg(rt);
      if (e.target.matches("[data-speed]")) { c.speed = +e.target.value; $("[data-out]", sec).textContent = c.speed.toFixed(2) + "×"; calcTotals(); return; }
      const row = e.target.closest(".tr"); if (!row || !e.target.dataset.f) return;
      const f = e.target.dataset.f;
      if (row.dataset.pi != null) {
        const p = c.pauses[+row.dataset.pi];
        if (f === "t") p.t = r2(clamp(+e.target.value || 0.05, 0.05, dur(rt)));
        if (f === "hold") p.hold = Math.max(0, +e.target.value || 0);
        if (f === "mode") { p.mode = e.target.value; $("[data-f=hold]", row).disabled = p.mode === "manual"; $(".num", row).classList.toggle("num--m", p.mode === "manual"); }
      } else if (row.dataset.ri != null) {
        const r = c.ramps[+row.dataset.ri];
        if (f === "from") r.from = r2(clamp(+e.target.value || 0, 0, r.to - 0.1));
        if (f === "to") r.to = r2(clamp(+e.target.value || 0, r.from + 0.1, dur(rt)));
        if (f === "speed") r.speed = clamp(+e.target.value || 1, 0.2, 3);
      }
      drawRuler(rt); calcTotals();
    });
    panel.addEventListener("change", (e) => {
      if (e.target.matches("[data-hide]")) { const rt = byId(e.target.closest(".ps").dataset.id); cfg(rt).hidden = e.target.checked; renderList(); if (RT[S.idx]) hud(RT[S.idx]); say(cfg(rt).hidden ? `Slide ${rt.num} oculto da apresentação` : `Slide ${rt.num} voltou à apresentação`); return; }
      if (e.target.dataset.f === "t") { const rt = RT[S.idx]; cfg(rt).pauses.sort((a, b) => a.t - b.t); refreshSlide(); } });

    /* ligação visual marco ↔ linha da lista: passar o mouse num destaca o par */
    function link(e, on) {
      const m = e.target.closest("[data-pause],[data-ramp],.tr--p,.tr--r"); if (!m) return;
      const sec = m.closest(".ps"); if (!sec) return;
      let i, kind;
      if (m.dataset.pause != null) { kind = "p"; i = m.dataset.pause; } else if (m.dataset.ramp != null) { kind = "r"; i = m.dataset.ramp; }
      else if (m.dataset.pi != null) { kind = "p"; i = m.dataset.pi; } else if (m.dataset.ri != null) { kind = "r"; i = m.dataset.ri; } else return;
      $$(kind === "p" ? `.tl-pause[data-pause="${i}"], .tr--p[data-pi="${i}"]` : `.tl-ramp[data-ramp="${i}"], .tr--r[data-ri="${i}"]`, sec).forEach((el) => el.classList.toggle("hl", on));
    }
    panel.addEventListener("pointerover", (e) => link(e, true));
    panel.addEventListener("pointerout", (e) => link(e, false));

    /* régua: cursor, marcas e bordas dos trechos arrastáveis */
    let drag = null, raf = 0, lastT = 0;
    panel.addEventListener("pointerdown", (e) => {
      const rl = e.target.closest("[data-ruler]"); if (!rl) return;
      rl.setPointerCapture(e.pointerId);
      const t = e.target;
      drag = t.dataset.pause != null ? { k: "pause", i: +t.dataset.pause } : t.dataset.edge ? { k: "edge", i: +t.dataset.ramp, edge: t.dataset.edge } : { k: "cursor" };
      move(e);
    });
    function timeAt(e) { const r = ruler.getBoundingClientRect(); return r2(clamp(((e.clientX - r.left) / r.width) * dur(RT[S.idx]), 0, dur(RT[S.idx]))); }
    function move(e) {
      if (!drag || !ruler) return;
      const rt = RT[S.idx], c = cfg(rt), t = timeAt(e);
      if (drag.k === "pause") { c.pauses[drag.i].t = Math.max(0.05, t); drawRuler(rt); const inp = $(`.tr[data-pi="${drag.i}"] [data-f=t]`); if (inp) inp.value = c.pauses[drag.i].t; }
      if (drag.k === "edge") { const r = c.ramps[drag.i]; if (drag.edge === "L") r.from = Math.min(t, r.to - 0.1); else r.to = Math.max(t, r.from + 0.1); drawRuler(rt); const row = $(`.tr[data-ri="${drag.i}"]`); if (row) { $("[data-f=from]", row).value = r.from; $("[data-f=to]", row).value = r.to; } }
      lastT = t;
      if (drag.k !== "edge" && !raf) raf = requestAnimationFrame(() => { raf = 0; seek(lastT); });
    }
    panel.addEventListener("pointermove", (e) => { if (drag) move(e); });
    const end = () => { if (!drag) return; const k = drag.k; drag = null; if (k === "pause") { cfg(RT[S.idx]).pauses.sort((a, b) => a.t - b.t); } refreshSlide(); };
    panel.addEventListener("pointerup", end); panel.addEventListener("pointercancel", end);

    /* salvar / exportar / importar */
    const stamp = () => { preset.updated = new Date().toISOString(); return JSON.stringify(preset, null, 2); };
    $("#ppSave").onclick = () => { try { localStorage.setItem(LS_KEY, stamp()); say("Salvo. O modo Apresentação usará estes ajustes."); } catch (e) { say("Não foi possível salvar (use Exportar)"); } };
    $("#ppExport").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([stamp()], { type: "application/json" })); a.download = "marcacao-de-tempo.json"; a.click(); say("Arquivo exportado"); };
    $("#ppCopy").onclick = () => { navigator.clipboard && navigator.clipboard.writeText(stamp()).then(() => say("JSON copiado")); };
    $("#ppImport").onclick = () => $("#ppFile").click();
    $("#ppFile").onchange = (e) => { const f = e.target.files[0]; if (!f) return; f.text().then((t) => { try { const j = JSON.parse(t); if (j.version !== 2) throw new Error("v"); RT.forEach((rt) => { preset.slides[rt.id] = norm(rt, j.slides && j.slides[rt.id]); }); renderList(); say("Marcação importada"); } catch (err) { say("Arquivo inválido ou de formato antigo"); } }); };
    $("#ppReset").onclick = () => { localStorage.removeItem(LS_KEY); preset = loadPreset(); renderList(); say("Padrão restaurado"); };
  }

  function byId(id) { return RT.find((r) => r.id === id); }

  /* ---------------- API de teste ---------------- */
  window.__psb = {
    RT, S, goTo, next, prev, replay, seek, playFrom, preset: () => preset, dur: () => dur(RT[S.idx]),
    hide(id, v) { const rt = byId(id); cfg(rt).hidden = !!v; if (RT[S.idx]) hud(RT[S.idx]); ui.onSlide(); },
    theme(id, t) { const rt = byId(id); cfg(rt).theme = t; if (rt === RT[S.idx]) applyTheme(rt); ui.onSlide(); },
    freeze(id, t) { goTo(RT.findIndex((r) => r.id === id), { instant: true, mode: "paused", force: true }); seek(t); },
  };

  /* ---------------- partida ---------------- */
  fit();
  const start = () => {
    const asked = RT.findIndex((r) => r.id === params.get("slide"));
    const first = asked >= 0 && (STUDIO || !isHidden(RT[asked])) ? asked : step(-1, 1);
    goTo(Math.max(0, first), { instant: true, force: true, mode: STUDIO ? "paused" : "play" });
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
})();
