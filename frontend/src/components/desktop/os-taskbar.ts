import { LitElement, css, html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

interface TaskbarWindow {
  appId: string;
  title: string;
  icon: string;
  minimized: boolean;
  focused: boolean;
}

export class OsTaskbar extends LitElement {
  static styles = css`
    :host {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 100;
      display: block;
      color: #ffffff;
    }

    .taskbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;

      width: 100%;
      height: 56px;
      padding: 0 1rem;
      box-sizing: border-box;

      background: rgba(15, 15, 20, 0.94);
      border-top: 1px solid rgba(255, 255, 255, 0.12);

      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
    }

    .taskbar-start {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex: 1;
      min-width: 0;
    }

    .brand {
      flex: 0 0 auto;

      display: grid;
      place-items: center;

      width: 40px;
      height: 40px;
      box-sizing: border-box;

      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 11px;

      background: rgba(255, 255, 255, 0.07);
      color: #ffffff;

      font-size: 1.1rem;
      font-weight: 600;
      user-select: none;
    }

    .separator {
      flex: 0 0 auto;
      width: 1px;
      height: 26px;
      background: rgba(255, 255, 255, 0.12);
    }

    .taskbar-apps {
      display: flex;
      align-items: center;
      gap: 0.4rem;

      flex: 1;
      min-width: 0;

      overflow-x: auto;
      overflow-y: hidden;

      scrollbar-width: none;
      overscroll-behavior-x: contain;
    }

    .taskbar-apps::-webkit-scrollbar {
      display: none;
    }

    .taskbar-app {
      position: relative;
      flex: 0 0 auto;

      display: grid;
      place-items: center;

      width: 42px;
      height: 42px;
      padding: 0;
      box-sizing: border-box;

      border: 1px solid transparent;
      border-radius: 11px;

      background: transparent;
      color: rgba(255, 255, 255, 0.85);

      font: inherit;
      font-size: 1.25rem;
      cursor: pointer;

      transition:
        background 150ms ease,
        border-color 150ms ease,
        color 150ms ease,
        opacity 150ms ease;
    }

    .taskbar-app:hover {
      background: rgba(255, 255, 255, 0.09);
      color: #ffffff;
    }

    .taskbar-app:focus-visible {
      outline: 2px solid #ffffff;
      outline-offset: 2px;
    }

    .taskbar-app.active {
      background: rgba(244, 172, 195, 0.13);
      border-color: rgba(244, 172, 195, 0.24);
      color: #ffd5e2;
    }

    .taskbar-app.minimized {
      opacity: 0.6;
    }

    .taskbar-app.minimized:hover {
      opacity: 1;
    }

    .app-icon {
      line-height: 1;
      pointer-events: none;
    }

    .app-indicator {
      position: absolute;
      bottom: 2px;
      left: 50%;

      width: 13px;
      height: 3px;
      border-radius: 999px;

      background: rgba(255, 255, 255, 0.45);
      transform: translateX(-50%);

      transition:
        width 150ms ease,
        background 150ms ease;
    }

    .taskbar-app.active .app-indicator {
      width: 22px;
      background: #f4acc3;
    }

    .taskbar-app.minimized .app-indicator {
      width: 6px;
      background: rgba(255, 255, 255, 0.35);
    }

    .taskbar-end {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
    }

    .system-label {
      color: rgba(255, 255, 255, 0.65);
      font-size: 0.8rem;
      white-space: nowrap;
      user-select: none;
    }

    @media (max-width: 600px) {
      .taskbar {
        gap: 0.5rem;
        padding: 0 0.5rem;
      }

      .taskbar-start {
        gap: 0.4rem;
      }

      .taskbar-app {
        width: 38px;
        height: 38px;
      }

      .brand {
        width: 38px;
        height: 38px;
      }

      .system-label {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .taskbar-app,
      .app-indicator {
        transition: none;
      }
    }
  `;

  private windows: TaskbarWindow[] = [];

  public setWindows(windows: TaskbarWindow[]): void {
    console.log('[OsTaskbar] Actualizando aplicaciones:', windows);

    this.windows = [...windows];
    this.requestUpdate();
  }

  private handleAppClick(appId: string): void {
    this.dispatchEvent(
      new CustomEvent('taskbar-window-activate', {
        detail: {
          appId,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private getAccessibleLabel(window: TaskbarWindow): string {
    if (window.minimized) {
      return `Restaurar ${window.title}`;
    }

    if (window.focused) {
      return `${window.title}, ventana activa`;
    }

    return `Activar ${window.title}`;
  }

  protected override render() {
    return html`
      <nav class="taskbar" aria-label="Barra de tareas de Mariana OS">
        <div class="taskbar-start">
          <span class="brand" aria-label="Mariana OS" title="Mariana OS">
            M
          </span>

          <div class="separator" aria-hidden="true"></div>

          <div
            class="taskbar-apps"
            role="group"
            aria-label="Aplicaciones abiertas"
          >
            ${repeat(
              this.windows,
              window => window.appId,
              window => html`
                <button
                  class=${`
                    taskbar-app
                    ${window.focused ? 'active' : ''}
                    ${window.minimized ? 'minimized' : ''}
                  `}
                  type="button"
                  title=${window.title}
                  aria-label=${this.getAccessibleLabel(window)}
                  aria-pressed=${window.focused ? 'true' : 'false'}
                  @click=${() => this.handleAppClick(window.appId)}
                >
                  <span class="app-icon" aria-hidden="true">
                    ${window.icon}
                  </span>

                  <span class="app-indicator" aria-hidden="true"></span>
                </button>
              `
            )}
          </div>
        </div>

        <div class="taskbar-end">
          <span class="system-label"> Mariana OS </span>
        </div>
      </nav>
    `;
  }
}

customElements.define('mariana-taskbar', OsTaskbar);
