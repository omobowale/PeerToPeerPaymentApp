class User {
    
    constructor(firstname, lastname) {
        this.id = Date.now();
        this.firstname = firstname;
        this.lastname = lastname;
        this.balance = 0;
    }

}

module.exports = User;