import type {IBuyer, TPayment, ValidationResult} from '../../types';

export class Buyer {

//хранит данные:
  private payment:TPayment ='';
  private address: string = '';
  private phone: string = '';
  private email: string = '';


  // Сеттеры для отдельных полей
  setPayment(payment: TPayment): void {
    this.payment = payment;
  }

  setAddress(address: string): void {
    this.address = address;
  }

  setEmail(email: string): void {
    this.email = email;
  }

  setPhone(phone: string): void {
    this.phone = phone;
  }
  
  // Общий метод обновления (частичное обновление)
  updateData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) this.payment = data.payment;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.address !== undefined) this.address = data.address;
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
