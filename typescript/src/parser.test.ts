import { ExpressionStatement, Identifier, IntegerLiteral, LetStatement } from './ast';
import { Lexer } from './lexer';
import { Parser } from './parser';

function checkParserErrors(parser: Parser): void {
    if (parser.errors.length === 0) {
        return
    }

    for (const msg of parser.errors) {
        console.error("parser error: " + msg);
    }

    throw new Error("parser has " + parser.errors.length + " errors");
}

test("Test `let` statements", () => {
    const input = `
let x = 5;
let y = 10;
let foobar = 838383;
`;

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();

    checkParserErrors(parser);

    expect(program!.statements.length).toBe(3);

    const tests = [
        "x",
        "y",
        "foobar",
    ];

    for (let i = 0; i < tests.length; i++) {
        const stmt = program!.statements[i];
        expect(stmt.tokenLiteral()).toBe("let");

        const letStmt = stmt as LetStatement;
        expect(letStmt.name!.tokenLiteral()).toBe(tests[i]);
        expect(letStmt.name!.value).toBe(tests[i]);
    }
});

test("Test `return` statements", () => {
    const input = `
return 5;
return 10;
return 993322;
`;

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();

    checkParserErrors(parser);

    expect(program!.statements.length).toBe(3);

    for (const stmt of program!.statements) {
        expect(stmt.tokenLiteral()).toBe("return");
    }
});

test("Test identifier expression", () => {
    const input = "foobar;";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();

    checkParserErrors(parser);

    expect(program!.statements.length).toBe(1);

    const stmt = program!.statements[0] as ExpressionStatement;
    expect(stmt.expression).not.toBeNull();

    const ident = stmt.expression!;
    expect(ident).toBeInstanceOf(Identifier);
    expect(ident.value).toBe("foobar");
    expect(ident.tokenLiteral()).toBe("foobar");
});

test("Test integer literal expression", () => {
    const input = "5;";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();

    checkParserErrors(parser);

    expect(program!.statements.length).toBe(1);

    const stmt = program!.statements[0] as ExpressionStatement;
    expect(stmt.expression).not.toBeNull();

    const literal = stmt.expression!;
    expect(literal).toBeInstanceOf(IntegerLiteral);
    expect(literal.value).toBe(5);
    expect(literal.tokenLiteral()).toBe("5");
});
