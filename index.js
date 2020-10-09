const express = require('express')
const app = express()
require('dotenv').config()
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const port = 8080;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.efifc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const client = new MongoClient(
  uri,
  { useUnifiedTopology: true },
  { useNewUrlParser: true }
);


client.connect(err => {
  const productsCollection = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION);

  const ordersCollection = client.db(process.env.DB_NAME).collection(process.env.DB_ORDERS);

  // perform actions on the productsCollection object
  // POST one product
  app.post('/addProduct', (req, res) => {
    const product = req.body;
    productsCollection.insertOne(product)
      .then(result => {
        res.send(result.insertedCount)
      })
  })

  // GET all products
  app.get('/products', (req, res) => {
    const search = req.query.search;
    productsCollection.find({ name: { $regex: search } })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  // GET single selected product
  app.get('/product/:key', (req, res) => {
    productsCollection.find({ key: req.params.key })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  // GET many products by keys
  app.post('/productsByKeys', (req, res) => {
    const productKeys = req.body;
    console.log('this', productKeys)
    productsCollection.find({ key: { $in: productKeys } })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  // perform actions on the ordersCollection object
  app.post('/addOrder', (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  // client.close();
});



app.get('/', (req, res) => {
  res.send('Hello World emajohn!')
})

app.listen(process.env.PORT || port)