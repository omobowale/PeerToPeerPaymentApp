const User = require("../Models/UserModel")
const fs = require("fs");
const users = require("../Data/users.json");

class UserController {

    //Method to return all users in the Data/users.json file
    allUsers = async () => {

        return users;

    }

    //Method to add a new user
    //Takes a user object as parameter
    //Returns a new user if no errors
    //Returns null otherwise
    addUser = async (user) => {
        const newUser = new User(user.firstname, user.lastname);
        users.push(newUser);

        const data = JSON.stringify(users);

        return fs.promises.writeFile("Data/users.json", data, {encoding : 'utf-8'}).then(() => {
            return newUser
        }).catch(() => {
            return null
        })
    }


    //Method to deposit an amount of money
    //Takes the id of the user and amount to be deposited as parameters
    //Returns an object containing the details of the deposit.
    deposit = async (id, amount) => {

        const userId = users.findIndex((user) => user["id"] == id);

        if(userId < 0){
            return {data: null, status: "Error", message: "User does not exist"}
        }

        users[userId].balance = parseFloat(users[userId].balance) + parseFloat(amount);
        const updatedUser = users[userId];

        const data = JSON.stringify(users);

        return fs.promises.writeFile("Data/users.json", data, {encoding : 'utf-8'}).then(() => {
            return {data: { userId: updatedUser.id, currency: "Dollar", symbol: "$", balance: updatedUser.balance}, status: "Success", message: "Amount deposited : $" + amount}
        }).catch(() => {
            return {data: null, status: "Error", message: ""}
        })
    }

    //Method to transfer a given amount of money
    //Takes the id of the user, the id of the receiver and amount to be deposited as parameters
    //Returns an object containing the details of the transfer.
    transfer = async (id, receiverId, amount) => {
        const userId = users.findIndex((user) => user["id"] == id);
        const recId = users.findIndex((user) => user["id"] == receiverId);

        let errors = {};

        if(userId < 0){
            errors = {
                ...errors,
                source: "Source user does not exist"
            }
        }

        if(recId < 0){
            errors = {
                ...errors,
                destination: "Recipient user does not exist"
            }
        }

        if(userId == recId){
            errors = {
                ...errors,
                same: "Source and recipient are the same"
            }
        }

        if(Object.keys(errors).length !== 0){
            return {data: null, status: "Error", message: errors}
        }

        const senderBalance = parseFloat(users[userId].balance);
        const receiverBalance = parseFloat(users[recId].balance);

        if(senderBalance < amount){
            return {data: null, status: "Error", message: "Insufficient balance"}
        }

        users[userId].balance = senderBalance - parseFloat(amount);

        users[recId].balance = receiverBalance + parseFloat(amount);

        const updatedUser = users[userId];

        const data = JSON.stringify(users);

        return fs.promises.writeFile("Data/users.json", data, {encoding : 'utf-8'}).then(() => {
            return {data: { userId: updatedUser.id, currency: "Dollar", symbol: "$", balance: updatedUser.balance, receiverId: users[recId].id}, status: "Success", message: "Amount transferred : $" + amount}
        }).catch(() => {
            return {data: null, status: "Error", message: ""}
        })
    }


    //Method to withdraw a given amount of money
    //Takes the id of the user, and amount to be deposited as parameters
    //Returns an object containing the details of the withdrawal.
    withdraw = async (id, amount) => {

        const userId = users.findIndex((user) => user["id"] == id);

        if(userId < 0){
            return {data: null, status: "Error", message: "User does not exist"}
        }

        const senderBalance = parseFloat(users[userId].balance);

        if(senderBalance < amount){
            return {data: null, status: "Error", message: "Insufficient balance"}
        }

        users[userId].balance = senderBalance - parseFloat(amount);

        const updatedUser = users[userId];

        const data = JSON.stringify(users);

        return fs.promises.writeFile("Data/users.json", data, {encoding : 'utf-8'}).then(() => {
            return {data: { userId: updatedUser.id, currency: "Dollar", symbol: "$", balance: updatedUser.balance}, status: "Success", message: "Amount withdrawn : $" + amount}
        }).catch(() => {
            return {data: null, status: "Error", message: ""}
        })
    }


    //Method to check the balaance of a given user
    //Takes the id of the user
    //Returns an object containing the details of the user's balance
    checkBalance = async (id) => {
        const userId = users.findIndex((user) => user["id"] == id);

        if(userId !== null && userId >= 0){
            const balance = users[userId].balance;
            return balance
        }
        else {
            return null
        }

    }

}

module.exports = UserController