import { LitElement, css, html } from 'lit';
import './window-titlebar.js';

export class OsWindow extends LitElement {
  static properties = {
    appId: { type: String },
    title: { type: String },
    icon: { type: String },
    open: { type: Boolean, reflect: true },
    minimized: { type: Boolean, reflect: true },
    maximized: { type: Boolean, reflect: true },
    focused: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host {
      position: absolute;

      top: 80px;
      left: 160px;

      display: block;

      width: 520px;
      height: 360px;

      max-width: calc(100% - 2rem);
      max-height: calc(100% - 2rem);

      color: #ffffff;

      z-index: 20;
    }

    :host([minimized]) {
      display: none;
    }

    :host([maximized]) {
      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      max-width: none;
      max-height: none;
    }

    .window {
      width: 100%;
      height: 100%;

      display: flex;
      flex-direction: column;

      overflow: hidden;

      box-sizing: border-box;

      background: rgba(20, 20, 25, 0.98);

      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;

      box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.45),
        0 4px 16px rgba(0, 0, 0, 0.25);
    }

    .window.focused {
      border-color: rgba(255, 255, 255, 0.35);
    }

    .window.maximized {
      border-radius: 0;
    }

    .window-content {
      flex: 1;

      min-height: 0;

      overflow: auto;

      padding: 1.5rem;

      box-sizing: border-box;
    }

    .window-content h2 {
      margin: 0 0 1rem;
      font-size: 1.5rem;
    }

    .window-content p {
      margin: 0 0 0.75rem;

      color: rgba(255, 255, 255, 0.7);
    }
  `;

  private handleMinimize(event: Event): void {
    event.stopPropagation();

    this.dispatchWindowEvent('window-minimize');
  }

  private handleMaximize(event: Event): void {
    event.stopPropagation();

    const maximized = !this.hasAttribute('maximized');

    this.dispatchEvent(
      new CustomEvent('window-maximize', {
        detail: {
          appId: this.getAppId(),
          maximized,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleClose(event: Event): void {
    event.stopPropagation();

    this.dispatchWindowEvent('window-close');
  }

  private handleFocus(): void {
    this.dispatchWindowEvent('window-focus');
  }

  private dispatchWindowEvent(
    eventName: 'window-minimize' | 'window-close' | 'window-focus'
  ): void {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: {
          appId: this.getAppId(),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private getAppId(): string {
    return this.getAttribute('appid') ?? '';
  }

  protected override render() {
    const title = this.getAttribute('title') ?? 'Mariana OS';

    const icon = this.getAttribute('icon') ?? '□';

    const focused = this.hasAttribute('focused');

    return html`
      <section
        class="window ${focused ? 'focused' : ''}"
        role="dialog"
        aria-label=${title}
        @mousedown=${this.handleFocus}
      >
        <mariana-window-titlebar
          title=${title}
          icon=${icon}
          @window-minimize=${this.handleMinimize}
          @window-maximize=${this.handleMaximize}
          @window-close=${this.handleClose}
        ></mariana-window-titlebar>

        <div class="window-content">
          <slot></slot>
        </div>
      </section>
    `;
  }
}

customElements.define('mariana-window', OsWindow);
