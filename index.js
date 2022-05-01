const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json());

const verifyUser = (req, res, next) => {
    const headersToken = req.headers.authorization;
    if (!headersToken) {
        res.status(401).send({ massage: 'unAuthorize access' })
    }
    const token = headersToken.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            res.status(401).send({ massage: 'unAuthorize access' })
        }
        req.decoded = decoded;
        next()
    });
}


const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@cluster0.grvhn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const bikeCollection = client.db("Bike-details").collection("details");

        // login jwt token
        app.post('/login', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN);
            res.send({ token })

        });

        //  load all data limited
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = bikeCollection.find(query);
            const products = await cursor.limit(6).toArray();
            res.send(products);
        });

        // load all data to mange
        app.get('/products/all',  async (req, res) => {
            const headersEmail = req.decoded?.email;
            const email = req.query.email;
            // if (email === headersEmail) {
                
            // }
            const query = {};
                const cursor = bikeCollection.find(query);
                const products = await cursor.toArray();
                res.send(products);
            // else {
            //     res.status(403).send({ massage: 'forbidden' })
            // }
        });

        //  load data with id
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const quarry = { _id: ObjectId(id) };
            const product = await bikeCollection.findOne(quarry);
            res.send(product);
        });

        //  add product 
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await bikeCollection.insertOne(product);
            res.send(result);
        });

        // Delete product by id
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bikeCollection.deleteOne(query);
            res.send(result);
        })

        // update product quantity
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const updateProduct = req.body;
            const quarry = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updateDoc = {
                $set: {
                    img: updateProduct.img,
                    name: updateProduct.name,
                    description: updateProduct.description,
                    supplier: updateProduct.supplier,
                    price: updateProduct.price,
                    quantity: updateProduct.quantity
                }
            };
            console.log(updateDoc);
            const result = await bikeCollection.updateOne(quarry, updateDoc, option);
            res.send(result);
        });

        // get product with query email
        app.get('/userProducts', verifyUser, async (req, res) => {
            const headersEmail = req.decoded?.email;
            const email = req.query.email;
            if (email === headersEmail) {
                const query = { email };
                const cursor = bikeCollection.find(query);
                const product = await cursor.toArray();
                res.send(product);
            }
            else {
                res.status(403).send({ massage: 'forbidden' })
            }
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
