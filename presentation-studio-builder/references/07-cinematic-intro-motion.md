# 07 · Motion cinematográfico (abertura, voo de câmera, cena em papel)

Conteúdo: quando usar · árvore de decisão · fluxo com amostra · cena de referência aprovada · template 3D de papel · ilustração animada · vídeo de IA (4 passos) · integração no deck · limites.

## Quando usar

Quando o usuário quer uma viagem visual contínua (por exemplo: dev diante do PC → mergulho na tela → escritório de agentes → atendente com headset). É um recurso de abertura ou de transição, de 15 a 40 segundos, não um deck inteiro.

## Árvore de decisão

| Situação | Caminho | Observações |
|---|---|---|
| Usuário tem **arte de referência** de alta fidelidade e quer manter 100% | **C · ilustração animada** (`assets/motion-templates/image-pan-animation/`) | Câmera 2D (panorâmica e zoom), fitas de luz, cubos na esteira, brilhos. Fiel à arte; sem mergulho 3D real. |
| Quer câmera 3D real, controle total, offline, sem custo | **B · código 3D** (`assets/motion-templates/papercraft-3d-scene/`) | Three.js. Bom para cenas estilizadas; o acabamento fica abaixo de uma imagem gerada. |
| Quer visual de cinema/Pixar e aceita créditos e ferramenta externa | **A · vídeo de IA em frames** | Imagem âncora → vídeo → frames → player. Texto precisa ficar em HTML por cima. |
| Quer o melhor dos dois | **D · híbrido** | Mesas em SVG/HTML nítido e vídeo/canvas só dentro de uma tela. |

Se a fidelidade pedida passa do que o código entrega, diga isso com franqueza e proponha C ou A. Reprovações anteriores vieram de prometer um acabamento que o código não alcançava.

## Fluxo com amostra (obrigatório)

1. Escreva o roteiro de câmera em cenas (3 a 4) com composição, movimento e duração.
2. **Mostre uma amostra pequena** (5 a 10 s ou um único quadro) e peça aprovação da direção antes de construir o resto. Registre o que foi aprovado e o que foi reprovado.
3. Itere só na cena aprovada até o usuário aceitar; depois a próxima cena.
4. Ao final, planeje a integração (seção abaixo). Não mexa na apresentação existente até a cena estar aprovada.

## Cena de referência aprovada · "O dev no legado" (Three.js)

- **Composição inicial:** câmera por cima do ombro de um desenvolvedor de costas (recortes de papel em camadas, fones vermelhos), diante de um monitor ultrawide que ocupa o quadro. Mesa índigo com teclado e mouse de papelão, papéis amassados, caixas, abajur, cadeira. Fundo creme com dobras verticais.
- **Tela:** janelas empilhadas em camadas (moldura vermelhão, painel índigo profundo, linhas de código como tiras de papel via `InstancedMesh`), alertas que pulsam, bandeirinhas de papel dobrado e post-its **sem texto**.
- **Câmera (7,2 s):** deriva suave 0–1,4 s; mergulho acelerado 1,4–5,2 s (`power2.in`) passando rente ao ombro e à cabeça, aumentando o FOV de 31° a 52°; remate até `z≈0,28`; luzes apagam de 5,2 a 6,1 s; preto total no fim.
- **Luz:** luz principal quente de cima-esquerda com sombras, preenchimento frio fraco, dois pontos de brilho (vermelhão e índigo) que pulsam com a tela, abajur com holofote. Exposição ~0,92 com tone mapping ACES.
- **Material de papel:** textura de fibras gerada em canvas (manchas suaves + fibras + pontos), bump fraco (0,1), `flatShading` nas peças dobradas, linhas finas nas arestas para dar "recorte".
- **Pós:** grão por sobreposição CSS (`mix-blend-mode: overlay`, opacidade ~0,16) e vinheta.
- **Restrições do usuário:** sem cards com texto, sem "Error 500" ou mensagem negativa sobre o dev; foco só no dev e no PC.

Crie a cena com `node "${CLAUDE_SKILL_DIR}/scripts/scaffold.js" motion papercraft-3d-scene <pasta>` (veja o arquivo 11) e use `index.html` como ponto de partida: troque a paleta (`C`), os adereços e a câmera (`S` e a timeline). O template documenta os blocos com comentários.

## Cenas seguintes (diretrizes aprovadas)

- **Escritório dos agentes:** vista isométrica com os agentes trabalhando e **interagindo entre si** (passam a demanda de mão em mão, carimbam, montam); sem cards de texto, sem origamis voadores, sem estética infantil. Identidade por silhueta, cor e ferramenta, não por rótulo.
- **Atendente:** operadora com headset diante do Service Cloud, sem cards flutuantes; o feixe de dados entra pelas mãos dela.
- A transição entre cenas precisa esconder emendas (escuridão, névoa, oclusão); nada "teleporta".

## Ilustração animada (caminho C)

`assets/motion-templates/image-pan-animation/` anima uma arte única de 2400 px de largura:
- Mundo de 2400×(altura útil) com a arte recortada para tirar legendas.
- Câmera: objeto `{x, y, z}` animado por GSAP e aplicado como `translate + scale` (coordenadas em px da arte exibida × `K`).
- Fitas: `path` por cima da arte com brilho que corre (`stroke-dasharray` curto + `dashoffset`), em `mix-blend-mode: screen`.
- Cubos/pacotes: pequenos SVG que seguem um `path` com `getPointAtLength`; cubos sem blend para não ficarem lavados.
- Luzes pulsando: gradientes radiais com blend `screen` em baixa opacidade (pouca opacidade; muita lava a arte).
- Trace os caminhos olhando capturas e ajuste; use `?debug` para ver os trajetos.
Limite: sem mergulho 3D. Se a arte tiver texto, legendas ou cubos pintados que atrapalham, peça uma versão limpa.

## Vídeo de IA em frames (caminho A, resumo dos 4 passos)

1. **Imagem âncora:** define luz, paleta e estilo de toda a cadeia; pausa obrigatória para aprovação. Trocar depois custa caro.
2. **Vídeo:** movimentos assinatura (mergulho, deslize, recuo); o último quadro de uma cena casa com o primeiro da seguinte.
3. **Fatiamento com ffmpeg:** extrai frames (evita engasgo de `<video>` ao voltar).
4. **Scrub:** mapeia frame ↔ progresso. No nosso engine, o progresso vem do tempo da timeline do slide, não da rolagem.

Regras: aprove custo antes de gerar; proíba texto legível dentro das imagens (a IA distorce); coloque badges e títulos em HTML/SVG por cima; adapte o prompt às cores e ao vocabulário do style bible. Não há ferramenta de geração disponível ao agente por padrão: prepare prompts, roteiro de câmera e o player de frames, e o usuário roda a geração.

## Integração no deck

- Entra como **mais um slide** (`id`, `num`, `build`) cuja timeline controla o motion. Escolha `num` fracionado ou renumere (ex.: entre 02 e 03).
- Para WebGL, crie o canvas dentro do `html` do slide, inicialize em `build` e dirija a câmera pela timeline (`onUpdate` renderiza). Reconstruir ao voltar é gratuito porque o engine remonta o slide; libere recursos no `exit`/ao remontar.
- Frames/vídeo ficam locais e o peso entra no cálculo (offline).
- A cena termina em preto ou numa imagem estável que conecte ao próximo slide. Ajuste a narração, pois a abertura antecipa a tese.
- Planeje a integração só após a aprovação das cenas, em plano escrito, antes de editar o deck.

## Limites a declarar

Headless não mede fluidez; diga que viu capturas e não o movimento. Three.js em Chrome headless precisa de `--use-angle=swiftshader --enable-unsafe-swiftshader`. Versões e licenças das bibliotecas do template 3D ficam no arquivo 11 (a build clássica funciona offline sem módulos ES, que não carregam via `file://`).
