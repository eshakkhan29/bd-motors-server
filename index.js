const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@cluster0.grvhn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const bikeCollection = client.db("Bike-details").collection("details");
        //  load all data
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = bikeCollection.find(query);
            const products = await cursor.limit(6).toArray();
            res.send(products);
        })
        //  load data with id
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const quarry = { _id: ObjectId(id) };
            const product = await bikeCollection.findOne(quarry);
            res.send(product);
        })

    } finally {

    }
}
run();


app.get('/', async (req, res) => {
    res.send('server start')
})

app.listen(port, () => {
    console.log('server is running');
})
