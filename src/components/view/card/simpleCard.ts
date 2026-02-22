import { Card, CardData } from '../card/card';
import { IEvents } from '../../base/Events';

/**
 * Простая карточка с минимальным набором полей: title, price, image.
 * Не добавляет новой логики — использует функционал Card по умолчанию.
 */
export class SimpleCard extends Card {
  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
  }

  // Не переопределяем render() — используем реализацию из Card
}
