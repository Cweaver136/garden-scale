import { LitElement, html, css } from 'lit';
import { map } from 'lit/directives/map.js';
import { firebase } from '../../../../firebaseConfig.js';
import { DateTime } from 'luxon';

class HistoricalData extends LitElement {

  static properties = {
    _harvests: { type: Array, state: true },
    _produceReference: { type: Object, state: true },
    _loading: { type: Boolean, state: true },
    _filterProduce: { type: String, state: true },
    _filterDateFrom: { type: String, state: true },
    _filterDateTo: { type: String, state: true },
    _filterWeightMin: { type: String, state: true },
    _filterWeightMax: { type: String, state: true },
    _filterTempMin: { type: String, state: true },
    _filterTempMax: { type: String, state: true }
  }

  static styles = css`
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

    .filter-group input[type="date"] {
      width: 130px;
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

    td {
      padding: 12px 16px;
      font-size: 14px;
      color: #2C3E2F;
      border-bottom: 1px solid #F0F3F0;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background-color: #FAFBFA;
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

    .result-count {
      padding: 8px 32px 0;
      font-size: 13px;
      color: #6B8070;
    }
  `;

  constructor() {
    super();
    this._harvests = [];
    this._produceReference = {};
    this._loading = true;
    this._filterProduce = '';
    this._filterDateFrom = '';
    this._filterDateTo = '';
    this._filterWeightMin = '';
    this._filterWeightMax = '';
    this._filterTempMin = '';
    this._filterTempMax = '';

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
            : ''
        })).sort((a, b) => (b.date_harvested || 0) - (a.date_harvested || 0));
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

  get _filteredHarvests() {
    return this._harvests.filter(h => {
      if (this._filterProduce && h.produce_key !== this._filterProduce) return false;

      if (this._filterDateFrom && h._dateISO && h._dateISO < this._filterDateFrom) return false;
      if (this._filterDateTo && h._dateISO && h._dateISO > this._filterDateTo) return false;

      if (this._filterWeightMin && (h.harvest_weight == null || h.harvest_weight < parseFloat(this._filterWeightMin))) return false;
      if (this._filterWeightMax && (h.harvest_weight == null || h.harvest_weight > parseFloat(this._filterWeightMax))) return false;

      if (this._filterTempMin && (h.temperature_at_harvest == null || h.temperature_at_harvest < parseFloat(this._filterTempMin))) return false;
      if (this._filterTempMax && (h.temperature_at_harvest == null || h.temperature_at_harvest > parseFloat(this._filterTempMax))) return false;

      return true;
    });
  }

  _clearFilters() {
    this._filterProduce = '';
    this._filterDateFrom = '';
    this._filterDateTo = '';
    this._filterWeightMin = '';
    this._filterWeightMax = '';
    this._filterTempMin = '';
    this._filterTempMax = '';
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
          <label>Date From</label>
          <input type="date" .value="${this._filterDateFrom}" @change="${(e) => this._filterDateFrom = e.target.value}">
        </div>

        <div class="filter-group">
          <label>Date To</label>
          <input type="date" .value="${this._filterDateTo}" @change="${(e) => this._filterDateTo = e.target.value}">
        </div>

        <div class="filter-group">
          <label>Weight Min (lbs)</label>
          <input type="number" min="0" step="0.01" .value="${this._filterWeightMin}" @input="${(e) => this._filterWeightMin = e.target.value}">
        </div>

        <div class="filter-group">
          <label>Weight Max (lbs)</label>
          <input type="number" min="0" step="0.01" .value="${this._filterWeightMax}" @input="${(e) => this._filterWeightMax = e.target.value}">
        </div>

        <div class="filter-group">
          <label>Temp Min (&deg;F)</label>
          <input type="number" .value="${this._filterTempMin}" @input="${(e) => this._filterTempMin = e.target.value}">
        </div>

        <div class="filter-group">
          <label>Temp Max (&deg;F)</label>
          <input type="number" .value="${this._filterTempMax}" @input="${(e) => this._filterTempMax = e.target.value}">
        </div>

        <button class="btn-clear" @click="${this._clearFilters}">Clear Filters</button>
      </div>

      ${this._loading
        ? html`<div class="loading">Loading harvest data...</div>`
        : this._renderTable()
      }
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
      <div class="result-count">${filtered.length} of ${this._harvests.length} harvests</div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Produce</th>
              <th>Date</th>
              <th>Weight (lbs)</th>
              <th>Temperature (&deg;F)</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0
              ? html`<tr><td colspan="4" style="text-align: center; color: #6B8070; padding: 32px;">No harvests match the current filters</td></tr>`
              : map(filtered, (harvest) => html`
                <tr>
                  <td>${harvest._produceName}</td>
                  <td>${harvest._dateFormatted}</td>
                  <td>${harvest.harvest_weight != null ? harvest.harvest_weight : 'N/A'}</td>
                  <td>${harvest.temperature_at_harvest != null ? Math.round(harvest.temperature_at_harvest) + '\u00B0' : 'N/A'}</td>
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
