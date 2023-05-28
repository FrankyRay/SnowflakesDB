var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CustomCommand_instances, _CustomCommand_commandOptions, _CustomCommand_commandList, _CustomCommand_argumentType, _CustomCommand_parseCommand, _CustomCommand_locationCheck, _CustomCommand_rotationCheck, _CustomCommand_stringArgumentType, _CustomCommand_numberArgumentType, _CustomCommand_booleanArgumentType, _CustomCommand_objectArgumentType, _CustomCommand_optionArgumentType, _CustomCommand_blockArgumentType, _CustomCommand_itemArgumentType, _CustomCommand_effectArgumentType, _CustomCommand_enchantmentArgumentType, _CustomCommand_locationArgumentType, _CustomCommand_rotationArgumentType, _CustomCommand_localLocationCalc, _CustomCommand_commandException, _CustomCommand_chatEvent, _CustomCommand_debugEvent, _CustomCommand_runCommand;
import { world, system, MinecraftBlockTypes, ItemTypes, Vector, MinecraftEffectTypes, 
//* Used for docs and auto-completion
Player, } from "@minecraft/server";
class CustomCommand {
    constructor() {
        _CustomCommand_instances.add(this);
        // Custom command prefix.
        this.prefix = "\\";
        // Custom help command prefix.
        this.helpPrefix = "?";
        // Default command options.
        _CustomCommand_commandOptions.set(this, {
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
        });
        // Command list
        _CustomCommand_commandList.set(this, {
            ping: {
                name: "ping",
                description: "Say pong! (To check if the custom command is working)",
                arguments: [],
                callback: (player, data) => {
                    if (player instanceof Player)
                        player.sendMessage(`Pong! (OP: ${player.isOp()})`);
                    else
                        world.sendMessage("Pong!");
                    console.log("Pong! Custom command works properly");
                },
            },
        });
        // Argument type validation list
        _CustomCommand_argumentType.set(this, {
            string: (v, a, p) => __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_stringArgumentType).call(this, v, a, p),
            number: (v, a, p) => __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_numberArgumentType).call(this, v, a, p),
            boolean: (v, a, p) => __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_booleanArgumentType).call(this, v, a, p),
            object: (v, a, p) => __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_objectArgumentType).call(this, v, a, p),
            block: (v, a, p) => __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_blockArgumentType).call(this, v, a, p),
            item: (v, a, p) => __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_itemArgumentType).call(this, v, a, p),
            effect: (v, a, p) => __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_effectArgumentType).call(this, v, a, p),
            enchantment: (v, a, p) => __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_enchantmentArgumentType).call(this, v, a, p),
            location: (v, a, p) => __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_locationArgumentType).call(this, v, a, p),
            rotation: (v, a, p) => __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_rotationArgumentType).call(this, v, a, p),
            option: (v, a, p) => __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_optionArgumentType).call(this, v, a, p),
        });
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_chatEvent).call(this);
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_debugEvent).call(this);
    }
    //* Add command.
    /**
     * Adding custom command
     *
     * @param data
     * Command data
     */
    addCommand(data) {
        __classPrivateFieldGet(this, _CustomCommand_commandList, "f")[data.name] = data;
        console.log(`Successfully adding command "${data.name}" - "${data.description}"`);
    }
}
_CustomCommand_commandOptions = new WeakMap(), _CustomCommand_commandList = new WeakMap(), _CustomCommand_argumentType = new WeakMap(), _CustomCommand_instances = new WeakSet(), _CustomCommand_parseCommand = function _CustomCommand_parseCommand(player, command) {
    const groups = {
        "{": "}",
        "[": "]",
        '"': '"',
    };
    let commandData = {}, commandArgs = {}, argLocRot = {}, argValue = "", argIndex = 0, closingArray = [], closingChar = "";
    //? Start parsing
    for (const char of command + " ") {
        if (char in groups && closingChar != '"') {
            closingArray.push(groups[char]);
            closingChar = groups[char];
        }
        else if (char == closingChar) {
            closingArray.pop();
            closingChar = closingArray[closingArray.length - 1];
        }
        if (char != " " || closingChar) {
            argValue += char;
            continue;
        }
        if (!argValue)
            continue;
        if (Object.keys(commandData).length === 0) {
            commandData =
                __classPrivateFieldGet(this, _CustomCommand_commandList, "f")[argValue] ??
                    __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Command ${argValue} is not found`, "commands.generic.unknown", [argValue]);
            if (commandData.operator && player instanceof Player && !player?.isOp())
                __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Player ${player.name} cannot use ${argValue} because not operator`, "commands.generic.unknown", [argValue]);
            commandArgs.command = argValue;
            commandArgs.arguments = {};
        }
        else if (argIndex >= commandData.arguments.length) {
            __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, "Too many argument provided");
        }
        else if (commandData.arguments[argIndex].type === "location") {
            const [isDone, data] = __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_locationCheck).call(this, argLocRot, argValue, commandData.arguments[argIndex]);
            argLocRot = data;
            argValue = "";
            if (!isDone)
                continue;
            argLocRot = {};
            commandArgs.arguments[commandData.arguments[argIndex].name] =
                __classPrivateFieldGet(this, _CustomCommand_argumentType, "f")[commandData.arguments[argIndex].type](data, commandData.arguments[argIndex], player);
            argIndex++;
        }
        else if (commandData.arguments[argIndex].type === "rotation") {
            const [isDone, data] = __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_rotationCheck).call(this, argLocRot, argValue, commandData.arguments[argIndex]);
            argLocRot = data;
            argValue = "";
            if (!isDone)
                continue;
            argLocRot = {};
            commandArgs.arguments[commandData.arguments[argIndex].name] =
                __classPrivateFieldGet(this, _CustomCommand_argumentType, "f")[commandData.arguments[argIndex].type](data, commandData.arguments[argIndex], player);
            argIndex++;
        }
        else if (commandData.arguments[argIndex].type === "option") {
            const [value, subArgument] = __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_optionArgumentType).call(this, argValue, commandData.arguments[argIndex], player);
            commandData.arguments.splice(argIndex, 0, ...subArgument);
            commandArgs.arguments[commandData.arguments[argIndex++].name] = value;
        }
        else {
            commandArgs.arguments[commandData.arguments[argIndex].name] =
                __classPrivateFieldGet(this, _CustomCommand_argumentType, "f")[commandData.arguments[argIndex].type](argValue, commandData.arguments[argIndex], player);
            argIndex++;
        }
        argValue = "";
        continue;
    }
    //? Insert the default value for the unspecified argument
    for (let i = argIndex; i < commandData.arguments.length; i++) {
        if (commandData.arguments[i].default === undefined)
            __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Missing argument ${commandData.arguments[i].name}`);
        commandArgs.arguments[commandData.arguments[i].name] =
            commandData.arguments[i].default;
    }
    return commandArgs;
}, _CustomCommand_locationCheck = function _CustomCommand_locationCheck(data, value, argument) {
    const axisX = argument.options?.coordinateAxis?.x ??
        __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").location.coordinateAxis.x;
    const axisY = argument.options?.coordinateAxis?.y ??
        __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").location.coordinateAxis.y;
    const axisZ = argument.options?.coordinateAxis?.z ??
        __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").location.coordinateAxis.z;
    const newData = { ...data };
    if (!data.x && axisX) {
        newData.x = value;
        if (!axisY && !axisZ)
            return [true, newData];
    }
    else if (!data.y && axisY) {
        newData.y = value;
        if (!axisZ)
            return [true, newData];
    }
    else if (!data.z && axisZ) {
        newData.z = value;
        return [true, newData];
    }
    return [false, newData];
}, _CustomCommand_rotationCheck = function _CustomCommand_rotationCheck(data, value, argument) {
    const newData = { ...data };
    if (!data.x) {
        newData.x = value;
    }
    else if (!data.y) {
        newData.y = value;
        return [true, newData];
    }
    return [false, newData];
}, _CustomCommand_stringArgumentType = function _CustomCommand_stringArgumentType(value, argument, player) {
    const minLength = argument.options?.length?.min ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").string.length.min;
    const maxLength = argument.options?.length?.max ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").string.length.max;
    // Delete quotes from value.
    if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, 1);
    }
    //! ERROR: String length is too short.
    if (value.length < minLength) {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Argument ${argument.name} is too short (${value.length} chars < ${minLength} chars)`);
    }
    //! ERROR: String length is too long.
    if (value.length > maxLength) {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Argument ${argument.name} is too long (${value.length} chars > ${maxLength} chars)`);
    }
    return value;
}, _CustomCommand_numberArgumentType = function _CustomCommand_numberArgumentType(value, argument, player) {
    const isFloat = argument.options?.floatType ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").number.floatType;
    const minValue = argument.options?.range?.min ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").number.range.min;
    const maxValue = argument.options?.range?.max ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").number.range.max;
    const stringify = argument.options?.stringify ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").number.stringify;
    const number = Number(value);
    //! ERROR: Invalid number value.
    if (isNaN(number)) {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Argument ${argument.name} has invalid number (${value})`, "commands.generic.num.invalid", [value]);
    }
    //! ERROR: Value type is float instead of integer.
    if (!isFloat && number !== Math.round(number)) {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Argument ${argument.name} type is float instead of integer`);
    }
    //! ERROR: Value is too small.
    if (number < minValue) {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Argument ${argument.name} value is too small (${number} < ${minValue})`, "commands.generic.num.tooSmall", [number, minValue]);
    }
    //! ERROR: Value is too big.
    if (number > maxValue) {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Argument ${argument.name} value is too big (${number} > ${maxValue})`, "commands.generic.num.tooBig", [number, maxValue]);
    }
    return stringify ? "" + number : number;
}, _CustomCommand_booleanArgumentType = function _CustomCommand_booleanArgumentType(value, argument, player) {
    const stringify = argument.options?.stringify ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").boolean.stringify;
    //! ERROR: Invalid boolean type.
    if (value !== "true" || value !== "false") {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Argument ${argument.name} has invalid boolean type '${value}'`);
    }
    return stringify ? value : value === "true";
}, _CustomCommand_objectArgumentType = function _CustomCommand_objectArgumentType(value, argument, player) {
    const stringify = argument.options?.stringify ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").object.stringify;
    let object;
    console.log(value);
    try {
        object = JSON.parse(value);
    }
    catch (error) {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Failed to parse the object at argument ${argument.name}`, "commands.tellraw.jsonStringException", []);
    }
    return stringify ? JSON.stringify(object) : object;
}, _CustomCommand_optionArgumentType = function _CustomCommand_optionArgumentType(value, argument, player) {
    const choices = argument.choices;
    //! ERROR: Not a valid options
    if (!choices.map((choice) => choice.name).includes(value)) {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Option "${value}" is not valid choices`, "commands.generic.parameter.invalid", [value]);
    }
    const subArgument = choices.find((choice) => choice.name === value).subargument ?? [];
    return [value, subArgument];
}, _CustomCommand_blockArgumentType = function _CustomCommand_blockArgumentType(value, argument, player) {
    const vanillaOnly = argument.options?.vanillaOnly ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").block.vanillaOnly;
    const creativeMode = argument.options?.creativeMode ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").block.creativeMode;
    const stringify = argument.options?.stringify ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").block.stringify;
    const block = MinecraftBlockTypes.get(value);
    //! ERROR: Block is not found.
    if (!block) {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Block '${value}' is not found`, "commands.give.block.notFound", [value]);
    }
    //! ERROR: Block must be vanilla.
    if (value.includes(":") &&
        value.substring(0, value.indexOf(":")) !== "minecraft") {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Block must be vanilla`);
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
}, _CustomCommand_itemArgumentType = function _CustomCommand_itemArgumentType(value, argument, player) {
    const vanillaOnly = argument.options?.vanillaOnly ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").item.vanillaOnly;
    const creativeMode = argument.options?.creativeMode ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").item.creativeMode;
    const stringify = argument.options?.stringify ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").item.stringify;
    const item = ItemTypes.get(value);
    //! ERROR: Item is not found.
    if (!item) {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Item '${value}' is not found`, "commands.give.item.notFound", [value]);
    }
    //! ERROR: Item must be vanilla.
    if (value.includes(":") &&
        value.substring(0, value.indexOf(":")) !== "minecraft") {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Item must be vanilla`);
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
}, _CustomCommand_effectArgumentType = function _CustomCommand_effectArgumentType(value, argument, player) {
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
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Argument ${argument.name} has invalid effect (${value})`, "commands.effect.notFound", [value]);
    }
    return MinecraftEffectTypes[typeEffect[value.replace("minecraft:", "")]];
}, _CustomCommand_enchantmentArgumentType = function _CustomCommand_enchantmentArgumentType(value, argument, player) {
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
    if (!Object.keys(typeEnchantment).includes(value.replace("minecraft:", ""))) {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Argument ${argument.name} has invalid enchantment (${value})`, "commands.enchant.notFound", [value]);
    }
    return MinecraftEffectTypes[typeEnchantment[value.replace("minecraft:", "")]];
}, _CustomCommand_locationArgumentType = function _CustomCommand_locationArgumentType(value, argument, player) {
    const relativeValue = argument.options?.relativeValue ??
        __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").location.relativeValue;
    const localValue = argument.options?.localValue ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").location.localValue;
    const zeroDefaultValue = argument.options?.zeroDefaultValue ??
        __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").location.zeroDefaultValue;
    const outputData = argument.options?.outputData ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").location.outputData;
    let rawLocation;
    if (zeroDefaultValue)
        rawLocation = { x: 0, y: 0, z: 0 };
    else
        rawLocation =
            player.location ??
                __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, "Cannot get player's/entity's location. Use 'zeroDefaultValue' options or run the command from player", "commands.generic.exception", []);
    let local = false;
    if (value.x.startsWith("^") ||
        value.y.startsWith("^") ||
        value.z.startsWith("^")) {
        if (localValue) {
            local = true;
            rawLocation = __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_localLocationCalc).call(this, value, argument, player);
        }
        else
            __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Argument ${argument.name} cannot use local coordinate`);
    }
    for (const axis of Object.keys(rawLocation)) {
        if (!value[axis])
            continue;
        if (value[axis].startsWith("~")) {
            if (!relativeValue)
                __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Argument ${argument.name} cannot use relative coordinate`);
            rawLocation[axis] =
                player.location[axis] +
                    Number(value[axis].substring(1) !== "" ? value[axis].substring(1) : 0);
        }
        else if (local) {
            continue;
        }
        else {
            rawLocation[axis] = Number(value[axis]);
        }
    }
    let newLocation;
    switch (outputData) {
        case "Vector":
            const loc = Object.values(rawLocation);
            newLocation = new Vector(...loc);
            break;
        default:
            newLocation = rawLocation;
    }
    return newLocation;
}, _CustomCommand_rotationArgumentType = function _CustomCommand_rotationArgumentType(value, argument, player) {
    const relativeValue = argument.options?.relativeValue ??
        __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").rotation.relativeValue;
    const stringify = argument.options?.stringify ?? __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").rotation.stringify;
    let newRotation = { x: 0, y: 0 };
    for (const axis of Object.keys(newRotation)) {
        if (!value[axis])
            continue;
        if (value[axis].startsWith("~")) {
            if (!relativeValue)
                __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Argument ${argument.name} cannot use relative coordinate`);
            newRotation[axis] =
                player.rotation[axis] +
                    Number(value.substring(1) !== "" ? value.substring(1) : 1);
        }
        else {
            newRotation[axis] = Number(value[axis]);
        }
        //! ERROR: Rotation out of range
        if ((axis === "x" &&
            (newRotation[axis] < -180 || newRotation[axis] > 180)) ||
            (axis === "y" && (newRotation[axis] < -90 || newRotation[axis] > 90))) {
            __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Rotation out of range (${axis.toUpperCase()}: ${newRotation[axis]})`, "commands.generic.rotationError", []);
        }
    }
    return stringify ? Object.values(newRotation).join(" ") : newRotation;
}, _CustomCommand_localLocationCalc = function _CustomCommand_localLocationCalc(value, argument, player) {
    if (typeof player === "string")
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Local coordinate need player's location and rotation`);
    const zeroDefaultValue = argument.options?.zeroDefaultValue ??
        __classPrivateFieldGet(this, _CustomCommand_commandOptions, "f").location.zeroDefaultValue;
    const localCoordinate = {
        x: value.x.startsWith("^")
            ? value.x.substring(1) !== ""
                ? Number(value.x.substring(1))
                : 0
            : __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Cannot mix world & local coordinates (everything must either use ^ or not)`),
        y: value.y.startsWith("^")
            ? value.y.substring(1) !== ""
                ? Number(value.y.substring(1))
                : 0
            : __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Cannot mix world & local coordinates (everything must either use ^ or not)`),
        z: value.z.startsWith("^")
            ? value.z.substring(1) !== ""
                ? Number(value.z.substring(1))
                : 0
            : __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `Cannot mix world & local coordinates (everything must either use ^ or not)`),
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
}, _CustomCommand_commandException = function _CustomCommand_commandException(player, message, langKey = "", langValue = []) {
    let text = { rawtext: [{ text: "§c" + message }] };
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
    }
    else if (typeof player === "string") {
        text.rawtext.splice(1, 0, { text: `[/scriptevent][${player}]: ` });
        world
            .getDimension("overworld")
            .runCommandAsync(`tellraw @s ${JSON.stringify(text)}`);
    }
    throw message;
}, _CustomCommand_chatEvent = function _CustomCommand_chatEvent() {
    world.beforeEvents.chatSend.subscribe((eventChat) => {
        const { message, sender: player } = eventChat;
        if (message.startsWith(this.prefix)) {
            // Cancel the message being sent
            eventChat.cancel = true;
            // Run the command
            __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_runCommand).call(this, player, message);
        }
    });
}, _CustomCommand_debugEvent = function _CustomCommand_debugEvent() {
    system.events.scriptEventReceive.subscribe((eventScript) => {
        // Run when "debug:command" message ID was specify
        if (eventScript.id === "debug:command") {
            // Logs the info that the command ran with "/scriptevent" command
            console.log(`Custom command executed with '/scriptevent' command as ${eventScript.initiator?.id ??
                eventScript.sourceEntity?.id ??
                eventScript.sourceType} => "${eventScript.message}"`);
            // Run the command
            __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_runCommand).call(this, eventScript.initiator ??
                eventScript.sourceEntity ??
                eventScript.sourceType, eventScript.message);
        }
    });
}, _CustomCommand_runCommand = function _CustomCommand_runCommand(player, command) {
    let data;
    if (command.startsWith(this.prefix))
        data = __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_parseCommand).call(this, player, command.substring(this.prefix.length));
    else
        return;
    try {
        const commandCallback = __classPrivateFieldGet(this, _CustomCommand_commandList, "f")[data.command].callback;
        system.runTimeout(() => {
            commandCallback(player, data);
        }, 1);
        console.warn(`Successfully run '/${data.command}' with data: \n${JSON.stringify(data, null, 2)}'`);
    }
    catch (error) {
        __classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_commandException).call(this, player, `${error}\n${error.stack}`, "commands.generic.exception", []);
    }
};
export default new CustomCommand();
