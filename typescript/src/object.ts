import { BlockStatement, Identifier } from "./ast";
import { Environment } from "./environment";

const enum ObjectType {
    INTEGER_OBJ         = "INTEGER",
    BOOLEAN_OBJ         = "BOOLEAN",
    NULL_OBJ            = "NULL",
    RETURN_VALUE_OBJ    = "RETURN_VALUE",
    ERROR_OBJ           = "ERROR",
    FUNCTION_OBJ        = "FUNCTION",
    STRING_OBJ          = "STRING",
    BUILTIN_OBJ         = "BUILTIN",
    ARRAY_OBJ           = "ARRAY",
}

export class IntegerType {
    constructor(public value: number) {}

    public Inspect(): string {
        return this.value.toString();
    }

    public Type(): ObjectType {
        return ObjectType.INTEGER_OBJ;
    }
}

export class BooleanType {
    constructor(public value: boolean) {}

    public Inspect(): string {
        return this.value.toString();
    }

    public Type(): ObjectType {
        return ObjectType.BOOLEAN_OBJ;
    }
}

export class NullType {
    public Inspect(): string {
        return "null";
    }

    public Type(): ObjectType {
        return ObjectType.NULL_OBJ;
    }
}

export class ReturnValue {
    constructor(public value: Object) {}

    public Inspect(): string {
        return this.value.Inspect();
    }

    public Type(): ObjectType {
        return ObjectType.RETURN_VALUE_OBJ;
    }
}

export class ErrorType {
    constructor(public message: string) {}

    public Inspect(): string {
        return this.message;
    }

    public Type(): ObjectType {
        return ObjectType.ERROR_OBJ;
    }
}

export class FunctionType {
    constructor(public parameters: Identifier[], public body: BlockStatement, public env: Environment) {}

    public Inspect(): string {
        const params: string[] = [];
        for (const param of this.parameters) {
            params.push(param.string());
        }

        return `fn(${params.join(", ")}) {\n${this.body.string()}\n}`;
    }

    public Type(): ObjectType {
        return ObjectType.FUNCTION_OBJ;
    }
}

export class StringType {
    constructor(public value: string) {}

    public Inspect(): string {
        return this.value;
    }

    public Type(): ObjectType {
        return ObjectType.STRING_OBJ;
    }
}

export class BuiltInType {
    constructor(public fn: (...args: Object[]) => Object) {}

    public Inspect(): string {
        return "builtin function";
    }

    public Type(): ObjectType {
        return ObjectType.BUILTIN_OBJ;
    }
}

export class ArrayType {
    constructor(public elements: Object[]) {}

    public Inspect(): string {
        const elements: string[] = [];
        for (const element of this.elements) {
            elements.push(element.Inspect());
        }

        return `[${elements.join(", ")}]`;
    }

    public Type(): ObjectType {
        return ObjectType.ARRAY_OBJ;
    }
}

export type Object =
    IntegerType
    | BooleanType
    | NullType
    | ReturnValue
    | ErrorType
    | FunctionType
    | StringType
    | BuiltInType
    | ArrayType;
