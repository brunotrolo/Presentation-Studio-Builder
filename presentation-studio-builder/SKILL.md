---
name: presentation-studio-builder
description: Cria apresentações HTML ao vivo de alto impacto visual (estilo agência, scrollytelling, papel recortado) e motion cinematográfico, do briefing à entrega. Cobre estrutura em atos, style bible, slides animados com GSAP, player com modo Studio (pausas, velocidade, ocultar slide, fundo por slide), verificação por capturas, roteiro de narração para TTS e abertura em 3D de papel com Three.js. Use quando o usuário pedir apresentação, deck, slides animados, pitch, storytelling visual, abertura ou fly-through, motion de papel ou origami, scroll-world, roteiro de fala por slide, ou disser build an animated presentation, cinematic intro, pitch deck with motion. Não use para arquivos .pptx, .docx, .pdf ou Google Slides (use as skills de documentos), nem para relatórios estáticos, sites de produção ou gráficos isolados.
license: MIT
compatibility: Requer Node.js 18 ou superior e Chrome ou Chromium para os scripts de captura e navegação. O projeto gerado roda offline em qualquer navegador moderno. No claude.ai, sem Chrome, use apenas o lint e a revisão manual.
metadata:
  version: 1.1.0
  category: presentations-and-motion
  language: pt-BR
---

# Presentation Studio Builder

Transforma um briefing em uma apresentação HTML offline, apresentada ao vivo com as setas, em que cada slide é uma pequena animação dirigida. O método nasceu de um projeto real de 25 slides e foi homologado ponto a ponto com o usuário; cada regra abaixo existe porque evitou um retrabalho.

## Quando usar

- Apresentação ao vivo (10 a 25 min) em que o impacto visual e o ritmo importam: concursos, pitches, comitês, kickoffs, demos.
- Motion: abertura cinematográfica, voo de câmera, transição de ato, ilustração animada, cena 3D em papel.
- Roteiro de fala por slide para estudar ou gerar áudio (TTS).

Não use para documentos longos, arquivos Office/PDF, sites responsivos ou relatórios estáticos. O formato é palco fixo 1920×1080 para projeção.

## Preparar o ambiente (uma vez)

Os scripts ficam em `${CLAUDE_SKILL_DIR}/scripts` (em ambientes sem essa variável, use o caminho da pasta da skill). Instale a dependência na própria pasta de scripts, porque o Node procura módulos a partir dela:

```
npm install --prefix "${CLAUDE_SKILL_DIR}/scripts"
```

Chrome fora do caminho padrão: defina `CHROME_PATH`. Sem navegador (por exemplo claude.ai), faça só o lint e a revisão manual; diga isso ao usuário. Detalhes de manutenção em `references/12-skill-maintenance.md`.

## Fluxo de trabalho

Copie este checklist e marque cada etapa. Não pule o briefing: ele evita refazer a apresentação inteira.

```
Progresso:
- [ ] 1. Briefing e fontes de verdade        → references/01-discovery-and-brief.md
- [ ] 2. Estrutura e ledger de slides         → references/02-storytelling-and-structure.md
- [ ] 3. Style bible e tokens do tema         → references/03-art-direction-and-themes.md
- [ ] 4. Scaffold do projeto                  → scaffold.js deck
- [ ] 5. Construir os slides, ato por ato     → references/06-slide-authoring-guide.md + 04-motion-system.md
- [ ] 6. Validar: lint-deck, capturas, folha de contato, console → references/08-verification-and-qa.md
- [ ] 7. Ritmo no Studio (pausas, velocidade, ocultar, fundo)    → references/05-engine-and-studio.md
- [ ] 8. (Opcional) Motion cinematográfico de abertura           → references/07-cinematic-intro-motion.md
- [ ] 9. (Opcional) Roteiro de narração por slide                → references/09-narration-scripts.md
- [ ] 10. Auditoria final de números, fontes e navegação         → references/08-verification-and-qa.md
```

### 1. Briefing

Fixe antes de qualquer slide: público e ocasião, duração, formato (ao vivo, offline), marca e fontes oficiais, mensagem central, resultados reais com fonte, o que é estimativa, o que é proibido (nomes, dados de cliente) e o que o usuário já decidiu. Use `assets/templates/brief-template.md`. Havendo pastas de documentos, leia todas e trate o bloco de decisões vigentes (errata) como fonte que prevalece. Pergunte em blocos curtos de múltipla escolha, com a opção recomendada primeiro.

### 2–3. Estrutura e direção de arte

Monte o ledger (`assets/templates/slide-ledger-template.md`): um slide por ideia, título com a mensagem, no máximo 1 a 3 números de destaque por caso, fundo escolhido pelo conteúdo. Escreva o style bible (`assets/templates/style-bible-template.md`) antes de construir. Imagens de referência do usuário valem mais que descrições: extraia paleta, material, luz e câmera delas.

### 4–5. Construção

```
node "${CLAUDE_SKILL_DIR}/scripts/scaffold.js" deck <pasta> "<Título>"
```

Cria o projeto a partir de `assets/starter-kit/` (palco, engine, Studio, helpers, 3 slides de exemplo, fontes, GSAP). Cada slide é um objeto `{ id, num, act, actName, actPage, title, theme, cls, html, build }` em `window.PSB_DEFS`; `build(sec)` devolve uma timeline GSAP pausada dividida em momentos por labels. Coreografia padrão: **Problema → Feixe/Agente → Transformação → Big Number + Carimbo**. Construa ato por ato e verifique antes de avançar.

### 6. Validação

A cada ato, na ordem:

```
node "${CLAUDE_SKILL_DIR}/scripts/lint-deck.js" <pasta>
node "${CLAUDE_SKILL_DIR}/scripts/capture.js" <pasta>/index.html <saida> all 0.35,0.7,1
node "${CLAUDE_SKILL_DIR}/scripts/contact-sheet.js" <saida>/folha.png 3 <saida>/s01_b.png <saida>/s02_b.png ...
```

Corrija todo ERRO do lint, leia as imagens de verdade e corrija estouros, texto ilegível e animações que não rodam. No fim, `nav-test.js <pasta>/index.html <idParaOcultar>`. Nunca declare um slide pronto sem ter visto o quadro final dele.

### 7. Ritmo no Studio

`index.html?studio` permite marcar pausas (automáticas ou manuais) e trechos de velocidade em qualquer instante, ocultar slides e trocar o fundo por slide. Exporte o JSON e cole em `js/preset-default.js` para fixar.

### 8. Motion cinematográfico

Mostre **uma amostra pequena antes de construir** e peça aprovação da direção. Escolha o caminho pela árvore do arquivo 07 (3D em código, ilustração animada sobre arte do usuário, ou vídeo de IA). O motion entra no deck como mais um slide de timeline.

## Princípios que não mudam

- **Verifique com imagens, não com a memória do código.** Já houve slide "pronto" com marca-texto invisível e texto ilegível; só a captura revelou.
- **Anime só `transform`, `opacity` e `stroke-dashoffset`.** Mantém 60 fps no projetor e permite voltar no tempo sem sujeira.
- **Defina todo estado inicial dentro de `build`.** O engine restaura o HTML e remonta o slide ao voltar no tempo; estado fora de `build` se perde.
- **Escolha o fundo pelo conteúdo.** Escuro para energia e tensão, claro para leitura e comparação, papel para dor e documento (1 a 2 slides). Tudo branco ou tudo escuro foi reprovado.
- **Número com fonte; estimativa sinalizada; nunca some horas de casos diferentes.** Estimativas inventadas em reais foram rejeitadas.
- **Sem texto dentro de cenas 3D e sem mensagem negativa gratuita.** Cards de texto flutuando e "Error 500" foram reprovados.
- **Consulte antes de gastar, publicar ou apagar.** Créditos de geração de vídeo, deploy e exclusão de arquivos exigem aprovação explícita.

## Exemplos

**Exemplo 1 · deck a partir de uma pasta de documentos**
Usuário diz: "Preciso de 15 minutos para a diretoria sobre os resultados do time. Está tudo nesta pasta, com o guia de marca."
Ações: ler 100% da pasta e a errata → perguntar ocasião/proibições em múltipla escolha → ledger com atos e tempos → style bible com hex medidos do guia → `scaffold.js deck` → construir ato 1, lint + capturas, corrigir → seguir ato a ato → `nav-test.js` e auditoria de números.
Resultado: pasta do projeto, como abrir (Apresentação e `?studio`), o que foi verificado e o que não foi, decisões tomadas sem consulta.

**Exemplo 2 · abertura cinematográfica**
Usuário diz: "Quero abrir com um filminho 3D estilo origami: dev à noite, a câmera entra na tela e fica tudo preto. Sem texto."
Ações: ler o arquivo 07 → explicar o que o código 3D entrega → `scaffold.js motion papercraft-3d-scene` → amostra curta com a paleta do style bible → capturas em vários pontos → pedir aprovação → só então planejar o encaixe no deck.
Resultado: amostra aprovada, limites declarados (movimento fluido e desempenho não medidos), plano de integração por escrito.

**Exemplo 3 · narração**
Usuário diz: "Escreve a fala de cada slide para eu gerar o áudio e ensaiar, tom conversacional."
Ações: reler fontes e ledger → um arquivo por slide com tempo-alvo, falas por momento e "por que está na tela" → números por extenso → somar tempos e comparar com a duração.
Resultado: pasta `narracao/`, total de minutos, quais narrações foram conferidas contra as fontes e opções de corte.

## Solução de problemas

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| `Dependência ausente: puppeteer-core` | instalação feita fora da pasta de scripts | `npm install --prefix "${CLAUDE_SKILL_DIR}/scripts"` |
| `Chrome/Chromium não encontrado` | navegador fora do caminho padrão ou ausente | definir `CHROME_PATH`; sem navegador, só lint e revisão manual |
| `window.__psb não existe` | o `index.html` não carrega `js/engine.js` | conferir a ordem dos scripts (arquivo 05) |
| Marca-texto invisível ou texto some no fundo escuro | barra não animada | usar `head()` ou `barIn`; o lint acusa |
| Elemento preso invisível ao voltar no tempo | estado inicial fora do `build` | mover para dentro do `build` |
| Cena 3D toda roxa ou lavada | luzes fortes demais | luzes 1 a 3, exposição ~0,9 (arquivo 10) |
| A skill não aparece ou não ativa | frontmatter inválido ou descrição genérica | `---` na linha 1, YAML válido, `claude --debug`; ver arquivo 12 |

Mais casos e correções no arquivo `references/10-lessons-learned.md`.

## Critérios de sucesso e de parada

Sucesso: o deck passa no lint sem erros, a navegação passa no `nav-test.js`, a rubrica do arquivo 08 fica ≥ 4 em todos os critérios e toda entrega diz o que foi e o que não foi verificado. Pare e pergunte ao usuário quando o mesmo slide não melhorar após 3 ciclos de correção, ou quando o feedback vier vazio por duas rodadas. Metas e método de avaliação da skill em `references/12-skill-maintenance.md`.

## Mapa de arquivos

| Preciso de… | Leia |
|---|---|
| Perguntas do briefing, fontes, política de números | `references/01-discovery-and-brief.md` |
| Atos, tempo por slide, tipos de slide | `references/02-storytelling-and-structure.md` |
| Style bible, temas, papel recortado, anti-clichê | `references/03-art-direction-and-themes.md` |
| Coreografia, easings, padrões de animação | `references/04-motion-system.md` |
| Engine, preset v2, Studio, teclado, API de teste | `references/05-engine-and-studio.md` |
| Como escrever um slide, receitas visuais | `references/06-slide-authoring-guide.md` |
| Abertura cinematográfica, 3D de papel, vídeo de IA | `references/07-cinematic-intro-motion.md` |
| Lint, capturas, rubrica, auditoria | `references/08-verification-and-qa.md` |
| Narração e TTS | `references/09-narration-scripts.md` |
| Armadilhas já enfrentadas | `references/10-lessons-learned.md` |
| Templates de motion, bibliotecas e licenças | `references/11-motion-templates-and-licenses.md` |
| Avaliar e manter a skill, empacotar | `references/12-skill-maintenance.md` |
| Exemplo completo de marca (tokens de um banco) | `references/theme-porto-example.md` |

Modelos em `assets/templates/`, starter em `assets/starter-kit/`, cenas de motion em `assets/motion-templates/`, bibliotecas em `assets/vendor/`.
