import { Component } from "../base/Component";
import { AppEvent, IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";


export interface ISuccessView {
  total: number;
}

export class SuccessView extends Component <ISuccessView> {
  protected descriptionElement: HTMLElement;
  protected closeButton: HTMLButtonElement;

  constructor (container: HTMLElement, protected events: IEvents) {
    super (container);

    this.descriptionElement = ensureElement<HTMLElement> (".order-success__description", this.container);
    this.closeButton = ensureElement<HTMLButtonElement> (".order-success__close", this.container);

    this.closeButton.addEventListener("click", () => {
      this.events.emit(AppEvent.SuccessClose);
    });
  
}

//сеттер для суммы заказа

set total (value: number) {
  this.descriptionElement.textContent = `Списано ${value} синапсов`;
}
}