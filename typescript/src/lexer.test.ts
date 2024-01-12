import { TokenType, Token, Lexer } from "./lexer";

test("Input: \"=+(){},;\"", () => {
    const input = "=+(){},;";
    const expected: Token[] = [
        { type: TokenType.ASSIGN, literal: "=" },
        { type: TokenType.PLUS, literal: "+" },
        { type: TokenType.LPAREN, literal: "(" },
        { type: TokenType.RPAREN, literal: ")" },
        { type: TokenType.LBRACE, literal: "{" },
        { type: TokenType.RBRACE, literal: "}" },
        { type: TokenType.COMMA, literal: "," },
        { type: TokenType.SEMICOLON, literal: ";" },
        { type: TokenType.EOF, literal: "" },
    ];

    const lexer = new Lexer(input);
    for (const expectedToken of expected) {
        expect(lexer.nextToken()).toEqual(expectedToken);
    }
});
