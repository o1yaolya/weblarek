import { BaseForm } from "./BaseForm";
import { ensureElement } from "../../../utils/utils";
import { IEvents } from "../../base/Events";
import { AppEvent } from "../../base/Events";
import { IModalEvents } from "../../../main";
import { IOrderItem } from "../../../types";

export interface IOrderFormStep1Data {
  paymentMethod: "card" | "cash";
  address: string;
}

export interface IOrderFormStep1Events {
  'form:submit': (data: IOrderFormStep1Data) => void;
  'input:change': (field: keyof IOrderFormStep1Data, value: string) => void;
}

export class OrderForm extends BaseForm<IOrderFormStep1Data> {
  private _cardButton: HTMLButtonElement | null = null;
  private _cashButton: HTMLButtonElement | null = null;
  private cardClickHandler: () => void;
  private cashClickHandler: () => void;
  private nextButton: HTMLButtonElement;
  private submitHandler: () => void;
  public paymentMethod: "card" | "cash" | null = null;
  protected total: number;
  protected items: IOrderItem[];
  
  // Храним дополнительные данные о товарах (title, price по id)
  private productData: { [id: string]: { title: string; price: number } };

  constructor(
    container: HTMLElement,
    events: IModalEvents,
    items: IOrderItem[],
    total: number,
    productData: { [id: string]: { title: string; price: number } }  // ← Новый параметр
  ) {
    super(container, events);
    this.items = items;
    this.total = total;
    this.productData = productData;  // Сохраняем данные


    this.cardClickHandler = this.onCardClick.bind(this);
    this.cashClickHandler = this.onCashClick.bind(this);
    this.submitHandler = this.submit.bind(this);

    try {
      this._cardButton = ensureElement<HTMLButtonElement>(
        'button[name="card"]',
        this.container
      );
      this._cashButton = ensureElement<HTMLButtonElement>(
        'button[name="cash"]',
        this.container
      );

      const addressInput = ensureElement<HTMLInputElement>(
        'input[name="address"]',
        this.container
      );

      this.formFields["address"] = addressInput;

      this.nextButton = ensureElement<HTMLButtonElement>(
        '.order__button',
        this.container
      );

      this.validationRules = {
        address: (value: string) => value.trim().length > 0,
      };

      this._cardButton.addEventListener("click", this.cardClickHandler);
      this._cashButton.addEventListener("click", this.cashClickHandler);
      addressInput.addEventListener("input", () => {
        this.events.emit('input:change', {
          field: "address",
          value: addressInput.value
        });
        this.validate();
      });

      this.events.on(AppEvent.FormSubmit, this.submitHandler);
    } catch (error) {
      console.error("Ошибка при инициализации OrderForm:", error);
      throw error;
    }
  }

  private onCardClick(): void {
    this.paymentMethod = "card";
    this._cardButton?.classList.add("button_alt-active");
    this._cashButton?.classList.remove("button_alt-active");
    this.validate();
  }

  private onCashClick(): void {
    this.paymentMethod = "cash";
    this._cashButton?.classList.add("button_alt-active");
    this._cardButton?.classList.remove("button_alt-active");
    this.validate();
  }

  public validate(): boolean {
    const fieldsValid = super.validate();
    const paymentValid = this.paymentMethod !== null;
    const isValid = fieldsValid && paymentValid;

    this.nextButton.disabled = !isValid;


    if (!isValid) {
      this.showError("Выберите способ оплаты и укажите адрес доставки");
    } else {
      this.clearError();
    }

    return isValid;
  }

  protected submit(): void {
    if (this.validate()) {
      const data: IOrderFormStep1Data & { items: IOrderItem[] } = {
        paymentMethod: this.paymentMethod!,
        address: this.formFields["address"].value,
        items: this.items
      };
      this.events.emit(AppEvent.OrderSuccess, data);
    }
  }

  destroy(): void {
    this.events.off(AppEvent.FormSubmit, this.submitHandler);

    if (this._cardButton) {
      this._cardButton.removeEventListener("click", this.cardClickHandler);
    }
    if (this._cashButton) {
      this._cashButton.removeEventListener("click", this.cashClickHandler);
    }

    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    console.log('OrderForm уничтожен');
  }

  public updateData(
  items: IOrderItem[],  
  total: number
  ): void {
    this.items = items;
    this.total = total;
  }

  public getData(): IOrderFormStep1Data {
    return {
      paymentMethod: this.paymentMethod!,
      address: this.formFields["address"].value
    };
  }

  public render(data?: Partial<IOrderFormStep1Data>): HTMLElement {
    if (data && data.address != null) {
      this.formFields["address"].value = data.address;
    }

    const priceElement = this.container.querySelector(".order__price");
    if (priceElement) {
      priceElement.textContent = `Итого: ${this.total} синапсов`;
    }

    const itemsList = this.container.querySelector(".order__items");
    if (itemsList) {
      itemsList.innerHTML = "";

      this.items.forEach(item => {
        // Получаем title и price из productData по id товара
        const productInfo = this.productData[item.id];
        const title = productInfo?.title ?? "Неизвестный товар";
        const price = productInfo?.price ?? 0;

        const itemElement = document.createElement("div");
        itemElement.className = "order__item";
        itemElement.innerHTML = `
          <span class="order__title">${title}</span>
          <span class="order__price">${price} синапсов</span>
        `;
        itemsList.appendChild(itemElement);
      });
    }

    return this.container;
  }
}
