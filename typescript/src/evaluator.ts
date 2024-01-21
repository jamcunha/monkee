import { ArrayLiteral, AstNode, BlockStatement, BooleanLiteral, CallExpression, Expression, ExpressionStatement, FunctionLiteral, Identifier, IfExpression, IndexExpression, InfixExpression, IntegerLiteral, LetStatement, PrefixExpression, Program, ReturnStatement, StringLiteral } from "./ast";
import { Environment } from "./environment";
import { IntegerType, BooleanType, Object, NullType, ReturnValue, ErrorType, FunctionType, StringType, BuiltInType, ArrayType } from "./object";

const TRUE = new BooleanType(true);
const FALSE = new BooleanType(false);
const NULL = new NullType();

const builtins: Map<string, BuiltInType> = new Map([
    [
        "len",
        new BuiltInType((...args: Object[]) => {
            if (args.length !== 1) {
                return new ErrorType(`wrong number of arguments. got=${args.length}, want=1`);
            }

            if (args[0].Type() === "STRING") {
                return new IntegerType((args[0] as StringType).value.length);
            }

            return new ErrorType(`argument to 'len' not supported, got ${args[0].Type()}`);
        }),
    ],
]);

export function evaluate(node: AstNode, env: Environment): Object {
    switch (node.constructor.name) {
        case "Program":
            return evaluateProgram((node as Program).statements, env);
        case "ExpressionStatement":
            return evaluate((node as ExpressionStatement).expression!, env);
        case "PrefixExpression":
            let pright = evaluate((node as PrefixExpression).right!, env);
            if (pright.Type() === "ERROR") {
                return pright;
            }

            return evaluatePrefixExpression((node as PrefixExpression).operator, pright!);
        case "InfixExpression":
            const ileft = evaluate((node as InfixExpression).left, env);
            if (ileft.Type() === "ERROR") {
                return ileft;
            }

            const iright = evaluate((node as InfixExpression).right!, env);
            if (iright.Type() === "ERROR") {
                return iright;
            }

            return evaluateInfixExpression((node as PrefixExpression).operator, ileft!, iright!);
        case "BlockStatement":
            return evaluateBlockStatement((node as BlockStatement), env);
        case "IfExpression":
            return evaluateIfExpression((node as IfExpression), env);
        case "LetStatement":
            const letVal = evaluate((node as LetStatement).value!, env);
            if (letVal.Type() === "ERROR") {
                return letVal;
            }

            return env.set((node as LetStatement).name!.value, letVal!);
        case "ReturnStatement":
            const retVal = evaluate((node as ReturnStatement).returnValue!, env);
            if (retVal.Type() === "ERROR") {
                return retVal;
            }

            return new ReturnValue(retVal!);
        case "FunctionLiteral":
            const params = (node as FunctionLiteral).parameters;
            const body = (node as FunctionLiteral).body!;
            return new FunctionType(params, body, env);
        case "CallExpression":
            const func = evaluate((node as CallExpression).function!, env);
            if (func.Type() === "ERROR") {
                return func;
            }

            const args = evaluateExpressions((node as CallExpression).arguments, env);
            if (args.length === 1 && args[0].Type() === "ERROR") {
                return args[0];
            }

            return applyFunction(func, args);
        case "IntegerLiteral":
            return new IntegerType((node as IntegerLiteral).value);
        case "BooleanLiteral":
            return nativeBoolToBooleanObject((node as BooleanLiteral).value);
        case "StringLiteral":
            return new StringType((node as StringLiteral).value);
        case "ArrayLiteral":
            const elements = evaluateExpressions((node as ArrayLiteral).elements, env);
            if (elements.length === 1 && elements[0].Type() === "ERROR") {
                return elements[0];
            }

            return new ArrayType(elements);
        case "IndexExpression":
            const left = evaluate((node as IndexExpression).left, env);
            if (left.Type() === "ERROR") {
                return left;
            }

            const index = evaluate((node as IndexExpression).index!, env);
            if (index.Type() === "ERROR") {
                return index;
            }

            return evaluateIndexExpression(left!, index!);
        case "Identifier":
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
            case "RETURN_VALUE":
                return (result as ReturnValue).value;
            case "ERROR":
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
        case "!":
            return evaluateBangOperatorExpression(right);
        case "-":
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
    if (right.Type() !== "INTEGER") {
        return new ErrorType(`unknown operator: -${right.Type()}`);
    }

    const value = (right as IntegerType).value;
    return new IntegerType(-value);
}

function evaluateInfixExpression(operator: string, left: Object, right: Object): Object {
    if (left.Type() === "INTEGER" && right.Type() === "INTEGER") {
        return evaluateIntegerInfixExpression(operator, left, right);
    } else if (left.Type() === "STRING" && right.Type() === "STRING") {
        return evaluateStringInfixExpression(operator, left, right);
    }

    if (operator === "==") {
        return nativeBoolToBooleanObject(left === right);
    } else if (operator === "!=") {
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
        case "+":
            return new IntegerType(leftVal + rightVal);
        case "-":
            return new IntegerType(leftVal - rightVal);
        case "*":
            return new IntegerType(leftVal * rightVal);
        case "/":
            return new IntegerType(leftVal / rightVal);
        case "<":
            return nativeBoolToBooleanObject(leftVal < rightVal);
        case ">":
            return nativeBoolToBooleanObject(leftVal > rightVal);
        case "==":
            return nativeBoolToBooleanObject(leftVal === rightVal);
        case "!=":
            return nativeBoolToBooleanObject(leftVal !== rightVal);
        default:
            return new ErrorType(`unknown operator: ${left.Type()} ${operator} ${right.Type()}`);
    }
}

function evaluateStringInfixExpression(operator: string, left: Object, right: Object): Object {
    if (operator !== "+") {
        return new ErrorType(`unknown operator: ${left.Type()} ${operator} ${right.Type()}`);
    }

    const leftVal = (left as StringType).value;
    const rightVal = (right as StringType).value;

    return new StringType(leftVal + rightVal);
}

function evaluateIfExpression(exp: IfExpression, env: Environment): Object {
    const condition = evaluate(exp.condition!, env);

    if (condition?.Type() === "ERROR") {
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

        if (result !== null && (result.Type() === "RETURN_VALUE" || result.Type() === "ERROR")) {
            return result;
        }
    }

    return result;
}

function evalutateIdentifier(node: Identifier, env: Environment): Object {
    const val = env.get(node.value);

    if (val !== null) {
        return val;
    }

    if (builtins.has(node.value)) {
        return builtins.get(node.value)!;
    }

    return new ErrorType(`identifier not found: ${node.value}`);

}

function evaluateExpressions(exps: Expression[], env: Environment): Object[] {
    const result: Object[] = [];

    for (const exp of exps) {
        const evaluated = evaluate(exp, env);
        if (evaluated.Type() === "ERROR") {
            return [evaluated];
        }

        result.push(evaluated);
    }

    return result;
}

function evaluateIndexExpression(left: Object, index: Object): Object {
    if (left.Type() === "ARRAY" && index.Type() === "INTEGER") {
        return evaluteArrayIndexExpression(left, index);
    }

    return new ErrorType(`index operator not supported: ${left.Type()}`);
}

function evaluteArrayIndexExpression(array: Object, index: Object): Object {
    const arrayObject = array as ArrayType;
    const idx = (index as IntegerType).value;
    const max = arrayObject.elements.length - 1;

    if (idx < 0 || idx > max) {
        return NULL;
    }

    return arrayObject.elements[idx];
}

function applyFunction(fn: Object, args: Object[]): Object {
    if (fn.Type() !== "FUNCTION" && fn.Type() !== "BUILTIN") {
        return new ErrorType(`not a function: ${fn.Type()}`);
    }

    switch (fn.constructor.name) {
        case "FunctionType":
            const extendedEnv = extendFunctionEnv((fn as FunctionType), args);
            const evaluated = evaluate((fn as FunctionType).body, extendedEnv);
            return unwrapReturnValue(evaluated);
        case "BuiltInType":
            return (fn as BuiltInType).fn(...args);
        default:
            return new ErrorType(`not a function: ${fn.Type()}`);
    }
}

function extendFunctionEnv(fn: FunctionType, args: Object[]): Environment {
    const env = fn.env.enclosedEnv();

    for (let i = 0; i < fn.parameters.length; i++) {
        env.set(fn.parameters[i].value, args[i]);
    }

    return env;
}

function unwrapReturnValue(obj: Object): Object {
    if (obj.Type() === "RETURN_VALUE") {
        return (obj as ReturnValue).value;
    }

    return obj;
}
