import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

export interface IBasketItem {
  id: string | number;
  title: string;
  price: number | null;
  quantity?: number;
}

export interface IBasketRenderData {
 items: string[]; 
  total: number;
  hasItems: boolean;
}
interface IBasketActions {
    onCheckout: () => void;
}

export class BasketView extends Component<IBasketItem> {
  protected listElement: HTMLElement;
  protected priceElement: HTMLElement;
  protected submitButton: HTMLButtonElement;
 

  
  constructor(container: HTMLElement, actions?: IBasketActions) {
    super(container);
  

    // Находим внутренние элементы корзины
    this.submitButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);
    this.listElement = ensureElement('.basket__list', this.container);
    this.priceElement = ensureElement('.basket__price', this.container);
    if (actions?.onCheckout) {
            this.submitButton.addEventListener('click', actions.onCheckout);
        }
      } 

  
  set items (items: HTMLElement[]) {
    this.listElement.replaceChildren(...items);

     if (items.length === 0) {
            const emptyElement = document.createElement('p');
            emptyElement.textContent = 'Корзина пуста';
            this.listElement.appendChild(emptyElement);
            this.submitButton.disabled = true;
        } else {
            this.submitButton.disabled = false;
        }
    }


  set total(value: number) {
    this.priceElement.textContent = `${value} синапсов`;
  }
  }

