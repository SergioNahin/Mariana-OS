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

interface WindowPositionDetail extends WindowEventDetail {
  x: number;
  y: number;
}

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface ResizeEventDetail extends WindowEventDetail {
  edge: ResizeEdge;
  deltaX: number;
  deltaY: number;
}

interface MaximizeEventDetail extends WindowEventDetail {
  maximized: boolean;
}

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;
const TASKBAR_HEIGHT = 56;

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
      top: 0;
      right: 0;
      bottom: ${TASKBAR_HEIGHT}px;
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

    mariana-window {
      pointer-events: auto;
    }
  `;

  private windows: WindowState[] = [];
  private nextZIndex = 1;

  /**
   * Observa el tamaño real del administrador,
   * no solamente el tamaño del navegador.
   */
  private readonly resizeObserver = new ResizeObserver(() => {
    this.handleViewportResize();
  });

  override connectedCallback(): void {
    super.connectedCallback();

    this.resizeObserver.observe(this);
  }

  override disconnectedCallback(): void {
    this.resizeObserver.disconnect();

    super.disconnectedCallback();
  }

  /**
   * Dibuja todas las ventanas registradas.
   */
  protected override render() {
    return html`
      <div
        class="windows"
        @window-close=${this.handleClose}
        @window-minimize=${this.handleMinimize}
        @window-maximize=${this.handleMaximize}
        @window-focus=${this.handleFocus}
        @window-position-change=${this.handlePositionChange}
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

  /**
   * Renderizado temporal de aplicaciones.
   * Memories utiliza su propio Web Component.
   */
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

  /**
   * Abre una aplicación o restaura su ventana.
   */
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

  /**
   * Elimina una ventana del sistema.
   */
  private handleClose(event: CustomEvent<WindowEventDetail>): void {
    event.stopPropagation();

    const { appId } = event.detail;

    this.windows = this.windows.filter(item => item.appId !== appId);

    this.focusNextWindow();
  }

  /**
   * Oculta una ventana sin eliminar su estado.
   */
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

  /**
   * Maximiza o restaura conservando las
   * dimensiones y coordenadas anteriores.
   */
  private handleMaximize(event: CustomEvent<MaximizeEventDetail>): void {
    event.stopPropagation();

    const { appId, maximized } = event.detail;

    if (!appId || maximized === undefined) {
      return;
    }

    this.windows = this.windows.map(item => ({
      ...item,

      maximized: item.appId === appId ? maximized : item.maximized,
    }));

    this.focusWindow(appId);
  }

  /**
   * Enfoca una ventana al seleccionarla.
   */
  private handleFocus(event: CustomEvent<WindowEventDetail>): void {
    event.stopPropagation();

    this.focusWindow(event.detail.appId);
  }

  /**
   * Guarda la posición final después
   * de arrastrar una ventana.
   */
  private handlePositionChange(event: CustomEvent<WindowPositionDetail>): void {
    event.stopPropagation();

    const { appId, x, y } = event.detail;

    if (!appId || !Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }

    const bounds = this.getBounds();

    this.windows = this.windows.map(item => {
      if (item.appId !== appId || item.maximized) {
        return item;
      }

      return {
        ...item,

        x: this.clamp(x, 0, bounds.width - item.width),

        y: this.clamp(y, 0, bounds.height - item.height),
      };
    });

    this.requestUpdate();
  }

  /**
   * Permite redimensionar desde
   * los ocho bordes y esquinas.
   */
  private handleResize(event: CustomEvent<ResizeEventDetail>): void {
    event.stopPropagation();

    const { appId, edge, deltaX, deltaY } = event.detail;

    if (!appId || !Number.isFinite(deltaX) || !Number.isFinite(deltaY)) {
      return;
    }

    const bounds = this.getBounds();

    this.windows = this.windows.map(item => {
      if (item.appId !== appId || item.maximized || item.minimized) {
        return item;
      }

      let { x, y, width, height } = item;

      const minWidth = Math.min(MIN_WIDTH, bounds.width);

      const minHeight = Math.min(MIN_HEIGHT, bounds.height);

      // Redimensionar desde la derecha.
      if (edge.includes('e')) {
        width = this.clamp(width + deltaX, minWidth, bounds.width - x);
      }

      // Redimensionar desde abajo.
      if (edge.includes('s')) {
        height = this.clamp(height + deltaY, minHeight, bounds.height - y);
      }

      // Redimensionar desde la izquierda.
      if (edge.includes('w')) {
        const right = x + width;

        x = this.clamp(x + deltaX, 0, Math.max(0, right - minWidth));

        width = right - x;
      }

      // Redimensionar desde arriba.
      if (edge.includes('n')) {
        const bottom = y + height;

        y = this.clamp(y + deltaY, 0, Math.max(0, bottom - minHeight));

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

  /**
   * Corrige coordenadas y tamaños cuando
   * cambia el área disponible del escritorio.
   */
  private handleViewportResize(): void {
    const bounds = this.getBounds();

    let hasChanges = false;

    this.windows = this.windows.map(item => {
      const width = Math.min(item.width, bounds.width);
      const height = Math.min(item.height, bounds.height);

      const x = this.clamp(item.x, 0, bounds.width - width);

      const y = this.clamp(item.y, 0, bounds.height - height);

      if (
        width === item.width &&
        height === item.height &&
        x === item.x &&
        y === item.y
      ) {
        return item;
      }

      hasChanges = true;

      return {
        ...item,
        x,
        y,
        width,
        height,
      };
    });

    if (hasChanges) {
      this.requestUpdate();
    }
  }

  /**
   * Trae una ventana al frente.
   */
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

  /**
   * Busca la siguiente ventana visible
   * después de cerrar o minimizar otra.
   */
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

  /**
   * Sincroniza el estado de las ventanas
   * con la barra de tareas.
   */
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
