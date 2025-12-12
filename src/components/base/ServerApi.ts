import {IApi, IProduct, IOrderRequest, IOrderResponse, GetProductsResponse} from '../../types';

export class ServerApi {
    private api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }
  
  async getProducts(): Promise<IProduct[]> {
  try {
    const response = await this.api.get<GetProductsResponse>('/product/');
    return response.items; // Извлекаем массив товаров
  } catch (error) {
    throw new Error(`Ошибка при получении списка товаров`);
  }
}

  // Отправляет заказ на сервер
  async order(data: IOrderRequest): Promise<IOrderResponse> {
    try {
      const response = await this.api.post<IOrderResponse>('/order/', data);
      return response;
    } catch (error) {
      throw new Error(`Ошибка при отправке заказа`);
    }
  }
}
