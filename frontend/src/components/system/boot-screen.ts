import { LitElement, html } from 'lit';

export class BootScreen extends LitElement {
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
