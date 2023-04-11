import { ActionFormData, ModalFormData, } from "@minecraft/server-ui";
// Features
import replantingCrops from "./replantingCrops";
import mooshroomInfo from "./entities/mooshroomInfo";
import parrotCookieWarn from "./entities/parrotCookieWarning";
import elytraWarning from "./players/elytraWarning";
import spawnLocation from "./players/spawnLocationInfo";
const options = {
    Entity: [mooshroomInfo, parrotCookieWarn],
    Player: [elytraWarning, spawnLocation],
    Misc: [replantingCrops],
};
export default function survivalEnhancer(player) {
    const seForm = new ActionFormData()
        .title("Survival Enhancer")
        .body("Select submenu to see other options");
    for (const sub of Object.keys(options)) {
        seForm.button(sub);
    }
    seForm.show(player).then((response) => {
        if (response.canceled)
            return;
        survivalEnhancerSubmenu(player, Object.keys(options)[response.selection]);
    });
}
function survivalEnhancerSubmenu(player, submenu) {
    const subForm = new ModalFormData().title(`Survival Enhancer: ${submenu}`);
    for (const data of options[submenu]) {
        subForm.toggle(`${data.name} ${data.beta ? "§g[BETA]" : ""}${data.desc ? "\n§7" + data.desc : ""}\n§8[§cOff§8/§aOn§8]`, data.activate);
    }
    subForm.show(player).then((result) => {
        if (result.canceled)
            return;
        options[submenu].forEach((data, i) => {
            const value = result.formValues[i];
            player.runCommand(`scoreboard players set ${data.id} survival_plus ${Number(value)}`);
        });
    });
}
