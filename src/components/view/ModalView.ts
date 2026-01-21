import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { AppEvent } from "../base/Events";
import { OrderForm } from "./form/OrderForm";
import { OrderFormStep2 } from "./form/OrderForm2";
import { IModalEvents } from "../../main";
import { IOrderItem } from "../../types";

import { IOrderFormStep1Data, IOrderFormStep2Data } from "../../types";
// Интерфейс опций модального окна
interface IModalOptions {
  content: HTMLElement;
}

/**
 * Компонент модального окна
 */
export class Modal extends Component<IModalEvents> {
  protected modalContent: HTMLElement;
  protected closeButton: HTMLButtonElement;
  private currentForm: OrderForm | OrderFormStep2 | null = null;
  protected events: IModalEvents;

  constructor(container: HTMLElement, events: IModalEvents) {
    super(container);
    this.events = events;

    // Инициализация DOM-элементов
    this.modalContent = ensureElement('.modal__content', this.container);
    this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);
       this.initEventListeners();
       this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // 1. Закрытие по кнопке [×]
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }

    // 2. Закрытие по ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });

    // 3. Закрытие при клике вне контента
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });
  }

  
public getContainer(): HTMLElement {
    return this.container;
  }

  /**
   * Настройка обработчиков событий
   */
  private initEventListeners(): void {
    this.closeButton.addEventListener('click', this.onCloseClick);
    document.addEventListener('keydown', this.onEscapePress);
    this.container.addEventListener('click', this.onOverlayClick);
  }

  /**
   * Отписка от обработчиков событий
   */
  private removeEventListeners(): void {
    this.closeButton.removeEventListener('click', this.onCloseClick);
    document.removeEventListener('keydown', this.onEscapePress);
    this.container.removeEventListener('click', this.onOverlayClick);
  }

  private onCloseClick = () => {
    this.events.emit('close');
  };

  private onEscapePress = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.events.emit('close');
    }
  };

  private onOverlayClick = (event: MouseEvent) => {
    if (event.target === this.container) {
      this.events.emit('close');
    }
  };

  /**
   * Показать модальное окно
   */
  show(): void {
    if (!this.isOpened()) {
      this.container.classList.add('modal_active');
      this.container.setAttribute('aria-modal', 'true');
      this.container.setAttribute('role', 'dialog');
      this.initEventListeners();
    }
  }

  /**
   * Скрыть модальное окно
   */
  hide(): void {
    this.removeEventListeners();
    this.container.classList.remove('modal_active');
    this.container.removeAttribute('aria-modal');
    this.container.removeAttribute('role');
    this.events.emit(AppEvent.ModalClose);
  }

  /**
   * Рендер содержимого и показ окна
   * @param data - объект с content (HTMLElement)
   */
 render(data?: Partial<IModalEvents>): HTMLElement {
  // Извлекаем content из data, если он есть
  const content = (data as { content?: HTMLElement } | undefined)?.content;

  if (content) {
    this.setContent(content);
  }

  this.show();
  return this.container;
}


  /**
   * Проверить, открыто ли окно
   */
  isOpened(): boolean {
    return this.container.classList.contains('modal_active');
  }
private createModalEventsAdapter(baseEvents: IEvents): IModalEvents {
  return {
    emit: (event: string, data?: unknown) => baseEvents.emit(event, data),
    on: (event: string, handler: (...args: unknown[]) => void) => baseEvents.on(event, handler),
    off: (event: string, handler: (...args: unknown[]) => void) => baseEvents.off(event, handler),

    'form:step1:submit': (data: IOrderFormStep1Data) => {
      baseEvents.emit(AppEvent.FormStep1Submit, data);
    },
    'form:step2:submit': (data: IOrderFormStep2Data) => {
      baseEvents.emit(AppEvent.FormStep2Submit, data);
    },
    close: () => {
      baseEvents.emit('close');
    },
     input: () => {}
  };
}


  /**
   * Установить содержимое без повторного рендера
   * @param content - HTMLElement
   */
 public setContent(content: HTMLElement): void {
    if (!(content instanceof HTMLElement)) {
      throw new Error('setContent: content должен быть HTMLElement');
    }

    // Полное очищение (включая обработчики)
    while (this.modalContent.firstChild) {
      const child = this.modalContent.firstChild;
      if (child instanceof HTMLElement) {
        child.remove(); // remove() автоматически удаляет обработчики
      } else {
        this.modalContent.removeChild(child);
      }
    }

    this.modalContent.appendChild(content);
  }

  /**
   * Загрузить шаблон по ID
   * @param templateId - ID шаблона (<template>)
   */
  private loadTemplate(templateId: string): HTMLElement {
    const template = document.getElementById(templateId) as HTMLTemplateElement | null;
    if (!template) {
      throw new Error(`Шаблон #${templateId} не найден`);
    }
    
    const content = template.content.cloneNode(true) as DocumentFragment;
    const container = document.createElement('div');
    container.appendChild(content);
    return container;
  }

  /**
   * Открыть форму первого шага заказа
   * @param items - список товаров в корзине
   * @param total - итоговая сумма
   * @param events - события для передачи в форму
   */
  openOrderFormStep1(
  items: Array<{ id: string; title: string; price: number }>,
  total: number,
  events: IEvents,
   productData: { [id: string]: { title: string; price: number } } 
): void {
  try {
     // Преобразуем items в формат IOrderItem[], добавляя quantity = 1
    const orderItems: IOrderItem[] = items.map(item => ({
      id: item.id,
      quantity: 1  // или взять из корзины, если там есть это поле
    }));
    const orderContent = this.loadTemplate('order');
    const modalEvents = this.createModalEventsAdapter(events);
    this.currentForm = new OrderForm(orderContent, modalEvents, orderItems, total, productData);
    this.setContent(orderContent);
    this.show();
  } catch (error) {
    console.error('Ошибка открытия формы шага 1:', error);
  }
}

  /**
   * Открыть форму второго шага заказа
   * @param initialData - начальные данные для заполнения формы
   * @param events - события для передачи в форму
   */
openOrderFormStep2(
  initialData: Partial<IOrderFormStep2Data>,
  events: IEvents
): void {
  try {
    const contactsContent = this.loadTemplate('contacts');
    const modalEvents = this.createModalEventsAdapter(events); // ← Адаптер!
    this.currentForm = new OrderFormStep2(contactsContent, modalEvents);
    if (initialData) {
      (this.currentForm as OrderFormStep2).render(initialData);
    }
    this.setContent(contactsContent);
    this.show();
  } catch (error) {
    console.error('Ошибка открытия формы шага 2:', error);
  }
}


  /**
   * Закрыть модальное окно и очистить текущую форму
   */
  close(): void {
    this.hide();
    this._destroyCurrentForm();
    // Дополнительно очищаем содержимое
    this.modalContent.innerHTML = '';
  }

  /**
   * Уничтожить текущую форму (если есть)
   */
  private _destroyCurrentForm(): void {
    if (this.currentForm && 'destroy' in this.currentForm) {
      (this.currentForm as { destroy: () => void }).destroy();
    }
    this.currentForm = null;
  }
}
