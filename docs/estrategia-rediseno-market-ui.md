# Estrategia de Rediseño UI/UX — Market Fork

**Ibatec · Documento técnico de arquitectura visual**  
_Basado en el diagnóstico de layout personalizado — Abril 2026_

---

## Resumen ejecutivo

El diagnóstico existente es técnicamente correcto y bien estructurado. La conclusión es clara: el fork tiene un sistema de tokens CSS aprovechable, pero ningún mecanismo de extensión que permita reemplazar shell, branding y layout sin tocar el core directamente.

Este documento propone una estrategia de rediseño que:

- Respeta el principio SOLID, en particular la **O** (Open/Closed) y la **D** (Dependency Inversion).
- Introduce una capa de extensión mínima y estable sobre el core del fork, sin bifurcarlo innecesariamente.
- Define una arquitectura de personalización reutilizable para múltiples clientes o verticales de negocio.
- Establece criterios visuales y de UX para elevar la interfaz a un estándar profesional minimalista.

El enfoque no es "rediseñar el proyecto". Es **construir una capa de composición** encima del fork y diseñar sobre esa capa.

---

## 1. Evaluación del diagnóstico existente

### Lo que el diagnóstico identifica correctamente

El análisis previo acierta en todos los puntos críticos:

- Los imports directos en `App`, `Logo`, `_app.tsx` y `MarketMetadataProvider` son la barrera principal para cualquier override limpio.
- La duplicidad de menús entre `Header/Menu.tsx` y `Home/Menu/Menu.tsx` eleva el coste de coherencia visual.
- Los tokens CSS son el activo más valioso del sistema visual actual y la palanca más barata para tematizar.
- La Opción C (capa de extensión + personalización encima) es la única estrategia sostenible a medio y largo plazo.

### Lo que el diagnóstico no aborda todavía

El diagnóstico se detiene antes de responder tres preguntas que son necesarias para entrar en la siguiente fase:

1. ¿Qué contrato concreto debe tener la capa de extensión?
2. ¿Cómo se diseña el sistema visual para que sea reutilizable en múltiples clientes?
3. ¿Qué criterios de UX/UI deben guiar la personalización para que el resultado sea verdaderamente profesional?

Este documento responde esas tres preguntas.

---

## 2. Principios de diseño del sistema

Antes de escribir una línea de código o de CSS, hay que definir los principios que gobiernan el sistema. Estos principios determinan decisiones futuras y evitan inconsistencias cuando el proyecto crece o cuando se incorporan nuevos clientes.

### 2.1 SOLID aplicado a la capa visual

| Principio                 | Aplicación concreta en este proyecto                                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Single Responsibility** | Cada componente de shell tiene una única responsabilidad. El Header gestiona navegación. El Footer gestiona enlaces institucionales. La Landing gestiona conversión. No mezclan lógica de negocio con presentación. |
| **Open/Closed**           | El core del fork permanece cerrado a modificación directa. La capa `custom/` está abierta a extensión sin alterar el upstream.                                                                                      |
| **Liskov Substitution**   | Los componentes custom son sustitutos válidos de los componentes base. La interfaz de props es compatible. Si el core espera un `<Header />`, el custom `<Header />` cumple el mismo contrato.                      |
| **Interface Segregation** | La configuración visual no mezcla branding con funcionalidad de marketplace. `brand.config.ts` gestiona identidad. `site.json` gestiona contenido. `marketplace.config.ts` gestiona comportamiento.                 |
| **Dependency Inversion**  | El core no dependerá de implementaciones concretas de `Header`, `Footer` o `Logo`. Dependerá de abstracciones resueltas por un resolver. El resolver sabe si cargar el componente base o el custom.                 |

### 2.2 Criterios de UX profesional minimalista

El mercado de datos y activos digitales tiene un perfil de usuario técnico y corporativo. La interfaz debe transmitir **confianza, precisión y eficiencia**. Eso significa:

- **Jerarquía visual clara.** El usuario debe saber en tres segundos dónde está y qué puede hacer. La navegación no puede competir con el contenido.
- **Densidad controlada.** Ni sobrecargado ni vacío. Cada elemento tiene una razón de estar. Los espacios en blanco son intencionales, no accidentales.
- **Interacciones predecibles.** Los estados hover, focus y active son consistentes en todo el sistema. El usuario no se lleva sorpresas.
- **Tipografía funcional.** No decorativa. La tipografía comunica jerarquía y facilita la lectura. Nada más.
- **Color semántico.** Los colores no son estéticos, son informativos. Verde para confirmación, rojo para error, azul para acción primaria, gris para estados secundarios.

### 2.3 Criterios para un sistema multi-cliente

El fork debe poder servir a múltiples clientes o verticales sin reescribir componentes. Eso implica:

- Un cliente se identifica por su `BRAND_ID` o su dominio.
- El sistema resuelve automáticamente qué tokens, assets y componentes de shell cargar para ese cliente.
- El contenido configurable (menú, footer, textos) vive en `content/` y puede sobreescribirse por cliente.
- Los componentes funcionales del marketplace (búsqueda, asset detail, checkout) son compartidos y no tematizados.

---

## 3. Arquitectura de la capa de extensión

Esta es la propuesta técnica concreta para habilitar la personalización sin romper el fork.

### 3.1 Estructura de carpetas propuesta

```
src/
├── core/                          # Fork upstream — mínimas modificaciones
│   ├── components/
│   │   ├── App/
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Home/
│   │   └── @shared/
│   ├── stylesGlobal/
│   └── pages/
│
├── brand/                         # Capa de extensión — propia del fork Ibatec
│   ├── resolver.ts                # Punto único de resolución de componentes
│   ├── tokens/
│   │   ├── base.css               # Override de _variables.css y _colors.css
│   │   └── [brand-id]/
│   │       └── theme.css          # Override por cliente
│   ├── components/
│   │   ├── Shell/                 # App wrapper corporativo
│   │   ├── Header/                # Header corporativo
│   │   ├── Footer/                # Footer corporativo
│   │   ├── Logo/                  # Resolver de logo por marca
│   │   └── Landing/               # Landing personalizada
│   ├── assets/
│   │   └── [brand-id]/            # Logos, iconos, imágenes por cliente
│   └── content/
│       └── [brand-id]/            # site.json extendido por cliente
│
└── pages/                         # Next.js pages — mínimas modificaciones
    └── _app.tsx                   # Modificado para cargar brand resolver
```

### 3.2 El resolver: punto único de resolución

El resolver es el único archivo que necesita acceso tanto al core como a la capa brand. Todos los demás módulos importan desde el resolver, no directamente desde los componentes.

```typescript
// src/brand/resolver.ts

const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'

// Componentes de shell
export { default as AppShell } from
  existsCustom(`./components/Shell/${BRAND_ID}`)
    ? `./components/Shell/${BRAND_ID}`
    : '../core/components/App'

export { default as Header } from
  existsCustom(`./components/Header/${BRAND_ID}`)
    ? `./components/Header/${BRAND_ID}`
    : '../core/components/Header'

export { default as Footer } from
  existsCustom(`./components/Footer/${BRAND_ID}`)
    ? `./components/Footer/${BRAND_ID}`
    : '../core/components/Footer'

export { default as Logo } from
  existsCustom(`./components/Logo/${BRAND_ID}`)
    ? `./components/Logo/${BRAND_ID}`
    : '../core/components/@shared/atoms/Logo'
```

Con Next.js, esto puede resolverse de forma más limpia con aliases en `tsconfig.json` o `next.config.js` usando rutas condicionadas por variable de entorno en build time. Para múltiples clientes en producción simultánea, el `BRAND_ID` puede provenir de la URL o de un header HTTP resuelto en middleware.

### 3.3 Modificaciones mínimas al core

Solo se necesitan **cuatro modificaciones** al core del fork para habilitar la capa de extensión:

**Modificación 1: `src/pages/_app.tsx`**
Importar el tema corporativo después del tema base, no en lugar de él.

```typescript
// Antes
import '../stylesGlobal/styles.css'

// Después
import '../stylesGlobal/styles.css'
import '../brand/tokens/base.css' // Override de tokens — puede estar vacío por defecto
```

**Modificación 2: `src/components/App/index.tsx`**
Consumir Header y Footer desde el resolver en lugar de imports directos.

```typescript
// Antes
import Header from '../Header'
import Footer from '../Footer/Footer'

// Después
import { Header, Footer } from '../../brand/resolver'
```

**Modificación 3: `src/components/@shared/atoms/Logo/index.tsx`**
Aceptar una prop `src` opcional para resolución externa.

```typescript
// Antes: import fijo a @images/logo.svg
// Después: si se pasa src prop, usa esa; si no, usa el default del core
```

**Modificación 4: `src/@context/MarketMetadata/index.tsx`**
Permitir que `siteContent` se extienda con contenido adicional de la capa brand.

```typescript
// Merge de site.json base con brand content si existe
const brandContent = getBrandContent(BRAND_ID)
const siteContent = deepMerge(baseSiteContent, brandContent)
```

Estas cuatro modificaciones son el único "toque" al upstream. Son pequeñas, localizadas y fácilmente documentables para merge futuro con el repositorio de OceanProtocol.

---

## 4. Sistema de diseño visual

### 4.1 Token architecture

El sistema de diseño se basa en tres capas de tokens:

```
Capa 1: Primitivos (constantes absolutas)
  --color-slate-900: #0f172a
  --color-blue-600: #2563eb
  --space-4: 1rem

Capa 2: Semánticos (uso funcional)
  --color-surface: var(--color-slate-50)
  --color-text-primary: var(--color-slate-900)
  --color-action-primary: var(--color-blue-600)
  --space-section: var(--space-16)

Capa 3: Por componente (si se necesita)
  --header-height: 64px
  --header-border: 1px solid var(--color-border-subtle)
```

La capa brand solo necesita redefinir tokens semánticos. Los primitivos son compartidos. Esto garantiza coherencia y reduce la superficie de cambio por cliente.

### 4.2 Propuesta de sistema visual: línea profesional minimalista

Para una plataforma de marketplace de datos corporativos, el sistema visual recomendado es:

**Paleta base**

- Fondo primario: blanco puro (#ffffff) o casi blanco (#fafafa)
- Fondo secundario: gris muy ligero (#f4f4f5) para cards y secciones alternadas
- Texto primario: slate oscuro (#0f172a) — alta legibilidad, no negro puro
- Texto secundario: slate medio (#64748b) — jerarquía sin gris excesivo
- Acción primaria: azul corporativo (#1d4ed8 o el color de marca del cliente)
- Acción secundaria: misma familia, tono más claro (#dbeafe como fondo con texto #1d4ed8)
- Error: rojo semántico (#dc2626)
- Éxito: verde semántico (#16a34a)
- Borde sutil: (#e2e8f0)

**Tipografía**

- Display/Títulos: fuente con personalidad — recomendado `DM Sans` o `Plus Jakarta Sans` (modernas, legibles, con carácter sutil)
- Cuerpo: `Inter` como base funcional (excepción justificada en interfaces de datos donde la legibilidad de números y etiquetas es crítica)
- Monospace para datos técnicos: `JetBrains Mono` o `Fira Code`
- Escala tipográfica: base 16px, escala 1.25 (xs/sm/base/lg/xl/2xl/3xl/4xl)

**Espaciado**

- Sistema de 8px base. Todos los espaciados son múltiplos de 8 (8, 16, 24, 32, 48, 64, 96).
- Padding de página: 24px mobile, 48px tablet, 80px desktop máximo.
- Máximo ancho de contenido: 1280px para layout estándar, 1440px para dashboards.

**Elevación y sombras**

- Minimalismo estricto: sin sombras decorativas.
- Sombra funcional solo para modales, dropdowns y tooltips.
- Cards: borde de 1px (#e2e8f0) en lugar de sombra.
- Hover en cards: elevar borde a 2px + transición de color.

**Radios de borde**

- Componentes interactivos (botones, inputs): 6px
- Cards y paneles: 8px
- Modales: 12px
- Tags y badges: 4px

### 4.3 Componentes clave a rediseñar

**Header corporativo**

El header actual mezcla navegación, branding y CTAs en una implementación cerrada. El nuevo header debe:

- Altura fija de 64px con borde inferior sutil.
- Logo a la izquierda, resuelto dinámicamente desde la capa brand.
- Navegación principal centrada o izquierda según el cliente.
- CTAs a la derecha (máximo dos: Conectar wallet + Publicar asset).
- En mobile: hamburger limpio con drawer lateral, no modal.
- El menú se alimenta exclusivamente de `siteContent.menu` — sin texto hardcodeado.

**Footer corporativo**

- Tres columnas en desktop: marca + descripción breve | enlaces funcionales | enlaces legales.
- Una columna en mobile, en vertical.
- Logo, redes sociales y copyright resueltos desde brand config.
- Sin sombra, sin fondo distinto al de la página, solo borde superior sutil.

**Landing / Home**

La home actual está acoplada a la demo de OceanProtocol. La landing corporativa debe ser un componente independiente en `brand/components/Landing/`. No hereda el componente `Home` del core.

Estructura propuesta para una landing B2B efectiva:

1. **Hero**: Título de impacto (H1), subtítulo explicativo, CTA primario + secundario, imagen o visualización del producto.
2. **Propuesta de valor**: 3-4 bloques con icono, título y descripción corta. Sin carruseles.
3. **Proof section**: Logos de clientes o métricas clave. Minimalista.
4. **Cómo funciona**: Proceso en 3-4 pasos. Numerados, lineales.
5. **CTA de cierre**: Fondo de acento sutil, título y un único botón.

**Cards de assets**

Las cards del marketplace deben priorizar información sobre decoración:

- Grid de 3 columnas en desktop, 2 en tablet, 1 en mobile.
- Card: borde 1px, radio 8px, sin sombra.
- Información visible sin hover: nombre, tipo, proveedor, precio.
- Hover: borde de acción, flecha o indicador de navegación.
- Sin imágenes decorativas en cards de datos (ruido visual innecesario).

**Formularios y filtros**

- Inputs con borde 1px, altura 40px, label siempre visible (no placeholder como label).
- Focus ring de 2px con offset de 2px, color de acción primaria.
- Error inline, nunca en toast para errores de validación.
- Filtros como sidebar colapsable en mobile, sidebar fijo en desktop.

---

## 5. Hoja de ruta de implementación

La implementación se divide en fases que van de menos a más impacto visual, permitiendo validar el enfoque antes de comprometer más recursos.

### Fase 1 — Habilitación (1-2 semanas)

Objetivo: tener la infraestructura lista sin tocar nada visual todavía.

- Crear `src/brand/` con estructura de carpetas.
- Crear `src/brand/resolver.ts` con lógica de resolución (retorna core por defecto).
- Aplicar las 4 modificaciones mínimas al core.
- Crear `src/brand/tokens/base.css` vacío pero importado.
- Configurar variable de entorno `NEXT_PUBLIC_BRAND_ID`.
- Verificar que el proyecto compila y se comporta igual que antes.

Entregable: el proyecto funciona igual. La infraestructura está lista. El diff con upstream es mínimo y documentado.

### Fase 2 — Tokens y branding base (1 semana)

Objetivo: aplicar la identidad visual corporativa sin tocar ningún componente.

- Definir tokens semánticos en `brand/tokens/base.css`.
- Sobreescribir paleta de colores, tipografía y espaciado base.
- Importar fuentes desde Google Fonts o bundle local.
- Reemplazar `@images/logo.svg` con el logo corporativo.
- Ajustar tokens de componentes específicos si el resultado base no es satisfactorio.

Entregable: la interfaz existente con la identidad visual corporativa aplicada.

### Fase 3 — Shell corporativo (1-2 semanas)

Objetivo: reemplazar Header, Footer y App shell con versiones corporativas.

- Implementar `brand/components/Header/` con el diseño corporativo.
- Implementar `brand/components/Footer/` con la estructura de marca.
- Implementar `brand/components/Logo/` con resolución dinámica.
- Registrar los componentes en el resolver.
- Verificar coherencia en todas las rutas existentes.

Entregable: shell corporativo completo. El fork del core permanece intacto excepto las 4 modificaciones ya documentadas.

### Fase 4 — Landing corporativa (1-2 semanas)

Objetivo: reemplazar la home de demo con una landing propia.

- Implementar `brand/components/Landing/` como página React independiente.
- Conectar con `siteContent` extendido para textos configurables.
- Implementar secciones: Hero, Propuesta de valor, Proceso, CTA.
- Registrar la ruta en `src/pages/index.tsx` condicionado por brand resolver.

Entregable: landing corporativa profesional sin eliminar la home de demo del core.

### Fase 5 — Refinamiento y multi-cliente (ongoing)

Objetivo: preparar el sistema para múltiples clientes.

- Crear `brand/tokens/[brand-id]/theme.css` para el primer cliente adicional.
- Crear `brand/assets/[brand-id]/` para sus assets.
- Crear `brand/content/[brand-id]/site.json` con su contenido.
- Documentar el proceso de onboarding de un nuevo cliente (< 1 día de trabajo).

Entregable: el sistema soporta múltiples identidades de marca sin ninguna modificación de código.

---

## 6. Gestión del fork y mantenimiento

### Estrategia de merge con upstream

El diff entre el fork y el upstream de OceanProtocol debe mantenerse lo más pequeño posible. La regla es:

- Las 4 modificaciones al core se documentan como patches con comentarios claros.
- Todo lo demás vive en `src/brand/`, que el upstream nunca tocará.
- Cuando el upstream lanza una actualización, el merge conflict se limita a esos 4 archivos.
- Si el upstream adopta un sistema similar de extensión en el futuro, la migración es directa.

### Documentación interna

Cada cliente o vertical de negocio debe tener un `README.md` en su carpeta `brand/tokens/[brand-id]/` con:

- Nombre del cliente.
- Fecha de creación y última actualización.
- Lista de tokens sobreescritos y el valor anterior.
- Contacto responsable del cliente.

---

## 7. Qué no hacer

Estas son las decisiones que a corto plazo parecen más rápidas pero que generan deuda técnica y coste creciente:

**No modificar estilos directamente en `stylesGlobal/`**
Cualquier cambio en ese directorio se perderá o generará conflicto en el próximo merge con upstream. El único cambio aceptable en ese directorio es añadir la importación del archivo de override de brand.

**No duplicar componentes funcionales del marketplace**
Los componentes de búsqueda, detalle de asset, publicación y compra pertenecen al core funcional. No se tocan. No se temiatizan más allá de los tokens CSS.

**No usar `!important` en el sistema de tokens**
Si se necesita un `!important` para que un token funcione, es señal de que el orden de carga de los CSS está mal. Se corrige el orden, no se añade `!important`.

**No crear una Landing nueva con estilos inline o CSS arbitrario**
Todos los valores de diseño en los componentes custom deben referenciar tokens semánticos. Ningún color, fuente o espaciado literal en los componentes.

**No hardcodear textos en los componentes de brand**
El componente custom de Header no conoce el nombre de la empresa. Lo lee de `siteContent`. Así funciona para todos los clientes.

---

## 8. Resumen de decisiones

| Área                        | Decisión                                                                  |
| --------------------------- | ------------------------------------------------------------------------- |
| Estrategia de fork          | Capa de extensión `brand/` con 4 modificaciones mínimas al core           |
| Resolver de componentes     | `brand/resolver.ts` — único punto de resolución                           |
| Sistema de tokens           | Tres capas: primitivos, semánticos, por componente                        |
| Multi-cliente               | `BRAND_ID` por entorno, override de tokens y assets por carpeta           |
| Header/Footer               | Reimplementados en `brand/`, resueltos por el resolver                    |
| Landing                     | Componente independiente en `brand/components/Landing/`                   |
| Componentes del marketplace | Intocables — solo se temiatizan por tokens                                |
| Mantenimiento del fork      | Diff mínimo documentado — merge barato con upstream                       |
| Criterio visual             | Minimalismo profesional — jerarquía, densidad controlada, color semántico |

---

## Conclusión

El diagnóstico existente identifica el problema correctamente. La solución es introducir una capa de extensión bien diseñada antes de escribir un solo pixel de CSS corporativo.

El resultado de aplicar este enfoque es un fork que:

- Se mantiene sincronizable con el upstream de OceanProtocol con coste mínimo.
- Soporta personalización profunda de branding y shell por cliente sin tocar código compartido.
- Es extensible a nuevos clientes en menos de un día de trabajo una vez el sistema está operativo.
- Presenta una interfaz profesional, coherente y adaptada al perfil de usuario corporativo del marketplace de datos.

La inversión inicial de habilitación (Fase 1) es la más crítica. Sin ella, cualquier personalización visual es deuda técnica acumulada. Con ella, el sistema escala sin fricciones.

---

_Documento preparado por Claude · Ibatec · Abril 2026_
