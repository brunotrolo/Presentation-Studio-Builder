# 06 · Guia de autoria de slides

Conteúdo: passo a passo · layout · receitas visuais · checagem por slide · armadilhas.

## Passo a passo para um slide novo

1. Leia a linha do ledger do slide (objetivo, elementos, números, fundo, momentos).
2. Crie ou abra `js/slides/<ato>.js` e `css/slides.css` (ou um CSS por ato; lembre de incluir no `index.html`).
3. Escreva o `html` do slide, com uma classe própria (`cls`) e filhos de nomes curtos prefixados (`.n07-row`).
4. Escreva o CSS posicionando em coordenadas do palco (`position: absolute`; ver grade).
5. Escreva `build(sec)`: estados iniciais com `hide`/`gsap.set`, depois a timeline em momentos (arquivo 04).
6. Registre com `window.PSB_DEFS.push({...})`.
7. Rode `node "${CLAUDE_SKILL_DIR}/scripts/lint-deck.js" <pasta>` e corrija todo ERRO (marca-texto sem animação, momento sem label, termo proibido, número sem fonte).
8. Capture e olhe: `node "${CLAUDE_SKILL_DIR}/scripts/capture.js" <index.html> out <id> 0.4,1`.

Trabalhe em ato, não em lote de 25: construa 4 a 6 slides, verifique, corrija e siga.

## Grade do palco

- Margem esquerda/direita 120 px; largura útil 1680 px.
- Cabeçalho: eyebrow em `top 128`; título 62 a 66 px; subtítulo 27 px. Conteúdo a partir de `y ≈ 440`.
- Rodapé e paginação ocupam 1002 a 1080; nada importante abaixo de 990.
- Colunas: esquerda com texto (largura 640 a 900) e direita com visual (a partir de x 800 a 900) funciona bem para slides de ideia; linhas de 3 a 5 cartões para métricas (largura de cartão 312 a 520, vão 30).

## Receitas visuais

- **Cartão de métrica:** `.paper-dark` (ou `.nx-card`) com rótulo mono, número grande (`font-weight: 800`, 60 a 130 px) e legenda com fonte. Contador com `data-count`.
- **Anel de progresso:** SVG `circle` com `pathLength="1"`, `stroke-dasharray` e `stroke-dashoffset` animado até ~0; texto central em flex (não em grid, ou os spans quebram em linhas).
- **Fita/feixe:** `path` com `pathLength="1"` + `prep()` + `draw()`; luz com `filter: drop-shadow` estático.
- **Duas pistas (sem × com):** duas linhas SVG; a pista ruim ganha um arco vermelho de retrabalho; a boa, um ponto de luz que cruza.
- **Portão que abre:** dois recortes que deslizam em `x`; bilhetes passam pelo meio depois do carimbo.
- **Lente que revela:** contêiner circular com `overflow: hidden`; o conteúdo interno recebe a translação inversa do contêiner para parecer fixo (animar os dois com mesma duração e easing).
- **Muros que caem:** blocos com `rotation` e `y`, `transform-origin` na base; depois linhas ligam os blocos.
- **Escudo e feixe vermelho:** SVG do escudo com `drop-shadow` ciano; feixe que é "absorvido" (a opacidade cai) e carimbo de confirmação.
- **Órbitas:** contêineres de tamanho zero rodando com `rotation`; pontos posicionados em x,y a partir do centro.
- **Papel rasgado:** `.cut-wrap > .cut[data-torn]` + `.tape` + `.vox-stamp` (arquivo 03).

## Checagem por slide

- O quadro final é legível sozinho (o engine o mostra ao voltar).
- Todos os elementos que entram têm estado inicial escondido dentro de `build`.
- `head()` foi chamado se há `.eyebrow`, `.headline` ou `.vox-mark` (senão o marca-texto fica invisível).
- Nada fora do palco; nenhum corte de overflow (o `capture.js` avisa).
- Textos com acentuação correta e sem dados reais de cliente.
- No máximo 1 a 3 números de destaque; cada um com fonte ou aviso de estimativa.
- A duração faz sentido: 6 a 15 s de timeline por slide, com pausas definidas no Studio.

## Armadilhas

- **Marca-texto invisível:** esquecer `gsap.set(bar, {scaleX:0})` + `barIn`. Texto preto sobre fundo escuro some.
- **Nome de classe que colide:** classes curtas (`.tk`, `.cn`, `.ln`) podem conflitar com o CSS base ou de outros slides. Prefixe.
- **Grid em contêiner de contador:** `display: grid; place-content: center` empilha os spans do número; use `flex`.
- **Posições dependentes de medida:** use coordenadas fixas ou `offsetIn(el, sec)` dentro de `build`/`layout`, depois que o HTML existe.
- **Emojis e símbolos nas telas:** renderizam diferente entre máquinas; prefira SVG/formas ou texto simples (✓ costuma funcionar, mas teste).
- **Mock com dados reais:** use máscaras (`***.***.***-**`) e valores fictícios.
- **Texto demais:** se precisa de parágrafo, a informação vai para a fala (arquivo 09).
