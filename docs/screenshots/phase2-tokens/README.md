# Screenshots — Post Fase 2 (tokens aplicados)

Fecha: 24 de abril de 2026
Tag: v2-tokens-applied

## Cambios visuales respecto al baseline

- Paleta de colores: Se han reemplazado los colores genéricos por la paleta corporativa de Ibatec (amarillo, azules y grises).
- Tipografía: Se han aplicado las nuevas fuentes (Outfit, Inter, Fira Code), mejorando la legibilidad y la jerarquía.
- Espaciado y radios: Se ha unificado el espaciado global y se han modificado los radios de borde en varios componentes clave.

## Excepciones conocidas (documentadas en token-exceptions.md)

- La barra de búsqueda (Header/SearchBar) sigue teniendo el color amarillo hardcodeado.
- El menú de navegación y detalles de Wallet tienen colores oscuros (azules y texto) hardcodeados.
- Varios componentes en el ComputeWizard (y modales/tarjetas en el perfil) siguen teniendo `box-shadow` e interacciones hardcodeadas en lugar de utilizar variables de tokens (más de 200 incidencias totales).
- Varios componentes mantienen `border-radius` fijo, afectando parcialmente la apariencia unificada.
