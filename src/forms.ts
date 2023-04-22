import {
  world,
  system,
  Player,
  MinecraftEffectTypes,
  Block,
  EntityInventoryComponent,
  ItemStack,
  MinecraftItemTypes,
} from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import deepCopy from "lib/deepCopy";
import "survival-enhancer/main";

interface Options {
  name: string;
  icon: string;
  func: (player: Player) => void;
}

const options: Options[] = [
  // {
  //   name: "Shape Generator",
  //   icon: "",
  //   func: shapeGeneratorMenu,
  // },
  {
    name: "Survival Enhancer Book",
    icon: "",
    func: survivalEnhancerBook,
  },
  {
    name: "Block Component [DeepCopy/Test]",
    icon: "",
    func: blockComponent,
  },
  // {
  //   name: "Entity Component [Test]",
  //   icon: "",
  //   func: entityComponent,
  // },
  {
    name: "Test Button",
    icon: "",
    func: testing,
  },
];

world.events.itemUse.subscribe((event) => {
  if (
    event.itemStack.typeId !== "minecraft:book" ||
    event.itemStack.getLore().length !== 0
  )
    return;

  // @ts-ignore
  const player = event.source as Player;
  mainForm(player);
});

function mainForm(player: Player): void {
  const form: ActionFormData = new ActionFormData()
    .title("Options")
    .body("Select one of this options");

  for (const opt of options) {
    form.button(opt.name, opt.icon);
  }

  form
    .show(player)
    .then((response) => {
      if (response.canceled) return;

      options[response.selection].func(player);
    })
    .catch((err) => console.error(err, err.stack));
}

function blockComponent(player: Player): void {
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
  const block: Block = player.getBlockFromViewDirection({ maxDistance: 20 });
  const deepObject = deepCopy(block);

  for (const compId of blockComponentList) {
    const comp = block.getComponent(compId);
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

function testing(player: Player): void {
  player.addEffect(MinecraftEffectTypes.speed, 0, 255, true);
}

function survivalEnhancerBook(player: Player): void {
  const inv = player.getComponent("inventory") as EntityInventoryComponent;

  const item = new ItemStack(MinecraftItemTypes.book, 1);
  item.nameTag = "§rSurvival Enhancer Options";
  item.setLore(["§r§e[Form] Survival Enhancer"]);

  inv.container.addItem(item);
}
