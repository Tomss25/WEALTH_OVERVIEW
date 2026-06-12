# Wealth Dashboard

Dashboard React/Vite con quotazioni, ricerca asset e news finanziarie.

## Sviluppo locale

Avvia API e frontend in due terminali:

```powershell
npm run api
npm run dev
```

## Deploy su Netlify

1. Pubblica questo progetto in un repository GitHub.
2. In Netlify seleziona **Add new project > Import an existing project** e collega il repository.
3. Netlify leggerà automaticamente `netlify.toml`:
   - build command: `npm run build`
   - publish directory: `dist`
   - functions directory: `netlify/functions`
4. In **Site configuration > Environment variables**, aggiungi:
   - `GNEWS_API_KEY`
   - `TWELVE_DATA_API_KEY`
5. Avvia il deploy.

Non caricare il file `.env` su GitHub: è già escluso tramite `.gitignore`.

Gli asset aggiunti e i preferiti sono salvati nel `localStorage` del browser. Restano disponibili sullo stesso browser e dispositivo finché non vengono rimossi o vengono cancellati i dati del sito.
