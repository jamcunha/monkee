export const tokenType = {
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

type TokenType = typeof tokenType[keyof typeof tokenType];

export type Token = {
    type: TokenType;
    literal: string;
}

const keywords = {
    "fn": tokenType.FUNCTION,
    "let": tokenType.LET,
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
                token = this.newToken(tokenType.ASSIGN, this.ch);
                break;
            case ";":
                token = this.newToken(tokenType.SEMICOLON, this.ch);
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

    private newToken(tokenType: TokenType, ch: string): Token {
        return { type: tokenType, literal: ch };
    }

    private skipWhitespace(): void {
        while (this.ch.match(/[ \t\n\r]/)) {
            this.readChar();
        }
    }
}
