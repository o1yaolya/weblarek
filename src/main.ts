import "./scss/styles.scss";

import { Product } from "./components/models/product";
import { Basket } from "./components/models/basket";
import { Buyer } from "./components/models/buyer";
import { apiProducts } from "./utils/data";
import { Api } from "./components/base/Api";
import { API_URL } from "./utils/constants";
import { ServerApi } from "./components/base/ServerApi";

///////////ТЕСТ////////////

///////////Product
const productsModel = new Product();
productsModel.setItems(apiProducts.items);
console.log("Массив товаров из каталога:", productsModel.getItems());

// Получение одного товара по его id
const productModelId = productsModel.getItemsById(apiProducts.items[0].id);
console.log("товар по id", productModelId);

//Cохранение товара для подробного отображения
productsModel.setSelectedItems(apiProducts.items[0]);
console.log("Сохраненный товар:", productsModel.getSelectedItems());

///////////Basket
const basketModel = new Basket();

//добавили в корзину товары
basketModel.addItem(apiProducts.items[0]);
basketModel.addItem(apiProducts.items[1]);
basketModel.addItem(apiProducts.items[2]);
basketModel.addItem(apiProducts.items[3]);

// удалили из корзины товары
basketModel.deleteItem(apiProducts.items[1]);

// Получение стоимости всех товаров в корзине
basketModel.getTotalPrice();

// Получение количества товаров в корзине
basketModel.getItemCount();

// Проверка наличия товара в корзине по его id, полученного в параметр метода
basketModel.hasItem(apiProducts.items[0].id);

//  Очистка корзины
basketModel.clear();

console.log("Стоимость Итого:", basketModel.getTotalPrice());
console.log("Количество:", basketModel.getItemCount());
console.log("Id [0]", basketModel.hasItem(apiProducts.items[0].id));

console.log("Массив товаров в корзине:", basketModel.getItems());

///////////Buyer

const buyerModel = new Buyer();

buyerModel.updateData({
  payment: "cash",
  email: "",
  phone: "+7 999 999-99-99",
  address: "дом",
});

// Выводим обновлённые поля
const updatedFields = Object.keys({
  payment: "cash",
  email: "",
  phone: "+7 999 999-99-99",
  address: "дом",
});
console.log("Обновлены поля:", updatedFields);

// Проверяем текущее состояние
console.log("Текущие данные:", buyerModel.getData());

// Валидация данных
const result = buyerModel.validate();

if (Object.keys(result).length > 0) {
  console.log("Ошибки валидации:");

  if (result.payment) console.log("payment:", result.payment);
  if (result.email) console.log("email:", result.email);
  if (result.phone) console.log("phone:", result.phone);
  if (result.address) console.log("address:", result.address);
} else {
  console.log("Все поля валидны!");
}

// Очистка данных покупателя
buyerModel.clearData();
console.log("Данные покупателя после очистки:", buyerModel.getData());

//////API

// 1. Создаём экземпляр API-клиента
const api = new Api(API_URL);
const serverApi = new ServerApi(api);

// 2. Создаём модель для хранения каталога товаров
const catalog = new Product();

// 3. Получение товаров и cохранение массива в модели данных
async function initCatalog() {
  try {
    const products = await serverApi.getProducts(); // Получение списка товаров
    catalog.setItems(products); // Передаём готовый массив
    console.log("Список товаров:", products);

    // Вывод списка товаров
    catalog.getItems().forEach((product, index) => {
      console.log(
        `${index + 1}. ${product.title} ` +
          `(ID: ${product.id}, цена: ${product.price ?? "нет цены"} руб.)`
      );
    });
  } catch (error) {
    console.error('Ошибка при получении списка товаров:', error);
  }
}

initCatalog();