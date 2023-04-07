// Bad code! Need fix!
import { Entity, Player, world } from "@minecraft/server";
import {
  ActionFormData,
  MessageFormData,
  ActionFormResponse,
} from "@minecraft/server-ui";
import deepCode from "./lib/deepCopy";

let indent = 0;
// Type color [1.19.80.21+]
const typeColor = {
  string: "§a",
  number: "§e",
  boolean: "§d",
};
// Entity Components
const entityComponentList = [
  "minecraft:addrider",
  "minecraft:ageable",
  "minecraft:breathable",
  "minecraft:can_climb",
  "minecraft:can_fly",
  "minecraft:can_power_jump",
  "minecraft:color",
  "minecraft:color2",
  "minecraft:fire_immune",
  "minecraft:floats_in_liquid",
  "minecraft:flying_speed",
  "minecraft:friction_modifier",
  "minecraft:ground_offset",
  "minecraft:healable",
  "minecraft:health",
  "minecraft:inventory",
  "minecraft:is_baby",
  "minecraft:is_charged",
  "minecraft:is_chested",
  "minecraft:is_dyeable",
  "minecraft:is_hidden_when_invisible",
  "minecraft:is_ignited",
  "minecraft:is_illager_captain",
  "minecraft:is_saddled",
  "minecraft:is_shaking",
  "minecraft:is_sheared",
  "minecraft:is_stackable",
  "minecraft:is_stunned",
  "minecraft:is_tamed",
  "minecraft:item",
  "minecraft:lava_movement",
  "minecraft:leashable",
  "minecraft:mark_variant",
  "minecraft:tamemount",
  "minecraft:movement.amphibious",
  "minecraft:movement.basic",
  "minecraft:movement",
  "minecraft:movement.fly",
  "minecraft:movement.generic",
  "minecraft:movement.glide",
  "minecraft:movement.hover",
  "minecraft:movement.jump",
  "minecraft:movement.skip",
  "minecraft:movement.sway",
  "minecraft:navigation.climb",
  "minecraft:navigation.float",
  "minecraft:navigation.fly",
  "minecraft:navigation.generic",
  "minecraft:navigation.hover",
  "minecraft:navigation.walk",
  "minecraft:onfire",
  "minecraft:push_through",
  "minecraft:rideable",
  "minecraft:riding",
  "minecraft:scale",
  "minecraft:skin_id",
  "minecraft:strength",
  "minecraft:tameable",
  "minecraft:underwater_movement",
  "minecraft:variant",
  "minecraft:wants_jockey",
];
let entity = undefined;

/**
 * Fetching Entity/Player data
 *
 * @param {Entity|Player} entity
 * Entity/Player
 */
function fetching(entity) {
  console.log(typeof entity);
  // const data = Object.getOwnPropertyNames(deepCode(entity));

  let message = `§9{ §r${
    entity.constructor.name !== "Object" ? entity.constructor.name : ""
  } \n`;
  indent++;
  // console.log(Object.keys(deepCode(entity)));
  for (const property of Object.keys(deepCode(entity))) {
    const type = typeof entity[property];

    switch (type) {
      case "undefined":
        message += `${indentation()}§r${property} §7<§cundefined§7>§r §r\n`;
        continue;

      case "function":
        message += `${indentation()}§6§l§of§r §r${property}() §r\n`;
        continue;

      case "object":
        if (Array.isArray(entity[property])) {
          indent++;
          console.log(Object.keys(deepCode(entity)));
          const arrVal = entity[property].join(`\n${indentation()}§r`);
          message += `${indentation()}§r${property} §7<array>§r: §9[${arrVal}\n§9] §r\n`;
        } else {
          message += `${indentation()}§r${property} §7<object>§r: ${fetching(
            entity[property]
          )} §r\n`;
        }
        continue;

      default:
        message += `${indentation()}§r${property} §7<${type}>§r: ${
          typeColor[type]
        }${
          type === "string" ? `"${entity[property]}"` : entity[property]
        } §r\n`;
    }
  }
  indent--;
  message += `${indentation()}§9}`;
  return message;
}

/**
 * Form menu
 * @param {Player} player
 */
export default async function form(player) {
  console.log("Fetching...");
  const entity = player.getEntitiesFromViewDirection({ maxDistance: 10 })[0];
  console.log(entity);
  if (!entity) return error(player, "Missing entity");
  const availableComponent = [];

  const entityMenu = new ActionFormData()
    .title("Entity Components")
    .body("Click to see more information")
    .button("General Information")
    .button("All Components Info");

  // console.log(5);
  // for (let i = 0; i < entityComponentList.length; i++) {
  //   console.log(`Index: ${i}`);
  //   const compId = entityComponentList[i];
  //   if (!entity.getComponent(compId)) continue;

  //   availableComponent.push(compId);
  //   entityMenu.button(`Component "${compId}"`);
  // }

  console.log("Opening...");
  entityMenu.show(player).then((result) => {
    if (result.canceled) return;

    if (result.selection === 0) {
      const msg = fetching(entity);
      // console.log(msg);
      messageData(player, msg);
    }
  });
}

/**
 * Error message
 * @param {Player} player
 * @param {string} message
 */
function messageData(player, message) {
  new MessageFormData()
    .title("Entity Components")
    .body(message)
    .button1("Ok")
    .button2("Cancel")
    .show(player)
    .then();
}

function indentation() {
  let ind = "";
  for (let i = 0; i < indent; i++) {
    ind += "  ";
  }
  return ind;
}
