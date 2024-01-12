export const TokenType = {
    ILLEGAL: "ILLEGAL",
    EOF: "EOF",

    IDENT: "IDENT",
    INT: "INT",

    ASSIGN: "=",
    PLUS: "+",

    COMMA: ",",
    SEMICOLON: ";",

    LPAREN: "(",
    RPAREN: ")",
    LBRACE: "{",
    RBRACE: "}",

    FUNCTION: "FUNCTION",
    LET: "LET",
} as const;

type TokenType = typeof TokenType[keyof typeof TokenType];

export type Token = {
    type: TokenType;
    literal: string;
}

export class Lexer {
    private input: string;
    private position: number = 0;
    private readPosition: number = 0;
    private ch: string = "";

    constructor(input: string) {
        this.input = input;
        this.readChar();
    }

    public nextToken(): Token {
        let token: Token;

        switch (this.ch) {
            case "=":
                token = this.newToken(TokenType.ASSIGN, this.ch);
                break;
            case ";":
                token = this.newToken(TokenType.SEMICOLON, this.ch);
                break;
            case "(":
                token = this.newToken(TokenType.LPAREN, this.ch);
                break;
            case ")":
                token = this.newToken(TokenType.RPAREN, this.ch);
                break;
            case ",":
                token = this.newToken(TokenType.COMMA, this.ch);
                break;
            case "+":
                token = this.newToken(TokenType.PLUS, this.ch);
                break;
            case "{":
                token = this.newToken(TokenType.LBRACE, this.ch);
                break;
            case "}":
                token = this.newToken(TokenType.RBRACE, this.ch);
                break;
            case "\0":
                token = this.newToken(TokenType.EOF, "");
                break;
        }

        this.readChar();
        return token!;
    }

    private readChar(): void {
        if (this.readPosition >= this.input.length) {
            this.ch = "\0";
        } else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition += 1;
    }

    private newToken(tokenType: TokenType, ch: string): Token {
        return { type: tokenType, literal: ch };
    }
}
