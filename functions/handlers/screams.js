const {
  db
} = require('../util/admin');

exports.getAllScreams = (req, res) => {
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
}

exports.getScream = (req, res) => {
  let screamData = {};
  db.doc(`/screams/${req.params.screamId}`).get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({
          error: 'Scream not found'
        });
      }
      screamData = doc.data();
      screamData.screamId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('screamId', '==', req.params.screamId).get()
    })
    .then(data => {
      screamData.comments = [];
      data.forEach(doc => {
        screamData.comments.push(doc.data())
      })
      return res.json(screamData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err.code
      })
    });
}

exports.commentOnScream = (req, res) => {
  if (req.body.body.trim() === '') return res.status(400).json({
    error: 'Comment cannot be empty'
  });
  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    handle: req.user.handle,
    userImg: req.user.imgURL
  };
  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({
          error: 'Scream Not Found.'
        });
      }
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: 'Something Went Wrong'
      })
    });
}

exports.postOneScream = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({
      body: 'Body cannot be empty.'
    })
  }
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
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
}
