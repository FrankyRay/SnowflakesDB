var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MinecraftColor_instances, _MinecraftColor_fromHex, _MinecraftColor_fromRGB, _MinecraftColor_fromRGBA;
class MinecraftColor {
    constructor() {
        _MinecraftColor_instances.add(this);
    }
    parseColor(color) {
        if (color.startsWith("#")) {
            return __classPrivateFieldGet(this, _MinecraftColor_instances, "m", _MinecraftColor_fromHex).call(this, color.replace("#", ""));
        }
        else if (color.startsWith("rgb")) {
            const rgb = color
                .substring(4, color.length - 1)
                .split(/,\s*/)
                .map(Number);
            return __classPrivateFieldGet(this, _MinecraftColor_instances, "m", _MinecraftColor_fromRGB).call(this, ...rgb);
        }
        else if (color.startsWith("rgba")) {
            const rgba = color
                .substring(5, color.length - 1)
                .split(/,\s*/)
                .map(Number);
            return __classPrivateFieldGet(this, _MinecraftColor_instances, "m", _MinecraftColor_fromRGBA).call(this, ...rgba);
        }
        else {
            throw new Error("Invalid color");
        }
    }
}
_MinecraftColor_instances = new WeakSet(), _MinecraftColor_fromHex = function _MinecraftColor_fromHex(hex) {
    if (hex.length === 3) {
        // #rgb
        const [red, green, blue] = hex
            .split("")
            .map((c) => parseInt(c + c, 16) / 255);
        return { red, green, blue, alpha: 1 };
    }
    else if (hex.length === 4) {
        // #rgba
        const [red, green, blue, alpha] = hex
            .split("")
            .map((c) => parseInt(c + c, 16) / 255);
        return { red, green, blue, alpha };
    }
    else if (hex.length === 6) {
        // #rrggbb
        const red = parseInt(hex.slice(0, 2), 16) / 255;
        const green = parseInt(hex.slice(2, 4), 16) / 255;
        const blue = parseInt(hex.slice(4, 6), 16) / 255;
        return { red, green, blue, alpha: 1 };
    }
    else if (hex.length === 8) {
        // #rrggbbaa
        const red = parseInt(hex.slice(0, 2), 16) / 255;
        const green = parseInt(hex.slice(2, 4), 16) / 255;
        const blue = parseInt(hex.slice(4, 6), 16) / 255;
        const alpha = parseInt(hex.slice(6, 8), 16) / 255;
        return { red, green, blue, alpha };
    }
}, _MinecraftColor_fromRGB = function _MinecraftColor_fromRGB(red, green, blue) {
    return {
        red: red / 255,
        green: green / 255,
        blue: blue / 255,
        alpha: 1,
    };
}, _MinecraftColor_fromRGBA = function _MinecraftColor_fromRGBA(red, green, blue, alpha) {
    return {
        red: red / 255,
        green: green / 255,
        blue: blue / 255,
        alpha: alpha / 255,
    };
};
export {};
