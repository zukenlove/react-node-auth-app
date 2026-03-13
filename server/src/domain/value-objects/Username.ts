export class Username {
  private constructor(private value: string) {}

  static create(value: string): Username {
    if (value.trim().length < 3 || value.length > 20) {
      throw new Error("Invalid username length");
    }
    return new Username(value);
  }

  toString() {
    return this.value;
  }
}