import { Token } from "./lexer";

interface AstNode {
    tokenLiteral(): string;
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
}

export type Statement = LetStatement | ReturnStatement;

export type Expression = Identifier;

export class Program {
    public statements: Statement[] = [];

    tokenLiteral(): string {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral();
        } else {
            return "";
        }
    }
}
