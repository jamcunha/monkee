import { BooleanLiteral, Expression, ExpressionStatement, Identifier, IfExpression, InfixExpression, IntegerLiteral, LetStatement, PrefixExpression, ReturnStatement } from './ast';
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

function testIdentifier(exp: Expression, value: string): void {
    expect(exp).toBeInstanceOf(Identifier);
    const ident = exp as Identifier;
    expect(ident.value).toBe(value);
    expect(ident.tokenLiteral()).toBe(value);
}

function testIntegerLiteral(exp: Expression, value: number): void {
    expect(exp).toBeInstanceOf(IntegerLiteral);
    const int = exp as IntegerLiteral;
    expect(int.value).toBe(value);
    expect(int.tokenLiteral()).toBe(String(value));
}

function testBooleanLiteral(exp: Expression, value: boolean): void {
    expect(exp).toBeInstanceOf(BooleanLiteral);
    const bool = exp as BooleanLiteral;
    expect(bool.value).toBe(value);
    expect(bool.tokenLiteral()).toBe(value ? "true" : "false");
}

function testLiteralExpression(exp: Expression, expected: any): void {
    if (typeof expected === "number") {
        testIntegerLiteral(exp, expected);
    } else if (typeof expected === "string") {
        testIdentifier(exp, expected);
    } else if (typeof expected === "boolean") {
        testBooleanLiteral(exp, expected);
    }
}

function testInfixExpression(exp: Expression, left: any, operator: string, right: any): void {
    expect(exp).toBeInstanceOf(InfixExpression);
    const opExp = exp as InfixExpression;

    testLiteralExpression(opExp.left, left);
    expect(opExp.operator).toBe(operator);
    testLiteralExpression(opExp.right!, right);
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
        testLiteralExpression(letStmt.name!, tests[i]);
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

    testLiteralExpression(stmt.expression!, "foobar");
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

    testLiteralExpression(stmt.expression!, 5);
});

test("Test boolean expression", () => {
    const tests = [
        ["true;", true],
        ["false;", false],
    ];

    for (const [input, expected] of tests) {
        const lexer = new Lexer(input as string);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program!.statements.length).toBe(1);

        const stmt = program!.statements[0] as ExpressionStatement;
        expect(stmt).toBeInstanceOf(ExpressionStatement);
        expect(stmt.expression).not.toBeNull();

        testLiteralExpression(stmt.expression!, expected);
    }
});

test("Test parsing prefix expressions", () => {
    const prefixTests = [
        ["!5;", "!", 5],
        ["-15;", "-", 15],
        ["!true;", "!", true],
        ["!false;", "!", false],
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

        testLiteralExpression(exp.right!, value);
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
        ["true == true", true, "==", true],
        ["true != false", true, "!=", false],
        ["false == false", false, "==", false],
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

        testInfixExpression(stmt.expression!, leftValue, operator as string, rightValue);
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
        ["true", "true"],
        ["false", "false"],
        ["3 > 5 == false", "((3 > 5) == false)"],
        ["3 < 5 == true", "((3 < 5) == true)"],
        ["1 + (2 + 3) + 4", "((1 + (2 + 3)) + 4)"],
        ["(5 + 5) * 2", "((5 + 5) * 2)"],
        ["2 / (5 + 5)", "(2 / (5 + 5))"],
        ["-(5 + 5)", "(-(5 + 5))"],
        ["!(true == true)", "(!(true == true))"],
    ];

    for (const [input, expected] of tests) {
        const lexer = new Lexer(input as string);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();

        checkParserErrors(parser);

        expect(program!.string()).toBe(expected);
    }
});

test("Test if expression", () => {
    const input = "if (x < y) { x }";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    checkParserErrors(parser);

    expect(program!.statements.length).toBe(1);

    const stmt = program!.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    const exp = stmt.expression! as IfExpression;
    expect(exp).toBeInstanceOf(IfExpression);

    testInfixExpression(exp.condition!, "x", "<", "y");

    expect(exp.consequence!.statements.length).toBe(1);
    const consequence = exp.consequence!.statements[0] as ExpressionStatement;
    expect(consequence).toBeInstanceOf(ExpressionStatement);
    testIdentifier(consequence.expression!, "x");
    expect(exp.alternative).toBeNull();
});

test("Test if else expression", () => {
    const input = "if (x < y) { x } else { y }";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    checkParserErrors(parser);

    expect(program!.statements.length).toBe(1);

    const stmt = program!.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    const exp = stmt.expression! as IfExpression;
    expect(exp).toBeInstanceOf(IfExpression);

    testInfixExpression(exp.condition!, "x", "<", "y");

    expect(exp.consequence!.statements.length).toBe(1);
    const consequence = exp.consequence!.statements[0] as ExpressionStatement;
    expect(consequence).toBeInstanceOf(ExpressionStatement);
    testIdentifier(consequence.expression!, "x");

    expect(exp.alternative!.statements.length).toBe(1);
    const alternative = exp.alternative!.statements[0] as ExpressionStatement;
    expect(alternative).toBeInstanceOf(ExpressionStatement);
    testIdentifier(alternative.expression!, "y");
});
