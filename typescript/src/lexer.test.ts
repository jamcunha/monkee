import { tokenType, Token, Lexer } from "./lexer";

test("nextToken() symbols", () => {
    const input = "=+(){},;";
    const expected: Token[] = [
        { type: tokenType.ASSIGN, literal: "=" },
        { type: tokenType.PLUS, literal: "+" },
        { type: tokenType.LPAREN, literal: "(" },
        { type: tokenType.RPAREN, literal: ")" },
        { type: tokenType.LBRACE, literal: "{" },
        { type: tokenType.RBRACE, literal: "}" },
        { type: tokenType.COMMA, literal: "," },
        { type: tokenType.SEMICOLON, literal: ";" },
        { type: tokenType.EOF, literal: "" },
    ];

    const lexer = new Lexer(input);
    for (const expectedToken of expected) {
        expect(lexer.nextToken()).toEqual(expectedToken);
    }
});

test("nextToken() simple input", () => {
    const input = `let five = 5;
let ten = 10;

let add = fn(x, y) {
    x + y;
};

let result = add(five, ten);`;

    const expected: Token[] = [
        { type: tokenType.LET, literal: "let" },
        { type: tokenType.IDENT, literal: "five" },
        { type: tokenType.ASSIGN, literal: "=" },
        { type: tokenType.INT, literal: "5" },
        { type: tokenType.SEMICOLON, literal: ";" },
        { type: tokenType.LET, literal: "let" },
        { type: tokenType.IDENT, literal: "ten" },
        { type: tokenType.ASSIGN, literal: "=" },
        { type: tokenType.INT, literal: "10" },
        { type: tokenType.SEMICOLON, literal: ";" },
        { type: tokenType.LET, literal: "let" },
        { type: tokenType.IDENT, literal: "add" },
        { type: tokenType.ASSIGN, literal: "=" },
        { type: tokenType.FUNCTION, literal: "fn" },
        { type: tokenType.LPAREN, literal: "(" },
        { type: tokenType.IDENT, literal: "x" },
        { type: tokenType.COMMA, literal: "," },
        { type: tokenType.IDENT, literal: "y" },
        { type: tokenType.RPAREN, literal: ")" },
        { type: tokenType.LBRACE, literal: "{" },
        { type: tokenType.IDENT, literal: "x" },
        { type: tokenType.PLUS, literal: "+" },
        { type: tokenType.IDENT, literal: "y" },
        { type: tokenType.SEMICOLON, literal: ";" },
        { type: tokenType.RBRACE, literal: "}" },
        { type: tokenType.SEMICOLON, literal: ";" },
        { type: tokenType.LET, literal: "let" },
        { type: tokenType.IDENT, literal: "result" },
        { type: tokenType.ASSIGN, literal: "=" },
        { type: tokenType.IDENT, literal: "add" },
        { type: tokenType.LPAREN, literal: "(" },
        { type: tokenType.IDENT, literal: "five" },
        { type: tokenType.COMMA, literal: "," },
        { type: tokenType.IDENT, literal: "ten" },
        { type: tokenType.RPAREN, literal: ")" },
        { type: tokenType.SEMICOLON, literal: ";" },
        { type: tokenType.EOF, literal: "" },
    ];

    const lexer = new Lexer(input);
    for (const expectedToken of expected) {
        expect(lexer.nextToken()).toEqual(expectedToken);
    }
});
