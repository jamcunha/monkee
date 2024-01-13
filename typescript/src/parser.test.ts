import { LetStatement } from './ast';
import { Lexer } from './lexer';
import { Parser } from './parser';

test("Test `let` statements", () => {
    const input = `
let x = 5;
let y = 10;
let foobar = 838383;
`;

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    expect(program).not.toBeUndefined();

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
