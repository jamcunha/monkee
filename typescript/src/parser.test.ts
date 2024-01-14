import { ExpressionStatement, Identifier, InfixExpression, IntegerLiteral, LetStatement, PrefixExpression, ReturnStatement } from './ast';
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
        expect(stmt).toBeInstanceOf(LetStatement);
        expect(stmt.tokenLiteral()).toBe("let");

        const letStmt = stmt as LetStatement;
        expect(letStmt.name).toBeInstanceOf(Identifier);
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
        expect(stmt).toBeInstanceOf(ReturnStatement);
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
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    expect(stmt.expression).not.toBeNull();

    const ident = stmt.expression! as Identifier;
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
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    expect(stmt.expression).not.toBeNull();

    const literal = stmt.expression as IntegerLiteral;
    expect(literal).toBeInstanceOf(IntegerLiteral);
    expect(literal.value).toBe(5);
    expect(literal.tokenLiteral()).toBe("5");
});

test("Test parsing prefix expressions", () => {
    const prefixTests = [
        ["!5;", "!", 5],
        ["-15;", "-", 15],
    ];

    for (const [input, operator, value] of prefixTests) {
        const lexer = new Lexer(input as string);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program!.statements.length).toBe(1);

        const stmt = program!.statements[0] as ExpressionStatement;
        expect(stmt).toBeInstanceOf(ExpressionStatement);
        expect(stmt.expression).not.toBeNull();

        const exp = stmt.expression! as PrefixExpression;
        expect(exp).toBeInstanceOf(PrefixExpression);
        expect(exp.operator).toBe(operator);
        const right = exp.right! as IntegerLiteral;
        expect(right).toBeInstanceOf(IntegerLiteral);
        expect(right.value).toBe(value);
        expect(right.tokenLiteral()).toBe(String(value));
    }
});

test("Test parsing infix expressions", () => {
    const infixTests = [
        ["5 + 5;", 5, "+", 5],
        ["5 - 5;", 5, "-", 5],
        ["5 * 5;", 5, "*", 5],
        ["5 / 5;", 5, "/", 5],
        ["5 > 5;", 5, ">", 5],
        ["5 < 5;", 5, "<", 5],
        ["5 == 5;", 5, "==", 5],
        ["5 != 5;", 5, "!=", 5],
    ];

    for (const [input, leftValue, operator, rightValue] of infixTests) {
        const lexer = new Lexer(input as string);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program!.statements.length).toBe(1);

        const stmt = program!.statements[0] as ExpressionStatement;
        expect(stmt).toBeInstanceOf(ExpressionStatement);
        expect(stmt.expression).not.toBeNull();

        const exp = stmt.expression! as InfixExpression;
        expect(exp).toBeInstanceOf(InfixExpression);
        expect(exp.operator).toBe(operator);

        const left = exp.left! as IntegerLiteral;
        expect(left).toBeInstanceOf(IntegerLiteral);
        expect(left.value).toBe(leftValue);
        expect(left.tokenLiteral()).toBe(String(leftValue));

        const right = exp.right! as IntegerLiteral;
        expect(right).toBeInstanceOf(IntegerLiteral);
        expect(right.value).toBe(rightValue);
        expect(right.tokenLiteral()).toBe(String(rightValue));
    }
});

test("Test operator precedence parsing", () => {
    const tests = [
        ["-a * b", "((-a) * b)"],
        ["!-a", "(!(-a))"],
        ["a + b + c", "((a + b) + c)"],
        ["a + b - c", "((a + b) - c)"],
        ["a * b * c", "((a * b) * c)"],
        ["a * b / c", "((a * b) / c)"],
        ["a + b / c", "(a + (b / c))"],
        ["a + b * c + d / e - f", "(((a + (b * c)) + (d / e)) - f)"],
        ["3 + 4; -5 * 5", "(3 + 4)((-5) * 5)"],
        ["5 > 4 == 3 < 4", "((5 > 4) == (3 < 4))"],
        ["5 < 4 != 3 > 4", "((5 < 4) != (3 > 4))"],
        ["3 + 4 * 5 == 3 * 1 + 4 * 5", "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))"],
    ];

    for (const [input, expected] of tests) {
        const lexer = new Lexer(input as string);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program!.string()).toBe(expected);
    }
});
