import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData, } from "@minecraft/server-ui";
// Features
import replantingCrops from "./replantingCrops";
import mooshroomInfo from "./entities/mooshroomInfo";
import parrotCookieWarn from "./entities/parrotCookieWarning";
import elytraWarning from "./players/elytraWarning";
import spawnLocation from "./players/spawnLocationInfo";
import catVariantInfo from "./entities/catVariantInfo";
import timeDayInfo from "./players/timeDayInfo";
import experienceInfo from "./players/experienceInfo";
const features = [
    catVariantInfo,
    mooshroomInfo,
    parrotCookieWarn,
    elytraWarning,
    spawnLocation,
    timeDayInfo,
    experienceInfo,
    replantingCrops,
    /* cropAgeInfo */
];
world.afterEvents.itemUse.subscribe((evd) => {
    const player = evd.source;
    const item = evd.itemStack;
    if (!item.getLore().find((lore) => lore === "§r§e[Form] Survival Enhancer"))
        return;
    if (player.isSneaking)
        survivalEnhancerPlayer(player);
    else
        survivalEnhancer(player);
});
function survivalEnhancer(player) {
    const mainForm = new ModalFormData().title(`Survival Enhancer [Global]`);
    for (const feature of features) {
        mainForm.toggle(`${feature.name} §a[${feature.group}]${feature.beta ? "§g[BETA]" : ""}\n§8Version ${feature.version.join(".")}\n§7${feature.desc}\n§8[§cOff§8/§aOn§8]`, feature.activate);
    }
    mainForm.show(player).then((result) => {
        if (result.canceled)
            return;
        features.forEach((data, i) => {
            const value = result.formValues[i];
            player.runCommand(`scoreboard players set ${data.id} survival_plus ${Number(value)}`);
        });
    });
}
function survivalEnhancerPlayer(player) {
    const userForm = new ActionFormData()
        .title("Survival Enhancer [User]")
        .body("Select the option to customize the features");
    for (const feature of features) {
        userForm.button(`${feature.name} ${feature.activate ? "§a[ON]" : "§c[OFF]"}\n${feature.desc}`);
    }
    userForm.show(player).then();
}
