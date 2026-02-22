import { BaseForm } from "./BaseForm";
import { ensureElement } from "../../../utils/utils";
import { IEvents } from "../../base/Events";

export interface IOrderFormStep1Data {
  paymentMethod: "card" | "cash";
  address: string;
  email?: string;   // опциональное поле
  phone?: string;  // опциональное поле
}



export interface IOrderFormStep1Events {
  'form:submit': (data: IOrderFormStep1Data) => void;
  'input:change': (field: keyof IOrderFormStep1Data, value: string) => void;
}

export class OrderForm extends BaseForm<IOrderFormStep1Data> {
  protected cardButton: HTMLButtonElement;
  protected cashButton: HTMLButtonElement;
  protected addressInput: HTMLInputElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    try {
      this.cardButton = ensureElement<HTMLButtonElement>(
        'button[name="card"]',
        this.container
      );
      this.cashButton = ensureElement<HTMLButtonElement>(
        'button[name="cash"]',
        this.container
      );

      this.addressInput = ensureElement<HTMLInputElement>(
        'input[name="address"]',
        this.container
      );

      // Исправленный селектор для кнопки отправки
      this.submitButton = ensureElement<HTMLButtonElement>(
        '.order__button', // или 'button[type="submit"]'
        this.container
      );

      // Вызываем настройку обработчиков после инициализации элементов
      this.setupEventListeners();
    } catch (error) {
      console.error("Ошибка при инициализации OrderForm:", error);
      throw error;
    }
  }

  // === МЕТОД НАСТРОЙКИ ОБРАБОТЧИКОВ СОБЫТИЙ ===
 protected setupEventListeners(): void {
  // Обработчик для кнопки отправки
  if (this.submitButton) {
    this.submitButton.addEventListener('click', (event) => {
      event.preventDefault();
      const formData: IOrderFormStep1Data = {
        paymentMethod: this.paymentMethod || 'card',
        address: this.addressInput.value,
      };
      this.events.emit('form:submit', formData);
    });
  }

  // Обработчики для кнопок способа оплаты
  if (this.cardButton) {
    this.cardButton.addEventListener('click', () => {
      this.paymentMethod = 'card';
      this.events.emit('payment:change', 'card');
      this.validate(); // Добавляем проверку валидности при выборе способа оплаты
    });
  }
  if (this.cashButton) {
    this.cashButton.addEventListener('click', () => {
      this.paymentMethod = 'cash';
      this.events.emit('payment:change', 'cash');
      this.validate(); // Добавляем проверку валидности при выборе способа оплаты
    });
  }

  // Обработчик для ввода адреса
  if (this.addressInput) {
    this.addressInput.addEventListener('input', () => {
      this.events.emit('input:change', {
        field: 'address',
        value: this.addressInput.value,
      });
      this.validate(); // Перепроверяем валидность формы при каждом изменении адреса
    });
  }
}


  // Сеттер для визуального состояния кнопки оплаты
  set paymentMethod(value: "card" | "cash" | null) {
    if (value === "card") {
      this.cardButton.classList.add("button_alt-active");
      this.cashButton.classList.remove("button_alt-active");
    } else if (value === "cash") {
      this.cashButton.classList.add("button_alt-active");
      this.cardButton.classList.remove("button_alt-active");
    } else {
      this.cardButton.classList.remove("button_alt-active");
      this.cashButton.classList.remove("button_alt-active");
    }
  }
  setFieldValue(field: keyof IOrderFormStep1Data, value: string): void {
  switch (field) {
    case 'address':
      this.addressInput.value = value;
      break;
    case 'paymentMethod':
      // Для paymentMethod обновляем визуальное состояние
      this.paymentMethod = value as "card" | "cash" | null;
      break;
  }
}
public validate(): boolean { 
  const paymentValid = this.paymentMethod !== null; 
  const addressValid = this.addressInput.value.trim() !== '';
  const isValid = paymentValid && addressValid; 
  
  if (this.submitButton) {
  this.submitButton.disabled = !isValid;
}


  if (!isValid) { 
    this.showError("Необходимо указать адрес"); 
  } else { 
    this.clearError(); 
  } 
  return isValid; 
}

}


