#!/usr/bin/env node
/* scaffold.js — cria projetos a partir dos modelos da skill.
   Apresentação:  node scaffold.js deck <pasta-destino> "<Título>" [chave-de-armazenamento]
   Motion:        node scaffold.js motion <papercraft-3d-scene|image-pan-animation> <pasta-destino>
   Não sobrescreve pasta existente e não vazia. Bibliotecas (GSAP, Three.js) vêm de assets/vendor. */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..", "assets");
const die = (m) => { console.error(m); process.exit(1); };
const usage = () => die('uso:\n  node scaffold.js deck <pasta> "<Título>" [chave]\n  node scaffold.js motion <papercraft-3d-scene|image-pan-animation> <pasta>');

const copy = (a, b) => { fs.mkdirSync(b, { recursive: true }); for (const e of fs.readdirSync(a, { withFileTypes: true })) { const s = path.join(a, e.name), d = path.join(b, e.name); e.isDirectory() ? copy(s, d) : fs.copyFileSync(s, d); } };
const ensureEmpty = (dest) => { if (fs.existsSync(dest) && fs.readdirSync(dest).length) die("A pasta de destino já existe e não está vazia: " + dest); };
const vendor = (dest, files) => { fs.mkdirSync(path.join(dest, "vendor"), { recursive: true }); files.forEach((f) => { const src = path.join(root, "vendor", f); if (!fs.existsSync(src)) die("Biblioteca ausente na skill: " + src); fs.copyFileSync(src, path.join(dest, "vendor", f)); }); };

const [mode, ...rest] = process.argv.slice(2);
if (mode === "deck") {
  const [dest, title = "Título da apresentação", key] = rest;
  if (!dest) usage();
  ensureEmpty(dest);
  copy(path.join(root, "starter-kit"), dest);
  vendor(dest, ["gsap.min.js"]);
  const slug = (key || title).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const f = path.join(dest, "index.html");
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace("<title>Título da apresentação</title>", `<title>${title}</title>`).replace("psb.minha-apresentacao.v1", `psb.${slug}.v1`));
  console.log(`Projeto criado em ${dest}\n  • abra index.html (Apresentação) ou index.html?studio (Studio)\n  • slides em js/slides/*.js · tokens em css/base.css (bloco :root) · regras do lint em lint.config.json\n  • verifique: lint-deck.js, capture.js e nav-test.js (ver SKILL.md)`);
} else if (mode === "motion") {
  const [tpl, dest] = rest;
  const libs = { "papercraft-3d-scene": ["three.min.js", "gsap.min.js"], "image-pan-animation": ["gsap.min.js"] };
  if (!tpl || !dest || !libs[tpl]) usage();
  ensureEmpty(dest);
  copy(path.join(root, "motion-templates", tpl), dest);
  vendor(dest, libs[tpl]);
  console.log(`Template ${tpl} criado em ${dest}` + (tpl === "image-pan-animation" ? "\n  • salve a sua arte como arte.jpg nesta pasta" : "") + "\n  • abra index.html no Chrome (?clean esconde os controles)");
} else usage();
