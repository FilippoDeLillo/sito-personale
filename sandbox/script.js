/* =====================================================================
   Gestionale — Demo interattiva
   Nessun backend: stato salvato in localStorage, isolato per browser.
   ===================================================================== */

const STORAGE_KEY = 'gestionale-demo-state-v1';
const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const euroDec = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const dateFmt = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });

/* --------------------------------- Tema --------------------------------- */
(function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('tema');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  if (theme === 'dark') root.setAttribute('data-theme', 'dark');
})();

/* ------------------------------- Dati seed -------------------------------- */
function seedState() {
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const monthsAgo = (n, day) => { const d = new Date(today.getFullYear(), today.getMonth() - n, day); return iso(d); };

  return {
    clients: [
      { id: 1, nome: 'Rossi Costruzioni Srl', email: 'info@rossicostruzioni.it', telefono: '0583 123 456', citta: 'Lucca' },
      { id: 2, nome: 'Bianchi & Figli', email: 'amministrazione@bianchiefigli.it', telefono: '050 987 654', citta: 'Pisa' },
      { id: 3, nome: 'Verdi Arredamenti', email: 'verdi.arredi@gmail.com', telefono: '0587 445 566', citta: 'Pontedera' },
      { id: 4, nome: 'Marina Caf\u00e8', email: 'marina.cafe@gmail.com', telefono: '0584 778 899', citta: 'Viareggio' },
      { id: 5, nome: 'Studio Legale Ferrari', email: 'segreteria@studioferrari.it', telefono: '0583 220 011', citta: 'Lucca' }
    ],
    invoices: [
      { id: 1, numero: '2026-101', clienteId: 1, importo: 2450, stato: 'pagata', data: monthsAgo(4, 3) },
      { id: 2, numero: '2026-108', clienteId: 2, importo: 980, stato: 'pagata', data: monthsAgo(3, 18) },
      { id: 3, numero: '2026-112', clienteId: 3, importo: 1620, stato: 'pagata', data: monthsAgo(3, 27) },
      { id: 4, numero: '2026-119', clienteId: 1, importo: 3100, stato: 'pagata', data: monthsAgo(2, 9) },
      { id: 5, numero: '2026-124', clienteId: 4, importo: 540, stato: 'pagata', data: monthsAgo(2, 21) },
      { id: 6, numero: '2026-131', clienteId: 5, importo: 1780, stato: 'pagata', data: monthsAgo(1, 5) },
      { id: 7, numero: '2026-136', clienteId: 2, importo: 2260, stato: 'pagata', data: monthsAgo(1, 19) },
      { id: 8, numero: '2026-140', clienteId: 3, importo: 890, stato: 'in attesa', data: monthsAgo(0, 4) },
      { id: 9, numero: '2026-141', clienteId: 4, importo: 3200, stato: 'in attesa', data: monthsAgo(0, 10) },
      { id: 10, numero: '2026-133', clienteId: 1, importo: 610, stato: 'scaduta', data: monthsAgo(1, 24) },
      { id: 11, numero: '2026-144', clienteId: 5, importo: 1450, stato: 'pagata', data: monthsAgo(0, 2) }
    ],
    products: [
      { id: 1, nome: 'Pannello isolante 60\u00d7100', categoria: 'Materiali edili', quantita: 42, soglia: 15, prezzo: 18.5 },
      { id: 2, nome: 'Vernice acrilica 5L', categoria: 'Finiture', quantita: 8, soglia: 10, prezzo: 34.9 },
      { id: 3, nome: 'Profilo alluminio 3m', categoria: 'Componenti', quantita: 120, soglia: 30, prezzo: 6.2 },
      { id: 4, nome: 'Adesivo strutturale', categoria: 'Materiali edili', quantita: 3, soglia: 12, prezzo: 12.0 },
      { id: 5, nome: 'Guarnizione EPDM', categoria: 'Componenti', quantita: 64, soglia: 20, prezzo: 2.4 }
    ],
    nextId: { client: 6, invoice: 12, product: 6 }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error('empty');
    return JSON.parse(raw);
  } catch {
    const fresh = seedState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

let state = loadState();
let currentView = 'dashboard';

/* -------------------------------- Toast ----------------------------------- */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* --------------------------------- Helpers --------------------------------- */
function clientName(id) {
  const c = state.clients.find(c => c.id === id);
  return c ? c.nome : '\u2014';
}
function statoBadgeClass(stato) {
  return { 'pagata': 'pagata', 'in attesa': 'in-attesa', 'scaduta': 'scaduta' }[stato] || '';
}
function svgEdit() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>'; }
function svgTrash() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7m2 0v13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20V7Z"/></svg>'; }

/* ================================ DASHBOARD ================================ */
function renderDashboard() {
  const paid = state.invoices.filter(i => i.stato === 'pagata');
  const pending = state.invoices.filter(i => i.stato === 'in attesa');
  const overdue = state.invoices.filter(i => i.stato === 'scaduta');

  const now = new Date();
  const thisMonthRevenue = paid
    .filter(i => { const d = new Date(i.data); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
    .reduce((s, i) => s + i.importo, 0);

  const pendingTotal = pending.reduce((s, i) => s + i.importo, 0);
  const lowStock = state.products.filter(p => p.quantita < p.soglia);

  // Last 6 months revenue (paid)
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleDateString('it-IT', { month: 'short' }), y: d.getFullYear(), m: d.getMonth() });
  }
  const monthTotals = months.map(mo => paid.filter(i => { const d = new Date(i.data); return d.getMonth() === mo.m && d.getFullYear() === mo.y; }).reduce((s, i) => s + i.importo, 0));
  const maxMonth = Math.max(...monthTotals, 1);

  const totalAmounts = { pagata: paid.reduce((s, i) => s + i.importo, 0), attesa: pendingTotal, scaduta: overdue.reduce((s, i) => s + i.importo, 0) };
  const totalAll = totalAmounts.pagata + totalAmounts.attesa + totalAmounts.scaduta || 1;
  const pPagata = (totalAmounts.pagata / totalAll) * 100;
  const pAttesa = (totalAmounts.attesa / totalAll) * 100;
  const donutStyle = `background: conic-gradient(var(--teal) 0 ${pPagata}%, var(--amber) ${pPagata}% ${pPagata + pAttesa}%, var(--danger) ${pPagata + pAttesa}% 100%);`;

  const recentInvoices = [...state.invoices].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);

  return `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Incassato questo mese</div>
        <div class="kpi-value">${euro.format(thisMonthRevenue)}</div>
        <div class="kpi-trend up">\u2191 fatture pagate</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">In attesa di pagamento</div>
        <div class="kpi-value">${euro.format(pendingTotal)}</div>
        <div class="kpi-trend warn">${pending.length} fattur${pending.length === 1 ? 'a' : 'e'}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Clienti attivi</div>
        <div class="kpi-value">${state.clients.length}</div>
        <div class="kpi-trend">totale in anagrafica</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Prodotti sotto scorta</div>
        <div class="kpi-value">${lowStock.length}</div>
        <div class="kpi-trend ${lowStock.length ? 'down' : 'up'}">${lowStock.length ? 'da riordinare' : 'tutto ok'}</div>
      </div>
    </div>

    <div class="dash-grid">
      <div class="panel">
        <h3>Fatturato incassato \u2014 ultimi 6 mesi</h3>
        <p class="panel-sub">Solo fatture segnate come pagate</p>
        <div class="bar-chart">
          ${months.map((mo, i) => `
            <div class="bar-col">
              <div class="bar ${i === months.length - 1 ? 'current' : ''}" style="height:${Math.max((monthTotals[i] / maxMonth) * 100, 4)}%" title="${euro.format(monthTotals[i])}"></div>
              <div class="bar-label">${mo.label}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="panel">
        <h3>Stato fatture</h3>
        <p class="panel-sub">Ripartizione per importo</p>
        <div class="donut-wrap">
          <div class="donut" style="${donutStyle}"></div>
          <div class="donut-legend">
            <div class="donut-legend-item"><span class="donut-dot" style="background:var(--teal)"></span>Pagate \u00b7 ${euro.format(totalAmounts.pagata)}</div>
            <div class="donut-legend-item"><span class="donut-dot" style="background:var(--amber)"></span>In attesa \u00b7 ${euro.format(totalAmounts.attesa)}</div>
            <div class="donut-legend-item"><span class="donut-dot" style="background:var(--danger)"></span>Scadute \u00b7 ${euro.format(totalAmounts.scaduta)}</div>
          </div>
        </div>
      </div>

      <div class="panel">
        <h3>Fatture recenti</h3>
        <p class="panel-sub">Le ultime 5 in ordine di data</p>
        <div class="mini-list">
          ${recentInvoices.map(inv => `
            <div class="mini-list-row">
              <div>
                <div class="name">${clientName(inv.clienteId)}</div>
                <div class="sub">${inv.numero} \u00b7 ${dateFmt(inv.data)}</div>
              </div>
              <span class="badge ${statoBadgeClass(inv.stato)}">${inv.stato}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="panel">
        <h3>Sotto scorta</h3>
        <p class="panel-sub">Prodotti da riordinare a magazzino</p>
        <div class="mini-list">
          ${lowStock.length ? lowStock.map(p => `
            <div class="mini-list-row">
              <div>
                <div class="name">${p.nome}</div>
                <div class="sub">${p.categoria}</div>
              </div>
              <span class="badge scorta-bassa">${p.quantita} pz</span>
            </div>`).join('') : `<p style="color:var(--muted);font-size:13.5px;padding:8px 0;">Nessun prodotto sotto la soglia minima.</p>`}
        </div>
      </div>
    </div>
  `;
}

/* ================================= CLIENTI ================================= */
function renderClienti() {
  if (!state.clients.length) return emptyState('Nessun cliente in anagrafica', 'Aggiungi il primo cliente con il pulsante in alto.');
  const rows = state.clients.map(c => {
    const fatturato = state.invoices.filter(i => i.clienteId === c.id && i.stato === 'pagata').reduce((s, i) => s + i.importo, 0);
    return `
      <tr>
        <td class="cell-strong">${c.nome}</td>
        <td class="cell-muted">${c.email}</td>
        <td class="mono cell-muted">${c.telefono}</td>
        <td class="cell-muted">${c.citta}</td>
        <td class="cell-strong">${euro.format(fatturato)}</td>
        <td>
          <div class="row-actions">
            <button onclick="openClientModal(${c.id})" aria-label="Modifica cliente">${svgEdit()}</button>
            <button class="danger" onclick="deleteEntity('client', ${c.id})" aria-label="Elimina cliente">${svgTrash()}</button>
          </div>
        </td>
      </tr>`;
  }).join('');
  return `
    <div class="table-panel"><div class="table-scroll">
      <table>
        <thead><tr><th>Cliente</th><th>Email</th><th>Telefono</th><th>Citt\u00e0</th><th>Fatturato</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div></div>`;
}

function openClientModal(id) {
  const editing = state.clients.find(c => c.id === id);
  openModal({
    title: editing ? 'Modifica cliente' : 'Nuovo cliente',
    fields: [
      { name: 'nome', label: 'Nome o ragione sociale', type: 'text', value: editing?.nome, required: true },
      { name: 'email', label: 'Email', type: 'email', value: editing?.email, required: true },
      { name: 'telefono', label: 'Telefono', type: 'text', value: editing?.telefono },
      { name: 'citta', label: 'Citt\u00e0', type: 'text', value: editing?.citta }
    ],
    onSubmit: (data) => {
      if (editing) {
        Object.assign(editing, data);
        showToast('Cliente aggiornato');
      } else {
        state.clients.push({ id: state.nextId.client++, ...data });
        showToast('Cliente aggiunto');
      }
      saveState();
      renderCurrentView();
    }
  });
}

/* ================================= FATTURE ================================= */
function renderFatture() {
  if (!state.invoices.length) return emptyState('Nessuna fattura registrata', 'Crea la prima fattura con il pulsante in alto.');
  const rows = [...state.invoices].sort((a, b) => b.data.localeCompare(a.data)).map(inv => `
    <tr>
      <td class="mono cell-strong">${inv.numero}</td>
      <td>${clientName(inv.clienteId)}</td>
      <td class="cell-muted">${dateFmt(inv.data)}</td>
      <td class="cell-strong">${euroDec.format(inv.importo)}</td>
      <td>
        <select class="status-select" onchange="updateInvoiceStatus(${inv.id}, this.value)">
          <option value="pagata" ${inv.stato === 'pagata' ? 'selected' : ''}>Pagata</option>
          <option value="in attesa" ${inv.stato === 'in attesa' ? 'selected' : ''}>In attesa</option>
          <option value="scaduta" ${inv.stato === 'scaduta' ? 'selected' : ''}>Scaduta</option>
        </select>
      </td>
      <td>
        <div class="row-actions">
          <button onclick="openInvoiceModal(${inv.id})" aria-label="Modifica fattura">${svgEdit()}</button>
          <button class="danger" onclick="deleteEntity('invoice', ${inv.id})" aria-label="Elimina fattura">${svgTrash()}</button>
        </div>
      </td>
    </tr>`).join('');
  return `
    <div class="table-panel"><div class="table-scroll">
      <table>
        <thead><tr><th>Numero</th><th>Cliente</th><th>Data</th><th>Importo</th><th>Stato</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div></div>`;
}

function updateInvoiceStatus(id, stato) {
  const inv = state.invoices.find(i => i.id === id);
  if (!inv) return;
  inv.stato = stato;
  saveState();
  showToast(`Fattura ${inv.numero} segnata come "${stato}"`);
  renderCurrentView();
}

function openInvoiceModal(id) {
  if (!state.clients.length) { showToast('Aggiungi prima un cliente'); return; }
  const editing = state.invoices.find(i => i.id === id);
  const clientOptions = state.clients.map(c => `<option value="${c.id}" ${editing?.clienteId === c.id ? 'selected' : ''}>${c.nome}</option>`).join('');
  openModal({
    title: editing ? 'Modifica fattura' : 'Nuova fattura',
    rawFieldsHtml: `
      <div class="field"><label for="f-numero">Numero fattura</label><input id="f-numero" name="numero" required value="${editing?.numero ?? nextInvoiceNumber()}"></div>
      <div class="field"><label for="f-cliente">Cliente</label><select id="f-cliente" name="clienteId" required>${clientOptions}</select></div>
      <div class="field-row">
        <div class="field"><label for="f-importo">Importo (\u20ac)</label><input id="f-importo" name="importo" type="number" min="0" step="0.01" required value="${editing?.importo ?? ''}"></div>
        <div class="field"><label for="f-data">Data</label><input id="f-data" name="data" type="date" required value="${editing?.data ?? new Date().toISOString().slice(0, 10)}"></div>
      </div>
    `,
    onSubmit: (data) => {
      const payload = { numero: data.numero, clienteId: Number(data.clienteId), importo: Number(data.importo), data: data.data };
      if (editing) {
        Object.assign(editing, payload);
        showToast('Fattura aggiornata');
      } else {
        state.invoices.push({ id: state.nextId.invoice++, stato: 'in attesa', ...payload });
        showToast('Fattura creata');
      }
      saveState();
      renderCurrentView();
    }
  });
}
function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  return `${year}-${String(100 + state.invoices.length + 1)}`;
}

/* ================================ MAGAZZINO ================================ */
function renderMagazzino() {
  if (!state.products.length) return emptyState('Nessun prodotto a magazzino', 'Aggiungi il primo prodotto con il pulsante in alto.');
  const rows = state.products.map(p => `
    <tr>
      <td class="cell-strong">${p.nome}</td>
      <td class="cell-muted">${p.categoria}</td>
      <td class="mono">${p.quantita} pz</td>
      <td class="cell-muted">${euroDec.format(p.prezzo)}</td>
      <td><span class="badge ${p.quantita < p.soglia ? 'scorta-bassa' : 'scorta-ok'}">${p.quantita < p.soglia ? 'sotto scorta' : 'disponibile'}</span></td>
      <td>
        <div class="row-actions">
          <button onclick="openProductModal(${p.id})" aria-label="Modifica prodotto">${svgEdit()}</button>
          <button class="danger" onclick="deleteEntity('product', ${p.id})" aria-label="Elimina prodotto">${svgTrash()}</button>
        </div>
      </td>
    </tr>`).join('');
  return `
    <div class="table-panel"><div class="table-scroll">
      <table>
        <thead><tr><th>Prodotto</th><th>Categoria</th><th>Quantit\u00e0</th><th>Prezzo</th><th>Stato</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div></div>`;
}

function openProductModal(id) {
  const editing = state.products.find(p => p.id === id);
  openModal({
    title: editing ? 'Modifica prodotto' : 'Nuovo prodotto',
    fields: [
      { name: 'nome', label: 'Nome prodotto', type: 'text', value: editing?.nome, required: true },
      { name: 'categoria', label: 'Categoria', type: 'text', value: editing?.categoria },
    ],
    rawFieldsHtml: `
      <div class="field"><label for="p-nome">Nome prodotto</label><input id="p-nome" name="nome" required value="${editing?.nome ?? ''}"></div>
      <div class="field"><label for="p-categoria">Categoria</label><input id="p-categoria" name="categoria" value="${editing?.categoria ?? ''}"></div>
      <div class="field-row">
        <div class="field"><label for="p-quantita">Quantit\u00e0</label><input id="p-quantita" name="quantita" type="number" min="0" required value="${editing?.quantita ?? ''}"></div>
        <div class="field"><label for="p-soglia">Soglia minima</label><input id="p-soglia" name="soglia" type="number" min="0" required value="${editing?.soglia ?? 10}"></div>
      </div>
      <div class="field"><label for="p-prezzo">Prezzo unitario (\u20ac)</label><input id="p-prezzo" name="prezzo" type="number" min="0" step="0.01" required value="${editing?.prezzo ?? ''}"></div>
    `,
    onSubmit: (data) => {
      const payload = { nome: data.nome, categoria: data.categoria, quantita: Number(data.quantita), soglia: Number(data.soglia), prezzo: Number(data.prezzo) };
      if (editing) {
        Object.assign(editing, payload);
        showToast('Prodotto aggiornato');
      } else {
        state.products.push({ id: state.nextId.product++, ...payload });
        showToast('Prodotto aggiunto');
      }
      saveState();
      renderCurrentView();
    }
  });
}

/* ================================ Generico ================================= */
function emptyState(title, sub) {
  return `<div class="empty-state">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>
    <h3 style="font-size:15px;margin-bottom:6px;">${title}</h3>
    <p style="font-size:13px;">${sub}</p>
  </div>`;
}

function deleteEntity(kind, id) {
  const map = { client: ['clients', 'cliente'], invoice: ['invoices', 'fattura'], product: ['products', 'prodotto'] };
  const [key, label] = map[kind];
  if (!confirm(`Eliminare questo ${label}? L'azione non pu\u00f2 essere annullata.`)) return;
  state[key] = state[key].filter(item => item.id !== id);
  if (kind === 'client') state.invoices = state.invoices.filter(i => i.clienteId !== id);
  saveState();
  showToast(`${label[0].toUpperCase() + label.slice(1)} eliminat${label === 'fattura' ? 'a' : 'o'}`);
  renderCurrentView();
}

/* --------------------------------- Modal ----------------------------------- */
const modalOverlay = document.getElementById('modal-overlay');
const modalForm = document.getElementById('modal-form');
const modalTitle = document.getElementById('modal-title');

function openModal({ title, fields, rawFieldsHtml, onSubmit }) {
  modalTitle.textContent = title;
  modalForm.innerHTML = (rawFieldsHtml || (fields || []).map(f => `
    <div class="field">
      <label for="mf-${f.name}">${f.label}</label>
      <input id="mf-${f.name}" name="${f.name}" type="${f.type || 'text'}" ${f.required ? 'required' : ''} value="${f.value ?? ''}">
    </div>`).join('')) + `<button type="submit" class="btn-primary">Salva</button>`;

  modalForm.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(modalForm).entries());
    onSubmit(data);
    closeModal();
  };
  modalOverlay.classList.add('open');
  setTimeout(() => modalForm.querySelector('input,select')?.focus(), 50);
}
function closeModal() { modalOverlay.classList.remove('open'); }
document.getElementById('modal-close').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* --------------------------------- Routing ---------------------------------- */
const viewMeta = {
  dashboard: { title: 'Dashboard', sub: "Panoramica generale dell'attivit\u00e0", action: null },
  clienti: { title: 'Clienti', sub: 'Anagrafica e fatturato per cliente', action: { label: 'Nuovo cliente', fn: () => openClientModal() } },
  fatture: { title: 'Fatture', sub: 'Emesse, in attesa e scadute', action: { label: 'Nuova fattura', fn: () => openInvoiceModal() } },
  magazzino: { title: 'Magazzino', sub: 'Giacenze e soglie di riordino', action: { label: 'Nuovo prodotto', fn: () => openProductModal() } }
};
const renderers = { dashboard: renderDashboard, clienti: renderClienti, fatture: renderFatture, magazzino: renderMagazzino };

function renderCurrentView() {
  const container = document.getElementById('view-container');
  container.innerHTML = `<div class="view active">${renderers[currentView]()}</div>`;
}

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
  const meta = viewMeta[view];
  document.getElementById('view-title').textContent = meta.title;
  document.getElementById('view-sub').textContent = meta.sub;
  const actionBtn = document.getElementById('topbar-action');
  if (meta.action) {
    actionBtn.style.display = '';
    document.getElementById('topbar-action-label').textContent = meta.action.label;
    actionBtn.onclick = meta.action.fn;
  } else {
    actionBtn.style.display = 'none';
  }
  renderCurrentView();
  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));

/* ------------------------------ Mobile sidebar ------------------------------- */
const sidebar = document.getElementById('sidebar');
const scrim = document.getElementById('mobile-scrim');
const menuToggle = document.getElementById('mobile-menu-toggle');
function openMobileSidebar() { sidebar.classList.add('open'); scrim.classList.add('open'); menuToggle.classList.add('open'); menuToggle.setAttribute('aria-expanded', 'true'); }
function closeMobileSidebar() { sidebar.classList.remove('open'); scrim.classList.remove('open'); menuToggle.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); }
menuToggle.addEventListener('click', () => sidebar.classList.contains('open') ? closeMobileSidebar() : openMobileSidebar());
scrim.addEventListener('click', closeMobileSidebar);

/* ---------------------------------- Tema ------------------------------------ */
document.getElementById('theme-toggle').addEventListener('click', () => {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark';
  if (isDark) { root.removeAttribute('data-theme'); localStorage.setItem('tema', 'light'); }
  else { root.setAttribute('data-theme', 'dark'); localStorage.setItem('tema', 'dark'); }
});

/* --------------------------------- Reset ------------------------------------- */
document.getElementById('reset-data').addEventListener('click', () => {
  if (!confirm('Ripristinare i dati demo di partenza? Le modifiche fatte finora andranno perse.')) return;
  state = seedState();
  saveState();
  switchView(currentView);
  showToast('Dati demo ripristinati');
});

/* ---------------------------------- Avvio ------------------------------------- */
switchView('dashboard');
