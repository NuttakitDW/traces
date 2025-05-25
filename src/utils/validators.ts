import { parseISO, isValid as isValidDate } from "date-fns";
import { isAddress } from "viem";

export function isIsoDate(value: string) {
    const parsedDate = parseISO(value);
    return isValidDate(parsedDate) && value === parsedDate.toISOString().slice(0, 10);
}

export function isEvmAddress(value: string) {
    return isAddress(value);
}
