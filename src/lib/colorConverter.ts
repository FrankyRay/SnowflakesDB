import { Color } from "@minecraft/server";

class MinecraftColor {
  parseColor(color: string): Color {
    if (color.startsWith("#")) {
      return this.#fromHex(color.replace("#", ""));
    } else if (color.startsWith("rgb")) {
      const rgb = color
        .substring(4, color.length - 1)
        .split(/,\s*/)
        .map(Number) as [number, number, number];
      return this.#fromRGB(...rgb);
    } else if (color.startsWith("rgba")) {
      const rgba = color
        .substring(5, color.length - 1)
        .split(/,\s*/)
        .map(Number) as [number, number, number, number];
      return this.#fromRGBA(...rgba);
    } else {
      throw new Error("Invalid color");
    }
  }

  #fromHex(hex: string): Color {
    if (hex.length === 3) {
      // #rgb
      const [red, green, blue] = hex
        .split("")
        .map((c) => parseInt(c + c, 16) / 255);

      return { red, green, blue, alpha: 1 };
    } else if (hex.length === 4) {
      // #rgba
      const [red, green, blue, alpha] = hex
        .split("")
        .map((c) => parseInt(c + c, 16) / 255);

      return { red, green, blue, alpha };
    } else if (hex.length === 6) {
      // #rrggbb
      const red = parseInt(hex.slice(0, 2), 16) / 255;
      const green = parseInt(hex.slice(2, 4), 16) / 255;
      const blue = parseInt(hex.slice(4, 6), 16) / 255;

      return { red, green, blue, alpha: 1 };
    } else if (hex.length === 8) {
      // #rrggbbaa
      const red = parseInt(hex.slice(0, 2), 16) / 255;
      const green = parseInt(hex.slice(2, 4), 16) / 255;
      const blue = parseInt(hex.slice(4, 6), 16) / 255;
      const alpha = parseInt(hex.slice(6, 8), 16) / 255;

      return { red, green, blue, alpha };
    }
  }

  #fromRGB(red: number, green: number, blue: number) {
    return {
      red: red / 255,
      green: green / 255,
      blue: blue / 255,
      alpha: 1,
    };
  }

  #fromRGBA(red: number, green: number, blue: number, alpha: number) {
    return {
      red: red / 255,
      green: green / 255,
      blue: blue / 255,
      alpha: alpha / 255,
    };
  }
}
