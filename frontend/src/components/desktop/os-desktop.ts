import { LitElement, css, html } from 'lit';

import './os-taskbar.js';
import './desktop-icon.js';
import '../windows/window-manager.js';

/**
 * Define el contrato público que OsDesktop
 * necesita utilizar de WindowManager.
 */
interface WindowManagerElement extends HTMLElement {
  openWindow(appId: string): void;
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
      box-sizing: border-box;

      padding: 1rem;
      padding-bottom: 56px;
    }

    .desktop-icons {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  `;

  protected override render() {
    return html`
      <main
        class="desktop"
        aria-label="Escritorio de Mariana OS"
        @desktop-icon-open=${this.handleDesktopIconOpen}
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

  private handleDesktopIconOpen(event: Event): void {
    const customEvent = event as CustomEvent<{
      appId: string;
    }>;

    const appId = customEvent.detail?.appId;

    console.log('[OsDesktop] Ícono seleccionado:', appId);

    if (!appId) {
      console.warn('[OsDesktop] No se recibió un appId');
      return;
    }

    const windowManager = this.renderRoot.querySelector(
      'mariana-window-manager'
    ) as WindowManagerElement | null;

    if (!windowManager) {
      console.error('[OsDesktop] No se encontró WindowManager');
      return;
    }

    console.log('[OsDesktop] Enviando solicitud a WindowManager:', appId);

    windowManager.openWindow(appId);
  }
}

customElements.define('mariana-desktop', OsDesktop);
