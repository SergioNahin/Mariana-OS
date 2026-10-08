import { LitElement, html, css } from 'lit';
import './app-shell.js';

export class MarianaApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  protected override render() {
    return html`
      <mariana-app-shell>
        <h1>Mariana OS</h1>
      </mariana-app-shell>
    `;
  }
}

customElements.define('mariana-app', MarianaApp);
