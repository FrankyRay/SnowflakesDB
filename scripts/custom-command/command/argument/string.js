import { EntityTypes } from "@minecraft/server";
import { EffectTypes, EnchantmentTypes, ItemTypes, MinecraftBlockTypes, } from "@minecraft/server";
import CommandException from "../command_exception";
class StringArgument {
    constructor() {
        this.stringTypeFunction = {
            none: this.noneStringType,
            enum: this.enumStringType,
            block: this.blockStringType,
            item: this.itemStringType,
            effect: this.effectStringType,
            enchantment: this.enchantmentStringType,
        };
    }
    validate(value, data, player) {
        const stringType = data.options?.stringType ?? "none";
        // @ts-ignore
        const validValue = this.stringTypeFunction[stringType](value, data, player);
        return validValue;
    }
    noneStringType(value, data, player) {
        if (value.startsWith('"') && value.endsWith('"'))
            value = value.slice(1, -1);
        // Check: String Length
        const length = data.options?.stringLength;
        if (value.length < (length?.min ?? 0))
            throw new CommandException(`Value is too short (Min length is ${length?.min ?? 0}) [@${data.name}]`, player);
        if (value.length > (length?.max ?? Infinity))
            throw new CommandException(`Value is too long (Max length is ${length?.max}) [@${data.name}]`, player);
        return value;
    }
    enumStringType(value, data, player) {
        // Check: Value included + Case sensitive
        const enumVal = data.options?.enumeration.values;
        const enumCase = data.options?.enumeration.caseSensitive ?? false;
        if ((!enumCase &&
            !enumVal?.map((v) => v.toLowerCase()).includes(value.toLowerCase())) ||
            (enumCase && !enumVal?.includes(value)))
            throw new CommandException(`Value didn't match with any enumeration [@${data.name}]`, player);
        return value;
    }
    blockStringType(value, data, player) {
        if (!MinecraftBlockTypes.get(value))
            throw new CommandException(`Unknown block type '${value}' [@${data.name}]`, player, "commands.give.block.notFound", [value]);
        return value;
    }
    itemStringType(value, data, player) {
        if (!ItemTypes.get(value))
            throw new CommandException(`Unknown item type '${value}' [@${data.name}]`, player, "commands.give.item.notFound", [value]);
        return value;
    }
    entityStringType(value, data, player) {
        if (!EntityTypes.get(value))
            throw new CommandException(`Unknown entity type '${value}' [@${data.name}]`, player, "commands.generic.entity.invalidType", [value]);
        return value;
    }
    effectStringType(value, data, player) {
        if (!EffectTypes.get(value))
            throw new CommandException(`Invalid effect '${value}' [@${data.name}]`, player, "command.effect.notFound", [value]);
        return value;
    }
    enchantmentStringType(value, data, player) {
        if (!EnchantmentTypes.get(value))
            throw new CommandException(`Invalid enchantment '${value}' [@${data.name}]`, player, "command.enchant.notFound", [value]);
        return value;
    }
}
export default new StringArgument();
