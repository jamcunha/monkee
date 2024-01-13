import { Token } from "./lexer";

interface AstNode {
    tokenLiteral(): string;
    string(): string;
}

export class LetStatement implements AstNode {
    private token: Token;
    public name: Identifier | undefined = undefined;
    public value: Expression | undefined = undefined;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        let out = `${this.tokenLiteral()} ${this.name!.string()} = `;

        if (this.value !== undefined) {
            out += this.value.string();
        }

        out += ";";
        return out;
    }
}

export class ReturnStatement implements AstNode {
    private token: Token;
    public returnValue: Expression | undefined = undefined;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        let out = `${this.tokenLiteral()} `;

        if (this.returnValue !== undefined) {
            out += this.returnValue.string();
        }

        out += ";";
        return out;
    }
}

export class ExpressionStatement implements AstNode {
    private token: Token;
    public expression: Expression | undefined = undefined;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        if (this.expression !== undefined) {
            return this.expression.string();
        }

        return "";
    }
}

export class Identifier implements AstNode {
    private token: Token;
    public value: string;

    constructor(token: Token) {
        this.token = token;
        this.value = token.literal;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        return this.value;
    }
}

export type Statement = LetStatement | ReturnStatement | ExpressionStatement;

export type Expression = Identifier;

export class Program implements AstNode {
    public statements: Statement[] = [];

    tokenLiteral(): string {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral();
        } else {
            return "";
        }
    }

    string(): string {
        return this.statements.map((s) => s.string()).join("");
    }
}
