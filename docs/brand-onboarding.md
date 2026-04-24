# Guía de onboarding — Nuevo cliente de marca

**Versión:** 1.0  
**Tiempo estimado:** 2–4 horas para un cliente con assets preparados  
**Prerequisitos:** El proyecto está corriendo localmente. Ver `docs/environment.md`.

---

## Qué implica añadir un nuevo cliente

Cada cliente tiene su propio:

- **Identidad visual** (paleta de colores, logo)
- **Contenido** (textos del site, menú, footer, landing)
- **Assets** (logo SVG en variantes necesarias)

Cada cliente **comparte**:

- Los componentes de shell (Header, Footer, Landing)
- Los componentes funcionales del marketplace (búsqueda, detalle, publicación)
- La infraestructura y lógica de negocio

---

## Paso 1 — Crear el identificador del cliente

Elegir un `BRAND_ID` para el cliente. Convenciones:

- Minúsculas, guiones en lugar de espacios
- Descriptivo y corto: `acme-corp`, `data-labs`, `fintech-market`
- Sin caracteres especiales ni espacios

```bash
BRAND_ID="nombre-del-cliente"
```

---

## Paso 2 — Crear la estructura de carpetas

```bash
# Reemplazar [brand-id] con el valor elegido
mkdir -p src/brand/tokens/[brand-id]
mkdir -p src/brand/assets/[brand-id]
mkdir -p public/brand/assets/[brand-id]
mkdir -p src/brand/content/[brand-id]
```

---

## Paso 3 — Preparar el logo

El logo debe ser un archivo SVG. Requisitos:

- Formato: SVG (preferido) o PNG con transparencia
- Dimensiones recomendadas: 120×32px para el header, 100×28px para el footer
- Fondo transparente
- Debe verse bien sobre fondos claros (variante por defecto)
- Opcional: variante `logo-dark.svg` para fondos oscuros

Copiar el logo en dos ubicaciones:

```bash
cp logo-del-cliente.svg src/brand/assets/[brand-id]/logo.svg
cp logo-del-cliente.svg public/brand/assets/[brand-id]/logo.svg
```

> **Por qué dos ubicaciones:** `src/brand/assets/` es la fuente de verdad (versionada en git). `public/brand/assets/` es donde Next.js sirve el archivo como recurso estático.

---

## Paso 4 — Registrar el logo en el resolver

Abrir `src/brand/components/Logo/index.tsx` y añadir una línea al mapa de logos:

```typescript
const LOGO_MAP: Record<string, string> = {
  default: '/brand/assets/default/logo.svg',
  'demo-client': '/brand/assets/demo-client/logo.svg',
  '[brand-id]': '/brand/assets/[brand-id]/logo.svg' // ← añadir esta línea
}
```

---

## Paso 5 — Crear el tema de tokens

Crear `src/brand/tokens/[brand-id]/theme.css` con los overrides de la paleta corporativa del cliente.

Como mínimo, definir el color de acción primaria:

```css
/* src/brand/tokens/[brand-id]/theme.css */

:root {
  /* Color principal de la marca — ajustar al color corporativo */
  --color-action-primary: #[hex-del-color-primario];
  --color-action-primary-hover: #[hex-del-color-primario-más-oscuro];
  --color-action-primary-bg: #[hex-del-color-primario-muy-claro];
}
```

Para personalización completa, sobreescribir también:

```css
:root {
  /* Fondos */
  --color-bg-primary: #ffffff; /* Fondo principal */
  --color-bg-secondary: #f5f5f5; /* Fondo secundario */

  /* Textos */
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;

  /* Bordes */
  --color-border: #e2e8f0;
  --color-border-strong: #94a3b8;
}
```

---

## Paso 6 — Crear el contenido del site

Crear `src/brand/content/[brand-id]/site.json` con los textos específicos del cliente.

Solo incluir los campos que se quieren sobreescribir respecto al default. Los campos no incluidos usarán el valor del `content/site.json` base.

```json
{
  "siteTitle": "Nombre del cliente Market",
  "siteTagline": "Descripción corta del marketplace",
  "menu": [
    { "label": "Explorar", "href": "/search" },
    { "label": "Publicar", "href": "/publish" }
  ],
  "footer": {
    "tagline": "Descripción del cliente para el footer",
    "social": {
      "linkedin": "https://linkedin.com/company/cliente",
      "twitter": "https://twitter.com/cliente"
    },
    "columns": [
      {
        "title": "Producto",
        "links": [
          { "label": "Catálogo", "href": "/search" },
          { "label": "Publicar", "href": "/publish" }
        ]
      },
      {
        "title": "Legal",
        "links": [
          { "label": "Privacidad", "href": "/privacy" },
          { "label": "Términos", "href": "/terms" }
        ]
      }
    ],
    "copyright": "© 2026 Nombre del cliente. Todos los derechos reservados."
  }
}
```

---

## Paso 7 — Crear el contenido de la landing

Crear `src/brand/content/[brand-id]/landing.json` con los textos de la landing corporativa.

Ver la estructura completa del tipo en `src/brand/types/landing.ts`.

Todos los campos son obligatorios excepto los marcados como opcionales en el tipo:

- `hero.ctaSecondary` — opcional
- `hero.badge` — opcional
- `cta.subheadline` — opcional

---

## Paso 8 — Verificar la configuración

Cambiar el `BRAND_ID` en `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_BRAND_ID=[brand-id]
```

Arrancar el proyecto:

```bash
npm run dev
```

Recorrer el checklist de verificación:

- [ ] Logo del cliente en el header
- [ ] Logo del cliente en el footer
- [ ] Colores corporativos en botones y acciones primarias
- [ ] Textos del `site.json` del cliente en el menú
- [ ] Footer con textos y enlaces del cliente
- [ ] Landing con contenido del `landing.json` del cliente
- [ ] Copyright correcto
- [ ] Funcionalidad del marketplace intacta (búsqueda, detalle, wallet)

---

## Paso 9 — Build de producción

```bash
npm run build
```

Sin errores. El build debe completarse correctamente con el nuevo `BRAND_ID`.

---

## Checklist de entrega

```
[ ] src/brand/tokens/[brand-id]/theme.css creado
[ ] src/brand/assets/[brand-id]/logo.svg creado
[ ] public/brand/assets/[brand-id]/logo.svg copiado
[ ] src/brand/content/[brand-id]/site.json creado
[ ] src/brand/content/[brand-id]/landing.json creado
[ ] LOGO_MAP actualizado en src/brand/components/Logo/index.tsx
[ ] Verificación visual completada
[ ] npm run build exitoso
```

---

## Personalización avanzada (opcional)

### Componentes de shell específicos por cliente

Si un cliente necesita un Header o Footer completamente diferente (no solo tokens), crear:

```
src/brand/components/Header/[brand-id]/index.tsx
```

Y actualizar el resolver para cargarlo condicionalmente. Este caso debe ser excepcional — la regla general es que los tokens son suficientes para la diferenciación visual.

### Variables de entorno por entorno de despliegue

Para despliegues en cloud (Vercel, Netlify, etc.), configurar `NEXT_PUBLIC_BRAND_ID` como variable de entorno en el panel del proveedor. Cada entorno (staging, producción) puede tener un cliente diferente.

---

## Preguntas frecuentes

**¿Puedo tener el mismo despliegue sirviendo múltiples clientes?**  
No con la implementación actual (build time). Cada despliegue sirve un cliente. Para multi-cliente en runtime, se necesita inyectar custom properties desde Javascript.

**¿Puedo tener la landing desactivada para un cliente?**  
Sí. Si no se crea `landing.json` para ese cliente, el sistema carga el `landing.json` del `default`. Para desactivar completamente la landing brand, contactar con el equipo técnico.

**¿Los cambios de tokens son inmediatos?**  
En desarrollo (`npm run dev`), sí. En producción, requieren un nuevo build y despliegue.
