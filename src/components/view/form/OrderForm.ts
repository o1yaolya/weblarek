import { BaseForm } from "./BaseForm";
import { ensureAllElements, ensureElement } from "../../../utils/utils";


export interface IOrderFormStep1 {
  onPaymentChange: (payment: string) => void;
  onAddressChange: (address: string) => void;
  Submit: () => void;
}


export class OrderForm extends BaseForm<IOrderFormStep1> {
  protected paymentButton: HTMLButtonElement[];
  protected addressInput: HTMLInputElement;
  protected submitButton: HTMLButtonElement;
  protected errorsElement: HTMLElement;

  constructor(container: HTMLFormElement, actions?: IOrderFormStep1) {
    super(container, actions);
 

    this.paymentButton = ensureAllElements<HTMLButtonElement>(
      '.button_alt',
      container
    );

    this.addressInput = ensureElement<HTMLInputElement>(
      'input[name="address"]', 
      container);

    this.submitButton = ensureElement<HTMLButtonElement>(
      'button[type="submit"]',
       container);

    this.errorsElement = ensureElement('.form__errors', 
      container); 

    this.paymentButton.forEach(button => {
  button.addEventListener('click', () => {
    // Снимаем активный класс со всех кнопок
    this.paymentButton.forEach(btn => btn.classList.remove('button_alt-active'));
    
    // Добавляем активный класс текущей кнопке
    button.classList.add('button_alt-active');
    
    const paymentChange = button.getAttribute('name') || 'card';
    if (actions?.onPaymentChange) {
      actions.onPaymentChange(paymentChange);
    }
    this.checkFormValidity();
  });
});


    this.addressInput.addEventListener('input', () => {
            if (actions?.onAddressChange) {
                actions.onAddressChange(this.addressInput.value);
            }
              this.checkFormValidity(); // Проверяем валидность после ввода адреса
    });
        // Блокируем кнопку «Далее» при загрузке
    this.setSubmitDisabled(true);
    }
 // Метод проверки валидности формы
  private checkFormValidity(): void {
  const addressValid = this.addressInput.value.trim().length > 0;
  const paymentValid = this.paymentButton.some(btn => btn.classList.contains('button_alt-active'));

  // Формируем текст ошибок
  let errorMessage = '';
  if (!paymentValid) {
    errorMessage += 'Выберите способ оплаты ';
  }
  if (!addressValid) {
    errorMessage += 'Необходимо указать адрес ';
  }

  // Обновляем текст и видимость ошибок
  this.errorsElement.textContent = errorMessage;
  this.errorsElement.style.display = errorMessage.length > 0 ? 'block' : 'none';

  // Активируем/деактивируем кнопку «Далее»
  this.setSubmitDisabled(!(addressValid && paymentValid));
}

  // Устанавливает активный способ оплаты
  setPayment(payment: string): void {
    this.paymentButton.forEach(btn => {
      btn.classList.toggle('button_alt-active', btn.getAttribute('name') === payment);
    });
    this.checkFormValidity();
  }

      set address(value: string) {
        this.addressInput.value = value;
      }

      set payment (value: string) {
        this.setPayment(value);
      }

      
   // блокирует/разблокирует кнопку отправки
   
      setSubmitDisabled(value: boolean) {
        this.submitButton.disabled = value;
      }

       render(): HTMLElement {
        return this.container;
    }

  }
