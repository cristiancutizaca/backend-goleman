// auth.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

function loadCredentials() {
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
  return JSON.parse(content).web;
}

function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // 👈 fuerza refresh_token nuevo
  });

  console.log('\n👉 Visita este link y copia el código que te da:\n', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\n✏️  Pega el código aquí: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('❌ Error al recuperar el token:', err);
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('✅ Token guardado correctamente en:', TOKEN_PATH);
    });
  });
}

function authorize() {
  const { client_secret, client_id, redirect_uris } = loadCredentials();
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  getAccessToken(oAuth2Client);
}

authorize();
