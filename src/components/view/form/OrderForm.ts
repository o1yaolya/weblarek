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

  constructor(container: HTMLFormElement, actions?: IOrderFormStep1) {
    super(container, actions);
 

    this.paymentButton = ensureAllElements<HTMLButtonElement>(
      '.button_alt',
      container
    );

    this.addressInput = ensureElement<HTMLInputElement>(
      'input[name="address"]', 
      container);
    
    this.errorsElement = ensureElement('.form__errors',  
      container);  

     this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);

    this.paymentButton.forEach(button => {
  button.addEventListener('click', () => {
    
    const paymentChange = button.getAttribute('name') || 'card';
    if (actions?.onPaymentChange) {
      actions.onPaymentChange(paymentChange);
    }
  });
});

    this.addressInput.addEventListener('input', () => {
            if (actions?.onAddressChange) {
                actions.onAddressChange(this.addressInput.value);
            }
    });
     this.submitButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (actions?.Submit) {
        actions.Submit();
      }
    });   
  }
 
  // Устанавливает активный способ оплаты
  setPayment(payment: string): void {
    this.paymentButton.forEach(btn => {
      btn.classList.toggle('button_alt-active', btn.getAttribute('name') === payment);
    });
  }

      set address(value: string) {
        this.addressInput.value = value;
      }

      set payment (value: string) {
        this.setPayment(value);
      }


   // Отображает ошибки валидации
  
  setValidationErrors(errors: { payment?: string; address?: string }) {
    
    this.errorsElement.innerHTML = '';
    const errorMessages = [];

    if (errors.payment) errorMessages.push(errors.payment);
    if (errors.address) errorMessages.push(errors.address);
  if (errorMessages.length > 0) {
            this.errorsElement.textContent = errorMessages.join(', ');
        } else {
            this.errorsElement.textContent = '';
        }
    }
    setSubmitDisbled(disabled: boolean): void {
  this.submitButton.disabled = disabled;
}
       render(): HTMLElement {
        return this.container;
    }
  }
