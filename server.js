// backend-goleman/server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const app = express();
const PORT = 3001;

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

function loadCredentials() {
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
  return JSON.parse(content).web;
}

function getOAuth2Client() {
  const { client_id, client_secret, redirect_uris } = loadCredentials();
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

app.get('/auth', (req, res) => {
  const oAuth2Client = getOAuth2Client();
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

app.get('/', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.send('❌ No se encontró el código en la URL.');

  const oAuth2Client = getOAuth2Client();
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    res.send('✅ Token recibido y guardado correctamente. Puedes cerrar esta pestaña.');
  } catch (err) {
    res.send('❌ Error al obtener el token: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor OAuth escuchando en http://localhost:${PORT}`);
});
