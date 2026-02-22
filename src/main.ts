import { Product } from "./components/models/product";
import { GalleryView } from "./components/view/GalleryView";
import { EventEmitter, IEvents, AppEvent } from "./components/base/Events";
import { Card } from "./components/view/card/card";
import { ServerApi } from "./components/base/ServerApi";
import { Api } from "./components/base/Api";
import { API_URL } from "./utils/constants";
import { 
  IProduct,
  IOrderResponse,
} from "./types/index";
import { IOrderFormStep1Data } from "./components/view/form/OrderForm";
import { IOrderRequest } from "./types/index";
import { IOrderItem } from "./types/index";
import { cloneTemplate } from "./utils/utils";
import "./scss/styles.scss";
import { DetailedCard } from "./components/view/card/detailedCard";
import { Modal } from "./components/view/ModalView";
import { Basket } from "./components/models/basket";
import { Header } from "./components/view/HeaderView";
import { BasketView } from "./components/view/BasketView";
import { OrderForm } from "./components/view/form/OrderForm";
import { SuccessView } from "./components/view/SuccessView";
import { TPayment } from "./types/index";
import { SimpleCard } from "./components/view/card/simpleCard";
import { ensureElement } from "./utils/utils";
import { BasketCard } from "./components/view/card/basketCard";
import { ContactsForm } from "./components/view/form/ContactsForm";


interface CardClickPayload { id: string; }

export interface IModalEvents extends IEvents {
  'form:submit': (data: IOrderFormStep1Data) => void;
  'input:change': (field: keyof IOrderFormStep1Data, value: string) => void;
  close: () => void;
  'contact:submit': (data: { email: string; phone: string }) => void;
  'form:validation': (isValid: boolean) => void;
}

export interface IBasketRenderData {
  items: string[]; 
  total: number;
  hasItems: boolean;
}


export class CatalogPresenter {
  private events: IEvents;
  private productsModel: Product;
  private basketModel: Basket;
  private gallery: GalleryView;
  private header: Header;
  private basketView: BasketView;
  private modal: Modal;
  private serverApi: ServerApi;
  private orderForm: OrderForm | null = null;
  private successView: SuccessView | null = null;
  private paymentMethod: TPayment | null = null;
  private tempOrderData: Partial<IOrderRequest> = {};
  private contactsForm: ContactsForm | null = null;

  constructor(events: IEvents) {
    this.events = events;
    this.productsModel = new Product(events);
    this.basketModel = new Basket();
    this.basketModel.loadFromStorage();
    
    
    this.gallery = new GalleryView(ensureElement(".gallery"));
    this.header = new Header(ensureElement(".header"), events);

    // 1. Клонируем шаблон корзины
  const basketClone = cloneTemplate('#basket');

  // 2. Вставляем его в DOM (например, в конец body)
  document.body.appendChild(basketClone);

  // 3. Теперь инициализируем BasketView — все вложенные элементы доступны
  
this.basketView = new BasketView(
  basketClone,
  events,
  this.basketModel
);

    this.modal = new Modal(ensureElement("#modal-container"), this.createModalEventsAdapter());
    this.serverApi = new ServerApi(new Api(API_URL));

    this.subscribeToEvents();
  }

  async init(): Promise<void> {
    try {
      const catalogData: IProduct[] = await this.serverApi.getProducts();
      if (!catalogData || !Array.isArray(catalogData)) {
        throw new Error("Получены некорректные данные каталога");
      }
      console.log(`Загружено товаров: ${catalogData.length}`);
      this.productsModel.setItems(catalogData);
      this.renderCatalog();
      this.events.emit(AppEvent.CatalogChange);
     
    // Скрываем корзину при загрузке (отображается только по клику)
   this.basketView.getContainer().style.display = 'none';

    } catch (err) {
      console.error("Ошибка загрузки каталога:", err);
      alert("Не удалось загрузить каталог товаров. Проверьте подключение к серверу.");
    }
    this.updateHeaderCounter();
    
  }

 private subscribeToEvents(): void {
  // События модели данных
  this.events.on(AppEvent.CatalogChange, this.renderCatalog.bind(this));
  this.events.on(AppEvent.BasketUpdate, this.updateHeaderCounter.bind(this));
  this.events.on(AppEvent.BasketItemDelete, this.updateHeaderCounter.bind(this));

  // События представлений
  this.events.on(AppEvent.CardClick, (payload: CardClickPayload) => {
    this.showProductDetail(payload.id);
  });
  this.events.on(AppEvent.BasketOrder, () => {
    this.openBasketModal();
  });
  this.events.on(AppEvent.ShowCheckoutForm, () => {
    this.openOrderForm();
  });

  // Обработчики форм
  this.events.on('form:submit', this.handleOrderSubmit.bind(this));
  this.events.on('input:change', (data: { field: keyof IOrderFormStep1Data; value: string }) => {
    const { field, value } = data;
    if (field === 'paymentMethod') {
      this.paymentMethod = value as TPayment;
    }
    if (this.orderForm) {
      this.orderForm.setFieldValue(field, value);
    }
  });

  // Подписка на событие валидации формы контактов
this.events.on(AppEvent.FormValidation, (data: unknown) => {
    const isValid = data as boolean;
    if (this.contactsForm) {
      this.contactsForm.submitDisabled = !isValid;
      console.log('Синхронизация кнопки "Оплатить":', isValid ? 'активна' : 'неактивна');
    } else {
      console.warn('ContactsForm ещё не инициализирован');
    }
  });
  

  this.events.on(AppEvent.ContactSubmit, this.handleContactSubmit.bind(this));
   this.setupContactsFormValidation(); 
}


  // === РЕНДЕРИНГ КАТАЛОГА ===
  private renderCatalog(): void {
    if (document.readyState !== "complete") {
      console.warn("DOM not ready. Waiting for load...");
      window.addEventListener("load", this.renderCatalog.bind(this));
      return;
    }

    const items = this.productsModel.getItems()
      .map((item) => {
        if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
  console.error('Товар без валидного ID:', item);
  return null;
        }

        const cardElement = cloneTemplate("#card-catalog");
        if (!cardElement) {
          console.error("Шаблон #card-catalog не найден");
          return null;
        }

        cardElement.dataset.productId = item.id;

        const card = new SimpleCard(cardElement, this.events);
        card.render({
           id: String(item.id), 
          title: item.title,
          price: item.price,
          imageSrc: item.image,
          category: item.category,
          button: {
            text: "Подробнее",
            url: `#product/${item.id}`
          }
        });

        return card.element;
      })
      .filter(item => item !== null);

    this.gallery.items = items;
  }

 private showProductDetail(productId: string): void {
  const product = this.productsModel.getItemsById(productId);
  if (!product) return;

  const detailedCardElement = cloneTemplate("#card-preview");
  if (!detailedCardElement) return;

  detailedCardElement.classList.add("card_detailed");


  const detailedCard = new DetailedCard(detailedCardElement, this.events);
  
  detailedCard.render(product);
  detailedCard.fillDetails(product);

  // Устанавливаем начальное состояние кнопки
  const isInBasket = this.basketModel.hasItem(productId);
  detailedCard.updateButtonState(isInBasket);

  // Назначаем обработчик клика
  detailedCard.setOnAddToBasket(() => {
    this.addToBasket(product.id);
    const updatedIsInBasket = this.basketModel.hasItem(product.id);
    detailedCard.updateButtonState(updatedIsInBasket); // Обновляем после изменения
  });

  this.modal.setContent(detailedCardElement);
  this.modal.show();
}





  // === УПРАВЛЕНИЕ КОРЗИНОЙ ===

private addToBasket(productId: string): void {
  if (!productId) {
    console.error("addToBasket: productId не передан");
    return;
  }

  const product = this.productsModel.getItemsById(productId);
  if (!product) {
    console.warn(`Товар с id=${productId} не найден`);
    return;
  }

  if (this.basketModel.hasItem(productId)) {
    this.basketModel.deleteItem(productId);
    console.log(`Товар "${product.title}" удалён из корзины`);
  } else {
    this.basketModel.addItem(product);
    console.log(`Товар "${product.title}" добавлен в корзину`);
    console.log('Товары в корзине:', this.basketModel.getItems());
  }

  this.emitBasketUpdate();
  this.updateHeaderCounter();
  this.basketModel.saveToStorage();
}
private createBasketItemIds(): string[] { 
  const items = this.basketModel.getItems();
  return items.map(item => String(item.id)); // преобразуем id в строку
}


private updateBasketView(): void {
  const basketItemIds = this.createBasketItemIds(); // получаем только id товаров
  const total = this.basketModel.getTotalPrice();
  const hasItems = basketItemIds.length > 0;

  // Формируем данные для рендеринга
  const renderData: IBasketRenderData = {
    items: basketItemIds,
    total: total,
    hasItems: hasItems
  };

  // Передаём данные в BasketView
  this.basketView.data = renderData;
}



private updateHeaderCounter(): void {
  const count = this.basketModel.getItems().length;
  this.header.counter = count;
  console.log(`Обновлён счётчик корзины: ${count} товаров`);
}

private emitBasketUpdate(): void {
  this.events.emit(AppEvent.BasketUpdate);
   this.updateBasketView(); // Обновляем отображение корзины
}


  // === ОТКРЫТИЕ МОДАЛЬНЫХ ОКОН ===
  private openBasketModal(): void {
  // Показываем корзину
  this.basketView.getContainer().style.display = 'block';
  this.modal.setContent(this.basketView.getContainer());
  this.modal.show();
}


  private openOrderForm(): void {
    const items = this.basketModel.getItems();
    if (items.length === 0) {
      alert('Корзина пуста!');
      return;
    }

    try {
      const formClone = cloneTemplate('#order');
      this.modal.setContent(formClone);

      if (!this.orderForm) {
        this.orderForm = new OrderForm(formClone, this.createModalEventsAdapter());
        console.log('Товары в корзине:', this.basketModel.getItems());
this.basketModel.getItems().forEach(item => {
  console.log('Тип id:', typeof item.id, 'Значение:', item.id);
});

      }

 // Приводим тип: если значение не "card"/"cash", ставим null
    const validPaymentMethod: "card" | "cash" | null = 
      this.paymentMethod === "card" || this.paymentMethod === "cash"
        ? this.paymentMethod
        : null;

      this.orderForm.paymentMethod = validPaymentMethod;
    this.modal.show();
    } catch (error) {
      console.error('Ошибка при создании формы заказа:', error);
      alert('Не удалось открыть форму оформления заказа.');
      this.modal.close();
    }
  }

  // === ОФОРМЛЕНИЕ ЗАКАЗА ===
  private handleOrderSubmit(formData: IOrderFormStep1Data): void {
  const items = this.basketModel.getItems();
  const total = this.basketModel.getTotalPrice();

  if (items.length === 0) {
    alert('Корзина пуста!');
    return;
  }

  // Логирование для отладки
  console.log('formData:', formData);
  console.log('this.paymentMethod:', this.paymentMethod);
  console.log('formData.paymentMethod:', formData.paymentMethod);

  // Валидация обязательных полей
  if (!formData.address || formData.address.trim().length === 0) {
    alert('Пожалуйста, укажите адрес доставки');
    return;
  }

  // Проверка способа оплаты
  const paymentMethodToUse = this.paymentMethod || formData.paymentMethod;

  if (!paymentMethodToUse || (paymentMethodToUse !== 'card' && paymentMethodToUse !== 'cash')) {
    console.error('Способ оплаты не выбран или некорректен:', paymentMethodToUse);
    alert('Пожалуйста, выберите способ оплаты');
    return;
  }

  this.paymentMethod = paymentMethodToUse as TPayment;

   // Сохраняем данные первого шага
  this.tempOrderData = {
    payment: this.paymentMethod!,
    address: formData.address,
    total: total,
    items: items.map(item => ({
       id: item.id,
      quantity: 1
    }))
    
  };
console.log('Формируемые items для заказа:', items);
items.forEach(item => console.log('Тип id в items:', typeof item.id, 'Значение:', item.id));

  // Открываем форму контактов (второй шаг)
  this.showContactsForm();
}


private showContactsForm(): void {
  try {
    const contactsFormClone = cloneTemplate('#contacts');
    this.modal.setContent(contactsFormClone);

    if (!this.contactsForm) {
      this.contactsForm = new ContactsForm(contactsFormClone, this.createModalEventsAdapter());
    } else {
      this.contactsForm.setContainer(contactsFormClone);
    }

    // Инициализируем начальные значения (пустые строки)
    this.contactsForm.emailInput.value = '';
    this.contactsForm.phoneInput.value = '';

    this.contactsForm.initPaymentButton(this.handleContactSubmit.bind(this));

    // Подписываемся на событие валидации ТОЛЬКО один раз
    this.setupContactsFormValidation();


    this.modal.show();
  } catch (error) {
    console.error('Ошибка при открытии формы контактов:', error);
    alert('Не удалось загрузить форму контактов');
    this.modal.close();
  }
}

private setupContactsFormValidation(): void {
  // Отписываемся от ВСЕХ обработчиков данного события
  this.events.off(AppEvent.FormValidation);

  // Подписываемся заново
  this.events.on(AppEvent.FormValidation, (data: unknown) => {
    const isValid = data as boolean;
    if (this.contactsForm) {
      this.contactsForm.submitDisabled = !isValid;
      console.log('Синхронизация кнопки "Оплатить":', isValid ? 'активна' : 'неактивна');
    }
  });
}





private handleContactSubmit(): void {
  // Получаем данные из формы контактов
  const contactData = this.contactsForm?.getData();
  if (!contactData) {
    alert('Не удалось получить данные формы контактов');
    return;
  }

  // Проверяем, что все обязательные поля присутствуют (убираем дублирование)
  if (!this.tempOrderData.payment || !this.tempOrderData.address || !this.tempOrderData.total || !this.tempOrderData.items) {
    alert('Недостаточно данных для оформления заказа.');
    return;
  }
  const orderItems: IOrderItem[] = this.tempOrderData.items.map(item => ({
    id: String(item.id), // приводим id к строке
    quantity: item.quantity ?? 1 // используем quantity из tempOrderData или 1 по умолчанию
  }));

  // Объединяем данные двух шагов
  const orderRequest: IOrderRequest = {
    payment: this.tempOrderData.payment!,
    address: this.tempOrderData.address!,
    total: this.tempOrderData.total!,
    items: orderItems,
    email: contactData.email,
    phone: contactData.phone
  };
//Логирование для отладки
  console.group('Отправка заказа на сервер');
  console.log('Контактные данные:', contactData);
  console.log('tempOrderData перед отправкой:', this.tempOrderData);
  console.log('Массив IOrderItem:', orderItems);
  console.log('Итоговый orderRequest:', orderRequest);
  console.groupEnd();

  // Отправляем заказ на сервер через API
  this.serverApi.order(orderRequest)
    .then((response: IOrderResponse) => {
      console.log('Заказ успешно отправлен:', response);
      this.showSuccessScreen(response.total);
    })
    .catch((error: Error) => {
      console.error('Ошибка при отправке заказа:', error);
      alert('Ошибка при отправке заказа: ' + error.message);
    });
}




  // === ЭКРАН УСПЕХА ===
  private showSuccessScreen(total: number): void {
  try {
    const successClone = cloneTemplate('#success');
    this.modal.setContent(successClone);

    if (!this.successView) {
      this.successView = new SuccessView(successClone, this.events);
    }

    this.successView.total = total; // Передаём сумму для отображения
    this.successView.render();

    this.modal.show();
  } catch (error) {
    console.error('Ошибка при показе экрана успеха:', error);
    alert('Заказ оформлен, но не удалось показать экран подтверждения.');
    this.modal.close();
  }
}


  // === АДАПТЕР ДЛЯ МОДАЛЬНЫХ СОБЫТИЙ ===
  private createModalEventsAdapter(): IModalEvents {
    return {
      emit: this.events.emit.bind(this.events),
      on: this.events.on.bind(this.events),
      off: this.events.off.bind(this.events),
      'form:submit': (data: IOrderFormStep1Data) => {
        this.events.emit('form:submit', data);
      },
      'input:change': (field: keyof IOrderFormStep1Data, value: string) => {
         this.events.emit('input:change', { field, value });
      },
      close: () => {
        this.modal.close();
      },
      'contact:submit': (data: { email: string; phone: string }) => {
  this.events.emit(AppEvent.ContactSubmit, data);
 },
    'form:validation': (isValid: boolean) => {
      this.events.emit(AppEvent.FormValidation, isValid); 
    }
  };
  }

}
// === ЗАПУСК ПРИЛОЖЕНИЯ ===
document.addEventListener("DOMContentLoaded", () => {
  const events = new EventEmitter();
  const presenter = new CatalogPresenter(events);
  presenter.init();
});