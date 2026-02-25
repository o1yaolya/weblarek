import { BaseForm } from './BaseForm';
import { ensureElement } from '../../../utils/utils';

export interface IOrderFormStep2 {
  onEmailChange: (payment: string) => void;
  onPhoneChange: (address: string) => void;
  Submit: () => void;
}

export class ContactsForm extends BaseForm<IOrderFormStep2> {
  protected emailInput: HTMLInputElement;
  protected phoneInput: HTMLInputElement;
  protected payButton: HTMLButtonElement;
  protected errorsElement: HTMLElement;

  constructor(container: HTMLFormElement, actions?:IOrderFormStep2) {
    super(container, actions);

    // Инициализация полей
    this.emailInput = ensureElement<HTMLInputElement>(
      'input[name="email"]', 
      container);

    this.phoneInput = ensureElement<HTMLInputElement>(
      'input[name="phone"]',
       container);

    this.payButton = ensureElement<HTMLButtonElement>(
      'button[type="submit"]', 
      container);

        this.errorsElement = ensureElement(
      '.form__errors',
      container);




    this.emailInput.addEventListener('input', () => {
            if (actions?.onEmailChange) {
                actions.onEmailChange(this.emailInput.value);
            }
              this.checkFormValidity(); // Проверяем валидность после ввода почты 
    });

     this.phoneInput.addEventListener('input', () => {
            if (actions?.onPhoneChange) {
                actions.onPhoneChange(this.phoneInput.value);
            }
            this.checkFormValidity(); // Проверяем валидность после ввода
        });
        // Блокируем кнопку «Далее» при загрузке
    this.setSubmitDisabled(true);
    }
 // Метод проверки валидности формы
  private checkFormValidity(): void {
  const emailValid = this.emailInput.value.trim().length > 0;
  const phoneValid = this.phoneInput.value.trim().length > 0;


  // Формируем текст ошибок
  let errorMessage = '';
  if (!emailValid) {
    errorMessage += 'Укажите почту ';
  }
  if (!phoneValid) {
    errorMessage += 'Укажите телефон ';
  }

  // Обновляем текст и видимость ошибок
  this.errorsElement.textContent = errorMessage;
  this.errorsElement.style.display = errorMessage.length > 0 ? 'block' : 'none';

  // Активируем/деактивируем кнопку «Оплатить»
  this.setSubmitDisabled(!(emailValid && phoneValid));
}


      set email(value: string) {
        this.emailInput.value = value;
      }

      set phone (value: string) {
        this.phoneInput.value = value;
      }

      
   // блокирует/разблокирует кнопку отправки
   
      setSubmitDisabled(value: boolean) {
        this.submitButton.disabled = value;
      }

       render(): HTMLElement {
        return this.container;
    }
}
