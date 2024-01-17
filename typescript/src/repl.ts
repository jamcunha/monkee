import { Lexer, Token, tokenType } from "./lexer";
import readline from "readline";
import { Parser } from "./parser";

const PROMPT = ">> ";

// read-lex-print-loop (used to experiment with the lexer)
export function startRlpl(): void {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: PROMPT,
    });

    rl.prompt();

    rl.on("line", (line) => {
        const lexer = new Lexer(line);
        let tok: Token;
        do {
            tok = lexer.nextToken();
            console.log(tok);
        } while (tok.type !== tokenType.EOF);
        rl.prompt();
    }).on("close", () => {
        process.exit(0);
    });
}

function printParserErrors(errors: string[]): void {
    for (const msg of errors) {
        console.error(msg);
    }
}

// read-parse-print-loop (used to experiment with the parser)
export function startRppl(): void {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: PROMPT,
    });

    rl.prompt();

    rl.on("line", (line) => {
        const lexer = new Lexer(line);
        const parser = new Parser(lexer);

        const program = parser.parseProgram();
        if (parser.errors.length !== 0) {
            printParserErrors(parser.errors);
            return;
        }

        console.log(program.string());
        rl.prompt();
    }).on("close", () => {
        process.exit(0);
    });
}
