import { Lexer, Token, tokenType } from "./lexer";
import readline from "readline";

const PROMPT = ">> ";

export function startRepl(): void {
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
