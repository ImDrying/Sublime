Sublime - hosting con bot IA Gemini

Catalogo en Firebase Firestore

La tienda ya no depende de catalog-data.json como fuente principal. app.js se conecta a Firebase Firestore y escucha en tiempo real la coleccion:

  productos

Cuando agregas, editas o eliminas productos desde el Panel ADMIN, la pagina usa Firestore:

- Crear: addDoc
- Editar: updateDoc
- Eliminar: deleteDoc
- Vista cliente: onSnapshot

Campos usados en cada producto:

  id, externalId, nombre, name, categoria, category, material, precioUSD, price, descripcion, desc, imagenes, images, sku, stock, published, rating, color, colors, tag

Importante para Hostinger/local:

- Debes tener Firestore creado en el proyecto Firebase sublimeweb-218bd.
- Debes permitir el dominio donde hostees la web en Firebase si activas restricciones de API key.
- Revisa las reglas de Firestore. El login ADMIN actual protege la interfaz, pero las reglas de Firestore son las que protegen la base de datos frente a accesos directos.
- catalog-data.json queda solo como respaldo si Firebase no carga.

Para que el bot funcione tal cual como en Vento, la web debe tener una ruta backend segura:

  /api/chat

Esa ruta usa la variable privada GEMINI_API_KEY. La key NO debe ir dentro de index.html ni app.js.

Archivos que debes subir:

- index.html
- styles.css
- app.js
- catalog-data.json
- assets/sublime-logo-2026.png
- sublime-ai-server.js
- package.json
- vercel.json
- carpeta api/chat.js
- carpeta api/_sublime-ai.js
- firebase.js

Opcion recomendada: Vercel

1. Sube todos los archivos a Vercel.
2. En Vercel, abre Project Settings > Environment Variables.
3. Crea esta variable:

   GEMINI_API_KEY = tu key de Gemini

4. Redeploy / vuelve a publicar.
5. Prueba la tienda. El chat llamara automaticamente a:

   /api/chat

Prueba rapida:

   https://tudominio.com/api/chat

Debe responder algo como:

   {"ok":true,"service":"sublime-ai"}

Hosting Node normal, por ejemplo Render, Railway, VPS o similar:

1. Sube todos los archivos.
2. Configura la variable privada:

   GEMINI_API_KEY = tu key de Gemini

3. Usa este comando de inicio:

   node sublime-ai-server.js

4. Abre la tienda desde el mismo servidor:

   https://tudominio.com

El servidor ahora atiende tanto la pagina como el bot. Si por alguna razon sirves la pagina en otro dominio, configura en Panel ADMIN el endpoint completo:

   https://tudominio.com/api/chat

Cuando una compra confirma un cupon de embajadora, la tienda:

1. Incrementa el contador del cupon en Firestore.
2. Crea el historial en historial_usos_cupones.
3. Incluye el cupon y la embajadora en el mensaje de pedido por WhatsApp.

Prueba local:

En Mac/Linux:

   export GEMINI_API_KEY="TU_KEY_DE_GEMINI"
   node sublime-ai-server.js

En Windows PowerShell:

   $env:GEMINI_API_KEY="TU_KEY_DE_GEMINI"
   node sublime-ai-server.js

Luego abre:

   http://localhost:8787

No abras index.html haciendo doble clic si quieres probar el bot completo. Abre la URL del servidor para que pagina y backend usen el mismo origen.

Importante:

- Si usas solo hosting estatico, sin backend, el bot no puede tener IA real.
- Si /api/chat no existe en el hosting, el bot intentara otros endpoints y luego usara respuestas locales.
- Si GEMINI_API_KEY no esta configurada en el hosting, el bot mostrara que falta la variable.
- Si todavia no tienes backend funcionando, entra al Panel ADMIN > General > IA y APIs y desactiva "Mostrar bot en vista cliente" para ocultarlo temporalmente.
- No pegues la key en app.js, HTML, consola del navegador ni archivos publicos.

Checklist si el bot falla al hostear:

1. Confirma que subiste la carpeta api completa, incluyendo api/chat.js y api/_sublime-ai.js.
2. Confirma que GEMINI_API_KEY existe como variable privada en el hosting.
3. Vuelve a publicar/redeploy despues de crear la variable.
4. Abre /api/chat en el navegador y verifica que responda ok.
5. Recarga la tienda completa.
