const express = require('express');
const csv = require('csv-parser');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); // Importa cookie-parser

const fs = require('fs');
const ejs = require('ejs');
const app = express();
const port = process.env.PORT || 3000;

// Configura EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Configura body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configura cookie-parser
app.use(cookieParser());
// Establece una cookie temporal que expira en 4 horas

// Middleware para archivos estáticos
app.use(express.static('public'));

// Leer el archivo CSV y almacenar los datos en un array
const data = [];
fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (row) => {
    data.push(row);
  })
  .on('end', () => {
    data.sort((a, b) => a.TinsaKey.localeCompare(b.TinsaKey));
    console.log('CSV data loaded.');
  });

// Ruta para la página de inicio
app.get('/list', verificaAutenticacion, (req, res) => {
  res.render('index', { data });
});

// Ruta para la vista de detalle
app.get('/detail/:standarizedKey', verificaAutenticacion, (req, res) => {
  const standarizedKey = req.params.standarizedKey;
  const condicionante = data.find(
    (item) => item.StandarizedKey === standarizedKey
  );

  if (!condicionante) {
    res.send('Condicionante no encontrado');
  } else {
    res.render('detail', { condicionante });
  }
});

app.get('/', (req, res) => {
  res.render('login'); // Renderiza una página de inicio de sesión
});

const usuarios = [
  { username: 'stuart', password: 'hbtk23' },
  { username: 'oscar', password: 'hbtk23' },
  // Agrega más usuarios aquí si es necesario
];

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verificar las credenciales
  const usuario = usuarios.find(
    (user) => user.username === username && user.password === password
  );

  if (usuario) {
    // Autenticación exitosa, establecer una sesión o cookie de autenticación
    // Por ejemplo, puedes establecer una cookie de sesión
    //const tiempoExpiracion = 4 * 60 * 60 * 1000; // 4 horas en milisegundos
    const tiempoExpiracion = 1000; // 4 horas en milisegundos
    res.cookie('auth', 'autenticado', { maxAge: tiempoExpiracion });
    registrarIntentoLogin(usuario.username, true);
    res.redirect('/list');
  } else {
    // Las credenciales son incorrectas, muestra un mensaje de error
    registrarIntentoLogin(req.body.username, false);
    res.render('login', { error: 'Credenciales incorrectas' });
  }
});

function verificaAutenticacion(req, res, next) {
  const authCookie = req.cookies.auth; // Accede a la cookie 'auth'

  if (authCookie === 'autenticado') {
    // El usuario está autenticado, continúa con la solicitud
    return next();
  } else {
    // El usuario no está autenticado, redirige al inicio de sesión
    res.redirect('/');
  }
}

// Función para registrar intentos de inicio de sesión en un archivo de registro
function registrarIntentoLogin(username, success) {
  const logEntry = `${new Date().toISOString()} - Usuario: ${username}, ${
    success ? 'Inicio de sesión exitoso' : 'Intento de inicio de sesión fallido'
  }\n`;
  console.info(logEntry);
  // Ruta del archivo de registro (ajústala según tu necesidad)
  const logFilePath = 'login_attempts.log';

  // Escribe el registro en el archivo de registro
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Error al escribir en el archivo de registro:', err);
    }
  });
}

// Inicia el servidor
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
