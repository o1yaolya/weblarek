import type {IBuyer, TPayment, ValidationResult} from '../../types';
import { EventEmitter } from '../base/Events';

export class Buyer {

//хранит данные:
  private payment:TPayment ='';
  private address: string = '';
  private phone: string = '';
  private email: string = '';
  private events: EventEmitter;


  constructor(events: EventEmitter) {
        this.events = events;
    }

  private emitChange(): void {
  const data = this.getData();
  const errors = this.validate();
  this.events.emit('buyer:changed', { data, errors });
}

  // Сеттеры для отдельных полей
  setPayment(payment: TPayment): void {
    this.payment = payment;
    this.emitChange();
  }

  setAddress(address: string): void {
    this.address = address;
    this.emitChange();
  }

  setEmail(email: string): void {
    this.email = email;
    this.emitChange();
  }

  setPhone(phone: string): void {
    this.phone = phone;
    this.emitChange();
  }
  
  // Общий метод обновления (частичное обновление)
  updateData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) this.payment = data.payment;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.address !== undefined) this.address = data.address;
    this.emitChange(); // Важно: вызываем emitChange после обновления данных
  }
  
  // Получение всех данных покупателя
  getData(): IBuyer {
    return {
      payment: this.payment,
      email: this.email,
      phone: this.phone,
      address: this.address
    };
  }

  // Очистка данных покупателя
  clearData(): void {
    this.payment = '';        // не выбрано 
    this.email = '';          // пустая строка
    this.phone = '';          // пустая строка
    this.address = '';        // пустая строка
  }

  // Валидация данных
  validate(): ValidationResult {
  const errors: ValidationResult = {};

    // Проверка payment
    if (!this.payment) errors.payment = 'Не выбран вид оплаты';

    // Проверка email
    if (!this.email) errors.email = 'Укажите email';
    
    // Проверка phone
    if (!this.phone) errors.phone = 'Укажите телефон';

    // Проверка address
    if (!this.address) errors.address = 'Укажите адрес доставки';

return errors;
  }
}
