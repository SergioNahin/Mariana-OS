import { LitElement, html } from 'lit';
import '../components/system/boot-screen.js';

export class AppShell extends LitElement {
  private showBootScreen = true;

  protected override render() {
    return html`
      <div class="app-shell">
        ${this.showBootScreen
          ? html`
              <mariana-boot-screen
                @boot-complete=${this.handleBootComplete}
              ></mariana-boot-screen>
            `
          : html`
              <main>
                <h1>Mariana OS</h1>
              </main>
            `}
      </div>
    `;
  }

  private handleBootComplete(): void {
    this.showBootScreen = false;
    this.requestUpdate();
  }
}

customElements.define('mariana-app-shell', AppShell);
