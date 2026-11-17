#!/usr/bin/env node
/* contact-sheet.js — junta várias capturas em uma folha de contato (revisão visual rápida).
   Uso:  node contact-sheet.js <saida.png> <colunas> <img1.png> <img2.png> ... */
const path = require("path"), fs = require("fs");
const env = require("./_env");
(async () => {
  const [outp, cols, ...imgs] = process.argv.slice(2);
  if (!outp || !cols || !imgs.length) { console.log("uso: node contact-sheet.js <saida.png> <colunas> <imagens...>"); process.exit(1); }
  const missing = imgs.filter((f) => !fs.existsSync(f));
  if (missing.length) env.fail("Imagens não encontradas: " + missing.join(", "));
  const puppeteer = env.puppeteer(), exe = env.chrome();
  const c = +cols, w = Math.floor(1900 / c), h = Math.round((w * 9) / 16), rows = Math.ceil(imgs.length / c);
  const cells = imgs.map((f) => `<figure style="margin:0;position:relative"><img src="data:image/png;base64,${fs.readFileSync(f).toString("base64")}" style="width:${w}px;height:${h}px;display:block"><figcaption style="position:absolute;left:6px;top:4px;background:#000c;color:#fff;font:12px monospace;padding:2px 6px">${path.basename(f, ".png")}</figcaption></figure>`).join("");
  const html = `<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(${c},${w}px);gap:4px;width:${w * c + 4 * (c - 1)}px">${cells}</body>`;
  const browser = await puppeteer.launch({ executablePath: exe, headless: "new" });
  const page = await browser.newPage(); await page.setViewport({ width: w * c + 4 * (c - 1), height: h * rows + 4 * (rows - 1) });
  await page.setContent(html); await page.screenshot({ path: outp }); await browser.close();
  console.log("folha salva em", path.resolve(outp));
})();
