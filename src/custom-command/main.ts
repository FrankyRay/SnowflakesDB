import { world } from "@minecraft/server";
import customCommand from "./command";
// Extension
import "./item";

customCommand.addCommand({
  name: "test",
  description: "Test only",
  arguments: [],
  callback(player, data) {
    console.log("Test is run successfully");
    world.sendMessage("Test is working");
  },
});
