import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";


export interface ISuccessView {
  total: number;
}
interface ISuccessActions {
    onClick: () => void;
}

export class Success extends Component<ISuccessView> {
    protected _closeButton: HTMLButtonElement;
    protected _totalElement: HTMLElement;

    constructor(container: HTMLElement, actions: ISuccessActions) {
        super(container);
        this._closeButton = ensureElement<HTMLButtonElement>('.button', container);
        this._totalElement = ensureElement('.order-success__description', container);

        if (actions?.onClick) {
            this._closeButton.addEventListener('click', actions.onClick);
        }
    }

    set total(value: number) {
        this._totalElement.textContent = `Списано ${value} синапсов`;
    }
}