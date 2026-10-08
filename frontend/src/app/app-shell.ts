import { LitElement, css, html } from 'lit';
import '../components/system/boot-screen.js';
import '../components/desktop/os-desktop.js';

export class AppShell extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .app-shell {
      width: 100%;
      height: 100%;
    }
  `;

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
          : html` <mariana-desktop></mariana-desktop> `}
      </div>
    `;
  }

  private handleBootComplete(): void {
    this.showBootScreen = false;
    this.requestUpdate();
  }
}

customElements.define('mariana-app-shell', AppShell);
