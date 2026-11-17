# 09 · Roteiro de narração por slide (para estudo e TTS)

Conteúdo: formato dos arquivos · regras de escrita para TTS · tom · explicação do que está na tela · tempo · verificação de precisão.

## Formato

Um arquivo por slide (`narracao/s01.md` … `sNN.md`), para o usuário pedir arquivo por arquivo e colar no gerador de áudio. Modelo em `assets/templates/narration-template.md`.

```
# Slide NN · Título
Tempo-alvo: NN segundos. Ato X · Nome.

## Momento 1 · Nome do momento
Fala em texto corrido.

## Momento 2 · Nome do momento
Fala.

## Por que está na tela
- **Elemento:** o motivo de ele existir (ideia que comunica).
```

A fala segue os momentos (beats) do slide, na mesma ordem em que o motion revela cada elemento. A seção "Por que está na tela" é só para estudo e fica fora do áudio; o usuário usa apenas os blocos de fala.

## Regras de escrita para TTS

- Números por extenso na fala ("quarenta e três", "mil e oitocentos"); porcentagem por extenso ("noventa e nove por cento"); "R$ 1M+" vira "mais de um milhão de reais".
- Sem símbolos que o leitor engole ou lê mal (≥, →, /, #); escreva "pelo menos", "vira", "barra".
- Siglas: soletre ou explique na primeira vez; comandos técnicos ("odin barra legado") em forma falada.
- Frases curtas, uma ideia por frase, vírgulas onde o apresentador respiraria.
- Marcações de pausa entre colchetes (`[PAUSA MANUAL: …]`) ficam fora do áudio.
- Sem emojis nem formatação dentro do texto falado.

## Tom

Pergunte ao usuário: executivo e direto (padrão), conversacional ou dramático. Conversacional usa "pessoal", perguntas retóricas e exemplos do dia a dia, sem perder a precisão. Evite jargão em inglês solto.

## Explicar a tela ("por que está na tela")

Para cada elemento relevante, explique a intenção: o que o público entende, por que aquela cor/forma/animação e que regra do projeto ela cumpre (por exemplo, "só dois bilhetes passam: mostra o paradoxo", "número em horas, sem reais, por decisão do projeto"). Isso permite ao apresentador defender cada escolha e ajustar depois.

## Tempo

Some os tempos-alvo e compare com a duração do sumário. Pausas manuais e conversa ao vivo não entram na conta; diga ao usuário quanto estourou e ofereça cortes (ocultar slides no Studio, encurtar falas, fundir slides). O apresentador não deve falar mais depressa para caber.

## Precisão

- Releia o documento do caso ou a fonte antes de narrar números e detalhes; um primeiro rascunho feito de memória já errou o contexto de um caso.
- Respeite as restrições (tese sem números absolutos, nomes autorizados, estimativas sinalizadas, vocabulário aprovado).
- Cada número falado tem a mesma fonte e o mesmo aviso que a tela.
- Diga ao usuário quais narrações foram conferidas contra os documentos e quais não.

## Entrega

Crie a pasta, escreva todos os arquivos quando o usuário pedir "todos", informe o total de tempo e peça ajustes. Gere áudio só se uma ferramenta de TTS estiver disponível; caso contrário, entregue o texto limpo.

## Não invente

Não acrescente saudações, anedotas, contexto de caso ou afirmações de tendência que as fontes não sustentem ("tende a ser maior", "bom dia" sem saber o horário). Quando precisar de uma ponte de fala, deixe-a genérica e marque a inferência na entrega para o usuário aprovar ou cortar. Se o ledger tiver menos slides que o briefing tem resultados, não narre o que não está no ledger: avise.
