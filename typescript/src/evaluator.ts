import { AstNode, BlockStatement, BooleanLiteral, ExpressionStatement, IfExpression, InfixExpression, IntegerLiteral, PrefixExpression, Program } from './ast';
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
        case 'PrefixExpression':
            let pright = evaluate((node as PrefixExpression).right!);
            return evaluatePrefixExpression((node as PrefixExpression).operator, pright!);
        case 'InfixExpression':
            const ileft = evaluate((node as InfixExpression).left);
            const iright = evaluate((node as InfixExpression).right!);
            return evaluateInfixExpression((node as PrefixExpression).operator, ileft!, iright!);
        case 'BlockStatement':
            return evaluateStatements((node as BlockStatement).statements);
        case 'IfExpression':
            return evaluateIfExpression((node as IfExpression));
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

function evaluatePrefixExpression(operator: string, right: Object): Object | null {
    switch (operator) {
        case '!':
            return evaluateBangOperatorExpression(right);
        case '-':
            return evaluateMinusPrefixOperatorExpression(right);
        default:
            return null;
    }
}

function evaluateBangOperatorExpression(right: Object): Object | null {
    switch (right) {
        case TRUE:
            return FALSE;
        case FALSE:
            return TRUE;
        case NULL:
            return TRUE;
        default:
            return FALSE;
    }
}
function evaluateMinusPrefixOperatorExpression(right: Object): Object | null {
    if (right.Type() !== 'INTEGER') {
        return null;
    }

    const value = (right as IntegerType).value;
    return new IntegerType(-value);
}

function evaluateInfixExpression(operator: string, left: Object, right: Object): Object | null {
    if (left.Type() === 'INTEGER' && right.Type() === 'INTEGER') {
        return evaluateIntegerInfixExpression(operator, left, right);
    }

    switch (operator) {
        case '==':
            return nativeBoolToBooleanObject(left === right);
        case '!=':
            return nativeBoolToBooleanObject(left !== right);
        default:
            return null;
    }
}

function evaluateIntegerInfixExpression(operator: string, left: Object, right: Object): Object | null {
    const leftVal = (left as IntegerType).value;
    const rightVal = (right as IntegerType).value;

    switch (operator) {
        case '+':
            return new IntegerType(leftVal + rightVal);
        case '-':
            return new IntegerType(leftVal - rightVal);
        case '*':
            return new IntegerType(leftVal * rightVal);
        case '/':
            return new IntegerType(leftVal / rightVal);
        case '<':
            return nativeBoolToBooleanObject(leftVal < rightVal);
        case '>':
            return nativeBoolToBooleanObject(leftVal > rightVal);
        case '==':
            return nativeBoolToBooleanObject(leftVal === rightVal);
        case '!=':
            return nativeBoolToBooleanObject(leftVal !== rightVal);
        default:
            return null;
    }
}

function evaluateIfExpression(exp: IfExpression): Object | null {
    const condition = evaluate(exp.condition!);

    if (isTruthy(condition!)) {
        return evaluate(exp.consequence!);
    } else if (exp.alternative) {
        return evaluate(exp.alternative);
    } else {
        return NULL;
    }
}

function isTruthy(obj: Object): boolean {
    switch (obj) {
        case NULL:
            return false;
        case TRUE:
            return true;
        case FALSE:
            return false;
        default:
            return true;
    }
}
