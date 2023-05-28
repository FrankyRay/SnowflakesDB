import { EntityTypes, Player } from "@minecraft/server";
import {
  EffectTypes,
  EnchantmentTypes,
  ItemTypes,
  MinecraftBlockTypes,
  world,
} from "@minecraft/server";
import CommandException from "../command_exception";

export interface IStringArgument<T = IStringOption> {
  name: string;
  description?: string;
  type: "string";
  options?: T;
  default?: string;
}
type IStringOption = INoneString | IEnumString | IVanillaString;
// List of extended option interface
interface INoneString {
  stringType: "none";
  /** Specify allowed string length */
  stringLength?: {
    min?: number;
    max?: number;
  };
}
interface IEnumString {
  stringType: "enum";
  /** Enumeration config */
  enumeration: {
    /** List of enumeration value */
    values: string[];
    /** Whether the value is case-sensitive */
    caseSensitive?: boolean; // Optional, default: false
  };
}
interface IVanillaString {
  stringType: "block" | "item" | "effect" | "enchantment";
  /** Whether the value must be vanilla */
  vanillaOnly?: boolean;
}

class StringArgument {
  stringTypeFunction = {
    none: this.noneStringType,
    enum: this.enumStringType,
    block: this.blockStringType,
    item: this.itemStringType,
    effect: this.effectStringType,
    enchantment: this.enchantmentStringType,
  };

  validate(value: string, data: IStringArgument, player: Player) {
    const stringType = data.options?.stringType ?? "none";
    // @ts-ignore
    const validValue = this.stringTypeFunction[stringType](value, data, player);

    return validValue;
  }

  private noneStringType(
    value: string,
    data: IStringArgument<INoneString>,
    player: Player
  ) {
    if (value.startsWith('"') && value.endsWith('"'))
      value = value.slice(1, -1);

    // Check: String Length
    const length = data.options?.stringLength;
    if (value.length < (length?.min ?? 0))
      throw new CommandException(
        `Value is too short (Min length is ${length?.min ?? 0}) [@${
          data.name
        }]`,
        player
      );
    if (value.length > (length?.max ?? Infinity))
      throw new CommandException(
        `Value is too long (Max length is ${length?.max}) [@${data.name}]`,
        player
      );

    return value;
  }

  private enumStringType(
    value: string,
    data: IStringArgument<IEnumString>,
    player: Player
  ) {
    // Check: Value included + Case sensitive
    const enumVal = data.options?.enumeration.values;
    const enumCase = data.options?.enumeration.caseSensitive ?? false;
    if (
      (!enumCase &&
        !enumVal?.map((v) => v.toLowerCase()).includes(value.toLowerCase())) ||
      (enumCase && !enumVal?.includes(value))
    )
      throw new CommandException(
        `Value didn't match with any enumeration [@${data.name}]`,
        player
      );

    return value;
  }

  private blockStringType(
    value: string,
    data: IStringArgument<IVanillaString>,
    player: Player
  ) {
    if (!MinecraftBlockTypes.get(value))
      throw new CommandException(
        `Unknown block type '${value}' [@${data.name}]`,
        player,
        "commands.give.block.notFound",
        [value]
      );
    return value;
  }

  private itemStringType(
    value: string,
    data: IStringArgument<IVanillaString>,
    player: Player
  ) {
    if (!ItemTypes.get(value))
      throw new CommandException(
        `Unknown item type '${value}' [@${data.name}]`,
        player,
        "commands.give.item.notFound",
        [value]
      );
    return value;
  }

  private entityStringType(
    value: string,
    data: IStringArgument<IVanillaString>,
    player: Player
  ) {
    if (!EntityTypes.get(value))
      throw new CommandException(
        `Unknown entity type '${value}' [@${data.name}]`,
        player,
        "commands.generic.entity.invalidType",
        [value]
      );
    return value;
  }

  private effectStringType(
    value: string,
    data: IStringArgument<IVanillaString>,
    player: Player
  ) {
    if (!EffectTypes.get(value))
      throw new CommandException(
        `Invalid effect '${value}' [@${data.name}]`,
        player,
        "command.effect.notFound",
        [value]
      );
    return value;
  }

  private enchantmentStringType(
    value: string,
    data: IStringArgument<IVanillaString>,
    player: Player
  ) {
    if (!EnchantmentTypes.get(value))
      throw new CommandException(
        `Invalid enchantment '${value}' [@${data.name}]`,
        player,
        "command.enchant.notFound",
        [value]
      );
    return value;
  }
}

export default new StringArgument();
