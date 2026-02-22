import { BaseForm } from './BaseForm';
import { AppEvent, IEvents } from '../../base/Events';
import { ensureElement } from '../../../utils/utils';

// Тип данных формы
interface ContactsFormData {
  email: string;
  phone: string;
}

export class ContactsForm extends BaseForm<ContactsFormData> {
  public emailInput: HTMLInputElement;
  public phoneInput: HTMLInputElement;
  private payButton: HTMLButtonElement | null = null;
  private onPaymentSubmit: (() => void) | null = null;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    // Инициализация полей
    this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
    this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);

    // Ищем кнопку оплаты — используем более точный селектор
    this.payButton = ensureElement<HTMLButtonElement>('.button', container);

    // Добавляем обработчики валидации
    this.phoneInput.addEventListener('input', () => this.validateForm());
    this.emailInput.addEventListener('input', () => this.validateForm());

    // Инициализируем состояние кнопки
    this.validateForm();
  }

  public validateForm(): void {
    const isEmailValid = this.validateEmail(this.emailInput.value);
    const isPhoneValid = this.validatePhone(this.phoneInput.value);
    const isFormValid = isEmailValid && isPhoneValid;

    // Эмитим событие валидации для презентера
    this.events.emit(AppEvent.FormValidation, isFormValid);

    // Обновляем состояние кнопки оплаты
    if (this.payButton) {
      this.payButton.disabled = !isFormValid;
      this.payButton.classList.toggle('button_disabled', !isFormValid);
    }

    // Отображение ошибок
    if (!isFormValid) {
      this.showError('Заполните все поля корректно');
    } else {
      this.clearError();
    }

    console.log('Валидация выполнена:', { isEmailValid, isPhoneValid, isFormValid });
  }

  getData(): ContactsFormData {
    return {
      email: this.emailInput.value.trim(),
      phone: this.phoneInput.value.trim()
    };
  }

  /**
   * Инициализирует кнопку оплаты и её обработчик
   */
  initPaymentButton(onSubmit: () => void): void {
    this.onPaymentSubmit = onSubmit;

    if (!this.payButton) {
      console.warn('Кнопка оплаты не найдена в шаблоне формы контактов');
      return;
    }

    // Удаляем предыдущий обработчик, если есть
    this.payButton.removeEventListener('click', this.handlePaymentClick);

    // Устанавливаем новый обработчик
    this.payButton.addEventListener('click', this.handlePaymentClick.bind(this));

    // Сразу проверяем валидность при инициализации кнопки
    this.validateForm();
  }

  // Обработчик клика кнопки оплаты
  private handlePaymentClick(e: MouseEvent): void {
    e.preventDefault();
    if (this.onPaymentSubmit) {
      this.onPaymentSubmit();
    }
  }

  public validateEmail(email: string): boolean {
    // Базовая валидация email
    if (!email || email.trim().length === 0) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  public validatePhone(phone: string): boolean {
    if (!phone || phone.trim().length === 0) return false;
    // Убираем все нецифровые символы и проверяем длину
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  }

  public setContainer(container: HTMLElement): void {
    // Переинициализируем элементы

    this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
    this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);
    this.payButton = ensureElement<HTMLButtonElement>('.button', container);

    // Восстанавливаем обработчики событий
    this.phoneInput.removeEventListener('input', this.validateForm);
    this.emailInput.removeEventListener('input', this.validateForm);

    this.phoneInput.addEventListener('input', () => this.validateForm());
    this.emailInput.addEventListener('input', () => this.validateForm());

    // Обновляем валидацию после смены контейнера
    this.validateForm();
  }
}
