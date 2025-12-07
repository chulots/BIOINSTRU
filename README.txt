GUIA PARA CORRER LA BASE DE DATOS Y EL BACKEND 
primero tener: 
node.js
xampp instalado y que funcione mysql 
tener instalado git 

dentro de la carpeta backend en la terminal de esta carpeta
  instalar las dependencias con 
      npm install 

dentro del back.js 
cambiar los parametros de la conexion a my sql 
const connection = mysql.createConnection({
    const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', //si tienes contrasena se pone aqui recomendado que no coloques para que cuando se p
    database: 'basedatossensor'  // el nombre de la base de datos que importaremos
});

para importar la base de datos: 
cuando este corriendo xammp  abrir 
  Abrir phpMyAdmin (http://localhost/phpmyadmin/).
  Crear una base de datos vacía con el nombre basedatossensor.
  Seleccionar la base de datos y hacer clic en Importar.
  Seleccionar el archivo .sql del repo (por ejemplo basedatossensor.sql) y hacer clic en Continuar

despues de esto correr la base de datos desde la terminal donde esta el archivo back.js 
  DONDE INSTALASTE npm install 
  correr ahora: 
    node back.js
  segun la configuracon hecha deberia corre en: http://localhost:3001

ahora si corre el frontend 
para que las dos corras simultaneamente ir a la carpeta de fr y dentro en la terminal ejecutar 
  npm install
  npm run dev
y usar alguno de los usuarios de la base de datos: 
    "username":"anatomia",
    "password":"101002"
si todo esta bien al poner este usuario y esta contrasena en el frontend deberia dejarte entrar 



