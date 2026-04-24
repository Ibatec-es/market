# Diagnostico de personalizacion corporativa del layout en `market`

## Objetivo

Evaluar que cambios son necesarios para adaptar el layout y el diseño del proyecto `market` a una identidad visual corporativa, minimizando modificaciones sobre el codigo base del fork.

El objetivo de esta fase no es definir aun la estructura final, sino:

- identificar donde vive hoy el layout, el branding y la composicion visual
- distinguir que partes ya son configurables por contenido y cuales estan acopladas al core
- determinar que recursos conviene sobre-escribir o extender
- validar si es viable una carpeta `custom` o `template` para aislar la personalizacion
- preparar la siguiente fase de propuesta tecnica

---

## Resumen ejecutivo

El proyecto ya permite cierta personalizacion de contenido, pero no esta preparado todavia para una personalizacion visual corporativa profunda sin tocar el core.

Hoy existen dos niveles muy distintos de configuracion:

1. **Contenido configurable**: titulos, menu, footer parcial, paginas markdown y algunos textos JSON.
2. **Shell visual hardcodeado**: `Header`, `Footer`, `Home`, logos, iconografia, variables CSS globales y parte del layout compartido.

La conclusion del diagnostico es clara:

- **Si solo se quiere cambiar copy, enlaces, SEO y algunas paginas informativas**, el proyecto ya ofrece puntos de extension suficientes mediante `content/`.
- **Si se quiere una apariencia corporativa real**, con landing propia, header/footer de marca, sistema visual propio y componentes de portada personalizados, hace falta introducir una capa de extension estable.
- **Sin una pequena adaptacion inicial del core no existe hoy un mecanismo limpio de override**. La razon principal es que los imports de layout y branding apuntan directamente a implementaciones concretas en `src/components`, `src/@images` y `src/stylesGlobal`.

En otras palabras: el enfoque de carpeta `custom` es viable, pero primero hay que habilitar uno o varios puntos de resolucion para que el core deje de depender de recursos visuales cerrados.

---

## Estructura actual relevante para layout y branding

### 1. Entrada principal de la app

Archivo clave: `src/pages/_app.tsx`

Responsabilidades:

- carga los estilos globales desde `src/stylesGlobal/styles.css`
- monta providers globales
- envuelve todas las paginas con `src/components/App`

Implicacion:

- cualquier estrategia de tema corporativo acaba pasando por `_app.tsx`
- si en el futuro se quiere cargar una hoja de estilos corporativa o un proveedor de tema adicional, este es uno de los anclajes correctos

### 2. Shell global de la aplicacion

Archivo clave: `src/components/App/index.tsx`

Responsabilidades:

- renderiza `AnnouncementBanner`
- decide si mostrar `Header`
- envuelve el contenido en `main`
- renderiza `Footer`
- monta modales y componentes transversales

Diagnostico:

- este archivo es el **controlador real del shell visual**
- hoy importa directamente `../Header` y `../Footer/Footer`
- por tanto, **no hay desacoplamiento entre shell y marca**

Conclusión tecnica:

- si se quiere un layout corporativo extensible, este es uno de los primeros puntos que deberia pasar a consumir una capa intermedia tipo `getShellComponents()` o imports resueltos desde una carpeta `custom`

### 3. Wrapper de pagina compartido

Archivo clave: `src/components/@shared/Page/index.tsx`

Responsabilidades:

- SEO compartido
- cabecera de pagina (`PageHeader`)
- uso de `Container`
- decisiones de ancho para home vs resto de paginas

Diagnostico:

- este wrapper define la experiencia visual base de casi todas las paginas internas
- la home es una excepcion visual tratada con `isHome`
- si se quiere personalizar jerarquias visuales, espaciados globales o encabezados de seccion, este es otro punto de extension critico

### 4. Home / landing actual

Archivos clave:

- `src/pages/index.tsx`
- `src/components/Home/index.tsx`
- `src/components/Home/index.module.css`
- `src/components/Home/Menu/Menu.tsx`

Diagnostico:

- la portada actual esta **muy acoplada a una demo concreta**
- hay textos hardcodeados como `Ocean Enterprise Demonstration Marketplace` y `Demonstration MarketPlace`
- la home tiene su propia variante de menu y su propio layout visual
- para una landing corporativa real, esta area es la primera candidata a sustitucion completa

Conclusión tecnica:

- la futura landing personalizada deberia considerarse una pieza separada del core, idealmente bajo una capa `custom/pages` o `custom/components/home`

### 5. Header global

Archivos clave:

- `src/components/Header/index.tsx`
- `src/components/Header/Menu.tsx`

Diagnostico:

- el header no se construye plenamente desde `content/site.json`
- aunque `siteContent.menu` existe, su render esta comentado en `Header/Menu.tsx`
- hay CTA, textos y composicion hardcodeados
- la navegacion movil y desktop estan implementadas directamente en el componente

Implicacion:

- el header es parcialmente configurable en datos, pero **no es realmente tematizable ni componible**
- cualquier adaptacion corporativa de navbar, CTA, accesos rapidos o estructura de marca requiere override de componente, no solo cambio de contenido

### 6. Footer global

Archivos clave:

- `src/components/Footer/Footer.tsx`
- `src/components/Footer/Links.tsx`
- `content/site.json`

Diagnostico:

- parte del footer si se alimenta desde `siteContent.footer`
- pero el bloque de logo y redes sociales esta hardcodeado en `Footer.tsx`
- las URLs sociales y los iconos no dependen del contenido

Implicacion:

- el footer actual permite un nivel medio de personalizacion
- para un footer corporativo completo se necesita externalizar logo, redes, estructura y posiblemente variantes de layout

### 7. Branding grafico

Archivos clave:

- `src/components/@shared/atoms/Logo/index.tsx`
- `src/@images/logo.svg`
- otros assets SVG en `src/@images/`

Diagnostico:

- el logo principal sale de un import directo a `@images/logo.svg`
- esto funciona para un branding unico, pero no para variantes de marca, multicliente o templates
- no existe un registro de assets corporativos ni una resolucion dinamica por tema

### 8. Sistema visual global

Archivos clave:

- `src/stylesGlobal/styles.css`
- `src/stylesGlobal/_variables.css`
- `src/stylesGlobal/_colors.css`

Diagnostico:

- el proyecto ya usa variables CSS de forma bastante extensa
- esto es positivo porque permite tematizacion sin reescribir todos los componentes
- aun asi, los ficheros viven en el core y se importan directamente desde `_app.tsx`
- ademas, algunos componentes siguen usando colores y medidas literales en CSS modules

Conclusión tecnica:

- la capa de tokens es el mejor candidato para una personalizacion corporativa sostenible
- pero necesita una estrategia de carga que permita overrides sin editar el archivo base en cada actualizacion del fork

### 9. Paginas informativas y contenido markdown

Archivos clave:

- `src/pages/[slug].tsx`
- `src/pages/privacy/[slug].tsx`
- `src/@utils/markdownPages.tsx`
- `content/pages/*.md`
- `content/pages/privacy/*.md`

Diagnostico:

- aqui ya existe una via limpia para agregar paginas basadas en markdown
- este mecanismo es bueno para terminos, politicas, paginas institucionales simples o incluso una landing editorial ligera
- no es suficiente para una landing corporativa compleja con componentes reutilizables, hero avanzado, bloques dinamicos o integracion de widgets

Conclusión tecnica:

- las paginas markdown son una extension ya disponible
- para una landing real probablemente convendra una ruta React propia, no solo markdown

---

## Que ya se puede personalizar sin tocar arquitectura

### Nivel contenido

Recursos ya extendibles:

- `content/site.json`
  - titulo del sitio
  - tagline
  - enlaces del menu
  - estructura parcial del footer
  - mensajes de anuncio
- `content/pages/*.md`
  - paginas genericas por slug
- `content/pages/privacy/*.md`
  - contenido legal y de privacidad
- `content/pages/*.json`
  - textos de formularios y paginas funcionales

Valoracion:

- util para personalizacion editorial
- insuficiente para una rebrandizacion visual corporativa profunda

### Nivel rutas existentes

Es viable añadir paginas nuevas en `src/pages/` como:

- una landing especifica
- una pagina de presentacion corporativa
- una pagina comercial o de captacion

Pero actualmente esto seguiria heredando el shell base (`App`, `Page`, `Header`, `Footer`) salvo que la nueva pagina lo esquive de forma explicita.

---

## Recursos que hoy conviene sobre-escribir o encapsular

Estos son los recursos que, segun el analisis, deberian poder sobre-escribirse o resolverse desde una capa `custom`.

### Prioridad alta

1. `src/components/App/index.tsx`

   - controla shell global
   - decide header, footer y estructura principal

2. `src/components/@shared/Page/index.tsx`

   - controla layout compartido interior
   - concentra SEO, container y page header

3. `src/components/Home/index.tsx`

   - landing actual acoplada a demo

4. `src/components/Home/Menu/Menu.tsx`

   - variante especifica del menu de portada

5. `src/components/Header/Menu.tsx`

   - header principal con CTA y branding hardcodeados

6. `src/components/Footer/Footer.tsx`

   - bloque corporativo hardcodeado

7. `src/components/@shared/atoms/Logo/index.tsx`

   - punto minimo para resolver logos por template

8. `src/stylesGlobal/_colors.css`
9. `src/stylesGlobal/_variables.css`
10. `src/stylesGlobal/styles.css`

### Prioridad media

1. `src/components/@shared/Page/PageHeader/*`

   - si se quiere una cabecera interior propia

2. `src/components/@shared/Page/Seo/index.tsx`

   - si el branding corporativo requiere reglas SEO distintas por template

3. `content/site.json`

   - sigue siendo util, pero deberia poder ser extendido o mezclado con contenido custom

4. `src/@images/*`
   - iconos y assets de marca

---

## Limitaciones actuales para una estrategia de fork extensible

### 1. Imports directos al core

La mayor limitacion es estructural:

- `App` importa `Header` y `Footer` directamente
- `Logo` importa `logo.svg` directamente
- `_app.tsx` importa `styles.css` directamente
- `MarketMetadataProvider` importa `content/site.json` directamente

Esto hace que una carpeta `custom` no pueda entrar en juego sin:

- cambiar imports existentes, o
- introducir alias/resolvedores, o
- añadir una capa de composicion intermedia

### 2. Mezcla de contenido configurable con estructura hardcodeada

Hay componentes que leen datos de `content/`, pero combinados con:

- textos hardcodeados
- logos fijos
- iconos fijos
- bloques de CTA cerrados

Resultado:

- el contenido por si solo no controla la experiencia de marca

### 3. Duplicacion de navegacion entre home y resto de la app

Existen al menos dos menus distintos:

- `src/components/Header/Menu.tsx`
- `src/components/Home/Menu/Menu.tsx`

Esto eleva el coste de una personalizacion corporativa consistente.

### 4. Tema parcial por variables, pero sin mecanismo de override

El sistema de tokens CSS es aprovechable, pero falta una de estas capacidades:

- importar un tema corporativo despues del tema base
- resolver variables desde un archivo custom
- activar un selector de marca por configuracion

---

## Viabilidad de una carpeta `custom` o `template`

### Evaluacion

La idea es **viable y recomendable**, pero en el estado actual del proyecto no basta con crear una carpeta nueva y empezar a usarla. Hace falta habilitar algunos puntos de extension en el core para que la personalizacion no se convierta en una bifurcacion permanente.

### Lo que si parece razonable

Una carpeta tipo:

`src/custom/`

o

`src/templates/corporate/`

podria alojar en el futuro:

- componentes de shell
- landing propia
- assets de marca
- tokens CSS
- contenido adicional
- wrappers de pagina

### Lo que no es viable aun sin adaptar el core

No es viable hoy, sin cambios previos, pretender que esa carpeta sobre-escriba de forma limpia:

- header
- footer
- home
- logo
- estilos globales
- `siteContent`

La razon es que no hay una capa de resolucion ni un contrato de extension.

---

## Opciones de extension detectadas en esta fase

No es aun la propuesta definitiva, pero el diagnostico deja ver tres caminos posibles.

### Opcion A. Personalizacion solo por contenido

Consiste en apoyarse principalmente en:

- `content/site.json`
- `content/pages/*.md`
- `content/pages/*.json`

Ventajas:

- impacto minimo
- casi sin cambios de arquitectura

Limites:

- no resuelve branding corporativo real
- no resuelve landing custom rica
- no resuelve shell visual

Valoracion:

- insuficiente para el objetivo planteado

### Opcion B. Overwrite directo de componentes core

Consiste en modificar directamente:

- `App`
- `Header`
- `Footer`
- `Home`
- estilos globales

Ventajas:

- rapida de ejecutar a corto plazo

Limites:

- mala mantenibilidad en un fork
- alto coste en merge de actualizaciones del upstream

Valoracion:

- desaconsejada como estrategia principal

### Opcion C. Introducir una capa de extension y luego personalizar

Consiste en hacer una adaptacion minima del core para que ciertos recursos se resuelvan desde una carpeta custom o template.

Ventajas:

- compatible con mantener el fork actualizado
- permite branding fuerte
- permite paginas y layout propios
- reduce diffs recurrentes con upstream

Limites:

- requiere una primera intervencion tecnica bien pensada

Valoracion:

- es la opcion mas coherente con el objetivo del proyecto

---

## Diagnostico por areas

### Branding visual

Estado:

- parcialmente tokenizado
- parcialmente hardcodeado

Necesidad:

- extraer o resolver logos, paleta, tipografia y assets desde capa custom

### Layout global

Estado:

- centralizado en pocos puntos (`App`, `Page`)
- eso es bueno para intervenir con poco alcance

Necesidad:

- convertir esos puntos en extensibles

### Navegacion

Estado:

- datos en `site.json`, pero implementacion visual cerrada

Necesidad:

- separar configuracion de navegacion de representacion visual

### Paginas personalizadas

Estado:

- markdown ya soportado
- paginas React nuevas tambien son posibles

Necesidad:

- decidir si la landing sera markdown enriquecido o una pagina React corporativa
- para un resultado premium, la segunda opcion parece mas adecuada

---

## Riesgos y consideraciones

1. **Riesgo de tocar demasiados componentes visuales sueltos**

   - si no se centraliza la extension, la personalizacion se repartira por todo `src/components`

2. **Riesgo de doble mantenimiento home/header/footer**

   - ahora mismo ya hay duplicidad parcial en la navegacion

3. **Riesgo de falsa sensacion de configurabilidad**

   - `site.json` ayuda, pero no gobierna la experiencia de marca completa

4. **Riesgo de acoplar branding a datos de negocio**

   - conviene separar claramente configuracion visual de configuracion funcional

5. **Riesgo de romper merges con upstream**
   - cualquier cambio directo sobre shell y estilos base aumentara el coste del fork si no se hace una capa de extension bien localizada

---

## Conclusiones del diagnostico

### Lo que el proyecto ya ofrece

- contenido configurable por JSON y markdown
- rutas estaticas faciles de ampliar
- sistema de tokens CSS reutilizable
- pocos puntos de control del shell global

### Lo que falta para soportar un template corporativo real

- una capa de resolucion para componentes de shell
- una estrategia de override de estilos globales y tokens
- una resolucion de assets de marca desacoplada del core
- una forma de extender `siteContent` sin depender solo de imports directos

### Veredicto

La estrategia correcta para este fork no es modificar visualmente el core de forma distribuida, sino **introducir una capa pequeña y estable de extensibilidad** y construir encima de ella la personalizacion corporativa.

En la siguiente fase deberia definirse:

- que carpeta se utilizara (`custom`, `brand`, `template`, etc.)
- que contratos de extension necesita el core
- que recursos pasaran a ser sobre-escribibles
- como añadir una landing personalizada sin romper el comportamiento base

---

## Inventario resumido de puntos de intervencion

### Ya configurables

- `content/site.json`
- `content/pages/*.md`
- `content/pages/privacy/*.md`
- `content/pages/*.json`

### Requieren extension controlada

- `src/components/App/index.tsx`
- `src/components/@shared/Page/index.tsx`
- `src/components/Home/index.tsx`
- `src/components/Home/Menu/Menu.tsx`
- `src/components/Header/Menu.tsx`
- `src/components/Footer/Footer.tsx`
- `src/components/@shared/atoms/Logo/index.tsx`
- `src/stylesGlobal/styles.css`
- `src/stylesGlobal/_variables.css`
- `src/stylesGlobal/_colors.css`
- `src/@context/MarketMetadata/index.tsx`

### Aptos para landing personalizada futura

- `src/pages/index.tsx`
- `src/pages/[slug].tsx`
- nuevas rutas en `src/pages/`
