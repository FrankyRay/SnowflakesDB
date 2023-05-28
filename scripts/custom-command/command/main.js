var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CustomCommand_instances, _CustomCommand_commandList, _CustomCommand_player, _CustomCommand_block, _CustomCommand_entity, _CustomCommand_debug, _CustomCommand_parseCommand;
import { Player, system, world, } from "@minecraft/server";
import CommandException from "./exception";
class CustomCommand {
    constructor() {
        _CustomCommand_instances.add(this);
        /** The command prefix */
        this.prefix = "\\";
        /** The list of custom commands */
        _CustomCommand_commandList.set(this, [
            {
                name: "ping",
                description: "Say pong! (To check if the custom command is working)",
                arguments: [],
                callback: (player, data) => {
                    if (player && player instanceof Player)
                        player.sendMessage(`Pong! (OP: ${player.isOp()})`);
                    else
                        world.sendMessage("Pong!");
                    console.log("Pong! Custom command works properly");
                },
            },
            {
                name: "hello",
                description: "Say hello!",
                aliases: ["hi"],
                arguments: [
                    {
                        name: "name",
                        description: "The name to say hello to",
                        type: "string",
                        default: "World",
                    },
                    {
                        name: "age",
                        description: "The age of the person",
                        type: "number",
                        default: 0,
                    },
                    {
                        name: "show_age",
                        description: "Show the age of the person",
                        type: "boolean",
                        default: false,
                    },
                ],
                callback(player, data) {
                    const { name, age, show_age } = data.arguments;
                    if (!show_age)
                        player.sendMessage(`Hello ${name}!`);
                    else
                        player.sendMessage(`Hello ${name}! You are ${age} years old!`);
                },
            },
        ]);
        /** In progress variable */
        _CustomCommand_player.set(this, undefined);
        _CustomCommand_block.set(this, undefined);
        _CustomCommand_entity.set(this, undefined);
        _CustomCommand_debug.set(this, false);
        this.chatEvent();
        this.scriptEvent();
    }
    chatEvent() {
        world.beforeEvents.chatSend.subscribe((event) => {
            if (!event.message.startsWith(this.prefix))
                return;
            event.cancel = true;
            const player = event.sender;
            const command = event.message.substring(1);
        });
    }
    scriptEvent() {
        system.events.scriptEventReceive.subscribe((event) => {
            console.log(event.id);
            if (event.id !== "command:debug")
                return;
            const command = event.message;
            console.warn(JSON.stringify(__classPrivateFieldGet(this, _CustomCommand_instances, "m", _CustomCommand_parseCommand).call(this, command), null, 2));
        } // { namespaces: ["command"] }
        );
    }
}
_CustomCommand_commandList = new WeakMap(), _CustomCommand_player = new WeakMap(), _CustomCommand_block = new WeakMap(), _CustomCommand_entity = new WeakMap(), _CustomCommand_debug = new WeakMap(), _CustomCommand_instances = new WeakSet(), _CustomCommand_parseCommand = function _CustomCommand_parseCommand(command) {
    const groups = {
        "{": "}",
        "[": "]",
        '"': '"',
    };
    let outputVal = [], inputVal = "", closingArray = [], closingChar = "", commandData = {}, argsIndex = -1;
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
            inputVal += char;
            continue;
        }
        if (!inputVal)
            continue;
        if (argsIndex < 0) {
            commandData = __classPrivateFieldGet(this, _CustomCommand_commandList, "f").find((command) => command.name === inputVal || command.aliases.includes(inputVal));
            if (!commandData)
                throw new CommandException(`Command ${inputVal} is not found`, __classPrivateFieldGet(this, _CustomCommand_player, "f"), "commands.generic.unknown", [inputVal]);
            inputVal = "";
            continue;
        }
        outputVal.push(inputVal);
        inputVal = "";
    }
    return outputVal;
};
export default new CustomCommand();
