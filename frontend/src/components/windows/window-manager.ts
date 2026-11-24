import { LitElement, css, html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import './os-window.js';
import '../../modules/memories/memories-view.js';

/**
 * Configuración de una aplicación.
 */
interface WindowConfig {
  appId: string;
  title: string;
  icon: string;
}

/**
 * Estado completo de una ventana.
 */
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

/**
 * Información pública compartida con Taskbar.
 */
interface TaskbarWindow {
  appId: string;
  title: string;
  icon: string;
  minimized: boolean;
  focused: boolean;
}

interface WindowEventDetail {
  appId: string;
}

interface WindowPositionDetail extends WindowEventDetail {
  x: number;
  y: number;
}

interface MaximizeEventDetail extends WindowEventDetail {
  maximized: boolean;
}

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface ResizeEventDetail extends WindowEventDetail {
  edge: ResizeEdge;
  deltaX: number;
  deltaY: number;
}

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;
const TASKBAR_HEIGHT = 56;

/**
 * Catálogo inicial de aplicaciones.
 */
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
      box-sizing: border-box;
      overflow: hidden;

      z-index: 10;
      pointer-events: none;
    }

    .windows {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    mariana-window {
      pointer-events: auto;
      box-sizing: border-box;
    }
  `;

  /**
   * Estado privado.
   *
   * Usamos requestUpdate() explícitamente
   * para evitar problemas de class-field
   * shadowing con la configuración de TS.
   */
  private windows: WindowState[] = [];

  private nextZIndex = 1;

  /**
   * Observa cambios de tamaño en el área
   * disponible para las ventanas.
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
   * Renderiza todas las ventanas.
   *
   * repeat() conserva la identidad de cada
   * Web Component cuando cambia su estado.
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
   * Renderizado de contenido por aplicación.
   *
   * Memories ya utiliza un Web Component
   * independiente.
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
   * Abre una aplicación o restaura
   * una ventana existente.
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
   * Cierra y elimina una ventana.
   */
  private handleClose(event: CustomEvent<WindowEventDetail>): void {
    event.stopPropagation();

    const { appId } = event.detail;

    this.windows = this.windows.filter(item => item.appId !== appId);

    this.focusNextWindow();
  }

  /**
   * Minimiza una ventana y conserva su estado.
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
   * Maximiza o restaura una ventana.
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
   * Trae una ventana al frente.
   */
  private handleFocus(event: CustomEvent<WindowEventDetail>): void {
    event.stopPropagation();
    this.focusWindow(event.detail.appId);
  }

  /**
   * Guarda la posición después de arrastrar.
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
   * Redimensiona una ventana desde
   * sus bordes o esquinas.
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

      if (edge.includes('e')) {
        width = this.clamp(width + deltaX, minWidth, bounds.width - x);
      }

      if (edge.includes('s')) {
        height = this.clamp(height + deltaY, minHeight, bounds.height - y);
      }

      if (edge.includes('w')) {
        const right = x + width;

        x = this.clamp(x + deltaX, 0, Math.max(0, right - minWidth));

        width = right - x;
      }

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
   * Ajusta las ventanas cuando cambia
   * el tamaño disponible del escritorio.
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
   * Actualiza foco y z-index.
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
   * Enfoca la siguiente ventana visible
   * después de cerrar o minimizar.
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
   * Retorna el estado público que consume
   * la barra de tareas.
   */
  public getTaskbarWindows(): TaskbarWindow[] {
    return this.windows.map(item => ({
      appId: item.appId,
      title: item.title,
      icon: item.icon,
      minimized: item.minimized,
      focused: item.focused,
    }));
  }

  /**
   * Notifica los cambios a OsDesktop,
   * que sincroniza la Taskbar.
   */
  private notifyTaskbar(): void {
    this.dispatchEvent(
      new CustomEvent('windows-change', {
        detail: {
          windows: this.getTaskbarWindows(),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Dimensiones disponibles para ventanas.
   */
  private getBounds(): {
    width: number;
    height: number;
  } {
    return {
      width: Math.max(1, this.clientWidth),
      height: Math.max(1, this.clientHeight),
    };
  }

  /**
   * Restringe un valor a un rango.
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, Math.max(min, max)));
  }
}

customElements.define('mariana-window-manager', WindowManager);
