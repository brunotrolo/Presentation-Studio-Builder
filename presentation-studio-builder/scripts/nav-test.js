#!/usr/bin/env node
/* nav-test.js — teste de navegação do engine: setas, Home/End, voltar, ocultar slide e numeração.
   Uso:  node nav-test.js <index.html> [idParaOcultar]
   Sai com código 1 se a navegação não chegar ao fim, se a numeração do rodapé não bater ou se houver erro de console. */
const path = require("path"), fs = require("fs");
const env = require("./_env");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const file = process.argv[2], hideId = process.argv[3];
  if (!file) { console.log("uso: node nav-test.js <index.html> [idParaOcultar]"); process.exit(1); }
  if (!fs.existsSync(file)) env.fail("Arquivo não encontrado: " + file);
  const puppeteer = env.puppeteer(), exe = env.chrome();
  const b = await puppeteer.launch({ executablePath: exe, headless: "new", args: ["--allow-file-access-from-files", ...env.extraArgs()] });
  const p = await b.newPage(); const errs = []; let ok = true;
  p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await p.setViewport({ width: 1920, height: 1080 });
  await p.goto("file:///" + path.resolve(file).split(path.sep).join("/"), { waitUntil: "load" }); await sleep(1500);
  if (!(await p.evaluate(() => !!(window.__psb && window.__psb.RT)))) { await b.close(); env.fail("window.__psb não existe: carregue js/engine.js.\n" + errs.join("\n")); }
  const foot = () => p.evaluate(() => document.getElementById("footNum").textContent.replace(/\s+/g, " ").trim());
  const n = await p.evaluate(() => window.__psb.RT.length), last = String(n).padStart(2, "0") + " / " + n;
  const check = (label, got, want) => { const pass = got === want; if (!pass) ok = false; console.log(pass ? "ok   " : "FALHA", label, "→", got, pass ? "" : `(esperado ${want})`); };
  check("início", await foot(), "01 / " + n);
  for (let i = 0; i < n * 8; i++) { await p.keyboard.press("ArrowRight"); await sleep(50); } await sleep(600);
  check("após muitas setas →", await foot(), last);
  await p.keyboard.press("Home"); await sleep(900); check("Home", await foot(), "01 / " + n);
  await p.keyboard.press("End"); await sleep(1200); check("End", await foot(), last);
  const back = Math.min(2, n - 1);
  for (let i = 0; i < back; i++) { await p.keyboard.press("ArrowLeft"); await sleep(900); }
  check(`${back}x ←`, await foot(), String(n - back).padStart(2, "0") + " / " + n);
  if (hideId) {
    await p.evaluate((id) => window.__psb.hide(id, true), hideId); await sleep(300);
    await p.keyboard.press("Home"); await sleep(800); check(`com ${hideId} oculto`, await foot(), "01 / " + (n - 1));
  }
  console.log(errs.length ? "ERROS " + errs.join(" | ") : "sem erros de console"); if (errs.length) ok = false;
  await b.close(); process.exit(ok ? 0 : 1);
})();
