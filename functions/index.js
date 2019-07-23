const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/FBAuth')
const { signup, login } = require('./handlers/users')
const { getAllScreams, postOneScream } = require('./handlers/screams')

app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);

app.post('/signup', signup);
app.post('/login', login);

exports.api = functions.https.onRequest(app);
