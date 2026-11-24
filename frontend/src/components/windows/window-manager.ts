import { LitElement, css, html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import './os-window.js';
import '../../modules/memories/memories-view.js';

interface WindowConfig {
  appId: string;
  title: string;
  icon: string;
}

interface WindowState extends WindowConfig {
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

interface WindowEventDetail {
  appId: string;
}

interface MoveEventDetail extends WindowEventDetail {
  deltaX: number;
  deltaY: number;
}

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface ResizeEventDetail extends MoveEventDetail {
  edge: ResizeEdge;
}

interface MaximizeEventDetail extends WindowEventDetail {
  maximized: boolean;
}

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;

const WINDOW_CONFIGS: Record<string, WindowConfig> = {
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

export class WindowManager extends LitElement {
  static styles = css`
    :host {
      position: absolute;
      inset: 0 0 56px 0;

      display: block;

      z-index: 10;
      pointer-events: none;
    }

    .windows {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    mariana-window {
      pointer-events: auto;
    }
  `;

  private windows: WindowState[] = [];

  private nextZIndex = 1;

  private readonly handleViewportResize = (): void => {
    const bounds = this.getBounds();

    this.windows = this.windows.map(window => {
      const width = Math.min(window.width, bounds.width);
      const height = Math.min(window.height, bounds.height);

      return {
        ...window,
        width,
        height,
        x: this.clamp(window.x, 0, bounds.width - width),
        y: this.clamp(window.y, 0, bounds.height - height),
      };
    });

    this.requestUpdate();
  };

  override connectedCallback(): void {
    super.connectedCallback();

    window.addEventListener('resize', this.handleViewportResize);
  }

  override disconnectedCallback(): void {
    window.removeEventListener('resize', this.handleViewportResize);

    super.disconnectedCallback();
  }

  protected override render() {
    return html`
      <div
        class="windows"
        @window-close=${this.handleClose}
        @window-minimize=${this.handleMinimize}
        @window-maximize=${this.handleMaximize}
        @window-focus=${this.handleFocus}
        @window-move=${this.handleMove}
        @window-resize=${this.handleResize}
      >
        ${repeat(
          this.windows,
          window => window.appId,
          window => html`
            <mariana-window
              appid=${window.appId}
              title=${window.title}
              icon=${window.icon}
              open
              ?minimized=${window.minimized}
              ?maximized=${window.maximized}
              ?focused=${window.focused}
              style=${`
                left: ${window.maximized ? 0 : window.x}px;
                top: ${window.maximized ? 0 : window.y}px;
                width: ${window.maximized ? '100%' : `${window.width}px`};
                height: ${window.maximized ? '100%' : `${window.height}px`};
                z-index: ${window.zIndex};
              `}
            >
              ${this.renderApplication(window)}
            </mariana-window>
          `
        )}
      </div>
    `;
  }

  private renderApplication(window: WindowState) {
    switch (window.appId) {
      case 'memories':
        return html` <mariana-memories-view></mariana-memories-view> `;

      default:
        return html`
          <section>
            <h2>${window.title}</h2>

            <p>Esta aplicación se encuentra en desarrollo.</p>

            <p>App ID: ${window.appId}</p>
          </section>
        `;
    }
  }

  public openWindow(appId: string): void {
    const existing = this.windows.find(item => item.appId === appId);

    if (existing) {
      this.windows = this.windows.map(item => ({
        ...item,
        minimized: item.appId === appId ? false : item.minimized,
      }));

      this.focusWindow(appId);
      return;
    }

    const config = WINDOW_CONFIGS[appId];

    if (!config) {
      console.warn('[WindowManager] Aplicación desconocida:', appId);
      return;
    }

    const bounds = this.getBounds();

    const width = Math.min(520, bounds.width);
    const height = Math.min(360, bounds.height);

    const offset = (this.windows.length % 6) * 28;

    const newWindow: WindowState = {
      ...config,
      minimized: false,
      maximized: false,
      focused: false,

      x: this.clamp(32 + offset, 0, bounds.width - width),

      y: this.clamp(48 + offset, 0, bounds.height - height),

      width,
      height,
      zIndex: 0,
    };

    this.windows = [...this.windows, newWindow];

    this.focusWindow(appId);
  }

  private handleClose(event: CustomEvent<WindowEventDetail>): void {
    event.stopPropagation();

    const { appId } = event.detail;

    this.windows = this.windows.filter(item => item.appId !== appId);

    this.focusNextWindow();
  }

  private handleMinimize(event: CustomEvent<WindowEventDetail>): void {
    event.stopPropagation();

    const { appId } = event.detail;

    this.windows = this.windows.map(item => ({
      ...item,

      minimized: item.appId === appId ? true : item.minimized,

      focused: item.appId === appId ? false : item.focused,
    }));

    this.focusNextWindow();
  }

  private handleMaximize(event: CustomEvent<MaximizeEventDetail>): void {
    event.stopPropagation();

    const { appId, maximized } = event.detail;

    this.windows = this.windows.map(item => ({
      ...item,

      maximized: item.appId === appId ? maximized : item.maximized,
    }));

    this.focusWindow(appId);
  }

  private handleFocus(event: CustomEvent<WindowEventDetail>): void {
    event.stopPropagation();

    this.focusWindow(event.detail.appId);
  }

  private handleMove(event: CustomEvent<MoveEventDetail>): void {
    event.stopPropagation();

    const { appId, deltaX, deltaY } = event.detail;

    const bounds = this.getBounds();

    this.windows = this.windows.map(item => {
      if (item.appId !== appId || item.maximized) {
        return item;
      }

      return {
        ...item,

        x: this.clamp(
          item.x + deltaX,
          0,
          Math.max(0, bounds.width - item.width)
        ),

        y: this.clamp(
          item.y + deltaY,
          0,
          Math.max(0, bounds.height - item.height)
        ),
      };
    });

    this.requestUpdate();
  }

  private handleResize(event: CustomEvent<ResizeEventDetail>): void {
    event.stopPropagation();

    const { appId, edge, deltaX, deltaY } = event.detail;

    const bounds = this.getBounds();

    this.windows = this.windows.map(item => {
      if (item.appId !== appId || item.maximized) {
        return item;
      }

      let { x, y, width, height } = item;

      const minWidth = Math.min(MIN_WIDTH, bounds.width);

      const minHeight = Math.min(MIN_HEIGHT, bounds.height);

      if (edge.includes('e')) {
        width = this.clamp(width + deltaX, minWidth, bounds.width - x);
      }

      if (edge.includes('s')) {
        height = this.clamp(height + deltaY, minHeight, bounds.height - y);
      }

      if (edge.includes('w')) {
        const right = x + width;

        x = this.clamp(x + deltaX, 0, right - minWidth);

        width = right - x;
      }

      if (edge.includes('n')) {
        const bottom = y + height;

        y = this.clamp(y + deltaY, 0, bottom - minHeight);

        height = bottom - y;
      }

      return {
        ...item,
        x,
        y,
        width,
        height,
      };
    });

    this.requestUpdate();
  }

  private focusWindow(appId: string): void {
    const target = this.windows.find(item => item.appId === appId);

    if (!target) {
      return;
    }

    const zIndex = ++this.nextZIndex;

    this.windows = this.windows.map(item => ({
      ...item,

      focused: item.appId === appId,

      zIndex: item.appId === appId ? zIndex : item.zIndex,
    }));

    this.requestUpdate();
    this.notifyTaskbar();
  }

  private focusNextWindow(): void {
    const nextWindow = this.windows
      .filter(item => !item.minimized)
      .sort((a, b) => b.zIndex - a.zIndex)[0];

    if (nextWindow) {
      this.focusWindow(nextWindow.appId);
      return;
    }

    this.windows = this.windows.map(item => ({
      ...item,
      focused: false,
    }));

    this.requestUpdate();
    this.notifyTaskbar();
  }

  private notifyTaskbar(): void {
    this.dispatchEvent(
      new CustomEvent('windows-change', {
        detail: {
          windows: this.windows.map(item => ({
            appId: item.appId,
            title: item.title,
            icon: item.icon,
            minimized: item.minimized,
            focused: item.focused,
          })),
        },

        bubbles: true,
        composed: true,
      })
    );
  }

  private getBounds(): {
    width: number;
    height: number;
  } {
    return {
      width: Math.max(1, this.clientWidth),

      height: Math.max(1, this.clientHeight),
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, Math.max(min, max)));
  }
}

customElements.define('mariana-window-manager', WindowManager);
