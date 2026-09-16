Sublime - tienda web estatica

La tienda funciona como una pagina estatica. Sube estos archivos y carpetas a public_html en Hostinger:

- index.html
- app.js
- firebase.js
- firestore.rules
- styles.css
- catalog-data.json
- assets/
- data/

No requiere Node.js, Python, npm, variables de entorno ni un servidor propio.

El catalogo inicial se carga desde catalog-data.json y tambien se conserva en localStorage. El carrito, favoritos, resenas, configuracion del panel ADMIN y registro local de ventas funcionan en el navegador.

La confirmacion del pedido abre WhatsApp. Las imagenes, la libreria de iconos, jsPDF y Firebase se cargan desde sus CDN; el sitio necesita conexion a Internet para esas funciones.

Para publicar:

1. Abre el Administrador de archivos de Hostinger.
2. Entra en public_html.
3. Sube el contenido de esta carpeta conservando las rutas relativas.
4. Abre el dominio y comprueba catalogo, carrito y checkout.

Reglas Firestore:

1. En Firebase Console abre Firestore Database > Rules.
2. Copia el contenido de firestore.rules.
3. Pulsa Publish.
4. Comprueba en el panel ADMIN que la coleccion se llame productos.

Advertencia: estas reglas permiten lectura y escritura publica porque este proyecto no usa Firebase Authentication. El login ADMIN del frontend no protege la base de datos. Para produccion debes añadir autenticacion Firebase y cambiar las reglas para exigir request.auth != null.

Imágenes de productos:

Las fotos nuevas se suben a Firebase Storage. Firestore guarda únicamente la URL de descarga, nunca la imagen en Base64. Esto evita el límite de 1 MiB por documento de Firestore y funciona también en publicación estática.

Configuración obligatoria, una sola vez:

1. En Firebase Console abre Storage y crea/activa el bucket si aún no existe.
2. Abre Storage > Rules, copia el contenido de storage.rules y pulsa Publish.
3. Comprueba que storageBucket en la configuración de Firebase corresponde a tu proyecto.
4. En ADMIN > Productos, selecciona una o varias imágenes y espera el mensaje “Imagen guardada en Firebase”.

La regla incluida permite subidas públicas solo dentro de productos/, admite JPG, PNG y WEBP y limita cada archivo a 8 MB. Para producción, añade Firebase Authentication y cambia la condición de escritura a request.auth != null.
