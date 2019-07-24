const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/FBAuth')
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthUser
} = require('./handlers/users')
const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream
} = require('./handlers/screams')

app.post('/signup', signup);
app.post('/login', login);

app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthUser);

app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);

//TODO
// delete scream
// like scream
// unlike scream
// comment on scream






exports.api = functions.https.onRequest(app);
