import CommandList from "./command_list";
import CommandException from "./command_exception";
import stringArgument from "./argument/string";
import numberArgument from "./argument/number";
import booleanArgument from "./argument/boolean";
import vector2Argument from "./argument/vector2";
import vector3Argument from "./argument/vector3";
import CommandResult from "./command_result";
class CommandParse {
    constructor() {
        this.typeValidation = {
            string: stringArgument,
            number: numberArgument,
            boolean: booleanArgument,
        };
        this.vectorValidation = [null, vector2Argument, vector3Argument];
    }
    parseCommand(command, player) {
        const groups = {
            "{": "}",
            "[": "]",
            '"': '"',
        };
        let outputVal = {}, inputVal = "", closingArray = [], closingChar = "", commandData = {}, argsIndex = -1;
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
                const cmd = CommandList.getCommand(inputVal);
                if (!cmd)
                    throw new CommandException(`Command ${inputVal} is not found`, player, "commands.generic.unknown", [inputVal]);
                commandData = cmd;
                inputVal = "";
                argsIndex++;
                continue;
            }
            if (argsIndex > commandData.arguments?.length)
                throw new CommandException(`Too many argument provided`, player);
            const argsData = commandData.arguments[argsIndex];
            let validation;
            if (argsData.type.startsWith("vector")) {
                const [isDone, data] = this.vectorValidation[Number(argsData.type.slice(-1))].validate(inputVal, 
                // @ts-ignore
                argsData, player);
                inputVal = "";
                if (!isDone)
                    continue;
                validation = data;
            }
            else {
                validation = this.typeValidation[argsData.type
                // @ts-ignore [Conflicted property "type"]
                ].validate(inputVal, argsData, player);
            }
            outputVal[argsData.name] = validation;
            argsIndex++;
            inputVal = "";
        }
        for (let i = argsIndex; i < commandData.arguments.length; i++) {
            const argsData = commandData.arguments[i];
            if (argsData.default === undefined)
                throw new CommandException(`Missing argument '${argsData.name}'`, player);
            outputVal[argsData.name] = argsData.default;
        }
        return new CommandResult(commandData.name, commandData.description ?? "", player, outputVal);
    }
}
export default new CommandParse();
