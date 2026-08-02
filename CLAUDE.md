# Mappa di questo repository

Frontend del **Gestionale RDO — IB Motion Definer**. Tutto sta in `index.html`:
un unico file da ~8200 righe con CSS, markup e JavaScript dentro. Non c'è build,
non ci sono dipendenze, non c'è framework.

**Questa mappa esiste per non dover ricercare ogni volta dove sta una cosa.**
I numeri di riga invecchiano: usali come indizio, ma per trovare un punto cerca
la **stringa fra virgolette**, che è il commento di sezione e non cambia.

---

## Dove sta il resto

| | |
|---|---|
| Backend (FastAPI) | `C:\Users\IB motion\OneDrive - IB motion srl\IBmotion-Dati - Condivisione\SERVER - Gestionale RDO\app` — **non è in git** |
| Database, venv, log | `C:\Dev\GestionaleRDO\` (`gestionale_rdo.db`, `.venv`, `backend.log`) |
| Test | `…\SERVER - Gestionale RDO\tests` — si lanciano dalla cartella del backend |
| Il backend gira come | attività pianificata `GestionaleRDO-Backend`, porta 8123 |

Il backend **serve anche questa cartella** (`StaticFiles` su `/`), quindi
`http://127.0.0.1:8123/` è la pagina e l'API sullo stesso indirizzo.

**`lab.html`** è la copia locale su cui si sperimenta: stesso file, service
worker disattivato, titolo con `[LAB]`. È in `.gitignore` — non va online finché
non la promuoviamo. Si apre da `/lab.html`.

---

## Scheletro di `index.html`

| righe | cosa |
|---|---|
| 12–1413 | CSS (tutto qui, tranne un piccolo blocco di stampa a ~5581) |
| 1414–1680 | markup delle **viste** |
| 1683–2060 | markup dei **modali** |
| 2061–8207 | JavaScript |

Le righe 2062–2081 sono l'avvio: registrazione service worker, `API`, `S` (lo
stato), le costanti.

---

## Le viste

Una per sezione, tutte già nel markup; il router accende quella giusta.

| id | sezione | render | markup |
|---|---|---|---|
| `v-home` | Home | — | 1446 |
| `v-proj` | Progetti (griglia) | `renderProgetti` · `"PROGETTI GRID"` | 1480 |
| `v-pdet` | **Progetto** (albero + drawer + impostazioni) | `openProgetto` · `renderTree` · `"PROGETTO DETAIL"` | 1490 |
| `v-rdo` | RDO | `"RDO VIEW"` | 1543 |
| `v-forn` | Fornitori | `renderForn` · `"FORNITORI — lista friendly"` | 1562 |
| `v-ore` | Raccolta ore | `"RACCOLTA ORE"` | 1585 |
| `v-mag` | Magazzino | `"MAGAZZINO"` | 1597 |
| `v-costi` | Costi | `"COSTI"` | 1609 |
| `v-avvisi` | Avvisi | `renderAvvisi` · `"AVVISI / NOTIFICHE"` | 1618 |
| `v-impostazioni` | Impostazioni | | 1631 |

**Router:** `go(vista, pid)` — accende `.view#v-<vista>` e la voce di menu
`.ni[data-v=…]`. Per aprire un progetto: `go('pdet', id)`.

---

## Le sezioni del JavaScript

Cerca la stringa, non la riga.

**Progetto — è qui che si lavora di più**

Tre tab: **Albero parti** (`viewAlbero`), **Ricerca file** (`viewFile`),
**Impostazioni progetto** (`viewImp`). `setView('albero'|'file'|'imp')` le
accende; dentro le impostazioni ci sono tre sotto-tab, `impTab('modifica'|
'fornitori'|'struttura')`. I dati del progetto e i fornitori del progetto NON
sono più modali: stanno lì (`salvaImpProgetto`, `caricaPref`/`renderPref`).
Il modale `mProg` serve solo a **creare** un progetto nuovo.

- `"PROGETTO DETAIL"` — `openProgetto()` carica albero, file, voci
- `"IMPOSTAZIONI PROGETTO"` — `renderImpostazioni` · `impTab` · `salvaImpProgetto`
- `"vista albero raggruppata per CATEGORIA PROGETTO"` — modalità «Categorie mie»
- `"FILTRI PER ATTRIBUTO"` — `fltBar`/`fltPassa`/`treeParti`, la barra sopra le righe
- `"«Trattamenti termici e superficiali»"` — `trattTree()`, blocco trasversale in
  fondo all'albero: gli stessi pezzi compaiono anche nella loro categoria
- `"SELEZIONE + FAB"` — `partClick` (Ctrl/Shift stile Windows), `ckGruppo`/`paintSel`
- `"PANNELLO «COSA MANCA»"` — `controlliInvio()` + `renderGlance()`: il pannello
  laterale non riepiloga più chi ha cosa, elenca gli ostacoli all'invio delle
  RDO. Per aggiungere un controllo basta una riga `add(...)` in `controlliInvio`
  (livello `blocca` o `guarda`, più l'azione che lo risolve).
- `apriConfronto(pid)` / `renderConfrontoPrezzi` — il confronto prezzi, uscito dal
  pannello, ora è il modale `mCmpPrezzi`. È l'**unico** modo di chiudere un
  confronto scegliendo il vincitore: `POST /api/parti/{id}/scegli/{fid}` cambia
  il fornitore primario, mentre scegliere un'offerta (`_applica_scelta` in
  `costi.py`) assegna un fornitore solo se il pezzo non ne ha ancora uno.
- `"albero commerciali: TIPO → gruppo fornitore → pezzi"`
- `"DRAWER DETTAGLIO PARTICOLARE"` — `openDraw(pid)`, la scheda del pezzo
- `"il percorso del pezzo: la catena di tappe"` — `caricaPercorso` · `renderPercorso`
- `"i trattamenti della commessa"` — `trattamentiBanner` · `renderTrattamenti`
- `"voci extra di commessa"` — `vociBanner` · `renderVoci` (variabile `VOCICOM`)
- `"la distinta: quale riga è la distinta stessa"` — `distintaBanner`
- `"nomi fornitore della distinta che non stanno in rubrica"` — `fornOrfaniBanner`
- `"revisioni che convivono nella stessa distinta"` — `calcRevCoesistenti`
- `"confronto affiancato fra due o più pezzi"` — `renderConfronto`
- `"MENU TASTO DESTRO"` — `ctxPart(e, pid)`
- `"DROPDOWN ASSEGNA"` — assegnazione fornitore e confronto prezzi
- `"MULTISELEZIONE A TRASCINAMENTO"`, `"SELEZIONE + FAB"`

**RDO e comunicazioni**

- `"RDO VIEW"` → `"livello 1: lista commesse"` → `"livello 2: workspace commessa"`
  → `"livello 3: editor RDO master-detail"`
- `"PREPARA RDO"` — composizione mail e allegati (`rdo_preview` lato server)
- `"filone comunicazioni RDO"` — la chat con il fornitore
- `"revisione RDO + blocco (inviata = immodificabile)"`
- `"pannello unico di spedizione"`

**Finestra in basso — Gantt e gerarchia** (`"FINESTRA IN BASSO"`, in fondo)

Sta **fuori da `.app`**, `position:fixed`, e si vede da ogni sezione tranne
Magazzino e Raccolta Ore (`SEZIONI_SENZA_DOCK`). Stato in `DOCK`, salvato in
`localStorage.rdo_dock`; quattro stati: `chiuso` / `aperto` / `ridotto` /
`pieno`. `dockApplica()` è l'unico posto che decide cosa si vede — va chiamata
da `go()` a ogni cambio sezione.

- `controlliInvio`-style: `dockCarica()` prende `/gantt` e `/gerarchia` insieme
- `dockDisegnaGantt()` — asse tempo, barre per pezzo o per fornitore
  (`DOCK.raggr`), filtri in `DOCK.flt`. **Le voci ausiliarie non si filtrano
  mai via**: `gtBarreVisibili` le lascia sempre passare.
- una barra senza fine prevista si disegna **tratteggiata e aperta**: la fine
  non si inventa (vedi `app/gantt.py`)
- `dockDisegnaAlbero()` / `grNodo()` — albero PDM, solo codici a disegno, con
  le righe di taglio dei grezzi. `grLeggi()` rilegge i PDF.

**Altro**

- `"MAGAZZINO"` → `"CATALOGO E GIACENZE"`, `"SCHEDA ARTICOLO"`, `"PRELIEVO (TABLET)"`, `"RIORDINO"`
- `"RACCOLTA ORE"` → `"TIMBRATURE"`, `"INSERIMENTO ORE"`, `"CALENDARIO PRESENZE"`, `"REPORT"`, `"IMPOSTAZIONI"`
- `"FORNITORI — lista friendly + scheda dettaglio"`, `"FORNITORE CRUD"`
- `"RICERCA FILE (ex Calderone)"`, `"ANTEPRIMA AL PASSAGGIO DEL MOUSE"`
- `"AVVISI / NOTIFICHE"` — `AV_ICO` mappa tipo → icona
- `"CHIP INPUT"` — `chipInit/chipVals/chipAdd`, i tag delle schede
- `"UTILS"` — in fondo

---

## Stato globale

`S` è lo stato della vista corrente (`"STATE"`, ~2081):

- `S.projId`, `S.albero` — commessa aperta e il suo albero
- `S.pmap` — `{id: parte}`, ricostruita a ogni `renderTree`
- `S.rows` — `Set` degli id selezionati; `S.ultimaRiga` per lo Shift+clic
- `S.sel`, `S.treeMode` (`'std'` | `'cat'`)
- `S.flt` — filtri per attributo; `S.openTratt`, `S.glanceCol`, `S.impTab`
- `S.revDup` / `S.revGrp` — revisioni che convivono
- Altri: `fornitori`, `commesse`, `NOTIF`, `PROP` (vocabolario), `PERC`
  (percorso aperto), `VOCICOM` (voci di commessa), `ORE`, `MAG`, `DD`/`RDO_MAIL`

---

## Convenzioni — rispettarle

**Scrivere testo nell'HTML:** sempre `esc(valore)`. Dentro una stringa JS in un
`onclick`: `jsq(valore)`. Non saltarlo mai, nemmeno su dati «nostri».

**Modali:** markup `.mov > .modal > .mhd/.mbd/.mft`, si aprono con `mOpen('mX')`
e si chiudono con `mClose('mX')`; `ovClose(event,'mX')` sul click fuori.

**Messaggi:** `toast(testo)` neutro, `toast(testo, true)` errore, `toast(testo,'ok')`
conferma. Per gli errori del server: `await srvErrDetail(r, 'fallback')` — dice
il motivo vero invece di «errore».

**Chiamate:** sempre `fetch(API + '/api/…')`. `API` si decide da solo
(riga ~2067): da GitHub Pages punta a `127.0.0.1:8123`, altrimenti a
`location.origin`. Si può forzare con `localStorage.rdo_api_base`.

**Aggiungere una striscia sopra l'albero:** scrivi una funzione che ritorna
HTML e concatenala in `renderTree`, dove c'è
`distintaBanner()+fornOrfaniBanner()+trattamentiBanner()+vociBanner()`.
Lo stile è `.dist-bar` (`.ok` = verde).

**Nomi già presi:** attenzione alle collisioni fra variabili globali — `VOCI` è
già usato dalle RDO, per questo le voci di commessa si chiamano `VOCICOM`.

**Chi può fare cosa:** il ruolo sta in `ORE.me.ruolo` (`utente` |
`amministratore`), caricato all'avvio da `loadUtente()`. Helper: `sonoAdmin()`.
Lato server il cancello è `richiedi_admin(utente_ore_corrente)`.

**Ridipingere la selezione:** `paintSel()`, non `renderTree()` — rifare l'albero
azzera lo scorrimento. `renderTree` chiama `paintSel` alla fine.

---

## Prima di pubblicare

1. **Controlla la sintassi**: estrai i blocchi `<script>` e passali a
   `node --check`. Un errore di sintassi rende la pagina bianca.
2. **Alza la cache**: `CACHE` in `sw.js` (`rdo-ibmotion-vNN` → `vNN+1`).
   Senza questo il browser continua a servire la versione vecchia.
3. `git add index.html sw.js` → commit → `git push origin main` (GitHub Pages).
4. Il backend va riavviato **solo** se hai toccato il backend. L'attività
   pianificata a volte lascia processi orfani: fermarla, terminare i `python.exe`
   di uvicorn, riavviarla.

---

## Come lavoriamo

Il committente è **Elia** (`tecnico@ibmotion.com`), che il mestiere lo conosce
molto meglio del programma. Quando corregge un'assunzione sul flusso di lavoro,
ha ragione lui: le sue correzioni hanno già cambiato il modello due volte in
meglio (il percorso che non deve duplicare l'assegnazione, il trattamento
compreso nel ciclo del carpentiere).

Un pezzo alla volta, con i suoi test, verificato **sui dati veri** della commessa
IB05.2025 prima di dire che funziona. Vedi le note in memoria:
`gestionale-rdo-modello-flusso-acquisti`, `gestionale-rdo-locations`.
