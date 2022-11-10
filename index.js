const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('colors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

const port = process.env.PORT || 5000;

//* Middleware
app.use(cors());
app.use(express.json());

//* Mongodb Atlas
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yeflywl.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized Access' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // console.log(user);
    req.user = user;

    next();
  } catch (error) {
    res.status(403).send({ message: 'Forbidden Access' });
  }
};

const dbConnect = async () => {
  try {
    await client.connect();
    console.log('Database connected'.yellow.italic);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
};

dbConnect();

//* Collection
const servicesCollection = client.db('nurturingMindsDB').collection('services');
const reviewsCollection = client.db('nurturingMindsDB').collection('reviews');

app.get('/', (req, res) => {
  res.send('Nurturing Minds Server Running');
});

//* GET (READ)
app.get('/few-service', async (req, res) => {
  const query = {};
  const cursor = servicesCollection.find(query);
  const result = await cursor.sort({ _id: -1 }).limit(3).toArray();
  res.send(result);
});

//* GET (READ) (get all services)
app.get('/services', async (req, res) => {
  const query = {};
  const cursor = servicesCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
});

//* GET (READ)
app.get('/services/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const service = await servicesCollection.findOne(query);
  res.send(service);
});

//* GET (READ) (get specific service reviews)
app.get('/reviews/:id', async (req, res) => {
  const id = req.params.id;
  const query = { serviceId: id };
  const cursor = reviewsCollection.find(query);
  const review = await cursor.sort({ _id: -1 }).toArray();
  res.send(review);
});

//* GET (READ) (get specific user reviews)
app.get('/reviews', verifyJWT, async (req, res) => {
  const user = req.user;
  // console.log(user);

  if (user.email !== req.query.email) {
    return res.status(403).send({ message: 'Forbidden Access' });
  }

  let query = {};
  if (req.query.email) {
    query = {
      userEmail: req.query.email,
    };
  }

  const cursor = reviewsCollection.find(query);
  const reviews = await cursor.sort({ _id: -1 }).toArray();
  res.send(reviews);
});

//* GET (READ) (get a specific review to edit)
app.get('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const review = await reviewsCollection.findOne(query);
  res.send(review);
});

//* POST [For => JWT Token]
app.post('/jwt', async (req, res) => {
  try {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.send({ token });
  } catch (error) {
    console.log(error.message.bold);
  }
});

//* POST (CREATE)
app.post('/service', async (req, res) => {
  const service = req.body;
  const result = await servicesCollection.insertOne(service);
  res.send(result);
});

//* POST (CREATE)
app.post('/review', async (req, res) => {
  const review = req.body;
  const result = await reviewsCollection.insertOne(review);
  res.send(result);
});

//* PUT (UPDATE) (update a specific review)
app.put('/reviews/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: ObjectId(id) };
  const review = req.body;
  // console.log(review);
  const option = { upsert: true };
  const updatedReview = {
    $set: {
      description: review.description,
    },
  };
  const result = await reviewsCollection.updateOne(
    filter,
    updatedReview,
    option
  );
  res.send(result);
});

//* DELETE (DELETE)
app.delete('/reviews/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await reviewsCollection.deleteOne(query);
  console.log(result);
  res.send(result);
});

app.listen(port, () => {
  console.log('Server up and running'.cyan.bold);
});
