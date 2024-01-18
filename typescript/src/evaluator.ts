import { AstNode, BlockStatement, BooleanLiteral, ExpressionStatement, IfExpression, InfixExpression, IntegerLiteral, PrefixExpression, Program, ReturnStatement } from './ast';
import { IntegerType, BooleanType, Object, NullType, ReturnValue, ErrorType } from './object';

const TRUE = new BooleanType(true);
const FALSE = new BooleanType(false);
const NULL = new NullType();

export function evaluate(node: AstNode): Object {
    switch (node.constructor.name) {
        case 'Program':
            return evaluateProgram((node as Program).statements);
        case 'ExpressionStatement':
            return evaluate((node as ExpressionStatement).expression!);
        case 'PrefixExpression':
            let pright = evaluate((node as PrefixExpression).right!);
            if (pright?.Type() === 'ERROR') {
                return pright;
            }

            return evaluatePrefixExpression((node as PrefixExpression).operator, pright!);
        case 'InfixExpression':
            const ileft = evaluate((node as InfixExpression).left);
            if (ileft?.Type() === 'ERROR') {
                return ileft;
            }

            const iright = evaluate((node as InfixExpression).right!);
            if (iright?.Type() === 'ERROR') {
                return iright;
            }

            return evaluateInfixExpression((node as PrefixExpression).operator, ileft!, iright!);
        case 'BlockStatement':
            return evaluateBlockStatement((node as BlockStatement));
        case 'IfExpression':
            return evaluateIfExpression((node as IfExpression));
        case 'ReturnStatement':
            const val = evaluate((node as ReturnStatement).returnValue!);
            if (val?.Type() === 'ERROR') {
                return val;
            }

            return new ReturnValue(val!);
        case 'IntegerLiteral':
            return new IntegerType((node as IntegerLiteral).value);
        case 'BooleanLiteral':
            return nativeBoolToBooleanObject((node as BooleanLiteral).value);
        default:
            return NULL;
    }
}

function evaluateProgram(statements: AstNode[]): Object {
    let result: Object = new NullType();

    for (const statement of statements) {
        result = evaluate(statement);

        switch (result?.Type()) {
            case 'RETURN_VALUE':
                return (result as ReturnValue).value;
            case 'ERROR':
                return result;
        }
    }

    return result;
}

function nativeBoolToBooleanObject(node: boolean): BooleanType {
    return node ? TRUE : FALSE;
}

function evaluatePrefixExpression(operator: string, right: Object): Object {
    switch (operator) {
        case '!':
            return evaluateBangOperatorExpression(right);
        case '-':
            return evaluateMinusPrefixOperatorExpression(right);
        default:
            return NULL;
    }
}

function evaluateBangOperatorExpression(right: Object): Object {
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
function evaluateMinusPrefixOperatorExpression(right: Object): Object {
    if (right.Type() !== 'INTEGER') {
        return new ErrorType(`unknown operator: -${right.Type()}`);
    }

    const value = (right as IntegerType).value;
    return new IntegerType(-value);
}

function evaluateInfixExpression(operator: string, left: Object, right: Object): Object {
    if (left.Type() === 'INTEGER' && right.Type() === 'INTEGER') {
        return evaluateIntegerInfixExpression(operator, left, right);
    }

    if (operator === '==') {
        return nativeBoolToBooleanObject(left === right);
    } else if (operator === '!=') {
        return nativeBoolToBooleanObject(left !== right);
    } else if (left.Type() !== right.Type()) {
        return new ErrorType(`type mismatch: ${left.Type()} ${operator} ${right.Type()}`);
    } else {
        return new ErrorType(`unknown operator: ${left.Type()} ${operator} ${right.Type()}`);
    }
}

function evaluateIntegerInfixExpression(operator: string, left: Object, right: Object): Object {
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
            return new ErrorType(`unknown operator: ${left.Type()} ${operator} ${right.Type()}`);
    }
}

function evaluateIfExpression(exp: IfExpression): Object {
    const condition = evaluate(exp.condition!);

    if (condition?.Type() === 'ERROR') {
        return condition;
    }

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

function evaluateBlockStatement(block: BlockStatement): Object {
    let result: Object = new NullType();

    for (const statement of block.statements) {
        result = evaluate(statement);

        if (result !== null && (result.Type() === 'RETURN_VALUE' || result.Type() === 'ERROR')) {
            return result;
        }
    }

    return result;
}
