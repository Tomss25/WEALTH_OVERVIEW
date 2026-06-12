import express from 'express';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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
let newsCache = { updatedAt: null, articles: [] };

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
    let result = null;
    if (instrument.twelve && twelveCalls < 8) {
      twelveCalls += 1;
      result = await fetchTwelve(instrument).catch(() => null);
    }
    if (!result) result = await fetchYahoo(instrument).catch(() => null);
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
    const params = new URLSearchParams({ q: query, quotesCount: '8', newsCount: '0' });
    const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?${params}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const json = await response.json();
    if (!response.ok) throw new Error('Ricerca Yahoo Finance non disponibile');
    const results = (json.quotes || [])
      .filter((item) => item.symbol && item.quoteType !== 'OPTION')
      .map((item) => ({
        symbol: item.symbol,
        name: item.longname || item.shortname || item.symbol,
        quoteType: item.quoteType,
        exchange: item.exchDisp || item.exchange || '',
      }));
    res.json({ results });
  } catch (error) {
    res.status(502).json({ error: 'Impossibile cercare gli asset', details: error.message, results: [] });
  }
});

app.get('/api/assets/quote', async (req, res) => {
  const symbol = String(req.query.symbol || '').trim();
  if (!symbol) return res.status(400).json({ error: 'Simbolo mancante' });
  try {
    const result = await fetchYahoo({ yahoo: symbol });
    if (!result) throw new Error('Quotazione non disponibile');
    res.json({ symbol, ...result });
  } catch (error) {
    res.status(502).json({ error: 'Impossibile recuperare la quotazione', details: error.message });
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

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] || '')) {
  app.listen(port, '127.0.0.1', () => {
    console.log(`Wealth dashboard API disponibile su http://127.0.0.1:${port}`);
  });
}
