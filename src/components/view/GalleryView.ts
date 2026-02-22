import { Component } from '../base/Component';

interface IGalleryView {
  catalog: HTMLElement[];
}

export class GalleryView extends Component<IGalleryView> {
  constructor(container: HTMLElement) {
    super(container);
  }

  // Разметка списка карточек */
  set items(items: HTMLElement[]) {
    this.container.innerHTML = '';
    items.forEach((item) => {
      this.container.appendChild(item);
    });
  }
}