import { Component } from "../../base/Component";
import { ensureAllElements, ensureElement } from "../../../utils/utils";


// Базовый класс для работы с формами 

export class BaseForm<T>  extends Component<T> {
  
  protected errorsElement: HTMLElement;
  protected submitButton: HTMLButtonElement;
  protected formFields: HTMLInputElement[];
  

  constructor(container: HTMLFormElement, actions?: {Submit: () => void}) {
    super(container);

      this.errorsElement = ensureElement<HTMLElement>(
        '.form__errors',
         container);

      this.submitButton = ensureElement<HTMLButtonElement>(
        'button[type="submit"]', 
        container);

      this.formFields = ensureAllElements<HTMLInputElement>(
      ".form_input",
      container
    );
  
    container.addEventListener('submit', (events) => {
      events.preventDefault();
      if (actions?.Submit) {
      actions.Submit();
      }
    });

}
  // Установка состояния кнопки submit
  set submitDisabled(value: boolean) {
    if (this.submitButton) {
      this.submitButton.disabled = value;
    }
  }

  set showError(message: string) {
    this.errorsElement.textContent = message;
  }
}
