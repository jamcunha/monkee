import { Identifier, LetStatement, Program, Statement } from "./ast";
import { Lexer, Token, TokenType, tokenType } from "./lexer";

export class Parser {
    private lexer: Lexer;
    private curToken: Token;
    private peekToken: Token;
    public errors: string[] = [];

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.curToken = this.lexer.nextToken();
        this.peekToken = this.lexer.nextToken();
    }

    public parseProgram(): Program | undefined {
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

    private parseStatement(): Statement | null {
        switch (this.curToken.type) {
            case tokenType.LET:
                return this.parseLetStatement();
            default:
                return null;
        }
    }

    private parseLetStatement(): Statement | null {
        const stmt = new LetStatement(this.curToken);

        if (!this.expectPeek(tokenType.IDENT)) {
            return null;
        }

        stmt.name = new Identifier(this.curToken);

        if (!this.expectPeek(tokenType.ASSIGN)) {
            return null;
        }

        if (this.curToken.type !== tokenType.SEMICOLON) {
            this.nextToken();
        }

        return stmt;
    }

    private peekError(type: TokenType): void {
        const msg = `expected next token to be ${type}, got ${this.peekToken.type} instead`;
        this.errors.push(msg);
    }
}
