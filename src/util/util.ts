import { DateTime } from "luxon";

export const waitMS = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const groupBy = <T>(array: T[], predicate: (v: T) => string) =>
    array.reduce((acc, value) => {
        (acc[predicate(value)] ||= []).push(value);
        return acc;
    }, {} as { [key: string]: T[] });

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
