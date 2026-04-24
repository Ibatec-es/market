# ACTION-032 — Release v1.0 — Tag final y entrega

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-031 completada. Documentación completa.

Esta es la acción final del proyecto. Consolida todo el trabajo en un release limpio, verificado y listo para producción.

## Objetivo

Ejecutar un test integral de toda la aplicación, limpiar el código, actualizar el README principal y crear el tag de release `v1.0-corporate`.

## Paso 1 — Limpiar archivos temporales y residuales

```bash
# Verificar que no hay archivos de test o prueba sin eliminar
find src/brand -name "*.test.*" -o -name "*.spec.*" | head -10
find src -name "test-import*" -o -name "*.tmp" | head -10

# Eliminar cualquier import temporal o código de prueba que se haya dejado
grep -rn "test temporal\|TODO ACTION-\|console.log\|debugger" src/brand/ --include="*.ts" --include="*.tsx"
```

Revisar y eliminar todo lo que aparezca en esos greps que no sea código de producción.

## Paso 2 — Build limpio completo

```bash
rm -rf .next
npm run build
```

El build debe completarse sin errores. Los warnings son aceptables si son del upstream (no de archivos brand).

Verificar la salida del build:

- Sin errores de TypeScript
- Sin imports no resueltos
- Sin páginas con errores de renderizado estático

```bash
npm run lint
npx tsc --noEmit
```

## Paso 3 — Test integral — recorrido completo de la aplicación

Arrancar la app y navegar sistemáticamente:

```bash
npm run dev
```

### 3.1 Landing (cliente default)

- [ ] URL `/` carga la landing corporativa
- [ ] Hero: badge, headline, subheadline, CTAs
- [ ] ValueProps: 4 cards con icono, título y descripción
- [ ] Process: 3 pasos numerados
- [ ] CtaSection: headline, subheadline, botón
- [ ] Header: logo, navegación, toggle mobile
- [ ] Footer: 3 columnas, links, copyright

### 3.2 Marketplace — Catálogo

- [ ] URL `/search` carga el catálogo
- [ ] SearchBar con estilo del sistema
- [ ] Grid de assets responsive
- [ ] Cards con borde (no sombra)
- [ ] Filtros funcionales

### 3.3 Marketplace — Detalle de asset

- [ ] Detalle de asset carga correctamente
- [ ] Panel de precio/acciones estilizado
- [ ] Tags con radio correcto
- [ ] Hashes y DIDs en monospace
- [ ] Botón de acceso/compra funcional

### 3.4 Publicación

- [ ] URL `/publish` carga el formulario
- [ ] Inputs con estilo del sistema (borde, radio, focus ring)
- [ ] Labels visibles
- [ ] Errores de validación con color correcto

### 3.5 Perfil y vistas secundarias

- [ ] URL `/profile` carga el perfil
- [ ] Tabs con estilo del sistema
- [ ] Historial de transacciones con badges de estado
- [ ] Hashes en monospace

### 3.6 Páginas de contenido

- [ ] URL `/privacy` carga con tipografía del sistema
- [ ] Contenido markdown con estilos correctos

### 3.7 Funcionalidad de wallet

- [ ] El botón de conectar wallet es visible y funcional
- [ ] El estado conectado/desconectado se muestra correctamente
- [ ] Las transacciones no están bloqueadas por los cambios visuales

### 3.8 Responsive — verificación en 3 breakpoints

Para cada sección anterior verificar en:

- Mobile (375px): layouts de 1 columna, mobile nav
- Tablet (768px): layouts de 2 columnas
- Desktop (1280px): layouts completos

### 3.9 Multi-cliente — test rápido

```bash
# Cambiar a demo-client
# Editar .env.local: NEXT_PUBLIC_BRAND_ID=demo-client
npm run dev
```

- [ ] Logo de demo-client en Header y Footer
- [ ] Colores verdes del tema de demo-client
- [ ] Contenido del `site.json` de demo-client en menú y footer
- [ ] Landing con contenido de `landing.json` de demo-client

```bash
# Restaurar a default
# Editar .env.local: NEXT_PUBLIC_BRAND_ID=default
```

## Paso 4 — Capturar screenshots finales

```bash
mkdir -p docs/screenshots/v1
```

Capturar en desktop (1280px) y mobile (375px) todas las pantallas principales para el cliente default.

Crear `docs/screenshots/v1/README.md`:

```markdown
# Screenshots — Release v1.0-corporate

Fecha: [fecha]
Tag: v1.0-corporate

## Clientes capturados

- default (Ibatec Market)

## Pantallas

[Lista de capturas]
```

## Paso 5 — Actualizar el README principal del proyecto

Actualizar `README.md` en la raíz del proyecto para reflejar la nueva arquitectura:

````markdown
# Ibatec Market

Fork corporativo de [OceanProtocolEnterprise/market](https://github.com/OceanProtocolEnterprise/market).

## Arquitectura

Este fork añade una capa de personalización de marca (`src/brand/`) sobre el core de OceanProtocol Market. El core se mantiene con el mínimo de modificaciones para facilitar la sincronización con el upstream.

Ver [docs/fork-diff.md](docs/fork-diff.md) para el detalle de las modificaciones al core.

## Desarrollo

### Prerequisitos

Ver [docs/environment.md](docs/environment.md).

### Instalación

```bash
npm install
cp .env.example .env.local
# Editar .env.local con el BRAND_ID deseado
npm run dev
```
````

### Añadir un nuevo cliente de marca

Ver la guía completa en [docs/brand-onboarding.md](docs/brand-onboarding.md).

### Sincronizar con upstream

Ver el protocolo en [docs/fork-diff.md](docs/fork-diff.md).

## Estructura de la capa brand

```
src/brand/
├── resolver.ts          # Punto único de resolución de componentes de shell
├── tokens/              # Overrides de variables CSS por cliente
├── components/          # Componentes de shell corporativos
├── assets/              # Logos y assets por cliente
└── content/             # Extensiones de site.json por cliente
```

## Clientes configurados

| BRAND_ID      | Descripción                                              |
| ------------- | -------------------------------------------------------- |
| `default`     | Ibatec Market — cliente principal                        |
| `demo-client` | Cliente de ejemplo para validar el sistema multi-cliente |

````

## Paso 6 — Ejecutar el script de verificación del diff

```bash
bash scripts/verify-fork-diff.sh
````

Debe devolver `5 correctas, 0 a verificar`.

## Paso 7 — Verificar la documentación está completa

Confirmar que existen estos documentos:

```bash
ls docs/
# environment.md
# fork-diff.md
# brand-onboarding.md
# token-exceptions.md
# phase1-verification.md
# phase4-verification.md
# screenshots/
```

## Paso 8 — Commit y tag de release

```bash
git add .
git commit -m "release: v1.0-corporate — Ibatec Market brand customization"
git tag v1.0-corporate
git push origin main --tags
```

## Paso 9 — Crear GitHub Release (opcional pero recomendado)

En GitHub, crear un Release a partir del tag `v1.0-corporate` con:

**Título:** v1.0-corporate — Ibatec Market Brand Customization

**Descripción:**

```markdown
## Qué incluye esta release

- Capa de extensión `src/brand/` sobre el fork de OceanProtocol Market
- Sistema de tokens CSS corporativo (colores, tipografía, espaciado)
- Header corporativo responsive con drawer mobile
- Footer corporativo con 3 columnas y configuración por cliente
- Landing corporativa con Hero, ValueProps, Process y CtaSection
- Sistema multi-cliente: cambiar BRAND_ID en el entorno activa la identidad visual del cliente
- Overrides de todos los componentes del marketplace al sistema de diseño
- Documentación completa: onboarding de clientes, protocolo de merge con upstream

## Archivos modificados en el core upstream (5)

Ver [docs/fork-diff.md](docs/fork-diff.md) para el detalle.

## Clientes incluidos

- `default` — Ibatec Market
- `demo-client` — Ejemplo de segundo cliente

## Cómo añadir un nuevo cliente

Ver [docs/brand-onboarding.md](docs/brand-onboarding.md).
```

## Criterio de hecho

- `v1.0-corporate` en el repositorio remoto
- Build limpio
- Test integral superado (todos los checkboxes marcados)
- Script de verificación del diff: 5/5
- README actualizado
- Documentación completa
- Screenshots de v1 capturados

**El proyecto está listo para producción.**
