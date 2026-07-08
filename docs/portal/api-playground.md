# Overview

Playground para explorar y probar contratos OpenAPI del proyecto.

## Purpose

1. Validar requests/responses de endpoints criticos sin depender de UI.
2. Acelerar debugging de integraciones y QA funcional.
3. Facilitar handoff entre backend, frontend y QA.

## Prerequisites

1. Tener pnpm instalado.
2. Tener puertos locales disponibles para preview.
3. Tener el repo sincronizado con contratos OpenAPI.

## Instructions

1. Levantar playground del contrato critico web:
   - pnpm docs:playground:web-critical
2. Levantar playground del contrato general:
   - pnpm docs:playground:api
3. Abrir la URL que imprime Redocly (por defecto puerto 8090).
4. Probar endpoints desde el panel interactivo o exportar requests.

## Contracts disponibles

1. Contrato general:
   - contracts/openapi/api.yaml
2. Contrato critico web:
   - contracts/openapi/web-critical.yaml

## Notas operativas

1. El playground se usa para validacion manual y exploracion de contrato.
2. Las pruebas automatizadas siguen ejecutandose en Vitest/Playwright.
3. Mantener este flujo alineado con docs/audits/AUDITORIA_MASTER_2026.md.
