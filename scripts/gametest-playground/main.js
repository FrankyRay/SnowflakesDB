import { ActionFormData } from "@minecraft/server-ui";
function gametestPlayground(player) {
    const optionForm = new ActionFormData()
        .title("GameTest Playground")
        .body("Gametest form playground for testing")
        .button("Player");
}
