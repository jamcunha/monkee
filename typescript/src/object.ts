const enum ObjectType {
    INTEGER_OBJ         = 'INTEGER',
    BOOLEAN_OBJ         = 'BOOLEAN',
    NULL_OBJ            = 'NULL',
    RETURN_VALUE_OBJ    = 'RETURN_VALUE',
    ERROR_OBJ           = 'ERROR',
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
        return 'null';
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

export type Object = IntegerType | BooleanType | NullType | ReturnValue | ErrorType;
