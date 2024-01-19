import { Object } from "./object";

export class Environment {
    constructor(public store: Map<string, Object> = new Map()) {}

    public get(name: string): Object | null {
        const obj = this.store.get(name);
        if (obj === undefined) {
            return null;
        }

        return obj;
    }

    public set(name: string, val: Object): Object {
        this.store.set(name, val);
        return val;
    }
}
