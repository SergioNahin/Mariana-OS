import { LitElement, css, html } from 'lit';
import './os-taskbar.js';

export class OsDesktop extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .desktop {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #15151a;
      color: #ffffff;
    }

    .desktop-content {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding-bottom: 56px;
    }

    .desktop-title {
      margin: 0;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      font-weight: 400;
      opacity: 0.9;
    }
  `;

  protected override render() {
    return html`
      <main class="desktop" aria-label="Escritorio de Mariana OS">
        <div class="desktop-content">
          <h1 class="desktop-title">Mariana OS</h1>
        </div>

        <mariana-taskbar></mariana-taskbar>
      </main>
    `;
  }
}

customElements.define('mariana-desktop', OsDesktop);
