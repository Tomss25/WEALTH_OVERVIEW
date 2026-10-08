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
  ExternalLink,
  Gauge,
  Globe2,
  Landmark,
  Moon,
  Newspaper,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
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
  { symbol: 'SPX', name: 'S&P 500', group: 'Indici', price: 'N/D', daily: null, monthly: null, currency: 'USD', favorite: true },
  { symbol: 'NDX', name: 'Nasdaq 100', group: 'Indici', price: 'N/D', daily: null, monthly: null, currency: 'USD', favorite: true },
  { symbol: 'SX5E', name: 'Euro Stoxx 50', group: 'Indici', price: 'N/D', daily: null, monthly: null, currency: 'EUR', favorite: true },
  { symbol: 'FTSEMIB', name: 'FTSE MIB', group: 'Indici', price: 'N/D', daily: null, monthly: null, currency: 'EUR', favorite: false },
  { symbol: 'MSCIWORLD', name: 'MSCI World ETF', group: 'Indici', price: 'N/D', daily: null, monthly: null, currency: 'USD', favorite: false },
  { symbol: 'EUR/USD', name: 'Euro / Dollaro', group: 'Valute', price: 'N/D', daily: null, monthly: null, currency: '', favorite: true },
  { symbol: 'USD/JPY', name: 'Dollaro / Yen', group: 'Valute', price: 'N/D', daily: null, monthly: null, currency: '', favorite: false },
  { symbol: 'GOLD', name: 'Future oro', group: 'Materie prime', price: 'N/D', daily: null, monthly: null, currency: 'USD', favorite: true },
  { symbol: 'COPPER', name: 'Future rame', group: 'Materie prime', price: 'N/D', daily: null, monthly: null, currency: 'USD', favorite: false },
  { symbol: 'BRENT', name: 'Future petrolio Brent', group: 'Materie prime', price: 'N/D', daily: null, monthly: null, currency: 'USD', favorite: false },
  { symbol: 'BTC', name: 'Bitcoin', group: 'Crypto', price: 'N/D', daily: null, monthly: null, currency: 'USD', favorite: false },
  { symbol: 'VIX', name: 'Indice di volatilita VIX', group: 'Volatilita', price: 'N/D', daily: null, monthly: null, currency: '', favorite: false },
  { symbol: 'VVIX', name: 'Volatilita del VIX', group: 'Volatilita', price: 'N/D', daily: null, monthly: null, currency: '', favorite: false },
  { symbol: 'VSTOXX', name: 'Euro Stoxx 50 Volatility', group: 'Volatilita', price: 'N/D', daily: null, monthly: null, currency: '', favorite: false },
  { symbol: 'MOVE', name: 'MOVE Bond Volatility', group: 'Volatilita', price: 'N/D', daily: null, monthly: null, currency: '', favorite: false },
  { symbol: 'BTP10Y', name: 'Titolo di Stato Italia 10 anni', group: 'Obbligazioni', price: 'N/D', daily: null, monthly: null, currency: '%', favorite: false },
  { symbol: 'BTP2Y', name: 'Titolo di Stato Italia 2 anni', group: 'Obbligazioni', price: 'N/D', daily: null, monthly: null, currency: '%', favorite: false },
  { symbol: 'BUND10Y', name: 'Bund Germania 10 anni', group: 'Obbligazioni', price: 'N/D', daily: null, monthly: null, currency: '%', favorite: false },
  { symbol: 'UST10Y', name: 'Treasury USA 10 anni', group: 'Obbligazioni', price: 'N/D', daily: null, monthly: null, currency: '%', favorite: false },
  { symbol: 'UST2Y', name: 'Treasury USA 2 anni', group: 'Obbligazioni', price: 'N/D', daily: null, monthly: null, currency: '%', favorite: false },
  { symbol: 'UST30Y', name: 'Treasury USA 30 anni', group: 'Obbligazioni', price: 'N/D', daily: null, monthly: null, currency: '%', favorite: false },
  { symbol: 'BTP-BUND', name: 'Spread BTP / Bund', group: 'Credito e spread', price: 'N/D', daily: null, monthly: null, currency: 'pb', favorite: false },
  { symbol: 'USHY', name: 'Spread High Yield USA', group: 'Credito e spread', price: 'N/D', daily: null, monthly: null, currency: 'pb', favorite: false },
  { symbol: 'EUHY', name: 'Spread High Yield Europa', group: 'Credito e spread', price: 'N/D', daily: null, monthly: null, currency: 'pb', favorite: false },
  { symbol: 'DXY', name: 'Dollar Index', group: 'Valute', price: 'N/D', daily: null, monthly: null, currency: '', favorite: false },
  { symbol: 'GBP/USD', name: 'Sterlina / Dollaro', group: 'Valute', price: 'N/D', daily: null, monthly: null, currency: '$', favorite: false },
  { symbol: 'SILVER', name: 'Future argento', group: 'Materie prime', price: 'N/D', daily: null, monthly: null, currency: 'USD', favorite: false },
  { symbol: 'WTI', name: 'Future petrolio WTI', group: 'Materie prime', price: 'N/D', daily: null, monthly: null, currency: 'USD', favorite: false },
  { symbol: 'ETH', name: 'Ethereum', group: 'Crypto', price: 'N/D', daily: null, monthly: null, currency: 'USD', favorite: false },
];

const macroRegions = { Globale: {}, 'Stati Uniti': {}, Europa: {} };

const italyInflationFallback = {
  items: [
    { label: 'Inflazione corrente', value: null, note: 'Caricamento fonte live', source: 'ISTAT', url: 'https://www.istat.it/en/tag/inflation/', available: false },
    { label: 'Inflazione attesa', value: null, note: 'Caricamento fonte live', source: 'Commissione europea', url: 'https://economy-finance.ec.europa.eu/economic-surveillance-eu-member-states/country-pages-including-country-reports/italy/economic-forecast-italy_en', available: false },
    { label: 'Inflazione prezzata', value: null, note: 'In attesa di feed live BTP', source: 'Breakeven BTP', url: 'https://www.dt.mef.gov.it/it/debito_pubblico/titoli_di_stato/quali_sono_titoli/btp_italia/', available: false },
  ],
  method: {
    title: 'Breakeven inflation italiana',
    formula: 'Rendimento nominale BTP - rendimento reale BTP Italia/BTPei con scadenza comparabile = inflazione media annua implicita.',
    improvement: 'Il dato va calcolato con rendimenti lordi a scadenza live di due bond con durata residua almeno 5 anni e scadenza quasi identica. Se manca il rendimento reale live, mostrare un numero sarebbe fuorviante.',
  },
};

const financialNews = [];

const formatChange = (value) => Number.isFinite(value)
  ? `${value > 0 ? '+' : ''}${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}%`
  : 'N/D';

const formatLivePrice = (value, currency) => {
  if (value == null || value === '') return 'N/D';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 'N/D';
  return numeric.toLocaleString('it-IT', {
    minimumFractionDigits: currency === 'pb' ? 0 : 2,
    maximumFractionDigits: currency === 'pb' ? 0 : numeric >= 10 ? 2 : 4,
  });
};

const formatUpdateTime = (value) => value
  ? new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
  : null;

const formatQuoteTime = (value) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Intl.DateTimeFormat('it-IT', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00Z`));
  }
  return formatUpdateTime(value);
};

const todayLabel = () => new Intl.DateTimeFormat('it-IT', {
  timeZone: 'Europe/Rome', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
}).format(new Date());

function useTodayLabel() {
  const [today, setToday] = useState(todayLabel);
  useEffect(() => {
    const interval = setInterval(() => setToday(todayLabel()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return today;
}

const parseItalianNumber = (value) => {
  const parsed = Number(String(value).replaceAll('.', '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

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
  if (![equity, riskOne, riskTwo].every((item) => item?.price !== 'N/D' && Number.isFinite(item?.monthly))) {
    return { tone: 'neutral', label: 'Dati insufficienti', text: 'Almeno una delle serie necessarie non è disponibile. Il regime di rischio non può essere calcolato.' };
  }
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

function assetDisplay(asset, field = 'monthly') {
  if (!asset) return 'N/D';
  if (field === 'price') return asset.price || 'N/D';
  return formatChange(asset[field]);
}

function dynamicTone(value, inverse = false) {
  if (!Number.isFinite(value)) return 'neutral';
  const adjusted = inverse ? -value : value;
  if (adjusted > 0.15) return 'positive';
  if (adjusted < -0.15) return 'warning';
  return 'neutral';
}

function signalStatus(tone) {
  if (tone === 'positive') return 'Costruttivo';
  if (tone === 'warning') return 'Da monitorare';
  return 'Neutrale';
}

function makeDynamicSignal({ assets, title, priority, leftSymbol, rightSymbol, leftField = 'monthly', rightField = 'monthly', inverseLeft = false, inverseRight = false, reading }) {
  const left = assets.find((item) => item.symbol === leftSymbol);
  const right = assets.find((item) => item.symbol === rightSymbol);
  if (!Number.isFinite(left?.[leftField]) || !Number.isFinite(right?.[rightField])) {
    return { title, priority, status: 'N/D', tone: 'neutral', available: false, left: [left?.name || leftSymbol, 'N/D'], right: [right?.name || rightSymbol, 'N/D'], reading: 'Dati insufficienti per calcolare questo segnale.' };
  }
  const leftTone = dynamicTone(left?.[leftField], inverseLeft);
  const rightTone = dynamicTone(right?.[rightField], inverseRight);
  const tone = leftTone === 'warning' || rightTone === 'warning' ? 'warning' : leftTone === 'positive' || rightTone === 'positive' ? 'positive' : 'neutral';
  return {
    title,
    priority,
    status: signalStatus(tone),
    tone,
    left: [left?.name || leftSymbol, assetDisplay(left, leftField)],
    right: [right?.name || rightSymbol, assetDisplay(right, rightField)],
    reading: reading(left, right),
  };
}

function marketRegimeFromSignals(region, signals) {
  const availableSignals = signals.filter((signal) => signal.available !== false);
  if (availableSignals.length < 2) return { regime: 'Dati insufficienti', summary: `${availableSignals.length}/${signals.length} segnali calcolabili per ${region}: servono almeno due segnali per descrivere un regime.`, tone: 'neutral' };
  const positiveCount = availableSignals.filter((signal) => signal.tone === 'positive').length;
  const warningCount = availableSignals.filter((signal) => signal.tone === 'warning').length;
  const tone = warningCount > positiveCount ? 'warning' : positiveCount > warningCount ? 'positive' : 'neutral';
  const regime = tone === 'positive' ? 'Risk-on dinamico' : tone === 'warning' ? 'Rischio in aumento' : 'Quadro misto';
  const summary = `${availableSignals.length}/${signals.length} segnali calcolabili: ${positiveCount} costruttivi, ${warningCount} da monitorare. Lettura basata sugli ultimi dati disponibili per ${region}.`;
  return { regime, summary, tone };
}

function buildMacroRegionView(assets, region) {
  const shared = { assets };
  const signalsByRegion = {
    Globale: [
      makeDynamicSignal({ ...shared, title: 'Ciclo industriale globale', priority: 'Alta', leftSymbol: 'COPPER', rightSymbol: 'BRENT', reading: (left, right) => `Rame ${overviewMoveLabel(left?.monthly)} e Brent ${overviewMoveLabel(right?.monthly)} nell'ultimo mese: la combinazione misura domanda industriale e pressione energetica.` }),
      makeDynamicSignal({ ...shared, title: 'Domanda difensiva', priority: 'Alta', leftSymbol: 'GOLD', rightSymbol: 'COPPER', reading: (left, right) => `Oro ${overviewMoveLabel(left?.monthly)} contro rame ${overviewMoveLabel(right?.monthly)}: il rapporto aiuta a distinguere difesa da ciclo industriale.` }),
      makeDynamicSignal({ ...shared, title: 'Liquidita globale', priority: 'Media', leftSymbol: 'DXY', rightSymbol: 'BTC', inverseLeft: true, reading: (left, right) => `Dollaro ${overviewMoveLabel(left?.monthly)} e Bitcoin ${overviewMoveLabel(right?.monthly)}: segnale dinamico sulle condizioni di liquidita globale.` }),
    ],
    'Stati Uniti': [
      makeDynamicSignal({ ...shared, title: 'Azioni USA e volatilita', priority: 'Alta', leftSymbol: 'SPX', rightSymbol: 'VIX', inverseRight: true, reading: (left, right) => `S&P 500 ${overviewMoveLabel(left?.monthly)} e VIX ${overviewMoveLabel(right?.monthly)}: combinazione usata per leggere risk-on/risk-off USA.` }),
      makeDynamicSignal({ ...shared, title: 'Tech e stress implicito', priority: 'Alta', leftSymbol: 'NDX', rightSymbol: 'VVIX', inverseRight: true, reading: (left, right) => `Nasdaq 100 ${overviewMoveLabel(left?.monthly)} e VVIX ${overviewMoveLabel(right?.monthly)}: segnala quanto il rialzo tech sia accompagnato da stress sulla volatilita.` }),
      makeDynamicSignal({ ...shared, title: 'Curva Treasury', priority: 'Media', leftSymbol: 'UST10Y', rightSymbol: 'UST2Y', reading: (left, right) => `Treasury 10 anni ${overviewMoveLabel(left?.monthly)} e 2 anni ${overviewMoveLabel(right?.monthly)}: lettura dinamica della pressione sui tassi USA.` }),
    ],
    Europa: [
      makeDynamicSignal({ ...shared, title: 'Azioni e credito europeo', priority: 'Alta', leftSymbol: 'SX5E', rightSymbol: 'EUHY', inverseRight: true, reading: (left, right) => `Euro Stoxx 50 ${overviewMoveLabel(left?.monthly)} e credito HY Europa ${overviewMoveLabel(right?.monthly)}: conferma o nega il risk-on europeo.` }),
      makeDynamicSignal({ ...shared, title: 'Rischio periferico', priority: 'Alta', leftSymbol: 'BTP-BUND', rightSymbol: 'SX5E', inverseLeft: true, reading: (left, right) => `Spread BTP-Bund ${overviewMoveLabel(left?.monthly)} e azionario europeo ${overviewMoveLabel(right?.monthly)}: misura dinamica della frammentazione finanziaria.` }),
      makeDynamicSignal({ ...shared, title: 'Euro e competitivita', priority: 'Media', leftSymbol: 'EUR/USD', rightSymbol: 'SX5E', reading: (left, right) => `EUR/USD ${overviewMoveLabel(left?.monthly)} e Euro Stoxx 50 ${overviewMoveLabel(right?.monthly)}: lettura dinamica tra valuta e azionario europeo.` }),
    ],
  };
  const signals = signalsByRegion[region] || signalsByRegion.Globale;
  return { ...marketRegimeFromSignals(region, signals), signals };
}

const currencySymbol = (item) => {
  if (['SPX', 'NDX', 'SX5E', 'FTSEMIB', 'VIX', 'VVIX', 'VSTOXX', 'MOVE', 'DXY'].includes(item.symbol)) return '';
  if (item.currency === 'EUR') return '€';
  if (item.currency === 'USD' || item.currency === '$' || item.symbol === 'EUR/USD') return '$';
  if (item.symbol === 'USD/JPY') return '¥';
  return item.currency;
};

const isSuffixUnit = (item) => item.currency === '%' || item.currency === 'pb';

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
  if (!Number.isFinite(value)) return <span className="change neutral">N/D</span>;
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
  const current = buildMacroRegionView(assets, region);
  const positiveCount = current.signals.filter((signal) => signal.tone === 'positive').length;
  const neutralCount = current.signals.filter((signal) => signal.tone === 'neutral' && signal.available !== false).length;
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

      <div className="demoNotice"><BrainCircuit size={15} /><span>Analisi calcolata dai valori disponibili</span><b>{current.signals.filter((signal) => signal.available !== false).length}/{current.signals.length} segnali calcolabili</b></div>

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
              <div><span>1 giorno</span><Change value={item.daily} /><span>1 mese</span><Change value={item.monthly} /></div>
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

      {region === 'Europa' && <ItalyInflationFocus />}

      <section className="sectionHeading macroSignalsHeading"><div><h2>Segnali ad alta priorità</h2><p>Indicatori con maggiore utilità per leggere ciclo, inflazione e stress finanziario.</p></div><span className="updated">Dati live</span></section>
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

function ItalyInflationFocus() {
  const [focus, setFocus] = useState(italyInflationFallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function updateItalyInflation() {
      try {
        setLoading(true);
        const response = await fetch('/api/italy-inflation');
        const data = await response.json();
        if (!active) return;
        if (!response.ok) throw new Error(data.details || data.error || 'Fonte non disponibile');
        setFocus(data);
        setError('');
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    updateItalyInflation();
    return () => { active = false; };
  }, []);

  const items = focus.items || italyInflationFallback.items;
  const method = focus.method || italyInflationFallback.method;
  const updatedAt = focus.updatedAt ? formatUpdateTime(focus.updatedAt) : null;

  return (
    <>
      <section className="sectionHeading macroSignalsHeading">
        <div><h2>Focus Italia: inflazione</h2><p>Inflazione osservata, scenario atteso e stima di mercato tramite breakeven su BTP.</p></div>
        <span className="updated">{loading ? 'Aggiornamento...' : updatedAt ? `Fonti verificate il ${updatedAt}` : 'Italia'}</span>
      </section>
      {error && <div className="refreshError">Focus Italia non aggiornato: {error}</div>}
      <section className="italyInflationPanel">
        <div className="italyInflationCards">
          {items.map((item) => (
            <article className="card italyInflationCard" key={item.label}>
              <span>{item.label}</span>
              <strong>{Number.isFinite(item.value) ? `${formatPortfolioNumber(item.value)}%` : 'N/D'}</strong>
              <small>{item.note}</small>
              {item.url ? <a href={item.url} target="_blank" rel="noreferrer">{item.source}<ExternalLink size={12} /></a> : <small>{item.source}</small>}
            </article>
          ))}
        </div>
        <article className="card italyInflationMethod">
          <span className="overline">METODO</span>
          <strong>{method.title}</strong>
          <p>{method.formula}</p>
          <small>{method.improvement}</small>
        </article>
      </section>
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

function WatchlistOverview({ theme, setTheme, favorites, toggleFavorite, assets, pricesUpdatedAt, pricesError, addAsset, removeAsset }) {
  const [query, setQuery] = useState('');
  const [assetQuery, setAssetQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addError, setAddError] = useState('');
  const assetClasses = [...new Set(assets.map((item) => item.group))];
  const visibleAssets = assets.filter((item) => `${item.symbol} ${item.name} ${item.group}`.toLowerCase().includes(query.toLowerCase()));
  const availableCount = assets.filter((item) => item.price !== 'N/D').length;

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

      <div className="demoNotice"><Star size={15} /><span>{availableCount}/{assets.length} quotazioni disponibili</span><b>{pricesError || (pricesUpdatedAt ? `API verificata il ${formatUpdateTime(pricesUpdatedAt)}` : 'Caricamento dati in corso')}</b></div>

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
                    {isSuffixUnit(item) && item.price !== 'N/D' && <span>{item.currency}</span>}
                  </div>
                  <div className="assetPerformance">
                    <div><span>1 giorno</span><Change value={item.daily} /></div>
                    <div><span>1 mese</span><Change value={item.monthly} /></div>
                  </div>
                  <span className="assetSource">{item.source ? `${item.source}${item.asOf ? ` · Rilevato: ${formatQuoteTime(item.asOf)}` : ''}` : 'Quotazione non disponibile'}</span>
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
  const today = useTodayLabel();
  const featured = news[0];
  const latestNews = news.slice(1);

  useEffect(() => {
    fetch('/api/news')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.details || data.error || 'News non disponibili');
        return data;
      })
      .then((data) => {
        if (data.articles?.length) {
          setNews(data.articles.map((article, index) => ({
            ...article,
            category: index === 0 ? 'Notizia principale' : 'Economia e mercati',
            time: formatUpdateTime(article.publishedAt),
            tone: index === 0 ? 'blue' : ['green', 'orange', 'violet', 'cyan', 'red'][index % 5],
          })));
          setUpdatedAt(data.updatedAt);
        } else {
          setRefreshError('Nessuna news live disponibile.');
        }
      })
      .catch((error) => setRefreshError(error.message));
  }, []);

  async function refreshNews() {
    setRefreshing(true);
    setRefreshError('');
    try {
      const response = await fetch('/api/news/refresh', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error);
      if (!data.articles?.length) throw new Error('Nessuna news live disponibile.');
      setNews(data.articles.map((article, index) => ({
        ...article,
        category: index === 0 ? 'Notizia principale' : 'Economia e mercati',
        time: formatUpdateTime(article.publishedAt),
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
        <div className="demoNotice"><Newspaper size={15} /><span>Ultime notizie disponibili</span><b>{updatedAt ? `Feed verificato il ${formatUpdateTime(updatedAt)}` : 'In attesa di dati live'}</b></div>
        <button className="refreshButton" type="button" onClick={refreshNews} disabled={refreshing}><RefreshCw size={15} className={refreshing ? 'spinning' : ''} />{refreshing ? 'Aggiornamento...' : 'Aggiorna news'}</button>
      </div>
      {refreshError && <div className="refreshError">{refreshError}</div>}

      {featured ? <a className="newsFeatured" href={featured.url} target="_blank" rel="noopener noreferrer">
        <div className="newsFeaturedContent">
          <div className="newsMeta"><span className={`newsCategory ${featured.tone}`}>{featured.category}</span><span>{featured.time}</span></div>
          <h2>{featured.title}</h2>
          <p>{featured.summary}</p>
          <div className="newsSource"><span>{featured.source}</span><span>Leggi la notizia <ExternalLink size={14} /></span></div>
        </div>
        <div className="newsFeaturedVisual"><Landmark size={42} /><span>Focus del giorno</span></div>
      </a> : <div className="card empty">Nessuna news live caricata. Usa “Aggiorna news” o verifica la configurazione dell'API.</div>}

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

const formatPortfolioNumber = (value) => value == null || !Number.isFinite(Number(value))
  ? 'N/D'
  : Number(value).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function PortfolioOverview({ theme, setTheme, assets, transactions, addTransaction, removeTransaction, pricesUpdatedAt }) {
  const [form, setForm] = useState({ type: 'buy', mode: 'quantity', symbol: assets[0]?.symbol || '', quantity: '', amount: '', price: '', fees: '0', date: new Date().toISOString().slice(0, 10) });
  const selectedAsset = assets.find((item) => item.symbol === form.symbol);
  const currentAssetPrice = selectedAsset?.price && selectedAsset.price !== 'N/D' ? parseItalianNumber(selectedAsset.price) : null;
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
      const currentPrice = asset?.price && asset.price !== 'N/D' ? parseItalianNumber(asset.price) : null;
      const value = currentPrice == null ? null : position.quantity * currentPrice;
      const unrealized = value == null ? null : value - position.cost;
      return { ...position, asset, currentPrice, value, unrealized, returnPct: unrealized == null ? null : position.cost ? (unrealized / position.cost) * 100 : 0 };
    }).sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
  }, [assets, transactions]);

  const missingPrices = positions.some((position) => position.value == null);
  const totalValue = missingPrices ? null : positions.reduce((sum, position) => sum + position.value, 0);
  const totalCost = positions.reduce((sum, position) => sum + position.cost, 0);
  const totalUnrealized = totalValue == null ? null : totalValue - totalCost;
  const totalReturn = totalUnrealized == null ? null : totalCost ? (totalUnrealized / totalCost) * 100 : 0;
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

      <div className="demoNotice"><ShieldCheck size={15} /><span>Operazioni salvate esclusivamente in questo browser</span><b>{pricesUpdatedAt ? `API verificata il ${formatUpdateTime(pricesUpdatedAt)}` : 'In attesa prezzi live'}</b></div>

      <section className="portfolioKpis">
        <article className="card portfolioKpi"><span>Valore indicativo</span><strong>{formatPortfolioNumber(totalValue)}</strong><small>Somma senza conversione valutaria</small></article>
        <article className="card portfolioKpi"><span>Capitale investito</span><strong>{formatPortfolioNumber(totalCost)}</strong><small>Costo residuo delle posizioni</small></article>
        <article className={`card portfolioKpi ${totalUnrealized == null ? '' : totalUnrealized >= 0 ? 'positive' : 'negative'}`}><span>Risultato non realizzato</span><strong>{totalUnrealized != null && totalUnrealized >= 0 ? '+' : ''}{formatPortfolioNumber(totalUnrealized)}</strong><Change value={totalReturn} /></article>
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
            {positions.map((position) => <div className="allocationItem" key={position.symbol}><div><strong>{position.symbol}</strong><span>{totalValue == null ? 'N/D' : `${formatPortfolioNumber(totalValue ? (position.value / totalValue) * 100 : 0)}%`}</span></div><i><b style={{ width: `${totalValue && position.value != null ? (position.value / totalValue) * 100 : 0}%` }} /></i></div>)}
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

function loadSavedBaskets() {
  try {
    const saved = JSON.parse(localStorage.getItem('wealth-analysis-baskets') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function AnalysisOverview({ theme, setTheme, assets, favorites, transactions, addAsset }) {
  const portfolioSymbols = useMemo(() => {
    const quantities = new Map();
    transactions.forEach((transaction) => {
      const multiplier = transaction.type === 'sell' ? -1 : 1;
      quantities.set(transaction.symbol, (quantities.get(transaction.symbol) || 0) + multiplier * Number(transaction.quantity || 0));
    });
    return new Set([...quantities.entries()].filter(([, quantity]) => quantity > 0).map(([symbol]) => symbol));
  }, [transactions]);
  const analysisAssets = useMemo(() => assets
    .filter((item) => favorites.has(item.symbol) || portfolioSymbols.has(item.symbol) || item.custom)
    .map((item) => ({
      ...item,
      tags: [
        favorites.has(item.symbol) ? 'Preferito' : '',
        portfolioSymbols.has(item.symbol) ? 'Portafoglio' : '',
        item.custom ? 'Aggiunto' : '',
      ].filter(Boolean),
    })), [assets, favorites, portfolioSymbols]);
  const initialSymbols = analysisAssets.slice(0, 8).map((item) => item.symbol);
  const [selected, setSelected] = useState(initialSymbols);
  const [assetQuery, setAssetQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [years, setYears] = useState(3);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [historyYears, setHistoryYears] = useState(null);
  const [basketOpen, setBasketOpen] = useState(false);
  const [basketActive, setBasketActive] = useState(false);
  const [weights, setWeights] = useState({});
  const [basketName, setBasketName] = useState('');
  const [savedBaskets, setSavedBaskets] = useState(loadSavedBaskets);

  const basketSeries = history.filter((item) => selected.includes(item.symbol));
  const basketPoints = useMemo(() => basketActive ? buildBasketPoints(basketSeries, weights) : [], [basketActive, basketSeries, weights]);
  const visibleHistory = basketPoints.length ? [] : history;
  const visibleSeries = basketPoints.length ? [{ symbol: 'BASKET', points: basketPoints }] : history;
  const metrics = visibleSeries.map((item) => ({ symbol: item.symbol, ...historicalMetrics(item.points) }));
  const basketWeightTotal = selected.reduce((total, symbol) => total + (Number(weights[symbol]) || 0), 0);

  useEffect(() => {
    setSelected((current) => current.filter((symbol) => assets.some((item) => item.symbol === symbol)));
  }, [assets]);

  useEffect(() => {
    if (assetQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      setAddError('');
      try {
        const response = await fetch(`/api/assets/search?q=${encodeURIComponent(assetQuery.trim())}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.details || data.error || 'Ricerca non disponibile');
        setSearchResults(data.results || []);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') setAddError(requestError.message);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [assetQuery]);

  const normalizedData = useMemo(() => {
    const rows = new Map();
    visibleHistory.forEach((item) => {
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
  }, [basketPoints, visibleHistory]);

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

  async function addAnalysisAsset(result) {
    setAddError('');
    try {
      const alreadyAdded = assets.some((item) => item.symbol === result.symbol);
      if (!alreadyAdded) await addAsset(result);
      setSelected((current) => {
        if (current.includes(result.symbol)) return current;
        if (current.length >= 8) {
          setAddError('Hai gia selezionato 8 strumenti. Deselezionane uno prima di aggiungerne un altro.');
          return current;
        }
        return [...current, result.symbol];
      });
      setAssetQuery('');
      setSearchResults([]);
      setBasketActive(false);
    } catch (requestError) {
      setAddError(requestError.message);
    }
  }

  async function runAnalysis({ activateBasket = false } = {}) {
    if (!selected.length) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/history?symbols=${encodeURIComponent(selected.join(','))}&years=${years}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error);
      const series = data.series || [];
      setHistory(series);
      setHistoryYears(years);
      setBasketActive(activateBasket && series.length === selected.length);
      setUpdatedAt(data.updatedAt);
      if (series.length < selected.length) setError('Alcune serie non sono disponibili su Yahoo Finance.');
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
    await runAnalysis({ activateBasket: true });
  }

  function saveBasket() {
    if (selected.length < 2) {
      setError('Seleziona almeno 2 strumenti per salvare un basket.');
      return;
    }
    if (Math.abs(basketWeightTotal - 100) > 0.01) {
      setError('La somma dei pesi del basket deve essere pari al 100%.');
      return;
    }
    const name = basketName.trim() || `Basket ${new Date().toLocaleDateString('it-IT')}`;
    const basket = {
      id: crypto.randomUUID(),
      name,
      symbols: selected,
      weights: Object.fromEntries(selected.map((symbol) => [symbol, Number(weights[symbol]) || 0])),
      years,
      createdAt: new Date().toISOString(),
    };
    setSavedBaskets((current) => {
      const next = [basket, ...current.filter((item) => item.name.toLowerCase() !== name.toLowerCase())].slice(0, 20);
      localStorage.setItem('wealth-analysis-baskets', JSON.stringify(next));
      return next;
    });
    setBasketName(name);
    setError('');
  }

  function loadBasket(basket) {
    setSelected(basket.symbols.filter((symbol) => assets.some((item) => item.symbol === symbol)).slice(0, 8));
    setWeights(basket.weights || {});
    setYears(basket.years || 3);
    setBasketName(basket.name);
    setBasketOpen(true);
    setBasketActive(false);
    setHistory([]);
    setHistoryYears(null);
    setError('');
  }

  function removeBasket(id) {
    setSavedBaskets((current) => {
      const next = current.filter((item) => item.id !== id);
      localStorage.setItem('wealth-analysis-baskets', JSON.stringify(next));
      return next;
    });
  }

  return (
    <>
      <header><div><p className="eyebrow">Rischio e performance</p><h1>Analisi</h1><p className="subtitle">Serie storiche Yahoo scaricate solo su richiesta e conservate in cache per 6 ore.</p></div><HeaderActions theme={theme} setTheme={setTheme} /></header>
      <div className="demoNotice"><ShieldCheck size={15} /><span>Nessuna chiamata API al caricamento della pagina</span><b>{updatedAt ? `Analisi eseguita il ${formatUpdateTime(updatedAt)}` : 'Premi Esegui analisi'}</b></div>

      <section className="card analysisControls">
        <div><span className="overline">CONFIGURAZIONE</span><h2>Seleziona gli strumenti</h2><p>Preferiti, posizioni in portafoglio e strumenti aggiunti via Yahoo Finance. Massimo 8 asset selezionati per singola analisi.</p></div>
        <div className="analysisSearchBlock">
          <label className="assetSearchInput"><Search size={18} /><input value={assetQuery} onChange={(event) => setAssetQuery(event.target.value)} placeholder="Incolla ISIN o ticker, ad esempio IT0005648255 o AAPL..." /></label>
          {searchLoading && <span className="assetSearchStatus">Ricerca Yahoo Finance in corso...</span>}
          {addError && <span className="assetSearchError">{addError}</span>}
          {!!searchResults.length && (
            <div className="assetSearchResults analysisSearchResults">
              {searchResults.map((result) => {
                const alreadyAdded = assets.some((asset) => asset.symbol === result.symbol);
                const alreadySelected = selected.includes(result.symbol);
                return (
                  <div className="assetSearchResult" key={`${result.symbol}-${result.exchange}`}>
                    <span><strong>{result.name}</strong><small>{result.symbol} · {result.exchange || result.quoteType || 'Yahoo Finance'}</small></span>
                    <button type="button" disabled={alreadySelected} onClick={() => addAnalysisAsset(result)}>
                      {alreadySelected ? 'Selezionato' : alreadyAdded ? 'Seleziona' : 'Aggiungi'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="analysisAssetPicker">{analysisAssets.map((item) => <button type="button" className={selected.includes(item.symbol) ? 'active' : ''} onClick={() => toggleAnalysisSymbol(item.symbol)} key={item.symbol}><span>{item.symbol}</span><small>{item.name}</small>{!!item.tags.length && <em>{item.tags.join(' · ')}</em>}</button>)}</div>
        {!analysisAssets.length && <div className="analysisEmpty small"><strong>Nessuno strumento disponibile</strong><span>Aggiungi preferiti, registra posizioni o cerca un nuovo ticker/ISIN.</span></div>}
        <div className="analysisRunBar"><label><span>Orizzonte</span><select value={years} onChange={(event) => { setYears(Number(event.target.value)); setBasketActive(false); }}><option value={1}>1 anno</option><option value={3}>3 anni</option><option value={5}>5 anni</option><option value={10}>10 anni</option></select></label><span>{selected.length}/8 strumenti</span><div className="analysisActions"><button className="basketButton" type="button" onClick={openBasket} disabled={selected.length < 2}>Crea basket</button><button type="button" onClick={runAnalysis} disabled={loading || !selected.length}><ChartNoAxesCombined size={16} />{loading ? 'Analisi in corso...' : 'Esegui analisi'}</button></div></div>
        {error && <div className="refreshError">{error}</div>}
      </section>

      {basketOpen && <section className="card basketBuilder">
        <div><span className="overline">BASKET PERSONALIZZATO</span><h2>Attribuisci i pesi</h2><p>La performance utilizza pesi iniziali fissi e le serie storiche già scaricate.</p></div>
        <label className="basketNameInput"><span>Nome basket</span><input value={basketName} onChange={(event) => setBasketName(event.target.value)} placeholder="Es. Core Italia, Tech globale, Bond ladder..." /></label>
        <div className="basketWeights">{selected.map((symbol) => <label key={symbol}><span><strong>{symbol}</strong><small>{assets.find((item) => item.symbol === symbol)?.name}</small></span><div><input type="number" min="0" max="100" step="0.1" value={weights[symbol] ?? ''} onChange={(event) => { setWeights({ ...weights, [symbol]: event.target.value }); setBasketActive(false); }} /><b>%</b></div></label>)}</div>
        <div className="basketFooter"><span className={Math.abs(basketWeightTotal - 100) <= .01 ? 'valid' : 'invalid'}>Totale pesi: <strong>{formatPortfolioNumber(basketWeightTotal)}%</strong></span><div className="basketFooterActions"><button className="basketSaveButton" type="button" onClick={saveBasket} disabled={Math.abs(basketWeightTotal - 100) > .01}>Salva basket</button><button type="button" onClick={runBasketAnalysis} disabled={loading || Math.abs(basketWeightTotal - 100) > .01}><ChartNoAxesCombined size={16} />Analizza basket</button></div></div>
      </section>}

      {!!savedBaskets.length && <section className="card savedBaskets">
        <div><span className="overline">BASKET SALVATI</span><h2>Richiama un basket</h2><p>Memorizzati in questo browser tramite localStorage.</p></div>
        <div className="savedBasketList">
          {savedBaskets.map((basket) => (
            <article key={basket.id}>
              <span><strong>{basket.name}</strong><small>{basket.symbols.join(' · ')} · {basket.years} {basket.years === 1 ? 'anno' : 'anni'}</small></span>
              <div><button type="button" onClick={() => loadBasket(basket)}>Carica</button><button type="button" onClick={() => removeBasket(basket.id)}>Elimina</button></div>
            </article>
          ))}
        </div>
      </section>}

      {!!history.length && <>
        <section className="sectionHeading"><div><h2>Performance storica</h2><p>Andamento normalizzato a base 100.</p></div><span className="updated">{years} {years === 1 ? 'anno' : 'anni'}</span></section>
        <article className="card analysisChart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={normalizedData}><CartesianGrid strokeDasharray="3 3" opacity={0.15} /><XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={45} /><YAxis tick={{ fontSize: 10 }} /><Tooltip />{visibleSeries.map((item, index) => <Area type="monotone" dataKey={item.symbol} stroke={item.symbol === 'BASKET' ? '#ffd166' : ['#5a8cff','#43d19e','#f0a764','#b18bff','#ff7185','#64c7ea','#f1cf63','#7f93b5'][index]} fill="transparent" strokeWidth={item.symbol === 'BASKET' ? 3.5 : 2} connectNulls key={item.symbol} />)}</AreaChart></ResponsiveContainer></article>

        <section className="sectionHeading"><div><h2>Metriche</h2><p>Rendimento totale, volatilità annualizzata e drawdown.</p></div></section>
        <section className="analysisMetricGrid">{metrics.map((item) => <article className="card analysisMetric" key={item.symbol}><span>{item.symbol}</span><strong>{formatPortfolioNumber(item.price)}</strong><div><span>Rendimento <Change value={item.returnPct} /></span><span>Volatilità <b>{formatPortfolioNumber(item.volatility)}%</b></span><span>Max drawdown <b className="negativeText">{formatPortfolioNumber(item.maxDrawdown)}%</b></span></div></article>)}</section>

        {visibleSeries.length > 1 && <><section className="sectionHeading"><div><h2>Matrice di correlazione</h2><p>Correlazione dei rendimenti giornalieri.</p></div></section><section className="card correlationMatrix" style={{ '--correlation-columns': visibleSeries.length + 1 }}><span />{visibleSeries.map((item) => <strong key={`h-${item.symbol}`}>{item.symbol}</strong>)}{visibleSeries.flatMap((row) => [<strong key={`r-${row.symbol}`}>{row.symbol}</strong>, ...visibleSeries.map((column) => { const value = correlation(row.points, column.points); return <span className={value >= .5 ? 'high' : value <= 0 ? 'low' : 'medium'} key={`${row.symbol}-${column.symbol}`}>{value.toFixed(2)}</span>; })])}</section></>}
      </>}
      {!history.length && !loading && <div className="card analysisEmpty"><ChartNoAxesCombined size={28} /><strong>Configura e avvia la prima analisi</strong><span>Le serie storiche verranno richieste solo dopo il clic.</span></div>}
    </>
  );
}

function assetGroupFromQuoteType(quoteType) {
  if (quoteType === 'BOND') return 'Obbligazioni';
  if (quoteType === 'ETF' || quoteType === 'MUTUALFUND') return 'ETF e fondi';
  if (quoteType === 'INDEX') return 'Indici';
  if (quoteType === 'CRYPTOCURRENCY') return 'Crypto';
  if (quoteType === 'CURRENCY') return 'Valute';
  if (quoteType === 'FUTURE') return 'Materie prime';
  return 'Azioni';
}

function formatOverviewValue(value) {
  if (typeof value === 'number') return value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value || 'N/D';
}

function MiniSparkline({ value }) {
  if (!Number.isFinite(value)) return <span className="miniSparkUnavailable" aria-label="Andamento non disponibile">N/D</span>;
  const positive = value >= 0;
  return <span className={`miniSpark ${positive ? 'positive' : 'negative'}`}><i /><i /><i /><i /><i /><i /><i /></span>;
}

function OverviewChange({ value }) {
  if (!Number.isFinite(value)) return <span className="overviewChange neutral">N/D</span>;
  const positive = value >= 0;
  return <span className={`overviewChange ${positive ? 'positive' : 'negative'}`}>{positive ? '+' : ''}{value.toFixed(2)}%</span>;
}

function normalizeOverviewAsset(asset) {
  return {
    ...asset,
    price: asset?.price || 'N/D',
    daily: Number.isFinite(asset?.daily) ? asset.daily : null,
    monthly: Number.isFinite(asset?.monthly) ? asset.monthly : null,
  };
}

function normalizeOverviewGroup(group) {
  return String(group || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function overviewMoveLabel(value) {
  if (!Number.isFinite(value)) return 'non disponibile';
  if (value > 0.15) return 'in rialzo';
  if (value < -0.15) return 'in ribasso';
  return 'stabile';
}

function overviewStrengthLabel(value) {
  if (!Number.isFinite(value)) return 'non disponibile';
  if (value > 0.45) return 'forte';
  if (value < -0.45) return 'debole';
  return 'neutrale';
}

function buildCurrencyInsight(item) {
  const daily = item.daily;
  if (!Number.isFinite(daily) || !Number.isFinite(item.monthly)) return `${item.name}: dati insufficienti per l'analisi.`;
  const trend = overviewMoveLabel(item.monthly);
  const move = overviewMoveLabel(daily);

  if (item.symbol === 'DXY') return `Dollaro ${overviewStrengthLabel(daily)}, ${move} oggi. Su base mensile il quadro e ${trend}.`;
  if (item.symbol === 'EUR/USD') return daily >= 0 ? `Euro piu forte del dollaro, ${move}. Il cambio ha un trend mensile ${trend}.` : `Dollaro piu forte dell'euro, cambio ${move}. Il trend mensile resta ${trend}.`;
  if (item.symbol === 'USD/JPY') return daily >= 0 ? `Yen debole contro dollaro: USD/JPY ${move}. Il trend mensile e ${trend}.` : `Yen in recupero contro dollaro: USD/JPY ${move}. Il trend mensile e ${trend}.`;
  if (item.symbol === 'GBP/USD') return daily >= 0 ? `Sterlina forte contro dollaro, ${move}. Movimento mensile ${trend}.` : `Sterlina debole contro dollaro, ${move}. Movimento mensile ${trend}.`;
  return `${item.name} ${overviewStrengthLabel(daily)}, ${move}. Trend mensile ${trend}.`;
}

function buildCommodityInsight(item) {
  const daily = item.daily;
  if (!Number.isFinite(daily) || !Number.isFinite(item.monthly)) return `${item.name}: dati insufficienti per l'analisi.`;
  const trend = overviewMoveLabel(item.monthly);
  const move = overviewMoveLabel(daily);

  if (item.symbol === 'GOLD') return daily >= 0 ? `Oro forte, ${move}: maggiore domanda difensiva o tassi reali meno penalizzanti. Trend mensile ${trend}.` : `Oro debole, ${move}: minore domanda difensiva o tassi reali piu sfavorevoli. Trend mensile ${trend}.`;
  if (item.symbol === 'COPPER') return daily >= 0 ? `Rame forte, ${move}: segnale ciclico positivo per industria e domanda globale. Trend mensile ${trend}.` : `Rame debole, ${move}: segnale piu prudente su industria e domanda globale. Trend mensile ${trend}.`;
  if (item.symbol === 'BRENT' || item.symbol === 'WTI') return daily >= 0 ? `${item.name} ${move}: pressione energetica in aumento. Trend mensile ${trend}.` : `${item.name} ${move}: pressione energetica in calo. Trend mensile ${trend}.`;
  return `${item.name} ${overviewStrengthLabel(daily)}, ${move}. Trend mensile ${trend}.`;
}

function buildOverviewInsight(group, rows) {
  const isCurrency = normalizeOverviewGroup(group) === 'valute';
  const validDaily = rows.map((item) => item.daily).filter(Number.isFinite);
  const averageDaily = validDaily.length ? validDaily.reduce((total, value) => total + value, 0) / validDaily.length : null;
  const main = [...rows].filter((item) => Number.isFinite(item.daily)).sort((a, b) => Math.abs(b.daily) - Math.abs(a.daily))[0];

  return {
    title: isCurrency ? 'Analisi valute' : 'Analisi materie prime',
    summary: Number.isFinite(averageDaily)
      ? `${group}: quadro complessivamente ${overviewStrengthLabel(averageDaily)}, movimento medio giornaliero ${averageDaily >= 0 ? '+' : ''}${averageDaily.toFixed(2)}%. Driver principale: ${main?.name || 'N/D'}.`
      : `${group}: dati live non ancora disponibili. Attendere l'aggiornamento delle quotazioni.`,
    lines: rows.map((item) => ({
      ...item,
      text: isCurrency ? buildCurrencyInsight(item) : buildCommodityInsight(item),
    })),
  };
}

function DynamicMarketTickerStrip({ assets }) {
  const items = assets.slice(0, 8).map(normalizeOverviewAsset);

  return (
    <section className="overviewTickerStrip">
      {items.map((item) => (
        <article key={item.symbol}>
          <strong title={item.name}>{item.name}</strong>
          <span>{item.price}</span>
          <OverviewChange value={item.daily} />
          <MiniSparkline value={item.daily} />
        </article>
      ))}
      <button type="button" aria-label="Precedenti"><ChevronLeft size={18} /></button>
      <button type="button" aria-label="Successivi"><ChevronRight size={18} /></button>
    </section>
  );
}

function DynamicWorldMarketsOverview({ assets }) {
  const [activeInsight, setActiveInsight] = useState(null);
  const groupOrder = ['Indici', 'Valute', 'Materie prime', 'Crypto', 'Volatilità', 'Obbligazioni', 'Credito e spread'];
  const groupedAssets = groupOrder
    .map((group) => ({
      group,
      rows: assets.filter((asset) => normalizeOverviewGroup(asset.group) === normalizeOverviewGroup(group)).map(normalizeOverviewAsset),
    }))
    .filter((section) => section.rows.length)
    .slice(0, 3);

  return (
    <section className="worldIndices">
      <div className="overviewTitleRow"><h2>Panoramica mercati <span>-&gt;</span></h2><div><ChevronLeft size={17} /><ChevronRight size={17} /></div></div>
      <div className="worldIndexGrid">
        {groupedAssets.map(({ group, rows }) => (
          <article className="worldIndexRegion" key={group}>
            {['valute', 'materie prime'].includes(normalizeOverviewGroup(group)) ? (
              <button className="worldIndexGroupButton" type="button" onClick={() => setActiveInsight(buildOverviewInsight(group, rows))}>{group}</button>
            ) : (
              <h3>{group}</h3>
            )}
            <div className="worldIndexTable">
              <div className="worldIndexHead"><span>Strumento</span><span /><span>Prezzo</span><span>1 giorno</span></div>
              {rows.map((item) => (
                <div className="worldIndexRow" key={`${group}-${item.symbol}`}>
                  <strong title={item.name}>{item.name}</strong>
                  <MiniSparkline value={item.daily} />
                  <span>{formatOverviewValue(item.price)}</span>
                  <OverviewChange value={item.daily} />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      {activeInsight && (
        <div className="overviewModalBackdrop" role="presentation" onClick={() => setActiveInsight(null)}>
          <section className="overviewModal" role="dialog" aria-modal="true" aria-label={activeInsight.title} onClick={(event) => event.stopPropagation()}>
            <div className="overviewModalHead">
              <div>
                <span>Overview dinamica</span>
                <h3>{activeInsight.title}</h3>
              </div>
              <button type="button" aria-label="Chiudi popup" onClick={() => setActiveInsight(null)}>x</button>
            </div>
            <p>{activeInsight.summary}</p>
            <div className="overviewInsightList">
              {activeInsight.lines.map((line) => (
                <article key={line.symbol}>
                  <div><strong>{line.name}</strong><span>{line.symbol} - {line.price}</span></div>
                  <OverviewChange value={line.daily} />
                  <p>{line.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function DynamicOverviewSidebar({ assets, transactions }) {
  const trending = [...assets]
    .map(normalizeOverviewAsset)
    .sort((a, b) => Math.abs(b.daily) - Math.abs(a.daily))
    .slice(0, 5);
  const portfolioSymbols = [...new Set(transactions.map((item) => item.symbol))].slice(0, 5);
  const portfolioRows = portfolioSymbols
    .map((symbol) => assets.find((asset) => asset.symbol === symbol))
    .filter(Boolean)
    .map(normalizeOverviewAsset);
  const customRows = assets.filter((item) => item.custom).slice(0, 3).map(normalizeOverviewAsset);

  return (
    <aside className="overviewSidePanel">
      <label className="overviewLookup"><Search size={17} /><input placeholder="Quote Lookup" /></label>
      <section>
        <h3>Movimenti principali</h3>
        <div className="overviewList">
          {trending.map((item) => (
            <article key={item.symbol}>
              <span><strong>{item.symbol}</strong><small>{item.name}</small></span>
              <MiniSparkline value={item.daily} />
              <span><b>{item.price}</b><OverviewChange value={item.daily} /></span>
            </article>
          ))}
        </div>
      </section>
      <section>
        <div className="portfolioPanelHead"><h3>Portfolio</h3><button type="button">Tutti</button></div>
        <div className="portfolioMiniSummary"><strong>{portfolioRows.length || 0} Totale</strong><span>Strumenti</span></div>
        <div className="overviewList">
          {(portfolioRows.length ? portfolioRows : customRows).map((item) => (
            <article key={item.symbol}>
              <span><strong>{item.symbol}</strong><small>{item.name}</small></span>
              <MiniSparkline value={item.daily} />
              <span><b>{item.price}</b><OverviewChange value={item.daily} /></span>
            </article>
          ))}
          {!portfolioRows.length && !customRows.length && <p className="overviewEmptySide">Nessuna posizione registrata.</p>}
        </div>
      </section>
    </aside>
  );
}

function MarketsOverviewPage({ assets, transactions, pricesUpdatedAt, pricesError }) {
  const today = useTodayLabel();
  const availableCount = assets.filter((item) => item.price !== 'N/D').length;
  return (
    <div className="marketsOverviewPage">
      <DynamicMarketTickerStrip assets={assets} />
      <div className="marketsOverviewLayout">
        <div className="marketsOverviewMain">
          <p className="overviewDate">{today}</p>
          <h1>Panoramica mercati</h1>
          <p className="overviewFreshness">{availableCount}/{assets.length} quotazioni disponibili · {pricesError || (pricesUpdatedAt ? `Verifica API: ${formatUpdateTime(pricesUpdatedAt)}` : 'Caricamento dati in corso')} · Le quotazioni possono riferirsi all'ultima seduta.</p>
          <DynamicWorldMarketsOverview assets={assets} />
          <section className="overviewHeatmapSection">
            <div className="overviewTitleRow">
              <h2>Heatmap</h2>
              <span>US market performance</span>
            </div>
            <TradingViewStockHeatmap />
          </section>
        </div>
        <DynamicOverviewSidebar assets={assets} transactions={transactions} />
      </div>
    </div>
  );
}

function loadCustomAssets() {
  try {
    const saved = JSON.parse(localStorage.getItem('wealth-custom-assets') || '[]');
    return Array.isArray(saved)
      ? saved.map((item) => ({ ...item, price: 'N/D', daily: null, monthly: null, source: null, asOf: null }))
      : [];
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
  const [pricesError, setPricesError] = useState('');

  useEffect(() => {
    let active = true;

    async function updatePrices() {
      try {
        const response = await fetch('/api/prices');
        const data = await response.json();
        if (!active) return;
        if (!response.ok || !Array.isArray(data.assets)) throw new Error(data.error || 'Feed prezzi non disponibile');
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
            daily: live.daily ?? null,
            monthly: live.monthly ?? null,
            currency: item.currency || live.currency || '',
            source: live.source,
            asOf: live.asOf || null,
          } : { ...item, price: 'N/D', daily: null, monthly: null, source: null, asOf: null };
        }));
        const updatedCustomAssets = customAssets.map((item) => {
          const live = liveBySymbol.get(item.symbol);
          return live ? {
            ...item,
            price: formatLivePrice(live.price, item.currency || live.currency),
            daily: live.daily ?? null,
            monthly: live.monthly ?? null,
            currency: item.currency || live.currency || '',
            source: live.source,
            asOf: live.asOf || null,
          } : { ...item, price: 'N/D', daily: null, monthly: null, source: null, asOf: null };
        });
        localStorage.setItem('wealth-custom-assets', JSON.stringify(updatedCustomAssets));
        setPricesUpdatedAt(data.updatedAt);
        setPricesError('');
      } catch {
        if (active) setPricesError('Aggiornamento API non riuscito');
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
      asOf: quote.asOf || null,
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
        {page !== 'markets' && <TradingViewTickerTape />}
        {page === 'markets' ? <MarketsOverviewPage assets={assets} transactions={transactions} pricesUpdatedAt={pricesUpdatedAt} pricesError={pricesError} /> : page === 'macro' ? <MacroOverview theme={theme} setTheme={setTheme} assets={assets} /> : page === 'watchlist' ? (
          <WatchlistOverview theme={theme} setTheme={setTheme} favorites={favorites} toggleFavorite={toggleFavorite} assets={assets} pricesUpdatedAt={pricesUpdatedAt} pricesError={pricesError} addAsset={addAsset} removeAsset={removeAsset} />
        ) : page === 'news' ? (
          <NewsOverview theme={theme} setTheme={setTheme} />
        ) : page === 'portfolio' ? (
          <PortfolioOverview theme={theme} setTheme={setTheme} assets={assets} transactions={transactions} addTransaction={addTransaction} removeTransaction={removeTransaction} pricesUpdatedAt={pricesUpdatedAt} />
        ) : page === 'analysis' ? (
          <AnalysisOverview theme={theme} setTheme={setTheme} assets={assets} favorites={favorites} transactions={transactions} addAsset={addAsset} />
        ) : null}

      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
