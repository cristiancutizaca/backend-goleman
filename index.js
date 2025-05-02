const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3001;

// Archivos y scopes necesarios
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

app.use(cors());

// Carga las credenciales desde credentials.json
function loadCredentials() {
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
  return JSON.parse(content).web;
}

// Autenticación con token guardado
function authorize(callback) {
  const credentials = loadCredentials();
  const { client_secret, client_id, redirect_uris } = credentials;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH, 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  } else {
    console.log('⚠️ Token no encontrado. Ejecuta primero el flujo de autorización para obtenerlo.');
  }
}

// Ruta raíz opcional para verificar el backend
app.get('/', (req, res) => {
  res.send('✅ Servidor activo. Usa /api/events para obtener los eventos de Google Calendar.');
});

// Endpoint que devuelve los eventos próximos
app.get('/api/events', (req, res) => {
  authorize((auth) => {
    const calendar = google.calendar({ version: 'v3', auth });
    calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, result) => {
      if (err) {
        console.error('❌ Error al obtener eventos:', err);
        return res.status(500).json({ error: 'Error al obtener eventos' });
      }
      const events = result.data.items || [];
      res.json(events);
    });
  });
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
});
