import CommandException from "../exception";
class NumberArgumentType {
    parse(value, data, player) {
        const floatType = data.options?.floatType ?? true;
        const minValue = data.options?.range?.min ?? -Infinity;
        const maxValue = data.options?.range?.max ?? Infinity;
        const number = Number(value);
        // Validation
        if (isNaN(number))
            throw new CommandException(`Invalid number`, player, "commands.generic.num.invalid", [value]);
        //! ERROR: Value type is float instead of integer.
        if (!floatType && number !== Math.round(number)) {
            throw new CommandException(`Argument ${data.name} type is float instead of integer`, player);
        }
        //! ERROR: Value is too small.
        if (number < minValue) {
            throw new CommandException(`Argument ${data.name} value is too small (${number} < ${minValue})`, player, "commands.generic.num.tooSmall", [number, minValue]);
        }
        //! ERROR: Value is too big.
        if (number > maxValue) {
            throw new CommandException(`Argument ${data.name} value is too big (${number} > ${maxValue})`, player, "commands.generic.num.tooBig", [number, maxValue]);
        }
        return number;
    }
}
export default new NumberArgumentType();
