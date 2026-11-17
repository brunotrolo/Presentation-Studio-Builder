#!/usr/bin/env node
/* lint-deck.js — validação determinística de um projeto de apresentação (starter-kit).
   Uso:  node lint-deck.js <pasta-do-projeto> [--strict]
   Não precisa de navegador nem de dependências. Carrega kit.js, os slides e o preset num contexto isolado
   (vm) e confere regras que a linguagem sozinha não garante:
     ERRO  id/num duplicados ou ausentes · build sem timeline pausada · momentos (beats) sem label ·
           marca-texto (.vox-mark) sem animação (head()/barIn) · preset apontando para slide/momento inexistente ·
           termo proibido ou padrão de dado real (lint.config.json) no HTML dos slides · slide que não carrega
     AVISO número em destaque sem palavra de fonte/estimativa · excesso de números · tema inválido ·
           classe CSS do slide colidindo com classe global · fonte inline muito pequena · cls repetida
   Saída: código 1 se houver ERRO (ou AVISO com --strict). */
const fs = require("fs"), path = require("path"), vm = require("vm");

const dir = process.argv[2], strict = process.argv.includes("--strict");
if (!dir || !fs.existsSync(path.join(dir, "index.html"))) { console.error("uso: node lint-deck.js <pasta-do-projeto> [--strict]\n(a pasta precisa conter index.html)"); process.exit(2); }

const read = (p) => fs.readFileSync(path.join(dir, p), "utf8");
let cfg = { forbiddenTerms: [], forbiddenPatterns: [], sourceWords: ["fonte", "estimativa", "amostra", "medido"], maxHighlightNumbersPerSlide: 3, minInlineFontPx: 13 };
if (fs.existsSync(path.join(dir, "lint.config.json"))) { try { cfg = { ...cfg, ...JSON.parse(read("lint.config.json")) }; } catch (e) { console.error("lint.config.json inválido:", e.message); process.exit(2); } }

const issues = []; // {sev, slide, msg}
const E = (slide, msg) => issues.push({ sev: "ERRO", slide, msg });
const W = (slide, msg) => issues.push({ sev: "AVISO", slide, msg });

/* ---------- carrega kit, slides e preset em um contexto isolado ---------- */
const html = read("index.html");
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map((m) => ({ src: (m[1].match(/src="([^"]+)"/) || [])[1], body: m[2] }));
const ctx = vm.createContext({ console: { log() {}, warn() {}, error() {} }, setTimeout() {}, document: { querySelector: () => null, querySelectorAll: () => [], createElementNS: () => ({ setAttribute() {}, appendChild() {} }) } });
ctx.window = ctx;
for (const s of scripts) {
  if (s.src) {
    if (/vendor\/|engine\.js/.test(s.src)) continue;
    const f = path.join(dir, s.src);
    if (!fs.existsSync(f)) { E("(projeto)", `index.html carrega ${s.src}, que não existe`); continue; }
    try { vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: s.src }); } catch (e) { E(s.src, "erro ao carregar o arquivo: " + e.message); }
  } else if (/PSB_CONFIG/.test(s.body)) { try { vm.runInContext(s.body, ctx); } catch (e) { E("(projeto)", "PSB_CONFIG inválido: " + e.message); } }
}
const defs = ctx.PSB_DEFS || [];
if (!defs.length) E("(projeto)", "nenhum slide registrado em window.PSB_DEFS");

/* ---------- CSS: classes globais × classes dos slides ---------- */
const cssFiles = fs.existsSync(path.join(dir, "css")) ? fs.readdirSync(path.join(dir, "css")).filter((f) => f.endsWith(".css")) : [];
const GLOBAL = ["base.css", "themes.css", "studio.css"];
const classesOf = (css) => { const out = []; css.replace(/\/\*[\s\S]*?\*\//g, "").split("}").forEach((blk) => { const sel = blk.split("{")[0]; if (!sel || sel.trim().startsWith("@")) return; sel.split(",").forEach((p) => { const m = p.trim().match(/^\.([\w-]+)/); if (m) out.push(m[1]); }); }); return out; };
const globalCls = new Set(cssFiles.filter((f) => GLOBAL.includes(f)).flatMap((f) => classesOf(read("css/" + f))));
cssFiles.filter((f) => !GLOBAL.includes(f)).forEach((f) => { const dup = [...new Set(classesOf(read("css/" + f)).filter((c) => globalCls.has(c)))]; if (dup.length) W("css/" + f, `seletores sem escopo que redefinem classes globais: ${dup.map((c) => "." + c).join(", ")} (prefixe com a classe do slide)`); });

/* ---------- slides ---------- */
const THEMES = ["dark", "light", "paper"], seenId = new Set(), seenNum = new Set(), seenCls = new Set();
const beatIds = {};
const text = (h) => h.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ");
defs.forEach((d) => {
  const id = d.id || "(sem id)";
  ["id", "num", "title", "build", "act", "actName", "actPage"].forEach((k) => { if (d[k] == null || d[k] === "") E(id, `campo obrigatório ausente: ${k}${k === "actPage" ? " (o engine usa para o rodapé)" : ""}`); });
  if (d.id) { if (seenId.has(d.id)) E(id, "id duplicado"); seenId.add(d.id); }
  if (d.num) { if (seenNum.has(d.num)) E(id, `num duplicado (${d.num})`); seenNum.add(d.num); }
  if (d.theme && !THEMES.includes(d.theme)) W(id, `tema inválido "${d.theme}" (use dark, light ou paper)`);
  if (d.cls) { if (seenCls.has(d.cls)) W(id, `classe "${d.cls}" repetida em outro slide: os estilos vazam`); seenCls.add(d.cls); } else W(id, "sem cls: prefixe o CSS do slide com uma classe própria");
  const h = d.html || "", src = typeof d.build === "function" ? String(d.build) : "";
  // timeline e momentos
  if (src) {
    if (!/gsap\.timeline\(/.test(src)) E(id, "build não cria gsap.timeline(...)");
    else if (!/paused:\s*true/.test(src)) E(id, "a timeline do slide precisa de { paused: true }");
    const labels = [...src.matchAll(/addLabel\(\s*["'`]([\w-]+)["'`]/g)].map((m) => m[1]);
    const beats = [...src.matchAll(/\[\s*["'`]([\w-]+)["'`]\s*,\s*["'`][^"'`]+["'`]\s*\]/g)].map((m) => m[1]).filter((b) => !/^(a|b|c)$/.test(b));
    beatIds[d.id] = beats;
    if (!/beats\s*:/.test(src)) E(id, "build não devolve { tl, beats }");
    beats.forEach((b) => { if (!labels.includes(b)) E(id, `momento "${b}" listado em beats sem addLabel("${b}")`); });
    if (labels.length && beats.length && labels.length !== beats.length) W(id, `${labels.length} labels e ${beats.length} momentos em beats: confira a correspondência`);
    if (/vox-mark/.test(h) && !/\bhead\(|barIn\(|vox-mark__bar/.test(src)) E(id, "há .vox-mark, mas o build não anima a barra (use head() ou barIn): o texto some no fundo escuro");
    if (/class="[^"]*\bheadline\b/.test(h) && !/\bhead\(|headlineIn\(/.test(src)) W(id, "há .headline sem head()/headlineIn(): o título não terá entrada");
  }
  // conteúdo
  const t = text(h);
  (cfg.forbiddenTerms || []).forEach((term) => { if (term && t.toLowerCase().includes(String(term).toLowerCase())) E(id, `termo proibido no slide: "${term}"`); });
  (cfg.forbiddenPatterns || []).forEach((p) => { try { const m = t.match(new RegExp(p, "i")); if (m) E(id, `padrão proibido (dado real?): "${m[0]}"`); } catch (e) { W("lint.config.json", `padrão inválido: ${p}`); } });
  const nums = (h.match(/data-count=/g) || []).length;
  if (nums > cfg.maxHighlightNumbersPerSlide) W(id, `${nums} números com contador (máximo ${cfg.maxHighlightNumbersPerSlide} por slide/caso)`);
  if (nums && !(cfg.sourceWords || []).some((w) => t.toLowerCase().includes(w))) W(id, "número em destaque sem palavra de fonte/estimativa/amostra no slide");
  [...h.matchAll(/font-size\s*:\s*(\d+)px/g)].forEach((m) => { if (+m[1] < cfg.minInlineFontPx) W(id, `fonte inline de ${m[1]}px (mínimo ${cfg.minInlineFontPx}px)`); });
  [...new Set([...h.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)))].filter((c) => /^[a-z]{2,3}$/.test(c) && globalCls.has(c)).forEach((c) => W(id, `classe curta "${c}" também existe no CSS global: renomeie`));
});

/* ---------- preset ---------- */
if (fs.existsSync(path.join(dir, "js/preset-default.js"))) {
  const slides = (ctx.PSB_PRESET_DEFAULT && ctx.PSB_PRESET_DEFAULT.slides) || {};
  Object.entries(slides).forEach(([sid, c]) => {
    if (!seenId.has(sid)) { E("preset-default.js", `preset de slide inexistente: ${sid}`); return; }
    (c.pauses || []).forEach((p) => { if (p.after && !(beatIds[sid] || []).includes(p.after)) E("preset-default.js", `${sid}: pausa "after: ${p.after}" não é um momento do slide`); });
    (c.ramps || []).forEach((r) => { if (r.beat && !(beatIds[sid] || []).includes(r.beat)) E("preset-default.js", `${sid}: trecho "beat: ${r.beat}" não é um momento do slide`); });
    if (c.theme && !THEMES.includes(c.theme)) W("preset-default.js", `${sid}: tema inválido "${c.theme}"`);
  });
}

/* ---------- relatório ---------- */
const errs = issues.filter((i) => i.sev === "ERRO"), warns = issues.filter((i) => i.sev === "AVISO");
console.log(`slides analisados: ${defs.length}`);
[...errs, ...warns].forEach((i) => console.log(`${i.sev.padEnd(5)} ${i.slide}: ${i.msg}`));
console.log(`\n${errs.length} erro(s), ${warns.length} aviso(s)`);
process.exit(errs.length || (strict && warns.length) ? 1 : 0);
