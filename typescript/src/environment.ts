import { Object } from "./object";

export class Environment {
    constructor(
        public store: Map<string, Object> = new Map(),
        public outer: Environment | null = null
    ) {}

    public get(name: string): Object | null {
        let obj = this.store.get(name);
        if (obj === undefined && this.outer !== null) {
            obj = this.outer.store.get(name);
        }

        return obj === undefined ? null : obj;
    }

    public set(name: string, val: Object): Object {
        this.store.set(name, val);
        return val;
    }

    public enclosedEnv(): Environment {
        return new Environment(new Map(), this);
    }
}
