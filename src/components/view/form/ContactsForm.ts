import { BaseForm } from './BaseForm';
import { ensureElement } from '../../../utils/utils';

export interface IOrderFormStep2 {
  onEmailChange: (email: string) => void;
  onPhoneChange: (phone: string) => void;
  Submit: () => void;
}

export class ContactsForm extends BaseForm<IOrderFormStep2> {
  protected emailInput: HTMLInputElement;
  protected phoneInput: HTMLInputElement;

  constructor(container: HTMLFormElement, actions?:IOrderFormStep2) {
    super(container, actions);

    // Инициализация полей
    this.emailInput = ensureElement<HTMLInputElement>(
      'input[name="email"]', 
      container);

    this.phoneInput = ensureElement<HTMLInputElement>(
      'input[name="phone"]',
       container);

       // Инициализация элементов для ошибок и кнопки отправки
    this.errorsElement = ensureElement('.form__errors',  
      container);  

     this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);

    this.emailInput.addEventListener('input', () => {
            if (actions?.onEmailChange) {
                actions.onEmailChange(this.emailInput.value);
            }
    });

     this.phoneInput.addEventListener('input', () => {
            if (actions?.onPhoneChange) {
                actions.onPhoneChange(this.phoneInput.value);
            }
        });
        this.submitButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (actions?.Submit) {
        actions.Submit();
      }
    });  
    }

      set email(value: string) {
        this.emailInput.value = value;
      }

      set phone (value: string) {
        this.phoneInput.value = value;
      }

      
   // блокирует/разблокирует кнопку отправки
   
     setErrors(errors: { email?: string; phone?: string }) {
       this.errorsElement.innerHTML = '';
    const errorMessages = [];

    if (errors.email) errorMessages.push(errors.email);
    if (errors.phone) errorMessages.push(errors.phone);
  if (errorMessages.length > 0) {
            this.errorsElement.textContent = errorMessages.join(', ');
        } else {
            this.errorsElement.textContent = '';
        }
    }

    setSubmitDisabled(disabled: boolean) {
        this.submitButton.disabled = disabled;
    }

    render(): HTMLElement {
        return this.container;
    }
  }