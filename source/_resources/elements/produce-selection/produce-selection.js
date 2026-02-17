import {LitElement, html, css} from 'lit';
import {map} from 'lit/directives/map.js';
import { firebase } from  "../../../../firebaseConfig.js"
import { DateTime } from "luxon";

class ProduceSelection extends LitElement {

  static properties = {
    produceReference: Object
  }

  static styles = css`

    #container {
      height: 100%;
      display: flex;
      justify-content: center;
      flex-direction: column
    }
    #header {
      background-color: #8DAB7F;
      height: 60px;
      width: 100%;
      position: absolute;
      top: 0;
    }
    #produceSelection {
      background-color: #8DAB7F;
      height: calc(100% - 60px);
      margin-top: 60px;
      display: flex;
      flex-wrap: wrap;
      flex-grow: 1;
      justify-content: center;
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
    }
    .produceOption:hover {
      transform: scale(1.05);
      cursor: pointer
    }
  `
  constructor() {
    super();

    firebase.database().ref('produce_reference').once('value').then(s => {
      this.produceReference = s.val();
    });
      
  }

  render() {
    return html`
    <div id="container">
      <div id="header">
        <span>Texts</span>
      </div>
      <div id="produceSelection">
        ${map(Object.entries(this.produceReference || {}), ([key, item]) => html`
          <div id="${key}" class="produceOption" @click="${this.weighProduce}">
            <img src="${item.image}" height="75">
            <span>${item.name}</span>
          </div>
          `
        )}
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
