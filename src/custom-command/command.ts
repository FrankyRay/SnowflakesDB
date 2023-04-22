import {
  world,
  system,
  MinecraftBlockTypes,
  ItemTypes,
  Vector,
  MinecraftEffectTypes,
  GameMode,
  //* Used for docs and auto-completion
  Player,
  MessageSourceType,
  BlockType,
  ItemType,
  EffectType,
  EnchantmentType,
  PlayerIterator,
  EntityIterator,
  BlockAreaSize,
  Vector3,
  Vector2,
  EntityQueryOptions,
  RawMessage,
  Entity,
} from "@minecraft/server";
// import LocalCoordinate from "./LocalCoordinate";

interface CommandData {
  name: string;
  description?: string;
  operator?: boolean;
  aliases?: string[];
  arguments: CommandArgument[];
  callback: (player: Player, data: object) => void;
}

interface BaseCommandArgument {
  name: string;
  description: string;
  type: string;
  options?: object;
  default?: any;
}

interface StringCommandArgument extends BaseCommandArgument {
  type: "string";
  options?: {
    /** [TODO: Not implemented] Allow escape character functional. */
    escapeChar?: boolean;
    /** String length. */
    length?: {
      min?: number;
      max?: number;
    };
  };
  default?: string;
}

interface NumberCommandArgument extends BaseCommandArgument {
  type: "number";
  options?: {
    /** Allow float/decimal value. */
    floatType?: boolean;
    /** Value range. */
    range?: {
      min?: number;
      max?: number;
    };
    /** Return string instead of number. */
    stringify?: boolean;
  };
  default?: number;
}

interface BooleanCommandArgument extends BaseCommandArgument {
  type: "boolean";
  options?: {
    /** Return string instead of boolean. */
    stringify?: boolean;
  };
  default?: boolean;
}

interface ObjectCommandArgument extends BaseCommandArgument {
  type: "object";
  options?: {
    /** Return string instead of object. */
    stringify?: boolean;
  };
  default?: object;
}

interface BlockCommandArgument extends BaseCommandArgument {
  type: "block";
  options?: {
    /** Accept vanilla block only. */
    vanillaOnly?: boolean;
    /** Allow creative block to non-op player. */
    creativeMode?: boolean;
    /** Return block's ID instead of BlockType class. */
    stringify?: boolean;
  };
  default?: string;
}

interface ItemCommandArgument extends BaseCommandArgument {
  type: "item";
  options?: {
    /** Accept vanilla item only. */
    vanillaOnly?: boolean;
    /** Allow creative item to non-op player. */
    creativeMode?: boolean;
    /** Return item's ID instead of ItemType class. */
    stringify?: boolean;
  };
  default?: string;
}

interface LocationCommandArgument extends BaseCommandArgument {
  type: "location";
  options?: {
    /** Allow relative coordinate/tilde notation (~). */
    relativeValue?: boolean;
    /** Allow local coordinate/caret notation (^). */
    localValue?: boolean;
    /** Enable/disable coordinate axis. */
    coordinateAxis?: {
      x?: boolean;
      y?: boolean;
      z?: boolean;
    };
    /** Use zero as unspesified value. Otherwise, use player's current location. */
    zeroDefaultValue?: boolean;
    /** Type of data returned. */
    outputData?: "Vector3" | "Vector" | "string";
  };
  default?: Vector3;
}

interface RotationCommandArgument extends BaseCommandArgument {
  type: "rotation";
  options?: {
    /** Allow relative rotation (~). */
    relativeValue?: boolean;
    /** Return string instead of object. */
    stringify?: boolean;
  };
  default?: Vector2;
}

interface SelectorCommandArgument extends BaseCommandArgument {
  type: "selector";
  options?: {
    /** Allow only player can be target. */
    playerOnly: false;
    /** Limit only one target. */
    limitTarget: false;
    /** Added default target selector arguments/query. */
    defaultSelector: {};
    /** Overwrite command's target selector with default target selector. */
    overwrite: false;
    /**
     * Type of data returned.
     * ```yaml
     * Iterator: Returned as PlayerIterator/EntityIterator.
     * Query: Returned as EntityQueryOptions.
     * String: Returned as plain string.
     * ```
     */
    outputData: "Iterator";
  };
  default?: EntityQueryOptions;
}

interface OptionCommandArgument extends BaseCommandArgument {
  type: "option";
  choices?: {
    name: string;
    description: string;
    subargument?: CommandArgument[];
  }[];
  default?: EntityQueryOptions;
}

type CommandArgument =
  | StringCommandArgument
  | NumberCommandArgument
  | BooleanCommandArgument
  | ObjectCommandArgument
  | BlockCommandArgument
  | ItemCommandArgument
  | LocationCommandArgument
  | RotationCommandArgument
  | SelectorCommandArgument
  | OptionCommandArgument;

interface CommandResult {
  command: string;
  arguments: {
    [key: string]: any;
  };
}

class CustomCommand {
  // Custom command prefix.
  prefix = "\\";
  // Custom help command prefix.
  helpPrefix = "?";

  // Default command options.
  #commandOptions = {
    string: {
      // Allow escape character functional.
      // TODO: Not implemented.
      escapeChar: false,
      // String length.
      length: {
        min: 0,
        max: Infinity,
      },
    },

    number: {
      // Allow float/decimal value.
      floatType: true,
      // Value range.
      range: {
        min: -2147483648,
        max: 2147483647,
      },
      // Return string instead of number.
      stringify: false,
    },

    boolean: {
      // Return string instead of boolean.
      stringify: false,
    },

    object: {
      // Return string instead of object.
      stringify: false,
    },

    block: {
      // Accept vanilla block only.
      vanillaOnly: false,
      // Allow creative block to non-op player
      creativeMode: true,
      // Return block's ID instead of BlockType class.
      stringify: false,
    },

    item: {
      // Accept vanilla item only.
      vanillaOnly: false,
      // Allow creative item to non-op player
      creativeMode: true,
      // Return item's ID instead of ItemType class.
      stringify: false,
    },

    location: {
      // Allow relative coordinate/tilde notation (~0).
      relativeValue: true,
      // Allow local coordinate/caret notation (^0).
      localValue: true,
      // Enable/disable coordinate axis.
      coordinateAxis: {
        x: true,
        y: true,
        z: true,
      },
      // Use zero as unspesified value.
      // Otherwise, use player's current location.
      zeroDefaultValue: false,
      // Type of data returned.
      // "Vector3", "Vector", or "String".
      outputData: "Vector3",
    },

    rotation: {
      // Allow relative rotation (~).
      relativeValue: false,
      // Return string instead of object.
      stringify: false,
    },

    selector: {
      // Allow only player can be target.
      playerOnly: false,
      // Limit only one target.
      limitTarget: false,
      // Added default target selector arguments/query.
      defaultSelector: {},
      // Overwrite command's target selector with default target selector.
      overwrite: false,
      // Type of data returned.
      // "Iterator": Returned as PlayerIterator/EntityIterator.
      // "Query": Returned as EntityQueryOptions.
      // "String": Returned as plain string.
      outputData: "Iterator",
    },
  };

  // Command list
  #commandList = {
    ping: {
      name: "ping",
      description: "Say pong! (To check if the custom command is working)",
      arguments: [],
      callback: (player: Player, data: object) => {
        if (player instanceof Player)
          player.sendMessage(`Pong! (OP: ${player.isOp()})`);
        else world.sendMessage("Pong!");
        console.log("Pong! Custom command works properly");
      },
    },
  };

  // Argument type validation list
  #argumentType = {
    string: (v, a, p) => this.#stringArgumentType(v, a, p),
    number: (v, a, p) => this.#numberArgumentType(v, a, p),
    boolean: (v, a, p) => this.#booleanArgumentType(v, a, p),
    object: (v, a, p) => this.#objectArgumentType(v, a, p),
    block: (v, a, p) => this.#blockArgumentType(v, a, p),
    item: (v, a, p) => this.#itemArgumentType(v, a, p),
    effect: (v, a, p) => this.#effectArgumentType(v, a, p),
    enchantment: (v, a, p) => this.#enchantmentArgumentType(v, a, p),
    location: (v, a, p) => this.#locationArgumentType(v, a, p),
    rotation: (v, a, p) => this.#rotationArgumentType(v, a, p),
    option: (v, a, p) => this.#optionArgumentType(v, a, p),
  };

  constructor() {
    this.#chatEvent();
    this.#debugEvent();
  }

  //* Add command.
  /**
   * Adding custom command
   *
   * @param data
   * Command data
   */
  addCommand(data: CommandData) {
    this.#commandList[data.name] = data;
    console.log(
      `Successfully adding command "${data.name}" - "${data.description}"`
    );
  }

  //* Parsing command.
  /**
   * Parsing command into an array of command arguments
   * (Inspired by `FrostIce482#8139`)
   *
   * @param player
   * Player's class
   *
   * @param command
   * Raw command arguments
   *
   * @return Object of command arguments
   */
  #parseCommand(player: Player, command: string): object {
    const groups = {
      "{": "}",
      "[": "]",
      '"': '"',
    };

    let commandData = <CommandData>{},
      commandArgs = <CommandResult>{},
      argLocRot = {},
      argValue = "",
      argIndex = 0,
      closingArray = [],
      closingChar = "";

    //? Start parsing
    for (const char of command + " ") {
      if (char in groups && closingChar != '"') {
        closingArray.push(groups[char]);
        closingChar = groups[char];
      } else if (char == closingChar) {
        closingArray.pop();
        closingChar = closingArray[closingArray.length - 1];
      }
      if (char != " " || closingChar) {
        argValue += char;
        continue;
      }

      if (!argValue) continue;
      if (Object.keys(commandData).length === 0) {
        commandData =
          this.#commandList[argValue] ??
          this.#commandException(
            player,
            `Command ${argValue} is not found`,
            "commands.generic.unknown",
            [argValue]
          );

        if (commandData.operator && player instanceof Player && !player?.isOp())
          this.#commandException(
            player,
            `Player ${player.name} cannot use ${argValue} because not operator`,
            "commands.generic.unknown",
            [argValue]
          );

        commandArgs.command = argValue;
        commandArgs.arguments = {};
      } else if (argIndex >= commandData.arguments.length) {
        this.#commandException(player, "Too many argument provided");
      } else if (commandData.arguments[argIndex].type === "location") {
        const [isDone, data] = this.#locationCheck(
          argLocRot,
          argValue,
          commandData.arguments[argIndex]
        );

        argLocRot = data;
        argValue = "";
        if (!isDone) continue;
        argLocRot = {};

        commandArgs.arguments[commandData.arguments[argIndex].name] =
          this.#argumentType[commandData.arguments[argIndex].type](
            data,
            commandData.arguments[argIndex],
            player
          );
        argIndex++;
      } else if (commandData.arguments[argIndex].type === "rotation") {
        const [isDone, data] = this.#rotationCheck(
          argLocRot,
          argValue,
          commandData.arguments[argIndex]
        );

        argLocRot = data;
        argValue = "";
        if (!isDone) continue;
        argLocRot = {};

        commandArgs.arguments[commandData.arguments[argIndex].name] =
          this.#argumentType[commandData.arguments[argIndex].type](
            data,
            commandData.arguments[argIndex],
            player
          );
        argIndex++;
      } else if (commandData.arguments[argIndex].type === "option") {
        const [value, subArgument] = this.#optionArgumentType(
          argValue,
          commandData.arguments[argIndex],
          player
        );

        commandData.arguments.splice(argIndex, 0, ...subArgument);
        commandArgs.arguments[commandData.arguments[argIndex].name] = value;
        argIndex++;
      } else {
        commandArgs.arguments[commandData.arguments[argIndex].name] =
          this.#argumentType[commandData.arguments[argIndex].type](
            argValue,
            commandData.arguments[argIndex],
            player
          );
        argIndex++;
      }

      argValue = "";
      continue;
    }

    //? Insert the default value for the unspecified argument
    for (let i = argIndex; i < commandData.arguments.length; i++) {
      if (commandData.arguments[i].default === undefined)
        this.#commandException(
          player,
          `Missing argument ${commandData.arguments[i].name}`
        );

      commandArgs.arguments[commandData.arguments[i].name] =
        commandData.arguments[i].default;
    }
    return commandArgs;
  }

  /**
   * Constructs the value of the location type argument
   * @param {object} data
   * @param {string} value
   * @param {object} argument
   * @return {[boolean, object]}
   */
  #locationCheck(data, value, argument) {
    const axisX =
      argument.options?.coordinateAxis?.x ??
      this.#commandOptions.location.coordinateAxis.x;
    const axisY =
      argument.options?.coordinateAxis?.y ??
      this.#commandOptions.location.coordinateAxis.y;
    const axisZ =
      argument.options?.coordinateAxis?.z ??
      this.#commandOptions.location.coordinateAxis.z;
    const newData = { ...data };

    if (!data.x && axisX) {
      newData.x = value;
      if (!axisY && !axisZ) return [true, newData];
    } else if (!data.y && axisY) {
      newData.y = value;
      if (!axisZ) return [true, newData];
    } else if (!data.z && axisZ) {
      newData.z = value;
      return [true, newData];
    }

    return [false, newData];
  }

  /**
   * Constructs the value of the rotation type argument
   * @param {object} data
   * @param {string} value
   * @param {object} argument
   */
  #rotationCheck(data, value, argument) {
    const newData = { ...data };

    if (!data.x) {
      newData.x = value;
    } else if (!data.y) {
      newData.y = value;
      return [true, newData];
    }

    return [false, newData];
  }

  //* Argument type validation.
  /**
   * String argument type checker
   *
   * @param {string} value
   * Argument value
   *
   * @param {object} argument
   * Argument data
   *
   * @param {Player|MessageSourceType} player
   * Player class or MessageSourceType enum
   *
   * @return {string}
   */
  #stringArgumentType(value, argument, player) {
    const minLength =
      argument.options?.length?.min ?? this.#commandOptions.string.length.min;
    const maxLength =
      argument.options?.length?.max ?? this.#commandOptions.string.length.max;

    // Delete quotes from value.
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, 1);
    }

    //! ERROR: String length is too short.
    if (value.length < minLength) {
      this.#commandException(
        player,
        `Argument ${argument.name} is too short (${value.length} chars < ${minLength} chars)`
      );
    }

    //! ERROR: String length is too long.
    if (value.length > maxLength) {
      this.#commandException(
        player,
        `Argument ${argument.name} is too long (${value.length} chars > ${maxLength} chars)`
      );
    }

    return value;
  }

  /**
   * Number argument type checker
   *
   * @param {string} value
   * Argument value
   *
   * @param {object} argument
   * Argument data
   *
   * @param {Player|} player
   * Player class or MessageSourceType enum
   *
   * @return {number|string} Number (string if stringify == true)
   */
  #numberArgumentType(value, argument, player) {
    const isFloat =
      argument.options?.floatType ?? this.#commandOptions.number.floatType;
    const minValue =
      argument.options?.range?.min ?? this.#commandOptions.number.range.min;
    const maxValue =
      argument.options?.range?.max ?? this.#commandOptions.number.range.max;
    const stringify =
      argument.options?.stringify ?? this.#commandOptions.number.stringify;
    const number = Number(value);

    //! ERROR: Invalid number value.
    if (isNaN(number)) {
      this.#commandException(
        player,
        `Argument ${argument.name} has invalid number (${value})`,
        "commands.generic.num.invalid",
        [value]
      );
    }

    //! ERROR: Value type is float instead of integer.
    if (!isFloat && number !== Math.round(number)) {
      this.#commandException(
        player,
        `Argument ${argument.name} type is float instead of integer`
      );
    }

    //! ERROR: Value is too small.
    if (number < minValue) {
      this.#commandException(
        player,
        `Argument ${argument.name} value is too small (${number} < ${minValue})`,
        "commands.generic.num.tooSmall",
        [number, minValue]
      );
    }

    //! ERROR: Value is too big.
    if (number > maxValue) {
      this.#commandException(
        player,
        `Argument ${argument.name} value is too big (${number} > ${maxValue})`,
        "commands.generic.num.tooBig",
        [number, maxValue]
      );
    }

    return stringify ? "" + number : number;
  }

  /**
   * Boolean argument type checker
   *
   * @param {string} value
   * Argument value
   *
   * @param {object} argument
   * Argument data
   *
   * @param {Player|MessageSourceType} player
   * Player class or MessageSourceType enum
   *
   * @return {boolean|string} Boolean (string if stringify == true)
   */
  #booleanArgumentType(value, argument, player) {
    const stringify =
      argument.options?.stringify ?? this.#commandOptions.boolean.stringify;

    //! ERROR: Invalid boolean type.
    if (value !== "true" || value !== "false") {
      this.#commandException(
        player,
        `Argument ${argument.name} has invalid boolean type '${value}'`
      );
    }

    return stringify ? value : value === "true";
  }

  /**
   * Object argument type checker
   *
   * @param {string} value
   * Argument value
   *
   * @param {object} argument
   * Argument data
   *
   * @param {Player|MessageSourceType} player
   * Player class or MessageSourceType enum
   *
   * @return {object|string} Object (string if stringify == true)
   */
  #objectArgumentType(value, argument, player) {
    const stringify =
      argument.options?.stringify ?? this.#commandOptions.object.stringify;
    let object;
    console.log(value);

    try {
      object = JSON.parse(value);
    } catch (error) {
      this.#commandException(
        player,
        `Failed to parse the object at argument ${argument.name}`,
        "commands.tellraw.jsonStringException",
        []
      );
    }

    return stringify ? JSON.stringify(object) : object;
  }

  /**
   * Option argument type checker
   *
   * @param {string} value
   * Argument value
   *
   * @param {object} argument
   * Argument data
   *
   * @param {Player|MessageSourceType} player
   * Player class or MessageSourceType enum
   *
   * @return {object|string} Object (string if stringify == true)
   */
  #optionArgumentType(value, argument, player) {
    const choices = argument.choices;

    //! ERROR: Not a valid options
    if (!choices.map((choice) => choice.name).includes(value)) {
      this.#commandException(
        player,
        `Option "${value}" is not valid choices`,
        "commands.generic.parameter.invalid",
        [value]
      );
    }

    const subArgument =
      choices.find((choice) => choice.name === value).subargument ?? [];
    return [value, subArgument];
  }

  /**
   * Block argument type checker
   *
   * @param {string} value
   * Argument value
   *
   * @param {object} argument
   * Argument data
   *
   * @param {Player|MessageSourceType} player
   * Player class or MessageSourceType enum
   *
   * @return {BlockType|string} BlockType (block id if stringify == true)
   */
  #blockArgumentType(value, argument, player) {
    const vanillaOnly =
      argument.options?.vanillaOnly ?? this.#commandOptions.block.vanillaOnly;
    const creativeMode =
      argument.options?.creativeMode ?? this.#commandOptions.block.creativeMode;
    const stringify =
      argument.options?.stringify ?? this.#commandOptions.block.stringify;
    const block = MinecraftBlockTypes.get(value);

    //! ERROR: Block is not found.
    if (!block) {
      this.#commandException(
        player,
        `Block '${value}' is not found`,
        "commands.give.block.notFound",
        [value]
      );
    }

    //! ERROR: Block must be vanilla.
    if (
      value.includes(":") &&
      value.substring(0, value.indexOf(":")) !== "minecraft"
    ) {
      this.#commandException(player, `Block must be vanilla`);
    }

    //! ERROR: Creative block to non-op player.
    // TODO: Not implemented.
    // if (
    //   creativeBlock.includes(value.replace("minecraft:", "")) &&
    //   !player.isOp()
    // ) {
    //   this.#commandException(
    //     player,
    //     `You have no permission to use block '${value}'`
    //   );
    // }

    return stringify ? block.id : block;
  }

  /**
   * Item argument type checker
   *
   * @param {string} value
   * Argument value
   *
   * @param {object} argument
   * Argument data
   *
   * @param {Player|MessageSourceType} player
   * Player class or MessageSourceType enum
   *
   * @return {ItemType|string} ItemType (item id if stringify == true)
   */
  #itemArgumentType(value, argument, player) {
    const vanillaOnly =
      argument.options?.vanillaOnly ?? this.#commandOptions.item.vanillaOnly;
    const creativeMode =
      argument.options?.creativeMode ?? this.#commandOptions.item.creativeMode;
    const stringify =
      argument.options?.stringify ?? this.#commandOptions.item.stringify;
    const item = ItemTypes.get(value);

    //! ERROR: Item is not found.
    if (!item) {
      this.#commandException(
        player,
        `Item '${value}' is not found`,
        "commands.give.item.notFound",
        [value]
      );
    }

    //! ERROR: Item must be vanilla.
    if (
      value.includes(":") &&
      value.substring(0, value.indexOf(":")) !== "minecraft"
    ) {
      this.#commandException(player, `Item must be vanilla`);
    }

    //! ERROR: Creative item to non-op player.
    // TODO: Not implemented.
    // if (
    //   creativeItem.includes(value.replace("minecraft:", "")) &&
    //   !player.isOp()
    // ) {
    //   this.#commandException(
    //     player,
    //     `You have no permission to use item '${value}'`
    //   );
    // }

    return stringify ? item.id : item;
  }

  /**
   * Effect argument type checker
   *
   * @param {string} value
   * Argument value
   *
   * @param {object} argument
   * Argument data
   *
   * @param {Player|MessageSourceType} player
   * Player class or MessageSourceType enum
   *
   * @return {EffectType|string} EffectType (effect id if stringify == true)
   */
  #effectArgumentType(value, argument, player) {
    const typeEffect = {
      absorbtion: "absorbtion",
      bad_omen: "badOmen",
      blindness: "blindness",
      conduit_power: "conduitPower",
      darkness: "darkness",
      dolphin_grace: "dolphinGrace",
      fatal_poison: "fatalPoison",
      fire_resistance: "fireResistance",
      haste: "haste",
      health_boost: "healthBoost",
      hunger: "hunger",
      instant_damage: "instantDamage",
      instant_health: "instantHealth",
      invisibility: "invisibility",
      jump_boost: "jumpBoost",
      levitation: "levitation",
      mining_fatigue: "miningFatigue",
      nausea: "nausea",
      night_vision: "nightVision",
      poison: "poison",
      regeneration: "regeneration",
      resistance: "resistance",
      saturation: "saturation",
      slow_falling: "slowFalling",
      slowness: "slowness",
      speed: "speed",
      strength: "strength",
      village_hero: "villageHero",
      water_breathing: "waterBreathing",
      weakness: "weakness",
      wither: "wither",
    };

    //! ERROR: Not a valid effect
    if (!Object.keys(typeEffect).includes(value.replace("minecraft:", ""))) {
      this.#commandException(
        player,
        `Argument ${argument.name} has invalid effect (${value})`,
        "commands.effect.notFound",
        [value]
      );
    }

    return MinecraftEffectTypes[typeEffect[value.replace("minecraft:", "")]];
  }

  /**
   * Enchantment argument type checker
   *
   * @param {string} value
   * Argument value
   *
   * @param {object} argument
   * Argument data
   *
   * @param {Player|MessageSourceType} player
   * Player class or MessageSourceType enum
   *
   * @return {EnchantmentType|string} EnchantmentType (enchantment id if stringify == true)
   */
  #enchantmentArgumentType(value, argument, player) {
    const typeEnchantment = {
      aqua_affinity: "aquaAffinity",
      bane_of_arthropoth: "baneOfArthropoth",
      blast_protection: "blastProtection",
      channeling: "channeling",
      curse_of_binding: "curseOfBinding",
      curse_of_vanishing: "curseOfVanishing",
      depth_strider: "depthStrider",
      efficiency: "efficiency",
      feather_falling: "featherFalling",
      fire_aspect: "fireAspect",
      flame: "flame",
      fortune: "fortune",
      frost_walker: "frostWalker",
      impaling: "impaling",
      infinity: "infinity",
      knockback: "knockback",
      looting: "looting",
      loyalty: "loyalty",
      luck_of_the_sea: "luckOfTheSea",
      lure: "lure",
      mending: "mending",
      multishot: "multishot",
      piercing: "piercing",
      power: "power",
      projectile_protection: "projectileProtection",
      protection: "protection",
      punch: "punch",
      quick_charge: "quickCharge",
      respiration: "respiration",
      riptide: "riptide",
      sharpness: "sharpness",
      silk_touch: "silkTouch",
      smite: "smite",
      soul_speed: "soulSpeed",
      swift_sneak: "swiftSneak",
      thorns: "thorns",
      unbreaking: "unbreaking",
    };

    //! ERROR: Not a valid enchantment
    if (
      !Object.keys(typeEnchantment).includes(value.replace("minecraft:", ""))
    ) {
      this.#commandException(
        player,
        `Argument ${argument.name} has invalid enchantment (${value})`,
        "commands.enchant.notFound",
        [value]
      );
    }

    return MinecraftEffectTypes[
      typeEnchantment[value.replace("minecraft:", "")]
    ];
  }

  /**
   * Location argument type checker
   *
   * @param {object} value
   * Argument value
   *
   * @param {object} argument
   * Argument data
   *
   * @param {Player|MessageSourceType} player
   * Player class or MessageSourceType enum
   *
   * @return {BlockLocation|Location|Vector|import("@minecraft/server").Vector3|string} One of those 3 location class or object (string if stringify == true)
   */
  #locationArgumentType(value, argument, player) {
    const relativeValue =
      argument.options?.relativeValue ??
      this.#commandOptions.location.relativeValue;
    const localValue =
      argument.options?.localValue ?? this.#commandOptions.location.localValue;
    const zeroDefaultValue =
      argument.options?.zeroDefaultValue ??
      this.#commandOptions.location.zeroDefaultValue;
    const outputData =
      argument.options?.outputData ?? this.#commandOptions.location.outputData;

    let rawLocation: Vector3;
    if (zeroDefaultValue) rawLocation = { x: 0, y: 0, z: 0 };
    else
      rawLocation =
        player.location ??
        this.#commandException(
          player,
          "Cannot get player's/entity's location. Use 'zeroDefaultValue' options or run the command from player",
          "commands.generic.exception",
          []
        );

    let local = false;
    if (
      value.x.startsWith("^") ||
      value.y.startsWith("^") ||
      value.z.startsWith("^")
    ) {
      if (localValue) {
        local = true;
        rawLocation = this.#localLocationCalc(value, argument, player);
      } else
        this.#commandException(
          player,
          `Argument ${argument.name} cannot use local coordinate`
        );
    }

    for (const axis of Object.keys(rawLocation)) {
      if (!value[axis]) continue;

      if (value[axis].startsWith("~")) {
        if (!relativeValue)
          this.#commandException(
            player,
            `Argument ${argument.name} cannot use relative coordinate`
          );
        rawLocation[axis] =
          player.location[axis] +
          Number(
            value[axis].substring(1) !== "" ? value[axis].substring(1) : 0
          );
      } else if (local) {
        continue;
      } else {
        rawLocation[axis] = Number(value[axis]);
      }
    }

    let newLocation: Vector3 | Vector;
    switch (outputData) {
      case "Vector":
        const loc = Object.values(rawLocation) as [number, number, number];
        newLocation = new Vector(...loc);
        break;
      default:
        newLocation = rawLocation;
    }

    return newLocation;
  }

  /**
   * Rotation argument type checker
   *
   * @param {object} value
   * Argument value
   *
   * @param {object} argument
   * Argument data
   *
   * @param {Player|MessageSourceType} player
   * Player class or MessageSourceType enum
   *
   * @return {object|string} Object (string if stringify == true)
   */
  #rotationArgumentType(value, argument, player) {
    const relativeValue =
      argument.options?.relativeValue ??
      this.#commandOptions.rotation.relativeValue;
    const stringify =
      argument.options?.stringify ?? this.#commandOptions.rotation.stringify;
    let newRotation = { x: 0, y: 0 };

    for (const axis of Object.keys(newRotation)) {
      if (!value[axis]) continue;

      if (value[axis].startsWith("~")) {
        if (!relativeValue)
          this.#commandException(
            player,
            `Argument ${argument.name} cannot use relative coordinate`
          );
        newRotation[axis] =
          player.rotation[axis] +
          Number(value.substring(1) !== "" ? value.substring(1) : 1);
      } else {
        newRotation[axis] = Number(value[axis]);
      }

      //! ERROR: Rotation out of range
      if (
        (axis === "x" &&
          (newRotation[axis] < -180 || newRotation[axis] > 180)) ||
        (axis === "y" && (newRotation[axis] < -90 || newRotation[axis] > 90))
      ) {
        this.#commandException(
          player,
          `Rotation out of range (${axis.toUpperCase()}: ${newRotation[axis]})`,
          "commands.generic.rotationError",
          []
        );
      }
    }

    return stringify ? Object.values(newRotation).join(" ") : newRotation;
  }

  /**
   * Rotation argument type checker
   *
   * @param {object} value
   * Argument value
   *
   * @param {object} argument
   * Argument data
   *
   * @param {Player|MessageSourceType} player
   * Player class or MessageSourceType enum
   *
   * @return {PlayerIterator|EntityIterator|import("@minecraft/server").EntityQueryOptions|string} Iterator/EntityQueryOptions (string if stringify == true)
   */
  // #selectorArgumentType(value, argument, player) {
  //   const playerOnly =
  //     argument.options?.playerOnly ?? this.#commandOptions.selector.playerOnly;
  //   const limitTarget =
  //     argument.options?.limitTarget ??
  //     this.#commandOptions.selector.limitTarget;
  //   const defaultSelector =
  //     argument.options?.defaultSelector ??
  //     this.#commandOptions.selector.defaultSelector;
  //   const overwrite =
  //     argument.options?.overwrite ?? this.#commandOptions.selector.overwrite;

  //   if (!value.startsWith("@")) {
  //     return world.getPlayers({
  //       name: value.startsWith('"') ? value.slice(1, -1) : value,
  //     });
  //   }
  //   const [target, args] = this.#parseSelector(player, value);

  //   //! ERROR: Selector not player-only
  //   if (
  //     target == "@e" &&
  //     (args.type !== "player" || !args.families.includes("player"))
  //   ) {
  //     this.#commandException(
  //       player,
  //       `Selector accept player-only`,
  //       "commands.generic.targetNotPlayer",
  //       []
  //     );
  //   }
  // }

  //* Argument Expansion
  /**
   * Convert local coordinate into world coordinate
   *
   * @param {object} value
   * Raw local coordinate
   *
   * @param {object} argument
   * Argument data
   *
   * @param {Player} player
   * Player class
   *
   * @return {object} World coordinate
   */
  #localLocationCalc(
    value: { x; y; z },
    argument: LocationCommandArgument,
    player: Player
  ) {
    if (typeof player === "string")
      this.#commandException(
        player,
        `Local coordinate need player's location and rotation`
      );

    const zeroDefaultValue =
      argument.options?.zeroDefaultValue ??
      this.#commandOptions.location.zeroDefaultValue;

    const localCoordinate = {
      x: value.x.startsWith("^")
        ? value.x.substring(1) !== ""
          ? Number(value.x.substring(1))
          : 0
        : this.#commandException(
            player,
            `Cannot mix world & local coordinates (everything must either use ^ or not)`
          ),
      y: value.y.startsWith("^")
        ? value.y.substring(1) !== ""
          ? Number(value.y.substring(1))
          : 0
        : this.#commandException(
            player,
            `Cannot mix world & local coordinates (everything must either use ^ or not)`
          ),
      z: value.z.startsWith("^")
        ? value.z.substring(1) !== ""
          ? Number(value.z.substring(1))
          : 0
        : this.#commandException(
            player,
            `Cannot mix world & local coordinates (everything must either use ^ or not)`
          ),
    };

    const norm = ({ x, y, z }, s) => {
      let l = Math.hypot(x, y, z);
      return {
        x: s * (x / l),
        y: s * (y / l),
        z: s * (z / l),
      };
    };

    const xa = ({ x, y, z }, s) => {
      let m = Math.hypot(x, z);
      let a = {
        x: z,
        y: 0,
        z: -x,
      };

      return norm(a, s);
    };

    const ya = ({ x, y, z }, s) => {
      let m = Math.hypot(x, z);

      let a = {
        x: (x / m) * -y,
        y: m,
        z: (z / m) * -y,
      };

      return norm(a, s);
    };

    const za = (a, s) => {
      return norm(a, s);
    };

    const l = player.location;
    const d = player.getViewDirection();

    let xx = xa(d, localCoordinate.x);
    let yy = ya(d, localCoordinate.y);
    let zz = za(d, localCoordinate.z);

    return {
      x: l.x + xx.x + yy.x + zz.x,
      y: l.y + xx.y + yy.y + zz.y,
      z: l.z + xx.z + yy.z + zz.z,
    };
  }

  // /**
  //  * @param {Player} player
  //  * @param {string} selector
  //  * @returns {[string, object]}
  //  */
  // #parseSelector(player: Player, selector: string) {
  //   const target = selector.slice(0, 2);
  //   let argument = selector.slice(3, -1);
  //   const gameModeAliases = {
  //     0: "survival",
  //     1: "creative",
  //     2: "adventure",
  //     3: "spectator",
  //     s: "survival",
  //     c: "creative",
  //     a: "adventure",
  //     sp: "spectator",
  //   };

  //   //? Parsing the data into raw data
  //   const rawQuery = <>{};
  //   argument.match(/(?:scores|hasitem)\=\{.*?\}/g)?.forEach((value) => {
  //     const key = value.slice(0, value.indexOf("="));
  //     const val = value.substring(value.indexOf("=") + 1);
  //     argument = argument.replace(value, "");
  //     rawQuery[key.trim()] = val.trim();
  //   });
  //   argument
  //     .split(",")
  //     .filter((val) => val.trim() !== "")
  //     .forEach((pair) => {
  //       const [key, value] = pair.split("=");
  //       rawQuery[key.trim()] = value.trim();
  //     });

  //   //? Convert type into EntityQueryOptions
  //   const newQuery = {} as EntityQueryOptions,
  //     location = {},
  //     volume = {};
  //   for (const [key, value] of Object.entries(rawQuery)) {
  //     if (key === "c") {
  //       if (newQuery.farthest || newQuery.closest)
  //         this.#commandException(
  //           player,
  //           'Duplicate "c" selector arguments',
  //           "commands.generic.duplicateSelectorArgument",
  //           ["c"]
  //         );
  //       else if (value.startsWith("-")) newQuery.farthest = Number(value);
  //       else newQuery.closest = Number(value);
  //     } else if (key === "dx") {
  //       if (isNaN(Number(value)))
  //         this.#commandException(
  //           player,
  //           `Invalid number (${value}) on "dx" selector arguments`,
  //           "commands.generic.num.invalid",
  //           [value]
  //         );
  //       else volume.x = Number(value);
  //     } else if (key === "dy") {
  //       if (isNaN(Number(value)))
  //         this.#commandException(
  //           player,
  //           `Invalid number (${value}) on "dy" selector arguments`,
  //           "commands.generic.num.invalid",
  //           [value]
  //         );
  //       else volume.y = Number(value);
  //     } else if (key === "dz") {
  //       if (isNaN(Number(value)))
  //         this.#commandException(
  //           player,
  //           `Invalid number (${value}) on "dz" selector arguments`,
  //           "commands.generic.num.invalid",
  //           [value]
  //         );
  //       else volume.z = Number(value);
  //     } else if (key === "family") {
  //       if (value.startsWith("!"))
  //         !newQuery.excludeFamilies
  //           ? (newQuery.excludeFamilies = [
  //               value.startsWith('"') ? value.slice(2, -1) : value.slice(1),
  //             ])
  //           : newQuery.excludeFamilies.push(
  //               value.startsWith('"') ? value.slice(2, -1) : value.slice(1)
  //             );
  //       else
  //         !newQuery.families
  //           ? (newQuery.families = [
  //               value.startsWith('"') ? value.slice(1, -1) : value,
  //             ])
  //           : newQuery.families.push(
  //               value.startsWith('"') ? value.slice(1, -1) : value
  //             );
  //     } else if (key === "hasitem") {
  //       //* Hasitem currently disabled
  //       player.tell('Ignoring "hasitem" argument selector');
  //       console.warn('Ignoring "hasitem" argument selector');

  //       let hasItem = {};
  //       const hasItemData = value
  //         .slice(1, -1)
  //         .split(",")
  //         .forEach((data) => {
  //           const [key, val] = data.split("=");
  //           hasItem[key.trim()] = val.trim();
  //         });
  //     } else if (key === "l") {
  //       if (newQuery.maxLevel)
  //         this.#commandException(
  //           player,
  //           'Duplicate "l" selector arguments',
  //           "commands.generic.duplicateSelectorArgument",
  //           ["l"]
  //         );
  //       else if (isNaN(Number(value)))
  //         this.#commandException(
  //           player,
  //           `Invalid number (${value}) on "l" selector arguments`,
  //           "commands.generic.num.invalid",
  //           [value]
  //         );
  //       else newQuery.maxLevel = Number(value);
  //     } else if (key === "lm") {
  //       if (newQuery.minLevel)
  //         this.#commandException(
  //           player,
  //           'Duplicate "lm" selector arguments',
  //           "commands.generic.duplicateSelectorArgument",
  //           ["lm"]
  //         );
  //       else if (isNaN(Number(value)))
  //         this.#commandException(
  //           player,
  //           `Invalid number (${value}) on "lm" selector arguments`,
  //           "commands.generic.num.invalid",
  //           [value]
  //         );
  //       else newQuery.minLevel = Number(value);
  //     } else if (key === "m") {
  //       if (newQuery.gameMode)
  //         this.#commandException(
  //           player,
  //           'Duplicate "m" selector arguments',
  //           "commands.generic.duplicateSelectorArgument",
  //           ["m"]
  //         );
  //       else if (value.startsWith("!"))
  //         !newQuery.excludeGameModes
  //           ? (newQuery.excludeGameModes = [
  //               GameMode[gameModeAliases[value] ?? value] ??
  //                 this.#commandException(
  //                   player,
  //                   `Invalid gamemode "${value}"`,
  //                   "commands.gamemode.fail.invalid",
  //                   [value]
  //                 ),
  //             ])
  //           : newQuery.excludeGameModes.push(
  //               GameMode[gameModeAliases[value] ?? value] ??
  //                 this.#commandException(
  //                   player,
  //                   `Invalid gamemode "${value}"`,
  //                   "commands.gamemode.fail.invalid",
  //                   [value]
  //                 )
  //             );
  //       else
  //         newQuery.gameMode =
  //           GameMode[gameModeAliases[value] ?? value] ??
  //           this.#commandException(
  //             player,
  //             `Invalid gamemode "${value}"`,
  //             "commands.gamemode.fail.invalid",
  //             [value]
  //           );
  //     } else if (key === "name") {
  //       if (newQuery.name)
  //         this.#commandException(
  //           player,
  //           'Duplicate "name" selector arguments',
  //           "commands.generic.tooManyNames",
  //           []
  //         );
  //       else if (value.startsWith("!"))
  //         !newQuery.excludeNames
  //           ? (newQuery.excludeNames = [
  //               value.startsWith('"') ? value.slice(2, -1) : value.slice(1),
  //               ,
  //             ])
  //           : newQuery.excludeNames.push(
  //               value.startsWith('"') ? value.slice(2, -1) : value.slice(1)
  //             );
  //       else newQuery.name = value.startsWith('"') ? value.slice(1, -1) : value;
  //     } else if (key === "r") {
  //       if (newQuery.maxDistance)
  //         this.#commandException(
  //           player,
  //           'Duplicate "r" selector arguments',
  //           "commands.generic.duplicateSelectorArgument",
  //           ["r"]
  //         );
  //       else if (isNaN(Number(value)))
  //         this.#commandException(
  //           player,
  //           `Invalid number (${value}) on "r" selector arguments`,
  //           "commands.generic.num.invalid",
  //           [value]
  //         );
  //       else if (Number(value) < 0)
  //         this.#commandException(
  //           player,
  //           'Selector arguments "r" cannot negative',
  //           "commands.generic.radiusNegative",
  //           []
  //         );
  //       else newQuery.maxDistance = Number(value);
  //     } else if (key === "rm") {
  //       if (newQuery.minDistance)
  //         this.#commandException(
  //           player,
  //           'Duplicate "rm" selector arguments',
  //           "commands.generic.duplicateSelectorArgument",
  //           ["rm"]
  //         );
  //       else if (isNaN(Number(value)))
  //         this.#commandException(
  //           player,
  //           `Invalid number (${value}) on "rm" selector arguments`,
  //           "commands.generic.num.invalid",
  //           [value]
  //         );
  //       else if (Number(value) < 0)
  //         this.#commandException(
  //           player,
  //           'Selector arguments "rm" cannot negative',
  //           "commands.generic.radiusNegative",
  //           []
  //         );
  //       else newQuery.minDistance = Number(value);
  //     } else if (key === "rx") {
  //       if (newQuery.maxHorizontalRotation)
  //         this.#commandException(
  //           player,
  //           'Duplicate "rx" selector arguments',
  //           "commands.generic.duplicateSelectorArgument",
  //           ["rx"]
  //         );
  //       else if (isNaN(Number(value)))
  //         this.#commandException(
  //           player,
  //           `Invalid number (${value}) on "rx" selector arguments`,
  //           "commands.generic.num.invalid",
  //           [value]
  //         );
  //       else if (Number(value) < -180 || Number(value) > 180)
  //         this.#commandException(
  //           player,
  //           `Rotation out of range (X-MAX: ${value})`,
  //           "commands.generic.rotationError",
  //           []
  //         );
  //       else newQuery.maxHorizontalRotation = Number(value);
  //     } else if (key === "rxm") {
  //       if (newQuery.minHorizontalRotation)
  //         this.#commandException(
  //           player,
  //           'Duplicate "rxm" selector arguments',
  //           "commands.generic.duplicateSelectorArgument",
  //           ["rxm"]
  //         );
  //       else if (isNaN(Number(value)))
  //         this.#commandException(
  //           player,
  //           `Invalid number (${value}) on "rx" selector arguments`,
  //           "commands.generic.num.invalid",
  //           [value]
  //         );
  //       else if (Number(value) < -180 || Number(value) > 180)
  //         this.#commandException(
  //           player,
  //           `Rotation out of range (X-MIN: ${value})`,
  //           "commands.generic.rotationError",
  //           []
  //         );
  //       else newQuery.minHorizontalRotation = Number(value);
  //     } else if (key === "ry") {
  //       if (newQuery.maxVerticalRotation)
  //         this.#commandException(
  //           player,
  //           'Duplicate "ry" selector arguments',
  //           "commands.generic.duplicateSelectorArgument",
  //           ["ry"]
  //         );
  //       else if (isNaN(Number(value)))
  //         this.#commandException(
  //           player,
  //           `Invalid number (${value}) on "ry" selector arguments`,
  //           "commands.generic.num.invalid",
  //           [value]
  //         );
  //       else if (Number(value) < -180 || Number(value) > 180)
  //         this.#commandException(
  //           player,
  //           `Rotation out of range (Y-MAX: ${value})`,
  //           "commands.generic.rotationError",
  //           []
  //         );
  //       else newQuery.maxVerticalRotation = Number(value);
  //     } else if (key === "rym") {
  //       if (newQuery.minVerticalRotation)
  //         this.#commandException(
  //           player,
  //           'Duplicate "rym" selector arguments',
  //           "commands.generic.duplicateSelectorArgument",
  //           ["rym"]
  //         );
  //       else if (isNaN(Number(value)))
  //         this.#commandException(
  //           player,
  //           `Invalid number (${value}) on "ry" selector arguments`,
  //           "commands.generic.num.invalid",
  //           [value]
  //         );
  //       else if (Number(value) < -180 || Number(value) > 180)
  //         this.#commandException(
  //           player,
  //           `Rotation out of range (Y-MIN: ${value})`,
  //           "commands.generic.rotationError",
  //           []
  //         );
  //       else newQuery.minVerticalRotation = Number(value);
  //     } else if (key === "scores") {
  //       const scorelist = value.slice(1, -1).split(",");
  //       if (scorelist.length === 0) continue;

  //       let scoreData = [];
  //       for (const scoreArg of scorelist) {
  //         let scoreCurrent = {};
  //         let [scoreObj, scoreVal] = scoreArg.split("=");
  //         scoreVal = scoreVal.trim();
  //         scoreCurrent.objective = scoreObj.trim();

  //         if (scoreVal.startsWith("!")) {
  //           scoreCurrent.exclude = true;
  //           scoreVal.slice(1);
  //         }

  //         const scoreRange = scoreVal.split("..");
  //         if (scoreRange.length === 1) {
  //           const scr = Number(scoreRange[0]);
  //           if (isNaN(scr))
  //             this.#commandException(
  //               player,
  //               `Invalid number (${scr}) on "scores" selector arguments with objective ${scoreObj.trim()}`,
  //               "commands.generic.num.invalid",
  //               [scr]
  //             );
  //           scoreCurrent.maxScore = scr;
  //           scoreCurrent.minScore = scr;
  //         } else if (scoreRange[0].length === 0) {
  //           const scr = Number(scoreRange[1]);
  //           if (isNaN(scr))
  //             this.#commandException(
  //               player,
  //               `Invalid number (${scr}) on "scores" selector arguments with objective ${scoreObj.trim()}`,
  //               "commands.generic.num.invalid",
  //               [scr]
  //             );
  //           scoreCurrent.maxScore = scr;
  //         } else if (scoreRange[1].length === 0) {
  //           const scr = Number(scoreRange[0]);
  //           if (isNaN(scr))
  //             this.#commandException(
  //               player,
  //               `Invalid number (${scr}) on "scores" selector arguments with objective ${scoreObj.trim()}`,
  //               "commands.generic.num.invalid",
  //               [scr]
  //             );
  //           scoreCurrent.minScore = scr;
  //         }
  //         scoreData.push(scoreCurrent);
  //       }
  //       newQuery.scoreOptions = scoreData;
  //     } else if (key === "tag") {
  //       if (value.startsWith("!"))
  //         !newQuery.excludeTags
  //           ? (newQuery.excludeTags = [
  //               value.startsWith('"') ? value.slice(2, -1) : value.slice(1),
  //               ,
  //             ])
  //           : newQuery.excludeTags.push(
  //               value.startsWith('"') ? value.slice(2, -1) : value.slice(1)
  //             );
  //       else
  //         !newQuery.tags
  //           ? (newQuery.tags = [
  //               value.startsWith('"') ? value.slice(1, -1) : value,
  //             ])
  //           : newQuery.tags.push(
  //               value.startsWith('"') ? value.slice(1, -1) : value
  //             );
  //     } else if (key === "type") {
  //       if (newQuery.type)
  //         this.#commandException(
  //           player,
  //           'Duplicate "type" selector arguments',
  //           "commands.generic.duplicateType",
  //           []
  //         );
  //       else if (value.startsWith("!"))
  //         !newQuery.excludeGameModes
  //           ? (newQuery.excludeGameModes = [
  //               value.startsWith('"') ? value.slice(2, -1) : value.slice(1),
  //             ])
  //           : newQuery.excludeGameModes.push(
  //               value.startsWith('"') ? value.slice(2, -1) : value.slice(1)
  //             );
  //       else newQuery.type = value.startsWith('"') ? value.slice(1, -1) : value;
  //     } else if (key === "x") {
  //       if (isNaN(Number(value)))
  //         this.#commandException(
  //           player,
  //           `Invalid number (${value}) on "x" selector arguments`,
  //           "commands.generic.num.invalid",
  //           [value]
  //         );
  //       else location.x = Number(value);
  //     } else if (key === "y") {
  //       if (isNaN(Number(value)))
  //         this.#commandException(
  //           player,
  //           `Invalid number (${value}) on "y" selector arguments`,
  //           "commands.generic.num.invalid",
  //           [value]
  //         );
  //       else location.y = Number(value);
  //     } else if (key === "z") {
  //       if (isNaN(Number(value)))
  //         this.#commandException(
  //           player,
  //           `Invalid number (${value}) on "z" selector arguments`,
  //           "commands.generic.num.invalid",
  //           [value]
  //         );
  //       else location.z = Number(value);
  //     }
  //   }

  //   //? Validation data
  //   if (
  //     location.hasOwnProperty("x") ||
  //     location.hasOwnProperty("y") ||
  //     location.hasOwnProperty("z")
  //   ) {
  //     newQuery.location = {
  //       x: location.x ?? player.location.x,
  //       y: location.y ?? player.location.y,
  //       z: location.z ?? player.location.z,
  //     };
  //   }
  //   if (
  //     volume.hasOwnProperty("x") ||
  //     volume.hasOwnProperty("y") ||
  //     volume.hasOwnProperty("z")
  //   ) {
  //     newQuery.volume = new BlockAreaSize(
  //       volume.x ?? 0,
  //       volume.y ?? 0,
  //       volume.z ?? 0
  //     );
  //   }
  //   if (
  //     newQuery.minLevel &&
  //     newQuery.maxLevel &&
  //     newQuery.minLevel > newQuery.maxLevel
  //   ) {
  //     this.#commandException(
  //       player,
  //       "Min level is higher than max level",
  //       "commands.generic.levelError",
  //       []
  //     );
  //   }
  //   if (
  //     newQuery.minDistance &&
  //     newQuery.maxDistance &&
  //     newQuery.minDistance > newQuery.maxDistance
  //   ) {
  //     this.#commandException(
  //       player,
  //       "Min radius is higher than max radius",
  //       "commands.generic.radiusError",
  //       []
  //     );
  //   }

  //   return [target, newQuery];
  // }

  //* Error handling
  /**
   * Throw error message to player (private)/world (public)
   * and end the command
   *
   * @param player
   * Player class or MessageSourceType enum
   *
   * @param message
   * Error message
   *
   * @param langKey
   * Lang key for multi-language error message (on .lang)
   *
   * @param langValue
   * Lang value use for error message
   *
   * @throws Error command
   */
  #commandException(
    player: Player,
    message: string,
    langKey: string = "",
    langValue: any[] = []
  ) {
    let text: RawMessage = { rawtext: [{ text: "§c" + message }] };
    if (langKey) {
      text = {
        rawtext: [{ text: "§c" }, { translate: langKey }],
      };
    }
    if (langKey && langValue.length !== 0) {
      text.rawtext[1].with = {
        rawtext: langValue.map((val) => {
          return {
            text: "" + val,
          };
        }),
      };
    }

    if (player instanceof Player) {
      player.runCommandAsync(`tellraw @s ${JSON.stringify(text)}`);
    } else if (typeof player === "string") {
      text.rawtext.splice(1, 0, { text: `[/scriptevent][${player}]: ` });
      world
        .getDimension("overworld")
        .runCommandAsync(`tellraw @s ${JSON.stringify(text)}`);
    }

    throw message;
  }

  //* Chat/Script Event.
  #chatEvent() {
    world.beforeEvents.chatSend.subscribe((eventChat) => {
      const { message, sender: player } = eventChat;
      if (message.startsWith(this.prefix)) {
        // Cancel the message being sent
        eventChat.cancel = true;
        // Run the command
        this.#runCommand(player, message);
      }
    });
  }

  #debugEvent() {
    system.events.scriptEventReceive.subscribe((eventScript) => {
      // Run when "debug:command" message ID was specify
      if (eventScript.id === "debug:command") {
        // Logs the info that the command ran with "/scriptevent" command
        console.log(
          `Custom command executed with '/scriptevent' command as ${
            eventScript.initiator?.id ??
            eventScript.sourceEntity?.id ??
            eventScript.sourceType
          } => "${eventScript.message}"`
        );
        // Run the command
        this.#runCommand(
          eventScript.initiator ??
            eventScript.sourceEntity ??
            eventScript.sourceType,
          eventScript.message
        );
      }
    });
  }

  //* Running the command.
  #runCommand(player: Player | Entity | string, command: string) {
    let data: CommandResult;
    if (command.startsWith(this.prefix))
      data = this.#parseCommand(
        player as Player,
        command.substring(this.prefix.length)
      ) as CommandResult;
    else return;

    try {
      this.#commandList[data.command].callback(player, data);
      console.warn(
        `Successfully run '/${data.command}' with data: \n${JSON.stringify(
          data,
          null,
          2
        )}'`
      );
    } catch (error) {
      this.#commandException(
        player as Player,
        `${error}\n${error.stack}`,
        "commands.generic.exception",
        []
      );
    }
  }
}

export default new CustomCommand();
