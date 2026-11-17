# 10 · Lições aprendidas (armadilhas e correções)

Conteúdo: erros técnicos · erros de processo · feedback do usuário que virou regra.

## Técnicas

| Sintoma | Causa | Correção |
|---|---|---|
| Elementos ficam invisíveis depois de voltar no tempo | `autoAlpha` rebobinado deixa `visibility: hidden` | O engine restaura o HTML original e remonta a timeline em toda volta. Estados iniciais só dentro de `build`. |
| Dois `→` rápidos só avançam um slide | transição de saída ainda em curso | `pendingIdx` soma toques; `←` durante o avanço cancela. |
| Marca-texto invisível; texto preto some no fundo escuro | barra nunca animada | usar `head()` ou `gsap.set(bar,{scaleX:0})` + `barIn`. |
| Carimbo cobre o elemento principal | posição fixa sem conferir quadro final | revisar o quadro final de cada slide e reposicionar. |
| Contador de número quebra em duas linhas | `display: grid; place-content: center` com spans | usar `display: flex; align-items: center; justify-content: center`. |
| Estilo estranho em elemento novo | classe curta colide (`.tk` existia no CSS de outro slide) | prefixar todas as classes do slide. |
| Slide renderiza antes das fontes | fonte carregando | iniciar o engine após `document.fonts.ready`. |
| `three.module.js` não carrega | módulos ES bloqueados em `file://` | usar o build clássico `three.min.js` (r152) local. |
| Cena 3D toda roxa ou lavada | intensidades de luz altas demais (modo legado) e tone mapping | reduzir pontos/spot (1 a 3), exposição ~0,9; testar por captura. |
| Textura com cara de reboco | bump alto e fibras muito contrastadas | `bumpScale` 0,1 a 0,15; mapa de fibra de baixo contraste. |
| `NaN` na geometria | array de vértices com tamanho errado | conferir múltiplos de 3 e `computeBoundingSphere`. |
| Captura não mostra animação | `time()` do GSAP suprime eventos | chamar `render()` explicitamente depois de `tl.time(t)`. |
| Rotas SVG com `pathLength="1"` e `getTotalLength` divergem | `stroke-dasharray` em unidades de `pathLength` | ou use `pathLength` e dash normalizado, ou não use o atributo e dash em px. |

## Ambiente

- Pastas em unidades de rede (Google Drive) deixam comandos lentos ou travados: rodar tarefas pesadas em segundo plano.
- No Windows com Git Bash, `/tmp` do shell difere do `/tmp` do Windows (usar `cygpath -m`/`-w`). Evite heredocs com `\`; prefira criar o arquivo com a ferramenta de escrita.
- Edições com `sed` e escapes em shells aninhados podem corromper expressões regulares (barras invertidas somem). Prefira escrever o literal com a ferramenta de edição ou usar um script Node.
- Baixar bibliotecas grandes por `npm pack` pode ser lento; prefira arquivos `woff2` individuais de um CDN (jsDelivr) e salve localmente.
- Fontes `.fntdata` de templates de PowerPoint são EOT e não servem para a web.

## Processo

- **Perguntar antes de assumir:** estimativas em reais que o assistente "inventou" foram rejeitadas (altas demais); mostrar só horas era a decisão correta.
- **Respeitar a hierarquia de decisões:** documentos antigos conflitavam com decisões homologadas (números antigos, termos retirados); a decisão do usuário prevalece.
- **Amostra antes de volume:** um slide de teste (mock) aprovado antes de 25 slides evitou retrabalho; um rascunho em SVG de uma cena cinematográfica foi reprovado e economizou um dia.
- **Mostrar, não prometer, acabamento:** quando a referência do usuário superou o que o código entrega, a franqueza ("isso exige vídeo de IA ou ilustração animada") valeu mais que insistir.
- **Fundos ponderados:** pintar tudo de branco (ou tudo de escuro) foi reprovado; critério por conteúdo com troca no Studio foi aprovado.
- **Estilo de jornal rasgado com parcimônia:** 1 a 2 slides; o efeito perde força se repetido.
- **Sem texto em cenas 3D e sem negatividade gratuita:** cards flutuando e alertas em texto foram removidos a pedido.
- **Revisão visual obrigatória:** todo defeito relevante (marca-texto, sobreposição, ilegível) foi pego olhando capturas, não lendo código.
- **Atualizar documentos existentes** em vez de criar novos quando o usuário pede isso; registrar nova pasta/estrutura no documento-mestre.
- **Comunicar em pt-BR com acentuação correta** quando o usuário escreve em pt-BR; nomes técnicos ficam no original.
- **Atualizar o usuário** durante tarefas longas: achados, mudança de plano e o que foi verificado.
