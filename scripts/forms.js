import { world, system, Player, MinecraftEffectTypes } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import shapeGeneratorMenu from "./shape-generator/main";
import survivalEnhancer from "./survival-enhancer/main";
import entityComponent from "./entity";
import deepCopy from "./lib/deepCopy";

const options = [
  {
    name: "Shape Generator",
    icon: "",
    func: shapeGeneratorMenu,
  },
  {
    name: "Survival Enhancer",
    icon: "",
    func: survivalEnhancer,
  },
  {
    name: "Block Component [DeepCopy][Test]",
    icon: "",
    func: blockComponent,
  },
  {
    name: "Entity Component [Test]",
    icon: "",
    func: entityComponent,
  },
  {
    name: "Test Button",
    icon: "",
    func: testing,
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

  form
    .show(player)
    .then((response) => {
      if (response.canceled) return;

      options[response.selection].func(player);
    })
    .catch((err) => player.sendMessage(err, err.stack));
}

/**
 * @param {Player} player
 */
function blockComponent(player) {
  const blockComponentList = [
    "minecraft:inventory",
    "minecraft:lavaContainer",
    "minecraft:piston",
    "minecraft:potionContainer",
    "minecraft:recordPlayer",
    "minecraft:sign",
    "minecraft:snowContainer",
    "minecraft:waterContainer",
  ];
  const block = player.getBlockFromViewDirection({ maxDistance: 20 });
  const deepObject = deepCopy(block);

  for (const compId of blockComponentList) {
    const comp = entity.getComponent(compId);
    if (!comp) {
      deepObject[compId] = false;
    } else {
      deepObject[compId] = deepCopy(comp);
    }
  }

  new MessageFormData()
    .title("Block Component")
    .body(JSON.stringify(deepObject, null, 2))
    .button1("OK")
    .button2("Cancel")
    .show(player);
}

/**
 * @param {Player} player
 */
function testing(player) {
  player.addEffect(MinecraftEffectTypes.speed, 0, 255, true);
}
