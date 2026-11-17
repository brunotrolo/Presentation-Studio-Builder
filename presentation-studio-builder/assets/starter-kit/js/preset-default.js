/* Marcação de tempo padrão (formato v2). A marcação salva no Studio (?studio) sobrescreve este arquivo.
   Slides que NÃO aparecem aqui recebem automaticamente 0,6 s de respiro depois de cada momento.
   Para fixar uma marcação em definitivo: no Studio use "Exportar JSON" e cole o conteúdo de "slides" aqui.

   speed  = fator de velocidade do slide inteiro (1 = normal)
   theme  = "dark" | "light" | "paper"
   hidden = true oculta o slide da apresentação
   pauses = { t | after, hold, mode }  t = segundo da timeline  ·  after = id do momento (pausa no FIM dele)
            hold = segundos parado (mode "auto")  ·  mode = "auto" ou "manual" (espera a seta/clicker)
   ramps  = { from, to, speed } ou { beat, speed }  trechos de velocidade                                  */
window.PSB_PRESET_DEFAULT = {
  version: 2,
  slides: {
    s02: { speed: 1, theme: "light", hidden: false, pauses: [{ after: "problema", mode: "manual" }], ramps: [] },
  },
};
