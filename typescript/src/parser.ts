import { Expression, ExpressionStatement, Identifier, IntegerLiteral, LetStatement, PrefixExpression, Program, ReturnStatement, Statement } from "./ast";
import { Lexer, Token, TokenType, tokenType } from "./lexer";

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (exp: Expression) => Expression | null;

const enum Precedence {
    LOWEST = 1,
    EQUALS,         // ==
    LESSGREATER,    // > or <
    SUM,            // +
    PRODUCT,        // *
    PREFIX,         // -X or !X
    CALL,           // myFunction(X)
};

export class Parser {
    private lexer: Lexer;
    private curToken: Token;
    private peekToken: Token;
    public errors: string[] = [];

    private prefixParseFns: Map<TokenType, PrefixParseFn> = new Map();
    private infixParseFns: Map<TokenType, InfixParseFn> = new Map();

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.curToken = this.lexer.nextToken();
        this.peekToken = this.lexer.nextToken();

        this.registerPrefix(tokenType.IDENT, this.parseIdentifier.bind(this));
        this.registerPrefix(tokenType.INT, this.parseIntegerLiteral.bind(this));
        this.registerPrefix(tokenType.BANG, this.parsePrefixExpression.bind(this));
        this.registerPrefix(tokenType.MINUS, this.parsePrefixExpression.bind(this));
    }

    public parseProgram(): Program {
        const program = new Program();

        while (this.curToken.type !== tokenType.EOF) {
            const stmt = this.parseStatement();
            if (stmt !== null) {
                program.statements.push(stmt);
            }
            this.nextToken();
        }

        return program;
    }

    private nextToken(): void {
        this.curToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }

    private expectPeek(type: TokenType): boolean {
        if (this.peekToken.type === type) {
            this.nextToken();
            return true;
        } else {
            this.peekError(type);
            return false;
        }
    }

    private peekError(type: TokenType): void {
        const msg = `expected next token to be ${type}, got ${this.peekToken.type} instead`;
        this.errors.push(msg);
    }

    private noPrefixParseFnError(type: TokenType): void {
        const msg = `no prefix parse function for \'${type}\' found`;
        this.errors.push(msg);
    }

    private registerPrefix(type: TokenType, fn: PrefixParseFn): void {
        this.prefixParseFns.set(type, fn);
    }

    private registerInfix(type: TokenType, fn: InfixParseFn): void {
        this.infixParseFns.set(type, fn);
    }

    private parseStatement(): Statement | null {
        switch (this.curToken.type) {
            case tokenType.LET:
                return this.parseLetStatement();
            case tokenType.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    private parseLetStatement(): LetStatement | null {
        const stmt = new LetStatement(this.curToken);

        if (!this.expectPeek(tokenType.IDENT)) {
            return null;
        }

        stmt.name = new Identifier(this.curToken);

        if (!this.expectPeek(tokenType.ASSIGN)) {
            return null;
        }

        // TODO: Skip expression until semicolon
        while (this.curToken.type !== tokenType.SEMICOLON) {
            this.nextToken();
        }

        return stmt;
    }

    private parseReturnStatement(): ReturnStatement {
        const stmt = new ReturnStatement(this.curToken);

        this.nextToken();

        // TODO: Skip expression until semicolon
        while (this.curToken.type !== tokenType.SEMICOLON) {
            this.nextToken();
        }

        return stmt;
    }

    private parseExpressionStatement(): ExpressionStatement {
        const stmt = new ExpressionStatement(this.curToken);

        stmt.expression = this.parseExpression(Precedence.LOWEST);

        if (this.peekToken.type === tokenType.SEMICOLON) {
            this.nextToken();
        }

        return stmt;
    }

    private parseExpression(precedence: Precedence): Expression | null {
        const prefix = this.prefixParseFns.get(this.curToken.type);
        if (prefix === undefined) {
            this.noPrefixParseFnError(this.curToken.type);
            return null;
        }

        let leftExp = prefix();

        return leftExp;
    }

    private parseIdentifier(): Identifier {
        return new Identifier(this.curToken);
    }

    private parseIntegerLiteral(): IntegerLiteral {
        return new IntegerLiteral(this.curToken);
    }

    private parsePrefixExpression(): PrefixExpression {
        const expression = new PrefixExpression(this.curToken);

        this.nextToken();

        expression.right = this.parseExpression(Precedence.PREFIX);

        return expression;
    }
}
