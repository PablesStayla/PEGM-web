# Admin Panel Structure

## Architecture

Hexagonal + Screaming Architecture

## Directories

- providers/ - Ports & Adapters
- resources/ - Business domains
- config/ - Central config
- app/ - Routes (thin)

## Resources

Each domain has:
- actions/ - Server actions
- queries/ - RSC queries
- schemas/ - Zod schemas
- components/ - UI
- index.ts - Public API

## See Also

- src/resources/README.md
- src/resources/MIGRATION-GUIDE.md
- REFACTORING-SUMMARY.md

