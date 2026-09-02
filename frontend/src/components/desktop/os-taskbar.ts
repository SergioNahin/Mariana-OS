import { LitElement, css, html } from 'lit';

export class OsTaskbar extends LitElement {
  static styles = css`
    :host {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 100;
      display: block;
    }

    .taskbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 56px;
      padding: 0 1rem;
      box-sizing: border-box;
      background: rgba(15, 15, 20, 0.88);
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(16px);
    }

    .taskbar-start,
    .taskbar-end {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .launcher {
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 10px;
      background: transparent;
      color: inherit;
      font: inherit;
      font-size: 1.1rem;
      cursor: pointer;
    }

    .launcher:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .system-time {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.75);
    }
  `;

  protected override render() {
    return html`
      <nav class="taskbar" aria-label="Barra de tareas">
        <div class="taskbar-start">
          <button
            class="launcher"
            type="button"
            aria-label="Abrir menú de aplicaciones"
          >
            M
          </button>
        </div>

        <div class="taskbar-end">
          <time class="system-time"> Mariana OS </time>
        </div>
      </nav>
    `;
  }
}

customElements.define('mariana-taskbar', OsTaskbar);
