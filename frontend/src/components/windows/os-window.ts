import { LitElement, css, html } from 'lit';
import './window-titlebar.js';

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface DragSession {
  pointerId: number;
  mode: 'move' | 'resize';
  edge?: ResizeEdge;
  startX: number;
  startY: number;
  initialLeft: number;
  initialTop: number;
  lastX: number;
  lastY: number;
}

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
      display: block;
      box-sizing: border-box;
      color: #ffffff;
    }

    :host(:not([open])),
    :host([minimized]) {
      display: none;
    }

    .window {
      position: relative;

      display: flex;
      flex-direction: column;

      width: 100%;
      height: 100%;

      overflow: hidden;
      box-sizing: border-box;

      background: #17171d;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 12px;

      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
    }

    :host([focused]) .window {
      border-color: rgba(255, 255, 255, 0.45);

      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
    }

    :host([maximized]) .window {
      border-radius: 0;
    }

    mariana-window-titlebar {
      display: block;
      flex: 0 0 auto;

      cursor: grab;
      touch-action: none;
      user-select: none;
    }

    :host([maximized]) mariana-window-titlebar {
      cursor: default;
    }

    .window-content {
      flex: 1;

      min-width: 0;
      min-height: 0;

      padding: 1.5rem;
      box-sizing: border-box;

      overflow: auto;
    }

    .resize-handle {
      position: absolute;
      z-index: 5;

      touch-action: none;
      user-select: none;
    }

    :host([maximized]) .resize-handle {
      display: none;
    }

    .resize-n {
      top: 0;
      left: 12px;
      right: 12px;
      height: 6px;
      cursor: n-resize;
    }

    .resize-s {
      bottom: 0;
      left: 12px;
      right: 12px;
      height: 6px;
      cursor: s-resize;
    }

    .resize-e {
      top: 12px;
      right: 0;
      bottom: 12px;
      width: 6px;
      cursor: e-resize;
    }

    .resize-w {
      top: 12px;
      left: 0;
      bottom: 12px;
      width: 6px;
      cursor: w-resize;
    }

    .resize-ne,
    .resize-nw,
    .resize-se,
    .resize-sw {
      width: 14px;
      height: 14px;
    }

    .resize-ne {
      top: 0;
      right: 0;
      cursor: ne-resize;
    }

    .resize-nw {
      top: 0;
      left: 0;
      cursor: nw-resize;
    }

    .resize-se {
      right: 0;
      bottom: 0;
      cursor: se-resize;
    }

    .resize-sw {
      left: 0;
      bottom: 0;
      cursor: sw-resize;
    }

    .resize-se::after {
      content: '';

      position: absolute;
      right: 4px;
      bottom: 4px;

      width: 9px;
      height: 9px;

      border-right: 2px solid rgba(255, 255, 255, 0.35);
      border-bottom: 2px solid rgba(255, 255, 255, 0.35);

      pointer-events: none;
    }

    @media (max-width: 640px) {
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

  private dragSession: DragSession | null = null;

  private getAppId(): string {
    return this.getAttribute('appid') ?? '';
  }

  private emitWindowEvent(
    eventName: string,
    detail: Record<string, unknown> = {}
  ): void {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: {
          appId: this.getAppId(),
          ...detail,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Solicita enfocar la ventana.
   */
  private handleFocus(): void {
    if (!this.hasAttribute('focused')) {
      this.emitWindowEvent('window-focus');
    }
  }

  /**
   * Evita iniciar arrastre cuando
   * se presionan botones de la barra.
   */
  private isControl(event: Event): boolean {
    return event.composedPath().some(node => node instanceof HTMLButtonElement);
  }

  /**
   * Inicia el movimiento desde la barra
   * de título de la ventana.
   */
  private handleTitlebarPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    if (this.hasAttribute('maximized')) return;
    if (this.isControl(event)) return;

    event.preventDefault();

    this.handleFocus();

    const parentBounds = this.parentElement?.getBoundingClientRect();

    const windowBounds = this.getBoundingClientRect();

    if (!parentBounds) {
      return;
    }

    this.startSession({
      pointerId: event.pointerId,
      mode: 'move',
      startX: event.clientX,
      startY: event.clientY,

      initialLeft: windowBounds.left - parentBounds.left,

      initialTop: windowBounds.top - parentBounds.top,

      lastX: event.clientX,
      lastY: event.clientY,
    });
  }

  /**
   * Inicia el redimensionamiento desde
   * un borde o esquina.
   */
  private handleResizePointerDown(event: PointerEvent, edge: ResizeEdge): void {
    if (event.button !== 0) return;
    if (this.hasAttribute('maximized')) return;

    event.preventDefault();
    event.stopPropagation();

    this.handleFocus();

    this.startSession({
      pointerId: event.pointerId,
      mode: 'resize',
      edge,

      startX: event.clientX,
      startY: event.clientY,

      initialLeft: this.offsetLeft,
      initialTop: this.offsetTop,

      lastX: event.clientX,
      lastY: event.clientY,
    });
  }

  /**
   * Registra temporalmente los eventos globales
   * mientras el usuario mantiene presionado
   * el botón del mouse.
   */
  private startSession(session: DragSession): void {
    this.stopSession();

    this.dragSession = session;

    window.addEventListener('pointermove', this.handleGlobalPointerMove);

    window.addEventListener('pointerup', this.handleGlobalPointerEnd);

    window.addEventListener('pointercancel', this.handleGlobalPointerCancel);
  }

  /**
   * Actualiza la posición o solicita
   * un cambio de dimensiones.
   */
  private readonly handleGlobalPointerMove = (event: PointerEvent): void => {
    const session = this.dragSession;

    if (!session || event.pointerId !== session.pointerId) {
      return;
    }

    if (session.mode === 'move') {
      const parent = this.parentElement;

      if (!parent) {
        return;
      }

      const maxX = Math.max(0, parent.clientWidth - this.offsetWidth);

      const maxY = Math.max(0, parent.clientHeight - this.offsetHeight);

      const nextX = this.clamp(
        session.initialLeft + event.clientX - session.startX,
        0,
        maxX
      );

      const nextY = this.clamp(
        session.initialTop + event.clientY - session.startY,
        0,
        maxY
      );

      // Movimiento visual inmediato.
      this.style.left = `${nextX}px`;
      this.style.top = `${nextY}px`;

      return;
    }

    const deltaX = event.clientX - session.lastX;

    const deltaY = event.clientY - session.lastY;

    session.lastX = event.clientX;
    session.lastY = event.clientY;

    if (session.edge && (deltaX !== 0 || deltaY !== 0)) {
      this.emitWindowEvent('window-resize', {
        edge: session.edge,
        deltaX,
        deltaY,
      });
    }
  };

  /**
   * Guarda la posición final al soltar
   * el puntero.
   */
  private readonly handleGlobalPointerEnd = (event: PointerEvent): void => {
    const session = this.dragSession;

    if (!session || event.pointerId !== session.pointerId) {
      return;
    }

    if (session.mode === 'move') {
      this.emitWindowEvent('window-position-change', {
        x: this.offsetLeft,
        y: this.offsetTop,
      });
    }

    this.stopSession();
  };

  /**
   * Conserva la última posición si el
   * sistema cancela el arrastre.
   */
  private readonly handleGlobalPointerCancel = (event: PointerEvent): void => {
    const session = this.dragSession;

    if (!session || event.pointerId !== session.pointerId) {
      return;
    }

    if (session.mode === 'move') {
      this.emitWindowEvent('window-position-change', {
        x: this.offsetLeft,
        y: this.offsetTop,
      });
    }

    this.stopSession();
  };

  /**
   * Limpia los listeners del movimiento.
   */
  private stopSession(): void {
    this.dragSession = null;

    window.removeEventListener('pointermove', this.handleGlobalPointerMove);

    window.removeEventListener('pointerup', this.handleGlobalPointerEnd);

    window.removeEventListener('pointercancel', this.handleGlobalPointerCancel);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
  }

  /**
   * Solicita minimizar.
   */
  private handleMinimize(event: Event): void {
    event.stopPropagation();

    this.stopSession();
    this.emitWindowEvent('window-minimize');
  }

  /**
   * Solicita maximizar o restaurar.
   */
  private handleMaximize(event: Event): void {
    event.stopPropagation();

    this.stopSession();

    this.emitWindowEvent('window-maximize', {
      maximized: !this.hasAttribute('maximized'),
    });
  }

  /**
   * Solicita cerrar.
   */
  private handleClose(event: Event): void {
    event.stopPropagation();

    this.stopSession();
    this.emitWindowEvent('window-close');
  }

  /**
   * Doble clic sobre la barra:
   * maximizar o restaurar.
   */
  private handleTitlebarDoubleClick(event: MouseEvent): void {
    if (this.isControl(event)) {
      return;
    }

    this.handleMaximize(event);
  }

  /**
   * Crea una zona interactiva para
   * redimensionar la ventana.
   */
  private renderResizeHandle(edge: ResizeEdge) {
    return html`
      <div
        class="resize-handle resize-${edge}"
        aria-hidden="true"
        @pointerdown=${(event: PointerEvent) =>
          this.handleResizePointerDown(event, edge)}
      ></div>
    `;
  }

  override disconnectedCallback(): void {
    this.stopSession();

    super.disconnectedCallback();
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
          @pointerdown=${this.handleTitlebarPointerDown}
          @dblclick=${this.handleTitlebarDoubleClick}
          @window-minimize=${this.handleMinimize}
          @window-maximize=${this.handleMaximize}
          @window-close=${this.handleClose}
        ></mariana-window-titlebar>

        <div class="window-content">
          <slot></slot>
        </div>

        ${this.renderResizeHandle('n')} ${this.renderResizeHandle('s')}
        ${this.renderResizeHandle('e')} ${this.renderResizeHandle('w')}
        ${this.renderResizeHandle('ne')} ${this.renderResizeHandle('nw')}
        ${this.renderResizeHandle('se')} ${this.renderResizeHandle('sw')}
      </section>
    `;
  }
}

customElements.define('mariana-window', OsWindow);
