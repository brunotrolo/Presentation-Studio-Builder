# 11 · Templates de motion, bibliotecas e licenças

Conteúdo: como criar um template · papercraft-3d-scene · image-pan-animation · compatibilidade das bibliotecas · licenças e origem dos arquivos.

## Criar um template de motion

```
node "${CLAUDE_SKILL_DIR}/scripts/scaffold.js" motion papercraft-3d-scene <pasta>
node "${CLAUDE_SKILL_DIR}/scripts/scaffold.js" motion image-pan-animation <pasta>
```

O script copia o template de `assets/motion-templates/` e as bibliotecas necessárias de `assets/vendor/` para `<pasta>/vendor/`. Abra `index.html` no Chrome; `?clean` esconde os controles.

## papercraft-3d-scene

Cena 3D em papel dobrado (Three.js + GSAP), offline. Origem: "O dev no legado", aprovada: câmera por cima do ombro de um dev, mergulho no centro da tela e fim em preto.

| Bloco do arquivo | O que muda |
|---|---|
| `C` (paleta) | cores da cena (índigo, vermelhão, creme, kraft…) |
| texturas de papel | fibras, manchas e fundo creme (`fibreCanvas`, `backdropTex`) |
| luz | luz principal, preenchimento, pontos de brilho que pulsam com a tela, holofote do abajur |
| fundo creme com vincos | `wallGeo` e `floorGeo` (facetas planas = dobras) |
| mesa, gaveteiro, caixas, papéis | adereços: `crumple`, `cardbox`, pilhas |
| monitor e janelas | `WINS` (janelas em camadas), `InstancedMesh` de linhas, bandeirinhas, post-its |
| dev em camadas | `ext()` extruda formas planas; `limb()` braços |
| câmera | objeto `S` e a timeline `tl` (deriva, mergulho, remate, fade a preto) |

Regras da cena: sem texto; sem mensagem negativa sobre a pessoa; alertas pulsam por cor (vermelhão ↔ laranja quente). Luzes baixas (pontos 1 a 3, spot ~9) e exposição ~0,92. Para integrar ao deck, siga o arquivo 07.

## image-pan-animation

Anima uma ilustração do usuário com câmera 2D, fitas de luz, cubos na esteira e brilhos. Fiel à arte; sem mergulho 3D.

1. Salve a arte como `arte.jpg` na pasta (largura 2400 px). O template recorta a faixa inferior (legendas) com `clip-path: inset(...)`; ajuste a altura útil em `#world` e `#world img`.
2. `K` é a razão entre a arte original (2400) e a imagem exibida (2000). As coordenadas dos trajetos são medidas na imagem exibida.
3. Trace os caminhos olhando capturas: `RIBBONS`, `BELT`, `GL` e os keyframes de `cam`. Use `?debug` para ver os trajetos em magenta.
4. Cubos em SVG separado, sem blend, para não ficarem lavados; brilhos em `screen` com baixa opacidade.
5. Se a arte tiver texto, legendas ou objetos pintados que conflitam, peça uma versão limpa ao usuário.

A câmera é um objeto `{x, y, z}` animado por GSAP e aplicado a `#world` como `translate(...) scale(z)`. Centros fora da arte mostram o fundo; mantenha a cor de fundo igual à da arte.

## Compatibilidade das bibliotecas (informação que envelhece)

- `three.min.js` é a build clássica r152 (global `THREE`, sem módulos ES, que não carregam via `file://`). Essa forma foi marcada como descontinuada pelo projeto; se for atualizar, migre para módulos servidos por HTTP local ou para um bundler e reteste a cena.
- GSAP 3.x em `gsap.min.js`; o engine usa só o núcleo (timeline, ticker), sem ScrollTrigger.
- WebGL em Chrome headless exige `CHROME_ARGS="--use-angle=swiftshader --enable-unsafe-swiftshader"`.

## Licenças e origem dos arquivos

| Arquivo | Origem | Licença |
|---|---|---|
| `assets/vendor/gsap.min.js` | GreenSock (npm `gsap`) | licença padrão da GreenSock (gratuita para uso geral; confira os termos em gsap.com/standard-license) |
| `assets/vendor/three.min.js` | Three.js r152 (npm `three`) | MIT |
| `assets/starter-kit/fonts/poppins-*.woff2` | Poppins (Indian Type Foundry), via jsDelivr/Fontsource | SIL Open Font License 1.1 |
| `assets/starter-kit/fonts/jetbrains-mono-*.woff2` | JetBrains Mono, via jsDelivr/Fontsource | SIL Open Font License 1.1 |
| `assets/starter-kit/css/*`, `js/*`, `scripts/*`, templates e referências | autoria desta skill | MIT (ver campo `license` do `SKILL.md`) |

O fundo de papel do tema `paper` é **gerado por CSS/SVG** (ruído `feTurbulence`), sem imagem externa: não há ativo de terceiros com origem incerta. Se o usuário fornecer uma textura própria, registre aqui a origem e a licença antes de incluí-la.

Ao distribuir uma apresentação gerada com o starter-kit, mantenha os avisos de licença das fontes e das bibliotecas.
