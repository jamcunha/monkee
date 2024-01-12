import { Lexer, Token, tokenType } from "./lexer";

const PROMPT = ">> ";

export function startRepl(): void {
    const stdin = process.openStdin();
    process.stdout.write(PROMPT);

    stdin.addListener("data", (data) => {
        const lexer = new Lexer(data.toString());
        let token: Token;
        for (token = lexer.nextToken(); token.type !== tokenType.EOF; token = lexer.nextToken()) {
            console.log(token);
        }

        process.stdout.write(PROMPT);
    });
}
