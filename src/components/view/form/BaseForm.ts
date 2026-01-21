import { Component } from "../../base/Component";
import { ensureElement } from "../../../utils/utils";
import { IEvents } from "../../base/Events";

export class BaseForm<T extends object> extends Component<T> {
  protected data: T;
  protected errorsElement: HTMLElement;
  protected submitButton?: HTMLButtonElement;
  protected formFields: Record<string, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = {};
  protected validationRules: Record<string, (value: string) => boolean> = {};

  constructor(container: HTMLElement, public events: IEvents) {
    super(container);

    // 1. Проверяем, что контейнер — валидный HTMLElement
    if (!(container instanceof HTMLElement)) {
      throw new Error("BaseForm: контейнер не является HTMLElement");
    }

    this.data = {} as T;

    try {
      // 2. Ищем .form__errors ВНУТРИ контейнера через ensureElement
      this.errorsElement = ensureElement<HTMLElement>('.form__errors', container);

      // 3. Инициализируем элементы формы
      this.initElements();

      // 4. Настраиваем обработчики
      this.setupEventListeners();
    } catch (error) {
      console.error("Ошибка при инициализации BaseForm:", error);
      throw error; // Передаём ошибку выше для обработки
    }
  }

  protected initElements(): void {
    // Кнопка отправки
    try {
      this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
    } catch (error) {
      console.warn("Кнопка отправки не найдена в форме", error);
    }

    // Поля формы
    const inputs = this.container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (
        input instanceof HTMLInputElement ||
        input instanceof HTMLSelectElement ||
        input instanceof HTMLTextAreaElement
      ) {
        if (input.name) {
          this.formFields[input.name] = input;
        }
      }
    });
  }

  protected setupEventListeners(): void {
    // Удаляем старые обработчики и добавляем новые
    Object.keys(this.formFields).forEach(name => {
      const field = this.formFields[name];

      // Клонируем элемент, чтобы сбросить обработчики
      const clonedField = field.cloneNode(true) as HTMLInputElement;
      field.replaceWith(clonedField);
      this.formFields[name] = clonedField;

      clonedField.addEventListener('input', () => this.validateField(name));
    });

    if (this.submitButton) {
      this.submitButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.submit();
      });
    }
  }

  protected validateField(name: string): boolean {
    const field = this.formFields[name];
    const rule = this.validationRules[name];

    if (!rule) return true;
    if (!field) {
      console.error(`Поле с именем "${name}" не найдено в форме`);
      this.showError(`Поле "${name}" отсутствует.`);
      return false;
    }
    if (typeof field.value === 'undefined') {
      console.error(`У поля "${name}" нет свойства value`);
      this.showError(`Поле "${name}" некорректно.`);
      return false;
    }

    const isValid = rule(field.value);
    if (!isValid) {
      this.showError(`Поле "${name}" содержит ошибку.`);
    } else {
      this.clearError();
    }
    return isValid;
  }

  protected validate(): boolean {
    let isValid = true;
    Object.keys(this.validationRules).forEach(name => {
      if (!this.validateField(name)) {
        isValid = false;
      }
    });
    return isValid;
  }

  protected submit(): void {
    if (this.validate()) {
      console.log('Форма валидна, отправляем данные:', this.getFormData());
      this.events.emit('form:submit', this.getFormData());
    }
  }

  protected getFormData(): Partial<T> {
    const data: Partial<T> = {};
    Object.keys(this.formFields).forEach(name => {
      data[name as keyof T] = this.formFields[name].value as T[keyof T];
    });
    return data;
  }

  protected showError(message: string): void {
    this.errorsElement.textContent = message;
    this.errorsElement.style.display = 'block';
  }

  protected clearError(): void {
    this.errorsElement.textContent = '';
    this.errorsElement.style.display = 'none';
  }

  render(data?: Partial<T>): HTMLElement {
    if (data) {
      Object.assign(this.data, data);
    }
    return this.container;
  }
}
