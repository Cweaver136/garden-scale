import { LitElement, html, css } from 'lit';
import '../record-harvest/record-harvest.js';
import '../historical-data/historical-data.js';
import '../poultry-tracking/poultry-tracking.js';

class FarmTracking extends LitElement {

  static properties = {
    currentView: { type: String },
    _livestockOpen: { type: Boolean, state: true },
    _gardenOpen: { type: Boolean, state: true },
  }

  static styles = css`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0');

    /* Ensure icon font works inside shadow DOM */
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
      height: 100vh;
      font-family: 'Roboto', sans-serif;
    }

    #app {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    /* ── Top navigation bar ── */
    #header {
      background-color: #3E6B48;
      height: 56px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      flex-shrink: 0;
      position: relative;
      z-index: 200;
      gap: 32px;
    }

    .app-title {
      color: #FFFFFF;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .nav-items {
      display: flex;
      align-items: center;
      height: 100%;
      gap: 4px;
    }

    /* ── Nav buttons (top-level) ── */
    .nav-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 100%;
      padding: 0 14px;
      color: rgba(255, 255, 255, 0.85);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      user-select: none;
      border-bottom: 2px solid transparent;
      transition: color 0.15s, border-color 0.15s, background-color 0.15s;
      box-sizing: border-box;
      white-space: nowrap;
    }

    .nav-btn:hover {
      color: #FFFFFF;
      background-color: rgba(255, 255, 255, 0.08);
    }

    .nav-btn.open,
    .nav-btn.active {
      color: #FFFFFF;
      border-bottom-color: #90C795;
    }

    .nav-btn .nav-chevron {
      font-size: 18px;
      opacity: 0.7;
      transition: transform 0.2s ease;
    }

    .nav-btn .nav-chevron.rotated {
      transform: rotate(180deg);
    }

    /* ── Dropdown wrapper (positions the panel) ── */
    .nav-dropdown {
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
    }

    /* ── Dropdown panel ── */
    .dropdown-panel {
      position: absolute;
      top: 100%;
      left: 0;
      background-color: #2C4E32;
      min-width: 196px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      visibility: hidden;
      opacity: 0;
      transform: translateY(-6px);
      transition: opacity 0.15s ease, transform 0.15s ease, visibility 0s linear 0.15s;
      z-index: 300;
    }

    .dropdown-panel.open {
      visibility: visible;
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.15s ease, transform 0.15s ease, visibility 0s;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      font-size: 13px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      user-select: none;
      transition: background-color 0.15s, color 0.15s;
    }

    .dropdown-item:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #FFFFFF;
    }

    .dropdown-item.active {
      color: #90C795;
      background-color: rgba(255, 255, 255, 0.06);
    }

    .dropdown-item .material-symbols-outlined {
      font-size: 17px;
      opacity: 0.85;
    }

    /* ── Main content ── */
    #main {
      flex: 1;
      background-color: #F5F7F3;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    /* ── Placeholder pages ── */
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
    this._gardenOpen = false;
    this.currentView = this._getViewFromHash();
    window.addEventListener('hashchange', () => {
      this.currentView = this._getViewFromHash();
    });
    // Close dropdowns when clicking outside the component
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target) && !e.composedPath().includes(this)) {
        this._livestockOpen = false;
        this._gardenOpen = false;
      }
    });
  }

  _getViewFromHash() {
    const hash = window.location.hash.replace('#', '');
    const validViews = ['record-harvest', 'historical-data', 'poultry', 'farm-financials'];
    return validViews.includes(hash) ? hash : 'record-harvest';
  }

  _navigate(view) {
    this._livestockOpen = false;
    this._gardenOpen = false;
    window.location.hash = view;
  }

  render() {
    const gardenViews = ['record-harvest', 'historical-data'];
    const livestockViews = ['poultry'];

    return html`
      <div id="app">

        <div id="header">
          <span class="app-title">Weaver Farms</span>

          <nav class="nav-items">

            <!-- Garden (dropdown drawer) -->
            <div class="nav-dropdown">
              <div
                class="nav-btn ${this._gardenOpen || gardenViews.includes(this.currentView) ? 'open' : ''}"
                @click="${(e) => { e.stopPropagation(); this._livestockOpen = false; this._gardenOpen = !this._gardenOpen; }}">
                <span class="material-symbols-outlined">yard</span>
                Garden
                <span class="material-symbols-outlined nav-chevron ${this._gardenOpen ? 'rotated' : ''}">expand_more</span>
              </div>
              <div class="dropdown-panel ${this._gardenOpen ? 'open' : ''}">
                <div
                  class="dropdown-item ${this.currentView === 'record-harvest' ? 'active' : ''}"
                  @click="${() => this._navigate('record-harvest')}">
                  <span class="material-symbols-outlined">add_circle</span>
                  Record Harvest
                </div>
                <div
                  class="dropdown-item ${this.currentView === 'historical-data' ? 'active' : ''}"
                  @click="${() => this._navigate('historical-data')}">
                  <span class="material-symbols-outlined">history</span>
                  Historical Data
                </div>
              </div>
            </div>

            <!-- Livestock (dropdown drawer) -->
            <div class="nav-dropdown">
              <div
                class="nav-btn ${this._livestockOpen || livestockViews.includes(this.currentView) ? 'open' : ''}"
                @click="${(e) => { e.stopPropagation(); this._gardenOpen = false; this._livestockOpen = !this._livestockOpen; }}">
                <span class="material-symbols-outlined">pets</span>
                Livestock
                <span class="material-symbols-outlined nav-chevron ${this._livestockOpen ? 'rotated' : ''}">expand_more</span>
              </div>
              <div class="dropdown-panel ${this._livestockOpen ? 'open' : ''}">
                <div
                  class="dropdown-item ${this.currentView === 'poultry' ? 'active' : ''}"
                  @click="${() => this._navigate('poultry')}">
                  <span class="material-symbols-outlined">egg</span>
                  Poultry
                </div>
              </div>
            </div>

            <!-- financials (direct link, no dropdown) -->
            <div
              class="nav-btn ${this.currentView === 'farm-financials' ? 'active' : ''}"
              @click="${() => this._navigate('farm-financials')}">
              <span class="material-symbols-outlined">account_balance</span>
              Farm Financials
            </div>

          </nav>
        </div>

        <!-- Main content -->
        <main id="main">
          ${this._renderCurrentView()}
        </main>

      </div>
    `;
  }

  _renderCurrentView() {
    switch (this.currentView) {
      case 'record-harvest':
        return html`<record-harvest></record-harvest>`;
      case 'historical-data':
        return html`<historical-data></historical-data>`;
      case 'farm-financials':
        return html`
          <div class="placeholder-page">
            <span class="icon material-symbols-outlined">payments</span>
            <h2>Farm Financials</h2>
            <p>Farm revenue and expense tracking is coming soon.</p>
          </div>
        `;
      case 'poultry':
        return html`<poultry-tracking></poultry-tracking>`;
      default:
        return html`<record-harvest></record-harvest>`;
    }
  }
}

customElements.define('farm-tracking', FarmTracking);
