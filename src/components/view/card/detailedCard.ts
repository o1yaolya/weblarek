import { Card } from "./card";
import { ensureElement } from "../../../utils/utils";
import { CDN_URL } from "../../../utils/constants";
import { IProduct } from "../../../types";
import { categoryMap } from "../../../utils/constants";

export type DetailedCardData = Card<IProduct> & {
  description: string | null;
  image?: string | null;
  category?: string | null;
};


export class DetailedCard extends Card<IProduct> {
  protected descriptionElement: HTMLElement | null = null; // элемент с описанием
  protected imageElement: HTMLImageElement; // элемент изображения товара
  protected categoryElement: HTMLElement; // элемент с категорией товара
  protected buttonElement: HTMLButtonElement; // кнопка действия 

  constructor(container: HTMLElement, actions?: { onClick: () => void }) {
    super(container);

    this.descriptionElement = ensureElement<HTMLElement>(
      '.card__text',
      this.container
    );

    this.imageElement = ensureElement<HTMLImageElement>(
      '.card__image',
      this.container
    );
    this.categoryElement = ensureElement<HTMLElement>(
      '.card__category',
      this.container
    );

    this.buttonElement = this.container.querySelector('.card__button') as HTMLButtonElement;

    // Проверяем, что кнопка существует И есть обработчик
  if (this.buttonElement && actions?.onClick) {
    this.buttonElement.addEventListener('click', actions.onClick);
  }
  }

  set description(value: string | null) {
    if (!this.descriptionElement) return;
    this.descriptionElement.textContent = value || 'Описание отсутствует';
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
  // 
  set buttonText(value: string) {
        this.buttonElement.textContent = value;
    }

  //
     set buttonDisabled(state: boolean) {
    this.buttonElement.disabled = state;
}

}
