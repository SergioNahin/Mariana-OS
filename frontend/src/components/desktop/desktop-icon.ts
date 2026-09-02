import { LitElement, css, html } from 'lit';

export class DesktopIcon extends LitElement {
  static properties = {
    label: { type: String },
    icon: { type: String },
    appId: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      width: 96px;
    }

    .desktop-icon {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 0.5rem;
      box-sizing: border-box;
      border: 1px solid transparent;
      border-radius: 12px;
      background: transparent;
      color: #ffffff;
      cursor: pointer;
      font: inherit;
      text-align: center;
      user-select: none;
    }

    .desktop-icon:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .desktop-icon:focus-visible {
      outline: 2px solid #ffffff;
      outline-offset: 2px;
    }

    .icon {
      width: 52px;
      height: 52px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.12);
      font-size: 1.5rem;
    }

    .label {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.8rem;
    }
  `;

  label = '';
  icon = '○';
  appId = '';

  private handleClick(): void {
    this.dispatchEvent(
      new CustomEvent('desktop-icon-open', {
        detail: {
          appId: this.appId,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`
      <button
        class="desktop-icon"
        type="button"
        aria-label=${`Abrir ${this.label}`}
        @click=${this.handleClick}
      >
        <span class="icon" aria-hidden="true"> ${this.icon} </span>

        <span class="label"> ${this.label} </span>
      </button>
    `;
  }
}

customElements.define('mariana-desktop-icon', DesktopIcon);
