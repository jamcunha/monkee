import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { FunctionType, Object } from "./object";
import { evaluate } from "./evaluator";
import { Environment } from "./environment";

function testEvaluation(input: string): Object {
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    const env = new Environment();

    return evaluate(program, env);
}

function testIntegerObject(obj: Object, expected: number): void {
    expect(obj.Type()).toBe("INTEGER");
    expect(obj.Inspect()).toBe(expected.toString());
}

function testBooleanObject(obj: Object, expected: boolean): void {
    expect(obj.Type()).toBe("BOOLEAN");
    expect(obj.Inspect()).toBe(expected.toString());
}

function testNullObject(obj: Object): void {
    expect(obj.Type()).toBe("NULL");
}

test("Evaluate Integer Expression", () => {
    const tests: Array<[string, number]> = [
        ["5", 5],
        ["10", 10],
        ["-5", -5],
        ["-10", -10],
        ["5 + 5 + 5 + 5 - 10", 10],
        ["2 * 2 * 2 * 2 * 2", 32],
        ["-50 + 100 + -50", 0],
        ["5 * 2 + 10", 20],
        ["5 + 2 * 10", 25],
        ["20 + 2 * -10", 0],
        ["50 / 2 * 2 + 10", 60],
        ["2 * (5 + 10)", 30],
        ["3 * 3 * 3 + 10", 37],
        ["3 * (3 * 3) + 10", 37],
        ["(5 + 10 * 2 + 15 / 3) * 2 + -10", 50],
    ];

    for (const [input, expected] of tests) {
        const evaluated = testEvaluation(input);
        testIntegerObject(evaluated, expected);
    }
});

test("Evaluate Boolean Expression", () => {
    const tests: Array<[string, boolean]> = [
        ["true", true],
        ["false", false],
        ["1 < 2", true],
        ["1 > 2", false],
        ["1 < 1", false],
        ["1 > 1", false],
        ["1 == 1", true],
        ["1 != 1", false],
        ["1 == 2", false],
        ["1 != 2", true],
        ["true == true", true],
        ["false == false", true],
        ["true == false", false],
        ["true != false", true],
        ["false != true", true],
        ["(1 < 2) == true", true],
        ["(1 < 2) == false", false],
        ["(1 > 2) == true", false],
        ["(1 > 2) == false", true],
    ]

    for (const [input, expected] of tests) {
        const evaluated = testEvaluation(input);
        testBooleanObject(evaluated, expected);
    }
});

test("Evaluate Bang Operator", () => {
    const tests: Array<[string, boolean]> = [
        ["!true", false],
        ["!false", true],
        ["!5", false],
        ["!!true", true],
        ["!!false", false],
        ["!!5", true],
    ];

    for (const [input, expected] of tests) {
        const evaluated = testEvaluation(input);
        testBooleanObject(evaluated, expected);
    }
});

test("Evaluate If Else Expression", () => {
    const tests: Array<[string, (number | null)]> = [
        ["if (true) { 10 }", 10],
        ["if (false) { 10 }", null],
        ["if (1) { 10 }", 10],
        ["if (1 < 2) { 10 }", 10],
        ["if (1 > 2) { 10 }", null],
        ["if (1 > 2) { 10 } else { 20 }", 20],
        ["if (1 < 2) { 10 } else { 20 }", 10],
    ];

    for (const [input, expected] of tests) {
        const evaluated = testEvaluation(input);
        if (expected !== null) {
            testIntegerObject(evaluated, expected);
        } else {
            testNullObject(evaluated);
        }
    }
});

test("Evaluate Return Statement", () => {
    const tests: Array<[string, number]> = [
        ["return 10;", 10],
        ["return 10; 9;", 10],
        ["return 2 * 5; 9;", 10],
        ["9; return 2 * 5; 9;", 10],
        ["if (10 > 1) { if (10 > 1) { return 10; } return 1; }", 10],
    ]

    for (const [input, expected] of tests) {
        const evaluated = testEvaluation(input);
        testIntegerObject(evaluated, expected);
    }
});

test("Error Handling", () => {
    const tests: Array<[string, string]> = [
        ["5 + true;", "type mismatch: INTEGER + BOOLEAN"],
        ["5 + true; 5;", "type mismatch: INTEGER + BOOLEAN"],
        ["-true", "unknown operator: -BOOLEAN"],
        ["true + false;", "unknown operator: BOOLEAN + BOOLEAN"],
        ["5; true + false; 5", "unknown operator: BOOLEAN + BOOLEAN"],
        ["if (10 > 1) { true + false; }", "unknown operator: BOOLEAN + BOOLEAN"],
        ["if (10 > 1) { if (10 > 1) { return true + false; } return 1; }", "unknown operator: BOOLEAN + BOOLEAN"],
        ["foobar", "identifier not found: foobar"],
        ["\"Hello\" - \"World\"", "unknown operator: STRING - STRING"],
    ];

    for (const [input, expected] of tests) {
        const evaluated = testEvaluation(input);
        expect(evaluated.Type()).toBe("ERROR");
        expect(evaluated.Inspect()).toBe(expected);
    }
});

test("Let Statements", () => {
    const tests: Array<[string, number]> = [
        ["let a = 5; a;", 5],
        ["let a = 5 * 5; a;", 25],
        ["let a = 5; let b = a; b;", 5],
        ["let a = 5; let b = a; let c = a + b + 5; c;", 15],
    ];

    for (const [input, expected] of tests) {
        testIntegerObject(testEvaluation(input), expected);
    }
});

test("Function Object", () => {
    const input = "fn(x) { x + 2; };";

    const evaluated = testEvaluation(input);
    expect(evaluated.Type()).toBe("FUNCTION");
    expect(evaluated.Inspect()).toBe("fn(x) {\n(x + 2)\n}");
    expect((evaluated as FunctionType).parameters.length).toBe(1);
    expect((evaluated as FunctionType).parameters[0].string()).toBe("x");
    expect((evaluated as FunctionType).body.string()).toBe("(x + 2)");
});

test("Function Application", () => {
    const tests: Array<[string, number]> = [
        ["let identity = fn(x) { x; }; identity(5);", 5],
        ["let identity = fn(x) { return x; }; identity(5);", 5],
        ["let double = fn(x) { x * 2; }; double(5);", 10],
        ["let add = fn(x, y) { x + y; }; add(5, 5);", 10],
        ["let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));", 20],
        ["fn(x) { x; }(5)", 5],
    ];

    for (const [input, expected] of tests) {
        testIntegerObject(testEvaluation(input), expected);
    }
});

test("Closures", () => {
    const input = `
        let newAdder = fn(x) {
            fn(y) { x + y };
        };

        let addTwo = newAdder(2);
        addTwo(2);
    `;

    testIntegerObject(testEvaluation(input), 4);
});

test("String Literal", () => {
    const input = "\"Hello World!\"";

    const evaluated = testEvaluation(input);
    expect(evaluated.Type()).toBe("STRING");
    expect(evaluated.Inspect()).toBe("Hello World!");
});

test("String Concatenation", () => {
    const input = "\"Hello\" + \" \" + \"World!\"";

    const evaluated = testEvaluation(input);
    expect(evaluated.Type()).toBe("STRING");
    expect(evaluated.Inspect()).toBe("Hello World!");
});
