const enum ObjectType {
    INTEGER_OBJ = 'INTEGER',
    BOOLEAN_OBJ = 'BOOLEAN',
    NULL_OBJ = 'NULL',
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

export type Object = IntegerType | BooleanType | NullType;
