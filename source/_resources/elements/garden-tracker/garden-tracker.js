import { LitElement, html, css } from 'lit';
import { map } from 'lit/directives/map.js';
import { firebase } from '../../../../firebaseConfig.js';
import { DateTime } from 'luxon';

class GardenTracker extends LitElement {

  static properties = {
    _produce: { type: Array, state: true },
    _loading: { type: Boolean, state: true },
    _selected: { type: Object, state: true },    // { key, name, image } | null
    _pickerOpen: { type: Boolean, state: true },
    _weight: { type: String, state: true },
    _submitState: { type: String, state: true },  // 'idle' | 'loading' | 'success'
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
      overflow: hidden;
      background-color: #F5F7F3;
      font-family: 'Roboto', sans-serif;
    }

    /* ── Header ── */
    .header {
      background-color: #3E6B48;
      padding: 20px 20px 18px;
      flex-shrink: 0;
    }

    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #FFFFFF;
      letter-spacing: 0.3px;
    }

    .header p {
      margin: 4px 0 0;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.75);
    }

    /* ── Body ── */
    .body {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 28px 20px;
      padding-bottom: max(28px, env(safe-area-inset-bottom));
      gap: 20px;
      overflow: hidden;
    }

    .inputs {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .spacer { flex: 1; }

    /* ── Field labels ── */
    .field-label {
      font-size: 13px;
      font-weight: 600;
      color: #4A6350;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    /* ── Produce picker box ── */
    .produce-box {
      display: flex;
      align-items: center;
      gap: 14px;
      width: 100%;
      box-sizing: border-box;
      padding: 16px 18px;
      background: #FFFFFF;
      border: 1.5px solid #C8D5CB;
      border-radius: 12px;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      min-height: 72px;
    }

    .produce-box:active {
      background-color: #F5F7F3;
    }

    .produce-box.has-value {
      border-color: #3E6B48;
    }

    .produce-box img {
      width: 44px;
      height: 44px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .produce-box-placeholder {
      font-size: 16px;
      color: #A3B5A8;
      flex: 1;
    }

    .produce-box-name {
      font-size: 17px;
      font-weight: 500;
      color: #2C3E2F;
      flex: 1;
    }

    .produce-box-chevron {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 22px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      color: #A3B5A8;
      flex-shrink: 0;
    }

    /* ── Weight input ── */
    .weight-input {
      width: 100%;
      box-sizing: border-box;
      padding: 18px 18px;
      border: 1.5px solid #C8D5CB;
      border-radius: 12px;
      font-size: 24px;
      font-family: 'Roboto', sans-serif;
      color: #2C3E2F;
      outline: none;
      background: #FFFFFF;
      transition: border-color 0.2s, box-shadow 0.2s;
      -webkit-appearance: none;
    }

    .weight-input::placeholder {
      color: #C8D5CB;
    }

    .weight-input:focus {
      border-color: #3E6B48;
      box-shadow: 0 0 0 3px rgba(62, 107, 72, 0.12);
    }

    .weight-input:disabled {
      background: #F5F7F3;
      color: #8A9E8F;
    }

    /* ── Log button ── */
    .btn-log {
      width: 100%;
      padding: 18px;
      border: none;
      border-radius: 14px;
      font-size: 17px;
      font-weight: 600;
      font-family: 'Roboto', sans-serif;
      cursor: pointer;
      background-color: #3E6B48;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: background-color 0.2s;
      flex-shrink: 0;
    }

    .btn-log:hover:not(:disabled) {
      background-color: #345A3D;
    }

    .btn-log:disabled {
      background-color: #C8D5CB;
      cursor: not-allowed;
    }

    .btn-log.loading {
      background-color: #5A8065;
    }

    .btn-log.success {
      background-color: #2D7A3A;
    }

    /* ── Loading state ── */
    .loading-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      color: #6B8070;
    }

    /* ── Produce picker overlay ── */
    .picker-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.45);
      z-index: 100;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      animation: fadeIn 0.18s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .picker-panel {
      background: #FFFFFF;
      border-radius: 20px 20px 0 0;
      max-height: 75vh;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .picker-handle {
      width: 40px;
      height: 4px;
      background: #D0D8D2;
      border-radius: 2px;
      margin: 12px auto 0;
      flex-shrink: 0;
    }

    .picker-title {
      padding: 16px 20px 14px;
      font-size: 16px;
      font-weight: 600;
      color: #2C3E2F;
      border-bottom: 1px solid #F0F3F0;
      flex-shrink: 0;
    }

    .picker-list {
      overflow-y: auto;
      padding: 8px 12px 20px;
      padding-bottom: max(20px, env(safe-area-inset-bottom));
    }

    .picker-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: background-color 0.15s;
      -webkit-tap-highlight-color: transparent;
    }

    .picker-item:active,
    .picker-item:hover {
      background-color: #F0F5F1;
    }

    .picker-item.selected {
      background-color: #E8F2EA;
    }

    .picker-item img {
      width: 44px;
      height: 44px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .picker-item-name {
      font-size: 16px;
      font-weight: 500;
      color: #2C3E2F;
    }

    .picker-item-check {
      margin-left: auto;
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
      color: #3E6B48;
    }

    /* ── Spinner ── */
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
      flex-shrink: 0;
    }
  `;

  constructor() {
    super();
    this._produce = [];
    this._loading = true;
    this._selected = null;
    this._pickerOpen = false;
    this._weight = '';
    this._submitState = 'idle';

    firebase.database().ref('produce_reference').once('value').then(snap => {
      const data = snap.val() || {};
      this._produce = Object.entries(data)
        .map(([key, val]) => ({ key, ...val }))
        .sort((a, b) => a.name.localeCompare(b.name));
      this._loading = false;
    });
  }

  _pickProduce(item) {
    this._selected = item;
    this._pickerOpen = false;
    this.updateComplete.then(() => {
      this.shadowRoot.querySelector('.weight-input')?.focus();
    });
  }

  _reset() {
    this._selected = null;
    this._weight = '';
    this._submitState = 'idle';
  }

  async _submit() {
    if (!this._selected || !this._weight || this._submitState !== 'idle') return;

    this._submitState = 'loading';

    try {
      const update = {
        produce_key: this._selected.key,
        date_harvested: DateTime.now().ts,
        harvest_weight: parseFloat(this._weight),
      };

      const API_KEY = '18ec2e0a89f38de836ae9e5f16371798';
      const BASE_URL = `https://api.openweathermap.org/data/2.5/weather?lat=40.241413&lon=-77.228106&units=imperial&appid=${API_KEY}`;
      try {
        const response = await fetch(BASE_URL);
        if (response.ok) {
          const json = await response.json();
          update.temperature_at_harvest = json?.main?.temp;
        }
      } catch (_) { /* temperature is optional */ }

      await firebase.database().ref('harvest').push(update);
      this._submitState = 'success';
      setTimeout(() => this._reset(), 1400);
    } catch (error) {
      console.error('Error saving harvest:', error);
      this._submitState = 'idle';
    }
  }

  render() {
    const isLoading = this._submitState === 'loading';
    const isSuccess = this._submitState === 'success';
    const isBusy = isLoading || isSuccess;
    const canSubmit = this._selected && this._weight && !isBusy;

    return html`
      <div class="header">
        <h1>Garden Tracker</h1>
        <p>Weaver Farms — log a harvest</p>
      </div>

      ${this._loading
        ? html`<div class="loading-state">Loading…</div>`
        : html`
          <div class="body">
            <div class="inputs">

              <div>
                <div class="field-label">Produce</div>
                <div
                  class="produce-box ${this._selected ? 'has-value' : ''}"
                  @click="${() => { if (!isBusy) this._pickerOpen = true; }}">
                  ${this._selected
                    ? html`
                      <img src="${this._selected.image}" alt="${this._selected.name}">
                      <span class="produce-box-name">${this._selected.name}</span>
                    `
                    : html`<span class="produce-box-placeholder">Select a vegetable…</span>`
                  }
                  <span class="produce-box-chevron">expand_more</span>
                </div>
              </div>

              <div>
                <div class="field-label">Weight (lbs)</div>
                <input
                  class="weight-input"
                  type="number"
                  inputmode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  .value="${this._weight}"
                  ?disabled="${isBusy}"
                  @input="${(e) => this._weight = e.target.value}"
                  @keydown="${(e) => e.key === 'Enter' && this._submit()}"
                >
              </div>

            </div>

            <div class="spacer"></div>

            <button
              class="btn-log ${this._submitState}"
              ?disabled="${!canSubmit}"
              @click="${this._submit}">
              ${isLoading ? html`<span class="spinner"></span> Saving…`
                : isSuccess ? '✓ Harvest Logged!'
                : 'Log Harvest'}
            </button>
          </div>
        `
      }

      ${this._pickerOpen ? html`
        <div class="picker-overlay" @click="${() => this._pickerOpen = false}">
          <div class="picker-panel" @click="${(e) => e.stopPropagation()}">
            <div class="picker-handle"></div>
            <div class="picker-title">Select Produce</div>
            <div class="picker-list">
              ${map(this._produce, (item) => html`
                <div
                  class="picker-item ${this._selected?.key === item.key ? 'selected' : ''}"
                  @click="${() => this._pickProduce(item)}">
                  <img src="${item.image}" alt="${item.name}">
                  <span class="picker-item-name">${item.name}</span>
                  ${this._selected?.key === item.key
                    ? html`<span class="picker-item-check">check</span>`
                    : ''}
                </div>
              `)}
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }
}

customElements.define('garden-tracker', GardenTracker);
