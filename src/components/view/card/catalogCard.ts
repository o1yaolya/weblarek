import { Card } from './card';
import { CDN_URL } from "../../../utils/constants";
import { IProduct } from "../../../types";
import { categoryMap } from "../../../utils/constants";
import { ensureElement } from '../../../utils/utils';

type TCatalogCard = Pick<IProduct, 'category'> & {image: string};



export class CatalogCard extends Card<TCatalogCard> {

  protected imageElement: HTMLImageElement; // элемент изображения товара
  protected categoryElement: HTMLElement; // элемент с категорией товара. 


  constructor(container: HTMLElement, actions?: { onClick: () => void }) {
    super(container);

    this.imageElement = ensureElement<HTMLImageElement>(
          '.card__image',
          this.container
        );
        this.categoryElement = ensureElement<HTMLElement>(
          '.card__category',
          this.container
        );
    

    if (actions?.onClick) {
      container.addEventListener('click', actions.onClick);
    }
  }

 // Сеттер для источника изображения
     set image(value: string) {
  if (!this.imageElement) return;

  if (value && value.trim() !== '') {
    this.setImage(this.imageElement, CDN_URL + value, value);
  } else {
    // Изображение‑заглушка
    this.imageElement.src = '/images/no-image.jpg';
    this.imageElement.alt = 'Изображение отсутствует';
  }
}


  // Сеттер для категории
  set category(value: string) {
    if (!this.categoryElement) return;

    this.categoryElement.textContent = value;
    this.categoryElement.className = 'card__category';

    const categoryClass = categoryMap[value as keyof typeof categoryMap];
    if (categoryClass) {
      this.categoryElement.classList.add(categoryClass);
    }
  }
}
