# ACTION-004 — Crear la estructura de carpetas `src/brand/`

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-003 completada. Baseline visual documentado. Tag `v0-synced`.

Esta acción inicia la Fase 1 — Infraestructura. No se escribe lógica todavía. Solo se define la estructura que contendrá toda la personalización corporativa.

## Objetivo de esta acción

Crear la carpeta `src/brand/` con su jerarquía completa de subcarpetas, archivos vacíos de arranque y documentación interna. Esta estructura es el contrato organizativo del proyecto: define dónde vive cada tipo de recurso custom.

## Estructura a crear

```
src/brand/
├── README.md                          # Documentación de la capa brand
├── resolver.ts                        # (vacío por ahora, se implementa en ACTION-005)
│
├── tokens/
│   ├── base.css                       # Override global de tokens del core (vacío)
│   └── default/
│       └── theme.css                  # Tema del cliente por defecto (vacío)
│
├── components/
│   ├── Shell/                         # App wrapper corporativo
│   │   └── .gitkeep
│   ├── Header/                        # Header corporativo
│   │   └── .gitkeep
│   ├── Footer/                        # Footer corporativo
│   │   └── .gitkeep
│   ├── Logo/                          # Resolver de logo por marca
│   │   └── .gitkeep
│   └── Landing/                       # Landing personalizada
│       └── .gitkeep
│
├── assets/
│   └── default/
│       ├── logo.svg                   # Placeholder — sustituir en ACTION-017
│       └── README.md
│
└── content/
    └── default/
        └── site.json                  # Extensión de content/site.json (vacío por ahora)
```

## Tareas

### 1. Crear la estructura de carpetas

```bash
mkdir -p src/brand/tokens/default
mkdir -p src/brand/components/Shell
mkdir -p src/brand/components/Header
mkdir -p src/brand/components/Footer
mkdir -p src/brand/components/Logo
mkdir -p src/brand/components/Landing
mkdir -p src/brand/assets/default
mkdir -p src/brand/content/default

# Archivos vacíos
touch src/brand/resolver.ts
touch src/brand/tokens/base.css
touch src/brand/tokens/default/theme.css
touch src/brand/content/default/site.json

# Gitkeeps para carpetas vacías
touch src/brand/components/Shell/.gitkeep
touch src/brand/components/Header/.gitkeep
touch src/brand/components/Footer/.gitkeep
touch src/brand/components/Logo/.gitkeep
touch src/brand/components/Landing/.gitkeep
```

### 2. Crear el placeholder de logo

Crear `src/brand/assets/default/logo.svg` con un SVG placeholder:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="32" viewBox="0 0 120 32">
  <rect width="120" height="32" rx="4" fill="#e2e8f0"/>
  <text x="60" y="21" font-family="sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">LOGO</text>
</svg>
```

### 3. Crear `src/brand/content/default/site.json`

```json
{}
```

Por ahora vacío. Se extenderá en ACTION-009. El formato final será un subconjunto de `content/site.json` con solo los campos que se quieran sobreescribir.

### 4. Crear `src/brand/assets/default/README.md`

```markdown
# Assets — Brand: default

Coloca aquí los assets de marca del cliente `default`:

- `logo.svg` — Logo principal (sustituir el placeholder)
- `logo-dark.svg` — Variante para fondos oscuros (opcional)
- `favicon.ico` — Favicon (opcional, también se puede gestionar desde \_document.tsx)

## Convención para nuevos clientes

Crear una carpeta `src/brand/assets/[brand-id]/` con los mismos archivos.
```

### 5. Crear `src/brand/README.md`

```markdown
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
```

### 6. Crear `.env.local` si no existe

```bash
# .env.local
NEXT_PUBLIC_BRAND_ID=default
```

Añadir `.env.local` a `.gitignore` si no está ya. Crear `.env.example`:

```bash
# .env.example
NEXT_PUBLIC_BRAND_ID=default
```

### 7. Verificar que el proyecto sigue compilando

```bash
npm run dev
```

La app debe comportarse exactamente igual que antes. No hay código nuevo activo todavía.

## Patrón a seguir

Esta acción es pura organización. Crear la estructura correcta ahora evita mover archivos después, lo que genera diffs innecesarios.

Los archivos vacíos (`resolver.ts`, `base.css`, `theme.css`) son intencionales. Se rellenan en acciones posteriores. Crearlos ahora establece los contratos de la arquitectura.

## Qué evitar

- No crear carpetas adicionales no listadas aquí. Si durante el desarrollo se ve la necesidad de una carpeta nueva, es una decisión de arquitectura que debe discutirse.
- No poner lógica en `resolver.ts` todavía. Solo el archivo vacío.
- No copiar componentes del core dentro de `src/brand/`. Los componentes brand se escriben desde cero o se crean como wrappers explícitos.

## Entregable

- Estructura completa de `src/brand/` con todos los archivos y carpetas listados.
- `.env.local` y `.env.example` con `NEXT_PUBLIC_BRAND_ID`.
- La app compila y funciona igual que antes.

## Criterio de hecho

`ls -R src/brand/` muestra la jerarquía completa. `npm run dev` funciona sin errores. El `README.md` de la carpeta brand documenta la estructura y las convenciones.
