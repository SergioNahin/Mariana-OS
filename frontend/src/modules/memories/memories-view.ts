import { LitElement, css, html } from 'lit';

import { memoriesService } from './memories-service.js';

import type { Memory } from './memories-types.js';

export class MemoriesView extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-width: 0;
      color: #ffffff;
      font-family: inherit;
    }

    .memories {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      min-width: 0;
    }

    .eyebrow {
      margin: 0 0 0.5rem;
      color: #f3adc2;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0 0 0.5rem;
      font-size: clamp(1.3rem, 3vw, 1.8rem);
      line-height: 1.3;
    }

    h1:focus {
      outline: none;
    }

    .description {
      margin: 0;
      color: rgba(255, 255, 255, 0.65);
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .memory-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
      gap: 0.85rem;
    }

    .memory-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;

      width: 100%;
      min-width: 0;
      padding: 1.1rem;
      box-sizing: border-box;

      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.045);
      color: inherit;

      font: inherit;
      text-align: left;
      cursor: pointer;

      transition:
        background 150ms ease,
        border-color 150ms ease,
        transform 150ms ease;
    }

    .memory-card:hover {
      background: rgba(243, 173, 194, 0.09);
      border-color: rgba(243, 173, 194, 0.35);
      transform: translateY(-2px);
    }

    button:focus-visible {
      outline: 2px solid #f3adc2;
      outline-offset: 3px;
    }

    .memory-icon {
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 12px;

      background: rgba(243, 173, 194, 0.12);
      color: #ffc0d2;
      font-size: 1.3rem;
    }

    .memory-title {
      font-size: 0.95rem;
      font-weight: 600;
      line-height: 1.4;
    }

    .memory-description {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.82rem;
      line-height: 1.6;
    }

    .memory-detail {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1.25rem;
    }

    .back-button {
      padding: 0.55rem 0.85rem;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 9px;

      background: rgba(255, 255, 255, 0.06);
      color: #ffffff;
      font: inherit;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .back-button:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    .detail-panel {
      width: 100%;
      padding: 1.25rem;
      box-sizing: border-box;

      border: 1px solid rgba(243, 173, 194, 0.18);
      border-radius: 14px;
      background: rgba(243, 173, 194, 0.05);
    }

    .detail-panel p {
      margin: 0;
      color: rgba(255, 255, 255, 0.75);
      line-height: 1.8;
      font-size: 0.92rem;
    }

    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr));
      gap: 0.85rem;
      width: 100%;
    }

    .photo-card {
      overflow: hidden;
      margin: 0;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
    }

    .photo-card img {
      display: block;
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
    }

    .photo-card figcaption {
      padding: 0.75rem;
      color: rgba(255, 255, 255, 0.75);
      font-size: 0.8rem;
    }

    .empty-gallery {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;

      width: 100%;
      min-height: 190px;
      padding: 1.5rem;
      box-sizing: border-box;

      border: 1px dashed rgba(243, 173, 194, 0.3);
      border-radius: 14px;
      background: rgba(243, 173, 194, 0.04);
      text-align: center;
    }

    .empty-gallery-icon {
      font-size: 2rem;
      color: #f3adc2;
    }

    .empty-gallery p {
      margin: 0;
      max-width: 340px;
      color: rgba(255, 255, 255, 0.65);
      font-size: 0.88rem;
      line-height: 1.6;
    }

    .demo-label {
      margin: 0;
      color: rgba(255, 255, 255, 0.45);
      font-size: 0.75rem;
    }

    @media (prefers-reduced-motion: reduce) {
      .memory-card {
        transition: none;
      }
    }
  `;

  private selectedMemoryId: string | null = null;

  private async selectMemory(id: string): Promise<void> {
    this.selectedMemoryId = id;
    this.requestUpdate();

    await this.updateComplete;
    this.renderRoot
      .querySelector<HTMLElement>('#memory-detail-heading')
      ?.focus();
  }

  private async goBack(): Promise<void> {
    const previousId = this.selectedMemoryId;

    this.selectedMemoryId = null;
    this.requestUpdate();

    await this.updateComplete;

    if (!previousId) return;

    const card = Array.from(
      this.renderRoot.querySelectorAll<HTMLButtonElement>('.memory-card')
    ).find(item => item.dataset.memoryId === previousId);

    card?.focus();
  }

  private renderMemoryList() {
    const memories = memoriesService.getMemories();

    return html`
      <section class="memories" aria-label="Recuerdos">
        <header>
          <p class="eyebrow">Mariana OS / Memories</p>
          <h1>Nuestros recuerdos ♡</h1>
          <p class="description">
            Pequeños momentos que forman una gran historia.
          </p>
        </header>

        <div class="memory-grid">
          ${memories.map(
            memory => html`
              <button
                class="memory-card"
                type="button"
                data-memory-id=${memory.id}
                aria-label=${`Explorar ${memory.title}`}
                @click=${() => this.selectMemory(memory.id)}
              >
                <span class="memory-icon" aria-hidden="true">
                  ${memory.icon}
                </span>

                <span class="memory-title"> ${memory.title} </span>

                <span class="memory-description"> ${memory.description} </span>
              </button>
            `
          )}
        </div>

        <p class="demo-label">Contenido de demostración · Memories 1.1</p>
      </section>
    `;
  }

  private renderPhotoGallery(memory: Memory) {
    const photos = memoriesService.getPhotosByMemoryId(memory.id);

    if (photos.length === 0) {
      return html`
        <div class="empty-gallery" role="status">
          <span class="empty-gallery-icon" aria-hidden="true"> ▧ </span>

          <strong>La galería está lista</strong>

          <p>
            Todavía no hay fotografías cargadas. Aquí aparecerán los recuerdos
            visuales que agreguemos a Mariana OS.
          </p>
        </div>
      `;
    }

    return html`
      <div class="photo-grid">
        ${photos.map(
          photo => html`
            <figure class="photo-card">
              ${photo.imageUrl
                ? html`
                    <img
                      src=${photo.imageUrl}
                      alt=${photo.description}
                      loading="lazy"
                    />
                  `
                : html`
                    <div class="empty-gallery">
                      <span aria-hidden="true">▧</span>
                      <p>Imagen no disponible</p>
                    </div>
                  `}

              <figcaption>${photo.title}</figcaption>
            </figure>
          `
        )}
      </div>
    `;
  }

  private renderMemoryDetail(memory: Memory) {
    return html`
      <section class="memory-detail" aria-label=${memory.title}>
        <button class="back-button" type="button" @click=${this.goBack}>
          ← Volver a recuerdos
        </button>

        <header>
          <p class="eyebrow">${memory.categoryLabel}</p>

          <h1 id="memory-detail-heading" tabindex="-1">
            ${memory.icon} ${memory.title}
          </h1>

          <p class="description">${memory.description}</p>
        </header>

        <div class="detail-panel">
          <p>${memory.content}</p>
        </div>

        ${memory.category === 'photos' ? this.renderPhotoGallery(memory) : ''}

        <p class="demo-label">Contenido de demostración</p>
      </section>
    `;
  }

  protected override render() {
    if (!this.selectedMemoryId) {
      return this.renderMemoryList();
    }

    const memory = memoriesService.getMemoryById(this.selectedMemoryId);

    if (!memory) {
      return this.renderMemoryList();
    }

    return this.renderMemoryDetail(memory);
  }
}

customElements.define('mariana-memories-view', MemoriesView);
