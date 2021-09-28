//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const should = chai.should();
const fs = require("fs");
const users = require("../Data/users.json");
const { expect } = require('chai');

chai.use(chaiHttp);

resetUsers = () => {

    return new Promise((resolve, reject) => {

        //empty the array
        users.length = 0

        users.push(
            { id: 1632815036394, firstname: "a", lastname: "b", balance: 0 }
        )

    const data = JSON.stringify(users);

    fs.promises.writeFile("Data/users.json", data, { encoding: 'utf-8' }, (err) => {
        if (err) {
            reject("Could not clear data")
        }
        else {
            resolve("Successfully reset users array");
        }
    });
    })

    
}

//Our parent block
describe('Users', () => {
    before((done) => { //Before the test we empty the users array
        resetUsers().then(done()).catch((err) => console.log(err));
    });

    /*
    * Test the GET route
    */
    describe('GET /users', () => {
        it('it should GET all the users which should be only a single dummy user data', (done) => {
            chai.request(app)
                .get('/users')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.status("ok")
                    res.body.users.length.should.be.eql(1)
                    done();
                });
        });
    });

    /*
    * Test the /POST route for adding a new user
    */
    describe('POST /users', () => {
        it('it should create a new user', (done) => {
            const user = {
                firstname: "dummy firstname",
                lastname: "dummy lastname"
            }
            chai.request(app)
                .post('/users')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.status("ok")
                    res.body.should.have.property("message").eql("User created successfully")
                    res.body.should.have.property("user")
                    res.body.user.should.have.property("id").below(parseInt(Date.now()));
                    res.body.user.should.have.property("firstname").eql(user.firstname);
                    res.body.user.should.have.property("lastname").eql(user.lastname);
                    done();
                });
        });
    });


    /*
    * Test the /POST route for depositing some amount with a valid user id and specified amount
    */
    describe('POST /users/:id/deposit - to deposit an amount into a valid source user id', () => {
        it('it should update user balance using a valid user id and a given amount. ', (done) => {
            const user = users[0];
            const id = user['id'];
            const initial = user['balance'];

            const data = {
                amount: 7000
            }

            chai.request(app)
                .post('/users/' + id + '/deposit')
                .send({ amount: data.amount })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.status("ok");
                    res.body.should.have.property("message").eql("Balance updated successfully");
                    res.body.result.data.should.have.property("balance").least(initial);
                    done();
                });
        });
    });


    /*
    * Test the /POST route for depositing some amount with an invalid user id and specified amount
    */
    describe('POST /users/:id/deposit - to deposit an amount into an invalid source user id', () => {
        it('it should not update user balance using an invalid user id and a given amount. ', (done) => {
            const id = 2;

            const data = {
                amount: 7000
            }

            chai.request(app)
                .post('/users/' + id + '/deposit')
                .send({ amount: data.amount })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.status("error");
                    res.body.should.have.property("message").eql("Balance could not be updated");
                    res.body.result.should.have.property("message").eql("User does not exist");
                    done();
                });
        });
    });


    /*
    * Test the /POST route for transferring some amount to another user
    */
    describe('POST /users/:id/transfer - to transfer from one valid user to another valid user', () => {
        it('it should reduce source user balance and increase recipient source balance after transfer', (done) => {
            const user = users[0];
            const user2 = users[1];

            const id = user['id'];
            const recId = user2["id"];

            const initial = user['balance'];

            const data = {
                receiverId: recId,
                amount: 1000
            }
            chai.request(app)
                .post('/users/' + id + '/transfer')
                .send({ amount: data.amount, receiverId: recId })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.status("Success")
                    res.body.should.have.property("message").eql("Transfer successful")
                    res.body.result.should.have.property("message").eql("Amount transferred : $" + data.amount)
                    res.body.result.data.should.have.property("balance").below(initial);
                    res.body.result.data.should.have.property("balance").eql(initial - data.amount);
                    expect(users[1]["balance"]).to.be.equal(initial - users[0]["balance"]);
                    done();
                });
        });
    });


    /*
    * Test the /POST route for transferring some amount to another user with invalid source id
    */
    describe('POST /users/:id/transfer - to transfer with an invalid source id', () => {
        it('it should return error when transferring with an invalid source id', (done) => {
            const user = users[0];

            const id = 0;
            const recId = user["id"];

            const data = {
                receiverId: recId,
                amount: 0
            }
            chai.request(app)
                .post('/users/' + id + '/transfer')
                .send({ amount: data.amount, receiverId: recId })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.status("Error")
                    res.body.message.should.have.property("source").eql("Source user does not exist")
                    res.body.should.have.property("result").eql(null)
                    done();
                });
        });
    });


    /*
    * Test the /POST route for transferring some amount to another user with invalid recipient id
    */
    describe('POST /users/:id/transfer - to transfer to an invalid recipient id', () => {
        it('it should return error when transferring to an invalid recipient id', (done) => {
            const user = users[0];

            const id = user["id"];
            const recId = 0;

            const data = {
                receiverId: recId,
                amount: 0
            }
            chai.request(app)
                .post('/users/' + id + '/transfer')
                .send({ amount: data.amount, receiverId: recId })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.status("Error")
                    res.body.message.should.have.property("destination").eql("Recipient user does not exist")
                    res.body.should.have.property("result").eql(null)
                    done();
                });
        });
    });

    /*
    * Test the /POST route for transferring some amount to own account
    */
    describe('POST /users/:id/transfer - to transfer to own account', () => {
        it('it should return error when transferring to own account and balance should not be updated', (done) => {
            const user = users[0];

            const id = user["id"];
            const recId = id;

            const initial = user['balance'];

            const data = {
                receiverId: recId,
                amount: 1000
            }

            chai.request(app)
                .post('/users/' + id + '/transfer')
                .send({ amount: data.amount, receiverId: recId })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.status("Error")
                    res.body.message.should.have.property("same").eql("Source and recipient are the same")
                    res.body.should.have.property("result").eql(null)
                    expect(initial).to.be.equal(users[0]["balance"])
                    done();
                });
        });
    });

    /*
    * Test the /POST route for transferring some amount to another user with insufficient balance.
    */
    describe('POST /users/:id/transfer - to transfer an amount higher than the current balance', () => {
        it('it should return error when transferring with an insufficient balance', (done) => {
            const user = users[0];
            const user2 = users[1];

            const id = user['id'];
            const recId = user2["id"];

            const initial = user['balance'];

            const data = {
                receiverId: recId,
                amount: 10000000000000000000000000
            }
            chai.request(app)
                .post('/users/' + id + '/transfer')
                .send({ amount: data.amount, receiverId: recId })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.status("Error")
                    res.body.should.have.property("message").eql("Insufficient balance")
                    res.body.should.have.property("result").eql(null)
                    done();
                });
        });
    });


    /*
    * Test the /POST route for transferring some amount out of the app i.e withdrawal
    */
    describe('POST /users/:id/withdraw - to withdraw with a valid source id and valid amount ', () => {
        it('it should reduce source user balance after withdrawal', (done) => {
            const user = users[0];

            const id = user['id'];

            const initial = user['balance'];

            const data = {
                amount: 1000
            }

            chai.request(app)
                .post('/users/' + id + '/withdraw')
                .send({ amount: data.amount })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.status("Success")
                    res.body.should.have.property("message").eql("Outbound transfer successful")
                    res.body.result.should.have.property("message").eql("Amount withdrawn : $" + data.amount)
                    res.body.result.data.should.have.property("balance").most(initial);
                    done();
                });
        });
    });


    /*
    * Test the /POST route for transferring some amount out of the app with an invalid owner id
    */
    describe('POST /users/:id/withdraw - to withdraw with an invalid owner or source id', () => {
        it('it should show an error that the user does not exist', (done) => {

            const id = 0;

            const data = {
                amount: 1000
            }

            chai.request(app)
                .post('/users/' + id + '/withdraw')
                .send({ amount: data.amount })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.status("Error")
                    res.body.should.have.property("message").eql("User does not exist")
                    done();
                });
        });
    });

    /*
    * Test the /POST route for transferring some amount higher than the owner or source balance
    */
    describe('POST /users/:id/withdraw - to withdraw an amount more than the source balance', () => {
        it('it should show an error that there is insufficient balance', (done) => {

            const user = users[0];

            const id = user['id'];

            const data = {
                amount: 100000000000000000000000000000000
            }

            chai.request(app)
                .post('/users/' + id + '/withdraw')
                .send({ amount: data.amount })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.status("Error")
                    res.body.should.have.property("message").eql("Insufficient balance")
                    res.body.should.have.property("result").eql(null)
                    done();
                });
        });
    });

    /*
    * Test the /GET route for check user balance
    */
    describe('GET /users/:id/check-balance - to check the balance of a valid source user', () => {
        it('it should display user balance', (done) => {
            const user = users[0];

            const id = user['id'];

            const initial = user['balance'];

            chai.request(app)
                .get('/users/' + id + '/check-balance')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.status("ok")
                    res.body.should.have.property("message").eql("Your balance")
                    res.body.should.have.property("result").eql("$" + initial);
                    done();
                });
        });
    });


    /*
    * Test the /GET route for check user balance
    */
    describe('GET /users/:id/check-balance - to check the balance of an invalid source user', () => {
        it('it should not display the balance but should throw an error', (done) => {

            const id = 0;

            chai.request(app)
                .get('/users/' + id + '/check-balance')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.status("Error")
                    res.body.should.have.property("message").eql("Could not retrieve balance")
                    res.body.should.have.property("result").eql(null)
                    done();
                });
        });
    });


});