/* =========================================================
   kit.js — auxiliares de motion e de layout para os slides.
   Uso:  const { $, $$, EASE, head, fadeUp, stamp, counter, pad, ... } = window.PSB;
   Regras do motion (references/04-motion-system.md): animar só transform, opacity (autoAlpha) e
   stroke-dashoffset; sombras duras ficam estáticas; cada slide é UMA timeline pausada, dividida em
   momentos (labels). O engine toca a timeline; nunca use ScrollTrigger nem timers soltos aqui.
   ========================================================= */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const NS = "http://www.w3.org/2000/svg";

  // Curvas oficiais da casa (references/04-motion-system.md, tabela de easings)
  const EASE = { paper: "power3.out", stamp: "back.out(1.8)", marker: "power2.inOut", compress: "expo.inOut", exit: "power2.in" };

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const pad = (tl, t) => tl.to({}, { duration: 0.001 }, t);       // garante duração mínima: define o FIM de um momento
  const hide = (t, extra = {}) => gsap.set(t, { autoAlpha: 0, ...extra });
  const fadeUp = (tl, t, at, d = 0.6) => tl.fromTo(t, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: d, ease: EASE.paper }, at);
  const barIn = (tl, el, at) => tl.to(el, { scaleX: 1, duration: 0.55, ease: EASE.marker }, at);   // marca-texto: scaleX, nunca width
  const draw = (tl, paths, at, d = 0.9, stagger = 0.12) => tl.to(paths, { strokeDashoffset: 0, duration: d, ease: EASE.marker, stagger }, at);
  const prep = (paths) => gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });            // exige pathLength="1" no SVG
  const stamp = (tl, el, at, rot = 0) => tl.fromTo(el, { scale: 1.55, autoAlpha: 0, rotation: rot - 5 }, { scale: 1, autoAlpha: 1, rotation: rot, duration: 0.42, ease: EASE.stamp }, at);

  // título: cada .line > span sobe de dentro de uma máscara
  function headlineIn(tl, sec, at) {
    const lines = $$(".headline .line > span", sec);
    gsap.set(lines, { yPercent: 115 });
    tl.to(lines, { yPercent: 0, duration: 0.85, ease: EASE.paper, stagger: 0.13 }, at);
  }
  // cabeçalho padrão: eyebrow, título com marca-texto e subtítulo (aplique em TODO slide com .eyebrow/.headline)
  function head(tl, sec, at = 0.1, barAt = 1.2, subAt = 0.9) {
    const eb = $(".eyebrow", sec), sub = $(".subhead", sec), bar = $$(".vox-mark__bar", sec);
    gsap.set([eb, sub].filter(Boolean), { autoAlpha: 0, y: 24 });
    gsap.set(bar, { scaleX: 0, skewX: -6 });                       // sem isto o marca-texto fica invisível e o texto preto some no fundo escuro
    if (eb) fadeUp(tl, eb, at);
    headlineIn(tl, sec, at + 0.1);
    if (bar.length) barIn(tl, bar, barAt);
    if (sub) fadeUp(tl, sub, subAt);
  }
  // contador animado; o alvo vem de data-count="N"
  function counter(tl, el, at, dur = 0.9) {
    const target = Number(el.dataset.count), proxy = { v: 0 };
    el.textContent = "0";
    tl.to(proxy, { v: target, duration: dur, ease: "power2.out", onUpdate: () => { el.textContent = Math.round(proxy.v).toLocaleString("pt-BR"); } }, at);
  }

  // HTML pequeno para montar slides sem repetir marcação
  const line = (txt) => `<span class="line"><span>${txt}</span></span>`;
  const mark = (txt, cor = "highlight") => `<span class="vox-mark vox-mark--${cor}"><span class="vox-mark__bar"></span>${txt}</span>`;
  const svgEl = (parent, tag, attrs = {}) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); parent.appendChild(e); return e; };

  // aleatório determinístico (o mesmo slide sempre nasce igual) e recorte de papel rasgado
  function seeded(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function tornPoly(seed, amp = 7, step = 3) {
    const r = seeded(seed), n = Math.max(8, Math.round(100 / step)), p = [];
    for (let i = 0; i <= n; i++) p.push(`${((i / n) * 100).toFixed(1)}% ${(r() * amp).toFixed(1)}px`);
    for (let i = 1; i <= 6; i++) p.push(`calc(100% - ${(r() * amp * 0.8).toFixed(1)}px) ${((i / 6) * 100).toFixed(1)}%`);
    for (let i = n; i >= 0; i--) p.push(`${((i / n) * 100).toFixed(1)}% calc(100% - ${(r() * amp).toFixed(1)}px)`);
    for (let i = 5; i >= 1; i--) p.push(`${(r() * amp * 0.8).toFixed(1)}px ${((i / 6) * 100).toFixed(1)}%`);
    return `polygon(${p.join(",")})`;
  }
  function offsetIn(el, root) { let x = 0, y = 0, n = el; while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x, y, w: el.offsetWidth, h: el.offsetHeight }; }

  window.PSB_DEFS = window.PSB_DEFS || [];
  window.PSB = { $, $$, EASE, clamp, pad, hide, fadeUp, barIn, draw, prep, stamp, headlineIn, head, counter, line, mark, svgEl, seeded, tornPoly, offsetIn };
})();
