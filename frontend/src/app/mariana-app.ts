import { LitElement, html } from 'lit';
import './app-shell.js';

export class MarianaApp extends LitElement {
  protected override render() {
    return html`
      <mariana-app-shell>
        <h1>Mariana OS</h1>
      </mariana-app-shell>
    `;
  }
}

customElements.define('mariana-app', MarianaApp);