import { EffectTypes, EnchantmentTypes, ItemTypes, MinecraftBlockTypes, } from "@minecraft/server";
import CommandException from "../exception";
class StringArgumentType {
    constructor() {
        this.errorType = {
            block: "commands.give.block.notFound",
            effect: "commands.effect.notFound",
            enchant: "commands.enchant.notFound",
            item: "commands.give.item.notFound",
        };
    }
    parse(value, data, player) {
        const stringType = data.options?.type ?? "none";
        // Validation
        if (stringType !== "none" && !this[`${stringType}Type`](value))
            throw new CommandException(`Value "${value}" is not valid ${stringType} type`, player, this.errorType[stringType], [value]);
        // Delete quotes from value
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, 1);
        }
        return value;
    }
    blockType(value) {
        return !!MinecraftBlockTypes.get(value);
    }
    itemType(value) {
        return !!ItemTypes.get(value);
    }
    effectType(value) {
        return !!EffectTypes.get(value);
    }
    enchantmentType(value) {
        return !!EnchantmentTypes.get(value);
    }
}
export default new StringArgumentType();
