import { DateTime } from "luxon";

export const waitMS = (ms) => new Promise((res) => setTimeout(res, ms));

export function parseDate(date: string, milliseconds = false) {
    return DateTime.fromFormat(
        date,
        `yyyy/MM/dd HH:mm:ss${milliseconds ? ".SSS" : ""}`,
        {
            zone: "Asia/Tokyo"
        }
    );
}

export async function importFile(filePath: string) {
    return (await import(filePath))?.default;
}
