export default class CommandResult {
    constructor(name, description, player, data) {
        /** Some information about the command */
        this.command = {};
        this.player = player;
        this.command["name"] = name;
        this.command["description"] = description;
        this.data = data;
    }
}
