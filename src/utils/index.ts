import fs from "fs";
import path from "path";


export const calculateAmountOut = (numerator?: bigint, denominator?: bigint, decimalScale?: bigint): string => {
    if (numerator && denominator && decimalScale) {
        numerator = numerator / denominator;

        if (numerator > decimalScale) {
            return (Number(numerator * 100n / decimalScale) / 100).toString();
        }
        else {            
            const decimalOffset = decimalScale.toString().length - numerator.toString().length;
            const numeratorWithOffset = numerator * (10n ** (BigInt(decimalOffset + 2)));
            const product = numeratorWithOffset / decimalScale;
            
            return (Number(product) / 10 ** (decimalOffset + 2)).toFixed(2);
        }
    }
    else return "0";
}


export const objectIsNotNullOrUndefined = <T>(object: T | null | undefined): object is T => {
    return (object !== null && object !== undefined);
}


export const getApiKeys = (fileName: string, keyLength: number): string[] => {
    const keys = fs.readFileSync(path.join(__dirname, "..", "..", fileName), "utf-8");
    return keys.split("\r\n").filter((key) => key.length === keyLength);
}


export const parseDecimalScale = (decimals: number): string => {
    return "1".concat("0".repeat(decimals));
}