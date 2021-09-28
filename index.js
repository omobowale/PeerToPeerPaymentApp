//Import the express dependency
const express = require('express');
const cors = require("cors");

const userRouter = require("./Routes/userRoutes");

//Instantiate an express app, the main work house of this server
const app = express();

//middlewares
app.use(cors());
app.use(express.urlencoded({extended: true}))
app.use(express.json());

app.use("/", userRouter);

//Save the port number where your server will be listening
const port = 8003;                  

//server starts listening for any attempts from a client to connect at port: {port}
app.listen(port, () => {            
    console.log(`Now listening on port ${port}`); 
});


//export it so it could be used for test too
module.exports = app
