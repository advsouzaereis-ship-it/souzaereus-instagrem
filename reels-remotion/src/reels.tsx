import {ReelDef, Theme} from './engine';

// 29/10: Venda de veículo (STJ, Tema 1324). Tema "pista": grafite e âmbar, movimento seco.
const PISTA: Theme = {
  bg: 'linear-gradient(170deg, #2A2E35 0%, #1B1E23 60%, #121418 100%)',
  text: '#F4F1EA',
  muted: '#9AA0A8',
  accent: '#F2B33D',
  accent2: '#E0533D',
  bandBg: '#F2B33D',
  bandText: '#1B1E23',
  display: 'Poppins, sans-serif',
  displayWeight: 800,
  sans: 'Inter, sans-serif',
  motion: 'snappy',
  deco: 'road',
};

export const VEICULO: ReelDef = {
  theme: PISTA,
  scenes: [
    {
      type: 'hero',
      kicker: 'VENDEU O CARRO?',
      big: 'Avisou o Detran?',
      size: 130,
      band: 'AS MULTAS PODEM SER SUAS',
      support: ['Mesmo depois da ', 'venda', '.'],
      dur: 105,
    },
    {
      type: 'hero',
      kicker: 'STJ, TEMA 1324, 14/10/2026',
      big: 'Responde junto',
      size: 140,
      band: 'RESPONSABILIDADE SOLIDÁRIA',
      support: ['Pelas multas cometidas depois da venda, até a ', 'comunicação', '.'],
      dur: 120,
    },
    {
      type: 'count',
      kicker: 'PRAZO DO COMPRADOR',
      to: 30,
      unit: 'dias',
      support: ['Para ', 'transferir', ' o veículo para o nome dele.'],
      dur: 105,
    },
    {
      type: 'hero',
      kicker: 'SE ELE NÃO TRANSFERIR',
      big: 'Comunique o Detran',
      size: 128,
      band: 'ART. 134 DO CÓDIGO DE TRÂNSITO',
      support: ['Com o comprovante de transferência ', 'assinado', ' e datado.'],
      dur: 120,
    },
    {
      type: 'list',
      kicker: 'GUARDE COM VOCÊ',
      items: ['Cópia do documento de venda', 'Comprovante da comunicação ao Detran'],
      icon: 'check',
      dur: 100,
    },
  ],
  cta: {line: ['Salve para quando for ', 'vender', ' seu veículo.'], dur: 130},
};

// 30/10: Dano moral por atraso de voo. Tema "papel": bege, azul-marinho e terracota, movimento suave.
const PAPEL: Theme = {
  bg: 'linear-gradient(180deg, #F3EEE4 0%, #EDE6DA 100%)',
  text: '#1F3550',
  muted: '#7A7468',
  accent: '#B5573B',
  accent2: '#B5573B',
  bandBg: '#1F3550',
  bandText: '#F3EEE4',
  display: 'Lora, serif',
  displayWeight: 700,
  sans: 'Inter, sans-serif',
  motion: 'smooth',
  deco: 'paper',
};

export const DANO_MORAL: ReelDef = {
  theme: PAPEL,
  scenes: [
    {
      type: 'hero',
      kicker: 'VOO ATRASADO',
      big: 'Gera indenização?',
      size: 120,
      band: 'O QUE A LEI E O STJ DIZEM',
      support: ['A resposta não é ', 'automática', '.'],
      dur: 105,
    },
    {
      type: 'strike',
      kicker: 'ENTENDIMENTO DO STJ',
      before: 'Dano moral ',
      struck: 'presumido',
      after: '',
      support: ['O atraso, por si só, não basta. O passageiro precisa ', 'demonstrar', ' o prejuízo.'],
      dur: 135,
    },
    {
      type: 'hero',
      kicker: 'LEI 14.034/2020',
      big: 'Art. 251‑A',
      size: 150,
      band: 'CÓDIGO BRASILEIRO DE AERONÁUTICA',
      support: ['Segue a mesma ', 'linha', ': prejuízo comprovado.'],
      dur: 115,
    },
    {
      type: 'list',
      kicker: 'O QUE PESA NA ANÁLISE',
      items: ['Tempo real de espera', 'Assistência e informação', 'Conexão ou compromisso perdido', 'Idosos, gestantes, crianças, PcD'],
      icon: 'dot',
      dur: 135,
    },
    {
      type: 'list',
      kicker: 'GUARDE',
      items: ['Cartão de embarque', 'Mensagens da companhia', 'Notas fiscais', 'Comprovante do compromisso'],
      icon: 'check',
      dur: 125,
    },
  ],
  cta: {line: ['Salve para a ', 'próxima', ' viagem.'], dur: 125},
};

// 31/10: Direito de arrependimento. Tema "vitrine": preto, dourado e coral, movimento cinético.
const VITRINE: Theme = {
  bg: 'radial-gradient(circle at 70% 25%, #23202A 0%, #121116 55%, #0A0A0D 100%)',
  text: '#FFFFFF',
  muted: '#A7A3AE',
  accent: '#E8B860',
  accent2: '#FF5A4E',
  bandBg: '#FF5A4E',
  bandText: '#FFFFFF',
  display: 'Poppins, sans-serif',
  displayWeight: 900,
  sans: 'Poppins, sans-serif',
  motion: 'kinetic',
  deco: 'flash',
};

export const ARREPENDIMENTO: ReelDef = {
  theme: VITRINE,
  scenes: [
    {
      type: 'hero',
      kicker: 'COMPROU PELA INTERNET?',
      big: 'Se arrependeu?',
      size: 140,
      band: 'A LEI DÁ 7 DIAS',
      support: ['Sem precisar explicar o ', 'motivo', '.'],
      dur: 100,
    },
    {
      type: 'dots',
      kicker: 'ART. 49 DO CDC',
      n: 7,
      big: '7 dias',
      support: ['Contados da entrega do produto ou da ', 'assinatura', ' do contrato.'],
      dur: 120,
    },
    {
      type: 'flash',
      kicker: 'VALE PARA COMPRA FEITA POR',
      words: ['Site', 'Aplicativo', 'Telefone', 'Catálogo'],
      support: ['Tudo fora da ', 'loja física', '.'],
      dur: 145,
    },
    {
      type: 'hero',
      kicker: 'DINHEIRO DE VOLTA',
      big: 'Inclusive o frete',
      size: 130,
      band: 'COM CORREÇÃO MONETÁRIA',
      support: ['Tudo o que você pagou, a ', 'qualquer título', '.'],
      dur: 110,
    },
    {
      type: 'hero',
      kicker: 'PAGOU NO CARTÃO?',
      big: 'Estorno',
      size: 190,
      band: 'DECRETO 7.962/2013',
      support: ['A loja deve avisar a ', 'administradora', ' do cartão.'],
      dur: 110,
    },
    {
      type: 'list',
      kicker: 'BLACK FRIDAY É EM 27/11. GUARDE:',
      items: ['Print do anúncio', 'Número do pedido', 'Protocolo do cancelamento'],
      icon: 'check',
      dur: 110,
    },
  ],
  cta: {line: ['Salve para consultar na ', 'Black Friday', '.'], dur: 120},
};
