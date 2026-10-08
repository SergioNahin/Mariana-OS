import { LitElement, css, html } from 'lit';
import './window-titlebar.js';

export class OsWindow extends LitElement {
  static properties = {
    title: { type: String },
    icon: { type: String },
    open: { type: Boolean },
    minimized: { type: Boolean },
    maximized: { type: Boolean },
    focused: { type: Boolean },
  };

  static styles = css`
    :host {
      position: absolute;
      display: block;

      width: 520px;
      height: 360px;

      max-width: calc(100% - 2rem);
      max-height: calc(100% - 2rem);

      color: #ffffff;
    }

    .window {
      width: 100%;
      height: 100%;

      display: flex;
      flex-direction: column;

      overflow: hidden;

      background: rgba(20, 20, 25, 0.96);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;

      box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.35),
        0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .window.focused {
      border-color: rgba(255, 255, 255, 0.25);
    }

    .window.maximized {
      width: 100vw;
      height: 100vh;
      max-width: none;
      max-height: none;

      border-radius: 0;
    }

    .window-content {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding: 1.5rem;
    }

    .window-content[hidden] {
      display: none;
    }
  `;

  title = 'Mariana OS';
  icon = '□';
  open = true;
  minimized = false;
  maximized = false;
  focused = false;

  private handleMinimize(): void {
    this.minimized = true;

    this.dispatchEvent(
      new CustomEvent('window-minimize', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleMaximize(): void {
    this.maximized = !this.maximized;

    this.dispatchEvent(
      new CustomEvent('window-maximize', {
        detail: {
          maximized: this.maximized,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleClose(): void {
    this.open = false;

    this.dispatchEvent(
      new CustomEvent('window-close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleFocus(): void {
    this.dispatchEvent(
      new CustomEvent('window-focus', {
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    if (!this.open) {
      return html``;
    }

    return html`
      <section
        class="window ${this.focused ? 'focused' : ''} ${this.maximized
          ? 'maximized'
          : ''}"
        role="dialog"
        aria-label=${this.title}
        @mousedown=${this.handleFocus}
      >
        <mariana-window-titlebar
          title=${this.title}
          icon=${this.icon}
          @window-minimize=${this.handleMinimize}
          @window-maximize=${this.handleMaximize}
          @window-close=${this.handleClose}
        ></mariana-window-titlebar>

        <div class="window-content" ?hidden=${this.minimized}>
          <slot></slot>
        </div>
      </section>
    `;
  }
}

customElements.define('mariana-window', OsWindow);
