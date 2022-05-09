import {
    DateTime,
    Duration,
    DurationLikeObject,
    ToHumanDurationOptions
} from "luxon";

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

export function toHuman(
    dur: Duration,
    opts?: ToHumanDurationOptions,
    smallestUnit: keyof DurationLikeObject = "seconds"
): string {
    const units: (keyof DurationLikeObject)[] = [
        "years",
        "months",
        "days",
        "hours",
        "minutes",
        "seconds",
        "milliseconds"
    ];
    const smallestIdx = units.indexOf(smallestUnit);
    const entries = Object.entries(
        dur
            .shiftTo(...units)
            .normalize()
            .toObject()
    ).filter(([_unit, amount], idx) => amount > 0 && idx <= smallestIdx);
    const dur2 = Duration.fromObject(
        entries.length === 0
            ? { [smallestUnit]: 0 }
            : Object.fromEntries(entries)
    );
    return dur2.toHuman(opts);
}
