.PHONY: help install start dev lint lint-fix format format-check test test-watch

# Muestra todos los comandos disponibles por defecto
help:
	@echo "Comandos disponibles en el SIA-Project:"
	@echo "  make install        - Instala todas las dependencias del proyecto"
	@echo "  make start          - Inicia el servidor de producción"
	@echo "  make dev            - Inicia el servidor en modo desarrollo"
	@echo "  make lint           - Analiza el código con ESLint en busca de errores"
	@echo "  make lint-fix       - Analiza y corrige automáticamente los errores de ESLint"
	@echo "  make format         - Formatea todo el código usando Prettier"
	@echo "  make format-check   - Verifica si el código está bien formateado (falla si no lo está)"
	@echo "  make test           - Ejecuta todos los tests (Unitarios y E2E) con reporte de cobertura"
	@echo "  make test-watch     - Ejecuta los tests en modo observador (watch mode)"

install:
	npm install

start:
	npm start

dev:
	npm run dev

lint:
	npm run lint

lint-fix:
	npm run lint:fix

format:
	npm run format

format-check:
	npm run format:check

test:
	npm test

test-watch:
	npm run test:watch
