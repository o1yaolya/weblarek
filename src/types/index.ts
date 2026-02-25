export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export type TPayment = 'card' | 'cash' | '';

export type ValidationResult = Partial<Record<keyof IBuyer, string>>;

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

//Интерфейс товара:
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
} 

//Интерфейс покупателя:
export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
} 

//Данные заказа для отправки на сервер
export interface IOrderRequest {
  payment: TPayment,
  email?: string,
  phone?: string;
  address: string;
  total: number;
  items: string[];
}

export interface IOrderItem {
  id: string;      // ID товара
  quantity?: number; // Количество
}

// Ответ API со списком товаров
export interface IProductResponse {
  items: IProduct[];  
  total: number;
}

// Ответ сервера после оформления заказа
export interface IOrderResponse {
    id: string;
    total: number;
}

export interface GetProductsResponse {
  title: string;
  items: IProduct[]; // именно здесь лежат товары
}

export interface IOrderData {
  payment: 'card' | 'cash';
  email: string;
  phone: string;
  address: string;
  items: string[];
  total: number;
}

