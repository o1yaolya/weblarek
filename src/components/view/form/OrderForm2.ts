import { BaseForm } from "./BaseForm";
import { ensureElement } from "../../../utils/utils";
import { IEvents } from "../../base/Events";
import { AppEvent } from "../../base/Events";

export interface IOrderFormStep2Data {
  email: string;
  phone: string;
}

export class OrderFormStep2 extends BaseForm<IOrderFormStep2Data> {
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;
  protected submitButton: HTMLButtonElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    // 1. Находим элементы DOM
    this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
    this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);
    this.submitButton = ensureElement<HTMLButtonElement>('.button', container);

    // В конструкторе, после добавления обработчиков input
this.emailInput.addEventListener('input', () => {
  this.validateStep2(false);
  this.events.emit('input'); // Сигнализируем об изменении
});

this.phoneInput.addEventListener('input', () => {
  this.validateStep2(false);
  this.events.emit('input'); // Сигнализируем об изменении
});

 // ПРИНУДИТЕЛЬНО снимаем disabled при инициализации
  this.submitButton.disabled = false;
    // 2. Добавляем поля в formFields (обязательно для валидации)
    this.formFields = {
      email: this.emailInput,
      phone: this.phoneInput
    };

    // 3. Правила валидации
    this.validationRules = {
      email: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.(ru|com|net|org|info|biz)$/i;
        return emailRegex.test(value.trim());
      },
      phone: (value: string) => {
        const digits = value.replace(/[^\d]/g, '');
        return digits.length >= 10;
      }
    };

    // 4. Обработчики ввода (для мгновенной валидации)
    this.emailInput.addEventListener('input', () => this.validate());
    this.phoneInput.addEventListener('input', () => this.validate());

    // 5. Обработчик клика кнопки
    this.submitButton.addEventListener('click', this.submit.bind(this));
      // Запускаем валидацию сразу после инициализации
  this.validateStep2(true);
  }

  // Переопределяем showError
  protected showError(): void {
    const errors: string[] = [];
const emailValue = this.emailInput.value.trim();
  const phoneValue = this.phoneInput.value.trim();

  const isEmailValid = this.validationRules.email(emailValue);
  const isPhoneValid = this.validationRules.phone(phoneValue);

  if (!isEmailValid) {
    errors.push('Введите корректный email');
  }
  if (!isPhoneValid) {
    errors.push('Введите корректный телефон (не менее 10 цифр)');
  }

  if (errors.length > 0) {
    this.errorsElement.innerHTML = errors.join('<br>');
    this.errorsElement.style.display = 'block';
  } else {
    this.clearError();
  }
}

  // Переопределяем clearError
  protected clearError(): void {
    this.errorsElement.textContent = '';
    this.errorsElement.style.display = 'none';
  }

  // Валидация всей формы
  public validateStep2(silent: boolean = false): boolean {
    const isEmailValid = this.validateField('email');
    const isPhoneValid = this.validateField('phone');
    // Включаем/отключаем кнопку
    this.submitButton.disabled = !(isEmailValid && isPhoneValid);

    // Показываем ошибки только если не silent
    if (!silent) {
      if (!isEmailValid || !isPhoneValid) {
        this.showError();
      } else {
        this.clearError();
      }
    }

    return isEmailValid && isPhoneValid;
  }

  // Отправка данных
  protected submit(): void {
    if (this.validateStep2()) {
      const data: IOrderFormStep2Data = {
        email: this.emailInput.value.trim(),
        phone: this.phoneInput.value.trim()
      };
      this.events.emit(AppEvent.OrderComplete, data);
    }
  }

  // Метод для сброса формы (опционально)
  public reset(): void {
    this.emailInput.value = '';
    this.phoneInput.value = '';
    this.clearError();
    this.validateStep2(true); // silent=true после сброса
  }
  
 // Проверяет валидность формы (вызывается извне)
public isValid(): boolean {
   return this.validateStep2(true);
}

 //Возвращает данные формы
 
public getData(): IOrderFormStep2Data {
  return {
    email: this.emailInput.value.trim(),
    phone: this.phoneInput.value.trim()
  };
}

/**
 * Принудительный сброс формы (для очистки после оплаты)
 */
public resetForm(): void {
  this.reset();
}
}
