import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";

// интерфейс модального окна
interface IModal {
  content: HTMLElement | null;
}

/**
 * Компонент модального окна 
 */
export class Modal extends Component<IModal> {
  protected modalContent: HTMLElement;
  protected closeButton: HTMLButtonElement;
  
  protected events: IEvents;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
     this.events = events;

    this.modalContent = ensureElement('.modal__content', this.container);
    if (!this.modalContent) {
    throw new Error("Не найден элемент .modal__content в контейнере модального окна");
  }
    this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);

    // Обработчик событий
    this.bindEventListeners();
  }

 private bindEventListeners(): void {
  // Клик по кнопке закрытия 
  this.closeButton.addEventListener('click', ():void => {
    this.close();
  });

  // Нажатие Escape 
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.close();
    }
  });

  // Клик по overlay
  this.container.addEventListener('click', (event: MouseEvent) => {
    if (event.target === this.container) {
      this.close();
    }
  });
}

  // Открыть модальное окно
  public open(content:HTMLElement): void {
     this.content = content; 
    this.container.classList.add('modal_active');
  }

//  Закрыть  модальное окно и очистить содержимое
  public close(): void {
  this.container.classList.remove('modal_active');
  this.modalContent.replaceChildren();
  this.content = null; // Сброс ссылки на контент
}

 public setContent(content: HTMLElement): void {
    this.content = content;
  }
  // сеттер установки контента модального окна
 set content(element: HTMLElement | null) {
  if (element === null) {
    // Логика при сбросе контента (например, очистка DOM)
    if (this.modalContent) {
      this.modalContent.replaceChildren();
    }
    return; // Выход, если контент null — ничего не аппендим
  }

  if (!this.modalContent) {
    console.error("modalContent не инициализирован! Проверьте контейнер модального окна.");
    return;
  }

  this.modalContent.replaceChildren();
  this.modalContent.appendChild(element);
}


  public show(): void {
  this.container.classList.add('modal_active');
}
}
