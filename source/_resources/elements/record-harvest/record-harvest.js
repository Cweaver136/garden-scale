import { LitElement, html, css } from 'lit';
import { map } from 'lit/directives/map.js';
import { firebase } from '../../../../firebaseConfig.js';
import { DateTime } from 'luxon';
import './harvest-dialog.js';

class RecordHarvest extends LitElement {

  static properties = {
    produceReference: { type: Object },
    _selectedProduce: { type: Object, state: true },
    _dialogOpen: { type: Boolean, state: true }
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .page-header {
      padding: 28px 32px 12px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: #2C3E2F;
    }

    .page-header p {
      margin: 6px 0 0 0;
      font-size: 14px;
      color: #6B8070;
    }

    .produce-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      padding: 20px 32px 32px;
    }

    .produce-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 160px;
      height: 160px;
      background: #FFFFFF;
      border: 1px solid #D8E0DA;
      border-radius: 12px;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      gap: 10px;
    }

    .produce-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 16px rgba(62, 107, 72, 0.12);
      border-color: #8DAB7F;
    }

    .produce-card img {
      width: 64px;
      height: 64px;
      object-fit: contain;
    }

    .produce-card span {
      font-size: 14px;
      font-weight: 500;
      color: #2C3E2F;
    }
  `;

  constructor() {
    super();
    this.produceReference = {};
    this._selectedProduce = null;
    this._dialogOpen = false;

    firebase.database().ref('produce_reference').once('value').then(s => {
      this.produceReference = s.val();
    });
  }

  render() {
    return html`
      <div class="page-header">
        <h1>Record Harvest</h1>
        <p>Select the produce you harvested</p>
      </div>
      <div class="produce-grid">
        ${map(Object.entries(this.produceReference || {}), ([key, item]) => html`
          <div class="produce-card" @click="${() => this._openDialog(key, item)}">
            <img src="${item.image}" alt="${item.name}">
            <span>${item.name}</span>
          </div>
        `)}
      </div>
      <harvest-dialog
        ?open="${this._dialogOpen}"
        .produceName="${this._selectedProduce?.name || ''}"
        .produceKey="${this._selectedProduce?.key || ''}"
        .produceImage="${this._selectedProduce?.image || ''}"
        @harvest-submit="${this._onHarvestSubmit}"
        @dialog-closed="${() => this._dialogOpen = false}"
      ></harvest-dialog>
    `;
  }

  _openDialog(key, item) {
    this._selectedProduce = { key, name: item.name, image: item.image };
    this._dialogOpen = true;
  }

  async _onHarvestSubmit(e) {
    const { produceKey, weight, resolve } = e.detail;

    try {
      let update = {};
      update.produce_key = produceKey;
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
        update.temperature_at_harvest = json?.main?.temp;
      } catch (error) {
        console.error('Error fetching temperature:', error.message);
      }

      update.harvest_weight = weight;

      await firebase.database().ref('harvest').push(update);
    } finally {
      resolve?.();
    }
  }
}

customElements.define('record-harvest', RecordHarvest);
