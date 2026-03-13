export declare class Password {
    private readonly value;
    private constructor();
    static create(value: string): Promise<Password>;
    compare(raw: string): Promise<boolean>;
    toString(): string;
    static fromHash(hash: string): Password;
}
//# sourceMappingURL=Password.d.ts.map