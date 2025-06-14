import {LitElement, html, css} from 'lit';
import {map} from 'lit/directives/map.js';
import { firebase } from  "../../../../firebaseConfig.js"

class ProduceSelection extends LitElement {
  static properties = {
    produceReference: Object
  }

  static styles = css`

    #container {
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
    .selectableProduceDiv {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-width: 200px;
      min-height: 200px;
      margin: 25px;
      border: 1px solid black;
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
      ${map(Object.values(this.produceReference || {}), (item) => html`
        <div class="selectableProduceDiv">
          <img src="${item.image}" height="75">
          <span>${item.name}</span>
        </div>
        `
      )}
    </div>
    `;
  }

  async shouldUpdate(changedProperties) {
    console.log("changedProperties", changedProperties)
    if (changedProperties.has('processId')) {
      this.processConfig = await get(ref(getDatabase(), `processes/${this.processId}`)).then(s => s.val());
      this.currentBlock = {id: '-start', ...this.processConfig.blocks['-start']};
    }
  }
}

customElements.define('produce-selection', ProduceSelection);
