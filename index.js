const express = require('express');
const cors = require('cors');
require('colors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

const port = process.env.PORT || 5000;

//* Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yeflywl.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

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

const servicesCollection = client.db('nurturingMindsDB').collection('services');

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

app.listen(port, () => {
  console.log('Server up and running'.cyan.bold);
});
