import { LitElement, html, css } from 'lit';
import { map } from 'lit/directives/map.js';
import { firebase } from '../../../../firebaseConfig.js';

class ExpenseDialog extends LitElement {

  static properties = {
    open: { type: Boolean, reflect: true },
    batch: { type: Object },
    _expenses: { type: Array, state: true },
    _editingExpenseId: { type: String, state: true },
    _newCost: { type: String, state: true },
    _newDescription: { type: String, state: true },
    _addState: { type: String, state: true },     // 'idle' | 'saving'
    _editCost: { type: String, state: true },
    _editDescription: { type: String, state: true },
    _editState: { type: String, state: true },    // 'idle' | 'saving'
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
      width: 580px;
      max-width: 95vw;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.2s ease-out;
    }

    /* ── Header ── */
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 24px;
      border-bottom: 1px solid #E8ECE9;
      background-color: #F5F7F3;
      border-radius: 12px 12px 0 0;
      flex-shrink: 0;
    }

    .dialog-header-icon {
      font-size: 26px;
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

    /* ── Scrollable body ── */
    .dialog-body {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    /* ── Expense list ── */
    .expense-list {
      padding: 8px 0 0;
    }

    .list-header {
      display: flex;
      align-items: center;
      padding: 6px 24px;
      font-size: 11px;
      font-weight: 600;
      color: #8A9E8F;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .list-header .col-desc { flex: 1; }
    .list-header .col-cost { width: 90px; text-align: right; }
    .list-header .col-actions { width: 70px; }

    .expense-row {
      display: flex;
      align-items: center;
      padding: 10px 24px;
      gap: 12px;
      border-top: 1px solid #F0F3F0;
      min-height: 44px;
    }

    .expense-row:first-of-type {
      border-top: none;
    }

    .expense-desc {
      flex: 1;
      font-size: 14px;
      color: #2C3E2F;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .expense-cost {
      width: 90px;
      text-align: right;
      font-size: 14px;
      color: #2C3E2F;
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .expense-actions {
      width: 70px;
      display: flex;
      gap: 4px;
      align-items: center;
      flex-shrink: 0;
    }

    /* Edit row inputs */
    .edit-input {
      padding: 7px 10px;
      border: 1px solid #3E6B48;
      border-radius: 6px;
      font-size: 13px;
      font-family: 'Roboto', sans-serif;
      color: #2C3E2F;
      outline: none;
      background: #FFFFFF;
      box-sizing: border-box;
    }

    .edit-input:focus {
      box-shadow: 0 0 0 3px rgba(62, 107, 72, 0.12);
    }

    .edit-input.desc-input {
      flex: 1;
    }

    .edit-input.cost-input {
      width: 90px;
      flex-shrink: 0;
    }

    /* Total row */
    .total-row {
      display: flex;
      align-items: center;
      padding: 10px 24px;
      border-top: 2px solid #E0E5E1;
      margin-top: 4px;
    }

    .total-label {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      color: #4A6350;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .total-amount {
      width: 90px;
      text-align: right;
      font-size: 15px;
      font-weight: 600;
      color: #2C5E34;
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    /* Empty state inside dialog */
    .expense-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 32px 24px 16px;
      color: #A3B5A8;
    }

    .expense-empty .material-symbols-outlined {
      font-size: 32px;
    }

    .expense-empty p {
      margin: 0;
      font-size: 13px;
      color: #8A9E8F;
    }

    /* ── Add expense section ── */
    .add-section {
      padding: 16px 24px 20px;
      border-top: 1px solid #E8ECE9;
      background-color: #FAFBFA;
      flex-shrink: 0;
    }

    .add-label {
      font-size: 11px;
      font-weight: 600;
      color: #8A9E8F;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 10px 0;
    }

    .add-form {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .add-input {
      padding: 9px 12px;
      border: 1px solid #C8D5CB;
      border-radius: 8px;
      font-size: 14px;
      font-family: 'Roboto', sans-serif;
      color: #2C3E2F;
      outline: none;
      transition: border-color 0.2s;
      background: #FFFFFF;
      box-sizing: border-box;
    }

    .add-input:focus {
      border-color: #3E6B48;
      box-shadow: 0 0 0 3px rgba(62, 107, 72, 0.12);
    }

    .add-input::placeholder {
      color: #A3B5A8;
    }

    .add-input:disabled {
      background: #F5F7F3;
      color: #8A9E8F;
    }

    .add-input.desc-input {
      flex: 1;
    }

    .add-input.cost-input {
      width: 110px;
      flex-shrink: 0;
    }

    .btn-add {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      background-color: #3E6B48;
      border: none;
      border-radius: 8px;
      color: #FFFFFF;
      cursor: pointer;
      flex-shrink: 0;
      transition: background-color 0.2s;
      padding: 0;
    }

    .btn-add:hover:not(:disabled) {
      background-color: #345A3D;
    }

    .btn-add:disabled {
      background-color: #A3B5A8;
      cursor: not-allowed;
    }

    .btn-add .material-symbols-outlined {
      font-size: 20px;
    }

    /* ── Row action buttons ── */
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
      font-size: 16px;
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

    .action-btn.save {
      color: #3E6B48;
    }

    .action-btn.save:hover:not(:disabled) {
      background-color: #E8ECE9;
    }

    .action-btn.save:disabled {
      color: #A3B5A8;
      cursor: not-allowed;
    }

    .action-btn.cancel {
      color: #6B8070;
    }

    .action-btn.cancel:hover {
      background-color: #F0F3F0;
    }

    /* ── Footer ── */
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      padding: 14px 24px;
      border-top: 1px solid #E8ECE9;
      background-color: #FAFBFA;
      border-radius: 0 0 12px 12px;
      flex-shrink: 0;
    }

    .btn-done {
      padding: 9px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      font-family: 'Roboto', sans-serif;
      background-color: #3E6B48;
      border: none;
      color: #FFFFFF;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-done:hover {
      background-color: #345A3D;
    }

    /* Spinner for add button */
    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
    }
  `;

  constructor() {
    super();
    this.open = false;
    this.batch = null;
    this._expenses = [];
    this._editingExpenseId = null;
    this._newCost = '';
    this._newDescription = '';
    this._addState = 'idle';
    this._editCost = '';
    this._editDescription = '';
    this._editState = 'idle';
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('open') && this.open && this.batch?.id) {
      this._loadExpenses();
    }
  }

  async _loadExpenses() {
    const snap = await firebase.database()
      .ref(`poultry_batches/${this.batch.id}/expenses`)
      .once('value');
    const data = snap.val();
    this._expenses = data
      ? Object.entries(data)
          .map(([id, e]) => ({ id, ...e }))
          .sort((a, b) => (a.created_at || 0) - (b.created_at || 0))
      : [];
  }

  get _totalCost() {
    return this._expenses.reduce((sum, e) => sum + (e.cost || 0), 0);
  }

  get _canAdd() {
    return this._newDescription.trim() && this._newCost !== '' && parseFloat(this._newCost) >= 0;
  }

  get _canSaveEdit() {
    return this._editDescription.trim() && this._editCost !== '' && parseFloat(this._editCost) >= 0;
  }

  async _addExpense() {
    if (!this._canAdd || this._addState !== 'idle') return;
    this._addState = 'saving';
    try {
      await firebase.database()
        .ref(`poultry_batches/${this.batch.id}/expenses`)
        .push({
          cost: parseFloat(this._newCost),
          description: this._newDescription.trim(),
          created_at: Date.now(),
        });
      this._newCost = '';
      this._newDescription = '';
      await this._loadExpenses();
      this.dispatchEvent(new CustomEvent('expenses-changed'));
    } catch (error) {
      console.error('Error adding expense:', error);
    }
    this._addState = 'idle';
  }

  _startEdit(expense) {
    this._editingExpenseId = expense.id;
    this._editCost = String(expense.cost);
    this._editDescription = expense.description;
    this._editState = 'idle';
  }

  _cancelEdit() {
    this._editingExpenseId = null;
    this._editCost = '';
    this._editDescription = '';
    this._editState = 'idle';
  }

  async _saveEdit() {
    if (!this._canSaveEdit || this._editState !== 'idle') return;
    this._editState = 'saving';
    try {
      await firebase.database()
        .ref(`poultry_batches/${this.batch.id}/expenses/${this._editingExpenseId}`)
        .update({
          cost: parseFloat(this._editCost),
          description: this._editDescription.trim(),
        });
      this._cancelEdit();
      await this._loadExpenses();
      this.dispatchEvent(new CustomEvent('expenses-changed'));
    } catch (error) {
      console.error('Error saving expense:', error);
    }
    this._editState = 'idle';
  }

  async _deleteExpense(expense) {
    if (!window.confirm(`Delete expense "${expense.description}"?`)) return;
    try {
      await firebase.database()
        .ref(`poultry_batches/${this.batch.id}/expenses/${expense.id}`)
        .remove();
      await this._loadExpenses();
      this.dispatchEvent(new CustomEvent('expenses-changed'));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  }

  _close() {
    this._newCost = '';
    this._newDescription = '';
    this._addState = 'idle';
    this._cancelEdit();
    this.open = false;
    this.dispatchEvent(new CustomEvent('dialog-closed'));
  }

  render() {
    if (!this.open || !this.batch) return html``;

    return html`
      <div class="overlay" @click="${this._close}">
        <div class="dialog" @click="${(e) => e.stopPropagation()}">

          <div class="dialog-header">
            <span class="material-symbols-outlined dialog-header-icon">receipt_long</span>
            <div class="dialog-header-text">
              <h3>Batch Expenses</h3>
              <p>${this.batch.number_of_birds} birds — hatched ${this.batch._hatchDateFormatted}</p>
            </div>
          </div>

          <div class="dialog-body">
            ${this._renderExpenseList()}
            ${this._renderAddForm()}
          </div>

          <div class="dialog-footer">
            <button class="btn-done" @click="${this._close}">Done</button>
          </div>

        </div>
      </div>
    `;
  }

  _renderExpenseList() {
    if (this._expenses.length === 0) {
      return html`
        <div class="expense-empty">
          <span class="material-symbols-outlined">receipt</span>
          <p>No expenses recorded yet</p>
        </div>
      `;
    }

    return html`
      <div class="expense-list">
        <div class="list-header">
          <span class="col-desc">Description</span>
          <span class="col-cost">Cost</span>
          <span class="col-actions"></span>
        </div>
        ${map(this._expenses, (expense) =>
          this._editingExpenseId === expense.id
            ? this._renderEditRow(expense)
            : this._renderExpenseRow(expense)
        )}
        <div class="total-row">
          <span class="total-label">Total</span>
          <span class="total-amount">$${this._totalCost.toFixed(2)}</span>
        </div>
      </div>
    `;
  }

  _renderExpenseRow(expense) {
    return html`
      <div class="expense-row">
        <span class="expense-desc" title="${expense.description}">${expense.description}</span>
        <span class="expense-cost">$${expense.cost.toFixed(2)}</span>
        <div class="expense-actions">
          <button class="action-btn edit" title="Edit" @click="${() => this._startEdit(expense)}">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="action-btn delete" title="Delete" @click="${() => this._deleteExpense(expense)}">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    `;
  }

  _renderEditRow(expense) {
    const isSaving = this._editState === 'saving';
    return html`
      <div class="expense-row">
        <input
          class="edit-input desc-input"
          type="text"
          placeholder="Description"
          .value="${this._editDescription}"
          ?disabled="${isSaving}"
          @input="${(e) => this._editDescription = e.target.value}"
          @keydown="${(e) => { if (e.key === 'Enter') this._saveEdit(); if (e.key === 'Escape') this._cancelEdit(); }}"
        >
        <input
          class="edit-input cost-input"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          .value="${this._editCost}"
          ?disabled="${isSaving}"
          @input="${(e) => this._editCost = e.target.value}"
          @keydown="${(e) => { if (e.key === 'Enter') this._saveEdit(); if (e.key === 'Escape') this._cancelEdit(); }}"
        >
        <div class="expense-actions">
          <button
            class="action-btn save"
            title="Save"
            ?disabled="${!this._canSaveEdit || isSaving}"
            @click="${this._saveEdit}">
            <span class="material-symbols-outlined">check</span>
          </button>
          <button
            class="action-btn cancel"
            title="Cancel"
            ?disabled="${isSaving}"
            @click="${this._cancelEdit}">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    `;
  }

  _renderAddForm() {
    const isSaving = this._addState === 'saving';
    return html`
      <div class="add-section">
        <p class="add-label">Add Expense</p>
        <div class="add-form">
          <input
            class="add-input desc-input"
            type="text"
            placeholder="Description"
            .value="${this._newDescription}"
            ?disabled="${isSaving}"
            @input="${(e) => this._newDescription = e.target.value}"
            @keydown="${(e) => { if (e.key === 'Enter') this._addExpense(); }}"
          >
          <input
            class="add-input cost-input"
            type="number"
            min="0"
            step="0.01"
            placeholder="$ Cost"
            .value="${this._newCost}"
            ?disabled="${isSaving}"
            @input="${(e) => this._newCost = e.target.value}"
            @keydown="${(e) => { if (e.key === 'Enter') this._addExpense(); }}"
          >
          <button
            class="btn-add"
            title="Add expense"
            ?disabled="${!this._canAdd || isSaving}"
            @click="${this._addExpense}">
            ${isSaving
              ? html`<span class="spinner"></span>`
              : html`<span class="material-symbols-outlined">add</span>`}
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define('expense-dialog', ExpenseDialog);
