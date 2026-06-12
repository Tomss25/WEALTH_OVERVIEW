import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BrainCircuit,
  BriefcaseBusiness,
  CandlestickChart,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ExternalLink,
  Gauge,
  Globe2,
  Landmark,
  Moon,
  MoreHorizontal,
  Newspaper,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Trash2,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './styles.css';

const markets = [
  { symbol: 'SPX', name: 'S&P 500', group: 'Indici', price: '5.421,03', daily: 0.42, monthly: 3.18, currency: 'USD', favorite: true },
  { symbol: 'NDX', name: 'Nasdaq 100', group: 'Indici', price: '19.447,41', daily: 0.71, monthly: 5.62, currency: 'USD', favorite: true },
  { symbol: 'SX5E', name: 'Euro Stoxx 50', group: 'Indici', price: '5.036,45', daily: -0.18, monthly: 1.24, currency: 'EUR', favorite: true },
  { symbol: 'FTSEMIB', name: 'FTSE MIB', group: 'Indici', price: '34.742,12', daily: 0.23, monthly: 2.05, currency: 'EUR', favorite: false },
  { symbol: 'MSCIWORLD', name: 'MSCI World ETF', group: 'Indici', price: '157,84', daily: 0.31, monthly: 2.14, currency: 'USD', favorite: false },
  { symbol: 'EUR/USD', name: 'Euro / Dollaro', group: 'Valute', price: '1,0842', daily: -0.12, monthly: 0.88, currency: '', favorite: true },
  { symbol: 'USD/JPY', name: 'Dollaro / Yen', group: 'Valute', price: '157,34', daily: 0.31, monthly: -1.42, currency: '', favorite: false },
  { symbol: 'GOLD', name: 'Oro Spot', group: 'Materie prime', price: '2.326,80', daily: 0.54, monthly: 2.76, currency: 'USD', favorite: true },
  { symbol: 'COPPER', name: 'Rame', group: 'Materie prime', price: '4,54', daily: 0.86, monthly: 4.32, currency: 'USD', favorite: false },
  { symbol: 'BRENT', name: 'Petrolio Brent', group: 'Materie prime', price: '81,42', daily: 1.18, monthly: -2.41, currency: 'USD', favorite: false },
  { symbol: 'BTC', name: 'Bitcoin', group: 'Crypto', price: '67.842,10', daily: -1.08, monthly: 8.91, currency: 'USD', favorite: false },
  { symbol: 'VIX', name: 'Indice di volatilità VIX', group: 'Volatilità', price: '14,82', daily: -3.26, monthly: -8.74, currency: '', favorite: false },
  { symbol: 'VVIX', name: 'Volatilità del VIX', group: 'Volatilità', price: '88,60', daily: -1.42, monthly: -5.18, currency: '', favorite: false },
  { symbol: 'VSTOXX', name: 'Euro Stoxx 50 Volatility', group: 'Volatilità', price: '16,20', daily: -1.18, monthly: -6.32, currency: '', favorite: false },
  { symbol: 'MOVE', name: 'MOVE Bond Volatility', group: 'Volatilità', price: '96,40', daily: -0.84, monthly: -4.18, currency: '', favorite: false },
  { symbol: 'BTP10Y', name: 'BTP Italia 10 anni', group: 'Obbligazioni', price: '3,92', daily: -0.04, monthly: -0.18, currency: '%', favorite: false },
  { symbol: 'BTP2Y', name: 'BTP Italia 2 anni', group: 'Obbligazioni', price: '3,41', daily: -0.03, monthly: -0.22, currency: '%', favorite: false },
  { symbol: 'BUND10Y', name: 'Bund Germania 10 anni', group: 'Obbligazioni', price: '2,62', daily: -0.02, monthly: 0.09, currency: '%', favorite: false },
  { symbol: 'UST10Y', name: 'Treasury USA 10 anni', group: 'Obbligazioni', price: '4,34', daily: 0.03, monthly: -0.12, currency: '%', favorite: false },
  { symbol: 'UST2Y', name: 'Treasury USA 2 anni', group: 'Obbligazioni', price: '4,76', daily: 0.02, monthly: -0.08, currency: '%', favorite: false },
  { symbol: 'UST30Y', name: 'Treasury USA 30 anni', group: 'Obbligazioni', price: '4,48', daily: 0.04, monthly: -0.06, currency: '%', favorite: false },
  { symbol: 'BTP-BUND', name: 'Spread BTP / Bund', group: 'Credito e spread', price: '141', daily: -1.40, monthly: -5.37, currency: 'pb', favorite: false },
  { symbol: 'USHY', name: 'Spread High Yield USA', group: 'Credito e spread', price: '318', daily: -0.62, monthly: -5.36, currency: 'pb', favorite: false },
  { symbol: 'EUHY', name: 'Spread High Yield Europa', group: 'Credito e spread', price: '342', daily: -0.58, monthly: -3.12, currency: 'pb', favorite: false },
  { symbol: 'DXY', name: 'Dollar Index', group: 'Valute', price: '104,72', daily: 0.16, monthly: 0.41, currency: '', favorite: false },
  { symbol: 'GBP/USD', name: 'Sterlina / Dollaro', group: 'Valute', price: '1,2741', daily: -0.21, monthly: 1.12, currency: '$', favorite: false },
  { symbol: 'SILVER', name: 'Argento Spot', group: 'Materie prime', price: '29,48', daily: 0.72, monthly: 6.83, currency: 'USD', favorite: false },
  { symbol: 'WTI', name: 'Petrolio WTI', group: 'Materie prime', price: '77,91', daily: 1.02, monthly: -2.08, currency: 'USD', favorite: false },
  { symbol: 'ETH', name: 'Ethereum', group: 'Crypto', price: '3.521,64', daily: -0.74, monthly: 11.28, currency: 'USD', favorite: false },
];

const chartData = [
  { day: '13 Mag', value: 5185 }, { day: '16 Mag', value: 5222 }, { day: '20 Mag', value: 5308 },
  { day: '23 Mag', value: 5267 }, { day: '27 Mag', value: 5314 }, { day: '30 Mag', value: 5278 },
  { day: '3 Giu', value: 5335 }, { day: '6 Giu', value: 5372 }, { day: '10 Giu', value: 5391 },
  { day: 'Oggi', value: 5421 },
];

const macro = [
  { label: 'Tasso BCE', value: '4,25%', note: 'Prossima riunione 18 lug', tone: 'blue' },
  { label: 'Fed Funds Rate', value: '5,50%', note: 'Invariato', tone: 'violet' },
  { label: 'BTP 10 anni', value: '3,92%', note: '-4 pb oggi', tone: 'green' },
  { label: 'Spread BTP-Bund', value: '141 pb', note: '-2 pb oggi', tone: 'orange' },
];

const commodities = [
  { symbol: 'COPPER', name: 'Rame', price: '4,54', unit: 'USD / lb', daily: 0.86, monthly: 4.32, tone: 'copper' },
  { symbol: 'BRENT', name: 'Petrolio Brent', price: '81,42', unit: 'USD / barile', daily: 1.18, monthly: -2.41, tone: 'oil' },
];

const macroRegions = {
  Globale: {
    regime: 'Reflazione moderata', summary: 'Crescita resiliente e pressioni energetiche contenute', tone: 'positive',
    signals: [
      { title: 'Ciclo industriale globale', priority: 'Alta', status: 'Reflazione', tone: 'positive', left: ['Rame', '+4,32% 1M'], right: ['Brent', '-2,41% 1M'], reading: 'Il rame forte con petrolio più debole suggerisce domanda industriale solida senza uno shock energetico.' },
      { title: 'Inflazione importata', priority: 'Alta', status: 'Pressione moderata', tone: 'neutral', left: ['Materie prime', '+1,7% 1M'], right: ['Dollaro USA', '+0,4% 1M'], reading: 'Commodity e dollaro entrambi in lieve rialzo aumentano marginalmente la pressione sui paesi importatori.' },
      { title: 'Domanda difensiva', priority: 'Alta', status: 'Difesa contenuta', tone: 'positive', left: ['Oro', '+2,76% 1M'], right: ['Rame', '+4,32% 1M'], reading: 'Il rame sovraperforma l’oro: il segnale relativo favorisce crescita industriale rispetto alla pura difesa.' },
      { title: 'Liquidità globale', priority: 'Media', status: 'Neutrale', tone: 'neutral', left: ['Dollaro DXY', '+0,4% 1M'], right: ['Bitcoin', '+8,91% 1M'], reading: 'Il dollaro stabile e gli asset sensibili alla liquidità forti non indicano una stretta globale marcata.' },
      { title: 'Commercio mondiale', priority: 'Media', status: 'Espansione lieve', tone: 'positive', left: ['Baltic Dry', '+3,6% 1M'], right: ['Rame', '+4,32% 1M'], reading: 'Trasporti marittimi e rame in rialzo suggeriscono un miglioramento graduale della domanda globale.' },
    ],
  },
  'Stati Uniti': {
    regime: 'Espansione tardiva', summary: 'Crescita resiliente con tassi reali ancora restrittivi', tone: 'neutral',
    signals: [
      { title: 'Rischio recessione USA', priority: 'Alta', status: 'Attenzione moderata', tone: 'warning', left: ['Curva 10Y–3M', '-0,72%'], right: ['Spread High Yield', '3,18%'], reading: 'La curva resta invertita, ma gli spread creditizi contenuti non confermano stress recessivo imminente.' },
      { title: 'Stress finanziario USA', priority: 'Alta', status: 'Stress contenuto', tone: 'positive', left: ['VIX', '14,8'], right: ['Spread High Yield', '3,18%'], reading: 'Volatilità e premio per il rischio creditizio restano bassi: il mercato non segnala tensioni sistemiche.' },
      { title: 'Origine del rialzo tassi', priority: 'Alta', status: 'Tassi reali elevati', tone: 'neutral', left: ['Treasury 10Y', '4,34%'], right: ['Breakeven 10Y', '2,29%'], reading: 'Rendimenti nominali elevati con aspettative d’inflazione stabili indicano soprattutto tassi reali più restrittivi.' },
      { title: 'Azioni e credito USA', priority: 'Alta', status: 'Risk-on confermato', tone: 'positive', left: ['S&P 500', '+3,18% 1M'], right: ['Spread High Yield', '-18 pb 1M'], reading: 'Azioni in rialzo e spread in calo descrivono condizioni finanziarie favorevoli e un risk-on coerente.' },
      { title: 'Ampiezza della crescita', priority: 'Media', status: 'Mercato concentrato', tone: 'warning', left: ['Russell 2000', '+0,8% 1M'], right: ['S&P 500', '+3,18% 1M'], reading: 'Le large cap sovraperformano le small cap: la forza del mercato non è ancora pienamente diffusa.' },
      { title: 'Oro e tassi reali USA', priority: 'Media', status: 'Divergenza difensiva', tone: 'warning', left: ['Oro', '+2,76% 1M'], right: ['Tasso reale 10Y', '2,05%'], reading: 'Oro e rendimenti reali entrambi forti possono riflettere domanda difensiva, rischio geopolitico o fiscale.' },
    ],
  },
  Europa: {
    regime: 'Ripresa fragile', summary: 'Disinflazione favorevole, crescita ancora poco diffusa', tone: 'warning',
    signals: [
      { title: 'Ciclo Eurozona', priority: 'Alta', status: 'Ripresa fragile', tone: 'warning', left: ['Euro Stoxx 50', '+1,24% 1M'], right: ['Spread HY EUR', '3,42%'], reading: 'Azioni positive e credito stabile indicano una ripresa ordinata, ma non ancora particolarmente robusta.' },
      { title: 'Curva e crescita europea', priority: 'Alta', status: 'Normalizzazione', tone: 'neutral', left: ['Bund 10Y–2Y', '+0,18%'], right: ['PMI composito', '51,2'], reading: 'La curva torna lievemente positiva e il PMI sopra 50 suggerisce crescita contenuta ma non recessiva.' },
      { title: 'Inflazione Eurozona', priority: 'Alta', status: 'Disinflazione', tone: 'positive', left: ['Bund 10Y', '2,62%'], right: ['Inflazione swap 5Y5Y', '2,31%'], reading: 'Le aspettative di inflazione restano vicine all’obiettivo, favorendo una graduale normalizzazione monetaria.' },
      { title: 'Rischio periferico', priority: 'Alta', status: 'Contenuto', tone: 'positive', left: ['Spread BTP–Bund', '141 pb'], right: ['Euro Stoxx Banks', '+2,1% 1M'], reading: 'Spread periferico stabile e banche forti non segnalano tensioni rilevanti sulla frammentazione finanziaria.' },
      { title: 'Euro e competitività', priority: 'Media', status: 'Supporto moderato', tone: 'positive', left: ['EUR/USD', '-0,12% oggi'], right: ['DAX', '+1,7% 1M'], reading: 'Un euro non troppo forte può sostenere gli esportatori, mentre il DAX positivo conferma una domanda estera discreta.' },
      { title: 'Banche e curva Bund', priority: 'Media', status: 'Reflazione lieve', tone: 'neutral', left: ['Euro Stoxx Banks', '+2,1% 1M'], right: ['Curva Bund', '+18 pb'], reading: 'Banche e curva più ripida suggeriscono una modesta normalizzazione ciclica, ancora da confermare.' },
    ],
  },
};

const financialNews = [
  {
    category: 'Banche centrali',
    title: 'La BCE alza i tassi di 25 punti base',
    summary: 'La banca centrale reagisce alle nuove pressioni inflazionistiche legate all’energia, mentre rivede al ribasso le prospettive di crescita dell’Eurozona.',
    source: 'The Guardian',
    time: '13:45',
    url: 'https://www.theguardian.com/business/live/2026/jun/11/ryanair-investigation-seating-children-eurozone-interest-rates-middle-east-oil-uk-housing-live-news-updates',
    tone: 'blue',
    featured: true,
  },
  {
    category: 'Mercati',
    title: 'Wall Street verso il rimbalzo dopo la pressione sui titoli AI',
    summary: 'I future statunitensi indicano un’apertura positiva, mentre petrolio e rendimenti restano al centro dell’attenzione degli investitori.',
    source: 'Associated Press',
    time: '12:20',
    url: 'https://apnews.com/article/87c831451197beedb3e29771de1e0a92',
    tone: 'green',
  },
  {
    category: 'Dati macro',
    title: 'Mercati in attesa del PPI statunitense di maggio',
    summary: 'Il dato sui prezzi alla produzione è atteso in rialzo dello 0,7%, dopo l’incremento dell’1,4% registrato ad aprile.',
    source: 'Investopedia',
    time: '11:05',
    url: 'https://www.investopedia.com/5-things-to-know-before-the-stock-market-opens-june-11-2026-11995534',
    tone: 'orange',
  },
  {
    category: 'Valute',
    title: 'Il ruolo internazionale dell’euro cresce moderatamente',
    summary: 'La quota dell’euro negli indicatori globali di utilizzo valutario raggiunge circa il 20%, confermandolo come seconda valuta internazionale.',
    source: 'Banca Centrale Europea',
    time: '10:30',
    url: 'https://www.ecb.europa.eu/press/other-publications/ire/html/ecb.ire202606.en.html',
    tone: 'violet',
  },
  {
    category: 'Obbligazioni',
    title: 'Oggi la pubblicazione dei Financial Accounts degli Stati Uniti',
    summary: 'La Federal Reserve aggiorna i conti finanziari USA, una fotografia dei flussi e dei bilanci di famiglie, imprese e settore pubblico.',
    source: 'Federal Reserve',
    time: '09:40',
    url: 'https://www.federalreserve.gov/releases/z1/',
    tone: 'cyan',
  },
  {
    category: 'Agenda',
    title: 'Jobless claims e inflazione alla produzione guidano la seduta USA',
    summary: 'Le richieste iniziali di sussidio e il PPI sono i principali appuntamenti macroeconomici della giornata americana.',
    source: 'MarketWatch',
    time: '08:30',
    url: 'https://www.marketwatch.com/economy-politics/calendar',
    tone: 'red',
  },
];

const formatChange = (value) => `${value > 0 ? '+' : ''}${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}%`;

const formatLivePrice = (value, currency) => Number(value).toLocaleString('it-IT', {
  minimumFractionDigits: currency === 'pb' ? 0 : 2,
  maximumFractionDigits: currency === 'pb' ? 0 : 4,
});

const formatUpdateTime = (value) => value
  ? new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
  : null;

const parseItalianNumber = (value) => Number(String(value).replaceAll('.', '').replace(',', '.'));

const regionalRiskConfig = {
  Globale: { symbols: ['MSCIWORLD', 'VIX', 'MOVE'], title: 'MSCI World vs VIX e MOVE', description: 'Azioni globali, volatilità azionaria USA e volatilità del mercato obbligazionario.', note: 'VIX misura lo stress azionario; MOVE misura la volatilità implicita dei Treasury USA.' },
  'Stati Uniti': { symbols: ['SPX', 'VIX', 'VVIX'], title: 'S&P 500 vs VIX e VVIX', description: 'Direzione azionaria, volatilità implicita e volatilità della volatilità.', note: 'VIX misura la volatilità implicita dell’S&P 500; VVIX misura l’incertezza attesa sul VIX.' },
  Europa: { symbols: ['SX5E', 'VSTOXX', 'EUHY'], title: 'Euro Stoxx 50 vs VSTOXX e credito HY', description: 'Azioni europee, volatilità implicita e premio per il rischio creditizio.', note: 'VSTOXX misura la volatilità dell’Euro Stoxx 50; lo spread HY misura il premio richiesto sul credito europeo rischioso.' },
};

function regionalRiskView(assets, region) {
  const config = regionalRiskConfig[region];
  const [equity, riskOne, riskTwo] = config.symbols.map((symbol) => assets.find((item) => item.symbol === symbol));
  const riskOneLevel = parseItalianNumber(riskOne?.price);
  const riskTwoLevel = parseItalianNumber(riskTwo?.price);
  const elevated = region === 'Stati Uniti'
    ? riskOneLevel >= 25 || riskTwoLevel >= 120
    : region === 'Europa'
      ? riskOneLevel >= 25 || riskTwoLevel >= 500
      : riskOneLevel >= 25 || riskTwoLevel >= 120;

  if (elevated) return { tone: 'warning', label: 'Stress elevato', text: 'Uno o più indicatori di rischio sono su livelli elevati: il mercato sta prezzando maggiore instabilità, anche nella lettura mensile.' };
  if (equity?.monthly < 0 && riskOne?.monthly > 0 && riskTwo?.monthly > 0) return { tone: 'warning', label: 'Risk-off confermato', text: 'Nell’ultimo mese le azioni sono scese mentre entrambi gli indicatori di rischio sono saliti: deterioramento coerente del sentiment.' };
  if (equity?.monthly > 0 && (riskOne?.monthly > 0 || riskTwo?.monthly > 0)) return { tone: 'neutral', label: 'Rialzo fragile', text: 'Nell’ultimo mese le azioni sono salite, ma almeno un indicatore di rischio è aumentato: il rialzo non è pienamente confermato.' };
  if (equity?.monthly > 0 && riskOne?.monthly < 0 && riskTwo?.monthly < 0) return { tone: 'positive', label: 'Risk-on confermato', text: 'Nell’ultimo mese azioni positive e indicatori di rischio in calo confermano un regime favorevole al rischio.' };
  if (equity?.monthly < 0 && (riskOne?.monthly < 0 || riskTwo?.monthly < 0)) return { tone: 'neutral', label: 'Correzione non confermata', text: 'Le azioni sono scese nell’ultimo mese, ma gli indicatori di rischio non confermano pienamente un regime risk-off.' };
  return { tone: 'neutral', label: 'Segnale misto', text: 'Le variazioni a un mese non forniscono ancora una conferma direzionale robusta.' };
}

const currencySymbol = (item) => {
  if (item.currency === 'EUR') return '€';
  if (item.currency === 'USD' || item.currency === '$' || item.symbol === 'EUR/USD') return '$';
  if (item.symbol === 'USD/JPY') return '¥';
  return item.currency;
};

const isSuffixUnit = (item) => item.currency === '%' || item.currency === 'pb';

function commodityComment(copper, oil) {
  if (copper.monthly > 1 && oil.monthly <= 1) return 'Segnale prevalentemente reflazionistico: il rame forte suggerisce domanda industriale e crescita, senza una pressione energetica equivalente.';
  if (oil.monthly > 1 && copper.monthly < 0) return 'Possibile segnale stagflazionistico: energia in rialzo e rame debole possono indicare più inflazione insieme a una crescita meno robusta.';
  if (oil.monthly > 1 && copper.monthly > 1) return 'Pressioni inflazionistiche diffuse, ma con domanda industriale ancora solida: quadro più vicino alla reflazione che alla stagflazione.';
  if (oil.monthly < 0 && copper.monthly < 0) return 'Segnale di raffreddamento ciclico: energia e metalli industriali deboli suggeriscono minori pressioni su crescita e inflazione.';
  return 'Quadro misto: osservare insieme domanda industriale, prezzi energetici e indicatori di crescita prima di identificare il regime macro.';
}

function TradingViewTickerTape() {
  const [ready, setReady] = useState(() => Boolean(customElements.get('tv-ticker-tape')));

  useEffect(() => {
    if (customElements.get('tv-ticker-tape')) {
      setReady(true);
      return undefined;
    }

    const scriptUrl = 'https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js';
    let script = document.querySelector(`script[src="${scriptUrl}"]`);

    const handleLoad = () => setReady(true);
    if (!script) {
      script = document.createElement('script');
      script.type = 'module';
      script.src = scriptUrl;
      document.head.appendChild(script);
    }

    script.addEventListener('load', handleLoad);
    return () => script.removeEventListener('load', handleLoad);
  }, []);

  return (
    <section className="tickerTape" aria-label="Quotazioni mercati in tempo reale">
      {!ready && <div className="tickerLoading">Caricamento quotazioni...</div>}
      <tv-ticker-tape symbols="FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FOREXCOM:DJI,FX:EURUSD,BITSTAMP:BTCUSD,CMCMARKETS:GOLD,CAPITALCOM:NAS100,FTSE:FTSEMIB" />
    </section>
  );
}

function TradingViewMarketOverview({ theme }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    containerRef.current.innerHTML = '';
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    copyright.innerHTML = '<a href="https://www.tradingview.com/markets/" rel="noopener nofollow" target="_blank"><span class="blue-text">World markets</span></a><span class="trademark"> by TradingView</span>';
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.textContent = JSON.stringify({
      colorTheme: theme === 'light' ? 'light' : 'dark',
      dateRange: '1M',
      locale: 'en',
      largeChartUrl: '',
      isTransparent: true,
      showFloatingTooltip: false,
      plotLineColorGrowing: 'rgba(41, 98, 255, 1)',
      plotLineColorFalling: 'rgba(41, 98, 255, 1)',
      gridLineColor: 'rgba(240, 243, 250, 0)',
      scaleFontColor: theme === 'light' ? '#0F0F0F' : '#cbd8ee',
      belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
      belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
      symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
      tabs: [
        { title: 'Indices', symbols: [
          { s: 'FOREXCOM:SPXUSD', d: 'S&P 500 Index' }, { s: 'FOREXCOM:NSXUSD', d: 'US 100 Cash CFD' },
          { s: 'FOREXCOM:DJI', d: 'Dow Jones Industrial Average Index' }, { s: 'INDEX:NKY', d: 'Japan 225' },
          { s: 'INDEX:DEU40', d: 'DAX Index' }, { s: 'FOREXCOM:UKXGBP', d: 'FTSE 100 Index' },
          { s: 'INDEX:FTSEMIB', d: 'ftse mib', logo: { style: 'single', logoid: 'indices/ftse-mib' } },
        ], originalTitle: 'Indices' },
        { title: 'Futures', symbols: [
          { s: 'BMFBOVESPA:ISP1!', d: 'S&P 500' }, { s: 'BMFBOVESPA:EUR1!', d: 'Euro' },
          { s: 'CMCMARKETS:GOLD', d: 'Gold' }, { s: 'PYTH:WTI3!', d: 'WTI Crude Oil' }, { s: 'BMFBOVESPA:CCM1!', d: 'Corn' },
        ], originalTitle: 'Futures' },
        { title: 'Bonds', symbols: [
          { s: 'EUREX:FGBL1!', d: 'Euro Bund' }, { s: 'EUREX:FBTP1!', d: 'Euro BTP' }, { s: 'EUREX:FGBM1!', d: 'Euro BOBL' },
        ], originalTitle: 'Bonds' },
        { title: 'Forex', symbols: [
          { s: 'FX:EURUSD', d: 'EUR to USD' }, { s: 'FX:GBPUSD', d: 'GBP to USD' }, { s: 'FX:USDJPY', d: 'USD to JPY' },
          { s: 'FX:USDCHF', d: 'USD to CHF' }, { s: 'FX:AUDUSD', d: 'AUD to USD' }, { s: 'FX:USDCAD', d: 'USD to CAD' },
        ], originalTitle: 'Forex' },
      ],
      support_host: 'https://www.tradingview.com',
      width: '100%',
      height: 345,
      showSymbolLogo: true,
      showChart: true,
    });

    containerRef.current.append(widget, copyright, script);
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [theme]);

  return <article className="card marketOverviewCard"><div className="tradingview-widget-container" ref={containerRef} /></article>;
}

function TradingViewStockHeatmap() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    containerRef.current.innerHTML = '';
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    copyright.innerHTML = '<a href="https://www.tradingview.com/heatmap/stock/" rel="noopener nofollow" target="_blank"><span class="blue-text">Stock Heatmap</span></a><span class="trademark"> by TradingView</span>';
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js';
    script.async = true;
    script.textContent = JSON.stringify({
      dataSource: 'SPX500',
      blockSize: 'market_cap_basic',
      blockColor: 'change',
      grouping: 'sector',
      locale: 'en',
      symbolUrl: '',
      colorTheme: 'light',
      exchanges: [],
      hasTopBar: false,
      isDataSetEnabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: '100%',
      height: '100%',
    });

    containerRef.current.append(widget, copyright, script);
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  return <article className="card stockHeatmapCard"><div className="tradingview-widget-container" ref={containerRef} /></article>;
}

function Change({ value }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return <span className={`change ${positive ? 'up' : 'down'}`}><Icon size={14} />{formatChange(value)}</span>;
}

function HeaderActions({ theme, setTheme, showSearch = false, query = '', setQuery = () => {} }) {
  return (
    <div className="headerActions">
      {showSearch && <label className="search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca strumento..." /></label>}
      <button className="iconButton" aria-label="Notifiche"><Bell size={18} /><i /></button>
      <button className="iconButton" aria-label="Cambia tema" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
    </div>
  );
}

function MacroOverview({ theme, setTheme, assets }) {
  const [region, setRegion] = useState('Globale');
  const current = macroRegions[region];
  const positiveCount = current.signals.filter((signal) => signal.tone === 'positive').length;
  const neutralCount = current.signals.filter((signal) => signal.tone === 'neutral').length;
  const warningCount = current.signals.filter((signal) => signal.tone === 'warning').length;
  const riskConfig = regionalRiskConfig[region];
  const riskAssets = riskConfig.symbols.map((symbol) => assets.find((item) => item.symbol === symbol));
  const riskView = regionalRiskView(assets, region);

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Quadro intermarket</p>
          <h1>Macro Overview</h1>
          <p className="subtitle">Segnali incrociati per interpretare il regime economico e finanziario.</p>
        </div>
        <HeaderActions theme={theme} setTheme={setTheme} />
      </header>

      <div className="demoNotice"><BrainCircuit size={15} /><span>Analisi dimostrativa basata su segnali intermarket</span><b>8 segnali monitorati</b></div>

      <div className="regionTabs" role="tablist" aria-label="Area geografica">
        {Object.keys(macroRegions).map((item) => <button type="button" role="tab" aria-selected={region === item} className={region === item ? 'active' : ''} onClick={() => setRegion(item)} key={item}>{item}</button>)}
      </div>

      <section className="macroSummary">
        <article className="card regimeCard">
          <span className="statIcon blue"><Gauge size={20} /></span>
          <div><span>Regime prevalente · {region}</span><strong>{current.regime}</strong><small>{current.summary}</small></div>
          <span className={`statusPill ${current.tone}`}>{region}</span>
        </article>
        <article className="card overviewScore">
          <span>Bilancio dei segnali</span>
          <div><strong>{positiveCount}</strong><small>costruttivi</small><strong>{neutralCount}</strong><small>neutrali</small><strong>{warningCount}</strong><small>da monitorare</small></div>
        </article>
      </section>

      <section className="sectionHeading macroSignalsHeading"><div><h2>{riskConfig.title}</h2><p>{riskConfig.description} La view utilizza le variazioni a 1 mese.</p></div><span className={`statusPill ${riskView.tone}`}>{riskView.label}</span></section>
      <section className="volatilityView">
        <div className="volatilityMetrics">
          {riskAssets.map((item) => (
            <article className="card volatilityMetric" key={item.symbol}>
              <span>{item.name}</span>
              <strong>{item.price}</strong>
              <div><span>Oggi</span><Change value={item.daily} /><span>1 mese</span><Change value={item.monthly} /></div>
              {item.source && <small>{item.source}</small>}
            </article>
          ))}
        </div>
        <article className={`card volatilityReading ${riskView.tone}`}>
          <span className="overline">VOLATILITY VIEW · 1 MESE</span>
          <strong>{riskView.label}</strong>
          <p>{riskView.text}</p>
          <small>{riskConfig.note}</small>
        </article>
      </section>

      <section className="sectionHeading macroSignalsHeading"><div><h2>Segnali ad alta priorità</h2><p>Indicatori con maggiore utilità per leggere ciclo, inflazione e stress finanziario.</p></div><span className="updated">Dati dimostrativi</span></section>
      <section className="signalGrid">
        {current.signals.filter((signal) => signal.priority === 'Alta').map((signal) => <MacroSignalCard signal={signal} key={signal.title} />)}
      </section>

      <section className="sectionHeading macroSignalsHeading"><div><h2>Segnali di conferma</h2><p>Intersezioni utili per confermare o mettere in dubbio il quadro principale.</p></div></section>
      <section className="signalGrid confirmationGrid">
        {current.signals.filter((signal) => signal.priority === 'Media').map((signal) => <MacroSignalCard signal={signal} key={signal.title} />)}
      </section>
      <p className="macroDisclaimer">Questi segnali sono euristiche informative, non previsioni certe né raccomandazioni d’investimento. Vanno valutati insieme ai dati macroeconomici e al contesto di mercato.</p>
    </>
  );
}

function MacroSignalCard({ signal }) {
  return (
    <article className="card signalCard">
      <div className="signalHeader"><div><span className="priorityLabel">PRIORITÀ {signal.priority.toUpperCase()}</span><h3>{signal.title}</h3></div><span className={`statusPill ${signal.tone}`}>{signal.status}</span></div>
      <div className="signalPair">
        <div><span>{signal.left[0]}</span><strong>{signal.left[1]}</strong></div>
        <span className="pairJoin">+</span>
        <div><span>{signal.right[0]}</span><strong>{signal.right[1]}</strong></div>
      </div>
      <p>{signal.reading}</p>
    </article>
  );
}

function WatchlistOverview({ theme, setTheme, favorites, toggleFavorite, assets, pricesUpdatedAt, addAsset, removeAsset }) {
  const [query, setQuery] = useState('');
  const [assetQuery, setAssetQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addError, setAddError] = useState('');
  const assetClasses = [...new Set(assets.map((item) => item.group))];
  const visibleAssets = assets.filter((item) => `${item.symbol} ${item.name} ${item.group}`.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (assetQuery.trim().length < 2) {
      setSearchResults([]);
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setAddError('');
      try {
        const response = await fetch(`/api/assets/search?q=${encodeURIComponent(assetQuery.trim())}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.details || data.error);
        setSearchResults(data.results || []);
      } catch (error) {
        if (error.name !== 'AbortError') setAddError(error.message);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [assetQuery]);

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Tutti gli strumenti</p>
          <h1>Mercati</h1>
          <p className="subtitle">Una vista rapida di tutti gli asset presenti nella Overview.</p>
        </div>
        <HeaderActions theme={theme} setTheme={setTheme} showSearch query={query} setQuery={setQuery} />
      </header>

      <div className="demoNotice"><Star size={15} /><span>Asset organizzati per classe</span><b>{pricesUpdatedAt ? `Prezzi aggiornati alle ${formatUpdateTime(pricesUpdatedAt)}` : `${visibleAssets.length} strumenti monitorati`}</b></div>

      <section className="card assetSearchPanel">
        <div className="assetSearchIntro"><div><h2>Aggiungi un nuovo asset</h2><p>Cerca azioni, ETF, indici, valute, crypto e materie prime.</p></div></div>
        <label className="assetSearchInput"><Search size={18} /><input value={assetQuery} onChange={(event) => setAssetQuery(event.target.value)} placeholder="Cerca per nome o simbolo, ad esempio Apple o AAPL..." /></label>
        {searching && <span className="assetSearchStatus">Ricerca in corso...</span>}
        {addError && <span className="assetSearchError">{addError}</span>}
        {!!searchResults.length && (
          <div className="assetSearchResults">
            {searchResults.map((result) => {
              const alreadyAdded = assets.some((item) => item.symbol === result.symbol);
              return (
                <div className="assetSearchResult" key={`${result.symbol}-${result.exchange}`}>
                  <span><strong>{result.name}</strong><small>{result.symbol} · {result.exchange || result.quoteType}</small></span>
                  <button type="button" disabled={alreadyAdded} onClick={() => addAsset(result).then(() => { setAssetQuery(''); setSearchResults([]); }).catch((error) => setAddError(error.message))}>
                    <Plus size={15} />{alreadyAdded ? 'Già presente' : 'Aggiungi'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {assetClasses.map((assetClass) => {
        const classAssets = visibleAssets.filter((item) => item.group === assetClass);
        if (!classAssets.length) return null;

        return (
          <section className="watchlistSection" key={assetClass}>
            <div className="sectionHeading">
              <div><h2>{assetClass}</h2><p>{classAssets.length} {classAssets.length === 1 ? 'strumento' : 'strumenti'} in osservazione.</p></div>
            </div>
            <div className="assetWidgetGrid">
              {classAssets.map((item) => (
                <article className={`assetWidget assetWidget--${item.group.toLowerCase().replaceAll(' ', '-')}`} key={item.symbol}>
                  <div className="assetWidgetTop">
                    <span className="assetBadge">{item.symbol.slice(0, 4)}</span>
                    <div className="assetWidgetActions">
                      <button type="button" onClick={() => toggleFavorite(item.symbol)} aria-label={`${favorites.has(item.symbol) ? 'Rimuovi' : 'Aggiungi'} ${item.name} dai preferiti`}>
                        <Star size={17} fill={favorites.has(item.symbol) ? 'currentColor' : 'none'} />
                      </button>
                      {item.custom && <button className="removeAssetButton" type="button" onClick={() => removeAsset(item.symbol)} aria-label={`Rimuovi ${item.name} dalla watchlist`}><Trash2 size={16} /></button>}
                    </div>
                  </div>
                  <div className="assetIdentity"><strong>{item.name}</strong><span>{item.symbol}</span></div>
                  <div className="assetPrice">
                    {!isSuffixUnit(item) && <span>{currencySymbol(item)}</span>}
                    <strong>{item.price}</strong>
                    {isSuffixUnit(item) && <span>{item.currency}</span>}
                  </div>
                  <div className="assetPerformance">
                    <div><span>Oggi</span><Change value={item.daily} /></div>
                    <div><span>1 mese</span><Change value={item.monthly} /></div>
                  </div>
                  {item.source && <span className="assetSource">{item.source}</span>}
                </article>
              ))}
            </div>
          </section>
        );
      })}
      {!visibleAssets.length && <div className="card empty watchlistEmpty">Nessun asset corrisponde alla ricerca.</div>}
    </>
  );
}

function NewsOverview({ theme, setTheme }) {
  const [news, setNews] = useState(financialNews);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const today = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const featured = news[0];
  const latestNews = news.slice(1);

  useEffect(() => {
    fetch('/api/news')
      .then((response) => response.json())
      .then((data) => {
        if (data.articles?.length) {
          setNews(data.articles.map((article, index) => ({
            ...article,
            category: index === 0 ? 'Notizia finanziaria del giorno' : 'Economia e mercati',
            time: new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(new Date(article.publishedAt)),
            tone: index === 0 ? 'blue' : ['green', 'orange', 'violet', 'cyan', 'red'][index % 5],
          })));
          setUpdatedAt(data.updatedAt);
        }
      })
      .catch(() => {});
  }, []);

  async function refreshNews() {
    setRefreshing(true);
    setRefreshError('');
    try {
      const response = await fetch('/api/news/refresh', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error);
      setNews(data.articles.map((article, index) => ({
        ...article,
        category: index === 0 ? 'Notizia finanziaria del giorno' : 'Economia e mercati',
        time: new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(new Date(article.publishedAt)),
        tone: index === 0 ? 'blue' : ['green', 'orange', 'violet', 'cyan', 'red'][index % 5],
      })));
      setUpdatedAt(data.updatedAt);
    } catch (error) {
      setRefreshError(error.message);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Rassegna economico-finanziaria</p>
          <h1>News</h1>
          <p className="subtitle newsDate">{today}</p>
        </div>
        <HeaderActions theme={theme} setTheme={setTheme} />
      </header>

      <div className="newsToolbar">
        <div className="demoNotice"><Newspaper size={15} /><span>Principali notizie della giornata</span><b>{updatedAt ? `Aggiornate alle ${formatUpdateTime(updatedAt)}` : 'Dati iniziali'}</b></div>
        <button className="refreshButton" type="button" onClick={refreshNews} disabled={refreshing}><RefreshCw size={15} className={refreshing ? 'spinning' : ''} />{refreshing ? 'Aggiornamento...' : 'Aggiorna news'}</button>
      </div>
      {refreshError && <div className="refreshError">{refreshError}</div>}

      <a className="newsFeatured" href={featured.url} target="_blank" rel="noopener noreferrer">
        <div className="newsFeaturedContent">
          <div className="newsMeta"><span className={`newsCategory ${featured.tone}`}>{featured.category}</span><span>{featured.time}</span></div>
          <h2>{featured.title}</h2>
          <p>{featured.summary}</p>
          <div className="newsSource"><span>{featured.source}</span><span>Leggi la notizia <ExternalLink size={14} /></span></div>
        </div>
        <div className="newsFeaturedVisual"><Landmark size={42} /><span>Focus del giorno</span></div>
      </a>

      <section className="sectionHeading newsHeading"><div><h2>Ultime notizie</h2><p>Mercati, macroeconomia e politica monetaria.</p></div><span className="updated">{news.length} aggiornamenti</span></section>
      <section className="newsGrid">
        {latestNews.map((item) => (
          <a className="newsWidget" href={item.url} target="_blank" rel="noopener noreferrer" key={item.title}>
            <div className="newsMeta"><span className={`newsCategory ${item.tone}`}>{item.category}</span><span>{item.time}</span></div>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <div className="newsSource"><span>{item.source}</span><ExternalLink size={14} /></div>
          </a>
        ))}
      </section>
      <p className="newsDisclaimer">La data viene aggiornata automaticamente ogni giorno. Titoli e sintesi rimandano alle fonti originali.</p>
    </>
  );
}

const formatPortfolioNumber = (value) => Number(value || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function PortfolioOverview({ theme, setTheme, assets, transactions, addTransaction, removeTransaction, pricesUpdatedAt }) {
  const [form, setForm] = useState({ type: 'buy', mode: 'quantity', symbol: assets[0]?.symbol || '', quantity: '', amount: '', price: '', fees: '0', date: new Date().toISOString().slice(0, 10) });
  const selectedAsset = assets.find((item) => item.symbol === form.symbol);
  const currentAssetPrice = parseItalianNumber(selectedAsset?.price || 0);
  const calculatedQuantity = form.mode === 'amount' && Number(form.price) > 0 ? Number(form.amount) / Number(form.price) : Number(form.quantity);
  const calculatedAmount = form.mode === 'quantity' ? Number(form.quantity) * Number(form.price) : Number(form.amount);

  const positions = useMemo(() => {
    const bySymbol = new Map();
    [...transactions].sort((a, b) => a.date.localeCompare(b.date)).forEach((transaction) => {
      const position = bySymbol.get(transaction.symbol) || { symbol: transaction.symbol, quantity: 0, cost: 0, realized: 0 };
      const quantity = Number(transaction.quantity);
      const price = Number(transaction.price);
      const fees = Number(transaction.fees || 0);
      if (transaction.type === 'buy') {
        position.quantity += quantity;
        position.cost += quantity * price + fees;
      } else if (position.quantity > 0) {
        const soldQuantity = Math.min(quantity, position.quantity);
        const averageCost = position.cost / position.quantity;
        position.realized += soldQuantity * price - fees - soldQuantity * averageCost;
        position.quantity -= soldQuantity;
        position.cost -= soldQuantity * averageCost;
      }
      bySymbol.set(transaction.symbol, position);
    });

    return [...bySymbol.values()].filter((position) => position.quantity > 0.000001).map((position) => {
      const asset = assets.find((item) => item.symbol === position.symbol);
      const currentPrice = parseItalianNumber(asset?.price || 0);
      const value = position.quantity * currentPrice;
      const unrealized = value - position.cost;
      return { ...position, asset, currentPrice, value, unrealized, returnPct: position.cost ? (unrealized / position.cost) * 100 : 0 };
    }).sort((a, b) => b.value - a.value);
  }, [assets, transactions]);

  const totalValue = positions.reduce((sum, position) => sum + position.value, 0);
  const totalCost = positions.reduce((sum, position) => sum + position.cost, 0);
  const totalUnrealized = totalValue - totalCost;
  const totalReturn = totalCost ? (totalUnrealized / totalCost) * 100 : 0;
  const realized = useMemo(() => {
    const holdings = new Map();
    return [...transactions].sort((a, b) => a.date.localeCompare(b.date)).reduce((total, transaction) => {
      const holding = holdings.get(transaction.symbol) || { quantity: 0, cost: 0 };
      const quantity = Number(transaction.quantity);
      const price = Number(transaction.price);
      const fees = Number(transaction.fees || 0);
      if (transaction.type === 'buy') {
        holding.quantity += quantity;
        holding.cost += quantity * price + fees;
        holdings.set(transaction.symbol, holding);
        return total;
      }
      if (holding.quantity <= 0) return total;
      const soldQuantity = Math.min(quantity, holding.quantity);
      const averageCost = holding.cost / holding.quantity;
      holding.quantity -= soldQuantity;
      holding.cost -= soldQuantity * averageCost;
      holdings.set(transaction.symbol, holding);
      return total + soldQuantity * price - fees - soldQuantity * averageCost;
    }, 0);
  }, [transactions]);

  function submitTransaction(event) {
    event.preventDefault();
    if (!form.symbol || calculatedQuantity <= 0 || Number(form.price) <= 0) return;
    addTransaction({ ...form, quantity: calculatedQuantity, amount: calculatedAmount });
    setForm((current) => ({ ...current, quantity: '', amount: '', price: '', fees: '0' }));
  }

  return (
    <>
      <header>
        <div><p className="eyebrow">Patrimonio e performance</p><h1>Portafoglio</h1><p className="subtitle">Posizioni e rendimenti calcolati localmente, senza chiamate API aggiuntive.</p></div>
        <HeaderActions theme={theme} setTheme={setTheme} />
      </header>

      <div className="demoNotice"><ShieldCheck size={15} /><span>Operazioni salvate esclusivamente in questo browser</span><b>{pricesUpdatedAt ? `Prezzi condivisi aggiornati alle ${formatUpdateTime(pricesUpdatedAt)}` : 'Nessuna API dedicata'}</b></div>

      <section className="portfolioKpis">
        <article className="card portfolioKpi"><span>Valore indicativo</span><strong>{formatPortfolioNumber(totalValue)}</strong><small>Somma senza conversione valutaria</small></article>
        <article className="card portfolioKpi"><span>Capitale investito</span><strong>{formatPortfolioNumber(totalCost)}</strong><small>Costo residuo delle posizioni</small></article>
        <article className={`card portfolioKpi ${totalUnrealized >= 0 ? 'positive' : 'negative'}`}><span>Risultato non realizzato</span><strong>{totalUnrealized >= 0 ? '+' : ''}{formatPortfolioNumber(totalUnrealized)}</strong><Change value={totalReturn} /></article>
        <article className={`card portfolioKpi ${realized >= 0 ? 'positive' : 'negative'}`}><span>Risultato realizzato</span><strong>{realized >= 0 ? '+' : ''}{formatPortfolioNumber(realized)}</strong><small>Vendite registrate</small></article>
      </section>

      <section className="portfolioWorkspace">
        <form className="card transactionForm" onSubmit={submitTransaction}>
          <div><span className="overline">NUOVA OPERAZIONE</span><h2>Registra movimento</h2><p>Il calcolo usa i prezzi già caricati nella dashboard.</p></div>
          <label><span>Tipo</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="buy">Acquisto</option><option value="sell">Vendita</option></select></label>
          <label><span>Asset</span><select value={form.symbol} onChange={(event) => setForm({ ...form, symbol: event.target.value, price: '', quantity: '', amount: '' })}>{assets.map((item) => <option value={item.symbol} key={item.symbol}>{item.symbol} · {item.name}</option>)}</select></label>
          <div className="transactionMode" role="group" aria-label="Modalità inserimento">
            <button type="button" className={form.mode === 'quantity' ? 'active' : ''} onClick={() => setForm({ ...form, mode: 'quantity', amount: '' })}>Per quantità</button>
            <button type="button" className={form.mode === 'amount' ? 'active' : ''} onClick={() => setForm({ ...form, mode: 'amount', quantity: '' })}>Per importo</button>
          </div>
          <div className="transactionFormRow">
            {form.mode === 'quantity'
              ? <label><span>Quantità</span><input type="number" min="0" step="any" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} required /></label>
              : <label><span>Importo</span><input type="number" min="0" step="any" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required /></label>}
            <label><span>Prezzo unitario</span><div className="priceInputGroup"><input type="number" min="0" step="any" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder={selectedAsset?.price} required /><button type="button" disabled={!currentAssetPrice} onClick={() => setForm({ ...form, price: String(currentAssetPrice) })}>Prezzo attuale</button></div></label>
          </div>
          <div className="transactionFormRow">
            <label><span>Commissioni</span><input type="number" min="0" step="any" value={form.fees} onChange={(event) => setForm({ ...form, fees: event.target.value })} /></label>
            <label><span>Data</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label>
          </div>
          {Number(form.price) > 0 && ((form.mode === 'quantity' && Number(form.quantity) > 0) || (form.mode === 'amount' && Number(form.amount) > 0)) && <div className="transactionCalculation"><span>Quantità calcolata <strong>{formatPortfolioNumber(calculatedQuantity)}</strong></span><span>Controvalore <strong>{formatPortfolioNumber(calculatedAmount)}</strong></span></div>}
          <button className="portfolioPrimaryButton" type="submit"><Plus size={16} />Aggiungi operazione</button>
        </form>

        <article className="card allocationCard">
          <div><span className="overline">ALLOCAZIONE</span><h2>Peso delle posizioni</h2><p>Distribuzione basata sul valore corrente.</p></div>
          <div className="allocationList">
            {positions.map((position) => <div className="allocationItem" key={position.symbol}><div><strong>{position.symbol}</strong><span>{totalValue ? formatPortfolioNumber((position.value / totalValue) * 100) : '0,00'}%</span></div><i><b style={{ width: `${totalValue ? (position.value / totalValue) * 100 : 0}%` }} /></i></div>)}
            {!positions.length && <div className="portfolioEmpty">Registra un acquisto per visualizzare l’allocazione.</div>}
          </div>
        </article>
      </section>

      <section className="sectionHeading"><div><h2>Posizioni aperte</h2><p>Valore corrente, costo medio e rendimento.</p></div><span className="updated">{positions.length} posizioni</span></section>
      <section className="card portfolioTableCard">
        <div className="portfolioTable">
          <div className="portfolioRow portfolioHead"><span>Asset</span><span>Quantità</span><span>Prezzo medio</span><span>Prezzo corrente</span><span>Valore</span><span>Risultato</span></div>
          {positions.map((position) => <div className="portfolioRow" key={position.symbol}><span><strong>{position.asset?.name || position.symbol}</strong><small>{position.symbol} · {position.asset?.currency || 'Valuta n/d'}</small></span><span>{formatPortfolioNumber(position.quantity)}</span><span>{formatPortfolioNumber(position.cost / position.quantity)}</span><span>{formatPortfolioNumber(position.currentPrice)}</span><strong>{formatPortfolioNumber(position.value)}</strong><Change value={position.returnPct} /></div>)}
          {!positions.length && <div className="portfolioEmpty">Nessuna posizione aperta.</div>}
        </div>
      </section>

      <section className="sectionHeading"><div><h2>Ultime operazioni</h2><p>Storico persistente nel browser.</p></div><span className="updated">{transactions.length} movimenti</span></section>
      <section className="transactionHistory">
        {[...transactions].reverse().map((transaction) => <article className="card transactionItem" key={transaction.id}><span className={`transactionType ${transaction.type}`}>{transaction.type === 'buy' ? 'Acquisto' : 'Vendita'}</span><div><strong>{transaction.symbol}</strong><small>{transaction.date}</small></div><span>{formatPortfolioNumber(transaction.quantity)} × {formatPortfolioNumber(transaction.price)}</span><button type="button" onClick={() => removeTransaction(transaction.id)} aria-label={`Elimina operazione ${transaction.symbol}`}><Trash2 size={15} /></button></article>)}
        {!transactions.length && <div className="card portfolioEmpty">Nessuna operazione registrata.</div>}
      </section>
    </>
  );
}

function historicalMetrics(points) {
  const closes = points.map((point) => point.close).filter(Number.isFinite);
  const returns = closes.slice(1).map((close, index) => close / closes[index] - 1);
  const mean = returns.reduce((sum, value) => sum + value, 0) / Math.max(returns.length, 1);
  const variance = returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(returns.length - 1, 1);
  let peak = closes[0] || 0;
  let maxDrawdown = 0;
  closes.forEach((close) => {
    peak = Math.max(peak, close);
    if (peak) maxDrawdown = Math.min(maxDrawdown, close / peak - 1);
  });
  return {
    price: closes.at(-1) || 0,
    returnPct: closes.length > 1 ? (closes.at(-1) / closes[0] - 1) * 100 : 0,
    volatility: Math.sqrt(variance) * Math.sqrt(252) * 100,
    maxDrawdown: maxDrawdown * 100,
  };
}

function correlation(seriesA, seriesB) {
  const aByDate = new Map(seriesA.map((point) => [point.date, point.close]));
  const paired = seriesB.filter((point) => aByDate.has(point.date)).map((point) => [aByDate.get(point.date), point.close]);
  if (paired.length < 3) return 0;
  const returnsA = paired.slice(1).map((pair, index) => pair[0] / paired[index][0] - 1);
  const returnsB = paired.slice(1).map((pair, index) => pair[1] / paired[index][1] - 1);
  const meanA = returnsA.reduce((sum, value) => sum + value, 0) / returnsA.length;
  const meanB = returnsB.reduce((sum, value) => sum + value, 0) / returnsB.length;
  const covariance = returnsA.reduce((sum, value, index) => sum + (value - meanA) * (returnsB[index] - meanB), 0);
  const varianceA = returnsA.reduce((sum, value) => sum + (value - meanA) ** 2, 0);
  const varianceB = returnsB.reduce((sum, value) => sum + (value - meanB) ** 2, 0);
  return varianceA && varianceB ? covariance / Math.sqrt(varianceA * varianceB) : 0;
}

function buildBasketPoints(history, weights) {
  if (!history.length) return [];
  const maps = history.map((item) => new Map(item.points.map((point) => [point.date, point.close])));
  const commonPoints = history[0].points.filter((point) => maps.every((map) => map.has(point.date)));
  const bases = maps.map((map) => map.get(commonPoints[0]?.date));
  return commonPoints.map((point) => ({
    date: point.date,
    close: history.reduce((total, item, index) => total + ((Number(weights[item.symbol]) || 0) / 100) * (maps[index].get(point.date) / bases[index]) * 100, 0),
  })).filter((point) => Number.isFinite(point.close));
}

function AnalysisOverview({ theme, setTheme, assets, favorites }) {
  const initialSymbols = assets.filter((item) => favorites.has(item.symbol)).slice(0, 4).map((item) => item.symbol);
  const [selected, setSelected] = useState(initialSymbols);
  const [years, setYears] = useState(3);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [historyYears, setHistoryYears] = useState(null);
  const [basketOpen, setBasketOpen] = useState(false);
  const [basketActive, setBasketActive] = useState(false);
  const [weights, setWeights] = useState({});

  const basketSeries = history.filter((item) => selected.includes(item.symbol));
  const basketPoints = useMemo(() => basketActive ? buildBasketPoints(basketSeries, weights) : [], [basketActive, basketSeries, weights]);
  const metrics = [...history.map((item) => ({ symbol: item.symbol, ...historicalMetrics(item.points) })), ...(basketPoints.length ? [{ symbol: 'BASKET', ...historicalMetrics(basketPoints) }] : [])];
  const basketWeightTotal = selected.reduce((total, symbol) => total + (Number(weights[symbol]) || 0), 0);
  const normalizedData = useMemo(() => {
    const rows = new Map();
    history.forEach((item) => {
      const base = item.points[0]?.close;
      item.points.forEach((point) => {
        const row = rows.get(point.date) || { date: point.date };
        row[item.symbol] = base ? (point.close / base) * 100 : null;
        rows.set(point.date, row);
      });
    });
    basketPoints.forEach((point) => {
      const row = rows.get(point.date) || { date: point.date };
      row.BASKET = point.close;
      rows.set(point.date, row);
    });
    return [...rows.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [basketPoints, history]);

  function toggleAnalysisSymbol(symbol) {
    setSelected((current) => {
      const next = current.includes(symbol) ? current.filter((item) => item !== symbol) : current.length < 8 ? [...current, symbol] : current;
      setBasketActive(false);
      setWeights((currentWeights) => {
        const equalWeight = next.length ? 100 / next.length : 0;
        return Object.fromEntries(next.map((item) => [item, currentWeights[item] ?? equalWeight]));
      });
      return next;
    });
  }

  async function runAnalysis() {
    if (!selected.length) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/history?symbols=${encodeURIComponent(selected.join(','))}&years=${years}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error);
      setHistory(data.series || []);
      setHistoryYears(years);
      setBasketActive(false);
      setUpdatedAt(data.updatedAt);
      if ((data.series || []).length < selected.length) setError('Alcune serie non sono disponibili su Yahoo Finance.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function openBasket() {
    const equalWeight = selected.length ? 100 / selected.length : 0;
    setWeights((current) => Object.fromEntries(selected.map((symbol) => [symbol, current[symbol] ?? equalWeight])));
    setBasketOpen(true);
    setBasketActive(false);
  }

  async function runBasketAnalysis() {
    if (Math.abs(basketWeightTotal - 100) > 0.01) {
      setError('La somma dei pesi del basket deve essere pari al 100%.');
      return;
    }
    setError('');
    const availableSymbols = new Set(history.map((item) => item.symbol));
    if (historyYears === years && selected.every((symbol) => availableSymbols.has(symbol))) {
      setBasketActive(true);
      return;
    }
    await runAnalysis();
    setBasketActive(true);
  }

  return (
    <>
      <header><div><p className="eyebrow">Rischio e performance</p><h1>Analisi</h1><p className="subtitle">Serie storiche Yahoo scaricate solo su richiesta e conservate in cache per 6 ore.</p></div><HeaderActions theme={theme} setTheme={setTheme} /></header>
      <div className="demoNotice"><ShieldCheck size={15} /><span>Nessuna chiamata API al caricamento della pagina</span><b>{updatedAt ? `Analisi aggiornata alle ${formatUpdateTime(updatedAt)}` : 'Premi Esegui analisi'}</b></div>

      <section className="card analysisControls">
        <div><span className="overline">CONFIGURAZIONE</span><h2>Seleziona gli strumenti</h2><p>Massimo 8 asset per analisi. Yahoo Finance è l’unica fonte utilizzata.</p></div>
        <div className="analysisAssetPicker">{assets.map((item) => <button type="button" className={selected.includes(item.symbol) ? 'active' : ''} onClick={() => toggleAnalysisSymbol(item.symbol)} key={item.symbol}><span>{item.symbol}</span><small>{item.name}</small></button>)}</div>
        <div className="analysisRunBar"><label><span>Orizzonte</span><select value={years} onChange={(event) => { setYears(Number(event.target.value)); setBasketActive(false); }}><option value={1}>1 anno</option><option value={3}>3 anni</option><option value={5}>5 anni</option><option value={10}>10 anni</option></select></label><span>{selected.length}/8 strumenti</span><div className="analysisActions"><button className="basketButton" type="button" onClick={openBasket} disabled={selected.length < 2}>Crea basket</button><button type="button" onClick={runAnalysis} disabled={loading || !selected.length}><ChartNoAxesCombined size={16} />{loading ? 'Analisi in corso...' : 'Esegui analisi'}</button></div></div>
        {error && <div className="refreshError">{error}</div>}
      </section>

      {basketOpen && <section className="card basketBuilder">
        <div><span className="overline">BASKET PERSONALIZZATO</span><h2>Attribuisci i pesi</h2><p>La performance utilizza pesi iniziali fissi e le serie storiche già scaricate.</p></div>
        <div className="basketWeights">{selected.map((symbol) => <label key={symbol}><span><strong>{symbol}</strong><small>{assets.find((item) => item.symbol === symbol)?.name}</small></span><div><input type="number" min="0" max="100" step="0.1" value={weights[symbol] ?? ''} onChange={(event) => { setWeights({ ...weights, [symbol]: event.target.value }); setBasketActive(false); }} /><b>%</b></div></label>)}</div>
        <div className="basketFooter"><span className={Math.abs(basketWeightTotal - 100) <= .01 ? 'valid' : 'invalid'}>Totale pesi: <strong>{formatPortfolioNumber(basketWeightTotal)}%</strong></span><button type="button" onClick={runBasketAnalysis} disabled={loading || Math.abs(basketWeightTotal - 100) > .01}><ChartNoAxesCombined size={16} />Analizza basket</button></div>
      </section>}

      {!!history.length && <>
        <section className="sectionHeading"><div><h2>Performance storica</h2><p>Andamento normalizzato a base 100.</p></div><span className="updated">{years} {years === 1 ? 'anno' : 'anni'}</span></section>
        <article className="card analysisChart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={normalizedData}><CartesianGrid strokeDasharray="3 3" opacity={0.15} /><XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={45} /><YAxis tick={{ fontSize: 10 }} /><Tooltip />{history.map((item, index) => <Area type="monotone" dataKey={item.symbol} stroke={['#5a8cff','#43d19e','#f0a764','#b18bff','#ff7185','#64c7ea','#f1cf63','#7f93b5'][index]} fill="transparent" strokeWidth={2} connectNulls key={item.symbol} />)}{basketPoints.length && <Area type="monotone" dataKey="BASKET" stroke="#ffd166" fill="transparent" strokeWidth={3.5} connectNulls />}</AreaChart></ResponsiveContainer></article>

        <section className="sectionHeading"><div><h2>Metriche</h2><p>Rendimento totale, volatilità annualizzata e drawdown.</p></div></section>
        <section className="analysisMetricGrid">{metrics.map((item) => <article className="card analysisMetric" key={item.symbol}><span>{item.symbol}</span><strong>{formatPortfolioNumber(item.price)}</strong><div><span>Rendimento <Change value={item.returnPct} /></span><span>Volatilità <b>{formatPortfolioNumber(item.volatility)}%</b></span><span>Max drawdown <b className="negativeText">{formatPortfolioNumber(item.maxDrawdown)}%</b></span></div></article>)}</section>

        {history.length > 1 && <><section className="sectionHeading"><div><h2>Matrice di correlazione</h2><p>Correlazione dei rendimenti giornalieri.</p></div></section><section className="card correlationMatrix" style={{ '--correlation-columns': history.length + 1 }}><span />{history.map((item) => <strong key={`h-${item.symbol}`}>{item.symbol}</strong>)}{history.flatMap((row) => [<strong key={`r-${row.symbol}`}>{row.symbol}</strong>, ...history.map((column) => { const value = correlation(row.points, column.points); return <span className={value >= .5 ? 'high' : value <= 0 ? 'low' : 'medium'} key={`${row.symbol}-${column.symbol}`}>{value.toFixed(2)}</span>; })])}</section></>}
      </>}
      {!history.length && !loading && <div className="card analysisEmpty"><ChartNoAxesCombined size={28} /><strong>Configura e avvia la prima analisi</strong><span>Le serie storiche verranno richieste solo dopo il clic.</span></div>}
    </>
  );
}

function assetGroupFromQuoteType(quoteType) {
  if (quoteType === 'ETF' || quoteType === 'MUTUALFUND') return 'ETF e fondi';
  if (quoteType === 'INDEX') return 'Indici';
  if (quoteType === 'CRYPTOCURRENCY') return 'Crypto';
  if (quoteType === 'CURRENCY') return 'Valute';
  if (quoteType === 'FUTURE') return 'Materie prime';
  return 'Azioni';
}

function loadCustomAssets() {
  try {
    const saved = JSON.parse(localStorage.getItem('wealth-custom-assets') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem('wealth-favorites') || 'null');
    return Array.isArray(saved) ? saved : null;
  } catch {
    return null;
  }
}

function loadPortfolioTransactions() {
  try {
    const saved = JSON.parse(localStorage.getItem('wealth-portfolio-transactions') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function App() {
  const [theme, setTheme] = useState('light');
  const [page, setPage] = useState('markets');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState('Tutti');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState(() => new Set(loadFavorites() || [
    ...markets.filter((item) => item.favorite).map((item) => item.symbol),
    ...loadCustomAssets().map((item) => item.symbol),
  ]));
  const [assets, setAssets] = useState(() => [...markets, ...loadCustomAssets()]);
  const [transactions, setTransactions] = useState(loadPortfolioTransactions);
  const [pricesUpdatedAt, setPricesUpdatedAt] = useState(null);

  useEffect(() => {
    let active = true;

    async function updatePrices() {
      try {
        const response = await fetch('/api/prices');
        const data = await response.json();
        if (!active || !data.assets?.length) return;
        const liveBySymbol = new Map(data.assets.map((item) => [item.symbol, item]));
        const customAssets = loadCustomAssets();
        const customQuotes = await Promise.all(customAssets.map(async (item) => {
          try {
            const quoteResponse = await fetch(`/api/assets/quote?symbol=${encodeURIComponent(item.symbol)}`);
            const quote = await quoteResponse.json();
            return quoteResponse.ok ? [item.symbol, quote] : null;
          } catch {
            return null;
          }
        }));
        customQuotes.filter(Boolean).forEach(([symbol, quote]) => liveBySymbol.set(symbol, quote));
        setAssets((currentAssets) => currentAssets.map((item) => {
          const live = liveBySymbol.get(item.symbol);
          return live ? {
            ...item,
            price: formatLivePrice(live.price, item.currency),
            daily: live.daily ?? item.daily,
            monthly: live.monthly ?? item.monthly,
            currency: item.currency || live.currency || '',
            source: live.source,
          } : item;
        }));
        const updatedCustomAssets = customAssets.map((item) => {
          const live = liveBySymbol.get(item.symbol);
          return live ? {
            ...item,
            price: formatLivePrice(live.price, item.currency || live.currency),
            daily: live.daily ?? item.daily,
            monthly: live.monthly ?? item.monthly,
            currency: item.currency || live.currency || '',
            source: live.source,
          } : item;
        });
        localStorage.setItem('wealth-custom-assets', JSON.stringify(updatedCustomAssets));
        setPricesUpdatedAt(data.updatedAt);
      } catch {
        // Static values remain available when the local API is offline.
      }
    }

    updatePrices();
    const interval = setInterval(updatePrices, 15 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const visibleMarkets = useMemo(() => assets.filter((item) => {
    const matchesFilter = filter === 'Tutti' || filter === 'Preferiti' || item.group === filter;
    const matchesQuery = `${item.symbol} ${item.name}`.toLowerCase().includes(query.toLowerCase());
    return favorites.has(item.symbol) && matchesFilter && matchesQuery;
  }), [assets, favorites, filter, query]);
  const eurUsd = assets.find((item) => item.symbol === 'EUR/USD') || markets.find((item) => item.symbol === 'EUR/USD');

  function toggleFavorite(symbol) {
    setFavorites((current) => {
      const next = new Set(current);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      localStorage.setItem('wealth-favorites', JSON.stringify([...next]));
      return next;
    });
  }

  async function addAsset(result) {
    const response = await fetch(`/api/assets/quote?symbol=${encodeURIComponent(result.symbol)}`);
    const quote = await response.json();
    if (!response.ok) throw new Error(quote.details || quote.error);
    const item = {
      symbol: result.symbol,
      name: result.name,
      group: assetGroupFromQuoteType(result.quoteType),
      price: formatLivePrice(quote.price, quote.currency),
      daily: quote.daily ?? 0,
      monthly: quote.monthly ?? 0,
      currency: quote.currency || '',
      source: quote.source,
      custom: true,
    };
    setAssets((current) => {
      if (current.some((asset) => asset.symbol === item.symbol)) return current;
      const next = [...current, item];
      localStorage.setItem('wealth-custom-assets', JSON.stringify(next.filter((asset) => asset.custom)));
      return next;
    });
    setFavorites((current) => {
      const next = new Set([...current, item.symbol]);
      localStorage.setItem('wealth-favorites', JSON.stringify([...next]));
      return next;
    });
  }

  function removeAsset(symbol) {
    setAssets((current) => {
      const next = current.filter((item) => item.symbol !== symbol);
      localStorage.setItem('wealth-custom-assets', JSON.stringify(next.filter((item) => item.custom)));
      return next;
    });
    setFavorites((current) => {
      const next = new Set(current);
      next.delete(symbol);
      localStorage.setItem('wealth-favorites', JSON.stringify([...next]));
      return next;
    });
  }

  function addTransaction(transaction) {
    setTransactions((current) => {
      const next = [...current, { ...transaction, id: crypto.randomUUID(), quantity: Number(transaction.quantity), price: Number(transaction.price), fees: Number(transaction.fees || 0) }];
      localStorage.setItem('wealth-portfolio-transactions', JSON.stringify(next));
      return next;
    });
  }

  function removeTransaction(id) {
    setTransactions((current) => {
      const next = current.filter((transaction) => transaction.id !== id);
      localStorage.setItem('wealth-portfolio-transactions', JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className={`app ${sidebarOpen ? '' : 'sidebarClosed'}`} data-theme={theme}>
      <aside className="sidebar">
        <div className="brand"><span>W</span><strong>Wealth</strong></div>
        <button className="sidebarToggle" type="button" onClick={() => setSidebarOpen((current) => !current)} aria-label={sidebarOpen ? 'Chiudi sidebar' : 'Apri sidebar'}>
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
        <nav>
          <button className={`navButton navOverview ${page === 'markets' ? 'active' : ''}`} onClick={() => setPage('markets')}><i className="navIcon"><Gauge size={17} /></i><span>Overview</span></button>
          <button className={`navButton navMacro ${page === 'macro' ? 'active' : ''}`} onClick={() => setPage('macro')}><i className="navIcon"><Globe2 size={17} /></i><span>Macro Overview</span></button>
          <button className={`navButton navMarkets ${page === 'watchlist' ? 'active' : ''}`} onClick={() => setPage('watchlist')}><i className="navIcon"><CandlestickChart size={17} /></i><span>Mercati</span></button>
          <button className={`navButton navNews ${page === 'news' ? 'active' : ''}`} onClick={() => setPage('news')}><i className="navIcon"><Newspaper size={17} /></i><span>News</span></button>
          <button className={`navButton navPortfolio ${page === 'portfolio' ? 'active' : ''}`} onClick={() => setPage('portfolio')}><i className="navIcon"><BriefcaseBusiness size={17} /></i><span>Portafoglio</span></button>
          <button className={`navButton navAnalysis ${page === 'analysis' ? 'active' : ''}`} onClick={() => setPage('analysis')}><i className="navIcon"><ChartNoAxesCombined size={17} /></i><span>Analisi</span></button>
        </nav>
        <div className="sidebarBottom">
          <button className="navButton navSettings"><i className="navIcon"><SlidersHorizontal size={17} /></i><span>Impostazioni</span></button>
        </div>
      </aside>

      <main>
        <TradingViewTickerTape />
        {page === 'macro' ? <MacroOverview theme={theme} setTheme={setTheme} assets={assets} /> : page === 'watchlist' ? (
          <WatchlistOverview theme={theme} setTheme={setTheme} favorites={favorites} toggleFavorite={toggleFavorite} assets={assets} pricesUpdatedAt={pricesUpdatedAt} addAsset={addAsset} removeAsset={removeAsset} />
        ) : page === 'news' ? (
          <NewsOverview theme={theme} setTheme={setTheme} />
        ) : page === 'portfolio' ? (
          <PortfolioOverview theme={theme} setTheme={setTheme} assets={assets} transactions={transactions} addTransaction={addTransaction} removeTransaction={removeTransaction} pricesUpdatedAt={pricesUpdatedAt} />
        ) : page === 'analysis' ? (
          <AnalysisOverview theme={theme} setTheme={setTheme} assets={assets} favorites={favorites} />
        ) : (
        <>
        <header>
          <div>
            <p className="eyebrow">Giovedì, 11 giugno</p>
            <h1>Panoramica mercati</h1>
            <p className="subtitle">Ecco come si muovono i mercati oggi.</p>
          </div>
          <HeaderActions theme={theme} setTheme={setTheme} showSearch query={query} setQuery={setQuery} />
        </header>

        <div className="demoNotice"><Sparkles size={15} /><span>Preview con dati dimostrativi</span><b>Mercati aperti</b></div>

        <section className="heroGrid">
          <TradingViewMarketOverview theme={theme} />

          <div className="statsColumn">
            <article className="card statCard"><span className="statIcon blue"><Landmark size={19} /></span><div><span>Mercati globali</span><strong>Positivi</strong><small>7 indici su 10 in rialzo</small></div><Change value={0.34} /></article>
            <article className="card statCard"><span className="statIcon green"><CircleDollarSign size={19} /></span><div><span>EUR / USD</span><strong>{eurUsd.price}</strong><small>{pricesUpdatedAt ? `Aggiornato alle ${formatUpdateTime(pricesUpdatedAt)}` : 'Valore iniziale'}</small></div><Change value={eurUsd.daily} /></article>
            <article className="card statCard sentiment"><div className="sentimentTop"><span>Sentiment mercato</span><strong>Risk-on</strong></div><div className="sentimentBar"><i /></div><div className="sentimentLabels"><span>Prudenza</span><span>Ottimismo</span></div></article>
          </div>
        </section>

        <section className="sectionHeading"><div><h2>Heatmap S&amp;P 500</h2><p>Performance dei titoli raggruppati per settore e capitalizzazione.</p></div></section>
        <TradingViewStockHeatmap />

        <section className="sectionHeading"><div><h2>La tua watchlist</h2><p>Prezzi e performance degli strumenti che segui.</p></div><button className="secondaryButton">Gestisci watchlist</button></section>
        <div className="filterRow">
          {['Tutti', 'Preferiti', 'Indici', 'Valute', 'Materie prime', 'Crypto'].map((item) => <button key={item} onClick={() => setFilter(item)} className={filter === item ? 'active' : ''}>{item}</button>)}
        </div>

        <section className="card tableCard">
          <div className="marketTable">
            <div className="tableRow tableHead"><span>Strumento</span><span>Prezzo corrente</span><span>Oggi</span><span>1 mese</span><span>Valuta</span><span /></div>
            {visibleMarkets.map((item) => (
              <div className="tableRow" key={item.symbol}>
                <div className="instrument"><button onClick={() => toggleFavorite(item.symbol)} aria-label="Preferito"><Star size={16} fill={favorites.has(item.symbol) ? 'currentColor' : 'none'} /></button><span><strong>{item.name}</strong><small>{item.symbol} · {item.group}</small></span></div>
                <strong>{item.price}</strong><Change value={item.daily} /><Change value={item.monthly} /><span className="currency">{item.currency || '—'}</span><button className="moreButton"><MoreHorizontal size={18} /></button>
              </div>
            ))}
            {!visibleMarkets.length && <div className="empty">Nessuno strumento corrisponde alla ricerca.</div>}
          </div>
        </section>

        <section className="sectionHeading macroHeading"><div><h2>Indicatori macro</h2><p>I principali riferimenti per leggere il mercato.</p></div><span className="updated">Aggiornati oggi, 09:42</span></section>
        <section className="macroGrid">
          {macro.map((item) => <article className="card macroCard" key={item.label}><span className={`macroDot ${item.tone}`} /><span>{item.label}</span><strong>{item.value}</strong><small>{item.note}</small></article>)}
        </section>

        <section className="sectionHeading commodityHeading"><div><h2>Materie prime e scenario macro</h2><p>Rame e petrolio aiutano a interpretare crescita e pressioni inflazionistiche.</p></div><span className="updated">Movimento a 1 mese</span></section>
        <section className="commodityGrid">
          {commodities.map((item) => (
            <article className="card commodityCard" key={item.symbol}>
              <div className={`commodityIcon ${item.tone}`}>{item.symbol === 'COPPER' ? 'Cu' : 'Br'}</div>
              <div className="commodityName"><span>{item.name}</span><small>{item.unit}</small></div>
              <strong>{item.price}</strong>
              <div className="commodityChanges"><span>Oggi <Change value={item.daily} /></span><span>1 mese <Change value={item.monthly} /></span></div>
            </article>
          ))}
          <article className="card commodityInsight">
            <span className="overline">LETTURA DEL REGIME</span>
            <strong>Rame forte, petrolio in calo</strong>
            <p>{commodityComment(commodities[0], commodities[1])}</p>
            <small>Indicazione orientativa, da integrare con crescita, inflazione e politica monetaria.</small>
          </article>
        </section>
        </>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
