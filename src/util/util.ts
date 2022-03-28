import { DateTime } from "luxon";

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
