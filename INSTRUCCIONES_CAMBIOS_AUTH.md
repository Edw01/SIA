# Cambios listos para la rama Pablo_Urra

## Cómo aplicar

Desde la raíz del proyecto:

```bash
git checkout Pablo_Urra
```

Copia estos archivos encima del proyecto respetando las rutas. Luego:

```bash
git add backend frontend .env.example
git commit -m "feat(auth): add backend auth and enrollment validations"
git push origin Pablo_Urra
```

## Qué incluye

- JWT access token y refresh token.
- Middleware de autenticación.
- Middleware de autorización por rol.
- Protección de rutas admin, coordinador y estudiante.
- Validaciones backend de IDs, strings, cupos y créditos.
- Inscripción y retiro usando transacciones PostgreSQL.
- Bloqueo de doble inscripción activa.
- El backend deja de confiar en `estudianteId` enviado por el body para inscribir o retirar.
- Frontend actualizado para enviar `Authorization: Bearer <token>`.
- Refresh automático de sesión desde el frontend.

## Variables nuevas

Agrega estas variables a tu `.env` real:

```env
JWT_SECRET=cambiar_este_secreto_de_access_token
JWT_REFRESH_SECRET=cambiar_este_secreto_de_refresh_token
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

## Prueba manual rápida

1. Levanta el servidor.
2. Entra al login con un RUT existente.
3. Revisa que en localStorage aparezcan:
   - `sia_user`
   - `sia_access_token`
   - `sia_refresh_token`
4. Como estudiante, prueba inscribir y retirar.
5. Como estudiante, intenta llamar una ruta admin desde Postman sin rol admin: debe devolver 403.
6. Sin token, intenta llamar `/api/inscribir`: debe devolver 401.
