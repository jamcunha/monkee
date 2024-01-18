import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Object } from "./object";
import { evaluate } from "./evaluator";

function testEval(input: string): Object | null {
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    return evaluate(program);
}

function testIntegerObject(obj: Object, expected: number): void {
    expect(obj).not.toBeNull();
    expect(obj.Type()).toBe("INTEGER");
    expect(obj.Inspect()).toBe(expected.toString());
}

function testBooleanObject(obj: Object, expected: boolean): void {
    expect(obj).not.toBeNull();
    expect(obj.Type()).toBe("BOOLEAN");
    expect(obj.Inspect()).toBe(expected.toString());
}

function testNullObject(obj: Object): void {
    expect(obj).not.toBeNull();
    expect(obj.Type()).toBe("NULL");
}

test("Evaluate Integer Expression", () => {
    const tests = [
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
        const evaluated = testEval(input as string);
        testIntegerObject(evaluated!, expected as number);
    }
});

test("Evaluate Boolean Expression", () => {
    const tests = [
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
        const evaluated = testEval(input as string);
        testBooleanObject(evaluated!, expected as boolean);
    }
});

test("Evaluate Bang Operator", () => {
    const tests = [
        ["!true", false],
        ["!false", true],
        ["!5", false],
        ["!!true", true],
        ["!!false", false],
        ["!!5", true],
    ];

    for (const [input, expected] of tests) {
        const evaluated = testEval(input as string);
        testBooleanObject(evaluated!, expected as boolean);
    }
});

test("Evaluate If Else Expression", () => {
    const tests = [
        ["if (true) { 10 }", 10],
        ["if (false) { 10 }", null],
        ["if (1) { 10 }", 10],
        ["if (1 < 2) { 10 }", 10],
        ["if (1 > 2) { 10 }", null],
        ["if (1 > 2) { 10 } else { 20 }", 20],
        ["if (1 < 2) { 10 } else { 20 }", 10],
    ];

    for (const [input, expected] of tests) {
        const evaluated = testEval(input as string);
        if (expected !== null) {
            testIntegerObject(evaluated!, expected as number);
        } else {
            testNullObject(evaluated!);
        }
    }
});

test("Evaluate Return Statement", () => {
    const tests = [
        ["return 10;", 10],
        ["return 10; 9;", 10],
        ["return 2 * 5; 9;", 10],
        ["9; return 2 * 5; 9;", 10],
        ["if (10 > 1) { if (10 > 1) { return 10; } return 1; }", 10],
    ]

    for (const [input, expected] of tests) {
        const evaluated = testEval(input as string);
        testIntegerObject(evaluated!, expected as number);
    }
});

test("Error Handling", () => {
    const tests = [
        ["5 + true;", "type mismatch: INTEGER + BOOLEAN"],
        ["5 + true; 5;", "type mismatch: INTEGER + BOOLEAN"],
        ["-true", "unknown operator: -BOOLEAN"],
        ["true + false;", "unknown operator: BOOLEAN + BOOLEAN"],
        ["5; true + false; 5", "unknown operator: BOOLEAN + BOOLEAN"],
        ["if (10 > 1) { true + false; }", "unknown operator: BOOLEAN + BOOLEAN"],
        ["if (10 > 1) { if (10 > 1) { return true + false; } return 1; }", "unknown operator: BOOLEAN + BOOLEAN"],
    ];

    for (const [input, expected] of tests) {
        const evaluated = testEval(input as string);
        expect(evaluated).not.toBeNull();
        expect(evaluated!.Type()).toBe("ERROR");
        expect(evaluated!.Inspect()).toBe(expected as string);
    }
});
