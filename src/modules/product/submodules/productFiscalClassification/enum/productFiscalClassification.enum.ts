/**
 * Tabela de Origem da Mercadoria (SEFAZ)
 */
export enum OriginEnum {
  NACIONAL = 0, // Nacional, exceto as abrangidas nos códigos 3, 4, 5 e 8
  ESTRANGEIRA_IMPORTACAO_DIRETA = 1, // Estrangeira - Importação direta
  ESTRANGEIRA_ADQUIRIDA_MERCADO_INTERNO = 2, // Estrangeira - Adquirida no mercado interno
  NACIONAL_CONTEUDO_IMPORTACAO_SUPERIOR_40 = 3, // Nacional, mercadoria/bem com Conteúdo de Importação > 40% e <= 70%
  NACIONAL_PROCESSOS_PRODUTIVOS_BASICOS = 4, // Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos
  NACIONAL_CONTEUDO_IMPORTACAO_INFERIOR_EQUAL_40 = 5, // Nacional, mercadoria/bem com Conteúdo de Importação <= 40%
  ESTRANGEIRA_IMPORTACAO_DIRETA_SEM_SIMILAR = 6, // Estrangeira - Importação direta, sem similar nacional, constante em lista CAMEX
  ESTRANGEIRA_MERCADO_INTERNO_SEM_SIMILAR = 7, // Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista CAMEX
  NACIONAL_CONTEUDO_IMPORTACAO_SUPERIOR_70 = 8, // Nacional, mercadoria/bem com Conteúdo de Importação > 70%
}

/**
 * CSOSN - Código de Situação da Operação no Simples Nacional
 */
export enum CsosnEnum {
  TRIBUTADA_COM_CREDITO = '101', // Tributada pelo Simples Nacional com permissão de crédito
  TRIBUTADA_SEM_CREDITO = '102', // Tributada pelo Simples Nacional sem permissão de crédito
  ISENCAO_ICMS_FAIXA_RECEITA = '103', // Isenção do ICMS no Simples Nacional para faixa de receita bruta
  IMUNE = '201', // Tributada pelo Simples Nacional com permissão de crédito e com cobrança do ICMS por ST
  SUBSTITUICAO_TRIBUTARIA_SEM_CREDITO = '202', // Tributada pelo Simples Nacional sem permissão de crédito e com cobrança do ICMS por ST
  ISENCAO_ICMS_E_ST = '203', // Isenção do ICMS no Simples Nacional para faixa de receita bruta e com cobrança do ICMS por ST
  IMUNE_COM_ST = '300', // Imune
  NAO_TRIBUTADA = '400', // Não tributada pelo Simples Nacional
  ICMS_COBRADO_ANTERIORMENTE = '500', // ICMS cobrado anteriormente por substituição tributária (substituído) ou por antecipação
  OUTROS = '900', // Outros
}

/**
 * CST de PIS e COFINS (Tabela Oficial da Receita Federal)
 */
export enum PisCofinsCstEnum {
  OPERACAO_TRIBUTAVEL_ALIQUOTA_BASICA = '01',
  OPERACAO_TRIBUTAVEL_ALIQUOTA_DIFERENCIADA = '02',
  OPERACAO_TRIBUTAVEL_ALIQUOTA_POR_UNIDADE = '03',
  OPERACAO_TRIBUTAVEL_MONOFASICA = '04',
  OPERACAO_TRIBUTAVEL_ST = '05',
  OPERACAO_TRIBUTAVEL_ALIQUOTA_ZERO = '06',
  OPERACAO_ISENTA_CONTRIBUICAO = '07',
  OPERACAO_SEM_INCIDENCIA_CONTRIBUICAO = '08',
  OPERACAO_COM_SUSPENSAO_CONTRIBUICAO = '09',
  OUTRAS_OPERACOES_SAIDA = '49',
  DIREITO_CREDITO_VINCULADA_RECEITA_TRIBUTADA = '50',
  DIREITO_CREDITO_VINCULADA_RECEITA_NAO_TRIBUTADA = '51',
  DIREITO_CREDITO_VINCULADA_RECEITA_EXPORTACAO = '52',
  SEM_DIREITO_CREDITO = '70',
  AQUISICAO_ISENTA_TRIBUTACAO = '73',
  OUTRAS_OPERACOES_ENTRADA = '98',
  OUTRAS_OPERACOES = '99',
}
