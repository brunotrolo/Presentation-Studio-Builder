# 01 · Briefing e fontes de verdade

Conteúdo: perguntas do briefing · leitura de pastas de documentos · hierarquia de decisões · política de números · privacidade e nomes · quando consultar o usuário.

## Perguntas do briefing

Faça em blocos curtos, em múltipla escolha quando possível, com a opção recomendada primeiro. Registre as respostas em `assets/templates/brief-template.md`.

**Ocasião**
- Quem assiste (liderança, pares, banca, clientes) e o que a pessoa deve decidir ou sentir ao final.
- Duração real (ex.: 15 a 20 min) e se haverá perguntas. A duração define o número de slides (ver arquivo 02).
- Ao vivo com apresentador, ou autoexecutável? Quem aciona (setas, clicker)?

**Entrega técnica**
- Offline? (recomendado: sem CDN, fontes e bibliotecas locais). Projetor/tela (16:9 em 1920×1080?).
- Em que pasta salvar e se o projeto antigo/mock deve ficar intacto como referência (padrão: criar pasta nova).

**Marca e estilo**
- Marca oficial: logos, paleta, fontes, guia de marca. Se existirem arquivos, extraia tokens deles (não de memória).
- Referências visuais: sites, imagens, vídeos. Peça imagens de referência; elas resolvem mais que adjetivos.
- Grau de ousadia: o guia da marca pode pedir pouca animação enquanto o usuário quer alto impacto. Pergunte qual prevalece e registre.

**Conteúdo**
- Mensagem central em uma frase.
- Resultados reais, com fonte (documento, e-mail, painel). O que é medido e o que é estimativa.
- O que é proibido: nomes de clientes, dados reais, números sem fonte, termos fora do vocabulário aprovado.
- O que já foi decidido e não deve ser reaberto.

## Leitura de pastas de documentos

Quando o usuário apontar uma pasta, leia 100% dos arquivos e subpastas antes de planejar. Para `.docx`, extraia o texto do `word/document.xml` (descompacte e remova as tags). Procure primeiro um arquivo-mestre (spec, guia, resumo) e um bloco de **errata / decisões vigentes**.

Registre inconsistências entre documentos em uma lista curta (o que diz cada fonte, qual é a proposta). Não "escolha em silêncio": corrija nos documentos existentes quando o usuário autorizar, sem criar arquivos novos se ele pediu para atualizar os existentes.

## Hierarquia de decisões (quando houver conflito)

1. Decisão explícita mais recente do usuário na conversa.
2. Bloco de errata/decisões vigentes dos documentos.
3. Guia de marca oficial (tokens, tipografia, paginação).
4. Documentos de conteúdo (casos, resultados).
5. Propostas anteriores do assistente.

Se um documento antigo (de outra ferramenta ou rascunho) conflitar com uma decisão homologada, a decisão homologada prevalece. Diga isso ao usuário em uma linha e siga.

## Política de números

- Cada número de destaque tem fonte identificável. Sem fonte, use só de forma qualitativa.
- Estimativa e amostra são sinalizadas na própria tela ("estimativa, cenário provável", "amostra de 15% do volume").
- No máximo 1 a 3 números de destaque por caso. Um caso, um slide.
- Não some grandezas de casos diferentes (horas somadas inflam e geram desconfiança).
- Não converta tudo em moeda: se o ganho é produtividade, mostre horas.
- Nunca invente estimativas para "preencher". Se faltar dado, deixe o slide sem o número e liste a lacuna.
- Tese de abertura sem números absolutos: abra com o conceito; os números vêm nos casos.

## Privacidade e nomes

- Nenhum dado real de cliente em telas, payloads, exemplos. Use valores fictícios ou máscaras.
- Nomes de parceiros e fornecedores só se o usuário autorizou explicitamente. Registre a autorização.
- Vocabulário aprovado (ex.: "alucinação mitigada por design", "logging corporativo") entra no style bible como glossário.

## Quando consultar o usuário

Consulte antes de: gastar créditos de geração (imagem/vídeo), publicar ou fazer deploy, apagar ou mover arquivos, mudar a estrutura aprovada, introduzir estimativas, ou quando a direção de arte tiver duas interpretações plausíveis.

Decida sozinho (e informe no resumo) quando: houver uma opção convencional óbvia, a escolha for reversível por um clique (ex.: fundo do slide, que o Studio troca), ou a dúvida for só de redação.

Para direção de arte, mostre uma **amostra pequena** e peça aprovação antes de construir tudo. Reprovar uma amostra de 5 segundos custa pouco; reprovar 25 slides custa muito.
