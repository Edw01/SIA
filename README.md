# SIA

SIA (**Sistema de Inscripcion de Asignaturas**), es un proyecto academico cuyo enfoque va dirigido a estudiantes, coordinadores, directores, entre otros, con el principal proposito de resolver y maximizar la eficiencia en los largos periodos de inscripcion de asignaturas universitarias. El objetivo es utilizar correctamente los principios SOLID, patrones de diseño y evitar errores que estropeen a largo plazo el codigo. Aprendizaje sobre todo.

## Instalación 🔧

1. Clonar el repositorio.

2. Tener instalado PostgreSQL y Pgadmin4.

3. Crear una DB de PostgreSQL mediante Pgadmin4, cuyos datos de la DB se usaran en el archivo ".env".

4. En la DB recien creada utilizar el contenido del archivo "SIA/database/schema.sql" en la opcion _Query Tool_, y finalmente usar la opcion "Play", añadiendo asi todas las tablas necesarias para la pagina web.

5. Asegurarse de que la DB creada este iniciado.

6. Encontrarse en el directorio main (SIA/).

7. Levantar el servidor local para la pagina web en la consola (Bash) mediante:

```
make start
```

8. Ahora en tu consola deberia indicar la direccion en la que se encuentra la pagina, ingresa y listo.

9. Para cerrar el servidor local solo debes interrumpir la consola, ejemplo: _CTRL + C_.

## Ejecucion de tests ⚙️

Con el siguiente comando en consola (Bash) puedes ejecutar los tests.

Tras ubicarse en el directorio main (SIA/), ejecute el siguiente comando

```
make test
```

Esto realizara un recorrido por el proyecto indicando zonas no cubiertas (coverage) con tests mientras que ejecuta los tests existentes.

## Proyecto construido con 🛠️

- HTML5 - Estructuración semántica del contenido y maquetado de la interfaz de usuario.
- CSS3 - Diseño visual, estilos responsivos y animaciones para la experiencia de usuario.
- JavaScript - Lógica de programación del lado del cliente y manejo de interactividad dinámica.
- [Node.js](https://nodejs.org/en) - Entorno de ejecución de JavaScript en el servidor.
- [Express](https://expressjs.com/) - Framework minimalista y flexible para la creación de rutas, middleware y el manejo de peticiones HTTP.
- [PostgreSQL](https://www.postgresql.org/) - Base de datos empleada.
- [Postman](https://www.postman.com/) - Usado para las pruebas de sistema.

## Autores ✒️

- **Pablo Vicente Urra**
- **Jose Mardones**
- **Eduardo Necul**
