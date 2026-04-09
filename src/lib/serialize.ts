import { Decimal } from "@prisma/client/runtime/library";

/**
 * Recursively converts Prisma-specific types (Decimal, BigInt) into plain JSON-safe primitives.
 * Decimal -> number
 * BigInt -> string (to prevent precision loss in JS numbers)
 * Date -> remains Date (Next.js handle Dates in Server Actions)
 */
export function serializePrisma<T>(data: T): T {
  if (data === null || data === undefined) return null as unknown as T;

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map((item) => serializePrisma(item)) as unknown as T;
  }

  // Handle Dates - let Next.js handle these
  if (data instanceof Date) return data as unknown as T;

  // Handle BigInt
  if (typeof data === "bigint") {
    return (data as any).toString() as unknown as T;
  }

  // Handle Objects
  if (typeof data === "object") {
    // Handle Prisma Decimal specifically
    // Use Duck Typing because instanceof can fail across different library versions
    // Check for "d", "s", "e" properties and toNumber function
    const isDecimal = data && 
                     typeof (data as any).toNumber === 'function' && 
                     Object.prototype.hasOwnProperty.call(data, 'd') &&
                     Object.prototype.hasOwnProperty.call(data, 's');

    if (isDecimal) {
      return (data as any).toNumber() as unknown as T;
    }

    // Generic object traversal
    const result: any = {};
    for (const key in data) {
      // CRITICAL: Skip internal properties like 'constructor' which contain functions
      if (Object.prototype.hasOwnProperty.call(data, key) && key !== 'constructor') {
        const val = serializePrisma((data as any)[key]);
        result[key] = val === undefined ? null : val;
      }
    }
    return result as T;
  }

  return data === undefined ? (null as unknown as T) : data;
}
