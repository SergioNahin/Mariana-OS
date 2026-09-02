import { LitElement, html } from 'lit';
import '../components/system/boot-screen.js';

export class AppShell extends LitElement {
  protected override render() {
    return html`
      <div class="app-shell">
        <mariana-boot-screen></mariana-boot-screen>
      </div>
    `;
  }
}

customElements.define('mariana-app-shell', AppShell);