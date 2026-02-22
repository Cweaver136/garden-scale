import { LitElement, html, css } from 'lit';
import { map } from 'lit/directives/map.js';
import { firebase } from '../../../../firebaseConfig.js';
import { DateTime } from 'luxon';
import './batch-dialog.js';
import './expense-dialog.js';

class PoultryTracking extends LitElement {

  static properties = {
    _batches: { type: Array, state: true },
    _loading: { type: Boolean, state: true },
    _dialogOpen: { type: Boolean, state: true },
    _editingBatch: { type: Object, state: true },    // null = create mode, batch = edit mode
    _showArchived: { type: Boolean, state: true },   // false = active tab, true = archived tab
    _expensesDialogOpen: { type: Boolean, state: true },
    _expensesBatch: { type: Object, state: true },   // batch whose expenses are open
  }

  static styles = css`
    /* Icon font — must be declared inside each shadow root */
    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 20px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
    }

    :host {
      display: block;
      height: 100%;
    }

    .page-header {
      padding: 28px 32px 0;
    }

    .header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 12px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: #2C3E2F;
    }

    .page-header p {
      margin: 6px 0 0 0;
      font-size: 14px;
      color: #6B8070;
    }

    .btn-new-batch {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 9px 18px;
      background-color: #3E6B48;
      color: #FFFFFF;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      font-family: 'Roboto', sans-serif;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: background-color 0.2s;
    }

    .btn-new-batch:hover {
      background-color: #345A3D;
    }

    .btn-new-batch .material-symbols-outlined {
      font-size: 18px;
    }

    /* ── Tabs ── */
    .tabs {
      display: flex;
      padding: 0 32px;
      border-bottom: 1px solid #E0E5E1;
    }

    .tab {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 500;
      color: #6B8070;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color 0.15s, border-color 0.15s;
      user-select: none;
    }

    .tab:hover:not(.active) {
      color: #4A6350;
    }

    .tab.active {
      color: #3E6B48;
      border-bottom-color: #3E6B48;
    }

    .tab-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      background-color: #E8ECE9;
      color: #4A6350;
    }

    .tab.active .tab-count {
      background-color: #D0E8D4;
      color: #2C5E34;
    }

    /* ── Table ── */
    .table-container {
      padding: 16px 32px 32px;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: #FFFFFF;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #E0E5E1;
      min-width: 820px;
    }

    thead {
      background-color: #F5F7F3;
    }

    th {
      padding: 12px 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #4A6350;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #E0E5E1;
      white-space: nowrap;
    }

    th.numeric {
      text-align: right;
    }

    td {
      padding: 12px 16px;
      font-size: 14px;
      color: #2C3E2F;
      border-bottom: 1px solid #F0F3F0;
      white-space: nowrap;
    }

    /* Actions column shrinks to its content so date columns don't gap */
    th:last-child,
    td:last-child {
      width: 1px;
    }

    td.dim {
      color: #A3B5A8;
    }

    td.numeric {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background-color: #FAFBFA;
    }

    /* Archived rows are slightly muted */
    tr.archived-row td {
      color: #7A9282;
    }

    tr.archived-row:hover td {
      background-color: #F8F9F8;
    }

    .batch-number {
      font-weight: 600;
      color: #3E6B48;
    }

    tr.archived-row .batch-number {
      color: #7A9282;
    }

    /* Cost columns */
    .cost-value {
      color: #2C5E34;
      font-weight: 500;
    }

    tr.archived-row .cost-value {
      color: #7A9282;
      font-weight: 400;
    }

    /* ── Row action buttons ── */
    .actions-cell {
      display: flex;
      gap: 4px;
      align-items: center;
      justify-content: flex-end;
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border: 1px solid #E0E5E1;
      border-radius: 8px;
      background: #F5F7F3;
      cursor: pointer;
      transition: background-color 0.15s, color 0.15s, border-color 0.15s;
      padding: 0;
    }

    .action-btn .material-symbols-outlined {
      font-size: 18px;
    }

    .action-btn.edit {
      color: #6B8070;
    }

    .action-btn.edit:hover {
      background-color: #E8ECE9;
      border-color: #B8D4BC;
      color: #3E6B48;
    }

    .action-btn.expenses {
      color: #6B8070;
    }

    .action-btn.expenses:hover {
      background-color: #FFF6E0;
      border-color: #E8C96A;
      color: #9A6E00;
    }

    .action-btn.archive {
      color: #6B8070;
    }

    .action-btn.archive:hover {
      background-color: #EBF0FF;
      border-color: #A0B4E8;
      color: #3B5FBF;
    }

    .action-btn.unarchive {
      color: #6B8070;
    }

    .action-btn.unarchive:hover {
      background-color: #E8ECE9;
      border-color: #B8D4BC;
      color: #3E6B48;
    }

    .action-btn.delete {
      color: #B0C0B4;
    }

    .action-btn.delete:hover {
      background-color: #FDECEA;
      border-color: #F0A8A0;
      color: #C0392B;
    }

    /* ── Empty & loading states ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 32px;
      color: #6B8070;
      gap: 8px;
    }

    .empty-state .icon {
      font-size: 48px;
      color: #A3B5A8;
    }

    .empty-state p {
      margin: 0;
      font-size: 15px;
      font-weight: 500;
      color: #5A7D6A;
    }

    .empty-state .empty-hint {
      font-size: 13px;
      font-weight: 400;
      color: #8A9E8F;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: #6B8070;
      font-size: 14px;
    }

    .batch-count {
      padding: 8px 32px 0;
      font-size: 13px;
      color: #6B8070;
    }
  `;

  constructor() {
    super();
    this._batches = [];
    this._loading = true;
    this._dialogOpen = false;
    this._editingBatch = null;
    this._showArchived = false;
    this._expensesDialogOpen = false;
    this._expensesBatch = null;

    this._loadBatches();
  }

  get _activeBatches() {
    return this._batches.filter(b => !b.archived);
  }

  get _archivedBatches() {
    return this._batches.filter(b => b.archived);
  }

  async _loadBatches() {
    this._loading = true;
    try {
      const snap = await firebase.database().ref('poultry_batches').once('value');
      const data = snap.val();
      if (data) {
        this._batches = Object.entries(data).map(([id, record]) => {
          const expenses = record.expenses
            ? Object.values(record.expenses)
            : [];
          const totalCost = expenses.reduce((sum, e) => sum + (e.cost || 0), 0);
          const costPerBird = record.number_of_birds && totalCost > 0
            ? totalCost / record.number_of_birds
            : null;

          return {
            id,
            ...record,
            _hatchDateFormatted: record.hatch_date
              ? DateTime.fromMillis(record.hatch_date).toFormat('MMM d, yyyy')
              : '—',
            _pastureDateFormatted: record.date_out_to_pasture
              ? DateTime.fromMillis(record.date_out_to_pasture).toFormat('MMM d, yyyy')
              : '—',
            _totalCost: totalCost,
            _costPerBird: costPerBird,
          };
        }).sort((a, b) => (b.hatch_date || 0) - (a.hatch_date || 0));
      } else {
        this._batches = [];
      }
    } catch (error) {
      console.error('Error loading poultry batches:', error);
      this._batches = [];
    }
    this._loading = false;
  }

  async _onBatchSubmit(e) {
    const { batch, batchId, resolve } = e.detail;
    try {
      if (batchId) {
        // Edit: preserve original created_at and archived status
        const original = this._batches.find(b => b.id === batchId);
        if (original?.created_at) batch.created_at = original.created_at;
        if (original?.archived) batch.archived = original.archived;
        await firebase.database().ref(`poultry_batches/${batchId}`).set(batch);
      } else {
        await firebase.database().ref('poultry_batches').push(batch);
      }
      await this._loadBatches();
    } catch (error) {
      console.error('Error saving poultry batch:', error);
    } finally {
      resolve?.();
    }
  }

  async _archiveBatch(batch) {
    try {
      await firebase.database().ref(`poultry_batches/${batch.id}/archived`).set(true);
      await this._loadBatches();
    } catch (error) {
      console.error('Error archiving poultry batch:', error);
    }
  }

  async _unarchiveBatch(batch) {
    try {
      await firebase.database().ref(`poultry_batches/${batch.id}/archived`).set(false);
      await this._loadBatches();
    } catch (error) {
      console.error('Error unarchiving poultry batch:', error);
    }
  }

  async _deleteBatch(batch) {
    const label = `${batch.number_of_birds} birds — ${batch._hatchDateFormatted}`;
    if (!window.confirm(`Delete "${label}"?\n\nThis cannot be undone.`)) return;

    try {
      await firebase.database().ref(`poultry_batches/${batch.id}`).remove();
      await this._loadBatches();
    } catch (error) {
      console.error('Error deleting poultry batch:', error);
    }
  }

  _openEdit(batch) {
    this._editingBatch = batch;
    this._dialogOpen = true;
  }

  _openCreate() {
    this._editingBatch = null;
    this._dialogOpen = true;
  }

  _onDialogClosed() {
    this._dialogOpen = false;
    this._editingBatch = null;
  }

  _openExpenses(batch) {
    this._expensesBatch = batch;
    this._expensesDialogOpen = true;
  }

  _onExpensesDialogClosed() {
    this._expensesDialogOpen = false;
    this._expensesBatch = null;
  }

  async _onExpensesChanged() {
    await this._loadBatches();
  }

  render() {
    const active = this._activeBatches;
    const archived = this._archivedBatches;

    return html`
      <div class="page-header">
        <div class="header-row">
          <div>
            <h1>Poultry Batches</h1>
            <p>Track and manage your poultry production batches</p>
          </div>
          <button class="btn-new-batch" @click="${this._openCreate}">
            <span class="material-symbols-outlined">add_circle</span>
            New Batch
          </button>
        </div>
      </div>

      <div class="tabs">
        <div
          class="tab ${!this._showArchived ? 'active' : ''}"
          @click="${() => this._showArchived = false}">
          Active
          <span class="tab-count">${active.length}</span>
        </div>
        <div
          class="tab ${this._showArchived ? 'active' : ''}"
          @click="${() => this._showArchived = true}">
          Archived
          <span class="tab-count">${archived.length}</span>
        </div>
      </div>

      ${this._loading
        ? html`<div class="loading">Loading batches…</div>`
        : this._renderContent(this._showArchived ? archived : active)
      }

      <batch-dialog
        ?open="${this._dialogOpen}"
        .batchId="${this._editingBatch?.id ?? null}"
        .batch="${this._editingBatch}"
        @batch-submit="${this._onBatchSubmit}"
        @dialog-closed="${this._onDialogClosed}"
      ></batch-dialog>

      <expense-dialog
        ?open="${this._expensesDialogOpen}"
        .batch="${this._expensesBatch}"
        @expenses-changed="${this._onExpensesChanged}"
        @dialog-closed="${this._onExpensesDialogClosed}"
      ></expense-dialog>
    `;
  }

  _renderContent(batches) {
    if (batches.length === 0) {
      if (this._showArchived) {
        return html`
          <div class="empty-state">
            <span class="icon material-symbols-outlined">archive</span>
            <p>No archived batches</p>
            <p class="empty-hint">Batches you archive will appear here</p>
          </div>
        `;
      }
      return html`
        <div class="empty-state">
          <span class="icon material-symbols-outlined">egg</span>
          <p>No active batches</p>
          <p class="empty-hint">Click "New Batch" to record your first poultry batch</p>
        </div>
      `;
    }

    return html`
      <div class="batch-count">${batches.length} batch${batches.length !== 1 ? 'es' : ''}</div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Hatch Date</th>
              <th>Birds</th>
              <th>Date to Pasture</th>
              <th class="numeric">Carcass Wt (lbs)</th>
              <th class="numeric">Total Cost</th>
              <th class="numeric">Cost / Bird</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${map(batches, (batch, index) => html`
              <tr class="${batch.archived ? 'archived-row' : ''}">
                <td class="batch-number">${batches.length - index}</td>
                <td>${batch._hatchDateFormatted}</td>
                <td>${batch.number_of_birds}</td>
                <td class="${batch.date_out_to_pasture == null ? 'dim' : ''}">${batch._pastureDateFormatted}</td>
                <td class="numeric ${batch.total_carcass_weight == null ? 'dim' : ''}">
                  ${batch.total_carcass_weight != null ? batch.total_carcass_weight : '—'}
                </td>
                <td class="numeric">
                  ${batch._totalCost > 0
                    ? html`<span class="cost-value">$${batch._totalCost.toFixed(2)}</span>`
                    : html`<span class="dim">—</span>`
                  }
                </td>
                <td class="numeric">
                  ${batch._costPerBird != null
                    ? html`<span class="cost-value">$${batch._costPerBird.toFixed(2)}</span>`
                    : html`<span class="dim">—</span>`
                  }
                </td>
                <td>
                  <div class="actions-cell">
                    <button class="action-btn edit" title="Edit batch" @click="${() => this._openEdit(batch)}">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="action-btn expenses" title="Manage expenses" @click="${() => this._openExpenses(batch)}">
                      <span class="material-symbols-outlined">receipt_long</span>
                    </button>
                    ${batch.archived
                      ? html`
                        <button class="action-btn unarchive" title="Restore batch" @click="${() => this._unarchiveBatch(batch)}">
                          <span class="material-symbols-outlined">unarchive</span>
                        </button>
                      `
                      : html`
                        <button class="action-btn archive" title="Archive batch" @click="${() => this._archiveBatch(batch)}">
                          <span class="material-symbols-outlined">archive</span>
                        </button>
                      `
                    }
                    <button class="action-btn delete" title="Delete batch" @click="${() => this._deleteBatch(batch)}">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }
}

customElements.define('poultry-tracking', PoultryTracking);
