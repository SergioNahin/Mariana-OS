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
      inset: 0;
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
          window => html`
            <mariana-window
              class="window-container"
              appid=${window.appId}
              title=${window.title}
              icon=${window.icon}
              ?open=${window.open}
              ?minimized=${window.minimized}
              ?maximized=${window.maximized}
              ?focused=${window.focused}
            >
              <div>
                <h2>${window.title}</h2>
                <p>Esta es la primera ventana de Mariana OS.</p>
                <p>Aplicación: ${window.appId}</p>
              </div>
            </mariana-window>
          `
        )}
      </div>
    `;
  }

  public openWindow(appId: string): void {
    console.log('[WindowManager] openWindow:', appId);

    const existingWindow = this.windows.find(window => window.appId === appId);

    if (existingWindow) {
      this.windows = this.windows.map(window => ({
        ...window,
        open: window.appId === appId ? true : window.open,
        minimized: window.appId === appId ? false : window.minimized,
        focused: window.appId === appId,
      }));

      this.requestUpdate();
      return;
    }

    const config = this.getWindowConfig(appId);

    if (!config) {
      console.warn('[WindowManager] Aplicación desconocida:', appId);
      return;
    }

    this.windows = [
      ...this.windows.map(window => ({
        ...window,
        focused: false,
      })),
      {
        ...config,
        open: true,
        minimized: false,
        maximized: false,
        focused: true,
      },
    ];

    console.log('[WindowManager] Ventanas actuales:', this.windows);

    this.requestUpdate();
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

    if (!appId || maximized === undefined) return;

    this.windows = this.windows.map(window => ({
      ...window,
      maximized: window.appId === appId ? maximized : window.maximized,
      focused: window.appId === appId,
    }));

    this.requestUpdate();
  }

  private handleWindowFocus(event: Event): void {
    const appId = this.getEventAppId(event);

    if (!appId) return;

    this.windows = this.windows.map(window => ({
      ...window,
      focused: window.appId === appId,
    }));

    this.requestUpdate();
  }

  private focusNextWindow(): void {
    const nextWindow = [...this.windows]
      .reverse()
      .find(window => window.open && !window.minimized);

    this.windows = this.windows.map(window => ({
      ...window,
      focused: nextWindow !== undefined && window.appId === nextWindow.appId,
    }));

    this.requestUpdate();
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
