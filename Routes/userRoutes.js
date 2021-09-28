const express = require("express");

const UserController = require("../Controllers/UserController")

const router = express.Router();


//End point to get users
router.get("/users", async (req, res) => {

    const userC = new UserController();

    const result = await userC.allUsers();
    if(result !== null){
        res.send({status: "ok", message: "All users", users: result})
    }
    else{
        res.send({status: "error", message: "Users could not be fetched", users: result})
    }
    
});

//End point to add a new user
router.post("/users", async (req, res) => {

    const user = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
    }

    const userC = new UserController();

    const result = await userC.addUser(user);
    if(result !== null){
        res.send({status: "ok", message: "User created successfully", user: result})
    }
    else{
        res.send({status: "error", message: "User could not be created", user: result})
    }
    
});


//End point to allow user deposit money into the app.
//id - id of the account owner - should be in the request parameter.
//amount - amount to be deposited - should be in the request body.
router.post("/users/:id/deposit", async (req, res) => {

    const data = {
        id: req.params.id,
        amount: req.body.amount,
    }
    
    const userC = new UserController();
    const result = await userC.deposit(data.id, data.amount);

    if(result.data !== null){
        res.send({status: "ok", message: "Balance updated successfully", result: result})
    }
    else {
        res.send({status: "error", message: "Balance could not be updated", result: result})
    }
    
});


//End point to allow user transfer to another user
//id - id of the source account - should be in the request parameter.
//receiverId - id of the receiver account - should be in the request body.
//amount - amount in dollars - to be transferred should be in the request body.
router.post("/users/:id/transfer", async (req, res) => {

    const data = {
        id: req.params.id,
        receiverId: req.body.receiverId,
        amount: req.body.amount,
    }
    
    const userC = new UserController();
    const result = await userC.transfer(data.id, data.receiverId, data.amount);

    if(result.data !== null){
        res.send({status: result.status, message: "Transfer successful", result: result})
    }
    else {
        res.send({status: result.status, message: result.message != "" ? result.message : "Transfer not successful", result: result.data})
    }
    
});


//End point to allow user transfer out of the app
//id - id of the account owner - should be in the request parameter.
//amount - amount in dollars - to be transferred should be in the request body.
router.post("/users/:id/withdraw", async (req, res) => {

    const data = {
        id: req.params.id,
        amount: req.body.amount,
    }
    
    const userC = new UserController();
    const result = await userC.withdraw(data.id, data.amount);

    if(result.data !== null){
        res.send({status: result.status, message: "Outbound transfer successful", result: result})
    }
    else {
        res.send({status: result.status, message: result.message != "" ? result.message : "Outbound transfer not successful", result: result.data})
    }
    
});


//End point to allow user check their balance.
//id - id of the account owner - should be in the request parameter.
router.get("/users/:id/check-balance", async (req, res) => {

    const data = {
        id: req.params.id
    }

    const userC = new UserController();
    const result = await userC.checkBalance(data.id);

    if(result !== null){
        res.send({status: "ok", message: "Your balance", result: "$" + result})
    }
    else{
        res.send({status: "Error", message: "Could not retrieve balance", result: result})
    }
    
});


module.exports = router;