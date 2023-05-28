import { system, Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import parseCoordinate from "lib/parseCoordinate";

export default function spawnExplosion(player: Player) {
  const form = new ModalFormData()
    .title("Spawn Explosion")
    .textField("Explosion Location\n§9Empty: Player location", "Location")
    .slider("Radius", 1, 100, 1, 1)
    .toggle("Allow Underwater\n§8[§cFalse§8/§aTrue§8]", false)
    .toggle("Breaks Blocks\n§8[§cFalse§8/§aTrue§8]", true)
    .toggle("Causes Fire\n§8[§cFalse§8/§aTrue§8]", true)
    .textField("Delay\n§9Empty: 0", "Delay");

  form.show(player).then((result) => {
    if (result.canceled) return;
    const [
      locString,
      radius,
      allowUnderwater,
      breaksBlocks,
      causesFire,
      delay,
    ] = result.formValues as [
      string,
      number,
      boolean,
      boolean,
      boolean,
      boolean
    ];

    const location = !locString
      ? player.location
      : parseCoordinate(player, locString);

    if (delay) {
      system.runTimeout(() => {
        player.dimension.createExplosion(location, radius, {
          allowUnderwater,
          breaksBlocks,
          causesFire,
        });
      }, Number(delay));
    } else {
      player.dimension.createExplosion(location, radius, {
        allowUnderwater,
        breaksBlocks,
        causesFire,
      });
    }
  });
}
