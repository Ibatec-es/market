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

### Añadir un nuevo cliente de marca

Ver la guía completa en [docs/brand-onboarding.md](docs/brand-onboarding.md).

### Sincronizar con upstream

Ver el protocolo en [docs/fork-diff.md](docs/fork-diff.md).

## Estructura de la capa brand

```text
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
