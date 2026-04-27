# Firestore Setup

## 1. Completar la configuracion web

Abre [public/firebase-config.js](/c:/Users/wal_l/Escritorio/Personal/Bautizo%20Liam%20Matias/public/firebase-config.js) y reemplaza:

- `REEMPLAZA_API_KEY`
- `REEMPLAZA_MESSAGING_SENDER_ID`
- `REEMPLAZA_APP_ID`

Estos valores salen en Firebase Console:

1. `Configuracion del proyecto`
2. `Tus apps`
3. `App web`
4. `Configuracion`

## 2. Activar Firebase Authentication para el admin

En Firebase Console:

1. Ve a `Authentication`
2. Abre `Sign-in method`
3. Habilita `Email/Password`
4. Crea el usuario administrador en `Users`

El panel [public/admin.html](/c:/Users/wal_l/Escritorio/Personal/Bautizo%20Liam%20Matias/public/admin.html) ahora usa correo y contrasena de Firebase Auth.

## 3. Desplegar reglas actuales

Las reglas activas permiten:

- leer `invitados`
- administrar `invitados` si hay sesion iniciada
- marcar `invitados.hasRsvp` desde el sitio publico cuando un pase ya fue confirmado
- escribir `confirmaciones`
- leer y eliminar `confirmaciones` si hay sesion iniciada
- bloquear escritura publica directa en `invitados`, salvo la marca segura `hasRsvp`

Importante:

- `confirmaciones` ya no se puede leer publicamente
- el sitio publico puede seguir guardando RSVP
- el sitio publico tambien puede marcar `hasRsvp: true` en `invitados` para ocultar el formulario en otros dispositivos
- el panel `/admin.html` necesita una sesion activa de Firebase Authentication para leer confirmaciones desde Firestore

Despliegue:

```powershell
firebase deploy --only firestore:rules
```

## 4. Importar invitados desde el admin

El boton `Importar invitados` en `/admin.html` toma los datos de [public/invitados.json](/c:/Users/wal_l/Escritorio/Personal/Bautizo%20Liam%20Matias/public/invitados.json) y los escribe en la coleccion `invitados`.

Con las reglas actuales, esa importacion funciona si ya iniciaste sesion en `/admin.html` con una cuenta de Firebase Auth.

## 5. Colecciones

Colecciones esperadas:

- `invitados`
  - documento id: UUID, por ejemplo `0f4c1d7a-8b34-4e25-a9a0-5b4d9a0ef101`
  - campos: `name`, `passSize`, `table`
  - opcional para invitaciones especiales: `tables`
    - ejemplo: `[{ "table": 1, "count": 2, "group": "Adultos" }, { "table": 4, "count": 2, "group": "Jovenes" }]`

- `confirmaciones`
  - documento id: UUID del invitado
  - campos: `attendance`, `message`, `guestId`, `guestName`, `passSize`, `updatedAt`

## 6. Nota importante

Las reglas actuales consideran administrador a cualquier usuario autenticado dentro de este proyecto de Firebase.

Si luego quieres restringir el acceso solo a ciertos usuarios, el siguiente paso correcto es agregar roles o `custom claims`.
