/* _env.js — resolve as dependências dos scripts (puppeteer-core e Chrome) com mensagens de erro acionáveis.
   O Node procura módulos a partir da pasta deste arquivo; por isso a instalação precisa ser feita aqui:
     npm install --prefix "<pasta-da-skill>/scripts"
   Também aceita NODE_PATH e a variável CHROME_PATH. */
const fs = require("fs");
const path = require("path");

function fail(msg) { console.error("\n" + msg + "\n"); process.exit(2); }

function loadPuppeteer() {
  try { return require("puppeteer-core"); } catch (e) {
    fail("Dependência ausente: puppeteer-core.\nInstale uma vez com:\n  npm install --prefix \"" + __dirname + "\"\n(ou defina NODE_PATH para uma pasta node_modules que já a contenha).");
  }
}

function findChrome() {
  const env = process.env.CHROME_PATH;
  if (env) { if (fs.existsSync(env)) return env; fail("CHROME_PATH aponta para um arquivo que não existe: " + env); }
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) fail("Chrome/Chromium não encontrado.\nDefina CHROME_PATH com o caminho do executável.\nSem navegador, faça a revisão visual abrindo o index.html manualmente (modo ?studio) e use apenas lint-deck.js.");
  return found;
}

// argumentos extras do Chrome (ex.: WebGL em headless): CHROME_ARGS="--use-angle=swiftshader --enable-unsafe-swiftshader"
const extraArgs = () => (process.env.CHROME_ARGS ? process.env.CHROME_ARGS.split(/\s+/).filter(Boolean) : []);

module.exports = { puppeteer: loadPuppeteer, chrome: findChrome, extraArgs, fail };
