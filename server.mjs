import express from 'express';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnv() {
  const envPath = resolve('.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) process.env[match[1].trim()] = match[2].trim();
  }
}

loadEnv();

const app = express();
const port = Number(process.env.PORT || 3001);
const PRICE_CACHE_MS = 15 * 60 * 1000;
const HISTORY_CACHE_MS = 6 * 60 * 60 * 1000;
const ITALY_INFLATION_CACHE_MS = 60 * 60 * 1000;

const instruments = [
  { symbol: 'SPX', twelve: 'SPX', yahoo: '^GSPC' },
  { symbol: 'NDX', twelve: 'NDX', yahoo: '^NDX' },
  { symbol: 'SX5E', twelve: 'SX5E', yahoo: '^STOXX50E' },
  { symbol: 'FTSEMIB', twelve: 'FTSEMIB', yahoo: 'FTSEMIB.MI' },
  { symbol: 'MSCIWORLD', yahoo: 'URTH' },
  { symbol: 'EUR/USD', twelve: 'EUR/USD', yahoo: 'EURUSD=X' },
  { symbol: 'USD/JPY', twelve: 'USD/JPY', yahoo: 'JPY=X' },
  { symbol: 'GOLD', twelve: 'XAU/USD', yahoo: 'GC=F' },
  { symbol: 'COPPER', twelve: 'HG', yahoo: 'HG=F' },
  { symbol: 'BRENT', yahoo: 'BZ=F' },
  { symbol: 'BTC', yahoo: 'BTC-USD' },
  { symbol: 'VIX', yahoo: '^VIX' },
  { symbol: 'VVIX', yahoo: '^VVIX' },
  { symbol: 'VSTOXX', yahoo: '^V2TX' },
  { symbol: 'MOVE', yahoo: '^MOVE' },
  { symbol: 'BTP10Y', yahoo: '^IT10Y' },
  { symbol: 'BTP2Y', yahoo: '^IT2Y' },
  { symbol: 'BUND10Y', yahoo: '^DE10Y' },
  { symbol: 'UST10Y', yahoo: '^TNX', scale: 0.1 },
  { symbol: 'UST2Y', yahoo: '^UST2Y' },
  { symbol: 'UST30Y', yahoo: '^TYX', scale: 0.1 },
  { symbol: 'BTP-BUND' },
  { symbol: 'USHY', yahoo: 'BAMLH0A0HYM2' },
  { symbol: 'EUHY' },
  { symbol: 'DXY', yahoo: 'DX-Y.NYB' },
  { symbol: 'GBP/USD', yahoo: 'GBPUSD=X' },
  { symbol: 'SILVER', yahoo: 'SI=F' },
  { symbol: 'WTI', yahoo: 'CL=F' },
  { symbol: 'ETH', yahoo: 'ETH-USD' },
];

let priceCache = { updatedAt: null, expiresAt: 0, assets: [] };
const customQuoteCache = new Map();
const assetSearchCache = new Map();
const historyCache = new Map();
let newsCache = { updatedAt: null, articles: [] };
let italyInflationCache = { expiresAt: 0, value: null };

const round = (value) => Math.round(value * 100) / 100;
const NEWS_TIME_ZONE = 'Europe/Rome';

const newsImpactSignals = [
  [/\b(central bank|federal reserve|the fed|ecb|bce|bank of england|boj|rate decision|interest rates?)\b/i, 12],
  [/\b(inflation|cpi|ppi|jobs report|payrolls|unemployment|gdp|recession)\b/i, 10],
  [/\b(tariffs?|trade war|sanctions?|war|conflict|ceasefire|peace talks?|iran|middle east|oil shock|energy crisis)\b/i, 9],
  [/\b(market crash|sell-?off|rally|record high|bear market|bull market|volatility)\b/i, 8],
  [/\b(bonds?|treasur(?:y|ies)|yields?|stocks?|equities|wall street|markets?|oil|gold|bitcoin|currency|dollar|euro)\b/i, 5],
  [/\b(earnings|merger|acquisition|ipo|bankruptcy|default|credit rating)\b/i, 4],
];

const sourceAuthority = [
  [/\b(reuters|bloomberg|financial times|wall street journal|associated press|cnbc)\b/i, 8],
  [/\b(bbc|guardian|new york times|washington post|economist|marketwatch|fortune)\b/i, 5],
];

function dateKey(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: NEWS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function financialImportance(article, originalIndex) {
  const text = `${article.title || ''} ${article.description || ''}`;
  const source = article.source?.name || '';
  const publishedAt = new Date(article.publishedAt);
  let score = Math.max(0, 5 - originalIndex) * 0.5;

  for (const [pattern, weight] of newsImpactSignals) {
    if (pattern.test(text)) score += weight;
  }
  for (const [pattern, weight] of sourceAuthority) {
    if (pattern.test(source)) score += weight;
  }
  if (/\b(pr newswire|business wire|globe newswire)\b/i.test(source)) score -= 12;

  if (Number.isFinite(publishedAt.getTime())) {
    if (dateKey(publishedAt) === dateKey(new Date())) score += 15;
    const ageHours = (Date.now() - publishedAt.getTime()) / 36e5;
    score += Math.max(0, 6 - ageHours / 4);
  }

  return score;
}

function rankFinancialNews(articles) {
  const uniqueArticles = articles.filter((article, index, all) => {
    const normalizedTitle = (article.title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    return all.findIndex((candidate) => (
      (candidate.title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() === normalizedTitle
    )) === index;
  });

  return uniqueArticles
    .map((article, index) => ({ article, index, score: financialImportance(article, index) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ article }) => article);
}

function calculateChanges(values) {
  const valid = values.filter(Number.isFinite);
  if (valid.length < 2) return { price: valid.at(-1), daily: null, monthly: null };
  const price = valid.at(-1);
  const previous = valid.at(-2);
  const monthStart = valid[0];
  return {
    price,
    daily: previous ? round(((price - previous) / previous) * 100) : null,
    monthly: monthStart ? round(((price - monthStart) / monthStart) * 100) : null,
  };
}

const normalizeText = (value) => String(value || '')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const parseDecimal = (value) => Number(String(value).replace(',', '.'));

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`Fonte non disponibile (${response.status})`);
  return response.text();
}

async function fetchItalyCurrentInflation() {
  const url = 'https://www.istat.it/en/tag/inflation/';
  const text = normalizeText(await fetchText(url));
  const match = text.match(/In ([A-Za-z]+ \d{4}) the CPI \+([\d.,]+)% compared with the previous month and \+([\d.,]+)% year-over-year/i);
  if (!match) throw new Error('Dato ISTAT non trovato');
  return {
    label: 'Inflazione corrente',
    value: parseDecimal(match[3]),
    period: match[1],
    note: `CPI Italia, ${match[1]}`,
    source: 'ISTAT',
    url,
  };
}

async function fetchItalyExpectedInflation() {
  const url = 'https://tradingeconomics.com/italy/inflation-cpi';
  const text = normalizeText(await fetchText(url));
  const match = text.match(/Inflation Rate in Italy is expected to be ([\d.]+) percent by the end of this quarter/i);
  if (!match) throw new Error('Previsione Trading Economics non trovata');
  return {
    label: 'Inflazione attesa',
    value: parseDecimal(match[1]),
    period: 'fine trimestre',
    note: 'Forecast fine trimestre',
    source: 'Trading Economics',
    url,
  };
}

function parseInvestingBondPage(html, fallback) {
  const text = normalizeText(html);
  const compact = String(html || '').replace(/\s+/g, ' ');
  const prevClose = compact.match(/data-test="prevClose"[^>]*>.*?<span>([\d.,]+)<\/span>/i)?.[1]
    || text.match(/Prev\. Close\s+([\d.,]+)/i)?.[1];
  const coupon = text.match(/Coupon\s+([\d.,]+)/i)?.[1] || fallback.coupon;
  const maturity = text.match(/Maturity Date\s+([A-Za-z]{3,9} \d{1,2}, \d{4})/i)?.[1] || fallback.maturity;
  return {
    ...fallback,
    price: parseDecimal(prevClose),
    coupon: parseDecimal(coupon),
    maturity,
  };
}

async function fetchInvestingBondName(isin) {
  const url = `https://www.investing.com/rates-bonds/${isin.toLowerCase()}`;
  const html = await fetchText(url);
  const title = String(html).match(/<title[^>]*>(.*?)<\/title>/i)?.[1] || '';
  const cleaned = title
    .replace(/\s*-\s*Investing\.com\s*$/i, '')
    .replace(/\s+Bond Yield\s*$/i, '')
    .trim();
  return cleaned && !cleaned.toUpperCase().includes(isin.toUpperCase()) ? { name: cleaned, url } : null;
}

async function fetchBorsaItalianaBondName(isin) {
  if (!isin.toUpperCase().startsWith('IT')) return null;
  const url = `https://www.borsaitaliana.it/borsa/obbligazioni/mot/btp/scheda/${isin.toUpperCase()}-MOTX.html?lang=it`;
  const html = await fetchText(url);
  const title = String(html).match(/<title[^>]*>(.*?)<\/title>/i)?.[1] || '';
  const cleaned = title
    .replace(/\s+quotazioni in tempo reale.*$/i, '')
    .replace(/\s*\|\s*.*$/i, '')
    .trim();
  return cleaned && !cleaned.toUpperCase().includes(isin.toUpperCase()) ? { name: cleaned, url } : null;
}

async function enrichIsinSearchResults(query, results) {
  if (!/^[A-Z]{2}[A-Z0-9]{10}$/i.test(query)) return results;
  const normalizedQuery = query.toUpperCase();
  const needsName = results.some((item) => (
    item.symbol?.toUpperCase().includes(normalizedQuery)
    && (!item.name || item.name.toUpperCase() === item.symbol.toUpperCase() || item.name.toUpperCase().includes(normalizedQuery))
  ));
  if (!needsName) return results;

  const bondInfo = await fetchBorsaItalianaBondName(normalizedQuery).catch(() => null)
    || await fetchInvestingBondName(normalizedQuery).catch(() => null);
  if (!bondInfo) return results;
  return results.map((item) => item.symbol?.toUpperCase().includes(normalizedQuery)
    ? { ...item, name: bondInfo.name, quoteType: 'BOND', exchange: item.exchange || 'Investing.com' }
    : item);
}

function yearsBetween(startDate, endDate) {
  return Math.max(0, (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function priceFromYield({ coupon, maturityYears, face = 100 }, annualYield) {
  const periods = Math.max(1, Math.round(maturityYears * 2));
  const periodCoupon = (face * coupon / 100) / 2;
  const periodYield = annualYield / 2;
  let price = 0;
  for (let period = 1; period <= periods; period += 1) {
    price += periodCoupon / ((1 + periodYield) ** period);
  }
  price += face / ((1 + periodYield) ** periods);
  return price;
}

function yieldToMaturity({ price, coupon, maturity }) {
  if (!Number.isFinite(price) || !Number.isFinite(coupon)) return null;
  const maturityYears = yearsBetween(new Date(), new Date(maturity));
  if (!Number.isFinite(maturityYears) || maturityYears <= 0.25) return null;
  let low = -0.05;
  let high = 0.15;
  for (let index = 0; index < 80; index += 1) {
    const mid = (low + high) / 2;
    const estimatedPrice = priceFromYield({ coupon, maturityYears }, mid);
    if (estimatedPrice > price) low = mid;
    else high = mid;
  }
  return round(((low + high) / 2) * 100);
}

async function fetchItalyMarketInflation() {
  const realUrl = 'https://www.investing.com/rates-bonds/it0005648255';
  const nominalUrl = 'https://www.investing.com/rates-bonds/it0005668220';
  const [realHtml, nominalHtml] = await Promise.all([fetchText(realUrl), fetchText(nominalUrl)]);
  const realBond = parseInvestingBondPage(realHtml, {
    name: 'BTP Italia 1,85% 04/06/2032',
    coupon: 1.85,
    maturity: 'Jun 04, 2032',
  });
  const nominalBond = parseInvestingBondPage(nominalHtml, {
    name: 'BTP nominale 3,25% 15/11/2032',
    coupon: 3.25,
    maturity: 'Nov 15, 2032',
  });
  const realYield = yieldToMaturity(realBond);
  const nominalYield = yieldToMaturity(nominalBond);
  if (!Number.isFinite(realYield) || !Number.isFinite(nominalYield)) throw new Error('Rendimenti BTP non calcolabili');
  const value = round(nominalYield - realYield);
  return {
    label: 'Inflazione prezzata',
    value,
    period: '2032',
    note: `${nominalYield}% nominale - ${realYield}% reale`,
    source: 'Investing.com',
    url: realUrl,
    available: true,
    components: { nominalBond, realBond, nominalYield, realYield },
  };
}

async function fetchItalyInflationFocus() {
  const [current, expected, market] = await Promise.all([
    fetchItalyCurrentInflation().catch((error) => ({ label: 'Inflazione corrente', value: null, note: error.message, source: 'ISTAT', url: 'https://www.istat.it/en/tag/inflation/', available: false })),
    fetchItalyExpectedInflation().catch((error) => ({ label: 'Inflazione attesa', value: null, note: error.message, source: 'Trading Economics', url: 'https://tradingeconomics.com/italy/inflation-cpi', available: false })),
    fetchItalyMarketInflation().catch((error) => ({ label: 'Inflazione prezzata', value: null, note: error.message, source: 'Breakeven BTP', available: false })),
  ]);

  return {
    updatedAt: new Date().toISOString(),
    items: [
      { available: Number.isFinite(current.value), ...current },
      { available: Number.isFinite(expected.value), ...expected },
      market,
    ],
    method: {
      title: 'Breakeven inflation italiana',
      formula: 'Rendimento lordo a scadenza del BTP nominale 2032 - rendimento reale stimato del BTP Italia 2032.',
      improvement: 'Questa e una proxy di mercato, non una previsione pura: incorpora premi di liquidita, rischio Italia, differenza di scadenza e caratteristiche del BTP Italia. Per una misura istituzionale euro area sarebbe preferibile una curva inflation swap; per inflazione italiana FOI il confronto BTP nominale/BTP Italia e piu coerente ma piu rumoroso.',
    },
  };
}

async function fetchYahoo(instrument) {
  if (!instrument.yahoo) return null;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(instrument.yahoo)}?range=1mo&interval=1d`;
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!response.ok) return null;
  const json = await response.json();
  const chart = json.chart?.result?.[0];
  const closes = chart?.indicators?.quote?.[0]?.close || [];
  const current = calculateChanges(closes);
  if (!Number.isFinite(current.price)) return null;
  return { ...current, price: current.price * (instrument.scale || 1), currency: chart?.meta?.currency || '', source: 'Yahoo Finance' };
}

async function fetchYahooHistory(symbol, years) {
  const instrument = instruments.find((item) => item.symbol === symbol);
  const yahooSymbol = instrument?.yahoo || symbol;
  const end = Math.floor(Date.now() / 1000);
  const start = end - years * 365 * 24 * 60 * 60;
  const params = new URLSearchParams({ period1: String(start), period2: String(end), interval: '1d', events: 'history' });
  const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?${params}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!response.ok) return null;
  const chart = (await response.json()).chart?.result?.[0];
  const timestamps = chart?.timestamp || [];
  const closes = chart?.indicators?.adjclose?.[0]?.adjclose || chart?.indicators?.quote?.[0]?.close || [];
  const points = timestamps.map((timestamp, index) => ({
    date: new Date(timestamp * 1000).toISOString().slice(0, 10),
    close: closes[index],
  })).filter((point) => Number.isFinite(point.close));
  return points.length > 1 ? { symbol, yahooSymbol, points } : null;
}

async function fetchTwelve(instrument) {
  if (!instrument.twelve || !process.env.TWELVE_DATA_API_KEY) return null;
  const params = new URLSearchParams({
    symbol: instrument.twelve,
    interval: '1day',
    outputsize: '24',
    apikey: process.env.TWELVE_DATA_API_KEY,
  });
  const response = await fetch(`https://api.twelvedata.com/time_series?${params}`);
  if (!response.ok) return null;
  const json = await response.json();
  if (!Array.isArray(json.values)) return null;
  const current = calculateChanges(json.values.map((item) => Number(item.close)).reverse());
  return Number.isFinite(current.price) ? { ...current, source: 'Twelve Data' } : null;
}

async function fetchPrices() {
  const assets = [];
  let twelveCalls = 0;
  for (const instrument of instruments) {
    let result = await fetchYahoo(instrument).catch(() => null);
    if (!result && instrument.twelve && twelveCalls < 8) {
      twelveCalls += 1;
      result = await fetchTwelve(instrument).catch(() => null);
    }
    if (result) assets.push({ symbol: instrument.symbol, ...result });
  }
  return assets;
}

app.get('/api/prices', async (req, res) => {
  try {
    if (req.query.refresh !== '1' && priceCache.expiresAt > Date.now()) return res.json(priceCache);
    const assets = await fetchPrices();
    priceCache = { updatedAt: new Date().toISOString(), expiresAt: Date.now() + PRICE_CACHE_MS, assets };
    res.json(priceCache);
  } catch (error) {
    res.status(502).json({ error: 'Impossibile aggiornare i prezzi', details: error.message, ...priceCache });
  }
});

app.get('/api/assets/search', async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (query.length < 2) return res.json({ results: [] });
  try {
    const cacheKey = query.toLowerCase();
    const cached = assetSearchCache.get(cacheKey);
    if (cached?.expiresAt > Date.now()) return res.json(cached.value);
    const params = new URLSearchParams({ q: query, quotesCount: '8', newsCount: '0' });
    const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?${params}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const json = await response.json();
    if (!response.ok) throw new Error('Ricerca Yahoo Finance non disponibile');
    let results = (json.quotes || [])
      .filter((item) => item.symbol && item.quoteType !== 'OPTION')
      .map((item) => ({
        symbol: item.symbol,
        name: item.longname || item.shortname || item.symbol,
        quoteType: item.quoteType,
        exchange: item.exchDisp || item.exchange || '',
      }));
    results = await enrichIsinSearchResults(query, results);

    if (!results.length && process.env.TWELVE_DATA_API_KEY) {
      const twelveParams = new URLSearchParams({ symbol: query, apikey: process.env.TWELVE_DATA_API_KEY });
      const twelveResponse = await fetch(`https://api.twelvedata.com/symbol_search?${twelveParams}`);
      const twelveJson = await twelveResponse.json();
      if (twelveResponse.ok && Array.isArray(twelveJson.data)) {
        results = twelveJson.data.slice(0, 8).map((item) => ({
          symbol: item.symbol,
          name: item.instrument_name || item.symbol,
          quoteType: item.instrument_type || 'EQUITY',
          exchange: item.exchange || item.country || '',
        }));
      }
    }

    const value = { results };
    assetSearchCache.set(cacheKey, { expiresAt: Date.now() + PRICE_CACHE_MS, value });
    res.json(value);
  } catch (error) {
    res.status(502).json({ error: 'Impossibile cercare gli asset', details: error.message, results: [] });
  }
});

app.get('/api/assets/quote', async (req, res) => {
  const symbol = String(req.query.symbol || '').trim();
  if (!symbol) return res.status(400).json({ error: 'Simbolo mancante' });
  try {
    const cached = customQuoteCache.get(symbol);
    if (cached?.expiresAt > Date.now()) return res.json(cached.value);
    let result = await fetchYahoo({ yahoo: symbol }).catch(() => null);
    if (!result && process.env.TWELVE_DATA_API_KEY) {
      result = await fetchTwelve({ twelve: symbol }).catch(() => null);
    }
    if (!result) throw new Error('Quotazione non disponibile');
    const value = { symbol, ...result };
    customQuoteCache.set(symbol, { expiresAt: Date.now() + PRICE_CACHE_MS, value });
    res.json(value);
  } catch (error) {
    res.status(502).json({ error: 'Impossibile recuperare la quotazione', details: error.message });
  }
});

app.get('/api/history', async (req, res) => {
  const symbols = [...new Set(String(req.query.symbols || '').split(',').map((symbol) => symbol.trim()).filter(Boolean))].slice(0, 8);
  const years = Math.min(10, Math.max(1, Number(req.query.years) || 3));
  if (!symbols.length) return res.json({ updatedAt: new Date().toISOString(), years, series: [] });
  try {
    const series = (await Promise.all(symbols.map(async (symbol) => {
      const cacheKey = `${symbol}:${years}`;
      const cached = historyCache.get(cacheKey);
      if (cached?.expiresAt > Date.now()) return cached.value;
      const value = await fetchYahooHistory(symbol, years);
      if (value) historyCache.set(cacheKey, { expiresAt: Date.now() + HISTORY_CACHE_MS, value });
      return value;
    }))).filter(Boolean);
    res.json({ updatedAt: new Date().toISOString(), years, series });
  } catch (error) {
    res.status(502).json({ error: 'Impossibile recuperare le serie storiche', details: error.message, series: [] });
  }
});

app.get('/api/italy-inflation', async (req, res) => {
  try {
    if (req.query.refresh !== '1' && italyInflationCache.expiresAt > Date.now()) return res.json(italyInflationCache.value);
    const value = await fetchItalyInflationFocus();
    italyInflationCache = { expiresAt: Date.now() + ITALY_INFLATION_CACHE_MS, value };
    res.json(value);
  } catch (error) {
    res.status(502).json({ error: 'Impossibile aggiornare il focus inflazione Italia', details: error.message });
  }
});

async function refreshNewsCache() {
  if (!process.env.GNEWS_API_KEY) throw new Error('Chiave GNews non configurata');
  const params = new URLSearchParams({
    q: '(markets OR economy OR inflation OR "central bank" OR stocks OR bonds OR oil)',
    lang: 'en',
    max: '10',
    sortby: 'publishedAt',
    apikey: process.env.GNEWS_API_KEY,
  });
  const response = await fetch(`https://gnews.io/api/v4/search?${params}`);
  const json = await response.json();
  if (!response.ok || !Array.isArray(json.articles)) throw new Error(json.errors?.join(', ') || 'Risposta GNews non valida');
  const rankedArticles = rankFinancialNews(json.articles);
  newsCache = {
    updatedAt: new Date().toISOString(),
    articles: rankedArticles.map((article) => ({
      title: article.title,
      summary: article.description,
      url: article.url,
      image: article.image,
      publishedAt: article.publishedAt,
      source: article.source?.name || 'GNews',
    })),
  };
  return newsCache;
}

app.get('/api/news', async (req, res) => {
  try {
    const cacheIsCurrent = newsCache.updatedAt && dateKey(new Date(newsCache.updatedAt)) === dateKey(new Date());
    res.json(cacheIsCurrent ? newsCache : await refreshNewsCache());
  } catch (error) {
    res.status(502).json({ error: 'Impossibile aggiornare le news', details: error.message, ...newsCache });
  }
});

app.post('/api/news/refresh', async (req, res) => {
  try {
    res.json(await refreshNewsCache());
  } catch (error) {
    res.status(502).json({ error: 'Impossibile aggiornare le news', details: error.message, ...newsCache });
  }
});

app.use(express.static(resolve('dist')));
app.get('*path', (req, res) => res.sendFile(resolve('dist/index.html')));

export { app };

if (resolve(process.argv[1] || '').endsWith('server.mjs')) {
  app.listen(port, '127.0.0.1', () => {
    console.log(`Wealth dashboard API disponibile su http://127.0.0.1:${port}`);
  });
}
