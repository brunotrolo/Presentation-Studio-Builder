#!/usr/bin/env node
/* capture.js — verificador visual dos slides.
   Uso:  node capture.js <index.html> <pasta-de-saida> <ids|all> [frações=0.35,0.7,1]
   Para cada slide: congela a timeline em frações da duração, salva PNG 1920x1080 e checa
   (a) elementos visíveis fora do palco, (b) cortes de overflow, (c) erros de console no carregamento.
   Saída com código 1 se houver alerta ou erro. Requer o engine do starter-kit (window.__psb). */
const path = require("path");
const fs = require("fs");
const env = require("./_env");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const [file, out, idsArg = "all", fr = "0.35,0.7,1"] = process.argv.slice(2);
  if (!file || !out) { console.log("uso: node capture.js <index.html> <saida> <ids|all> [frações]"); process.exit(1); }
  if (!fs.existsSync(file)) env.fail("Arquivo não encontrado: " + file);
  const puppeteer = env.puppeteer(), exe = env.chrome();
  fs.mkdirSync(out, { recursive: true });
  const base = "file:///" + path.resolve(file).split(path.sep).join("/");
  const browser = await puppeteer.launch({ executablePath: exe, headless: "new", args: ["--allow-file-access-from-files", ...env.extraArgs()] });
  const page = await browser.newPage(); const errs = []; let problems = 0;
  page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) errs.push(m.type() + " " + m.text()); });
  page.on("requestfailed", (r) => errs.push("REQFAIL " + r.url()));
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(base, { waitUntil: "load" }); await sleep(1500);
  const hasApi = await page.evaluate(() => !!(window.__psb && window.__psb.RT));
  if (!hasApi) { await browser.close(); env.fail("window.__psb não existe. O index.html precisa carregar js/engine.js (starter-kit). Erros de página:\n" + errs.join("\n")); }
  const all = await page.evaluate(() => window.__psb.RT.map((r) => r.id));
  const ids = idsArg === "all" ? all : idsArg.split(",");
  const unknown = ids.filter((i) => !all.includes(i));
  if (unknown.length) { await browser.close(); env.fail("Slides inexistentes: " + unknown.join(", ") + "\nDisponíveis: " + all.join(" ")); }
  console.log("slides carregados:", all.length, "→", all.join(" "));
  for (const id of ids) {
    const dur = await page.evaluate((id) => { window.__psb.freeze(id, 0.05); return window.__psb.dur(); }, id);
    await sleep(250);
    const fracs = fr.split(",").map(Number);
    for (let i = 0; i < fracs.length; i++) {
      const t = Math.max(0.05, dur * fracs[i] - (fracs[i] >= 1 ? 0.001 : 0));
      await page.evaluate((id, t) => window.__psb.freeze(id, t), id, t); await sleep(450);
      await page.screenshot({ path: path.join(out, `${id}_${"abcdefgh"[i]}.png`) });
    }
    const bad = await page.evaluate((id) => {
      const sec = document.querySelector(`.slide[data-id="${id}"]`), res = [];
      const cls = (e) => (typeof e.className === "string" ? e.className : "").slice(0, 30);
      sec.querySelectorAll("*").forEach((e) => {
        const cs = getComputedStyle(e); if (cs.visibility === "hidden" || +cs.opacity < 0.05) return;
        let n = e, hidden = false; while (n && n !== sec) { const c = getComputedStyle(n); if (c.visibility === "hidden" || +c.opacity < 0.05) { hidden = true; break; } n = n.parentElement; } if (hidden) return;
        const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
        const tag = e.tagName.toLowerCase(); if (["svg", "path", "circle", "g", "i", "rect", "polygon", "line"].includes(tag) && e.closest("svg")) return;
        if (r.right > 1926 || r.left < -6 || r.bottom > 1086 || r.top < -6) res.push(`${tag}.${cls(e)} [${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}]`);
        if (e.scrollWidth > e.clientWidth + 3 && cs.overflow !== "visible" && cs.overflowX !== "visible") res.push(`CORTE ${tag}.${cls(e)} sw=${e.scrollWidth} cw=${e.clientWidth}`);
      });
      return res.slice(0, 8);
    }, id);
    if (bad.length) problems++;
    console.log(`${id}: duração ${dur.toFixed(1)}s ${bad.length ? "· ALERTAS: " + bad.join(" | ") : "· sem estouro"}`);
  }
  console.log(errs.length ? "ERROS:\n" + errs.join("\n") : "sem erros no console");
  console.log(`\nimagens em ${path.resolve(out)} — LEIA as imagens (ou monte uma folha com contact-sheet.js) antes de dar o slide como pronto.`);
  await browser.close();
  process.exit(problems || errs.length ? 1 : 0);
})();
