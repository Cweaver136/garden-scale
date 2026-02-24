import { LitElement, html, css } from 'lit';
import { map } from 'lit/directives/map.js';
import { firebase } from '../../../../firebaseConfig.js';
import { DateTime } from 'luxon';

function formatWeight(lbs) {
  const wholeLbs = Math.floor(lbs);
  const oz = Math.round((lbs - wholeLbs) * 16);
  if (wholeLbs === 0) return `${oz} oz`;
  if (oz === 0) return `${wholeLbs} lbs`;
  return `${wholeLbs} lbs ${oz} oz`;
}

class FarmOverview extends LitElement {

  static properties = {
    _harvests: { type: Array, state: true },
    _produceReference: { type: Object, state: true },
    _batches: { type: Array, state: true },
    _loading: { type: Boolean, state: true },
  };

  static styles = css`
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

    /* ── Page header ── */
    .page-header {
      padding: 28px 32px 0;
    }

    .page-header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: #2C3E2F;
    }

    .page-header p {
      margin: 6px 0 0;
      font-size: 14px;
      color: #6B8070;
    }

    /* ── Loading / empty ── */
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: #6B8070;
      font-size: 14px;
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

    /* ── Overview content ── */
    .overview-content {
      padding: 20px 32px 40px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* ── Year section ── */
    .year-section {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .year-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .year-label {
      font-size: 19px;
      font-weight: 700;
      color: #2C3E2F;
      letter-spacing: -0.3px;
    }

    .year-divider {
      flex: 1;
      height: 1px;
      background: #E0E5E1;
    }

    /* ── Stat cards row ── */
    .stats-row {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 14px;
      background: #FFFFFF;
      border: 1px solid #E0E5E1;
      border-radius: 12px;
      padding: 16px 20px;
      flex: 1;
      min-width: 160px;
    }

    .stat-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 10px;
      flex-shrink: 0;
    }

    .stat-icon-wrap.green {
      background: #DCF0DF;
    }

    .stat-icon-wrap.amber {
      background: #FFF3D6;
    }

    .stat-icon-wrap.blue {
      background: #E3EDFF;
    }

    .stat-icon-wrap .material-symbols-outlined {
      font-size: 22px;
    }

    .stat-icon-wrap.green .material-symbols-outlined {
      color: #3E6B48;
    }

    .stat-icon-wrap.amber .material-symbols-outlined {
      color: #9A6E00;
    }

    .stat-icon-wrap.blue .material-symbols-outlined {
      color: #3B5FBF;
    }

    .stat-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-value {
      font-size: 22px;
      font-weight: 700;
      color: #2C3E2F;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .stat-label {
      font-size: 12px;
      color: #6B8070;
      font-weight: 500;
      white-space: nowrap;
    }

    /* ── Section label ── */
    .section-label {
      font-size: 13px;
      font-weight: 600;
      color: #4A6350;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ── Produce table ── */
    .table-wrap {
      background: #FFFFFF;
      border: 1px solid #E0E5E1;
      border-radius: 10px;
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background-color: #F5F7F3;
    }

    th {
      padding: 11px 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #4A6350;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #E0E5E1;
      white-space: nowrap;
    }

    th.right {
      text-align: right;
    }

    td {
      padding: 11px 16px;
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

    td.right {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    td.produce-name {
      font-weight: 500;
    }

    td.value-cell {
      color: #2C5E34;
      font-weight: 600;
    }

    td.dim {
      color: #A3B5A8;
    }

    .produce-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #90C795;
      margin-right: 8px;
      vertical-align: middle;
      flex-shrink: 0;
    }

    .no-produce {
      padding: 24px 16px;
      text-align: center;
      font-size: 13px;
      color: #8A9E8F;
    }
  `;

  constructor() {
    super();
    this._harvests = [];
    this._produceReference = {};
    this._batches = [];
    this._loading = true;

    this._loadData();
  }

  async _loadData() {
    this._loading = true;
    try {
      const [harvestSnap, produceSnap, batchSnap] = await Promise.all([
        firebase.database().ref('harvest').once('value'),
        firebase.database().ref('produce_reference').once('value'),
        firebase.database().ref('poultry_batches').once('value'),
      ]);

      this._produceReference = produceSnap.val() || {};

      const harvestData = harvestSnap.val();
      if (harvestData) {
        this._harvests = Object.entries(harvestData).map(([id, record]) => ({
          id,
          ...record,
          _produceName: this._produceReference[record.produce_key]?.name || record.produce_key,
          _year: record.date_harvested
            ? String(DateTime.fromMillis(record.date_harvested).year)
            : null,
        }));
      } else {
        this._harvests = [];
      }

      const batchData = batchSnap.val();
      if (batchData) {
        this._batches = Object.entries(batchData).map(([id, record]) => {
          const expenses = record.expenses ? Object.values(record.expenses) : [];
          const totalCost = expenses.reduce((sum, e) => sum + (e.cost || 0), 0);
          const costPerBird = record.number_of_birds && totalCost > 0
            ? totalCost / record.number_of_birds
            : null;

          // A batch is "processed" if archived or has a processing_date
          const isProcessed = record.archived === true || record.processing_date != null;
          let processedYear = null;
          if (isProcessed) {
            if (record.processing_date) {
              processedYear = String(DateTime.fromMillis(record.processing_date).year);
            } else if (record.hatch_date) {
              // Archived but no processing_date — use hatch year as fallback
              processedYear = String(DateTime.fromMillis(record.hatch_date).year);
            }
          }

          return {
            id,
            ...record,
            _totalCost: totalCost,
            _costPerBird: costPerBird,
            _isProcessed: isProcessed,
            _processedYear: processedYear,
          };
        });
      } else {
        this._batches = [];
      }
    } catch (error) {
      console.error('Error loading farm overview data:', error);
    }
    this._loading = false;
  }

  get _years() {
    const years = new Set();
    this._harvests.forEach(h => { if (h._year) years.add(h._year); });
    this._batches.forEach(b => { if (b._processedYear) years.add(b._processedYear); });
    return [...years].sort((a, b) => b.localeCompare(a)); // newest first
  }

  _getYearData(year) {
    // ── Produce totals ──
    const yearHarvests = this._harvests.filter(h => h._year === year);
    const produceMap = new Map();
    for (const h of yearHarvests) {
      const existing = produceMap.get(h.produce_key) ?? {
        name: h._produceName,
        produce_key: h.produce_key,
        totalWeight: 0,
        totalCount: 0,
        hasWeight: false,
        hasCount: false,
      };
      if (h.harvest_weight != null) {
        existing.totalWeight += h.harvest_weight;
        existing.hasWeight = true;
      }
      if (h.harvest_count != null) {
        existing.totalCount += h.harvest_count;
        existing.hasCount = true;
      }
      produceMap.set(h.produce_key, existing);
    }
    const produce = [...produceMap.values()].sort((a, b) => {
      if (a.hasWeight && b.hasWeight) return b.totalWeight - a.totalWeight;
      if (a.hasWeight) return -1;
      if (b.hasWeight) return 1;
      return b.totalCount - a.totalCount;
    });

    // ── Poultry stats ──
    const processedBatches = this._batches.filter(b => b._isProcessed && b._processedYear === year);
    const totalBirdsProcessed = processedBatches.reduce((sum, b) => sum + (b.number_of_birds || 0), 0);

    // Average cost per bird across all processed batches that have cost data
    const batchesWithCost = processedBatches.filter(b => b._costPerBird != null);
    const avgCostPerBird = batchesWithCost.length > 0
      ? batchesWithCost.reduce((sum, b) => sum + b._costPerBird, 0) / batchesWithCost.length
      : null;

    return { produce, totalBirdsProcessed, avgCostPerBird, processedBatches };
  }

  render() {
    return html`
      <div class="page-header">
        <h1>Farm Overview</h1>
        <p>Year-by-year summary of produce harvests and poultry batches</p>
      </div>

      ${this._loading
        ? html`<div class="loading">Loading overview data…</div>`
        : this._renderContent()
      }
    `;
  }

  _renderContent() {
    const years = this._years;

    if (years.length === 0) {
      return html`
        <div class="empty-state">
          <span class="icon material-symbols-outlined">analytics</span>
          <p>No data recorded yet</p>
          <p class="empty-hint">Start recording harvests and poultry batches to see your overview</p>
        </div>
      `;
    }

    return html`
      <div class="overview-content">
        ${map(years, year => this._renderYear(year))}
      </div>
    `;
  }

  _renderYear(year) {
    const { produce, totalBirdsProcessed, avgCostPerBird } = this._getYearData(year);

    return html`
      <div class="year-section">

        <div class="year-header">
          <span class="year-label">${year}</span>
          <div class="year-divider"></div>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon-wrap green">
              <span class="material-symbols-outlined">egg</span>
            </div>
            <div class="stat-body">
              <div class="stat-value">${totalBirdsProcessed}</div>
              <div class="stat-label">Birds Processed</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap amber">
              <span class="material-symbols-outlined">payments</span>
            </div>
            <div class="stat-body">
              <div class="stat-value">${avgCostPerBird != null ? `$${avgCostPerBird.toFixed(2)}` : '—'}</div>
              <div class="stat-label">Avg Cost / Bird</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap blue">
              <span class="material-symbols-outlined">yard</span>
            </div>
            <div class="stat-body">
              <div class="stat-value">${produce.length}</div>
              <div class="stat-label">Produce Types</div>
            </div>
          </div>
        </div>

        ${produce.length > 0 ? this._renderProduceTable(produce) : ''}

      </div>
    `;
  }

  _renderProduceTable(produce) {
    // Check if any produce item has a price_per_unit configured
    const hasPricing = produce.some(p => {
      const ref = this._produceReference[p.produce_key];
      return ref?.price_per_unit != null;
    });

    return html`
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Produce</th>
              <th class="right">Total Harvested</th>
              <th class="right">Est. Value</th>
            </tr>
          </thead>
          <tbody>
            ${produce.length === 0
              ? html`<tr><td colspan="3" class="no-produce">No harvests recorded for this year</td></tr>`
              : map(produce, (row) => {
                  const ref = this._produceReference[row.produce_key];
                  const pricePerUnit = ref?.price_per_unit ?? null;
                  let estimatedValue = null;
                  if (pricePerUnit != null) {
                    if (row.hasWeight) estimatedValue = row.totalWeight * pricePerUnit;
                    else if (row.hasCount) estimatedValue = row.totalCount * pricePerUnit;
                  }

                  return html`
                    <tr>
                      <td class="produce-name">
                        <span class="produce-dot"></span>${row.name}
                      </td>
                      <td class="right">
                        ${row.hasWeight ? formatWeight(row.totalWeight) : row.hasCount ? `${row.totalCount} ct` : '—'}
                      </td>
                      <td class="right ${estimatedValue != null ? 'value-cell' : 'dim'}">
                        ${estimatedValue != null ? `$${estimatedValue.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  `;
                })
            }
          </tbody>
        </table>
      </div>
    `;
  }
}

customElements.define('farm-overview', FarmOverview);
