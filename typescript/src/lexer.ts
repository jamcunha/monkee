export const tokenType = {
    ILLEGAL:    "ILLEGAL",
    EOF:        "EOF",

    IDENT:      "IDENT",
    INT:        "INT",
    STRING:     "STRING",

    ASSIGN:     "=",
    PLUS:       "+",
    MINUS:      "-",
    BANG:       "!",
    ASTERISK:   "*",
    SLASH:      "/",

    EQ:         "==",
    NOT_EQ:     "!=",
    LT:         "<",
    GT:         ">",

    COMMA:      ",",
    SEMICOLON:  ";",

    LPAREN:     "(",
    RPAREN:     ")",
    LBRACE:     "{",
    RBRACE:     "}",
    LBRACKET:   "[",
    RBRACKET:   "]",

    FUNCTION:   "FUNCTION",
    LET:        "LET",
    TRUE:       "TRUE",
    FALSE:      "FALSE",
    IF:         "IF",
    ELSE:       "ELSE",
    RETURN:     "RETURN",
} as const;

export type TokenType = typeof tokenType[keyof typeof tokenType];

export type Token = {
    type: TokenType;
    literal: string;
}

const keywords = {
    "fn":       tokenType.FUNCTION,
    "let":      tokenType.LET,
    "true":     tokenType.TRUE,
    "false":    tokenType.FALSE,
    "if":       tokenType.IF,
    "else":     tokenType.ELSE,
    "return":   tokenType.RETURN,
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
        this.skipWhitespace();

        switch (this.ch) {
            case "=":
                if (this.peekChar() === "=") {
                    const ch = this.ch;
                    this.readChar();
                    token = this.newToken(tokenType.EQ, ch + this.ch);
                } else {
                    token = this.newToken(tokenType.ASSIGN, this.ch);
                }
                break;
            case "+":
                token = this.newToken(tokenType.PLUS, this.ch);
                break;
            case "-":
                token = this.newToken(tokenType.MINUS, this.ch);
                break;
            case "!":
                if (this.peekChar() === "=") {
                    const ch = this.ch;
                    this.readChar();
                    token = this.newToken(tokenType.NOT_EQ, ch + this.ch);
                } else {
                    token = this.newToken(tokenType.BANG, this.ch);
                }
                break;
            case "/":
                token = this.newToken(tokenType.SLASH, this.ch);
                break;
            case "*":
                token = this.newToken(tokenType.ASTERISK, this.ch);
                break;
            case "<":
                token = this.newToken(tokenType.LT, this.ch);
                break;
            case ">":
                token = this.newToken(tokenType.GT, this.ch);
                break;
            case ";":
                token = this.newToken(tokenType.SEMICOLON, this.ch);
                break;
            case ",":
                token = this.newToken(tokenType.COMMA, this.ch);
                break;
            case "(":
                token = this.newToken(tokenType.LPAREN, this.ch);
                break;
            case ")":
                token = this.newToken(tokenType.RPAREN, this.ch);
                break;
            case ",":
                token = this.newToken(tokenType.COMMA, this.ch);
                break;
            case "+":
                token = this.newToken(tokenType.PLUS, this.ch);
                break;
            case "{":
                token = this.newToken(tokenType.LBRACE, this.ch);
                break;
            case "}":
                token = this.newToken(tokenType.RBRACE, this.ch);
                break;
            case "[":
                token = this.newToken(tokenType.LBRACKET, this.ch);
                break;
            case "]":
                token = this.newToken(tokenType.RBRACKET, this.ch);
                break;
            case "\"":
                token = this.newToken(tokenType.STRING, this.readString());
                break;
            case "\0":
                token = this.newToken(tokenType.EOF, "");
                break;
            default:
                if (this.ch.match(/[a-zA-Z_]/)) {
                    const literal = this.readIdentifier();
                    const type = keywords[literal as keyof typeof keywords] ?? tokenType.IDENT;

                    return this.newToken(type, literal);
                } else if (this.ch.match(/[0-9]/)) {
                    return this.newToken(tokenType.INT, this.readNumber());
                } else {
                    token = this.newToken(tokenType.ILLEGAL, this.ch);
                }
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

    private readNumber(): string {
        const position = this.position;
        while (this.ch.match(/[0-9]/)) {
            this.readChar();
        }
        return this.input.slice(position, this.position);
    }

    private readIdentifier(): string {
        const position = this.position;
        while (this.ch.match(/[a-zA-Z_]/)) {
            this.readChar();
        }
        return this.input.slice(position, this.position);
    }

    private readString(): string {
        const position = this.position + 1;
        do {
            this.readChar();
        } while (this.ch !== "\"" && this.ch !== "\0");
        return this.input.slice(position, this.position);
    }

    private peekChar(): string {
        if (this.readPosition >= this.input.length) {
            return "\0";
        } else {
            return this.input[this.readPosition];
        }
    }

    private newToken(tokenType: TokenType, ch: string): Token {
        return { type: tokenType, literal: ch };
    }

    private skipWhitespace(): void {
        while (this.ch.match(/[ \t\n\r]/)) {
            this.readChar();
        }
    }
}
