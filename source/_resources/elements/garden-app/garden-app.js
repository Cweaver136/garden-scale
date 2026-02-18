import { LitElement, html, css } from 'lit';
import '../produce-selection/produce-selection.js';
import '../historical-data/historical-data.js';

class GardenApp extends LitElement {

  static properties = {
    currentView: { type: String },
    _livestockOpen: { type: Boolean, state: true },
    _gardenOpen: { type: Boolean, state: true },
  }

  static styles = css`
    :host {
      display: block;
      height: 100vh;
      font-family: 'Roboto', sans-serif;
    }

    #app {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    /* Top header bar */
    #header {
      background-color: #3E6B48;
      height: 56px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      flex-shrink: 0;
      z-index: 100;
    }

    #header .app-title {
      color: #FFFFFF;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    /* Body: sidebar + content */
    #body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* Sidebar */
    #sidebar {
      width: 232px;
      background-color: #2C4E32;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow-y: auto;
    }

    /* Drawer toggle rows (Livestock, Garden) */
    .nav-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      cursor: pointer;
      user-select: none;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.15s;
    }

    .nav-section:hover {
      background-color: rgba(255, 255, 255, 0.07);
    }

    .nav-section.open {
      background-color: rgba(255, 255, 255, 0.09);
    }

    .nav-section .section-label {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .nav-section .section-label .material-symbols-outlined {
      font-size: 20px;
      opacity: 0.85;
    }

    .nav-chevron {
      font-size: 20px;
      opacity: 0.6;
      transition: transform 0.2s ease;
    }

    .nav-chevron.rotated {
      transform: rotate(180deg);
    }

    /* Drawer sub-items */
    .drawer {
      overflow: hidden;
      max-height: 0;
      transition: max-height 0.25s ease;
      background-color: #243d29;
    }

    .drawer.open {
      max-height: 300px;
    }

    .drawer-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 18px 11px 48px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.75);
      transition: background-color 0.15s, color 0.15s;
      user-select: none;
    }

    .drawer-item:hover {
      background-color: rgba(255, 255, 255, 0.07);
      color: rgba(255, 255, 255, 0.95);
    }

    .drawer-item.active {
      color: #90C795;
      background-color: rgba(255, 255, 255, 0.06);
    }

    .drawer-item .material-symbols-outlined {
      font-size: 16px;
      opacity: 0.85;
    }

    /* Top-level Financials link (no drawer) */
    .nav-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      cursor: pointer;
      user-select: none;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.15s;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.07);
    }

    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.09);
      color: #90C795;
    }

    .nav-link .material-symbols-outlined {
      font-size: 20px;
      opacity: 0.85;
    }

    /* Main content */
    #main {
      flex: 1;
      background-color: #F5F7F3;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    /* Placeholder pages */
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
    this._livestockOpen = false;
    this._gardenOpen = true;
    this.currentView = this._getViewFromHash();
    window.addEventListener('hashchange', () => {
      this.currentView = this._getViewFromHash();
    });
  }

  _getViewFromHash() {
    const hash = window.location.hash.replace('#', '');
    const validViews = ['record-harvest', 'historical-data', 'garden-financials', 'poultry', 'financials'];
    return validViews.includes(hash) ? hash : 'record-harvest';
  }

  _navigate(view) {
    window.location.hash = view;
  }

  render() {
    return html`
      <div id="app">

        <div id="header">
          <span class="app-title">Weaver Farms</span>
        </div>

        <div id="body">

          <!-- Sidebar -->
          <nav id="sidebar">

            <!-- Livestock (drawer) -->
            <div
              class="nav-section ${this._livestockOpen ? 'open' : ''}"
              @click="${() => this._livestockOpen = !this._livestockOpen}">
              <span class="section-label">
                <span class="material-symbols-outlined">pets</span>
                Livestock
              </span>
              <span class="material-symbols-outlined nav-chevron ${this._livestockOpen ? 'rotated' : ''}">expand_more</span>
            </div>
            <div class="drawer ${this._livestockOpen ? 'open' : ''}">
              <div
                class="drawer-item ${this.currentView === 'poultry' ? 'active' : ''}"
                @click="${() => this._navigate('poultry')}">
                <span class="material-symbols-outlined">egg</span>
                Poultry
              </div>
            </div>

            <!-- Garden (drawer) -->
            <div
              class="nav-section ${this._gardenOpen ? 'open' : ''}"
              @click="${() => this._gardenOpen = !this._gardenOpen}">
              <span class="section-label">
                <span class="material-symbols-outlined">yard</span>
                Garden
              </span>
              <span class="material-symbols-outlined nav-chevron ${this._gardenOpen ? 'rotated' : ''}">expand_more</span>
            </div>
            <div class="drawer ${this._gardenOpen ? 'open' : ''}">
              <div
                class="drawer-item ${this.currentView === 'historical-data' ? 'active' : ''}"
                @click="${() => this._navigate('historical-data')}">
                <span class="material-symbols-outlined">history</span>
                Historical Data
              </div>
              <div
                class="drawer-item ${this.currentView === 'record-harvest' ? 'active' : ''}"
                @click="${() => this._navigate('record-harvest')}">
                <span class="material-symbols-outlined">add_circle</span>
                Record Harvest
              </div>
              <div
                class="drawer-item ${this.currentView === 'garden-financials' ? 'active' : ''}"
                @click="${() => this._navigate('garden-financials')}">
                <span class="material-symbols-outlined">payments</span>
                Financials
              </div>
            </div>

            <!-- Financials (top-level, no drawer) -->
            <div
              class="nav-link ${this.currentView === 'financials' ? 'active' : ''}"
              @click="${() => this._navigate('financials')}">
              <span class="material-symbols-outlined">account_balance</span>
              Financials
            </div>

          </nav>

          <!-- Main content -->
          <main id="main">
            ${this._renderCurrentView()}
          </main>

        </div>
      </div>
    `;
  }

  _renderCurrentView() {
    switch (this.currentView) {
      case 'record-harvest':
        return html`<produce-selection></produce-selection>`;
      case 'historical-data':
        return html`<historical-data></historical-data>`;
      case 'garden-financials':
        return html`
          <div class="placeholder-page">
            <span class="icon material-symbols-outlined">payments</span>
            <h2>Garden Financials</h2>
            <p>Garden revenue and expense tracking is coming soon.</p>
          </div>
        `;
      case 'poultry':
        return html`
          <div class="placeholder-page">
            <span class="icon material-symbols-outlined">egg</span>
            <h2>Poultry</h2>
            <p>Poultry performance tracking is coming soon.</p>
          </div>
        `;
      case 'financials':
        return html`
          <div class="placeholder-page">
            <span class="icon material-symbols-outlined">account_balance</span>
            <h2>Financials</h2>
            <p>Overall farm financial overview is coming soon.</p>
          </div>
        `;
      default:
        return html`<produce-selection></produce-selection>`;
    }
  }
}

customElements.define('garden-app', GardenApp);
