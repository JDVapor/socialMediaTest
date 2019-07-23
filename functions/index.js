const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const firebaseConfig = {
  apiKey: "AIzaSyDmnSFx39uwdYsEftKCfGUxJuZIce9vEaU",
  authDomain: "socialmediaapp-847eb.firebaseapp.com",
  databaseURL: "https://socialmediaapp-847eb.firebaseio.com",
  projectId: "socialmediaapp-847eb",
  storageBucket: "socialmediaapp-847eb.appspot.com",
  messagingSenderId: "373092526181",
  appId: "1:373092526181:web:392d7c661c32ddb2"
};

const firebase = require('firebase');

firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get('/screams', (req, res) => {
  db.collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      const screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          userHandle: doc.data().userHandle
        });
      })
      return res.json(screams);
    })
    .catch(err => console.error(err));
});

app.post('/scream', (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };
  db.collection('screams')
    .add(newScream)
    .then(doc => {
      res.json({
        message: `document ${doc.id} created sucessfully`
      })
    })
    .catch(err => {
      res.status(500).json({
        error: 'something went wrong'
      })
      console.error(err);
    })
});

const isEmpty = string => string.trim() === '' ? true : false;

const isEmail = email => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.match(emailRegEx) ? true : false;
}

app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };
  let errors = {};
  if (isEmpty(newUser.email)) {
    errors.email = 'Email cannot be empty.'
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Must be a valid email address'
  }
  if (isEmpty(newUser.password)) {
    errors.password = 'Must not be empty.'
  }
  if (newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }
  if (isEmpty(newUser.handle)) {
    errors.handle = 'Must not be empty.'
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }
  let token, userId;
  db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({
          handle: 'This handle alredy exists'
        });
      } else {
        return firebase.auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(tokenId => {
      token = tokenId;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId: userId
      };
      db.doc(`/users/${newUser.handle}`).set(userCredentials)
        .then(() => {
          return res.status(201).json({
            token
          })
        })
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({
          email: 'Email already in use.'
        })
      } else {
        return res.status(500).json({
          error: err.code
        })
      }
    });
});

app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }
  let errors = {};
  if (isEmpty(newUser.email)) {
    errors.email = 'Email cannot be empty.'
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Must be a valid email address'
  }
  if (isEmpty(user.password)) errors.password = 'Must not be empty';
  if (Object.keys(errors).length > 0) return res.status(400).json(errors);
  firebase.auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({
        token
      })
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        return res.status(403).json({
          general: 'Incorrect Password.'
        })
      } else {
        return res.status(500).json({
          error: err.code
        })
      }
    });
})
exports.api = functions.https.onRequest(app);
