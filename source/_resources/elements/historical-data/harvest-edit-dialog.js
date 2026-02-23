import { LitElement, html, css } from 'lit';
import { map } from 'lit/directives/map.js';
import { DateTime } from 'luxon';

class HarvestEditDialog extends LitElement {

  static properties = {
    open: { type: Boolean, reflect: true },
    harvest: { type: Object },            // existing harvest record
    produceReference: { type: Object },   // { key: { name, image } }
    _produceKey: { type: String, state: true },
    _weight: { type: String, state: true },
    _dateHarvested: { type: String, state: true },  // datetime-local format
    _temperature: { type: String, state: true },
    _submitState: { type: String, state: true },    // 'idle' | 'loading' | 'success'
  }

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
      display: none;
    }

    :host([open]) {
      display: block;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.15s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(12px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .dialog {
      background: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      width: 480px;
      max-width: 95vw;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.2s ease-out;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 24px;
      border-bottom: 1px solid #E8ECE9;
      background-color: #F5F7F3;
      position: sticky;
      top: 0;
    }

    .dialog-header-icon {
      font-size: 26px;
      color: #C96B1A;
    }

    .dialog-header-text h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #2C3E2F;
    }

    .dialog-header-text p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #6B8070;
    }

    .dialog-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 500;
      color: #4A6350;
    }

    .form-group label .optional-tag {
      font-weight: 400;
      color: #A3B5A8;
      margin-left: 4px;
    }

    .form-group input,
    .form-group select {
      padding: 10px 12px;
      border: 1px solid #C8D5CB;
      border-radius: 8px;
      font-size: 14px;
      font-family: 'Roboto', sans-serif;
      color: #2C3E2F;
      outline: none;
      transition: border-color 0.2s;
      background: #FFFFFF;
      width: 100%;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group select:focus {
      border-color: #C96B1A;
      box-shadow: 0 0 0 3px rgba(201, 107, 26, 0.12);
    }

    .form-group input::placeholder {
      color: #A3B5A8;
    }

    .form-group input:disabled,
    .form-group select:disabled {
      background: #F5F7F3;
      color: #8A9E8F;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 24px;
      border-top: 1px solid #E8ECE9;
      background-color: #FAFBFA;
      position: sticky;
      bottom: 0;
    }

    button {
      padding: 9px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      font-family: 'Roboto', sans-serif;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-cancel {
      background: none;
      border: 1px solid #C8D5CB;
      color: #4A6350;
    }

    .btn-cancel:hover:not(:disabled) {
      background-color: #F0F3F0;
    }

    .btn-cancel:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .btn-submit {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 130px;
      justify-content: center;
      background-color: #C96B1A;
      border: none;
      color: #FFFFFF;
    }

    .btn-submit:hover:not(:disabled) {
      background-color: #A85515;
    }

    .btn-submit:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .btn-submit.loading {
      background-color: #C98040;
    }

    .btn-submit.success {
      background-color: #C06010;
      transition: background-color 0.3s;
    }

    .spinner {
      width: 13px;
      height: 13px;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
      flex-shrink: 0;
    }

    .checkmark {
      font-size: 15px;
      line-height: 1;
    }
  `;

  constructor() {
    super();
    this.open = false;
    this.harvest = null;
    this.produceReference = {};
    this._produceKey = '';
    this._weight = '';
    this._dateHarvested = '';
    this._temperature = '';
    this._submitState = 'idle';
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('harvest') && this.harvest) {
      this._produceKey = this.harvest.produce_key || '';
      this._weight = this.harvest.harvest_weight != null ? String(this.harvest.harvest_weight) : '';
      this._dateHarvested = this.harvest.date_harvested
        ? DateTime.fromMillis(this.harvest.date_harvested).toFormat("yyyy-MM-dd'T'HH:mm")
        : '';
      this._temperature = this.harvest.temperature_at_harvest != null
        ? String(this.harvest.temperature_at_harvest)
        : '';
    }
  }

  get _produceOptions() {
    return Object.entries(this.produceReference || {})
      .map(([key, val]) => ({ key, name: val.name || key }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  get _isValid() {
    return this._produceKey && this._dateHarvested;
  }

  render() {
    if (!this.open) return html``;

    const isLoading = this._submitState === 'loading';
    const isSuccess = this._submitState === 'success';
    const isBusy = isLoading || isSuccess;

    return html`
      <div class="overlay" @click="${this._onOverlayClick}">
        <div class="dialog" @click="${(e) => e.stopPropagation()}">

          <div class="dialog-header">
            <span class="material-symbols-outlined dialog-header-icon">edit</span>
            <div class="dialog-header-text">
              <h3>Edit Harvest</h3>
              <p>Update the details for this harvest entry</p>
            </div>
          </div>

          <div class="dialog-body">

            <div class="form-group">
              <label for="produce">Produce</label>
              <select
                id="produce"
                .value="${this._produceKey}"
                ?disabled="${isBusy}"
                @change="${(e) => this._produceKey = e.target.value}"
              >
                ${map(this._produceOptions, (opt) => html`
                  <option value="${opt.key}" ?selected="${opt.key === this._produceKey}">${opt.name}</option>
                `)}
              </select>
            </div>

            <div class="form-group">
              <label for="dateHarvested">Date &amp; Time Harvested</label>
              <input
                id="dateHarvested"
                type="datetime-local"
                .value="${this._dateHarvested}"
                ?disabled="${isBusy}"
                @input="${(e) => this._dateHarvested = e.target.value}"
              >
            </div>

            <div class="form-group">
              <label for="weight">
                Weight (lbs)
                <span class="optional-tag">(optional)</span>
              </label>
              <input
                id="weight"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter weight"
                .value="${this._weight}"
                ?disabled="${isBusy}"
                @input="${(e) => this._weight = e.target.value}"
              >
            </div>

            <div class="form-group">
              <label for="temperature">
                Temperature (&deg;F)
                <span class="optional-tag">(optional)</span>
              </label>
              <input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="e.g. 72.5"
                .value="${this._temperature}"
                ?disabled="${isBusy}"
                @input="${(e) => this._temperature = e.target.value}"
              >
            </div>

          </div>

          <div class="dialog-footer">
            <button class="btn-cancel" ?disabled="${isBusy}" @click="${this._close}">Cancel</button>
            <button
              class="btn-submit ${this._submitState}"
              ?disabled="${!this._isValid || isBusy}"
              @click="${this._submit}">
              ${isLoading ? html`<span class="spinner"></span> Saving…`
                : isSuccess ? html`<span class="checkmark">✓</span> Saved!`
                : 'Save Changes'}
            </button>
          </div>

        </div>
      </div>
    `;
  }

  _onOverlayClick() {
    if (this._submitState === 'idle') this._close();
  }

  _close() {
    this._submitState = 'idle';
    this.open = false;
    this.dispatchEvent(new CustomEvent('dialog-closed'));
  }

  _submit() {
    if (!this._isValid || this._submitState !== 'idle') return;

    this._submitState = 'loading';

    const updated = {
      produce_key: this._produceKey,
      date_harvested: DateTime.fromISO(this._dateHarvested).toMillis(),
    };

    if (this._weight) {
      updated.harvest_weight = parseFloat(this._weight);
    }
    if (this._temperature) {
      updated.temperature_at_harvest = parseFloat(this._temperature);
    }

    this.dispatchEvent(new CustomEvent('harvest-edit-submit', {
      detail: {
        harvestId: this.harvest?.id,
        updated,
        resolve: () => this._onWriteComplete(),
      }
    }));
  }

  _onWriteComplete() {
    this._submitState = 'success';
    setTimeout(() => this._close(), 1400);
  }
}

customElements.define('harvest-edit-dialog', HarvestEditDialog);
