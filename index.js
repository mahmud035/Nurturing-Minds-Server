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
  const result = await cursor.limit(3).toArray();
  res.send(result);
});

//* GET (READ)
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
  const review = await cursor.toArray();
  res.send(review);
});

//* GET (READ) (get specific user reviews)
app.get('/reviews', async (req, res) => {
  let query = {};

  if (req.query.email) {
    query = {
      userEmail: req.query.email,
    };
  }

  const cursor = reviewsCollection.find(query);
  const reviews = await cursor.toArray();
  res.send(reviews);
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
