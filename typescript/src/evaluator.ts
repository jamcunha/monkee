import { AstNode, BlockStatement, BooleanLiteral, CallExpression, Expression, ExpressionStatement, FunctionLiteral, Identifier, IfExpression, InfixExpression, IntegerLiteral, LetStatement, PrefixExpression, Program, ReturnStatement } from './ast';
import { Environment } from './environment';
import { IntegerType, BooleanType, Object, NullType, ReturnValue, ErrorType, FunctionType } from './object';

const TRUE = new BooleanType(true);
const FALSE = new BooleanType(false);
const NULL = new NullType();

export function evaluate(node: AstNode, env: Environment): Object {
    switch (node.constructor.name) {
        case 'Program':
            return evaluateProgram((node as Program).statements, env);
        case 'ExpressionStatement':
            return evaluate((node as ExpressionStatement).expression!, env);
        case 'PrefixExpression':
            let pright = evaluate((node as PrefixExpression).right!, env);
            if (pright.Type() === 'ERROR') {
                return pright;
            }

            return evaluatePrefixExpression((node as PrefixExpression).operator, pright!);
        case 'InfixExpression':
            const ileft = evaluate((node as InfixExpression).left, env);
            if (ileft.Type() === 'ERROR') {
                return ileft;
            }

            const iright = evaluate((node as InfixExpression).right!, env);
            if (iright.Type() === 'ERROR') {
                return iright;
            }

            return evaluateInfixExpression((node as PrefixExpression).operator, ileft!, iright!);
        case 'BlockStatement':
            return evaluateBlockStatement((node as BlockStatement), env);
        case 'IfExpression':
            return evaluateIfExpression((node as IfExpression), env);
        case 'LetStatement':
            const letVal = evaluate((node as LetStatement).value!, env);
            if (letVal.Type() === 'ERROR') {
                return letVal;
            }

            return env.set((node as LetStatement).name!.value, letVal!);
        case 'ReturnStatement':
            const retVal = evaluate((node as ReturnStatement).returnValue!, env);
            if (retVal.Type() === 'ERROR') {
                return retVal;
            }

            return new ReturnValue(retVal!);
        case 'FunctionLiteral':
            const params = (node as FunctionLiteral).parameters;
            const body = (node as FunctionLiteral).body!;
            return new FunctionType(params, body, env);
        case 'CallExpression':
            const func = evaluate((node as CallExpression).function!, env);
            if (func.Type() === 'ERROR') {
                return func;
            }

            const args = evaluateExpressions((node as CallExpression).arguments, env);
            if (args.length === 1 && args[0].Type() === 'ERROR') {
                return args[0];
            }

            return applyFunction(func, args);
        case 'IntegerLiteral':
            return new IntegerType((node as IntegerLiteral).value);
        case 'BooleanLiteral':
            return nativeBoolToBooleanObject((node as BooleanLiteral).value);
        case 'Identifier':
            return evalutateIdentifier((node as Identifier), env);
        default:
            return NULL;
    }
}

function evaluateProgram(statements: AstNode[], env: Environment): Object {
    let result: Object = new NullType();

    for (const statement of statements) {
        result = evaluate(statement, env);

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

function evaluateIfExpression(exp: IfExpression, env: Environment): Object {
    const condition = evaluate(exp.condition!, env);

    if (condition?.Type() === 'ERROR') {
        return condition;
    }

    if (isTruthy(condition!)) {
        return evaluate(exp.consequence!, env);
    } else if (exp.alternative) {
        return evaluate(exp.alternative, env);
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

function evaluateBlockStatement(block: BlockStatement, env: Environment): Object {
    let result: Object = new NullType();

    for (const statement of block.statements) {
        result = evaluate(statement, env);

        if (result !== null && (result.Type() === 'RETURN_VALUE' || result.Type() === 'ERROR')) {
            return result;
        }
    }

    return result;
}

function evalutateIdentifier(node: Identifier, env: Environment): Object {
    const val = env.get(node.value);

    if (val === null) {
        return new ErrorType(`identifier not found: ${node.value}`);
    }

    return val;
}

function evaluateExpressions(exps: Expression[], env: Environment): Object[] {
    const result: Object[] = [];

    for (const exp of exps) {
        const evaluated = evaluate(exp, env);
        if (evaluated.Type() === 'ERROR') {
            return [evaluated];
        }

        result.push(evaluated);
    }

    return result;
}

function applyFunction(fn: Object, args: Object[]): Object {
    if (fn.Type() !== 'FUNCTION') {
        return new ErrorType(`not a function: ${fn.Type()}`);
    }

    const fnObj = fn as FunctionType;

    const extendedEnv = extendFunctionEnv(fnObj, args);
    const evaluated = evaluate(fnObj.body, extendedEnv);

    return unwrapReturnValue(evaluated);
}

function extendFunctionEnv(fn: FunctionType, args: Object[]): Environment {
    const env = fn.env.enclosedEnv();

    for (let i = 0; i < fn.parameters.length; i++) {
        env.set(fn.parameters[i].value, args[i]);
    }

    return env;
}

function unwrapReturnValue(obj: Object): Object {
    if (obj.Type() === 'RETURN_VALUE') {
        return (obj as ReturnValue).value;
    }

    return obj;
}
