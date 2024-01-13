import { Identifier, LetStatement, Program } from "./ast";
import { tokenType } from "./lexer";

test("test string()", () => {
    const program = new Program();
    const letStmt = new LetStatement({ type: tokenType.LET, literal: "let" });
    letStmt.name = new Identifier({ type: tokenType.IDENT, literal: "myVar" });
    letStmt.value = new Identifier({ type: tokenType.IDENT, literal: "anotherVar" });
    program.statements.push(letStmt);

    expect(program.string()).toBe("let myVar = anotherVar;");
});
