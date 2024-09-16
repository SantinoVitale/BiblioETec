# BiblioETec - Frontend/Backend

[![](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz4M8eYT4C1dsZCnOxoq8lsmy1A1EcNCZb8rZPPvqgP-YHCU2cpJHfpNVkaP3lbL74MHk&usqp=CAU)](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz4M8eYT4C1dsZCnOxoq8lsmy1A1EcNCZb8rZPPvqgP-YHCU2cpJHfpNVkaP3lbL74MHk&usqp=CAU)


------------



Sitio web de la Escuela Técnica de la Universidad de Mendoza para el registro y adminitración de entrada/salida de libros para el proyecto de biblioteca creado por Guadalupe Badino junto con Wisibilizalas. 

Creado con ReactJS (v18.), [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database "MongoDB Atlas") y NodeJS (v20.17).

Creado por Santino Vitale.

------------



#### Repositorios:
-  [Backend](https://github.com/SantinoVitale/BiblioETec-Backend)
- [Frontend](https://github.com/SantinoVitale/BiblioETec-Frontend "Frontend")

------------


#### Instalación:
##### Backend:
1. Clonar el repositorio y en la carpeta donde se clonó instalar todas las dependencias:

	`npm install`

2. Una vez instalada las dependencias, se configura el .env.sample para ajustarse a su configuracion de servidor y BDD :

	

    	MONGO_PASS= <<<PASSWORD DE MONGO>>>
    	MONGO_URL= <<<URL DE MONGO>>>
    	PORT= <<<PUERTO DEL BACKEND>>>
    	JWT_SECRET= <<<PASSWORD DE JWT>>>
    	GOOGLE_USER = <<<GMAIL DEL USUARIO>>>
    	GOOGLE_PASS = <<<PASSWORD DEL USUARIO DE GMAIL>>>
    	API_URL = <<<URL DE REDIRECCION>>>

3. Una vez configurado el .env.sample, se le cambia el nombre a .env.development.local para entorno de desarrollo o .env.production.local para entorno de producción.

4. Una vez realizado todo esto ya puede iniciar el proyecto con: 
`npm run devel` ó `npm start` dependiendo del entorno en el que estén iniciando el proyecto.

5. Si una vez realizado todo esto en la consola aparece un logger avisando en que puerto está conectado a la base de datos seguido de un "¡Conectado!" ya tiene todo armado para la parte del backend


------------

##### Frontend:

1.  Clonar el repositorio y en la carpeta donde se clonó instalar todas las dependencias:

	`npm install`

2. Una vez instalada todas las dependencias entrar al archivo BiblioETec-Frontend/src/App.js y donde dice:

	```axios.defaults.baseURL = 'url';  // ! CAMBIAR URGENTE```

	Cambiarlo por la url donde va a estar comunicandose con el backend

3. Una vez ya realizado este cambio ya puede iniciar el proyecto con el siguiente comando:

	`npm start`

	Una vez realizado este comando debería iniciarse el proyecto abriendo automaticamente una ventana donde esté la página prinicpal del sitio web y ya esté disponible el uso de la misma.