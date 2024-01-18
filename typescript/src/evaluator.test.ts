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

test("Evaluate Integer Expression", () => {
    const tests = [
        ["5", 5],
        ["10", 10],
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
    ]

    for (const [input, expected] of tests) {
        const evaluated = testEval(input as string);
        testBooleanObject(evaluated!, expected as boolean);
    }
});
