import { world, system, Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import shapeGeneratorMenu from "./shape-generator/main";

const options = [
  {
    name: "Ping",
    icon: "",
    func: (player) => {
      console.warn(player.name);
    },
  },
  {
    name: "Shape Generator",
    icon: "",
    func: shapeGeneratorMenu,
  },
];

world.events.beforeItemUse.subscribe((event) => {
  if (event.item.typeId !== "minecraft:book") return;

  const player = event.source;
  mainForm(player);
});

/**
 * Main form
 *
 * @param {Player} player Player
 */
function mainForm(player) {
  const form = new ActionFormData()
    .title("Options")
    .body("select one of this options");

  for (const opt of options) {
    form.button(opt.name, opt.icon);
  }

  form.show(player).then((response) => {
    if (response.canceled) return;

    options[response.selection].func(player);
  });
}
