let db = {
  users: [{
    userId: '6dvfb76gfbv8ds9bfvsd',
    email: 'user@email.com',
    handle: 'user',
    createdAt: '2019-07-23T12:25:37.550Z',
    imgURL: 'image/23456734',
    bio: "hello, there",
    website: 'https://www.user.com',
    location: "Texas, USA"
  }],
  screams: [{
    userHandle: 'user',
    body: 'this is the body',
    createdAt: '2019-07-23T12:25:37.550Z',
    likeCount: 5,
    commentCount: 2
  }],
  comments: [{
    userHandle: 'user',
    screamId: 'afdsgdhtyr54wsd',
    body: 'sup dudees',
    createdAt: '2019-07-23T12:25:37.550Z'
  }]
}

const userDetails = {
  credentials: {
    userId: "wGw5P2PWTzUQNxPllXXFizQKzRt2",
    email: "newuser@gmail.com",
    handle: "new",
    createdAt: "2019-07-24T04:00:35.505Z",
    imgURL: "https://firebasestorage.googleapis.com/v0/b/socialmediaapp-847eb.appspot.com/o/no-img.png?alt=media",
    bio: "Sup Kids",
    website: "https://www.la.com",
    location: "Los Angeles, CA"
  },
  likes: [
    {
      userHandle: 'user',
      screamId: 'adghfdhjfgj4sdg3s'
    },
    {
      userHandle: 'user',
      screamId: 'adsdfsvdbf34sdg3s'
    }
  ]
}
