# 08 · Verificação e qualidade

Conteúdo: laço de verificação · ferramentas · checklist visual · rubrica · auditoria de números · evidências na entrega.

## Laço de verificação (por ato)

```
construir 4–6 slides → lint-deck → capturar → folha de contato → LER as imagens → corrigir → recapturar
```

0. `node "${CLAUDE_SKILL_DIR}/scripts/lint-deck.js" <pasta>` confere o que é mecânico (ids e números de slide, timeline pausada, momentos com label, marca-texto animado, preset coerente, termos proibidos e dados reais definidos em `lint.config.json`, número em destaque sem fonte). Corrija todo ERRO antes de capturar; avisos se avaliam caso a caso (`--strict` os transforma em erro).
1. `node "${CLAUDE_SKILL_DIR}/scripts/capture.js" <index.html> out <ids|all> 0.35,0.7,1` gera 3 quadros por slide (início, meio, final), avisa elementos fora do palco, cortes de overflow e erros de console.
2. `node "${CLAUDE_SKILL_DIR}/scripts/contact-sheet.js" folha.png 3 out/*.png` monta a folha para revisar vários slides de uma vez.
3. Leia as imagens (use a ferramenta de leitura de imagem). Compare com o ledger e o style bible. Liste defeitos e corrija.
4. Ao fim de tudo, `node "${CLAUDE_SKILL_DIR}/scripts/nav-test.js" <index.html> <idParaOcultar>`.

WebGL em Chrome headless: `CHROME_ARGS="--use-angle=swiftshader --enable-unsafe-swiftshader"`. Sem Chrome (por exemplo claude.ai), use só o lint e a revisão manual e diga isso na entrega.

Comandos pesados em unidades de rede (Google Drive, OneDrive) ficam lentos: rode em segundo plano e evite varrer a pasta inteira.

## Checklist visual (por slide)

- [ ] Quadro final legível e equilibrado; o olhar vai ao elemento principal.
- [ ] Título com a mensagem; marca-texto visível e com texto legível sobre ele.
- [ ] Nenhum elemento fora do palco (1920×1080) e nenhum corte de overflow.
- [ ] Texto mínimo de 22 px em conteúdo (rótulos mono menores só como metadado).
- [ ] Contraste suficiente nos três temas em que o slide possa aparecer (o Studio troca o fundo).
- [ ] Sem sobreposição indesejada (carimbo cobrindo elemento, legenda sobre figura).
- [ ] Sem texto em cenas 3D/ilustrações; sem tom negativo gratuito.
- [ ] Sem dados reais de cliente; nomes autorizados.
- [ ] Console sem erros ou avisos relevantes; nenhum request falho (fontes, imagens).

## Critério de parada

O laço termina quando o lint não tem erros, as capturas não mostram defeitos e a rubrica fica ≥ 4. Interrompa e consulte o usuário se o mesmo slide não melhorar após 3 ciclos de correção, se o feedback vier vazio por duas rodadas (nada mais a ajustar) ou se uma correção piorar outro slide (indício de regra mal definida: pergunte qual prevalece).

## Rubrica de qualidade (0 a 5 por critério; meta ≥ 4 antes de entregar)

| Critério | 5 significa |
|---|---|
| Clareza da mensagem | o título sozinho conta a ideia; um foco por slide |
| Hierarquia visual | tamanho, cor e posição guiam o olhar sem esforço |
| Coerência de estilo | paleta, material e motion seguem o style bible |
| Motion com função | cada movimento explica causa e efeito; ritmo sem pressa nem espera |
| Fidelidade técnica | sem estouro, sem erro, funciona voltando no tempo |
| Honestidade dos dados | fonte, estimativa sinalizada, nada somado indevidamente |

Registre a nota e o que falta para chegar a 5 quando houver margem. Se um critério ficar abaixo de 4, corrija antes de seguir.

## Auditoria de números (final)

Percorra todas as telas e a narração e monte uma tabela: número · onde aparece · fonte · medido/estimativa. Falhas comuns: número do documento antigo que sobrou, valor sem fonte, estimativa sem aviso, soma entre casos, "99%" aparecendo onde a tese é sem números.

## Cenas 3D

- Conferir quadros em vários pontos da câmera, inclusive o instante da travessia e o final escuro.
- Medir desempenho em máquina real; o headless usa renderização por software e não representa a GPU.
- Verificar `NaN` na geometria (aviso do Three.js no console) e texturas CORS (`file://` bloqueia algumas).

## Evidências na entrega

Informe: o que foi verificado (capturas, navegação, console), o que não foi (movimento fluido, desempenho em hardware real), as decisões tomadas sem consulta e os pontos em aberto. Diga o que viu, sem inflar.
