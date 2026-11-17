# 05 · Engine, preset e Studio

Conteúdo: arquitetura · definição de slide · HTML exigido · navegação · preset v2 · Studio · API de teste · extensão.

## Arquitetura

`assets/starter-kit/` é estático (sem build), offline:

```
index.html            palco, HUD, rodapé, scripts
css/base.css          tokens (:root), palco 1920×1080, fundo, HUD, tipografia, marca-texto, carimbo
css/themes.css        temas light e paper, papel recortado (.cut, .tape)
css/studio.css        painel ?studio
css/slides.css        estilos dos seus slides (prefixe por classe)
js/kit.js             helpers de motion e layout → window.PSB
js/slides/*.js        slides → window.PSB_DEFS.push({...})
js/preset-default.js  marcação de tempo padrão → window.PSB_PRESET_DEFAULT
js/engine.js          player + Studio → window.__psb (API de teste)
vendor/gsap.min.js    GSAP local (copiado de assets/vendor pelo scaffold.js)
lint.config.json      regras do lint-deck.js (glossário proibido, padrões de dado real, palavras de fonte)
```

O `scaffold.js deck` monta tudo isso e copia as bibliotecas; o diretório `assets/starter-kit/` sozinho não roda (falta `vendor/`).

Ordem dos scripts: `gsap`, `PSB_CONFIG`, `kit.js`, slides, `preset-default.js`, `engine.js`.

## Definição de slide

```js
window.PSB_DEFS.push({
  id: "s05",          // identificador estável; usado no preset, nos testes e em ?slide=s05
  num: "05",          // ordem de apresentação (string); o engine ordena por num
  act: "02", actName: "Nome da seção", actPage: "1/3",   // alimentam HUD e rodapé de seção
  title: "Título legível no Studio",
  theme: "light",     // padrão do slide: dark | light | paper
  cls: "meu-slide",   // classe da <section>; prefixe seus estilos com ela
  html: `...`,        // marcação do slide
  build(sec) { ... return { tl, beats: [[id, nome], ...], layout?, exit?, onTick? }; }
});
```

Slides com `html` são criados pelo engine; os sem `html` precisam já estar no `index.html` com `data-id`.

## HTML exigido pelo engine

`#stage` (dentro de `.viewport`), `.slides`, `#hudAct`, `#footNum`, `#footAct`, `.next-cue`, `.bg__glow`. O starter já traz tudo; ao adaptar um `index.html` próprio, mantenha esses ids/classes.

## Navegação (apresentação)

- `→` / `Espaço` / `Enter` / `PageDown`: avança (ou libera uma pausa manual).
- `←` / `Backspace` / `PageUp`: volta ao slide anterior **já no estado final**; toques repetidos continuam voltando.
- `Home` / `End`: primeiro / último slide. `G`: pergunta o número do slide.
- Toques rápidos somam (`pendingIdx`); `←` durante um avanço cancela o avanço.
- Slides ocultos são pulados por completo e a numeração do rodapé é refeita.

## Preset v2

```json
{ "version": 2, "slides": { "s05": {
  "speed": 1, "theme": "light", "hidden": false,
  "pauses": [ { "t": 3.2, "hold": 0.8, "mode": "auto" }, { "after": "problema", "mode": "manual" } ],
  "ramps":  [ { "beat": "problema", "speed": 0.85 }, { "from": 2.0, "to": 3.5, "speed": 0.6 } ] } } }
```

- `speed` global do slide (0,2 a 3). `ramps` são trechos de velocidade em qualquer instante.
- `pauses`: `auto` (fica `hold` segundos) ou `manual` (espera a seta; mostra o cue `→ continuar`). Por `t` (segundo) ou `after` (fim de um momento).
- Marcação salva no Studio fica no `localStorage` (chave `storageKey` do `PSB_CONFIG`) e vence o padrão; "Restaurar padrão" limpa.
- Para fixar: Studio → Exportar JSON → cole `slides` em `preset-default.js`.
- Slides sem entrada no padrão recebem pausa automática de 0,6 s após cada momento (menos o último).

## Studio (`index.html?studio`)

Painel à direita, com um cartão por slide:
- **Linha do tempo** clicável e arrastável (cursor), com momentos nomeados, **marcos numerados** (pausas 1, 2, 3…; manuais em verde) e **trechos V1, V2…** arrastáveis pelas bordas. Passar o mouse num marco destaca o par régua ↔ lista.
- Botões: tocar o slide, tocar do cursor, pausar aqui, velocidade aqui. Tecla `M` marca pausa no instante atual.
- **Velocidade do slide** e **fundo do slide** (Claro, Escuro, Papel).
- **Ocultar**: o slide some por completo da apresentação (não apaga).
- Duração estimada por slide e total (integra velocidade e pausas; conta pausas manuais à parte).
- Salvar, Exportar/Importar/Copiar JSON, Restaurar padrão. Outras teclas: `P` painel, `R` repete o slide.

Sem `?studio`, o modo Apresentação respeita a marcação e esconde o painel.

## API de teste (`window.__psb`)

`RT` (slides montados), `S` (estado), `goTo(i, opts)`, `next()`, `prev()`, `replay()`, `seek(t)`, `playFrom(t)`, `preset()`, `dur()`, `hide(id, bool)`, `theme(id, tema)`, `freeze(id, t)` (abre o slide parado no instante `t`; usado pelos scripts de captura).

## Como o engine mantém o estado limpo

`mount(rt)` restaura o HTML original (`pristine`) e reconstrói a timeline em toda entrada, volta ou seek para trás. Isso resolve o bug clássico de elementos presos em `visibility: hidden` ao rebobinar `autoAlpha`. Consequência para quem escreve slides: **todo estado inicial deve ser definido dentro de `build`** (com `gsap.set`/`hide`), nunca no HTML ou em código fora de `build`.

## Extensão

`window.PSB_CONFIG = { storageKey, sectionLabel, sectionTotal, glow, studioTitle }`. `glow: { s05: [x, y, escala] }` desloca o brilho do fundo por slide. Os textos da interface do Studio estão em pt-BR no `engine.js`; traduza ali se necessário.
