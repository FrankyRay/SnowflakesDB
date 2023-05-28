import CommandException from "../exception";
export default class StringArgumentType {
    constructor() {
        this.javaBoolean = ["0b", "1b"];
    }
    parse(value, data, player) {
        const javaType = data.options?.javaType ?? true;
        // Validation over Java boolean
        if (javaType)
            return this.javaType(value, player);
        if (!["false", "true"].includes(value))
            throw new CommandException("Invalid boolean type", player);
        return value === "true";
    }
    javaType(value, player) {
        if (!this.javaBoolean.includes(value))
            throw new CommandException("Invalid boolean", player);
        return !!this.javaBoolean.indexOf(value);
    }
}
