import { LitElement, html, css } from 'lit';
import { DateTime } from 'luxon';

class BatchDialog extends LitElement {

  static properties = {
    open: { type: Boolean, reflect: true },
    batchId: { type: String },    // null = create, string = edit
    batch: { type: Object },      // existing batch data when editing
    _numberOfBirds: { type: String, state: true },
    _hatchDate: { type: String, state: true },
    _dateOutToPasture: { type: String, state: true },
    _totalCarcassWeight: { type: String, state: true },
    _starterFeedLbs: { type: String, state: true },
    _growerFeedLbs: { type: String, state: true },
    _submitState: { type: String, state: true },  // 'idle' | 'loading' | 'success'
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
      width: 560px;
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
      font-size: 28px;
      color: #3E6B48;
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
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px 16px;
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

    .form-group input {
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

    .form-group input:focus {
      border-color: #3E6B48;
      box-shadow: 0 0 0 3px rgba(62, 107, 72, 0.12);
    }

    .form-group input::placeholder {
      color: #A3B5A8;
    }

    .form-group input:disabled {
      background: #F5F7F3;
      color: #8A9E8F;
    }

    .section-divider {
      grid-column: 1 / -1;
      border: none;
      border-top: 1px solid #E8ECE9;
      margin: 4px 0;
    }

    .section-label {
      grid-column: 1 / -1;
      font-size: 11px;
      font-weight: 600;
      color: #8A9E8F;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: -8px;
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
      background-color: #3E6B48;
      border: none;
      color: #FFFFFF;
    }

    .btn-submit:hover:not(:disabled) {
      background-color: #345A3D;
    }

    .btn-submit:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .btn-submit.loading {
      background-color: #5A8065;
    }

    .btn-submit.success {
      background-color: #2D7A3A;
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
    this.batchId = null;
    this.batch = null;
    this._numberOfBirds = '';
    this._hatchDate = '';
    this._dateOutToPasture = '';
    this._totalCarcassWeight = '';
    this._starterFeedLbs = '';
    this._growerFeedLbs = '';
    this._submitState = 'idle';
  }

  willUpdate(changedProperties) {
    // When the batch prop is set (edit mode), populate form fields
    if (changedProperties.has('batch') && this.batch) {
      this._numberOfBirds = this.batch.number_of_birds != null ? String(this.batch.number_of_birds) : '';
      this._hatchDate = this.batch.hatch_date
        ? DateTime.fromMillis(this.batch.hatch_date).toISODate()
        : '';
      this._dateOutToPasture = this.batch.date_out_to_pasture
        ? DateTime.fromMillis(this.batch.date_out_to_pasture).toISODate()
        : '';
      this._totalCarcassWeight = this.batch.total_carcass_weight != null ? String(this.batch.total_carcass_weight) : '';
      this._starterFeedLbs = this.batch.starter_feed_lbs != null ? String(this.batch.starter_feed_lbs) : '';
      this._growerFeedLbs = this.batch.grower_feed_lbs != null ? String(this.batch.grower_feed_lbs) : '';
    }
  }

  get _isEditing() {
    return !!this.batchId;
  }

  get _isValid() {
    return this._numberOfBirds && parseInt(this._numberOfBirds) > 0 && this._hatchDate;
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
            <span class="material-symbols-outlined dialog-header-icon">
              ${this._isEditing ? 'edit' : 'egg'}
            </span>
            <div class="dialog-header-text">
              <h3>${this._isEditing ? 'Edit Poultry Batch' : 'New Poultry Batch'}</h3>
              <p>${this._isEditing ? 'Update the details for this batch' : 'Enter the details for this batch of birds'}</p>
            </div>
          </div>

          <div class="dialog-body">

            <p class="section-label">Required</p>

            <div class="form-group">
              <label for="numberOfBirds">Number of Birds</label>
              <input
                id="numberOfBirds"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 50"
                .value="${this._numberOfBirds}"
                ?disabled="${isBusy}"
                @input="${(e) => this._numberOfBirds = e.target.value}"
              >
            </div>

            <div class="form-group">
              <label for="hatchDate">Hatch Date</label>
              <input
                id="hatchDate"
                type="date"
                .value="${this._hatchDate}"
                ?disabled="${isBusy}"
                @input="${(e) => this._hatchDate = e.target.value}"
              >
            </div>

            <hr class="section-divider">
            <p class="section-label">Optional</p>

            <div class="form-group">
              <label for="dateOutToPasture">
                Date Out to Pasture
                <span class="optional-tag">(optional)</span>
              </label>
              <input
                id="dateOutToPasture"
                type="date"
                .value="${this._dateOutToPasture}"
                ?disabled="${isBusy}"
                @input="${(e) => this._dateOutToPasture = e.target.value}"
              >
            </div>

            <div class="form-group">
              <label for="totalCarcassWeight">
                Total Carcass Weight
                <span class="optional-tag">(lbs, optional)</span>
              </label>
              <input
                id="totalCarcassWeight"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 187.5"
                .value="${this._totalCarcassWeight}"
                ?disabled="${isBusy}"
                @input="${(e) => this._totalCarcassWeight = e.target.value}"
              >
            </div>

            <div class="form-group">
              <label for="starterFeedLbs">
                Starter Feed Consumed
                <span class="optional-tag">(lbs, optional)</span>
              </label>
              <input
                id="starterFeedLbs"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 125.0"
                .value="${this._starterFeedLbs}"
                ?disabled="${isBusy}"
                @input="${(e) => this._starterFeedLbs = e.target.value}"
              >
            </div>

            <div class="form-group">
              <label for="growerFeedLbs">
                Grower Feed Consumed
                <span class="optional-tag">(lbs, optional)</span>
              </label>
              <input
                id="growerFeedLbs"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 312.0"
                .value="${this._growerFeedLbs}"
                ?disabled="${isBusy}"
                @input="${(e) => this._growerFeedLbs = e.target.value}"
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
                : this._isEditing ? 'Save Changes'
                : 'Save Batch'}
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
    this._resetForm();
    this.open = false;
    this.dispatchEvent(new CustomEvent('dialog-closed'));
  }

  _resetForm() {
    this._numberOfBirds = '';
    this._hatchDate = '';
    this._dateOutToPasture = '';
    this._totalCarcassWeight = '';
    this._starterFeedLbs = '';
    this._growerFeedLbs = '';
    this._submitState = 'idle';
  }

  _submit() {
    if (!this._isValid || this._submitState !== 'idle') return;

    this._submitState = 'loading';

    const batch = {
      number_of_birds: parseInt(this._numberOfBirds),
      hatch_date: DateTime.fromISO(this._hatchDate).toMillis(),
    };

    // Preserve original created_at on edits; set it fresh on creates
    if (!this._isEditing) {
      batch.created_at = Date.now();
    }

    if (this._dateOutToPasture) {
      batch.date_out_to_pasture = DateTime.fromISO(this._dateOutToPasture).toMillis();
    }
    if (this._totalCarcassWeight) {
      batch.total_carcass_weight = parseFloat(this._totalCarcassWeight);
    }
    if (this._starterFeedLbs) {
      batch.starter_feed_lbs = parseFloat(this._starterFeedLbs);
    }
    if (this._growerFeedLbs) {
      batch.grower_feed_lbs = parseFloat(this._growerFeedLbs);
    }

    this.dispatchEvent(new CustomEvent('batch-submit', {
      detail: {
        batch,
        batchId: this.batchId || null,
        resolve: () => this._onWriteComplete(),
      }
    }));
  }

  _onWriteComplete() {
    this._submitState = 'success';
    setTimeout(() => this._close(), 1400);
  }
}

customElements.define('batch-dialog', BatchDialog);
