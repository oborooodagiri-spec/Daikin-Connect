import { Decimal } from "@prisma/client/runtime/library";

/**
 * Recursively converts Prisma-specific types (Decimal, BigInt) into plain JSON-safe primitives.
 * Decimal -> number
 * BigInt -> string (to prevent precision loss in JS numbers)
 * Date -> remains Date (Next.js handle Dates in Server Actions)
 */
export function serializePrisma<T>(data: T): T {
  if (data === null || data === undefined) return data;

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map((item) => serializePrisma(item)) as unknown as T;
  }

  // Handle Objects
  if (typeof data === "object") {
    // Handle Prisma Decimal
    if (data instanceof Decimal) {
      return data.toNumber() as unknown as T;
    }

    // Handle BigInt
    if (typeof data === "bigint") {
      return (data as any).toString() as unknown as T;
    }

    // Handle standard objects (not Dates or other special objects we want to keep)
    if (data.constructor === Object) {
      const result: any = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          result[key] = serializePrisma((data as any)[key]);
        }
      }
      return result as T;
    }
  }

  return data;
}
