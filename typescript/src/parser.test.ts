import { ArrayLiteral, BooleanLiteral, CallExpression, Expression, ExpressionStatement, FunctionLiteral, Identifier, IfExpression, IndexExpression, InfixExpression, IntegerLiteral, LetStatement, PrefixExpression, ReturnStatement, StringLiteral } from "./ast";
import { Lexer } from "./lexer";
import { Parser } from "./parser";

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
    const tests = [
        ["let x = 5;", "x", 5],
        ["let y = true;", "y", true],
        ["let foobar = y;", "foobar", "y"],
    ]

    for (const [input, expectedIdentifier, expectedValue] of tests) {
        const lexer = new Lexer(input as string);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();
        checkParserErrors(parser);

        expect(program!.statements.length).toBe(1);

        const stmt = program!.statements[0] as LetStatement;
        expect(stmt).toBeInstanceOf(LetStatement);
        expect(stmt.name!.value).toBe(expectedIdentifier);
        expect(stmt.name!.tokenLiteral()).toBe(expectedIdentifier);

        testLiteralExpression(stmt.value!, expectedValue);
    }
});

test("Test `return` statements", () => {
    const tests = [
        ["return 5;", 5],
        ["return true;", true],
        ["return foobar;", "foobar"],
    ];

    for (const [input, expectedValue] of tests) {
        const lexer = new Lexer(input as string);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();
        checkParserErrors(parser);

        expect(program!.statements.length).toBe(1);

        const stmt = program!.statements[0] as ReturnStatement;
        expect(stmt).toBeInstanceOf(ReturnStatement);
        expect(stmt.tokenLiteral()).toBe("return");

        testLiteralExpression(stmt.returnValue!, expectedValue);
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
        ["a + add(b * c) + d", "((a + add((b * c))) + d)"],
        ["add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))", "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))"],
        ["add(a + b + c * d / f + g)", "add((((a + b) + ((c * d) / f)) + g))"],
        ["a * [1, 2, 3, 4][b * c] * d", "((a * ([1, 2, 3, 4][(b * c)])) * d)"],
        ["add(a * b[2], b[1], 2 * [1, 2][1])", "add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))"],
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

test("Test function literal parsing", () => {
    const input = "fn(x, y) { x + y; }";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    checkParserErrors(parser);

    expect(program!.statements.length).toBe(1);

    const stmt = program!.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    const func = stmt.expression! as FunctionLiteral;
    expect(func).toBeInstanceOf(FunctionLiteral);

    expect(func.parameters.length).toBe(2);
    testLiteralExpression(func.parameters[0], "x");
    testLiteralExpression(func.parameters[1], "y");

    expect(func.body!.statements.length).toBe(1);
    const bodyStmt = func.body!.statements[0] as ExpressionStatement;
    expect(bodyStmt).toBeInstanceOf(ExpressionStatement);
    testInfixExpression(bodyStmt.expression!, "x", "+", "y");
});

test("Test function parameter parsing", () => {
    const tests = [
        ["fn() {};", []],
        ["fn(x) {};", ["x"]],
        ["fn(x, y, z) {};", ["x", "y", "z"]],
    ];

    for (const [input, expected] of tests) {
        const lexer = new Lexer(input as string);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();
        checkParserErrors(parser);

        const stmt = program!.statements[0] as ExpressionStatement;
        expect(stmt).toBeInstanceOf(ExpressionStatement);

        const func = stmt.expression! as FunctionLiteral;
        expect(func).toBeInstanceOf(FunctionLiteral);

        expect(func.parameters.length).toBe(expected.length);

        for (let i = 0; i < expected.length; i++) {
            testLiteralExpression(func.parameters[i], expected[i]);
        }
    }
});

test("Test call expression parsing", () => {
    const input = "add(1, 2 * 3, 4 + 5);";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    checkParserErrors(parser);

    expect(program!.statements.length).toBe(1);

    const stmt = program!.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    const exp = stmt.expression! as CallExpression;
    expect(exp).toBeInstanceOf(CallExpression);

    testIdentifier(exp.function!, "add");

    expect(exp.arguments.length).toBe(3);
    testLiteralExpression(exp.arguments[0], 1);
    testInfixExpression(exp.arguments[1], 2, "*", 3);
    testInfixExpression(exp.arguments[2], 4, "+", 5);
});

test("Test string literal expression", () => {
    const input = "\"hello world\";";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    checkParserErrors(parser);

    expect(program!.statements.length).toBe(1);

    const stmt = program!.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    const literal = stmt.expression! as StringLiteral;
    expect(literal).toBeInstanceOf(StringLiteral);
    expect(literal.value).toBe("hello world");
});

test("Test parsing array literals", () => {
    const input = "[1, 2 * 2, 3 + 3]";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    checkParserErrors(parser);

    expect(program!.statements.length).toBe(1);

    const stmt = program!.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    const array = stmt.expression! as ArrayLiteral;
    expect(array).toBeInstanceOf(ArrayLiteral);
    expect(array.elements.length).toBe(3);

    testIntegerLiteral(array.elements[0], 1);
    testInfixExpression(array.elements[1], 2, "*", 2);
    testInfixExpression(array.elements[2], 3, "+", 3);
});

test("Test parsing index expressions", () => {
    const input = "myArray[1 + 1]";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    checkParserErrors(parser);

    expect(program!.statements.length).toBe(1);

    const stmt = program!.statements[0] as ExpressionStatement;
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    const indexExp = stmt.expression! as IndexExpression;
    expect(indexExp).toBeInstanceOf(IndexExpression);
    expect(indexExp.left).not.toBeNull();
    expect(indexExp.index).not.toBeNull();

    testIdentifier(indexExp.left!, "myArray");
    testInfixExpression(indexExp.index!, 1, "+", 1);
});
