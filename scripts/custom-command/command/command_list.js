class CommandList {
    constructor() {
        this.commandList = [
            {
                name: "ping",
                description: "Sends pong message",
                arguments: [],
                callback(command) {
                    console.log("Pong!");
                    command.player.sendMessage("Pong!");
                },
            },
            {
                name: "hello",
                description: "Sends ping message",
                aliases: ["hi"],
                arguments: [
                    {
                        name: "name",
                        description: "Name of person to greet",
                        type: "string",
                        options: {
                            stringType: "none",
                            stringLength: {
                                min: 3,
                            },
                        },
                    },
                    {
                        name: "age",
                        description: "Age of person to greet",
                        type: "number",
                        options: {
                            floatType: false,
                            numberRange: {
                                min: 0,
                                max: 100,
                            },
                        },
                        default: 0,
                    },
                    {
                        name: "show_age",
                        description: "Show age of person to greet to the console",
                        type: "boolean",
                        default: false,
                    },
                ],
                callback({ data }) {
                    if (data.show_age) {
                        console.log(`Hello ${data.name}, you are ${data.age} years old`);
                    }
                    else {
                        console.log(`Hello ${data.name}`);
                    }
                },
            },
        ];
    }
    addCommand(command) {
        this.commandList.push(command);
    }
    getCommand(name) {
        return this.commandList.find((cmd) => cmd.name === name || cmd.aliases?.includes(name));
    }
    getHelpCommand(name) {
        const command = this.getCommand(name);
        let message = `Command "${command?.name}" - ${command?.description ?? "[None]"}\n${command?.name}`;
        for (const arg of command?.arguments ?? []) {
            const require = arg.default === undefined;
            let messageArg = `<${arg.name}: ${arg.type}>`;
            message += require
                ? " " + messageArg
                : " " + messageArg.replace("<", "[").replace(">", "]");
        }
        return message;
    }
}
export default new CommandList();
