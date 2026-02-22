import { Component } from "../../base/Component";
import { ensureAllElements, ensureElement } from "../../../utils/utils";
import { IEvents } from "../../base/Events";


// Базовый класс для работы с формами 

export class BaseForm<T extends object> extends Component<T> {

  protected errorsElement: HTMLElement;
  protected submitButton?: HTMLButtonElement;
  protected formFields: HTMLInputElement[];
  

  constructor(container: HTMLElement, public events: IEvents) {
    super(container);

    // 1. Проверяем, что контейнер — валидный HTMLElement
    if (!(container instanceof HTMLElement)) {
      throw new Error("BaseForm: контейнер не является HTMLElement");
    }

    try {
      // 2. Ищем .form__errors ВНУТРИ контейнера через ensureElement
      this.errorsElement = ensureElement<HTMLElement>('.form__errors', container);

      // 3. Инициализируем элементы формы
      // Кнопка отправки
    try {
      this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
    } catch (error) {
      console.warn("Кнопка отправки не найдена в форме", error);
    }
      // Поля формы
    this.formFields = ensureAllElements<HTMLInputElement>(
      ".form_input",
      this.container
    );
      // 4. Настраиваем обработчики
      this.setupEventListeners();
    } catch (error) {
      console.error("Ошибка при инициализации BaseForm:", error);
      throw error; // Передаём ошибку выше для обработки
    }

  }

  protected setupEventListeners(): void {
   // Обработка submit
    if (this.submitButton) {
      this.submitButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.events.emit('form:submit');
      });
    }
  }

  // Установка состояния кнопки submit
  set submitDisabled(value: boolean) {
    if (this.submitButton) {
      this.submitButton.disabled = value;
    }
  }

  protected showError(message: string): void {
    this.errorsElement.textContent = message;
    this.errorsElement.style.display = 'block';
  }

  protected clearError(): void {
    this.errorsElement.textContent = '';
    this.errorsElement.style.display = 'none';
  }
}
