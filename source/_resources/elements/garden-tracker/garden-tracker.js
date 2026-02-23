import { LitElement, html, css } from 'lit';
import { map } from 'lit/directives/map.js';
import { firebase } from '../../../../firebaseConfig.js';
import { DateTime } from 'luxon';

class GardenTracker extends LitElement {

  static properties = {
    _produce: { type: Array, state: true },
    _loading: { type: Boolean, state: true },
    _selected: { type: Object, state: true },   // { key, name, image } | null
    _weight: { type: String, state: true },
    _submitState: { type: String, state: true }, // 'idle' | 'loading' | 'success'
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #F5F7F3;
      font-family: 'Roboto', sans-serif;
    }

    /* ── Header ── */
    .header {
      background-color: #3E6B48;
      padding: 20px 20px 18px;
      position: sticky;
      top: 0;
      z-index: 10;
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

    /* ── Produce list ── */
    .produce-list {
      padding: 12px 16px 32px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .produce-item {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #FFFFFF;
      border: 1px solid #E0E5E1;
      border-radius: 12px;
      padding: 14px 18px;
      cursor: pointer;
      transition: background-color 0.15s, border-color 0.15s;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }

    .produce-item:active {
      background-color: #F0F5F1;
      border-color: #B8D4BC;
    }

    .produce-item img {
      width: 48px;
      height: 48px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .produce-item-name {
      font-size: 16px;
      font-weight: 500;
      color: #2C3E2F;
    }

    .produce-item-arrow {
      margin-left: auto;
      font-size: 20px;
      color: #A3B5A8;
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Loading / empty states ── */
    .state-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 32px;
      color: #6B8070;
      gap: 8px;
      font-size: 15px;
    }

    /* ── Bottom sheet overlay ── */
    .overlay {
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

    .sheet {
      background: #FFFFFF;
      border-radius: 20px 20px 0 0;
      padding: 0 0 env(safe-area-inset-bottom, 16px);
      animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .sheet-handle {
      width: 40px;
      height: 4px;
      background: #D0D8D2;
      border-radius: 2px;
      margin: 12px auto 0;
    }

    .sheet-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 24px 16px;
      border-bottom: 1px solid #F0F3F0;
    }

    .sheet-header img {
      width: 44px;
      height: 44px;
      object-fit: contain;
    }

    .sheet-header-text h2 {
      margin: 0;
      font-size: 17px;
      font-weight: 600;
      color: #2C3E2F;
    }

    .sheet-header-text p {
      margin: 3px 0 0;
      font-size: 13px;
      color: #6B8070;
    }

    .sheet-body {
      padding: 20px 24px;
    }

    .form-group label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #4A6350;
      margin-bottom: 8px;
    }

    .form-group input {
      width: 100%;
      box-sizing: border-box;
      padding: 14px 16px;
      border: 1px solid #C8D5CB;
      border-radius: 10px;
      font-size: 18px;
      font-family: 'Roboto', sans-serif;
      color: #2C3E2F;
      outline: none;
      background: #FAFBFA;
      transition: border-color 0.2s;
      -webkit-appearance: none;
    }

    .form-group input:focus {
      border-color: #3E6B48;
      box-shadow: 0 0 0 3px rgba(62, 107, 72, 0.12);
    }

    .sheet-footer {
      padding: 4px 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .btn-log {
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
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
    }

    .btn-log:hover:not(:disabled) {
      background-color: #345A3D;
    }

    .btn-log:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-log.loading {
      background-color: #5A8065;
    }

    .btn-log.success {
      background-color: #2D7A3A;
    }

    .btn-cancel {
      width: 100%;
      padding: 14px;
      border: 1px solid #C8D5CB;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 500;
      font-family: 'Roboto', sans-serif;
      cursor: pointer;
      background: none;
      color: #4A6350;
    }

    .btn-cancel:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
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

  _selectProduce(item) {
    this._selected = item;
    this._weight = '';
    this._submitState = 'idle';
    // Focus the input after the sheet renders
    this.updateComplete.then(() => {
      this.shadowRoot.querySelector('#weight-input')?.focus();
    });
  }

  _close() {
    this._selected = null;
    this._weight = '';
    this._submitState = 'idle';
  }

  async _submit() {
    if (!this._weight || this._submitState !== 'idle') return;

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
      setTimeout(() => this._close(), 1200);
    } catch (error) {
      console.error('Error saving harvest:', error);
      this._submitState = 'idle';
    }
  }

  render() {
    return html`
      <div class="header">
        <h1>Garden Tracker</h1>
        <p>Weaver Farms — log a harvest</p>
      </div>

      ${this._loading
        ? html`<div class="state-message">Loading…</div>`
        : this._produce.length === 0
          ? html`<div class="state-message">No produce found</div>`
          : html`
            <div class="produce-list">
              ${map(this._produce, (item) => html`
                <div class="produce-item" @click="${() => this._selectProduce(item)}">
                  <img src="${item.image}" alt="${item.name}">
                  <span class="produce-item-name">${item.name}</span>
                  <span class="produce-item-arrow">chevron_right</span>
                </div>
              `)}
            </div>
          `
      }

      ${this._selected ? this._renderSheet() : ''}
    `;
  }

  _renderSheet() {
    const isLoading = this._submitState === 'loading';
    const isSuccess = this._submitState === 'success';
    const isBusy = isLoading || isSuccess;

    return html`
      <div class="overlay" @click="${this._onOverlayClick}">
        <div class="sheet" @click="${(e) => e.stopPropagation()}">
          <div class="sheet-handle"></div>

          <div class="sheet-header">
            <img src="${this._selected.image}" alt="${this._selected.name}">
            <div class="sheet-header-text">
              <h2>${this._selected.name}</h2>
              <p>Enter the weight harvested</p>
            </div>
          </div>

          <div class="sheet-body">
            <div class="form-group">
              <label for="weight-input">Weight (lbs)</label>
              <input
                id="weight-input"
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

          <div class="sheet-footer">
            <button
              class="btn-log ${this._submitState}"
              ?disabled="${!this._weight || isBusy}"
              @click="${this._submit}">
              ${isLoading ? html`<span class="spinner"></span> Saving…`
                : isSuccess ? '✓ Logged!'
                : 'Log Harvest'}
            </button>
            <button class="btn-cancel" ?disabled="${isBusy}" @click="${this._close}">Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _onOverlayClick() {
    if (this._submitState === 'idle') this._close();
  }
}

customElements.define('garden-tracker', GardenTracker);
