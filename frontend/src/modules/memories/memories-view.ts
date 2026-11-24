import { LitElement, css, html } from 'lit';

export class MemoriesView extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      min-height: 100px;
      color: #ffffff;
    }

    .memories {
      display: block;
      padding: 1rem;
      box-sizing: border-box;
    }

    h1 {
      margin: 0 0 1rem;
      font-size: 1.5rem;
      color: #ffffff;
    }

    p {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
    }
  `;

  protected override render() {
    return html`
      <section class="memories">
        <h1>Memories ♡</h1>

        <p>Bienvenida a nuestros recuerdos.</p>

        <p>Esta es la primera aplicación de Mariana OS.</p>

        <p>
          Si puedes visualizar este contenido, el componente MemoriesView está
          funcionando.
        </p>
      </section>
    `;
  }
}

customElements.define('mariana-memories-view', MemoriesView);
