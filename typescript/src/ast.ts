import { Token } from "./lexer";

interface AstNode {
    tokenLiteral(): string;
    string(): string;
}

export class LetStatement implements AstNode {
    private token: Token;
    public name: Identifier | null = null;
    public value: Expression | null = null;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        let out = `${this.tokenLiteral()} ${this.name!.string()} = `;

        if (this.value !== null) {
            out += this.value.string();
        }

        out += ";";
        return out;
    }
}

export class ReturnStatement implements AstNode {
    private token: Token;
    public returnValue: Expression | null = null;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        let out = `${this.tokenLiteral()} `;

        if (this.returnValue !== null) {
            out += this.returnValue.string();
        }

        out += ";";
        return out;
    }
}

export class ExpressionStatement implements AstNode {
    private token: Token;
    public expression: Expression | null = null;

    constructor(token: Token) {
        this.token = token;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        if (this.expression !== null) {
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

export class IntegerLiteral implements AstNode {
    private token: Token;
    public value: number;

    constructor(token: Token) {
        this.token = token;
        this.value = Number(token.literal);
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        return this.token.literal;
    }
}

export class PrefixExpression implements AstNode {
    private token: Token;
    public operator: string;
    public right: Expression | null = null;

    constructor(token: Token) {
        this.token = token;
        this.operator = token.literal;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        let out = "(";
        out += this.operator;
        out += this.right!.string();
        out += ")";
        return out;
    }
}

export class InfixExpression implements AstNode {
    private token: Token;
    public operator: string;
    public left: Expression;
    public right: Expression | null = null;

    constructor(token: Token, left: Expression) {
        this.token = token;
        this.operator = token.literal;
        this.left = left;
    }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        let out = "(";
        out += this.left!.string();
        out += ` ${this.operator} `;
        out += this.right!.string();
        out += ")";
        return out;
    }
}

export type Statement = LetStatement | ReturnStatement | ExpressionStatement;

export type Expression = Identifier | IntegerLiteral | PrefixExpression | InfixExpression;

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
