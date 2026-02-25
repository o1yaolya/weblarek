import { ensureElement } from '../../../utils/utils';
import { Card } from './card';
import { IProduct } from '../../../types';

export type TBasketCardData = Pick<IProduct, "title" | "price" | "id">;

export class BasketCard extends Card<TBasketCardData> {
 

  protected deleteButtonElement: HTMLButtonElement;
  protected indexElement: HTMLElement;
  

  constructor(container: HTMLElement, actions?: { onClick: () => void }) {
    super(container, actions);
   
    // Получаем элемент для номера
    this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);

    this.deleteButtonElement = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

     if (actions?.onClick) {
            this.deleteButtonElement.addEventListener('click', actions.onClick);
     }
  }

 set index(value:number) {
    this.indexElement.textContent = value.toString();
 }
  }
