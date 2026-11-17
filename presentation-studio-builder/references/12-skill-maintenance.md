# 12 · Manutenção da skill: sucesso, avaliações e empacotamento

Conteúdo: critérios de sucesso · como avaliar · critério de parada · ajuste da descrição · modelos · empacotamento e versão.

Este arquivo é para quem mantém a skill (ajustar instruções, rodar evals, publicar). Não precisa ser lido para criar uma apresentação.

## Critérios de sucesso (metas aproximadas, não limites rígidos)

Quantitativos:
- **Ativação:** a skill carrega em ≥ 90% dos pedidos relevantes e em ≤ 10% dos pedidos próximos que não são dela (`evals/trigger-queries.json`, 10 a 20 consultas).
- **Correções do usuário:** em 3 execuções do mesmo cenário, no máximo 2 correções de estrutura/estilo (sem contar preferências novas).
- **Verificação:** 100% das entregas informam o que foi verificado e o que não foi; 0 entregas com `lint-deck.js` em erro.
- **Custo:** o `SKILL.md` carregado ≤ 5.000 palavras; referências lidas só sob demanda.

Qualitativos:
- O usuário não precisa lembrar o assistente de verificar capturas, citar fontes ou perguntar antes de gastar.
- Resultados consistentes entre sessões: mesma estrutura de ledger, mesma coreografia de motion.
- Um usuário novo consegue gerar um deck de 3 slides do zero na primeira tentativa.

## Como avaliar (formato do skill-creator / agentskills.io)

Arquivos: `evals/evals.json` (casos funcionais, com `prompt`, `expected_output`, `files`, `assertions`), `evals/files/` (insumos) e `evals/trigger-queries.json` (ativação e não ativação).

Laço:
1. Para cada caso, rode **com a skill** e **sem a skill** (ou contra a versão anterior), cada um em contexto limpo (um subagente por execução).
2. Grave `outputs/`, `timing.json` (tokens e duração) e `grading.json` (cada assertion com PASS/FAIL e evidência) em `presentation-studio-builder-workspace/iteration-N/eval-<nome>/{with_skill,without_skill}/`.
3. Agregue em `benchmark.json` (taxa de aprovação, tempo e tokens; delta com/sem skill).
4. Remova assertions que passam sempre nas duas configurações; investigue as que falham sempre; estude as que só passam com a skill.
5. Revise com um humano e registre `feedback.json`.
6. Dê os sinais (assertions reprovadas, feedback e transcrições) ao modelo com o `SKILL.md` e peça mudanças **genéricas** (não remendos para um caso). Reavalie em `iteration-N+1`.

Com o plugin: `/plugin install skill-creator@claude-plugins-official` e peça "evaluate my presentation-studio-builder skill with skill-creator". O formato do `claude plugin eval` é diferente e só vale para skills dentro de plugin.

Assertions de apresentação devem ser verificáveis: "o projeto passa em `lint-deck.js` sem erros", "existe `nav-test.js` com saída 0", "o ledger tem no máximo 3 números de destaque por caso", "nenhum dado real de cliente nas telas". Qualidades de gosto (beleza, ritmo) ficam para revisão humana.

## Critério de parada

Pare de iterar (a skill e também o laço de verificação de um deck) quando:
- o feedback do usuário vem vazio em duas rodadas seguidas, ou
- a nota da rubrica não sobe em duas iterações seguidas, ou
- o ganho de aprovação não compensa o aumento de tokens/tempo (leia o `delta`), ou
- após 3 ciclos de correção do mesmo slide sem melhora: pare, descreva o impasse e pergunte ao usuário.

Se a taxa de aprovação estagna ao adicionar regras, a skill pode estar sobre-restrita: tente remover instruções e meça de novo.

## Ajuste da descrição

- Subativa (não carrega quando devia): acrescente frases reais que o usuário diria e termos técnicos, em português e inglês.
- Superativa (carrega sem querer): acrescente gatilhos negativos ("Não use para…") e delimite o escopo.
- Reteste com `evals/trigger-queries.json` a cada mudança. Pergunte ao modelo "quando você usaria a skill presentation-studio-builder?" e compare a resposta com a intenção.

## Modelos

Teste com os modelos que pretende usar (menores precisam de instruções mais explícitas; maiores toleram menos). Registre no `metadata` e nas notas da iteração em quais foram validados.

## Empacotamento e versão

- Zip com a pasta `presentation-studio-builder/` na raiz do arquivo (para upload no claude.ai: Configurações > Capacidades > Skills). O claude.ai não tem Chrome: lá use só `lint-deck.js` e a revisão manual.
- Atualize `metadata.version` no `SKILL.md` a cada mudança relevante e registre o que mudou.
- Claude Code: pasta em `~/.claude/skills/` (pessoal) ou `.claude/skills/` (projeto). Rode `/reload-skills` ou reinicie a sessão. Se a skill não aparecer, verifique a abertura `---` na linha 1, o YAML e use `claude --debug`.
- Regras que **devem valer sempre** (por exemplo, nunca publicar sem aprovação) podem virar hooks no Claude Code (`hooks` no frontmatter ou em settings); esse campo não é aceito fora do Claude Code, então a skill mantém a regra como instrução e o script `lint-deck.js` como verificação.
