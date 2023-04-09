import { Player, system, world } from "@minecraft/server";
import {
  ActionFormData,
  MessageFormData,
  ModalFormData,
} from "@minecraft/server-ui";
// Features
import replantingCrops from "./replantingCrops";
import spawnLocationInfo from "./players/spawnLocationInfo";
import elytraWarning from "./players/elytraWarning";
import mooshroomInfo from "./entities/mooshroomInfo";
import parrotCookieWarning from "./entities/parrotCookieWarning";

const options = {
  Player: [spawnLocationInfo, elytraWarning],
  Entity: [mooshroomInfo, parrotCookieWarning],
  Misc: [replantingCrops],
};

/**
 * Use to sync the data from scoreboard to "optionList" object
 */
// system.runInterval(() => {
//   const survivalObj = world.scoreboard.getObjective("survival_plus");

//   if (!survivalObj) {
//     console.log("Run");
//     world.scoreboard.addObjective("survival_plus", "Survival Enhancer");

//     for (const opt of optionList) {
//       world
//         .getDimension("overworld")
//         .runCommand(`scoreboard players set ${opt.id} survival_plus 0`);
//     }
//     return;
//   }

//   for (const data of optionList) {
//     const scoreId = world.scoreboard
//       .getParticipants()
//       .find((tgt) => tgt.displayName === data.id);

//     if (!scoreId)
//       return world
//         .getDimension("overworld")
//         .runCommand(`scoreboard players set ${data.id} survival_plus 0`);

//     const score = survivalObj.getScore(scoreId);
//     data.activate = Boolean(score);
//   }
// });

/**
 * Survival Enhancer Menu Submenu
 *
 * @param {Player} player
 * Player
 *
 * @param {string} submenu
 * Submenu
 */
function survivalEnhancerSubmenu(player, submenu) {
  const submenuForm = new ModalFormData().title("Survival Enhancer");

  for (const data of options[submenu]) {
    submenuForm.toggle(
      `${data.name} ${data.beta ? "§g[BETA]" : ""}${
        data.desc ? "\n§7" + data.desc : ""
      }\n§8[§cOff§8/§aOn§8]`,
      data.activate
    );
  }

  submenuForm.show(player).then((result) => {
    if (result.canceled) return;

    options[submenu].forEach((data, i) => {
      const value = result.formValues[i];

      player.runCommand(
        `scoreboard players set ${data.id} survival_plus ${Number(value)}`
      );
    });
  });
}

/**
 * Survival Enhancer Menu
 *
 * @param {Player} player
 * Player
 */
export default function survivalEnhancer(player) {
  const menuForm = new ActionFormData()
    .title("Survival Enhancer")
    .body("Select submenu to see another options");
  // .button("Information display");

  for (const sub of Object.keys(options)) {
    menuForm.button(sub);
  }

  menuForm.show(player).then((result) => {
    if (result.canceled) return;

    // if (result.selection === 0) return survivalEnhancerDisplay(player);
    survivalEnhancerSubmenu(player, Object.keys(options)[result.selection]);
  });
}

// /**
//  * Survival Enhancer Form Display
//  *
//  * @param {Player} player
//  * Player
//  */
// function survivalEnhancerDisplay(player) {
//   const displayClass = [];
//   for (const features of Object.values(options)) {
//     for (const feature of features) {
//       if (feature.display) displayClass.push(feature);
//     }
//   }

//   const displayForm = new ActionFormData()
//     .title("Survival Enhancer Display")
//     .body("Select one to show information")
//     .button("Remove display");

//   for (const feature of displayClass) {
//     let title = feature.name;
//     if (
//       player.getTags().find((tag) => tag.startsWith("se/show/")) === feature.id
//     )
//       title += "\n§g[Active]";

//     displayForm.button(title);
//   }

//   displayForm.show(player).then((result) => {
//     if (result.canceled) return;

//     if (result.selection === 0) {
//       const tag = player.getTags().find((tag) => tag.startsWith("se/show/"));
//       console.log(tag);
//       player.removeTag(tag);
//     } else player.addTag(`se/show/${displayClass[result.selection - 1].id}`);
//   });
// }
