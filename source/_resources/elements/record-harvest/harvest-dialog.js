import { LitElement, html, css } from 'lit';

class HarvestDialog extends LitElement {

  static properties = {
    open: { type: Boolean, reflect: true },
    produceName: { type: String },
    produceKey: { type: String },
    produceImage: { type: String },
    weight: { type: String },
    _submitState: { type: String, state: true },  // 'idle' | 'loading' | 'success'
  }

  static styles = css`
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
      width: 420px;
      max-width: 90vw;
      animation: slideUp 0.2s ease-out;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 24px;
      border-bottom: 1px solid #E8ECE9;
      background-color: #F5F7F3;
    }

    .dialog-header img {
      border-radius: 8px;
      background-color: #FFFFFF;
      padding: 4px;
      border: 1px solid #E0E5E1;
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

    .form-group input {
      padding: 10px 12px;
      border: 1px solid #C8D5CB;
      border-radius: 8px;
      font-size: 14px;
      font-family: 'Roboto', sans-serif;
      color: #2C3E2F;
      outline: none;
      transition: border-color 0.2s;
    }

    .form-group input:focus {
      border-color: #3E6B48;
      box-shadow: 0 0 0 3px rgba(62, 107, 72, 0.12);
    }

    .form-group input::placeholder {
      color: #A3B5A8;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 24px;
      border-top: 1px solid #E8ECE9;
      background-color: #FAFBFA;
    }

    button {
      padding: 9px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      font-family: 'Roboto', sans-serif;
      cursor: pointer;
      transition: background-color 0.2s, min-width 0.2s;
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
      min-width: 116px;
      justify-content: center;
      background-color: #3E6B48;
      border: none;
      color: #FFFFFF;
    }

    .btn-submit:hover:not(:disabled) {
      background-color: #345A3D;
    }

    .btn-submit:disabled {
      cursor: not-allowed;
    }

    .btn-submit.loading {
      background-color: #5A8065;
    }

    .btn-submit.success {
      background-color: #2D7A3A;
      transition: background-color 0.3s;
    }

    /* CSS spinner */
    .spinner {
      width: 13px;
      height: 13px;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
      flex-shrink: 0;
    }

    /* Checkmark */
    .checkmark {
      font-size: 15px;
      line-height: 1;
    }
  `;

  constructor() {
    super();
    this.open = false;
    this.produceName = '';
    this.produceKey = '';
    this.produceImage = '';
    this.weight = '';
    this._submitState = 'idle';
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
            ${this.produceImage
              ? html`<img src="${this.produceImage}" height="44" width="44" alt="${this.produceName}">`
              : ''}
            <div class="dialog-header-text">
              <h3>Record Harvest</h3>
              <p>${this.produceName}</p>
            </div>
          </div>
          <div class="dialog-body">
            <div class="form-group">
              <label for="weight">Weight (lbs)</label>
              <input
                id="weight"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter weight"
                .value="${this.weight}"
                ?disabled="${isBusy}"
                @input="${(e) => this.weight = e.target.value}"
              >
            </div>
          </div>
          <div class="dialog-footer">
            <button class="btn-cancel" ?disabled="${isBusy}" @click="${this._close}">Cancel</button>
            <button
              class="btn-submit ${this._submitState}"
              ?disabled="${!this.weight || isBusy}"
              @click="${this._submit}">
              ${isLoading ? html`<span class="spinner"></span> Saving…`
                : isSuccess ? html`<span class="checkmark">✓</span> Saved!`
                : 'Save Harvest'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _onOverlayClick() {
    // Don't allow dismissal while a write is in flight
    if (this._submitState === 'idle') this._close();
  }

  _close() {
    this.weight = '';
    this._submitState = 'idle';
    this.open = false;
    this.dispatchEvent(new CustomEvent('dialog-closed'));
  }

  _submit() {
    if (!this.weight || this._submitState !== 'idle') return;

    this._submitState = 'loading';

    this.dispatchEvent(new CustomEvent('harvest-submit', {
      detail: {
        produceKey: this.produceKey,
        weight: parseFloat(this.weight),
        resolve: () => this._onWriteComplete(),
      }
    }));
  }

  _onWriteComplete() {
    this._submitState = 'success';
    setTimeout(() => this._close(), 1400);
  }
}

customElements.define('harvest-dialog', HarvestDialog);
