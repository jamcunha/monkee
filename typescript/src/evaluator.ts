import { AstNode, BooleanLiteral, ExpressionStatement, IntegerLiteral, Program } from './ast';
import { IntegerType, BooleanType, Object, NullType } from './object';

const TRUE = new BooleanType(true);
const FALSE = new BooleanType(false);
const NULL = new NullType();

export function evaluate(node: AstNode): Object | null {
    switch (node.constructor.name) {
        case 'Program':
            return evaluateStatements((node as Program).statements);
        case 'ExpressionStatement':
            return evaluate((node as ExpressionStatement).expression!);
        case 'IntegerLiteral':
            return new IntegerType((node as IntegerLiteral).value);
        case 'BooleanLiteral':
            return nativeBoolToBooleanObject((node as BooleanLiteral).value);
        default:
            return null;
    }
}

function evaluateStatements(statements: AstNode[]): Object | null {
    let result: Object | null = null;

    for (const statement of statements) {
        result = evaluate(statement);
    }

    return result;
}

function nativeBoolToBooleanObject(node: boolean): BooleanType {
    return node ? TRUE : FALSE;
}
