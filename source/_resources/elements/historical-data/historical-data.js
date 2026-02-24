import { LitElement, html, css } from 'lit';
import { map } from 'lit/directives/map.js';
import { firebase } from '../../../../firebaseConfig.js';
import { DateTime } from 'luxon';
import './harvest-edit-dialog.js';

class HistoricalData extends LitElement {

  static properties = {
    _harvests: { type: Array, state: true },
    _produceReference: { type: Object, state: true },
    _loading: { type: Boolean, state: true },
    _filterProduce: { type: String, state: true },
    _filterYear: { type: String, state: true },
    _editDialogOpen: { type: Boolean, state: true },
    _editingHarvest: { type: Object, state: true },
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

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 16px 32px;
      background: #FFFFFF;
      margin: 12px 32px 0;
      border-radius: 10px;
      border: 1px solid #E0E5E1;
      align-items: flex-end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .filter-group label {
      font-size: 12px;
      font-weight: 500;
      color: #6B8070;
    }

    .filter-group select,
    .filter-group input {
      padding: 7px 10px;
      border: 1px solid #C8D5CB;
      border-radius: 6px;
      font-size: 13px;
      font-family: 'Roboto', sans-serif;
      color: #2C3E2F;
      outline: none;
      background: #FAFBFA;
    }

    .filter-group select:focus,
    .filter-group input:focus {
      border-color: #3E6B48;
    }

    .filter-group select {
      min-width: 140px;
    }

    .filter-group input[type="number"] {
      width: 80px;
    }

    .btn-clear {
      padding: 7px 14px;
      border: 1px solid #C8D5CB;
      border-radius: 6px;
      font-size: 13px;
      font-family: 'Roboto', sans-serif;
      background: none;
      color: #4A6350;
      cursor: pointer;
    }

    .btn-clear:hover {
      background-color: #F0F3F0;
    }

    .table-container {
      padding: 16px 32px 32px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: #FFFFFF;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #E0E5E1;
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
    }

    /* Actions column shrinks to its content */
    th:last-child,
    td:last-child {
      width: 1px;
    }

    td {
      padding: 12px 16px;
      font-size: 14px;
      color: #2C3E2F;
      border-bottom: 1px solid #F0F3F0;
      white-space: nowrap;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background-color: #FAFBFA;
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

    .action-btn.delete {
      color: #B0C0B4;
    }

    .action-btn.delete:hover {
      background-color: #FDECEA;
      border-color: #F0A8A0;
      color: #C0392B;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 32px;
      color: #6B8070;
      gap: 8px;
    }

    .empty-state .icon {
      font-size: 40px;
      color: #A3B5A8;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: #6B8070;
      font-size: 14px;
    }

    .section-heading {
      padding: 24px 32px 0;
      font-size: 15px;
      font-weight: 600;
      color: #2C3E2F;
    }

    .section-heading p {
      margin: 3px 0 0 0;
      font-size: 13px;
      font-weight: 400;
      color: #6B8070;
    }

    .totals-table td.numeric {
      font-variant-numeric: tabular-nums;
    }

    .totals-table td.total-weight {
      font-weight: 600;
      color: #2C5E34;
    }

    .sections-row {
      display: flex;
      align-items: flex-start;
      gap: 0;
      padding: 0 32px 32px;
    }

    .sections-row .section {
      flex: 1;
      min-width: 0;
    }

    .sections-row .section:first-child {
      flex: 0 0 340px;
      margin-right: 24px;
    }

    .sections-row .section .section-heading {
      padding: 24px 0 0;
    }

    .sections-row .section .table-container {
      padding: 16px 0 0;
    }
  `;

  constructor() {
    super();
    this._harvests = [];
    this._produceReference = {};
    this._loading = true;
    this._filterProduce = '';
    this._filterYear = String(new Date().getFullYear());
    this._editDialogOpen = false;
    this._editingHarvest = null;

    this._loadData();
  }

  async _loadData() {
    this._loading = true;
    try {
      const [harvestSnap, produceSnap] = await Promise.all([
        firebase.database().ref('harvest').once('value'),
        firebase.database().ref('produce_reference').once('value')
      ]);

      this._produceReference = produceSnap.val() || {};

      const harvestData = harvestSnap.val();
      if (harvestData) {
        this._harvests = Object.entries(harvestData).map(([id, record]) => ({
          id,
          ...record,
          _produceName: this._produceReference[record.produce_key]?.name || record.produce_key,
          _dateFormatted: record.date_harvested
            ? DateTime.fromMillis(record.date_harvested).toFormat('MMM d, yyyy h:mm a')
            : 'N/A',
          _dateISO: record.date_harvested
            ? DateTime.fromMillis(record.date_harvested).toISODate()
            : '',
          _year: record.date_harvested
            ? String(DateTime.fromMillis(record.date_harvested).year)
            : '',
        })).sort((a, b) => (b.date_harvested || 0) - (a.date_harvested || 0));
      } else {
        this._harvests = [];
      }
    } catch (error) {
      console.error('Error loading harvest data:', error);
    }
    this._loading = false;
  }

  get _produceOptions() {
    const names = new Set(this._harvests.map(h => h.produce_key));
    return [...names].map(key => ({
      key,
      name: this._produceReference[key]?.name || key
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  get _yearOptions() {
    const years = new Set(this._harvests.map(h => h._year).filter(Boolean));
    return [...years].sort((a, b) => b.localeCompare(a));  // descending
  }

  get _totalsPerProduce() {
    const map = new Map();
    for (const h of this._filteredHarvests) {
      const entry = map.get(h.produce_key) ?? { name: h._produceName, count: 0, totalWeight: 0, hasWeight: false, totalCount: 0, hasCount: false };
      entry.count += 1;
      if (h.harvest_weight != null) {
        entry.totalWeight += h.harvest_weight;
        entry.hasWeight = true;
      }
      if (h.harvest_count != null) {
        entry.totalCount += h.harvest_count;
        entry.hasCount = true;
      }
      map.set(h.produce_key, entry);
    }
    return [...map.values()].sort((a, b) => {
      if (a.hasWeight && b.hasWeight) return b.totalWeight - a.totalWeight;
      if (a.hasWeight) return -1;
      if (b.hasWeight) return 1;
      return b.totalCount - a.totalCount;
    });
  }

  get _filteredHarvests() {
    return this._harvests.filter(h => {
      if (this._filterProduce && h.produce_key !== this._filterProduce) return false;

      if (this._filterYear && h._year !== this._filterYear) return false;

      return true;
    });
  }

  _clearFilters() {
    this._filterProduce = '';
    this._filterYear = '';
  }

  _openEdit(harvest) {
    this._editingHarvest = harvest;
    this._editDialogOpen = true;
  }

  _onEditDialogClosed() {
    this._editDialogOpen = false;
    this._editingHarvest = null;
  }

  async _onEditSubmit(e) {
    const { harvestId, updated, resolve } = e.detail;
    try {
      await firebase.database().ref(`harvest/${harvestId}`).update(updated);
      await this._loadData();
    } catch (error) {
      console.error('Error updating harvest:', error);
    } finally {
      resolve?.();
    }
  }

  async _deleteHarvest(harvest) {
    const label = `${harvest._produceName} — ${harvest._dateFormatted}`;
    if (!window.confirm(`Delete "${label}"?\n\nThis cannot be undone.`)) return;

    try {
      await firebase.database().ref(`harvest/${harvest.id}`).remove();
      await this._loadData();
    } catch (error) {
      console.error('Error deleting harvest:', error);
    }
  }

  render() {
    return html`
      <div class="page-header">
        <h1>Historical Data</h1>
        <p>View and filter your past harvests</p>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>Produce</label>
          <select .value="${this._filterProduce}" @change="${(e) => this._filterProduce = e.target.value}">
            <option value="">All</option>
            ${map(this._produceOptions, (opt) => html`
              <option value="${opt.key}">${opt.name}</option>
            `)}
          </select>
        </div>

        <div class="filter-group">
          <label>Year</label>
          <select @change="${(e) => this._filterYear = e.target.value}">
            <option value="" ?selected="${this._filterYear === ''}">All Years</option>
            ${map(this._yearOptions, (year) => html`
              <option value="${year}" ?selected="${year === this._filterYear}">${year}</option>
            `)}
          </select>
        </div>

        <button class="btn-clear" @click="${this._clearFilters}">Clear Filters</button>
      </div>

      ${this._loading
        ? html`<div class="loading">Loading harvest data...</div>`
        : this._renderTable()
      }

      <harvest-edit-dialog
        ?open="${this._editDialogOpen}"
        .harvest="${this._editingHarvest}"
        .produceReference="${this._produceReference}"
        @harvest-edit-submit="${this._onEditSubmit}"
        @dialog-closed="${this._onEditDialogClosed}"
      ></harvest-edit-dialog>
    `;
  }

  _renderTable() {
    const filtered = this._filteredHarvests;

    if (this._harvests.length === 0) {
      return html`
        <div class="empty-state">
          <span class="icon material-symbols-outlined">psychiatry</span>
          <p>No harvests recorded yet</p>
        </div>
      `;
    }

    return html`
      <div class="sections-row">
        <div class="section">${this._renderTotalsTable(filtered)}</div>
        <div class="section">${this._renderIndividualTable(filtered)}</div>
      </div>
    `;
  }

  _renderTotalsTable(filtered) {
    const totals = this._totalsPerProduce;

    return html`
      <div class="section-heading">
        Totals by Produce
        <p>Aggregated across ${filtered.length} harvest${filtered.length !== 1 ? 's' : ''}</p>
      </div>
      <div class="table-container">
        <table class="totals-table">
          <thead>
            <tr>
              <th>Produce</th>
              <th>Harvests</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${totals.length === 0
              ? html`<tr><td colspan="3" style="text-align: center; color: #6B8070; padding: 32px;">No harvests match the current filters</td></tr>`
              : map(totals, (row) => html`
                <tr>
                  <td>${row.name}</td>
                  <td class="numeric">${row.count}</td>
                  <td class="numeric total-weight">${row.hasWeight ? `${row.totalWeight.toFixed(2)} lbs` : row.hasCount ? `${row.totalCount} ct` : 'N/A'}</td>
                </tr>
              `)
            }
          </tbody>
        </table>
      </div>
    `;
  }

  _renderIndividualTable(filtered) {
    return html`
      <div class="section-heading">
        Individual Harvests
        <p>${filtered.length} of ${this._harvests.length} entries</p>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Produce</th>
              <th>Date</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0
              ? html`<tr><td colspan="4" style="text-align: center; color: #6B8070; padding: 32px;">No harvests match the current filters</td></tr>`
              : map(filtered, (harvest) => html`
                <tr>
                  <td>${harvest._produceName}</td>
                  <td>${harvest._dateFormatted}</td>
                  <td>${harvest.harvest_weight != null ? `${harvest.harvest_weight} lbs` : harvest.harvest_count != null ? `${harvest.harvest_count} ct` : 'N/A'}</td>
                  <td>
                    <div class="actions-cell">
                      <button class="action-btn edit" title="Edit harvest" @click="${() => this._openEdit(harvest)}">
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button class="action-btn delete" title="Delete harvest" @click="${() => this._deleteHarvest(harvest)}">
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              `)
            }
          </tbody>
        </table>
      </div>
    `;
  }
}

customElements.define('historical-data', HistoricalData);
