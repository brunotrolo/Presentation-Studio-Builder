# 02 · Estrutura narrativa e ledger de slides

Conteúdo: orçamento de tempo · atos · catálogo de tipos de slide · escolha de fundo · regras de título e paginação · ledger.

## Orçamento de tempo

Em apresentação ao vivo, o motion toca sozinho e o apresentador fala por cima. Regra prática: 40 a 55 segundos por slide de conteúdo, 15 a 25 segundos para transições e 30 a 40 segundos para a abertura. Um deck de 15–20 minutos tem 22 a 28 slides. Some o tempo planejado por ato e coloque no sumário (ex.: "19,5 min"); o Studio calcula o total real com as pausas.

Se o total estourar, corte nesta ordem: ocultar sumário/resumo (o Studio oculta sem apagar), fundir slides de mesmo assunto, encurtar a fala. Não acelere as animações para caber.

## Atos

Agrupe os slides em atos com tempo e papel claros. Estrutura que funcionou:

| Ato | Papel | Tipos de slide |
|---|---|---|
| 1 · O problema | Dor/gargalo e tese | abertura, sumário, resumo executivo, dor, risco |
| 2 · O sistema | Visão geral da solução e quem decide | mapa do sistema, papel humano |
| 3 · O método | Como funciona (especificação, entendimento) | processo por etapa |
| 4 · A execução | Linha de montagem, contraste antes/depois | etapas, comparação |
| 5 · A prova | Casos reais e consolidação | transição de ato, 1 slide por caso, painel consolidado |
| 6 · A segurança | Governança, riscos, compliance | escudo, mecanismos |
| 7 · O futuro | Visão e fecho | metodologia, finale |

Adapte nomes e quantidade ao assunto, mas mantenha: o problema antes da solução, a prova antes do futuro e um fecho com uma frase que o público repete. O campo `actPage` ("n/total") do slide alimenta o rodapé de seção.

## Catálogo de tipos de slide

- **Abertura:** título com marca-texto no destaque, subtítulo curto, 3 chips que resumem o mapa. Fundo escuro.
- **Sumário:** agenda com barras proporcionais ao tempo e total animado. Fundo claro. Pode ser ocultado.
- **Resumo executivo:** 3 ideias + 1 cartão por resultado com contador + nota de fonte. Fundo claro.
- **Dor / gargalo:** metáfora visual de fila ou bloqueio, carimbo na dor, pergunta que abre o próximo ato. Papel recortado quando for documento ou manchete.
- **Risco:** duas trajetórias (o que dá errado × o que escolhemos), sem números. Fundo escuro.
- **Mapa do sistema:** constelação/pipeline com as etapas e os agentes, contadores finais.
- **Etapa de processo:** uma ideia, uma imagem; título "etapa + verbo".
- **Comparação (sem × com):** duas linhas paralelas, o arco de retrabalho em vermelho. Qualitativo.
- **Transição de ato:** número gigante do ato e frase de uma linha. Pouco texto, silêncio visual.
- **Caso real:** problema → agente/solução → virada → veredito, com 1 a 3 números e fonte.
- **Consolidação:** até 5 números + chips das dimensões de valor. Sem soma entre casos.
- **Governança:** escudo e mecanismos numerados; trilha auditável.
- **Finale:** retorno ao motivo de abertura (simetria), frase final, assinatura em três partes.

## Fundo por conteúdo

| Conteúdo | Fundo |
|---|---|
| Energia, luz, rede, tensão, abertura, transição, finale | escuro (`dark`) |
| Leitura, comparação, métricas, casos, especificação | claro (`light`) |
| Dor, gargalo, documento, manchete (1 a 2 slides por deck) | papel (`paper`) |

O usuário pode trocar o fundo de cada slide no Studio, então escolha o padrão pelo conteúdo e registre no ledger.

## Título e paginação

- O título carrega a mensagem principal, não o tema ("Cobertura que chega a ≥99%", não "Cobertura de testes").
- Marca-texto em uma única expressão por título, a que o público deve guardar.
- Rodapé com "n / total" (considerando slides ocultos) e "seção n/m".
- Textos curtos: o apresentador fala o resto. Corpo mínimo de 22 px no palco 1920×1080; metadados em mono 13 a 16 px são aceitáveis para rótulos.

## Ledger de slides

Preencha `assets/templates/slide-ledger-template.md` com, por slide: id, número, ato, título, objetivo, elementos visuais, números e fonte, fundo padrão, momentos (beats) e duração-alvo. O ledger é a "fonte" para o código dos slides e para a narração; mantenha-o atualizado quando o usuário mudar algo.

Rejeite slides que só diferem no texto. Se dois slides repetem o mesmo argumento, funda-os.
