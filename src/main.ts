import { Product } from "./components/models/product";
import { GalleryView } from "./components/view/GalleryView";
import { EventEmitter, IEvents, AppEvent } from "./components/base/Events";
import { Card } from "./components/view/card/card";
import { ServerApi } from "./components/base/ServerApi";
import { Api } from "./components/base/Api";
import { API_URL } from "./utils/constants";
import { IOrderFormStep1Data, IOrderFormStep2Data, IProduct } from "./types/index";
import { cloneTemplate } from "./utils/utils";
import "./scss/styles.scss";

import { CardData } from "./components/view/card/card";
import { SimpleCard } from "./components/view/card/simpleCard";
import { DetailedCard } from "./components/view/card/detailedCard";
import { Modal } from "./components/view/ModalView";
import { Basket } from "./components/models/basket";
import { Buyer } from "./components/models/buyer";
import { Header } from "./components/view/HeaderView";
import { CDN_URL } from "./utils/constants";
import { categoryMap } from "./utils/constants";
import { BasketView } from "./components/view/BasketView";
import { BasketCard } from "./components/view/card/basketCard";
import { OrderForm } from "./components/view/form/OrderForm";
import { OrderFormStep2 } from "./components/view/form/OrderForm2";
import { IOrderRequest } from "./types/index";
import { IOrderResponse } from "./types/index";
import { IOrderItem } from "./types/index";
import { TPayment } from "./types/index";
interface CardClickPayload { id: string; }
interface AddToBasketPayload { id: string; }
interface CardPriceChangePayload { card: Card; priceNum: number | null; }
interface CardDataUpdatePayload { data: CardData; }
/*interface BasketUpdatePayload {
  itemsCount: number;
  totalPrice: number;
  items: Array<{ id: string; title: string; price: number }>;
}*/

export interface IModalEvents extends IEvents {
  'form:step1:submit': (data: IOrderFormStep1Data) => void;
  'form:step2:submit': (ddata: IOrderFormStep2Data) => void;
   'input': () => void;
  close: () => void;
}
export class CatalogPresenter {
  private productsModel: Product;
  private basketModel: Basket;
  private buyerModel: Buyer;
  private gallery: GalleryView;
  private modal: Modal;
  private header: Header;
  private basketView: BasketView;
  private events: IEvents;
  private serverApi: ServerApi;
  private orderModal: OrderForm | null = null;
  private orderForm2: OrderFormStep2 | null = null; 
  private paymentMethod: TPayment | null = null; // Вместо string


  constructor(events: IEvents) {
    this.events = events;
    this.productsModel = new Product(events);
    this.basketModel = new Basket();
    this.buyerModel = new Buyer();
    this.basketModel.loadFromStorage();


    // Инициализация представлений
    const galleryElement = document.querySelector(".gallery");
    if (!galleryElement) throw new Error("Gallery container not found");
    this.gallery = new GalleryView(galleryElement as HTMLElement, events);

    const modalElement = document.querySelector("#modal-container");
    if (!modalElement) throw new Error("Modal container not found");
    this.modal = new Modal(
  modalElement as HTMLElement,
  this.createModalEventsAdapter() // Используем адаптер
);

    const headerElement = document.querySelector(".header");
    if (!headerElement) throw new Error("Header container not found");
    this.header = new Header(headerElement as HTMLElement, events);


    // Корзина
    const basketClone = cloneTemplate("#basket");
    if (!basketClone) throw new Error("Не удалось клонировать шаблон корзины");
    document.body.appendChild(basketClone);
    if (!(basketClone instanceof HTMLElement)) throw new Error("basketClone не является HTMLElement");
    this.basketView = new BasketView(
      basketClone,
      events,
      this.basketModel,
      ".basket__list",
      ".basket__price"
    );

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
    } catch (err) {
      console.error("Ошибка загрузки каталога:", err);
      alert("Не удалось загрузить каталог товаров. Проверьте подключение к серверу.");
    }
  }

  private showProductDetail(productId: string): void {
    if (!productId) {
      console.error("productId не передан в showProductDetail");
      return;
    }
    const product = this.productsModel.getItemsById(productId);
    if (!product) {
      console.warn(`Продукт с ID ${productId} не найден`);
      return;
    }

    const detailedCardElement = cloneTemplate("#card-preview");
    if (!detailedCardElement) {
      console.error("Шаблон #card-preview не найден в DOM");
      return;
    }
    detailedCardElement.classList.add("card_detailed");


    try {
      const detailedCard = new DetailedCard(detailedCardElement, this.events);
      detailedCard.render(product);
      const basketButton = detailedCardElement.querySelector(".card__button");
      if (basketButton) {
        basketButton.addEventListener("click", (e) => {
          e.stopPropagation();
          this.events.emit(AppEvent.CardAddToBasket, { id: productId });
        });
      }
      this.modal.setContent(detailedCardElement);
      this.modal.show();
    } catch (error) {
      console.error("Ошибка при отображении детальной карточки:", error);
    }
  }

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
      // Явно преобразуем id в строку
  const normalizedProduct: IProduct = {
    ...product,
    id: String(product.id).trim()  // Гарантируем строку
  };
    this.basketModel.addItem(normalizedProduct);
  console.log(`Товар "${normalizedProduct.title}" добавлен в корзину`);



    this.emitBasketUpdate();
    this.updateHeaderCounter();
    this.basketModel.saveToStorage();
  }

  private removeFromBasket(productId: string): void {
    this.basketModel.deleteItem(productId);
    console.log(`Товар с ID ${productId} удалён из корзины`);
    this.emitBasketUpdate();
    this.updateHeaderCounter();
    this.basketModel.saveToStorage();
  }

  private emitBasketUpdate(): void {
    this.events.emit(AppEvent.BasketUpdate, {
      itemsCount: this.basketModel.getItemCount(),
      totalPrice: this.basketModel.getTotalPrice(),
      items: this.basketModel.getItems().map(item => ({
        id: item.id,
        title: item.title,
        price: item.price
      }))
    });
  }

  private subscribeToEvents(): void {
    this.events.on(AppEvent.CatalogChange, this.renderCatalog.bind(this));

    this.events.on(AppEvent.CardClick, (payload: CardClickPayload) => {
      if (!payload?.id) {
        console.error("CardClick: payload.id не передан", payload);
        return;
      }
      this.showProductDetail(payload.id);
    });

    this.events.on(AppEvent.CardAddToBasket, (payload: AddToBasketPayload) => {
      this.addToBasket(payload.id);
    });



    this.events.on(AppEvent.CardPriceChange, (payload: CardPriceChangePayload) => {
      const button = payload.card.getCardContainer().querySelector(".card__button") as HTMLButtonElement;
      if (payload.priceNum !== null && payload.priceNum >= 0) {
        button.disabled = false;
        button.textContent = "В корзину";
      } else {
        button.disabled = true;
        button.textContent = "Недоступно";
      }
    });

    this.events.on(AppEvent.CardDataUpdate, (payload: CardDataUpdatePayload) => {
      console.log("Карточка обновлена:", payload.data);
    });

       this.events.on(AppEvent.BasketOrder, () => {
      console.log('Корзина открыта!');
      this.modal.setContent(this.basketView.element);
      this.modal.show();
    });

    this.events.on(AppEvent.BasketUpdate, () => {
      this.updateHeaderCounter();
    });

    this.events.on(AppEvent.BasketItemDelete, (payload: { id: string }) => {
      this.removeFromBasket(payload.id);
    });

    this.events.on(AppEvent.ShowCheckoutForm, () => {
  const items = this.basketModel.getItems();
  const total = this.basketModel.getTotalPrice();

  if (items.length === 0) {
    alert('Корзина пуста!');
    return;
  }

  try {
    const formTemplate = document.querySelector('#order') as HTMLTemplateElement;
    if (!formTemplate) throw new Error('Шаблон #order не найден');

    const formClone = formTemplate.content.firstElementChild as HTMLElement;
    if (!formClone) throw new Error('Шаблон пуст');
 
    this.modal.setContent(formClone);

  // 1. Формируем itemsForOrderForm (только id и quantity)
    const itemsForOrderForm = items.map(item => ({
      id: item.id,
      quantity: 1
    }));

    // 2. Формируем productData для отображения title/price в OrderForm
    const productData = items.reduce((acc, item) => {
      acc[item.id] = {
        title: item.title,
        price: item.price ?? 0
      };
      return acc;
    }, {} as { [id: string]: { title: string; price: number } });

    if (!this.orderModal) {
      const modalEvents = this.createModalEventsAdapter();
      this.orderModal = new OrderForm(
        formClone,
        modalEvents,
        itemsForOrderForm,
        total,
        productData  // ← Передаём productData!
      );
    } else {
      this.orderModal.updateData(itemsForOrderForm, total);
      this.orderModal.render();
    }

    this.orderModal.validate();
    this.modal.show();
    console.log('Форма заказа успешно открыта');

  } catch (error) {
    console.error('Ошибка при создании формы заказа:', error);
    alert('Не удалось открыть форму оформления заказа. Попробуйте снова.');
    this.modal.close();
  }
});
//ДОБАВЛЯЕМ ОБРАБОТЧИК OrderSuccess
this.events.on(AppEvent.OrderSuccess, (data: IOrderFormStep1Data) => {
  console.log("Получены данные из формы заказа (шаг 1):", data);

  // 1. Закрываем текущую модалку (форма шага 1)
  this.modal.close();

  // 2. Открываем форму контактов (шаг 2)
  try {
    // Ищем шаблон в DOM
    const contactsTemplate = document.querySelector("#contacts") as HTMLTemplateElement;
    if (!contactsTemplate) {
      throw new Error("Шаблон #contacts не найден в DOM");
    }

    // Клонируем содержимое шаблона
    const fragment = contactsTemplate.content.cloneNode(true) as DocumentFragment;
    
    // Получаем корневой элемент формы
    const formClone = fragment.firstElementChild as HTMLElement | null;
    if (!formClone) {
      throw new Error("Шаблон #contacts пуст — нет корневого элемента");
    }

    // Устанавливаем содержимое модалки
    this.modal.setContent(formClone);
    this.modal.show();
    console.log("Форма контактов (шаг 2) открыта");

    // 3. Создаём экземпляр формы шага 2
    const modalEvents = this.createModalEventsAdapter();
    this.orderForm2 = new OrderFormStep2(formClone, modalEvents); // Сохраняем в поле класса!
// Инициализируем кнопку "Оплатить" ПОСЛЕ создания формы
    this.initPaymentButton();
  } catch (error) {
    console.error("Ошибка при открытии формы контактов (шаг 2):", error);
    alert("Не удалось открыть форму контактов. Попробуйте снова.");
  }
});
  }
  
private createModalEventsAdapter(): IModalEvents {
  return {
    // Базовые методы — наследуем от IEvents
    emit: this.events.emit.bind(this.events),
    on: this.events.on.bind(this.events),
    off: this.events.off.bind(this.events),

    // Специфические обработчики для IModalEvents
    'form:step1:submit': (data: IOrderFormStep1Data): void => {
      this.events.emit(AppEvent.OrderSuccess, data);
    },
    'form:step2:submit': (data: IOrderFormStep2Data): void => {
      this.events.emit(AppEvent.OrderComplete, data);
    },
    close: (): void => {
      this.events.emit('close');
    },
     // Добавляем обязательное поле 'input'
    'input': (): void => {
      // Можно оставить пустым, если не нужно дополнительной логики
      // Или транслировать событие дальше, если требуется
      this.events.emit('input');
    }
  };
}


  private renderCatalog(): void {
    if (document.readyState !== "complete") {
      console.warn("DOM not ready. Waiting for load...");
      window.addEventListener("load", this.renderCatalog.bind(this));
      return;
    }

    this.gallery.getContainer().innerHTML = "";

    const items = this.productsModel.getItems()
      .map((item) => {
        if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
          console.error('Товар без валидного ID:', item);
          return null;
        }

        const cardElement = cloneTemplate("#card-catalog");
        cardElement.dataset.productId = item.id;

        const card = new Card(cardElement, this.events);
        card.render({
          title: item.title,
          price: item.price,
          imageSrc: item.image,
          category: item.category,
          button: {
            text: "Подробнее",
            url: `#product/${item.id}`
          }
        });

        const container = card.getCardContainer();

        container.addEventListener("click", (e) => {
          e.stopPropagation();
          const productId = container.dataset.productId;
          if (!productId) {
            console.error("ID не найден в dataset при клике:", container);
            return;
          }
          this.events.emit(AppEvent.CardClick, { id: productId });
        });

        const button = container.querySelector(".card__button");
        if (button) {
          button.addEventListener("click", (e) => {
            e.stopPropagation();
            this.events.emit(AppEvent.CardAddToBasket, { id: item.id });
          });
        }

        return container;
      })
      .filter(item => item !== null);


    items.forEach(item => this.gallery.getContainer().appendChild(item));
    this.gallery.items = items;
    console.log("Каталог отрендерен.");
  }

  private updateHeaderCounter(): void {
    const count = this.basketModel.getItemCount();
    this.header.counter = count;
    console.log(`Счётчик корзины обновлён: ${count} товаров`);
  }
  private updatePayButtonState(button: HTMLButtonElement): void {
  const isBasketEmpty = this.basketModel.getItemCount() === 0;
  const isFormValid = this.orderForm2 ? this.orderForm2.isValid() : false;

  if (isBasketEmpty) {
    button.disabled = true;
    button.textContent = 'Корзина пуста';
  } else if (!isFormValid) {
    button.disabled = true;
    button.textContent = 'Заполните email и телефон';
  } else {
    button.disabled = false;
    button.textContent = 'Оплатить';
  }
}


private initPaymentButton(): void {
  const payButton = document.querySelector('.modal__actions .button') as HTMLButtonElement;
  if (!payButton) return;

  payButton.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!this.orderForm2 || !this.orderForm2.isValid()) {
      alert("Заполните контактные данные!");
      return;
    }

    const customerData = this.orderForm2.getData();
    const orderModalData = this.orderModal?.getData();

    if (!orderModalData?.address || orderModalData.address.trim() === '') {
      alert("Укажите адрес доставки");
      return;
    }

    const paymentMethod = this.orderModal?.paymentMethod;
    if (!paymentMethod) {
      alert("Выберите способ оплаты!");
      return;
    }

    // Формируем items как массив IOrderItem[]
    const orderItems: IOrderItem[] = this.basketModel.getItems().map(item => ({
      id: typeof item.id === 'string'
        ? item.id.trim()
        : String(item.id).trim(),
      quantity: 1  // или взять из корзины, если там есть поле quantity
    }));

    const total = this.basketModel.getTotalPrice();

    const orderRequest: IOrderRequest = {
      payment: paymentMethod as TPayment,
      email: customerData.email,
      phone: customerData.phone,
      address: orderModalData.address,
      total: total,
     items: orderItems 
    };
console.log('Тип items:', Array.isArray(orderRequest.items) ? 'array' : typeof orderRequest.items);
console.log('Первый элемент:', orderRequest.items[0]);

    console.log("Отправляем orderRequest:", orderRequest);

    try {
      const response = await fetch(`${API_URL}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Ошибка сервера:", errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.message}`);
      }

      alert("Заказ оформлен!");
      this.basketModel.clear();
      this.emitBasketUpdate();
      this.updateHeaderCounter();
      this.modal.close();
      this.orderForm2?.resetForm();
    } catch (error) {
      console.error("Ошибка при отправке заказа:", error);
      alert("Не удалось оформить заказ. Попробуйте снова.");
    }
  });
}
}

// --- ЗАПУСК ---
document.addEventListener("DOMContentLoaded", () => {
  const events = new EventEmitter();
  const presenter = new CatalogPresenter(events);
  presenter.init();

});