/**
 * Aplica campos retornados pela IA (auto-preenchimento) aos setters de uma
 * calculadora. Ignora silenciosamente chaves que não têm setter correspondente
 * ou cujos valores são inválidos. Retorna o número de campos aplicados.
 *
 * Caso especial: para chaves cujo valor é um array de objetos (ex.: `rentalUnits`
 * do Simulador), garante que cada item tenha um campo `id` (gera UUID se faltar).
 */
export function applyAIFields(
  setters: Record<string, ((value: never) => void) | undefined>,
  fields: Record<string, unknown>,
): number {
  let applied = 0;
  for (const [key, rawValue] of Object.entries(fields)) {
    const setter = setters[key];
    if (!setter) continue;
    if (rawValue === undefined || rawValue === null) continue;
    if (typeof rawValue === "number" && !Number.isFinite(rawValue)) continue;

    let value: unknown = rawValue;

    // Garantir IDs em arrays de objetos
    if (Array.isArray(rawValue) && rawValue.length > 0 && typeof rawValue[0] === "object") {
      value = rawValue.map((item) => {
        const obj = item as Record<string, unknown>;
        if (typeof obj.id === "string" && obj.id.length > 0) return obj;
        return { ...obj, id: crypto.randomUUID() };
      });
    }

    try {
      (setter as (v: unknown) => void)(value);
      applied++;
    } catch (e) {
      console.warn(`Falha ao aplicar campo ${key}:`, e);
    }
  }
  return applied;
}
