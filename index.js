const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.suunm.mongodb.net/?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const coffeeCollection = client.db("coffeeDB").collection("coffee");
    const userCollection = client.db("coffeeDB").collection("user");

    app.get('/AddCoffee', async (req, res) => {
      const coffees = await coffeeCollection.find().toArray();
      res.send(coffees);
    });


    app.get('/AddCoffee/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    app.post('/AddCoffee', async (req, res) => {
      const newCoffee = req.body;
      const result = await coffeeCollection.insertOne(newCoffee);
      res.status(201).json({ message: 'Coffee added successfully!', result });
    });



   app.put('/AddCoffee/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const options = {upsert : true};
    const updatedCoffee =req.body;
    const coffee ={
      $set :{
        name:updatedCoffee.name,
        quantity:updatedCoffee.quantity,
        supplier:updatedCoffee.supplier,
        taste:updatedCoffee.taste,
        category:updatedCoffee.category,
        details:updatedCoffee.details,
        photo:updatedCoffee.photo

      }
    }
     
    const result = await coffeeCollection.updateOne(filter,coffee,options)
    res.send(result);

   })

    app.delete('/AddCoffee/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

//user related apis
app.get('/user', async (req, res) => {
  const user = await userCollection.find().toArray();
  res.send(user);
});



app.post('/user', async (req, res) => {
  const user = req.body;
  const result = await userCollection.insertOne(user);
  res.send(result);


});

app.delete('/user/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await userCollection.deleteOne(query);
  res.send(result);
});

app.patch('/user', async (req, res) => {
  try {
    const user = req.body;
    const filter = { email: user.email };
    const options = { upsert: true }; // Ensures creation of the document if it doesn't exist
    const updateDoc = {
      $set: {
        lastLoggedAt: user.lastLoggedAt
      }
    };

    const result = await userCollection.updateOne(filter, updateDoc, options); // Pass `options` to use upsert
    res.send(result);
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send({ message: 'Error updating user', error });
  }
});






    

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Coffee making server is running');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
