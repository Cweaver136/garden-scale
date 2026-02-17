import { LitElement, html, css } from 'lit';
import '../produce-selection/produce-selection.js';
import '../historical-data/historical-data.js';

class GardenApp extends LitElement {

  static properties = {
    currentView: { type: String }
  }

  static styles = css`
    :host {
      display: block;
      height: 100vh;
      font-family: 'Roboto', sans-serif;
      background-color: #F5F7F3;
    }

    nav {
      display: flex;
      align-items: center;
      background-color: #3E6B48;
      height: 56px;
      padding: 0 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-title {
      color: #FFFFFF;
      font-size: 18px;
      font-weight: 600;
      margin-right: 40px;
      letter-spacing: 0.5px;
    }

    .nav-links {
      display: flex;
      gap: 4px;
      height: 100%;
      align-items: center;
    }

    .nav-link {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s;
      user-select: none;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.12);
      color: #FFFFFF;
    }

    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
    }

    .page-container {
      height: calc(100vh - 56px);
      overflow-y: auto;
    }

    .placeholder-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #5A7D6A;
      gap: 12px;
    }

    .placeholder-page .icon {
      font-size: 48px;
    }

    .placeholder-page h2 {
      margin: 0;
      font-weight: 500;
      font-size: 22px;
    }

    .placeholder-page p {
      margin: 0;
      color: #8A9E8F;
      font-size: 14px;
    }
  `;

  constructor() {
    super();
    this.currentView = this._getViewFromHash();
    window.addEventListener('hashchange', () => {
      this.currentView = this._getViewFromHash();
    });
  }

  _getViewFromHash() {
    const hash = window.location.hash.replace('#', '');
    const validViews = ['record-harvest', 'historical-data', 'financials'];
    return validViews.includes(hash) ? hash : 'record-harvest';
  }

  _navigate(view) {
    window.location.hash = view;
  }

  render() {
    return html`
      <nav>
        <span class="nav-title">Garden Scale</span>
        <div class="nav-links">
          <span
            class="nav-link ${this.currentView === 'historical-data' ? 'active' : ''}"
            @click="${() => this._navigate('historical-data')}">
            Historical Data
          </span>
          <span
            class="nav-link ${this.currentView === 'record-harvest' ? 'active' : ''}"
            @click="${() => this._navigate('record-harvest')}">
            Record Harvest
          </span>
          <span
            class="nav-link ${this.currentView === 'financials' ? 'active' : ''}"
            @click="${() => this._navigate('financials')}">
            Financials
          </span>
        </div>
      </nav>
      <div class="page-container">
        ${this._renderCurrentView()}
      </div>
    `;
  }

  _renderCurrentView() {
    switch (this.currentView) {
      case 'record-harvest':
        return html`<produce-selection></produce-selection>`;
      case 'historical-data':
        return html`<historical-data></historical-data>`;
      case 'financials':
        return this._renderFinancialsPlaceholder();
      default:
        return html`<produce-selection></produce-selection>`;
    }
  }

  _renderFinancialsPlaceholder() {
    return html`
      <div class="placeholder-page">
        <span class="icon material-symbols-outlined">account_balance</span>
        <h2>Financials</h2>
        <p>This section is coming soon.</p>
      </div>
    `;
  }
}

customElements.define('garden-app', GardenApp);
