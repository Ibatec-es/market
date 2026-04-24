# Capa Brand — Ibatec Market

Esta carpeta contiene toda la personalización visual y de contenido del fork.
El core (`src/components/`, `src/stylesGlobal/`) NO se modifica aquí.

## Estructura

| Carpeta       | Contenido                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| `tokens/`     | Overrides de variables CSS. `base.css` aplica a todos los clientes. `[brand-id]/theme.css` aplica solo a ese cliente. |
| `components/` | Componentes de shell (Header, Footer, Landing, Logo). Sustituyen a los del core cuando están implementados.           |
| `assets/`     | Logos, iconos y assets estáticos por cliente.                                                                         |
| `content/`    | Extensiones de `content/site.json` por cliente. Se hace merge en runtime.                                             |
| `resolver.ts` | Punto único de resolución. Decide qué componente cargar para cada slot del shell.                                     |

## Añadir un nuevo cliente

1. Crear `tokens/[brand-id]/theme.css` con los overrides de tokens.
2. Crear `assets/[brand-id]/` con logo y assets.
3. Crear `content/[brand-id]/site.json` con los textos sobreescritos.
4. Establecer `NEXT_PUBLIC_BRAND_ID=[brand-id]` en el entorno de ese cliente.

## Variable de entorno

`NEXT_PUBLIC_BRAND_ID` — determina qué tema, assets y contenido se cargan.
Valor por defecto: `default`.

## Convenciones

- Ningún componente en `brand/` importa valores literales de color, fuente o espaciado.
  Siempre referenciar tokens CSS: `var(--color-action-primary)`.
- Ningún componente en `brand/` tiene texto hardcodeado.
  Siempre leer desde `siteContent` o `landing.json`.
