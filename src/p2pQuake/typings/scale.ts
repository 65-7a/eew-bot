import { ColorResolvable } from "discord.js";

export const JMAIntensity: Record<string, string> = {
    "-1": "None",
    "10": "1",
    "20": "2",
    "30": "3",
    "40": "4",
    "45": "5-",
    "46": "5 (?)",
    "50": "5+",
    "55": "6-",
    "60": "6+",
    "70": "7"
};

export const JMAColors: Record<string, ColorResolvable> = {
    "-1": "DEFAULT",
    "10": "#ececec",
    "20": "#0097ff",
    "30": "#0058e4",
    "40": "#f7ea41",
    "45": "#ffc32e",
    "50": "#ff962a",
    "55": "#f91f1c",
    "60": "#c60036",
    "70": "#c20086"
};
