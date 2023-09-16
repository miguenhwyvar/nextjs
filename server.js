const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const ejs = require('ejs');
const app = express();
const port = process.env.PORT || 3000;

// Configura EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

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
app.get('/', (req, res) => {
  res.render('index', { data });
});

// Ruta para la vista de detalle
app.get('/detail/:standarizedKey', (req, res) => {
  const standarizedKey = req.params.standarizedKey;
  const condicionante = data.find((item) => item.StandarizedKey === standarizedKey);

  if (!condicionante) {
    res.send('Condicionante no encontrado');
  } else {
    res.render('detail', { condicionante });
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
