export class Counter {
  static COUNT: number = 0;
  _id: number = 0;

  constructor() {
    Counter.COUNT += 1;
    this._id = Counter.COUNT;
  }
}
