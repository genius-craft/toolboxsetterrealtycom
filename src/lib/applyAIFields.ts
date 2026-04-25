/**
 * Aplica campos retornados pela IA (auto-preenchimento) aos setters de uma
 * calculadora. Ignora silenciosamente chaves que não têm setter correspondente
 * ou cujos valores são inválidos. Retorna o número de campos aplicados.
 */
export function applyAIFields(
  setters: Record<string, ((value: never) => void) | undefined>,
  fields: Record<string, unknown>,
): number {
  let applied = 0;
  for (const [key, value] of Object.entries(fields)) {
    const setter = setters[key];
    if (!setter) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    try {
      (setter as (v: unknown) => void)(value);
      applied++;
    } catch (e) {
      console.warn(`Falha ao aplicar campo ${key}:`, e);
    }
  }
  return applied;
}
