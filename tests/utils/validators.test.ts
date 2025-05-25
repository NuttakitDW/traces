import { test, expect } from "bun:test";
import { isIsoDate, isEvmAddress } from "../../src/utils/validators";

/* ---------- isIsoDate ---------- */

test("accepts valid ISO-8601 date (YYYY-MM-DD)", () => {
    expect(isIsoDate("2025-05-25")).toBe(true);
});

test("rejects invalid calendar date", () => {
    expect(isIsoDate("2025-02-30")).toBe(false); // Feb 30 does not exist
});

test("rejects non-ISO format", () => {
    expect(isIsoDate("25-05-2025")).toBe(false);
});

/* ---------- isEvmAddress ---------- */

test("accepts checksummed Ethereum address", () => {
    expect(
        isEvmAddress("0xdadB0d80178819F2319190D340ce9A924f783711"),
    ).toBe(true);
});

test("accepts lowercase Ethereum address", () => {
    expect(
        isEvmAddress("0x742d35cc6634c0532925a3b844bc454e4438f44e"),
    ).toBe(true);
});

test("rejects malformed address", () => {
    expect(isEvmAddress("0x12345")).toBe(false);
});
