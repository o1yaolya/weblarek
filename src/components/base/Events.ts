// Хорошая практика даже простые типы выносить в алиасы
// Зато когда захотите поменять это достаточно сделать в одном месте
type EventName = string | RegExp;
type Subscriber = Function;
type EmitterEvent = {
    eventName: string,
    data: unknown
};

export interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
     off(event: AppEvent, callback: Function): void;
    emit<T extends object>(event: string, data?: T): void;
}

/**
 * Брокер событий, классическая реализация
 * В расширенных вариантах есть возможность подписаться на все события
 * или слушать события по шаблону например
 */
export class EventEmitter implements IEvents {
    _events: Map<EventName, Set<Subscriber>>;

    constructor() {
        this._events = new Map<EventName, Set<Subscriber>>();
    }

    /**
     * Установить обработчик на событие
     */
    on<T extends object>(eventName: EventName, callback: (event: T) => void) {
        if (!this._events.has(eventName)) {
            this._events.set(eventName, new Set<Subscriber>());
        }
        this._events.get(eventName)?.add(callback);
    }

    /**
     * Снять обработчик с события
     */
    off(eventName: EventName, callback: Subscriber) {
        if (this._events.has(eventName)) {
            this._events.get(eventName)!.delete(callback);
            if (this._events.get(eventName)?.size === 0) {
                this._events.delete(eventName);
            }
        }
    }

    /**
     * Инициировать событие с данными
     */
    emit<T extends object>(eventName: string, data?: T) {
        this._events.forEach((subscribers, name) => {
            if (name === '*') subscribers.forEach(callback => callback({
                eventName,
                data
            }));
            if (name instanceof RegExp && name.test(eventName) || name === eventName) {
                subscribers.forEach(callback => callback(data));
            }
        });
    }

    /**
     * Слушать все события
     */
    onAll(callback: (event: EmitterEvent) => void) {
        this.on("*", callback);
    }

    /**
     * Сбросить все обработчики
     */
    offAll() {
        this._events = new Map<string, Set<Subscriber>>();
    }

    /**
     * Сделать коллбек триггер, генерирующий событие при вызове
     */
    trigger<T extends object>(eventName: string, context?: Partial<T>) {
        return (event: object = {}) => {
            this.emit(eventName, {
                ...(event || {}),
                ...(context || {})
            });
        };
    }
}

export enum AppEvent {
  // События корзины
  BasketOpen = 'basket:open', // Открытие корзины
  BasketUpdate = 'basket:update', // Обновление содержимого корзины
  BasketOrder = 'basket:order', // Нажатие «Оформить заказ»
  BasketItemDelete = 'basket:item:delete', // Удаление товара из корзины
  BasketCheckoutStep2 = 'basket:checkout:step2', // Нажатие кнопки перехода ко 2-й форме оформления заказа
  BasketPayment = 'basket:payment', // Нажатие кнопки оплаты/завершения оформления заказа
  BasketFormChange = 'basket:form:change', // Изменение данных в формах оформления заказа

  // События модальных окон
  ModalOpen = 'modal:open',
  ModalClose = 'modal:close',

  // События карточек товаров
  CardClick = 'card:click', // Клик по карточке товара
  CardAddToBasket = 'card:add-to-basket', // Добавление товара в корзину через карточку
  CardPriceChange = 'card:price:change', // Изменение цены товара
  CardDataUpdate = 'card:data:update', // Обновление данных карточки
  ProductSelect = 'product:select',

  // События галереи/каталога
  GalleryUpdated = 'gallery:updated', // Обновление списка товаров в галерее
  CatalogChange = 'catalog:change', // Изменение каталога (перезагрузка)

  // События модели данных покупателя
  BuyerDataUpdate = 'buyer:data:update', // Изменение данных покупателя

  // События оформления заказа (дополнительные)
  OrderSuccess = 'order:success', // Успешное оформление заказа
  OrderComplete = 'order:complete',
  OrderError = 'order:error', // Ошибка при оформлении заказа

  // События интерфейса
  HeaderCounterUpdate = 'header:counter:update', // Обновление счётчика товаров в шапке
  ShowCheckoutForm = 'checkout:form:show', // Показать форму оформления заказа

  //ajhvs
  FormSubmit = 'form:submit',
  InputChange = 'input:change',
  FormStep1Submit = 'form:step1:submit',  
  FormStep2Submit = 'form:step2:submit',
}


// Интерфейс для системы событий
export interface IEvents {
  emit(event: string | AppEvent, data?: unknown): void;
  on(event: string | AppEvent, callback: (data?: unknown) => void): void;
  off(event: string | AppEvent, handler: (data?: unknown) => void): void;
}

