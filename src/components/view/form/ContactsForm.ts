import { BaseForm } from './BaseForm';
import { IEvents } from '../../base/Events';
import { ensureElement } from '../../../utils/utils';

// Тип данных формы
interface ContactsFormData {
  email: string;
  phone: string;
}

export class ContactsForm extends BaseForm<ContactsFormData> {
  protected emailInput: HTMLInputElement;
  protected phoneInput: HTMLInputElement;


constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    // Инициализация полей
    this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
    this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);

    // Установка правил валидации
    this.validationRules = {
      email: (value) => /^\S+@\S+\.\S+$/.test(value),
      phone: (value) => /^\+?[0-9\s\-\(\)]{10,}$/.test(value)
    };
  }

  // Переопределяем getFormData для точного типа
  protected getFormData(): ContactsFormData {
    return {
      email: this.emailInput.value,
      phone: this.phoneInput.value
    };
  }
}
