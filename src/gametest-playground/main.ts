import { Player, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

function gametestPlayground(player: Player): void {
  const optionForm = new ActionFormData()
    .title("GameTest Playground")
    .body("Gametest form playground for testing")
    .button("Player");
}
