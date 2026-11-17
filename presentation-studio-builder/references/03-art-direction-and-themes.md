# 03 · Direção de arte, temas e papel recortado

Conteúdo: style bible · tokens e temas · papel recortado (Vox) · tipografia e grade · anti-clichê · imagens de referência.

## Style bible (antes de construir)

Escreva em `assets/templates/style-bible-template.md`:
1. **Três adjetivos** de humor (ex.: tátil, preciso, vivo).
2. **Uma metáfora de mundo** (ex.: esteira de montagem, diorama de papel, redação de jornal).
3. **Paleta de 4 a 6 cores** com hex medido de arquivos oficiais ou de imagens de referência (não adivinhe; modelos tendem a derivar para paletas conhecidas).
4. **Linguagem de material**: papel, vidro, papelão, tinta; espessura de borda; tipo de sombra.
5. **Gramática de motion**: a coreografia padrão e o que é proibido (arquivo 04).
6. **Três clichês a evitar** (ex.: planeta azul brilhante, gradiente roxo genérico, ícones de IA com cérebro).

Estudos de estilo devem diferir na gramática, não só na cor. Se o usuário pedir opções, ofereça no máximo três, com recomendação.

## Tokens e temas

O starter-kit expressa a marca por **papéis semânticos** em `css/base.css` (bloco `:root`):

| Token | Papel |
|---|---|
| `--primary` | cor institucional |
| `--accent` | destaque, feixe, foco, comandos |
| `--glow` | brilho do fundo escuro |
| `--deep`, `--mid`, `--soft` | tons profundo, intermediário e claro de apoio |
| `--paper` | superfície clara |
| `--success`, `--danger`, `--highlight` | aprovado, alerta, marca-texto |
| `--ink` | tinta do tema claro |

Os `*-rgb` alimentam `rgba(var(--x-rgb), a)`; atualize os dois juntos. Para uma nova marca, troque só esses valores e as fontes; não renomeie as classes.

Três fundos por slide, trocados por classe do palco (`theme-light`, `theme-paper`; padrão escuro):

- `dark`: preto com brilho de marca e grade tênue. Texto branco.
- `light`: branco com eco discreto do brilho. As variáveis `--white`, `--muted`, `--surface` são redefinidas para tinta escura.
- `paper`: papel envelhecido gerado por CSS/SVG (ruído `feTurbulence`, sem imagem externa; uma textura própria do usuário pode substituí-lo, registrando origem e licença no arquivo 11) com sombras duras quentes. Reservado para dor, gargalo e documento (1 a 2 slides).

Ao criar componentes, use `var(--white)` e `var(--muted)` para texto e `var(--surface)` para superfícies; eles se adaptam ao tema. Cores fixas quebram a troca de fundo.

## Papel recortado (estilo Vox)

Linguagem de "jornal rasgado" e colagem editorial:
- **Recorte:** `clip-path: polygon()` gerado por `tornPoly(seed, amp)` (em `kit.js`) nos elementos `[data-torn]`. A sombra vai no wrapper `.cut-wrap` com `filter: drop-shadow` (o clip-path corta `box-shadow`).
- **Fita adesiva:** `.tape`, translúcida, nas pontas dos recortes.
- **Carimbo:** `.vox-stamp` com variações `--alert`, `--primary`, `--ok` (verde tracejado). Entra com `back.out` e leve rotação.
- **Marca-texto:** `.vox-mark` com barra animada em `scaleX` (nunca `width`).
- **Manchetes:** tiras `.cut--paper`, `.cut--ink`, `.cut--blue` com fontes pesadas.

Sombras duras são estáticas (não anime `box-shadow`). Use papel recortado com parcimônia: o efeito vale pelo contraste com os outros slides.

## Tipografia e grade

- Uma família sem serifa geométrica para títulos e corpo, e uma mono para rótulos, comandos e metadados. Fontes locais (`woff2`) para funcionar offline.
- Palco 1920×1080. Margens de 120 px; cabeçalho em `top: 128`; conteúdo a partir de `y ≈ 440`; rodapé reservado de 1002 a 1080.
- Títulos 62 a 88 px, corpo 22 a 30 px. Evite parágrafos: frases curtas e números grandes.
- Contraste: confira texto sobre marca-texto (texto preto sobre barra colorida só é legível se a barra animar).

## Anti-clichê

Revise o resultado procurando os "padrões do modelo": gradientes roxo-azul genéricos, cartões idênticos em grade 3×, ícones decorativos sem função, sombras suaves em tudo, texto centralizado em tudo. Cada elemento precisa servir à mensagem do slide.

## Imagens de referência

Quando o usuário envia imagens (conceito, moodboard):
1. Descreva o que vê: material, paleta, luz, câmera, composição, o que é narrativa.
2. Meça as cores (amostre pixels ou use uma ferramenta de paleta) e grave no style bible.
3. Separe **o que copiar** (estilo, material, luz) do **que corrigir** (texto dentro da arte, legendas, tom negativo).
4. Diga com honestidade o que o código alcança e o que exige geração de imagem ou vídeo (arquivo 07). Se a fidelidade pedida passa do que o código entrega, proponha usar a arte do usuário como base e animar por cima.

Exemplo de marca completa: `references/theme-porto-example.md`.
