const {
  admin,
  db
} = require('../util/admin')
const firebase = require('firebase');
const config = require('../util/config');
firebase.initializeApp(config);
const {
  validateSignupData,
  validateLoginData
} = require('../util/validators')

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  const {
    valid,
    errors
  } = validateSignupData(newUser);

  if (!valid) {
    return res.status(400).json(errors);
  }

  const noImg = 'no-img.png';

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
        userId: userId,
        imgURL: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`
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
}

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }
  const {
    valid,
    errors
  } = validateLoginData(user);

  if (!valid) {
    return res.status(400).json(errors);
  }
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
}

exports.uploadImage = (req, res) => {
  const Busboy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new Busboy({
    headers: req.headers
  });

  let imgFileName;
  let imgToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname, filename, mimetype);
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return res.status(400).json({
        error: 'Wrong file type, must be .png or .jpg'
      })
    }
    const imgExt = filename.split('.')[filename.split('.').length - 1];
    imgFileName = `${Math.round(Math.random()*1000000)}.${imgExt}`;
    const filepath = path.join(os.tmpdir(), imgFileName);
    imgToBeUploaded = {
      filepath,
      mimetype
    };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on('finish', () => {
    admin
      .storage()
      .bucket()
      .upload(imgToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imgToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imgURL = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imgFileName}?alt=media`;
        return db.doc(`/users/${req.user.handle}`).update({
          imgURL
        });
      })
      .then(() => {
        return res.json({
          message: 'Image uploaded sucessfully'
        })
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({
          error: err.code
        })
      });
  })
  busboy.end(req.rawBody);
}
