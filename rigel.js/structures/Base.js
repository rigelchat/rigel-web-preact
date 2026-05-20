import { flatten } from "../utils/Utils.js";

class Base {
    constructor(client) {
        Object.defineProperty(this, "client", { value: client });
    };

    _clone() {
        return Object.assign(Object.create(this), this);
    };

    _patch(data) {
        return data;
    };

    _update(data) {
        const clone = this._clone();
        this._patch(data);
        return clone;
    };

    toJSON(...props) {
        return flatten(this, ...props);
    };

    valueOf() {
        return this.id;
    };
};

export default Base;