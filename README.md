# Bautizo Liam Matias

Base estatica lista para desplegar en Firebase Hosting.

## Estructura

- `public/index.html`: pagina inicial del evento
- `firebase.json`: configuracion de hosting
- `.firebaserc`: proyecto de Firebase a completar

## Pasos para desplegar

1. Instala Firebase CLI:
   `npm install -g firebase-tools`
2. Inicia sesion:
   `firebase login`
3. Crea un proyecto en Firebase Console y copia su `projectId`.
4. Reemplaza `REEMPLAZA_CON_TU_PROJECT_ID` en `.firebaserc`.
5. Despliega:
   `firebase deploy`

## Siguiente iteracion sugerida

- Ajustar fecha, direccion y padrinos
- Agregar galeria o cuenta regresiva
- Conectar confirmacion por WhatsApp o Google Forms
