import { system } from "@minecraft/server";

system.events.scriptEventReceive.subscribe(
  (event) => {
    console.log(`[Test::Log] ${event.message}`);
    console.warn(`[Test::Warn] ${event.message}`);
    console.error(`[Test::Error] ${event.message}`);
  },
  { namespaces: ["bds"] }
);
