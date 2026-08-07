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
| `v-fav` | Forniture e avanzamento | `favEnter` · `"FORNITURE E AVANZAMENTO"` | dopo `v-rdo` |
| `v-gantt` | Gantt e gerarchia (a tutta pagina) | ospita il dock, `"FINESTRA IN BASSO"` | dopo `v-fav` |
| `v-forn` | Fornitori | `renderForn` · `"FORNITORI — lista friendly"` | 1562 |
| `v-ore` | Raccolta ore | `"RACCOLTA ORE"` | 1585 |
| `v-mag` | Magazzino | `"MAGAZZINO"` | 1597 |
| `v-costi` | Costi | `"COSTI"` | 1609 |
| `v-avvisi` | Avvisi | `renderAvvisi` · `"AVVISI / NOTIFICHE"` | 1618 |
| `v-impostazioni` | Impostazioni | | 1631 |

**Router:** `go(vista, pid)` — accende `.view#v-<vista>` e la voce di menu
`.ni[data-v=…]`. Per aprire un progetto: `go('pdet', id)`.

**La navigazione ricorda dove eri** (`NAV`, `"LA NAVIGAZIONE RICORDA DOVE ERI"`).
Regola di Elia: cambiare sezione non deve costare niente.

- `*Enter()` gira **una volta sola** per sezione (`NAV.viste`): rientrando, la
  vista non si ridisegna e quello che c'è nei campi resta lì. Se una sezione
  deve tornare a rifarsi perché i dati sono davvero cambiati, chi li cambia
  chiama `navScade('rdo', …)` — lo fa già `loadCommesse`.
- Lo stato interno (quale RDO, quale scheda del Magazzino, quale commessa) e la
  posizione di scorrimento stanno in `localStorage.rdo_nav`, e valgono 12 ore.
  Muovendosi **dentro** una sezione si chiama `navPunto()`.
- All'avvio `init()` fa `go(NAV.ultima)`, non `go('home')`.
- Attenzione al ramo `pdet` di `go()`: esce prima della riga che accende la
  vista, quindi la classe `.on` gliela deve dare qualcuno — normalmente
  `openProgetto`, che però riazzera selezione, filtri e rami aperti e per
  questo al rientro **non** si richiama.

**Menu a discesa:** `NAV_GRUPPI` raccoglie sotto la voce **Commessa** le quattro
schermate della stessa commessa (`proj`, `pdet`, `rdo`, `fav`, `gantt`).
`navGrp(g)` apre e chiude, `navSync(v)` tiene aperto il gruppo che contiene la
vista accesa. Cliccare l'intestazione **non naviga**.

---

## Le sezioni del JavaScript

Cerca la stringa, non la riga.

**Progetto — è qui che si lavora di più**

Due tab: **Albero parti** (`viewAlbero`) e **Ricerca file** (`viewFile`),
`setView('albero'|'file')`.

Le **Impostazioni progetto** non sono una tab: sono un cassetto (`#impdraw`,
stesso modo di `#pdraw`) che si apre dal pulsante in alto a destra con
`apriImp(tab)`. Dentro tre sotto-tab, `impTab('modifica'|'fornitori'|
'struttura')`. Ci vivono anche le quattro strisce (distinta, fornitori orfani,
trattamenti, voci) che prima stavano sopra le righe dell'albero: si disegnano
in `#impBanner`, non in `renderTree`. Il modale `mProg` serve solo a **creare**
un progetto nuovo.

In testata: `🚦 Cosa manca` · `✨ Auto-assegna` · `⚙️ Impostazioni`.

- `"PROGETTO DETAIL"` — `openProgetto()` carica albero, file, voci
- `"IMPOSTAZIONI PROGETTO"` — `renderImpProgetto` · `impTab` · `salvaImpProgetto`
  (**non** `renderImpostazioni`: quello è delle Impostazioni dell'applicazione)
- `S.pmap` si riempie con **tutti** i pezzi all'inizio di `renderTree`, non
  solo con le righe disegnate: le categorie nascono chiuse, e riempirlo dentro
  `partRow` faceva fallire in silenzio ogni `jumpPart`/`openDraw` da fuori.
  `apriRamiDi(p)` apre i rami che contengono il pezzo prima di scorrerci sopra.
- **Revisione di progetto sospesa**: `REV_ATTIVA=false` spegne solo l'ingresso
  in testata; modello, API, storico e diff sono tutti ancora lì.
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

**Forniture e avanzamento** (`"FORNITURE E AVANZAMENTO"`)

Stessi dati del Gantt (`/api/commesse/{id}/gantt`), letti come elenco di
consegne: raggruppati per fornitore, in ordine di data promessa. Stato in `FAV`.
`favGruppi()` fa i gruppi (fornitore · «IB Motion (in casa)» per interne e
incluse · «Pezzi senza percorso» in fondo); lo stato di una tappa si cambia da
qui con la **stessa** `PATCH /api/percorso/tappe/{id}` del cassetto del pezzo —
un solo modo di cambiare stato, così le notifiche alla tappa dopo partono
comunque. Dopo la PATCH si ricarica tutto: una tappa fatta sposta gli inizi
dedotti di quelle a valle.

**Finestra in basso — Gantt e gerarchia** (`"FINESTRA IN BASSO"`, in fondo)

Sta **fuori da `.app`**, `position:fixed`, e si vede da ogni sezione tranne
Magazzino e Raccolta Ore (`SEZIONI_SENZA_DOCK`). Stato in `DOCK`, salvato in
`localStorage.rdo_dock`; quattro stati: `chiuso` / `aperto` / `ridotto` /
`pieno`. `dockApplica()` è l'unico posto che decide cosa si vede — va chiamata
da `go()` a ogni cambio sezione.

Nella sezione **Gantt e gerarchia** (`v-gantt`) lo stesso pannello viene
**spostato** dentro `#gantSlot` da `dockAncora()` e prende la classe `.inpage`:
è l'elemento vero, non una copia — due Gantt vivi vorrebbero dire due volte gli
stessi id. Lì è sempre aperto, ma `DOCK.stato` **non** si tocca, altrimenti
uscendo la finestra resterebbe aperta dappertutto.

- `controlliInvio`-style: `dockCarica()` prende `/gantt` e `/gerarchia` insieme
- `dockDisegnaGantt()` — asse tempo, barre per pezzo o per fornitore
  (`DOCK.raggr`), filtri in `DOCK.flt`. **Le voci ausiliarie non si filtrano
  mai via**: `gtBarreVisibili` le lascia sempre passare.
- una barra senza fine prevista si disegna **tratteggiata e aperta**: la fine
  non si inventa (vedi `app/gantt.py`)
- `dockDisegnaAlbero()` / `grNodo()` — albero PDM, solo codici a disegno, con
  le righe di taglio dei grezzi. `grLeggi()` rilegge i PDF.

**Altro**

**Magazzino dentro la RDO** (`renderDdSmistamento`, scheda «Magazzino»)

Una riga per codice di bulloneria, raggruppate per categoria. Il materiale è la
variabile: la distinta ne chiede uno, a scaffale ce n'è un altro.

- Le opzioni arrivano **già pronte dal server** (`_opzioni_materiale` in
  `app/routers/rdo_distinte.py`): filtrate — le scatole vuote non si elencano,
  tranne quella di distinta e quella già scelta — etichettate e ordinate.
  `smOpzioni(r)` legge `r.opzioni` e basta: la regola sta in un posto solo.
- Quattro livelli, non tre: `uguale` · `su` (più resistente) · `giu` (un grado
  in meno) · **`altro`** (protezione diversa). Il quarto è il caso di un A4 dove
  la distinta dice `Brun. - Cl. 8`: contro la ruggine resiste di più, sotto
  carico un po' meno. Non è un grado in giù, e chiamarlo «meno resistente»
  portava a scartarlo quando andava benissimo.
- `smRegoleMenu` / `smApplicaRegola` — le quattro regole (`SM_REGOLE`), su tutta
  la RDO dalla barra o su una categoria dal suo titolo. Le regole vere stanno in
  `app/regole_materiale.py`, mai duplicate qui.
- `smApriRegistro` (modale `mSost`) — chi ha cambiato quale materiale, quando e
  quante. La distinta non si tocca mai, quindi è l'**unica** traccia.

- `"MAGAZZINO"` → `"CATALOGO E GIACENZE"`, `"SCHEDA ARTICOLO"`, `"PRELIEVO (TABLET)"`, `"RIORDINO"`
- `"RACCOLTA ORE"` → `"TIMBRATURE"`, `"INSERIMENTO ORE"`, `"CALENDARIO PRESENZE"`, `"REPORT"`, `"IMPOSTAZIONI"`
- `"FORNITORI — lista friendly + scheda dettaglio"`, `"FORNITORE CRUD"`
- `"RICERCA FILE (ex Calderone)"`, `"ANTEPRIMA AL PASSAGGIO DEL MOUSE"`
- `"AVVISI / NOTIFICHE"` — **due schede** (`AV_TAB`): *Note SolidWorks* sono le
  notifiche del server (`AV_ICO` mappa tipo → icona), *Note interne* sono le
  cose da comprare per l'officina, che non appartengono a nessuna commessa e
  quindi non sono RDO. `renderNoteInterne` fa l'elenco, `apriNotaInterna` +
  `renderNota` (modale `mNota`) la singola nota: quantità e prezzo si
  modificano lì, la foto si carica con `fotoRigaNota` e il PDF esce da
  `/api/note-interne/{id}/pdf`. I contenitori della bulloneria ci finiscono da
  soli quando nasce un articolo di magazzino (`app/contenitori.py`).
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

**TASTO DESTRO — regola di Elia, vale in tutto il gestionale.** Il menu del
browser non deve MAI comparire, da nessuna parte. Dove serve si apre un menu
nostro (`showCtx(e,titolo,voci)`); dove non serve non succede niente, ma quel
menu lì non si vede. Il divieto è già globale (listener `contextmenu` in
capture, in fondo al file): aggiungendo una vista nuova non c'è niente da fare
per il divieto, semmai c'è da **dare un menu** a quello che se lo merita.
Dentro i campi di testo il menu nostro c'è già (taglia/copia/incolla).

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
