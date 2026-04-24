# ACTION-002 — Sincronizar con upstream y resolver conflictos

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-001 completada. El fork arranca en local. Tag `v0-baseline` existe.

## Objetivo de esta acción

Incorporar los cambios más recientes del upstream antes de empezar cualquier personalización. Es mucho más barato resolver conflictos ahora (cero código propio) que después (con la capa brand encima).

## Tareas

### 1. Añadir el remote upstream

```bash
git remote add upstream https://github.com/OceanProtocolEnterprise/market.git
git remote -v
# Debe mostrar tanto origin (Ibatec-es) como upstream (OceanProtocolEnterprise)
```

### 2. Fetch y comparar

```bash
git fetch upstream
git log HEAD..upstream/main --oneline
```

Esto muestra los commits del upstream que no están en el fork. Revisar si alguno afecta a:

- `src/pages/_app.tsx`
- `src/components/App/`
- `src/components/Header/`
- `src/components/Footer/`
- `src/components/Home/`
- `src/stylesGlobal/`
- `src/@context/MarketMetadata/`

Estos son los archivos que se tocarán en acciones posteriores. Si el upstream los ha modificado, es importante saberlo ahora.

### 3. Merge o rebase

Si hay cambios en upstream:

```bash
git merge upstream/main
# o
git rebase upstream/main
```

Resolver conflictos si los hay. Prioridad: mantener el comportamiento del upstream en archivos del core. No hay código propio que proteger todavía.

Si no hay cambios relevantes en upstream, documentarlo y continuar.

### 4. Verificar tras el merge

```bash
npm install  # por si el upstream actualizó dependencias
npm run dev
```

Navegar las mismas rutas verificadas en ACTION-001. Confirmar que todo sigue funcionando.

### 5. Documentar el estado del sync

Añadir sección a `docs/environment.md`:

```markdown
## Sincronización con upstream

- Fecha de sync: [fecha]
- Último commit del upstream incorporado: [hash y mensaje]
- Commits del upstream no presentes antes del merge: [número o "ninguno"]
- Archivos en conflicto resueltos: [lista o "ninguno"]
- Archivos del core relevantes modificados por upstream: [lista o "ninguno"]
```

### 6. Tag post-sync

```bash
git tag v0-synced
git push origin main --tags
```

## Patrón a seguir

Merge directo sobre `main`. No crear rama para esto — es preparación, no feature.

Si hay conflictos en archivos del core que también se modificarán en acciones futuras (Header, Footer, App, estilos), resolverlos a favor del upstream y anotarlo. La personalización vendrá encima, no mezclada.

## Qué evitar

- No hacer cherry-pick selectivo de commits del upstream. O se hace merge completo o se documenta explícitamente por qué no.
- No actualizar versiones de dependencias manualmente durante este paso.
- No resolver conflictos "a favor del fork" si el fork aún no tiene código propio. Siempre gana upstream en esta fase.

## Entregable

- `docs/environment.md` actualizado con la sección de sync.
- Tag `v0-synced` en el repositorio remoto.
- El proyecto compila y funciona tras el merge.

## Criterio de hecho

`git log --oneline upstream/main ^HEAD` no muestra commits pendientes. `npm run dev` funciona. Tag `v0-synced` en remoto.
