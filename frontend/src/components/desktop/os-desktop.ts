import { LitElement, css, html } from 'lit';

import './desktop-icon.js';
import './os-taskbar.js';
import '../windows/window-manager.js';

interface TaskbarWindow {
  appId: string;
  title: string;
  icon: string;
  minimized: boolean;
  focused: boolean;
}

interface WindowManagerElement extends HTMLElement {
  openWindow(appId: string): void;
  getTaskbarWindows(): TaskbarWindow[];
}

interface TaskbarElement extends HTMLElement {
  setWindows(windows: TaskbarWindow[]): void;
}

export class OsDesktop extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .desktop {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      box-sizing: border-box;

      background: #15151a;
      color: #ffffff;
    }

    .desktop-content {
      width: 100%;
      height: 100%;
      padding: 1rem;
      padding-bottom: 56px;
      box-sizing: border-box;
    }

    .desktop-icons {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  `;

  protected override firstUpdated(): void {
    this.syncTaskbar();
  }

  protected override render() {
    return html`
      <main
        class="desktop"
        aria-label="Escritorio de Mariana OS"
        @desktop-icon-open=${this.handleDesktopIconOpen}
        @taskbar-window-activate=${this.handleTaskbarActivate}
        @windows-change=${this.handleWindowsChange}
      >
        <div class="desktop-content">
          <div class="desktop-icons">
            <mariana-desktop-icon
              label="Memories"
              icon="♡"
              appid="memories"
            ></mariana-desktop-icon>

            <mariana-desktop-icon
              label="Timeline"
              icon="◷"
              appid="timeline"
            ></mariana-desktop-icon>

            <mariana-desktop-icon
              label="Achievements"
              icon="★"
              appid="achievements"
            ></mariana-desktop-icon>

            <mariana-desktop-icon
              label="Future"
              icon="◇"
              appid="future"
            ></mariana-desktop-icon>
          </div>
        </div>

        <mariana-window-manager></mariana-window-manager>
        <mariana-taskbar></mariana-taskbar>
      </main>
    `;
  }

  private getWindowManager(): WindowManagerElement | null {
    return this.renderRoot.querySelector(
      'mariana-window-manager'
    ) as WindowManagerElement | null;
  }

  private getTaskbar(): TaskbarElement | null {
    return this.renderRoot.querySelector(
      'mariana-taskbar'
    ) as TaskbarElement | null;
  }

  private handleDesktopIconOpen(event: Event): void {
    const customEvent = event as CustomEvent<{
      appId: string;
    }>;

    const appId = customEvent.detail?.appId;

    if (!appId) {
      return;
    }

    console.log('[OsDesktop] Abrir aplicación:', appId);

    this.getWindowManager()?.openWindow(appId);
  }

  private handleTaskbarActivate(event: Event): void {
    const customEvent = event as CustomEvent<{
      appId: string;
    }>;

    const appId = customEvent.detail?.appId;

    if (!appId) {
      return;
    }

    console.log('[OsDesktop] Activar desde Taskbar:', appId);

    this.getWindowManager()?.openWindow(appId);
  }

  private handleWindowsChange(event: Event): void {
    const customEvent = event as CustomEvent<{
      windows: TaskbarWindow[];
    }>;

    const windows = customEvent.detail?.windows;

    if (!windows) {
      console.warn('[OsDesktop] Evento windows-change sin datos');
      return;
    }

    console.log('[OsDesktop] Ventanas para Taskbar:', windows);

    const taskbar = this.getTaskbar();

    if (!taskbar) {
      console.warn('[OsDesktop] No se encontró mariana-taskbar');
      return;
    }

    taskbar.setWindows(windows);
  }

  /**
   * Sincroniza la Taskbar durante
   * la inicialización del escritorio.
   */
  private syncTaskbar(): void {
    const manager = this.getWindowManager();
    const taskbar = this.getTaskbar();

    if (!manager || !taskbar) {
      return;
    }

    taskbar.setWindows(manager.getTaskbarWindows());
  }
}

customElements.define('mariana-desktop', OsDesktop);
