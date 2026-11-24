import { LitElement, css, html } from 'lit';
import './os-window.js';

interface WindowState {
  appId: string;
  title: string;
  icon: string;
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
}

interface WindowConfig {
  appId: string;
  title: string;
  icon: string;
}

export class WindowManager extends LitElement {
  static styles = css`
    :host {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 56px;
      left: 0;

      display: block;
      z-index: 10;
      pointer-events: none;
    }

    .windows {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .window-container {
      pointer-events: auto;
    }
  `;

  private windows: WindowState[] = [];

  protected override render() {
    return html`
      <div
        class="windows"
        @window-close=${this.handleWindowClose}
        @window-minimize=${this.handleWindowMinimize}
        @window-maximize=${this.handleWindowMaximize}
        @window-focus=${this.handleWindowFocus}
      >
        ${this.windows.map(
          (window, index) => html`
            <mariana-window
              class="window-container"
              appid=${window.appId}
              title=${window.title}
              icon=${window.icon}
              ?open=${window.open}
              ?minimized=${window.minimized}
              ?maximized=${window.maximized}
              ?focused=${window.focused}
              style=${`
                z-index: ${index + 1};
                --window-offset: ${Math.min(index, 5) * 24}px;
              `}
            >
              <div>
                <h2>${window.title}</h2>
                <p>Bienvenida a ${window.title}.</p>
                <p>Primera versión del sistema de ventanas de Mariana OS.</p>
                <p>App ID: ${window.appId}</p>
              </div>
            </mariana-window>
          `
        )}
      </div>
    `;
  }

  public openWindow(appId: string): void {
    const existingWindow = this.windows.find(window => window.appId === appId);

    if (existingWindow) {
      // Recuperar una ventana ya existente.
      this.windows = this.windows.map(window => ({
        ...window,
        open: window.appId === appId ? true : window.open,
        minimized: window.appId === appId ? false : window.minimized,
      }));

      this.focusWindow(appId);
      return;
    }

    const config = this.getWindowConfig(appId);

    if (!config) {
      console.warn('[WindowManager] Aplicación desconocida:', appId);
      return;
    }

    const newWindow: WindowState = {
      ...config,
      open: true,
      minimized: false,
      maximized: false,
      focused: false,
    };

    this.windows = [...this.windows, newWindow];

    this.focusWindow(appId);
  }

  private handleWindowClose(event: Event): void {
    const appId = this.getEventAppId(event);

    if (!appId) return;

    this.windows = this.windows.filter(window => window.appId !== appId);

    this.focusNextWindow();
  }

  private handleWindowMinimize(event: Event): void {
    const appId = this.getEventAppId(event);

    if (!appId) return;

    this.windows = this.windows.map(window => ({
      ...window,
      minimized: window.appId === appId ? true : window.minimized,
      focused: window.appId === appId ? false : window.focused,
    }));

    this.focusNextWindow();
  }

  private handleWindowMaximize(event: Event): void {
    const customEvent = event as CustomEvent<{
      appId: string;
      maximized: boolean;
    }>;

    const { appId, maximized } = customEvent.detail ?? {};

    if (!appId || maximized === undefined) {
      return;
    }

    this.windows = this.windows.map(window => ({
      ...window,
      maximized: window.appId === appId ? maximized : window.maximized,
    }));

    this.focusWindow(appId);
  }

  private handleWindowFocus(event: Event): void {
    const appId = this.getEventAppId(event);

    if (!appId) return;

    this.focusWindow(appId);
  }

  /**
   * Coloca la ventana seleccionada al final
   * del arreglo para mostrarla por encima.
   */
  private focusWindow(appId: string): void {
    const selectedWindow = this.windows.find(window => window.appId === appId);

    if (!selectedWindow) return;

    const otherWindows = this.windows
      .filter(window => window.appId !== appId)
      .map(window => ({
        ...window,
        focused: false,
      }));

    this.windows = [
      ...otherWindows,
      {
        ...selectedWindow,
        focused: true,
        minimized: false,
        open: true,
      },
    ];

    this.requestUpdate();
  }

  /**
   * Enfoca la última ventana visible.
   */
  private focusNextWindow(): void {
    const nextWindow = [...this.windows]
      .reverse()
      .find(window => window.open && !window.minimized);

    if (!nextWindow) {
      this.windows = this.windows.map(window => ({
        ...window,
        focused: false,
      }));

      this.requestUpdate();
      return;
    }

    this.focusWindow(nextWindow.appId);
  }

  private getEventAppId(event: Event): string {
    const customEvent = event as CustomEvent<{
      appId: string;
    }>;

    return customEvent.detail?.appId ?? '';
  }

  private getWindowConfig(appId: string): WindowConfig | undefined {
    const configurations: Record<string, WindowConfig> = {
      memories: {
        appId: 'memories',
        title: 'Memories',
        icon: '♡',
      },
      timeline: {
        appId: 'timeline',
        title: 'Timeline',
        icon: '◷',
      },
      achievements: {
        appId: 'achievements',
        title: 'Achievements',
        icon: '★',
      },
      future: {
        appId: 'future',
        title: 'Future',
        icon: '◇',
      },
    };

    return configurations[appId];
  }
}

customElements.define('mariana-window-manager', WindowManager);
