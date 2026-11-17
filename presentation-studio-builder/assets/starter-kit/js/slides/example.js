/* =========================================================
   slides de exemplo — copie e adapte. Cada slide = { id, num, act, actName, actPage, title, theme, cls, html, build }.
   build(sec) devolve { tl, beats:[[labelId, nome], ...] }. Cada momento termina onde o próximo label começa;
   use pad(tl, t) no fim do momento para fixar a duração (o engine pausa entre momentos conforme o preset).
   ========================================================= */
(() => {
  "use strict";
  const { $, $$, EASE, head, fadeUp, stamp, counter, pad, hide, line, mark } = window.PSB;

  /* ---------- exemplo 1 · abertura (fundo escuro) ---------- */
  function buildOpen(sec) {
    const chips = $(".ex-chips", sec);
    hide(chips, { y: 28 });
    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.paper } });
    tl.addLabel("titulo", 0);
    head(tl, sec, 0.2, 1.3, 1.0);
    fadeUp(tl, chips, 1.4);
    pad(tl, 3.2);
    return { tl, beats: [["titulo", "Título"]] };
  }

  /* ---------- exemplo 2 · problema → transformação → carimbo (fundo claro) ---------- */
  function buildFlow(sec) {
    const cards = $$(".ex-card", sec), st = $(".ex-stamp", sec);
    hide(cards, { y: 40 }); hide(st);
    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.paper } });
    tl.addLabel("problema", 0);
    head(tl, sec, 0.1, 1.2, 99);
    cards.forEach((c, i) => tl.to(c, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.9 + i * 0.3));
    pad(tl, 3.0);
    tl.addLabel("veredito");
    stamp(tl, st, "veredito", -5);
    pad(tl, 4.2);
    return { tl, beats: [["problema", "O problema"], ["veredito", "O veredito"]] };
  }

  /* ---------- exemplo 3 · big numbers com contador (fundo claro) ---------- */
  function buildKpi(sec) {
    const cards = $$(".ex-kpi", sec);
    hide(cards, { y: 40 });
    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.paper } });
    tl.addLabel("numeros", 0);
    head(tl, sec, 0.1, 1.2, 99);
    cards.forEach((c, i) => { tl.to(c, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.9 + i * 0.3); counter(tl, $("[data-count]", c), 1.1 + i * 0.3, 1.1); });
    pad(tl, 4.0);
    return { tl, beats: [["numeros", "Números"]] };
  }

  window.PSB_DEFS.push(
    {
      id: "s01", num: "01", act: "01", actName: "Abertura", actPage: "1/3", title: "Abertura", theme: "dark", cls: "ex-open", build: buildOpen,
      html: `<div class="ex-head"><div class="eyebrow">Eyebrow · contexto</div>
          <h1 class="headline">${line("Título com a mensagem")}${line("principal e " + mark("destaque."))}</h1>
          <p class="subhead">Subtítulo curto: uma frase que sustenta o título.</p></div>
        <div class="ex-chips"><span class="chip">Chip um</span><span class="chip">Chip dois</span><span class="chip">Chip três</span></div>`,
    },
    {
      id: "s02", num: "02", act: "01", actName: "Abertura", actPage: "2/3", title: "Problema e veredito", theme: "light", cls: "ex-flow", build: buildFlow,
      html: `<div class="ex-head"><div class="eyebrow">O problema</div>
          <h2 class="headline">${line("Um título que carrega")}${line("a " + mark("mensagem.", "accent"))}</h2></div>
        <div class="ex-cards">${["Ponto um", "Ponto dois", "Ponto três"].map((t) => `<div class="ex-card paper-dark"><b>${t}</b><p>Texto de apoio curto.</p></div>`).join("")}</div>
        <div class="ex-stamp"><span class="vox-stamp vox-stamp--ok" style="font-size:28px">Resolvido</span></div>`,
    },
    {
      id: "s03", num: "03", act: "01", actName: "Abertura", actPage: "3/3", title: "Números", theme: "light", cls: "ex-kpis", build: buildKpi,
      html: `<div class="ex-head"><div class="eyebrow">Resultados</div><h2 class="headline">${line("Até três números")}${line("por " + mark("assunto."))}</h2></div>
        <div class="ex-kpirow">${[[12, "horas"], [43, "casos"], [99, "%"]].map(([n, u]) => `<div class="ex-kpi paper-dark"><div class="v"><span data-count="${n}">0</span><small>${u}</small></div><div class="d">Legenda do número, com a fonte.</div></div>`).join("")}</div>`,
    }
  );
})();
