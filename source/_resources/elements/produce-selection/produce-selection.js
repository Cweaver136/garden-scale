import {LitElement, html} from 'lit';

class ProduceSelection extends LitElement {
  static properties = {}

  render() {
    return html`
    <p>Welcome to the Lit tutorial!</p>
    `;
  }
}

customElements.define('produce-selection', ProduceSelection);
