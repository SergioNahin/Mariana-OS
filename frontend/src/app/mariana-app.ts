import { LitElement, html } from 'lit';

export class MarianaApp extends LitElement {
  protected override render() {
    return html`
      <main>
        <h1>Mariana OS</h1>
      </main>
    `;
  }
}

customElements.define('mariana-app', MarianaApp);