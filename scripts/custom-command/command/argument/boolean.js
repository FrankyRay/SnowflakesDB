import CommandException from "../command_exception";
class BooleanArgument {
    constructor() {
        this.booleanValue = ["false", "true"];
    }
    validate(value, data, player) {
        if (!this.booleanValue.includes(value))
            throw new CommandException(`Invalid boolean [@${data.name}]`, player, "commands.generic.boolean.invalid", [value]);
        return value === "true";
    }
}
export default new BooleanArgument();
