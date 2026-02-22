import { LitElement, html, css } from 'lit';
import { map } from 'lit/directives/map.js';
import { firebase } from '../../../../firebaseConfig.js';
import { DateTime } from 'luxon';
import './batch-dialog.js';

class PoultryTracking extends LitElement {

  static properties = {
    _batches: { type: Array, state: true },
    _loading: { type: Boolean, state: true },
    _dialogOpen: { type: Boolean, state: true },
    _editingBatch: { type: Object, state: true },  // null = create mode, batch = edit mode
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
      padding: 28px 32px 12px;
    }

    .header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
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
      min-width: 800px;
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

    td {
      padding: 12px 16px;
      font-size: 14px;
      color: #2C3E2F;
      border-bottom: 1px solid #F0F3F0;
    }

    td.dim {
      color: #A3B5A8;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background-color: #FAFBFA;
    }

    .batch-number {
      font-weight: 600;
      color: #3E6B48;
    }

    /* Action buttons in the table */
    .actions-cell {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: none;
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
      transition: background-color 0.15s, color 0.15s;
      padding: 0;
    }

    .action-btn .material-symbols-outlined {
      font-size: 17px;
    }

    .action-btn.edit {
      color: #6B8070;
    }

    .action-btn.edit:hover {
      background-color: #E8ECE9;
      color: #3E6B48;
    }

    .action-btn.delete {
      color: #B0C0B4;
    }

    .action-btn.delete:hover {
      background-color: #FDECEA;
      color: #C0392B;
    }

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

    this._loadBatches();
  }

  async _loadBatches() {
    this._loading = true;
    try {
      const snap = await firebase.database().ref('poultry_batches').once('value');
      const data = snap.val();
      if (data) {
        this._batches = Object.entries(data).map(([id, record]) => ({
          id,
          ...record,
          _hatchDateFormatted: record.hatch_date
            ? DateTime.fromMillis(record.hatch_date).toFormat('MMM d, yyyy')
            : '—',
          _pastureDateFormatted: record.date_out_to_pasture
            ? DateTime.fromMillis(record.date_out_to_pasture).toFormat('MMM d, yyyy')
            : '—',
        })).sort((a, b) => (b.hatch_date || 0) - (a.hatch_date || 0));
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
        // Edit: preserve original created_at
        const original = this._batches.find(b => b.id === batchId);
        if (original?.created_at) batch.created_at = original.created_at;
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

  async _deleteBatch(batch) {
    const label = `Batch #${batch.number_of_birds} birds — ${batch._hatchDateFormatted}`;
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

  render() {
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

      ${this._loading
        ? html`<div class="loading">Loading batches…</div>`
        : this._renderContent()
      }

      <batch-dialog
        ?open="${this._dialogOpen}"
        .batchId="${this._editingBatch?.id ?? null}"
        .batch="${this._editingBatch}"
        @batch-submit="${this._onBatchSubmit}"
        @dialog-closed="${this._onDialogClosed}"
      ></batch-dialog>
    `;
  }

  _renderContent() {
    if (this._batches.length === 0) {
      return html`
        <div class="empty-state">
          <span class="icon material-symbols-outlined">egg</span>
          <p>No batches recorded yet</p>
          <p class="empty-hint">Click "New Batch" to record your first poultry batch</p>
        </div>
      `;
    }

    return html`
      <div class="batch-count">${this._batches.length} batch${this._batches.length !== 1 ? 'es' : ''}</div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Hatch Date</th>
              <th>Birds</th>
              <th>Date to Pasture</th>
              <th>Carcass Wt (lbs)</th>
              <th>Starter Feed (lbs)</th>
              <th>Grower Feed (lbs)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${map(this._batches, (batch, index) => html`
              <tr>
                <td class="batch-number">${this._batches.length - index}</td>
                <td>${batch._hatchDateFormatted}</td>
                <td>${batch.number_of_birds}</td>
                <td class="${batch.date_out_to_pasture == null ? 'dim' : ''}">${batch._pastureDateFormatted}</td>
                <td class="${batch.total_carcass_weight == null ? 'dim' : ''}">
                  ${batch.total_carcass_weight != null ? batch.total_carcass_weight : '—'}
                </td>
                <td class="${batch.starter_feed_lbs == null ? 'dim' : ''}">
                  ${batch.starter_feed_lbs != null ? batch.starter_feed_lbs : '—'}
                </td>
                <td class="${batch.grower_feed_lbs == null ? 'dim' : ''}">
                  ${batch.grower_feed_lbs != null ? batch.grower_feed_lbs : '—'}
                </td>
                <td>
                  <div class="actions-cell">
                    <button class="action-btn edit" title="Edit batch" @click="${() => this._openEdit(batch)}">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
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
