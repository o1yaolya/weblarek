import { Product } from "./components/models/product";
import { GalleryView } from "./components/view/GalleryView";
import { EventEmitter } from "./components/base/Events";
import { ServerApi } from "./components/base/ServerApi";
import { Api } from "./components/base/Api";
import { API_URL } from "./utils/constants";
import { IProduct } from "./types/index";
import { IOrderRequest } from "./types/index";
import { cloneTemplate } from "./utils/utils";
import "./scss/styles.scss";
import { DetailedCard } from "./components/view/card/detailedCard";
import { Modal } from "./components/view/ModalView";
import { Basket } from "./components/models/basket";
import { Header } from "./components/view/HeaderView";
import { BasketView } from "./components/view/BasketView";
import { OrderForm } from "./components/view/form/OrderForm";
import { Success } from "./components/view/SuccessView";
import { TPayment } from "./types/index";
import { CatalogCard } from "./components/view/card/catalogCard";
import { ensureElement } from "./utils/utils";
import { BasketCard } from "./components/view/card/basketCard";
import { ContactsForm } from "./components/view/form/ContactsForm";
import { Buyer } from "./components/models/buyer";

// Брокер событий
const events = new EventEmitter();


// Api

const api = new Api(API_URL);
const serverApi = new ServerApi(api);


// Модели

const productsModel = new Product(events);
const basketModel = new Basket(events);
const buyerModel = new Buyer(events);


basketModel.loadFromStorage();


// Представления VIEW

const basket = new BasketView(
  cloneTemplate('#basket'),
  {
    onCheckout: () => events.emit('basket:order')
  });

const gallery = new GalleryView(ensureElement('.gallery'));
const header = new Header(ensureElement('.header'), {
  onBasketClick: () => events.emit('basket:open')
});
const modal = new Modal(ensureElement(".modal"), events);

// Инициализируем формы один раз при старте приложения

const orderForm = new OrderForm(cloneTemplate<HTMLFormElement>('#order'),
  {
    onPaymentChange: (payment: string) => events.emit('order:payment', { payment }),
    onAddressChange: (address: string) => events.emit('order:address', { address }),
    Submit: () => events.emit('order:step2')
  }
);

const contactsForm = new ContactsForm(cloneTemplate('#contacts'),
  {
    onEmailChange: (email: string) => events.emit('contacts:email', { email }),
    onPhoneChange: (phone: string) => events.emit('contacts:phone', { phone }),
    Submit: () => events.emit('contacts:submit')
  }
);

// Инициализируем SuccessView один раз при старте приложения
const successView = new Success(cloneTemplate('#success'), {
  onClick: () => modal.close()
});

// === РЕНДЕРИНГ КАТАЛОГА ===


// загрузка товаров с сервера
serverApi.getProducts()
  .then(data => productsModel.setItems(data))
  .catch(err => console.error('Ошибка загрузки каталога:', err));


// каталог карточек - card
events.on('catalog:change', () => {
  const products = productsModel.getItems();
  const cardCatalog = products.map((item) => {
    // Проверяем, что шаблон найден
    const template = cloneTemplate('#card-catalog');
    if (!template) {
      throw new Error('Template #card-catalog not found');
    }

    const card = new CatalogCard(template, {
      onClick: () => {
        events.emit('card:select', item);
      }
    });

    // Заполняем данные карточки
    card.title = item.title;
    card.price = item.price;
    card.image = item.image;
    card.category = item.category;

    return card.render();
  });

  gallery.items = cardCatalog;
});


// превью карточки - detailedCard
events.on('card:select', (selectedProduct: IProduct) => {
  // Сохраняем выбранный товар в модели
  productsModel.setSelectedItem(selectedProduct);

  // Создаём экземпляр DetailedCard
  const detailedCard = new DetailedCard(
    cloneTemplate('#card-preview'),
    {
      onClick: () => {
        // Используем selectedProduct из внешней области видимости
        events.emit('basket:add', selectedProduct);
      }
    }
  );

  // Заполняем данными
  detailedCard.title = selectedProduct.title;
  detailedCard.price = selectedProduct.price;
  detailedCard.category = selectedProduct.category;
  detailedCard.image = selectedProduct.image;
  detailedCard.description = selectedProduct.description;

  // Обновляем состояние кнопки — исправляем имя переменной
  const isInBasket = basketModel.hasItem(selectedProduct.id);
  detailedCard.buttonText = isInBasket ? 'Удалить из корзины' : 'Купить';
  detailedCard.buttonDisabled = selectedProduct.price === null;

  // Открываем модальное окно с карточкой
  modal.content = detailedCard.render();
  modal.show();
});

// кнопка удалить/купить из карточки

events.on('basket:add', (product: IProduct) => {
  if (basketModel.hasItem(product.id)) {
    basketModel.deleteItem(product.id)
  } else {
    basketModel.addItem(product);
  }
  modal.close();
});



// === УПРАВЛЕНИЕ КОРЗИНОЙ ===

// обновление счётчика корзины
events.on('basket:changed', () => {
  const count = basketModel.getItems();

  header.counter = count.length;

  if (count.length === 0) {
    basket.total = 0;
    basket.items = [];
  } else {
    const cards = count.map((item, index) => {
      const card = new BasketCard(
        cloneTemplate('#card-basket'),
        { onClick: () => events.emit('basket:remove', item) }
      );
      card.title = item.title;
      card.price = item.price;
      card.index = index + 1;
      return card.render();
    });
    basket.items = cards;
    basket.total = basketModel.getTotalPrice();
  }

  console.log(`Обновлён счётчик корзины: ${count.length} товаров`);
});


// Открытие корзины
events.on("basket:open", () => {
  // Проверяем, что корзина инициализирована
  if (!basket) {
    console.error('BasketView не инициализирован');
    return;
  }
  modal.content = basket.render();
  // Просто открываем корзину — содержимое уже обновлено через basket:changed
  modal.show();
});

// нажатие на значок корзины в корзине - удалить товар
events.on('basket:remove', (product: IProduct) => {
  console.log('[Event] Обработчик basket:remove вызван для ID:', product.id);

  if (!product?.id) {
    console.error('[basket:remove] Некорректные данные товара:', product);
    return;
  }

  if (basketModel.hasItem(product.id)) {
    basketModel.deleteItem(product.id);
    console.log('[basket:remove] Товар удалён, эмитим basket:changed');
    events.emit('basket:changed');
  } else {
    console.warn('[basket:remove] Попытка удалить отсутствующий товар:', product.id);
  }
});


// нажатие кнопки "оформить" 1 шаг -  способ оплаты и адрес
events.on('basket:order', () => {
  modal.content = orderForm.render();
  modal.show();
});


// Переход ко второй форме - контакты - почта и телефон
events.on('order:step2', () => {
  modal.content = contactsForm.render();
  modal.show();
});


// При изменении покупателя - вызываем валидацию 
events.on('buyer:changed', () => {
  const errors = buyerModel.validate();

  const orderErrors = {
    payment: errors.payment,
    address: errors.address
  };
  const orderHasErrors = !!(orderErrors.payment || orderErrors.address);
  orderForm.setValidationErrors(orderErrors);
  // Кнопка отключена, если есть ошибки
  orderForm.setSubmitDisbled(orderHasErrors);

  const contactsErrors = {
    email: errors.email,
    phone: errors.phone
  };
  const contactsHasErrors = !!(contactsErrors.email || contactsErrors.phone);
  contactsForm.setErrors(contactsErrors);
  // Кнопка отключена, если есть ошибки
  contactsForm.setSubmitDisabled(contactsHasErrors);
});

// Переход к отправке заказа на сервер
events.on('contacts:submit', () => {
  const buyerData = buyerModel.getData();
  const basketItems = basketModel.getItems();


  // Валидация через модель Buyer
  const validationErrors = buyerModel.validate();
  if (Object.keys(validationErrors).length > 0) {
    console.warn('Ошибки валидации:', validationErrors);
    alert('Пожалуйста, заполните все обязательные поля: ' +
      Object.values(validationErrors).join(', '));
    return;
  }

  if (basketItems.length === 0) {
    alert('Корзина пуста. Добавьте товары перед оформлением заказа');
    return;
  }

  const orderData: IOrderRequest = {
    payment: buyerData.payment!,
    address: buyerData.address,
    email: buyerData.email,
    phone: buyerData.phone,
    items: basketModel.getItems().map(item => item.id),
    total: basketModel.getTotalPrice(),

  };

  console.log('Отправляем orderData:', JSON.stringify(orderData, null, 2));
  console.log('Типы полей:');
  console.log('payment:', typeof orderData.payment);
  console.log('address:', typeof orderData.address);
  console.log('email:', typeof orderData.email);
  console.log('phone:', typeof orderData.phone);
  console.log('total:', typeof orderData.total);
  console.log('items:', Array.isArray(orderData.items) ? 'массив' : 'не массив');

  serverApi.order(orderData)
    .then(response => {
      console.log('Заказ создан:', response);
      successView.total = response.total;
      modal.content = successView.render();
      basketModel.clear();

    })
    .catch((error) => {
      console.error('Полный ответ сервера:', error.response?.data);
      console.error('Статус ошибки:', error.response?.status);
      alert('Ошибка сервера: ' + (error.response?.data?.message || 'Неизвестная ошибка'));
    });

});


// Подписка на события форм для сохранения данных в модель Buyer
events.on('order:payment', (data: { payment: TPayment }) => {
  buyerModel.setPayment(data.payment);
  orderForm.payment = data.payment;
  console.log('Payment сохранён:', data.payment);
});

events.on('order:address', (data: { address: string }) => {
  buyerModel.setAddress(data.address);
   orderForm.address = data.address;
  console.log('Address сохранён:', data.address);
});

events.on('contacts:email', (data: { email: string }) => {
  buyerModel.setEmail(data.email);
  console.log('Email сохранён:', data.email);
});

events.on('contacts:phone', (data: { phone: string }) => {
  buyerModel.setPhone(data.phone);
  console.log('Phone сохранён:', data.phone);
});



