import { LitElement, css, html } from 'lit';

export class BootScreen extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .boot-screen {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      background: #0b0b0f;
      color: #ffffff;
    }

    .boot-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      text-align: center;
    }

    .boot-logo {
      width: 72px;
      height: 72px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 18px;
      font-size: 2rem;
      font-weight: 600;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
    }

    p {
      margin: 0;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
    }

    .boot-loader {
      width: 180px;
      height: 3px;
      margin-top: 1rem;
      overflow: hidden;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
    }
  `;

  protected override render() {
    return html`
      <section class="boot-screen" aria-label="Iniciando Mariana OS">
        <div class="boot-content">
          <div class="boot-logo" aria-hidden="true">M</div>

          <h1>Mariana OS</h1>

          <p>Iniciando sistema...</p>

          <div
            class="boot-loader"
            role="progressbar"
            aria-label="Iniciando Mariana OS"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="0"
          ></div>
        </div>
      </section>
    `;
  }
}

customElements.define('mariana-boot-screen', BootScreen);
