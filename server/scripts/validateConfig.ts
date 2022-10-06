import { existsSync } from 'fs';
import { Config } from '../src/config';
import exampleConfig from '../config.example.json';

enum Colours {
    Reset = `\x1b[0m`,
    Bright = `\x1b[1m`,
    Dim = `\x1b[2m`,
    Underscore = `\x1b[4m`,
    Blink = `\x1b[5m`,
    Reverse = `\x1b[7m`,
    Hidden = `\x1b[8m`,

    // foreground
    FgBlack = `\x1b[30m`,
    FgRed = `\x1b[31m`,
    FgGreen = `\x1b[32m`,
    FgYellow = `\x1b[33m`,
    FgBlue = `\x1b[34m`,
    FgMagenta = `\x1b[35m`,
    FgCyan = `\x1b[36m`,
    FgWhite = `\x1b[37m`,

    // background
    BgBlack = `\x1b[40m`,
    BgRed = `\x1b[41m`,
    BgGreen = `\x1b[42m`,
    BgYellow = `\x1b[43m`,
    BgBlue = `\x1b[44m`,
    BgMagenta = `\x1b[45m`,
    BgCyan = `\x1b[46m`,
    BgWhite = `\x1b[47m`,
}

/**
 * A fake config that implements the Config interface, meaning it
 * definitely has the correct **type** of values.
 *
 * This will be used to validate `config.example.json`, and `config.json` if it exists.
 */
const _fakeConfig: Omit<Config, `version` | `startedAt`> = {
    port: 0,
    clientURLs: [``],
    numProxies: 0,
    maxRequestsPerMinute: 0,
    rateLimitBypassTokens: [``],
    spotifyClientId: ``,
    spotifyClientSecret: ``,
};

// typescript does weird stuff with indexes, to avoid this our comparison function
// works with Record<string, unknown>, so we typecast the fake config to this here.
const fakeConfig = _fakeConfig as unknown as Record<string, unknown>;

/**
 * Checks whether all the keys of an object are also in the other, and the value types are the same.
 * @param correct Object that has the "correct" keys.
 * @param target Object to check.
 * @param targetName Name of target object, for logging.
 * @returns {boolean} Whether keys and value types are identical.
 */
function recursivelyCompareObjects(
    correct: Record<string, unknown>,
    target: Record<string, unknown>,
    targetName: string,
): boolean {
    const trueTypeOf = (value: unknown): string => {
        if (Array.isArray(value)) {
            if (value.length > 0) return trueTypeOf(value[0]) + `[]`;
            return `empty[]`;
        }
        return typeof value;
    };

    let areEquivalent = true;
    const logDifference = (key: string) => {
        console.log(
            `type of ${Colours.FgMagenta}${key}${Colours.Reset} in ${Colours.FgCyan}${targetName}${Colours.Reset} is ${
                Colours.FgRed
            }${trueTypeOf(target[key])}${Colours.Reset}, but should be ${Colours.FgGreen}${trueTypeOf(correct[key])}${
                Colours.Reset
            }`,
        );
    };

    const visitedKeys: Set<string> = new Set();
    for (const key in correct) {
        visitedKeys.add(key);
        if (!(key in target)) {
            console.log(
                `key ${Colours.FgMagenta}${key}${Colours.Reset} is missing from ${Colours.FgCyan}${targetName}${Colours.Reset}`,
            );
            areEquivalent = false;
        } else if (trueTypeOf(correct[key]) !== trueTypeOf(target[key])) {
            if (trueTypeOf(target[key]) === `empty[]`) continue;
            logDifference(key);
            areEquivalent = false;
        } else if (typeof correct[key] === `object`) {
            const valA = correct[key] as object;
            const valB = target[key] as object;
            try {
                const res = recursivelyCompareObjects(
                    valA as Record<string, unknown>,
                    valB as Record<string, unknown>,
                    `${targetName}.${key}`,
                );
                if (res === false) areEquivalent = false;
            } catch (error) {
                console.log(
                    `error comparing ${Colours.FgRed}${key}${Colours.Reset} in ${Colours.FgCyan}${targetName}${Colours.Reset}`,
                );
                areEquivalent = false;
            }
        }
    }

    for (const key in target) {
        if (!visitedKeys.has(key)) {
            console.log(`unrecognized key "${key}" in ${targetName}`);
            areEquivalent = false;
        }
    }
    return areEquivalent;
}

let exitStatus = 0;

if (recursivelyCompareObjects(fakeConfig, exampleConfig, `config.example.json`)) {
    console.log(`${Colours.FgGreen}✓ config.example.json is valid${Colours.Reset}`);
} else {
    exitStatus = 1;
}

if (existsSync(`config.json`)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const actualConfig = require(`../config.json`);
    if (recursivelyCompareObjects(fakeConfig, actualConfig, `config.json`)) {
        console.log(`${Colours.FgGreen}✓ config.json is valid${Colours.Reset}`);
    } else {
        exitStatus = 1;
    }
}

process.exit(exitStatus);
