// src/brand/utils/deepMerge.ts

/**
 * Merge superficial con un nivel de profundidad.
 * Suficiente para la estructura de site.json.
 * Los valores del `override` ganan en conflicto.
 */
export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Partial<T>
): T {
  const result = { ...base }

  for (const key in override) {
    const baseVal = base[key]
    const overrideVal = override[key]

    if (
      overrideVal !== null &&
      typeof overrideVal === 'object' &&
      !Array.isArray(overrideVal) &&
      typeof baseVal === 'object' &&
      baseVal !== null &&
      !Array.isArray(baseVal)
    ) {
      result[key] = {
        ...(baseVal as object),
        ...(overrideVal as object)
      } as T[typeof key]
    } else if (overrideVal !== undefined) {
      result[key] = overrideVal as T[typeof key]
    }
  }

  return result
}
