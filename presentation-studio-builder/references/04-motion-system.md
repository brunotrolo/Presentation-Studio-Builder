# 04 · Sistema de motion

Conteúdo: coreografia padrão · momentos (beats) · propriedades permitidas · easings · padrões prontos · ritmo · desempenho · esqueleto de `build`.

## Princípios

1. **Cada slide é uma timeline GSAP pausada**, medida em segundos, dividida em **momentos** por labels. O engine toca a timeline por conta própria, entre momentos aplica pausas e velocidades definidas no preset. Sem scroll, sem `setTimeout`, sem animações CSS soltas dirigindo o conteúdo.
2. **Direção, não decoração.** Cada movimento comunica causa e efeito: algo entra, algo transforma, algo se prova. Se um movimento não muda o entendimento, corte.
3. **Alto impacto vence "poucas animações".** Se o guia da marca recomenda sobriedade e o usuário pede alto impacto, a decisão do usuário prevalece (registre no style bible). Mantenha a disciplina técnica mesmo assim.
4. **Reversível e determinístico.** Voltar no tempo reconstrói o slide (ver arquivo 05). Aleatoriedade usa semente (`seeded`).

## Coreografia padrão

**Problema → Feixe/Agente → Transformação → Big Number + Carimbo**

| Fase | O que o público vê | Recursos |
|---|---|---|
| Problema | O estado ruim aparece e pesa | papéis empilhando, fila, calendário, ruído |
| Feixe / Agente | Algo entra em cena com intenção | linha de luz (`stroke-dashoffset`), badge de comando, personagem |
| Transformação | O estado muda de forma legível | recorte rasgado, encaixe, dobra, contador |
| Big Number + Carimbo | A prova, com fonte | número grande com contador, `vox-stamp` com `back.out` |

Nem todo slide precisa das quatro fases, mas a ordem causal se mantém.

## Momentos (beats)

- Declare `tl.addLabel("id", t)` no início de cada momento e devolva `beats: [["id", "Nome legível"], ...]`.
- O fim de um momento é o início do próximo; o último termina na duração da timeline. Use `pad(tl, t)` para fixar o fim de um momento (garante duração mínima).
- Pense o momento como "uma frase do apresentador". 2 a 4 momentos por slide; ritmo de 2,5 a 6 s por momento.
- Os ids aparecem no Studio e permitem `pauses: [{ after: "id" }]` e `ramps: [{ beat: "id" }]` no preset.

## Propriedades permitidas

Anime apenas `transform` (x, y, scale, rotation, skew), `opacity` (`autoAlpha`) e `stroke-dashoffset`. Largura, altura, posição (`left/top`), sombras e filtros não entram em animação. Exceções pontuais (cor de fundo de um nó que vira verde, `backgroundColor`) são aceitas em elementos pequenos e isolados.

- Marca-texto: barra com `scaleX` e `transform-origin: left`. Nunca `width`.
- Sombras duras (estilo Vox) são estáticas; mova o elemento, a sombra acompanha.
- Contadores: tween de um objeto proxy com `onUpdate` que escreve o texto (`counter()` do kit).

## Easings

| Uso | Easing |
|---|---|
| Entrada de papel/título | `power3.out` |
| Carimbo | `back.out(1.8)` |
| Marca-texto e traços | `power2.inOut` |
| Compressão (alinhar caos em feixe) | `expo.inOut` |
| Saída | `power2.in` |
| Idle, flutuação, respiração | `sine.inOut` |
| Mergulho de câmera | `power2.in` (acelera) com remate `power1.out` |

Durações típicas: entrada 0,5 a 0,9 s; carimbo 0,4 s; marca-texto 0,55 s; contador 0,9 a 1,6 s; stagger 0,1 a 0,3 s.

## Padrões prontos (em `kit.js`)

| Função | Faz |
|---|---|
| `head(tl, sec, at, barAt, subAt)` | eyebrow, título com máscara, marca-texto e subtítulo. **Use em todo slide com cabeçalho.** |
| `fadeUp(tl, el, at, d)` | entrada com subida de 28 px |
| `stamp(tl, el, at, rot)` | carimbo com escala 1,55 → 1 e rotação |
| `counter(tl, el, at, dur)` | contador a partir de `data-count` |
| `prep(paths)` + `draw(tl, paths, at, d, stagger)` | desenho de linhas SVG (exige `pathLength="1"`) |
| `hide(els, extra)` | estado inicial escondido |
| `tornPoly(seed, amp)`, `seeded(seed)` | recorte rasgado e aleatório determinístico |

## Esqueleto de `build`

```js
function buildExemplo(sec) {
  const { $, $$, EASE, head, fadeUp, stamp, counter, pad, hide } = window.PSB;
  const cards = $$(".ex-card", sec), st = $(".ex-stamp", sec);
  hide(cards, { y: 40 }); hide(st);                       // estado inicial de tudo que entra
  const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.paper } });

  tl.addLabel("problema", 0);                              // MOMENTO 1
  head(tl, sec, 0.1, 1.2, 99);                             // 99 = sem subtítulo
  cards.forEach((c, i) => tl.to(c, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.9 + i * 0.3));
  pad(tl, 3.0);                                            // fim do momento 1

  tl.addLabel("veredito");                                 // MOMENTO 2
  stamp(tl, st, "veredito", -5);
  pad(tl, 4.2);
  return { tl, beats: [["problema", "O problema"], ["veredito", "O veredito"]] };
}
```

Opcional no retorno: `layout()` (posicionar após montar), `exit()` (timeline de saída própria) e `onTick(t)` (animação contínua, como balanço de cenas).

## Ritmo

- Sem marcação, o engine dá 0,6 s de respiro após cada momento. Marque pausas manuais onde o apresentador precisa contar a história antes de o próximo elemento entrar.
- Use trechos de velocidade (0,85× no momento de tensão) em vez de alongar tudo.
- A seta `←` volta ao slide anterior já no estado final; repetida, continua voltando. Prefira slides compreensíveis no estado final.

## Desempenho

Um slide com muitos elementos iguais (centenas de linhas de código, partículas) usa `InstancedMesh` no 3D ou poucos nós SVG agrupados no DOM. Evite `filter: blur` grande animado. Em cenas 3D limite sombras (1 a 2 luzes com sombra), `pixelRatio ≤ 2` e teste em máquina comum.

## Acessibilidade e fallback

Respeite `prefers-reduced-motion` nos efeitos decorativos contínuos (cursor piscando, setas). O estado final de cada slide deve ser legível sem a animação (o engine mostra o estado final ao voltar).
