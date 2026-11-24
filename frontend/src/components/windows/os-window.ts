import { LitElement, css, html } from 'lit';
import './window-titlebar.js';

export class OsWindow extends LitElement {
  static properties = {
    appId: { type: String },
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

      top: calc(48px + var(--window-offset, 0px));
      left: min(calc(24px + var(--window-offset, 0px)), 15%);

      display: block;

      width: min(520px, calc(100% - 72px));
      height: min(360px, calc(100% - 64px));

      color: #ffffff;
      box-sizing: border-box;
    }

    :host(:not([open])),
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
      display: flex;
      flex-direction: column;

      width: 100%;
      height: 100%;

      overflow: hidden;
      box-sizing: border-box;

      background: rgba(20, 20, 25, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;

      box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.45),
        0 4px 16px rgba(0, 0, 0, 0.25);

      transition:
        border-color 150ms ease,
        box-shadow 150ms ease;
    }

    :host([focused]) .window {
      border-color: rgba(255, 255, 255, 0.45);

      box-shadow:
        0 24px 70px rgba(0, 0, 0, 0.55),
        0 0 0 1px rgba(255, 255, 255, 0.08);
    }

    :host([maximized]) .window {
      border-radius: 0;
    }

    .window-content {
      flex: 1;
      min-height: 0;

      overflow: auto;
      padding: 1.5rem;

      box-sizing: border-box;
    }

    ::slotted(*) {
      color: inherit;
    }

    @media (max-width: 640px) {
      :host(:not([maximized])) {
        top: 24px;
        left: 12px;

        width: calc(100% - 24px);
        height: min(420px, calc(100% - 48px));
      }

      .window-content {
        padding: 1rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .window {
        transition: none;
      }
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
    if (this.hasAttribute('focused')) {
      return;
    }

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

    return html`
      <section
        class="window"
        role="dialog"
        aria-label=${title}
        aria-modal="false"
        @pointerdown=${this.handleFocus}
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
