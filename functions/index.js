const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/FBAuth')
const { signup, login, uploadImage } = require('./handlers/users')
const { getAllScreams, postOneScream } = require('./handlers/screams')

app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);

app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage)

exports.api = functions.https.onRequest(app);
