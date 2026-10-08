import { LitElement, css, html } from 'lit';

export class WindowTitlebar extends LitElement {
  static properties = {
    title: { type: String },
    icon: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }

    .titlebar {
      display: flex;
      align-items: center;
      justify-content: space-between;

      min-height: 42px;
      padding: 0 0.5rem 0 0.75rem;
      box-sizing: border-box;

      background: rgba(25, 25, 30, 0.96);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      user-select: none;
    }

    .titlebar-info {
      min-width: 0;

      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .window-icon {
      flex: 0 0 auto;

      width: 24px;
      height: 24px;

      display: grid;
      place-items: center;

      font-size: 0.9rem;
    }

    .title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      font-size: 0.85rem;
      font-weight: 500;
    }

    .window-controls {
      display: flex;
      align-items: center;
      gap: 0.15rem;
    }

    .window-control {
      width: 32px;
      height: 28px;

      display: grid;
      place-items: center;

      padding: 0;
      border: 0;
      border-radius: 6px;

      background: transparent;
      color: rgba(255, 255, 255, 0.8);

      font: inherit;
      cursor: pointer;
    }

    .window-control:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .window-control:focus-visible {
      outline: 2px solid #ffffff;
      outline-offset: -2px;
    }

    .close:hover {
      background: rgba(255, 80, 80, 0.25);
    }
  `;

  private emitWindowEvent(
    eventName: 'window-minimize' | 'window-maximize' | 'window-close'
  ): void {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleMinimize(): void {
    this.emitWindowEvent('window-minimize');
  }

  private handleMaximize(): void {
    this.emitWindowEvent('window-maximize');
  }

  private handleClose(): void {
    this.emitWindowEvent('window-close');
  }

  protected override render() {
    const title = this.getAttribute('title') ?? 'Mariana OS';

    const icon = this.getAttribute('icon') ?? '□';

    return html`
      <header class="titlebar">
        <div class="titlebar-info">
          <span class="window-icon" aria-hidden="true"> ${icon} </span>

          <span class="title"> ${title} </span>
        </div>

        <div class="window-controls" aria-label="Controles de ventana">
          <button
            class="window-control"
            type="button"
            aria-label="Minimizar ventana"
            @click=${this.handleMinimize}
          >
            −
          </button>

          <button
            class="window-control"
            type="button"
            aria-label="Maximizar ventana"
            @click=${this.handleMaximize}
          >
            □
          </button>

          <button
            class="window-control close"
            type="button"
            aria-label="Cerrar ventana"
            @click=${this.handleClose}
          >
            ×
          </button>
        </div>
      </header>
    `;
  }
}

customElements.define('mariana-window-titlebar', WindowTitlebar);
