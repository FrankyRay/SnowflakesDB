import CommandException from "../command_exception";
class NumberArgument {
    validate(value, data, player) {
        const numberValue = Number(value);
        //! Invalid number value
        if (isNaN(numberValue))
            throw new CommandException(`Invalid number '${value}' [@${data.name}]`, player, "commands.generic.num.invalid", [value]);
        //! Integer-only number
        if (!(data.options?.floatType ?? true) &&
            value.includes("."))
            throw new CommandException(`Unsupported float number [@${data.name}]`, player);
        // Check: Number Range
        const range = data.options?.numberRange;
        if (numberValue < (range?.min ?? -Infinity))
            throw new CommandException(`Number is too small (${numberValue} < ${range?.min}) [@${data.name}]`, player, "commands.generic.num.tooSmall", [numberValue, range?.min]);
        if (numberValue > (range?.max ?? Infinity))
            throw new CommandException(`Number is too big (${numberValue} > ${range?.max}) [@${data.name}]`, player, "commands.generic.num.tooBig", [numberValue, range?.max]);
        return numberValue;
    }
}
export default new NumberArgument();
