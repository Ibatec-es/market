# Plan de Acción — Customización UI Market Fork

**Ibatec · Roadmap de implementación por casos de uso**  
_Abril 2026_

---

## Cómo usar este documento

Cada acción es una unidad de trabajo autocontenida. Se ejecutan en orden porque cada una depende de la anterior. El formato es siempre el mismo: qué se hace, por qué, qué archivos se tocan, cuál es el entregable verificable y cuál es el criterio de "hecho".

Las acciones están agrupadas en fases. Dentro de cada fase, el orden importa.

---

## Fase 0 — Preparación y auditoría

### ACTION-001: Clonar y verificar el estado actual del fork

**Qué:** Asegurar que el fork compila, ejecuta y funciona correctamente en local antes de tocar nada.

**Por qué:** Cualquier error preexistente se arrastrará al rediseño y será difícil de diagnosticar después.

**Tareas concretas:**

- Clonar `Ibatec-es/market` en local.
- Instalar dependencias y ejecutar en modo desarrollo.
- Verificar que todas las rutas principales funcionan: home, búsqueda, detalle de asset, publicación, perfil.
- Documentar la versión de Node, npm y cualquier dependencia con versión fija que afecte al build.
- Hacer un commit de referencia con tag `v0-baseline`.

**Entregable:** Proyecto arrancando en local sin errores. Tag `v0-baseline` en el repo.

**Criterio de hecho:** `npm run dev` levanta la app y todas las rutas principales responden sin errores en consola.

---

### ACTION-002: Sincronizar con upstream y resolver conflictos pendientes

**Qué:** Hacer merge o rebase del upstream `OceanProtocolEnterprise/market` para partir de la versión más actualizada posible.

**Por qué:** Si el upstream tiene cambios recientes, es mejor incorporarlos ahora (coste cero) que después (coste creciente con cada cambio propio).

**Tareas concretas:**

- Añadir remote `upstream` apuntando a `OceanProtocolEnterprise/market`.
- Fetch y comparar diferencias con la rama principal.
- Resolver conflictos si los hay.
- Verificar que todo sigue funcionando tras el merge.
- Commit con tag `v0-synced`.

**Entregable:** Fork al día con upstream. Tag `v0-synced`.

**Criterio de hecho:** No hay commits pendientes del upstream que afecten a shell, estilos o layout.

---

### ACTION-003: Inventario visual — captura del estado actual

**Qué:** Capturar screenshots de todas las pantallas clave del proyecto tal como están ahora.

**Por qué:** Sirve como referencia de comparación durante y después del rediseño. También documenta decisiones de diseño del upstream que podrían perderse.

**Tareas concretas:**

- Capturar en desktop y mobile: Home, Búsqueda/Catálogo, Detalle de asset, Publicar asset, Perfil de usuario, páginas legales (privacy, terms).
- Capturar el Header y Footer en sus variantes (home vs interior, desktop vs mobile).
- Guardar en `docs/screenshots/baseline/`.

**Entregable:** Carpeta `docs/screenshots/baseline/` con capturas organizadas por pantalla y viewport.

**Criterio de hecho:** Todas las pantallas funcionales del marketplace tienen captura en dos viewports.

---

## Fase 1 — Infraestructura de extensión

### ACTION-004: Crear la estructura de carpetas `src/brand/`

**Qué:** Crear la estructura de carpetas que alojará toda la personalización, vacía pero con la jerarquía correcta.

**Por qué:** Definir la estructura primero asegura que todas las decisiones posteriores tienen un lugar claro. Evita archivos sueltos y deuda organizativa.

**Tareas concretas:**

- Crear `src/brand/` con las subcarpetas: `tokens/`, `components/`, `assets/`, `content/`.
- Crear `src/brand/components/` con subcarpetas vacías: `Shell/`, `Header/`, `Footer/`, `Logo/`, `Landing/`.
- Crear `src/brand/tokens/base.css` vacío.
- Crear `src/brand/assets/default/` con un placeholder para el logo.
- Crear `src/brand/README.md` explicando la estructura y las convenciones.

**Entregable:** Estructura de carpetas creada con README explicativo.

**Criterio de hecho:** `ls -R src/brand/` muestra la jerarquía completa. El README documenta la convención de cada carpeta.

---

### ACTION-005: Implementar el resolver de componentes

**Qué:** Crear `src/brand/resolver.ts` como punto único de resolución de los componentes de shell.

**Por qué:** Este archivo es la pieza central de la arquitectura Open/Closed. Sin él, los imports directos del core siguen mandando.

**Tareas concretas:**

- Crear `src/brand/resolver.ts`.
- Exportar `Header`, `Footer`, `Logo` y `AppShell`, todos apuntando inicialmente a los componentes del core.
- Implementar lógica de resolución condicional basada en `NEXT_PUBLIC_BRAND_ID` (por defecto, cargar core).
- Verificar que los tipos de TypeScript son compatibles entre core y brand.

**Entregable:** Archivo `resolver.ts` funcional que re-exporta los componentes del core sin cambio de comportamiento.

**Criterio de hecho:** Importar desde `brand/resolver` devuelve los mismos componentes que importar directamente del core. No hay cambio funcional.

---

### ACTION-006: Modificación 1 — `_app.tsx` carga CSS de brand

**Qué:** Añadir una línea de import en `src/pages/_app.tsx` para cargar `brand/tokens/base.css` después de los estilos globales del core.

**Por qué:** Esto habilita el override de tokens CSS sin editar los archivos originales. La cascada CSS hace el trabajo.

**Tareas concretas:**

- Abrir `src/pages/_app.tsx`.
- Añadir `import '../brand/tokens/base.css'` después de `import '../stylesGlobal/styles.css'`.
- Verificar que la app compila y se ve igual (el archivo CSS está vacío).

**Entregable:** `_app.tsx` con la línea de import añadida.

**Criterio de hecho:** La app compila y renderiza exactamente igual que antes. El import no rompe nada.

---

### ACTION-007: Modificación 2 — `App/index.tsx` consume el resolver

**Qué:** Cambiar los imports de Header y Footer en `src/components/App/index.tsx` para que vengan del resolver en lugar de imports directos.

**Por qué:** Este es el punto donde el shell deja de estar hardcodeado y pasa a ser extensible.

**Tareas concretas:**

- Abrir `src/components/App/index.tsx`.
- Reemplazar `import Header from '../Header'` por `import { Header } from '../../brand/resolver'`.
- Reemplazar `import Footer from '../Footer/Footer'` por `import { Footer } from '../../brand/resolver'`.
- Verificar que compila y funciona igual.

**Entregable:** `App/index.tsx` consumiendo Header y Footer desde el resolver.

**Criterio de hecho:** El Header y Footer se renderizan exactamente igual. La única diferencia es la ruta del import.

---

### ACTION-008: Modificación 3 — Logo acepta resolución externa

**Qué:** Modificar `src/components/@shared/atoms/Logo/index.tsx` para aceptar una prop `src` opcional que permita inyectar un logo distinto.

**Por qué:** Permite que la capa brand resuelva el logo por cliente sin tocar el componente original.

**Tareas concretas:**

- Abrir `Logo/index.tsx`.
- Añadir prop `src?: string` al componente.
- Si `src` viene definido, renderizar esa imagen. Si no, usar el import directo existente (`@images/logo.svg`).
- Exportar el componente desde el resolver con la prop ya resuelta para el brand activo.

**Entregable:** Componente Logo compatible hacia atrás con soporte de resolución externa.

**Criterio de hecho:** Sin prop `src`, el logo es el mismo de siempre. Con prop `src`, renderiza la imagen indicada.

---

### ACTION-009: Modificación 4 — `MarketMetadata` permite extensión de contenido

**Qué:** Modificar `src/@context/MarketMetadata/index.tsx` para que `siteContent` pueda mezclarse con contenido adicional de la capa brand.

**Por qué:** Permite extender `site.json` por cliente sin reescribirlo. Los textos, menú y footer se pueden sobreescribir por marca.

**Tareas concretas:**

- Abrir `MarketMetadata/index.tsx`.
- Crear función `deepMerge` o importar utilidad ligera.
- Cargar `brand/content/[BRAND_ID]/site.json` si existe.
- Mergear con el `content/site.json` base (el brand override gana en conflicto).
- Si no existe archivo de brand, no cambia nada.

**Entregable:** `siteContent` extensible por marca sin romper el comportamiento default.

**Criterio de hecho:** Sin contenido brand, `siteContent` es idéntico al original. Con contenido brand, los campos sobreescritos se aplican correctamente.

---

### ACTION-010: Verificación de integridad post-habilitación

**Qué:** Test completo de la aplicación tras las 4 modificaciones al core.

**Por qué:** Confirmar que la infraestructura de extensión está lista y el proyecto funciona exactamente igual que antes de empezar.

**Tareas concretas:**

- Ejecutar en modo desarrollo y navegar todas las rutas.
- Verificar que Header, Footer y Logo se renderizan desde el resolver (son los mismos del core, pero la ruta de import es distinta).
- Verificar que no hay errores en consola ni warnings de TypeScript.
- Comparar screenshots con los de ACTION-003.
- Commit con tag `v1-extension-ready`.

**Entregable:** Tag `v1-extension-ready` en el repo. Confirmación documentada de que no hay regresiones.

**Criterio de hecho:** La app es visualmente idéntica a `v0-baseline`. El diff con el core son exactamente 4 archivos modificados y la carpeta `brand/` añadida.

---

## Fase 2 — Identidad visual por tokens

### ACTION-011: Definir paleta de colores corporativa en tokens

**Qué:** Poblar `src/brand/tokens/base.css` con los overrides de variables de color del core.

**Por qué:** Los colores son el cambio visual con mayor impacto y menor riesgo. Cambia la percepción completa de la app sin tocar ningún componente.

**Tareas concretas:**

- Auditar `src/stylesGlobal/_colors.css` y `_variables.css` para identificar todas las variables de color en uso.
- Definir la paleta corporativa (primario, secundario, superficie, texto, bordes, estados).
- Escribir los overrides en `brand/tokens/base.css` usando `:root { }`.
- Verificar el resultado en todas las pantallas.

**Entregable:** Paleta corporativa aplicada vía tokens. La app se "siente" diferente sin haber tocado un solo componente.

**Criterio de hecho:** Ningún componente del core tiene cambios. Los colores corporativos se aplican globalmente mediante cascada CSS.

---

### ACTION-012: Configurar tipografía corporativa

**Qué:** Sustituir las fuentes tipográficas del core por las fuentes corporativas elegidas.

**Por qué:** La tipografía es el segundo factor de identidad visual más importante después del color.

**Tareas concretas:**

- Elegir fuentes corporativas (display + cuerpo + monospace).
- Importar desde Google Fonts en `_app.tsx` o `_document.tsx`, o instalar como dependencia local.
- Sobreescribir las variables `--font-*` en `brand/tokens/base.css`.
- Ajustar escala tipográfica si los tamaños base del core no encajan con las nuevas fuentes.
- Verificar legibilidad en todas las pantallas y viewports.

**Entregable:** Tipografía corporativa aplicada.

**Criterio de hecho:** Todas las fuentes visibles en la app son las corporativas. No queda ninguna instancia de la fuente original del core.

---

### ACTION-013: Ajustar espaciado, radios y elevación

**Qué:** Sobreescribir tokens de espaciado, border-radius y sombras para alinear con la línea minimalista.

**Por qué:** Estos son los detalles que separan una interfaz "cambiada de color" de una interfaz "rediseñada". La coherencia en espaciado y radios transmite profesionalidad.

**Tareas concretas:**

- Auditar variables de spacing, radius y shadow en `_variables.css`.
- Definir sistema de 8px en `brand/tokens/base.css`.
- Unificar radios de borde (6px interactivos, 8px cards, 12px modales).
- Eliminar o reducir sombras decorativas, dejando solo sombras funcionales.
- Verificar alineación en grids, cards, formularios y modales.

**Entregable:** Sistema de espaciado y radios corporativo aplicado.

**Criterio de hecho:** Los componentes están visualmente alineados con el sistema de 8px. No hay radios ni sombras inconsistentes.

---

### ACTION-014: Verificación visual post-tokens

**Qué:** Comparación visual completa entre el estado actual y el baseline.

**Por qué:** Validar que los tokens han transformado la interfaz sin romper nada funcional.

**Tareas concretas:**

- Capturar screenshots de todas las pantallas en desktop y mobile.
- Comparar con `docs/screenshots/baseline/`.
- Documentar cualquier componente donde los tokens no se aplican correctamente (valores hardcodeados en CSS modules).
- Listar esos componentes como deuda técnica a resolver en la Fase 3 si es necesario.
- Commit con tag `v2-tokens-applied`.

**Entregable:** Screenshots actualizados. Lista de excepciones documentada. Tag `v2-tokens-applied`.

**Criterio de hecho:** La identidad visual corporativa es reconocible en la interfaz. Las excepciones están identificadas y documentadas.

---

## Fase 3 — Shell corporativo

### ACTION-015: Implementar Header corporativo

**Qué:** Crear `src/brand/components/Header/index.tsx` con el diseño de header profesional minimalista.

**Por qué:** El header es el componente más visible y el primero en comunicar la marca. El del core tiene texto hardcodeado y estructura cerrada.

**Tareas concretas:**

- Diseñar el header: logo izquierda, nav centro/izquierda, CTAs derecha.
- Implementar como componente React que consume `siteContent.menu` para la navegación.
- Implementar variante mobile con drawer lateral.
- Importar Logo desde el resolver.
- Registrar en `brand/resolver.ts` como el Header activo para el brand actual.
- Verificar en todas las rutas.

**Entregable:** Header corporativo funcional, responsive y alimentado por configuración.

**Criterio de hecho:** El header renderiza correctamente en desktop y mobile. La navegación funciona en todas las rutas. No hay texto hardcodeado.

---

### ACTION-016: Implementar Footer corporativo

**Qué:** Crear `src/brand/components/Footer/index.tsx` con el diseño de footer corporativo.

**Por qué:** El footer actual mezcla datos configurables con branding hardcodeado. El corporativo debe ser 100% configurable.

**Tareas concretas:**

- Diseñar el footer: 3 columnas desktop (marca | enlaces | legal), 1 columna mobile.
- Implementar consumiendo `siteContent.footer` para enlaces y textos.
- Resolver logo, redes sociales y copyright desde brand config.
- Registrar en `brand/resolver.ts`.
- Verificar en todas las rutas.

**Entregable:** Footer corporativo funcional y responsive.

**Criterio de hecho:** El footer renderiza correctamente. Todos los textos y enlaces vienen de configuración.

---

### ACTION-017: Implementar componente Logo corporativo

**Qué:** Crear `src/brand/components/Logo/index.tsx` que resuelve el logo por `BRAND_ID`.

**Por qué:** Centralizar la resolución del logo permite multi-cliente y evita imports directos a assets fijos.

**Tareas concretas:**

- Crear componente que carga el logo desde `brand/assets/[BRAND_ID]/`.
- Soportar variantes: logo completo, isotipo, versión clara/oscura si aplica.
- Registrar en resolver.
- Verificar en Header, Footer y cualquier otro punto que use Logo.

**Entregable:** Logo resuelto dinámicamente por marca.

**Criterio de hecho:** Cambiar `BRAND_ID` en `.env` cambia el logo en toda la app.

---

### ACTION-018: Verificación de shell completo

**Qué:** Test integral del shell corporativo.

**Tareas concretas:**

- Navegar todas las rutas verificando Header y Footer.
- Verificar transiciones entre rutas (no hay parpadeo ni recarga del shell).
- Verificar responsive en 3 breakpoints: mobile (375px), tablet (768px), desktop (1280px).
- Comparar con screenshots de baseline.
- Commit con tag `v3-shell-ready`.

**Entregable:** Tag `v3-shell-ready`. Shell corporativo operativo.

**Criterio de hecho:** El shell corporativo es coherente en todas las rutas y viewports.

---

## Fase 4 — Landing corporativa

### ACTION-019: Crear contenido de la landing en brand config

**Qué:** Definir los textos, CTAs e imágenes de la landing como datos en `brand/content/[BRAND_ID]/landing.json`.

**Por qué:** Separar contenido de presentación desde el principio. La landing no debe tener texto hardcodeado.

**Tareas concretas:**

- Definir estructura JSON: hero (título, subtítulo, CTA primario, CTA secundario), propuesta de valor (bloques), proceso (pasos), CTA final.
- Crear `landing.json` con contenido real o placeholder de calidad.
- Definir tipo TypeScript para la estructura de la landing.

**Entregable:** Archivo de contenido de landing tipado y completo.

**Criterio de hecho:** El JSON es válido, tipado y contiene todos los bloques necesarios para la landing.

---

### ACTION-020: Implementar componente Landing — Hero

**Qué:** Crear la sección Hero de la landing corporativa.

**Tareas concretas:**

- Implementar en `brand/components/Landing/Hero.tsx`.
- Título H1 de impacto, subtítulo, dos CTAs (primario y secundario).
- Responsive: texto centrado en mobile, layout asimétrico en desktop.
- Consumir datos desde `landing.json`.
- Solo tokens CSS, ningún valor literal.

**Entregable:** Sección Hero renderizando correctamente.

**Criterio de hecho:** El Hero comunica la propuesta de valor en 3 segundos. Es responsive. No tiene texto hardcodeado.

---

### ACTION-021: Implementar componente Landing — Propuesta de valor

**Qué:** Crear la sección de propuesta de valor (3-4 bloques con icono, título y descripción).

**Tareas concretas:**

- Implementar en `brand/components/Landing/ValueProps.tsx`.
- Grid de 3-4 columnas en desktop, 1 columna en mobile.
- Iconos resueltos desde brand assets o librería de iconos.
- Consumir datos desde `landing.json`.

**Entregable:** Sección de propuesta de valor funcional.

**Criterio de hecho:** Los bloques se renderizan desde datos. El grid es responsive. Los iconos se resuelven correctamente.

---

### ACTION-022: Implementar componente Landing — Proceso y CTA final

**Qué:** Crear las secciones de "Cómo funciona" y CTA de cierre.

**Tareas concretas:**

- Implementar `brand/components/Landing/Process.tsx`: 3-4 pasos numerados, lineales.
- Implementar `brand/components/Landing/CtaSection.tsx`: fondo de acento, título, botón único.
- Consumir datos desde `landing.json`.

**Entregable:** Secciones de proceso y CTA renderizando correctamente.

**Criterio de hecho:** La landing completa tiene flujo visual coherente de arriba a abajo. Todas las secciones consumen datos de configuración.

---

### ACTION-023: Integrar Landing en la ruta principal

**Qué:** Conectar la landing corporativa con `src/pages/index.tsx` a través del resolver.

**Tareas concretas:**

- Crear `brand/components/Landing/index.tsx` que compone Hero + ValueProps + Process + CtaSection.
- Modificar `src/pages/index.tsx` para renderizar la Landing del brand si `BRAND_ID` no es `default`.
- Si `BRAND_ID` es `default`, renderizar la Home original del core.
- Verificar navegación desde la landing hacia el catálogo/búsqueda.

**Entregable:** Landing corporativa accesible en `/`.

**Criterio de hecho:** La ruta `/` muestra la landing corporativa. La navegación hacia el marketplace funciona. Con `BRAND_ID=default`, la home original sigue funcionando.

---

### ACTION-024: Verificación de landing completa

**Qué:** Test integral de la landing corporativa.

**Tareas concretas:**

- Verificar en 3 breakpoints.
- Verificar rendimiento (LCP < 2.5s, no CLS).
- Verificar que los CTAs navegan correctamente.
- Verificar SEO básico (title, description, og:image).
- Capturar screenshots finales.
- Commit con tag `v4-landing-ready`.

**Entregable:** Tag `v4-landing-ready`. Landing corporativa operativa.

**Criterio de hecho:** La landing es profesional, responsive, rápida y funcional.

---

## Fase 5 — Refinamiento de vistas del marketplace

### ACTION-025: Ajustar vista de catálogo / búsqueda

**Qué:** Refinar visualmente la vista de catálogo de assets aplicando el sistema de diseño corporativo.

**Tareas concretas:**

- Verificar que los tokens se aplican correctamente a las cards de assets.
- Ajustar grid (3 col desktop, 2 tablet, 1 mobile) si no es así por defecto.
- Verificar estados de hover, loading y empty state.
- Identificar y documentar componentes que no respetan tokens (hardcoded CSS).
- Aplicar fixes puntuales vía CSS de brand si son menores.

**Entregable:** Vista de catálogo visualmente coherente con el sistema de diseño.

**Criterio de hecho:** Las cards, filtros y paginación se ven corporativos. No hay "islas" con el estilo original.

---

### ACTION-026: Ajustar vista de detalle de asset

**Qué:** Refinar visualmente la vista de detalle de un asset individual.

**Tareas concretas:**

- Verificar que metadata, precio, acciones y descripción respetan los tokens.
- Ajustar tipografía de encabezados y jerarquía visual si es necesario.
- Verificar estados: asset disponible, no disponible, en proceso.
- Aplicar fixes puntuales vía CSS de brand.

**Entregable:** Vista de detalle coherente con el sistema de diseño.

**Criterio de hecho:** El detalle de asset se siente como parte de la misma app que la landing y el catálogo.

---

### ACTION-027: Ajustar formularios y flujo de publicación

**Qué:** Refinar visualmente los formularios de publicación de assets y cualquier otro formulario del marketplace.

**Tareas concretas:**

- Verificar inputs, selects, textareas, botones y estados de error.
- Asegurar que labels son visibles (no placeholder-as-label).
- Verificar focus rings y estados de validación.
- Ajustar vía tokens o CSS de brand.

**Entregable:** Formularios coherentes con el sistema de diseño.

**Criterio de hecho:** Los formularios son legibles, accesibles y coherentes con el resto de la interfaz.

---

### ACTION-028: Ajustar perfil de usuario y vistas secundarias

**Qué:** Refinar visualmente el perfil de usuario y cualquier vista secundaria que quede inconsistente.

**Tareas concretas:**

- Revisar perfil, historial, configuración y cualquier vista menor.
- Aplicar ajustes de tokens o CSS de brand donde sea necesario.
- Documentar cualquier componente que resista la tematización por tokens.

**Entregable:** Todas las vistas del marketplace son visualmente coherentes.

**Criterio de hecho:** No hay ninguna pantalla funcional con el aspecto original del core.

---

## Fase 6 — Multi-cliente y documentación

### ACTION-029: Crear estructura de segundo cliente de ejemplo

**Qué:** Crear un segundo `BRAND_ID` de ejemplo para validar que el sistema multi-cliente funciona.

**Tareas concretas:**

- Crear `brand/tokens/demo-client/theme.css` con una paleta distinta.
- Crear `brand/assets/demo-client/` con un logo diferente.
- Crear `brand/content/demo-client/site.json` con textos distintos.
- Arrancar la app con `NEXT_PUBLIC_BRAND_ID=demo-client` y verificar.

**Entregable:** Segundo cliente renderizando correctamente con su identidad.

**Criterio de hecho:** Cambiar la variable de entorno cambia toda la identidad visual de la app sin tocar código.

---

### ACTION-030: Documentar proceso de onboarding de cliente nuevo

**Qué:** Escribir la guía paso a paso para añadir un nuevo cliente al sistema.

**Tareas concretas:**

- Documentar en `docs/brand-onboarding.md`: qué archivos crear, qué tokens sobreescribir, qué contenido configurar.
- Incluir checklist de verificación.
- Estimar tiempo de onboarding (objetivo: menos de 1 día).

**Entregable:** Guía de onboarding completa y probada.

**Criterio de hecho:** Un desarrollador que no haya participado en el proyecto puede seguir la guía y crear un cliente nuevo sin ayuda.

---

### ACTION-031: Documentar diff con upstream y estrategia de merge

**Qué:** Documentar todas las modificaciones al core del fork para facilitar futuros merges con upstream.

**Tareas concretas:**

- Crear `docs/fork-diff.md` con la lista exacta de archivos del core modificados.
- Documentar cada modificación: qué líneas cambiaron, por qué, y cómo resolver un conflicto si upstream toca ese archivo.
- Incluir script o checklist para el proceso de merge con upstream.

**Entregable:** Documentación de fork completa.

**Criterio de hecho:** El proceso de merge con una nueva versión del upstream está documentado y es reproducible.

---

### ACTION-032: Release v1.0 — tag final y entrega

**Qué:** Consolidar todo el trabajo en un release limpio.

**Tareas concretas:**

- Ejecutar test completo de todas las rutas en todos los viewports.
- Verificar que no hay errores en consola ni warnings de TypeScript.
- Limpiar código, comentarios temporales y archivos de prueba.
- Actualizar README principal del proyecto.
- Capturar screenshots finales en `docs/screenshots/v1/`.
- Commit con tag `v1.0-corporate`.

**Entregable:** Release `v1.0-corporate` lista para producción.

**Criterio de hecho:** La app es visualmente corporativa, funcionalmente completa, documentada y mantenible.

---

## Resumen visual del plan

```
FASE 0 — Preparación
  001  Clonar y verificar
  002  Sincronizar upstream
  003  Inventario visual baseline

FASE 1 — Infraestructura
  004  Crear estructura brand/
  005  Implementar resolver
  006  Mod 1: _app.tsx → CSS brand
  007  Mod 2: App → resolver
  008  Mod 3: Logo → prop src
  009  Mod 4: MarketMetadata → extensible
  010  Verificación post-habilitación

FASE 2 — Tokens
  011  Paleta de colores
  012  Tipografía
  013  Espaciado, radios, elevación
  014  Verificación visual

FASE 3 — Shell
  015  Header corporativo
  016  Footer corporativo
  017  Logo corporativo
  018  Verificación shell

FASE 4 — Landing
  019  Contenido landing en config
  020  Hero
  021  Propuesta de valor
  022  Proceso + CTA
  023  Integrar en ruta /
  024  Verificación landing

FASE 5 — Refinamiento
  025  Catálogo / búsqueda
  026  Detalle de asset
  027  Formularios
  028  Perfil y vistas secundarias

FASE 6 — Multi-cliente y docs
  029  Segundo cliente ejemplo
  030  Doc onboarding
  031  Doc diff upstream
  032  Release v1.0
```

---

_Documento preparado por Claude · Ibatec · Abril 2026_
