"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class State {
    constructor(stateLine) {
        const plitpoint = stateLine.indexOf("(");
        const name = stateLine.substring(0, plitpoint);
        const body = stateLine.substring(plitpoint);
        const tokens = body.slice(1, -1).split(",");
        this.tokens = tokens.map((str) => {
            const parsed = parseInt(str.trim(), 10);
            return parsed;
        });
        this.name = name;
        this.destinations = [];
    }
}
exports.default = State;
//# sourceMappingURL=State.js.map