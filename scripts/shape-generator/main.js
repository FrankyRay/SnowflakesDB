import { world, Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import circleGenerator from "./circle";

const shapeList = [
  {
    name: "Square",
    icon: "",
    func: (player) => {
      console.warn(player.name);
    },
  },
  {
    name: "Circle",
    icon: "",
    func: circleGenerator,
  },
];

/**
 * Menu of shape generator
 * @param {Player} player Player
 */
export default function shapeGeneratorMenu(player) {
  const formShapeMenu = new ActionFormData()
    .title("Shape Generator")
    .body("Select any shape");

  for (const shape of shapeList) {
    formShapeMenu.button(shape.name, shape.icon);
  }

  formShapeMenu.show(player).then((response) => {
    if (response.canceled) return;

    shapeList[response.selection].func(player);
  });
}
