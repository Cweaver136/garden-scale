import {LitElement, html, css} from 'lit';
import {map} from 'lit/directives/map.js';
import { firebase } from  "../../../../firebaseConfig.js"
import { DateTime } from "luxon";

class ProduceSelection extends LitElement {

  static properties = {
    produceReference: { type: Object },
    currentView: { type: String },
    livestockOpen: { type: Boolean },
    gardenOpen: { type: Boolean },
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }
    #app {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    #header {
      background-color: #4a6741;
      height: 60px;
      width: 100%;
      display: flex;
      align-items: center;
      padding: 0 24px;
      box-sizing: border-box;
      flex-shrink: 0;
    }
    #header h1 {
      color: white;
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      letter-spacing: 0.5px;
    }
    #body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* Sidebar */
    #nav {
      width: 230px;
      background-color: #2e4a2b;
      color: white;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow-y: auto;
    }

    /* Top-level nav items with drawers */
    .nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 500;
      user-select: none;
      transition: background-color 0.15s;
    }
    .nav-item:hover {
      background-color: rgba(255,255,255,0.08);
    }
    .nav-item.open {
      background-color: rgba(255,255,255,0.1);
    }
    .nav-item .nav-label {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .nav-chevron {
      font-size: 20px;
      transition: transform 0.2s ease;
      opacity: 0.75;
    }
    .nav-chevron.rotated {
      transform: rotate(180deg);
    }

    /* Drawer sub-menu */
    .drawer {
      overflow: hidden;
      max-height: 0;
      transition: max-height 0.25s ease;
      background-color: #243d21;
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
      font-size: 14px;
      color: rgba(255,255,255,0.8);
      transition: background-color 0.15s;
    }
    .drawer-item:hover {
      background-color: rgba(255,255,255,0.07);
    }
    .drawer-item.active {
      color: #a8d5a2;
      background-color: rgba(255,255,255,0.06);
    }
    .drawer-item .material-symbols-outlined {
      font-size: 18px;
      opacity: 0.8;
    }

    /* Top-level Financials (no drawer) */
    .nav-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 500;
      color: white;
      user-select: none;
      transition: background-color 0.15s;
    }
    .nav-link:hover {
      background-color: rgba(255,255,255,0.08);
    }
    .nav-link.active {
      background-color: rgba(255,255,255,0.12);
      color: #a8d5a2;
    }

    /* Main content area */
    #main {
      flex: 1;
      background-color: #8DAB7F;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    /* Record Harvest produce grid */
    #produceSelection {
      display: flex;
      flex-wrap: wrap;
      flex-grow: 1;
      justify-content: center;
      padding: 20px;
    }
    .produceOption {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-width: 200px;
      max-height: 200px;
      margin: 25px;
      border: 1px solid black;
      border-radius: 12px;
      background: white;
    }
    .produceOption:hover {
      transform: scale(1.05);
      cursor: pointer;
    }

    /* Placeholder views */
    .placeholder-view {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      color: white;
      gap: 16px;
    }
    .placeholder-view .material-symbols-outlined {
      font-size: 64px;
      opacity: 0.6;
    }
    .placeholder-view h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
    .placeholder-view p {
      margin: 0;
      opacity: 0.7;
      font-size: 14px;
    }
  `

  constructor() {
    super();
    this.currentView = 'record-harvest';
    this.livestockOpen = false;
    this.gardenOpen = true;

    firebase.database().ref('produce_reference').once('value').then(s => {
      this.produceReference = s.val();
    });
  }

  _toggleLivestock() {
    this.livestockOpen = !this.livestockOpen;
  }

  _toggleGarden() {
    this.gardenOpen = !this.gardenOpen;
  }

  _setView(view) {
    this.currentView = view;
  }

  _renderContent() {
    switch (this.currentView) {
      case 'record-harvest':
        return html`
          <div id="produceSelection">
            ${map(Object.entries(this.produceReference || {}), ([key, item]) => html`
              <div id="${key}" class="produceOption" @click="${this.weighProduce}">
                <img src="${item.image}" height="75">
                <span>${item.name}</span>
              </div>
            `)}
          </div>
        `;
      case 'historical-data':
        return html`
          <div class="placeholder-view">
            <span class="material-symbols-outlined">history</span>
            <h2>Historical Data</h2>
            <p>Garden harvest history and trends will appear here.</p>
          </div>
        `;
      case 'garden-financials':
        return html`
          <div class="placeholder-view">
            <span class="material-symbols-outlined">payments</span>
            <h2>Garden Financials</h2>
            <p>Garden revenue and expense tracking will appear here.</p>
          </div>
        `;
      case 'poultry':
        return html`
          <div class="placeholder-view">
            <span class="material-symbols-outlined">egg</span>
            <h2>Poultry</h2>
            <p>Poultry performance tracking will appear here.</p>
          </div>
        `;
      case 'financials':
        return html`
          <div class="placeholder-view">
            <span class="material-symbols-outlined">account_balance</span>
            <h2>Financials</h2>
            <p>Overall farm financial overview will appear here.</p>
          </div>
        `;
      default:
        return html``;
    }
  }

  render() {
    return html`
      <div id="app">
        <div id="header">
          <h1>Weaver Farms</h1>
        </div>
        <div id="body">

          <!-- Sidebar Navigation -->
          <nav id="nav">

            <!-- Livestock (drawer) -->
            <div class="nav-item ${this.livestockOpen ? 'open' : ''}" @click="${this._toggleLivestock}">
              <span class="nav-label">
                <span class="material-symbols-outlined">pets</span>
                Livestock
              </span>
              <span class="material-symbols-outlined nav-chevron ${this.livestockOpen ? 'rotated' : ''}">expand_more</span>
            </div>
            <div class="drawer ${this.livestockOpen ? 'open' : ''}">
              <div class="drawer-item ${this.currentView === 'poultry' ? 'active' : ''}" @click="${() => this._setView('poultry')}">
                <span class="material-symbols-outlined">egg</span>
                Poultry
              </div>
            </div>

            <!-- Garden (drawer) -->
            <div class="nav-item ${this.gardenOpen ? 'open' : ''}" @click="${this._toggleGarden}">
              <span class="nav-label">
                <span class="material-symbols-outlined">yard</span>
                Garden
              </span>
              <span class="material-symbols-outlined nav-chevron ${this.gardenOpen ? 'rotated' : ''}">expand_more</span>
            </div>
            <div class="drawer ${this.gardenOpen ? 'open' : ''}">
              <div class="drawer-item ${this.currentView === 'historical-data' ? 'active' : ''}" @click="${() => this._setView('historical-data')}">
                <span class="material-symbols-outlined">history</span>
                Historical Data
              </div>
              <div class="drawer-item ${this.currentView === 'record-harvest' ? 'active' : ''}" @click="${() => this._setView('record-harvest')}">
                <span class="material-symbols-outlined">add_circle</span>
                Record Harvest
              </div>
              <div class="drawer-item ${this.currentView === 'garden-financials' ? 'active' : ''}" @click="${() => this._setView('garden-financials')}">
                <span class="material-symbols-outlined">payments</span>
                Financials
              </div>
            </div>

            <!-- Financials (top-level, no drawer) -->
            <div class="nav-link ${this.currentView === 'financials' ? 'active' : ''}" @click="${() => this._setView('financials')}">
              <span class="material-symbols-outlined">account_balance</span>
              Financials
            </div>

          </nav>

          <!-- Main Content -->
          <main id="main">
            ${this._renderContent()}
          </main>

        </div>
      </div>
    `;
  }

  async weighProduce(e) {
    let update = {};
    update.produce_key = e?.currentTarget?.id;

    // Timestamp of harvest
    update.date_harvested = DateTime.now().ts;

    // Temperature at time of harvest
    const API_KEY = '18ec2e0a89f38de836ae9e5f16371798';
    const BASE_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${40.241413}&lon=${-77.228106}&units=imperial&appid=${API_KEY}`;
    try {
      const response = await fetch(BASE_URL);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      const temp = json?.main?.temp;
      update.temperature_at_harvest = temp;
    } catch (error) {
      alert('There was an error fetching temperature data');
      console.error(error.message);
    }

    // Weight of produce
    update.harvest_weight = 123;

    await firebase.database().ref('harvest').push(update);
    alert('Harvest successfully logged!');
  }
}

customElements.define('produce-selection', ProduceSelection);
