const fs = require('fs');
const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'mysql-dev',
    user: 'root',
    password: 'root',
    database: 'dockerized-bitcoin-tx-validator_db'
});

module.exports.connect = function () {
    return new Promise((resolve, reject) => {
        con.connect( (err) => {
            if (!err) {
                resolve();
            } else {
                reject(Error('DB connection failed. Error : ' + JSON.stringify(err, undefined, 2)));
            }
        });
    });
};

module.exports.createTransactionTable = function () {
    return new Promise((resolve, reject) => {
        var query = 'CREATE TABLE IF NOT EXISTS transactions( tx_address VARCHAR(36) NOT NULL, tx_category VARCHAR(10) NOT NULL, tx_amount DECIMAL(16,8) NOT NULL, tx_confirmations INT NOT NULL)';
        con.query(query, function (err, result) {
            if (!err) {
                resolve();
            } else {
                reject(Error('Error:' + JSON.stringify(err, undefined, 2)));
            }
        });
    })
};

module.exports.createCustomerTable = function () {
    return new Promise((resolve, reject) => {
        var query = 'CREATE TABLE IF NOT EXISTS customers( customer_firstname VARCHAR(100) NOT NULL, customer_middlename VARCHAR(100) NULL, customer_lastname VARCHAR(100) NULL, customer_address VARCHAR(36) NOT NULL)';
        con.query(query, function (err, result) {
            if (!err) {
                resolve(result);
            } else {
                reject(Error('Error:' + JSON.stringify(err, undefined, 2)));
            }
        });
    })
};

module.exports.insertCustomersFromJSONFile = function (filePath) {
    var promises = [];
    var customersJSON = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (var k in customersJSON.customers) {
        var promise = new Promise((resolve, reject) => {
            var query = 'INSERT INTO customers( customer_firstname, customer_middlename, customer_lastname, customer_address) VALUES (';
            query += ' "' + customersJSON.customers[k].firstname + '", ';
            query += ' "' + customersJSON.customers[k].middlename + '", ';
            query += ' "' + customersJSON.customers[k].lastname + '", ';
            query += ' "' + customersJSON.customers[k].address + '"';
            query += ' )';
            con.query(query, function (err, result) {
                if (!err) {
                    resolve();
                } else {
                    reject(Error('Error:' + err));
                }
            });
        })
        promises.push(promise);
    }
    return promises;
};

module.exports.insertTransactionsFromJSONFile = function (filePath) {
    var promises = [];
    var transactionsJSON = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (var k in transactionsJSON.transactions) {
        if(transactionsJSON.transactions[k].amount.toString().toUpperCase().includes("E")){
            transactionsJSON.transactions[k].amount = transactionsJSON.transactions[k].amount.toFixed(8);
        }
        var promise = new Promise((resolve, reject) => {
            var query = 'INSERT INTO transactions( tx_address, tx_category, tx_amount, tx_confirmations) VALUES (';
            query += ' "' + transactionsJSON.transactions[k].address + '", ';
            query += ' "' + transactionsJSON.transactions[k].category + '", ';
            query += ' "' + transactionsJSON.transactions[k].amount + '", ';
            query += ' "' + transactionsJSON.transactions[k].confirmations + '" ';
            query += ' )';
            con.query(query, function (err, result) {
                if (!err) {
                    resolve();
                } else {
                    reject(Error('Error:' + err));
                }
            });
        })
        promises.push(promise);
    }
    return promises;
};

module.exports.getCustomers = function () {
    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM customers', function (err, result) {
            if (!err) {
                resolve(result);
            } else {
                reject(Error('Error:' + JSON.stringify(err, undefined, 2)));
            }
        });
    })
};

module.exports.getDepositCounts = function (customers) {
    var promises = [];
    for (var k = 0; k < customers.length; k++) {

        var promise = new Promise((resolve, reject) => {
            var query = 'SELECT COUNT(*) AS transactionCount FROM transactions WHERE (';
            query += ' (tx_confirmations >= 6) ';
            query += ' AND( tx_category = ' + ' "' + 'receive' + '"' + 'OR';
            query += ' tx_category = ' + ' "' + 'generate' + '"' + ')';
            query += ' AND( tx_address = ' + ' "' + customers[k].customer_address + '"' + ')';
            query += ' )';
            con.query(query, function (err, result) {
                if (!err) {
                    if (result[0].transactionCount=== null) result[0].transactionCount = 0
                    resolve(result[0].transactionCount);
                } else {
                    reject(Error('Error:' + JSON.stringify(err, undefined, 2)));
                }
            });
        })
        promises.push(promise);
    }
    return promises;
};

module.exports.getDepositSums = function (customers) {
    var promises = [];
    for (var k = 0; k < customers.length; k++) {

        var promise = new Promise((resolve, reject) => {
            var query = 'SELECT SUM(tx_amount) AS transactionSum FROM transactions WHERE (';
            query += ' (tx_confirmations >= 6) ';
            query += ' AND( tx_category = ' + ' "' + 'receive' + '"' + 'OR';
            query += ' tx_category = ' + ' "' + 'generate' + '"' + ')';
            query += ' AND( tx_address = ' + ' "' + customers[k].customer_address + '"' + ')';
            query += ' )';

            con.query(query, function (err, result) {
                if (!err) {
                    if (result[0].transactionSum=== null) result[0].transactionSum = 0
                    resolve(result[0].transactionSum.toFixed(8));
                } else {
                    reject(Error('Error:' + JSON.stringify(err, undefined, 2)));
                }
            });
        })
        promises.push(promise);
    }
    return promises;
};

module.exports.getWithdrawalSums = function (customers) {
    var promises = [];
    for (var k = 0; k < customers.length; k++) {

        var promise = new Promise((resolve, reject) => {
            var query = 'SELECT SUM(tx_amount) AS transactionWithdrawalSum FROM transactions WHERE (';
            query += ' (tx_confirmations >= 6) ';
            query += ' AND( tx_category = ' + ' "' + 'send' + '"' + ')';
            query += ' AND( tx_address = ' + ' "' + customers[k].customer_address + '"' + ')';
            query += ' )';

            con.query(query, function (err, result) {
                if (!err) {
                    if (result[0].transactionWithdrawalSum === null) result[0].transactionWithdrawalSum = 0
                    resolve(result[0].transactionWithdrawalSum.toFixed(8));
                } else {
                    reject(Error('Error:' + JSON.stringify(err, undefined, 2)));
                }
            });
        })
        promises.push(promise);
    }
    return promises;
};

module.exports.getDepositCount = function (customer) {
    return new Promise((resolve, reject) => {
        var query = 'SELECT COUNT(*) AS transactionCount FROM transactions WHERE (';
        query += ' (tx_confirmations >= 6) ';
        query += ' AND( tx_category = ' + ' "' + 'receive' + '"' + 'OR';
        query += ' tx_category = ' + ' "' + 'generate' + '"' + ')';
        query += ' AND( tx_address = ' + ' "' + customer.customer_address + '"' + ')';
        query += ' )';
        con.query(query, function (err, result) {
            if (!err) {
                if (result[0].transactionCount=== null) result[0].transactionCount = 0
                resolve(result[0].transactionCount);
            } else {
                reject(Error('Error:' + JSON.stringify(err, undefined, 2)));
            }
        });
    })
};

module.exports.getDepositSum = function (customer) {
    return new Promise((resolve, reject) => {
        var query = 'SELECT SUM(tx_amount) AS transactionSum FROM transactions WHERE (';
        query += ' (tx_confirmations >= 6) ';
        query += ' AND( tx_category = ' + ' "' + 'receive' + '"' + 'OR';
        query += ' tx_category = ' + ' "' + 'generate' + '"' + ')';
        query += ' AND( tx_address = ' + ' "' + customer.customer_address + '"' + ')';
        query += ' )';

        con.query(query, function (err, result) {
            if (!err) {
                if (result[0].transactionSum=== null) result[0].transactionSum = 0
                resolve(result[0].transactionSum.toFixed(8));
            } else {
                reject(Error('Error:' + JSON.stringify(err, undefined, 2)));
            }
        });
    })
};

module.exports.getWithdrawalSum = function (customer) {
    return new Promise((resolve, reject) => {
        var query = 'SELECT SUM(tx_amount) AS transactionWithdrawalSum FROM transactions WHERE (';
        query += ' (tx_confirmations >= 6) ';
        query += ' AND( tx_category = ' + ' "' + 'send' + '"' + ')';
        query += ' AND( tx_address = ' + ' "' + customer.customer_address + '"' + ')';
        query += ' )';
 
        con.query(query, function (err, result) {
            if (!err) {
                if (result[0].transactionWithdrawalSum === null) result[0].transactionWithdrawalSum = 0
                resolve(result[0].transactionWithdrawalSum.toFixed(8));
            } else {
                reject(Error('Error:' + JSON.stringify(err, undefined, 2)));
            }
        });
    })
};

module.exports.getNoReferenceDepositCount = function (customers) {
    return new Promise((resolve, reject) => {

        var query = 'SELECT COUNT(*) AS transactionCount FROM transactions WHERE (';
        query += ' (tx_confirmations >= 6) AND';
        query += ' ( tx_category = ' + ' "' + 'receive' + '"' + ' OR';
        query += ' tx_category = ' + ' "' + 'generate' + '"' + ')AND(';
        for (var k = 0; k < customers.length; k++) {
            query += ' tx_address != ' + ' "' + customers[k].customer_address + '"';
            if(k !== customers.length-1){query +=' AND ';}
        }
        query += ' ))';
        con.query(query, function (err, result) {
            if (!err) {
                if (result[0].transactionCount=== null) result[0].transactionCount = 0
                resolve(result[0].transactionCount);
            } else {
                reject(Error('Error:' + JSON.stringify(err, undefined, 2)));
            } 953.63578583

        });
    })
};

module.exports.getNoReferenceDepositSum = function (customers) {
    return new Promise((resolve, reject) => {

        var query = 'SELECT SUM(tx_amount) AS transactionSum FROM transactions WHERE (';
        query += ' (tx_confirmations >= 6) AND';
        query += ' ( tx_category = ' + ' "' + 'receive' + '"' + ' OR';
        query += ' tx_category = ' + ' "' + 'generate' + '"' + ')AND(';
        for (var k = 0; k < customers.length; k++) {
            query += ' tx_address != ' + ' "' + customers[k].customer_address + '"';
            if(k !== customers.length-1){query +=' AND ';}
        }
        query += ' ))';
        con.query(query, function (err, result) {
            if (!err) {
                if (result[0].transactionSum === null) result[0].transactionSum = 0
                resolve(result[0].transactionSum);
            } else {
                reject(Error('Error:' + JSON.stringify(err, undefined, 2)));
            }
        });
    })
};

module.exports.getSmallestValidDeposit = function () {
    return new Promise((resolve, reject) => {
        var query = 'SELECT (tx_amount) AS smallestTransactionAmount FROM transactions WHERE (';
        query += ' (tx_confirmations >= 6) AND';
        query += ' ( tx_category = ' + ' "' + 'receive' + '"' + ' OR';
        query += ' tx_category = ' + ' "' + 'generate' + '"' + ')';
        query += ' )';
        query += 'ORDER BY tx_amount ASC LIMIT 1';
        con.query(query, function (err, result) {
            if (!err) {
                resolve(result[0].smallestTransactionAmount);
            } else {
                reject(Error('Error:' + JSON.stringify(err, undefined, 2)));
            }
        });
    })
};

module.exports.getLargestValidDeposit = function () {
    return new Promise((resolve, reject) => {
        var query = 'SELECT (tx_amount) AS smallestTransactionAmount FROM transactions WHERE (';
        query += ' (tx_confirmations >= 6) AND';
        query += ' ( tx_category = ' + ' "' + 'receive' + '"' + ' OR';
        query += ' tx_category = ' + ' "' + 'generate' + '"' + ')';
        query += ' )';
        query += 'ORDER BY tx_amount DESC LIMIT 1';
        con.query(query, function (err, result) {
            if (!err) {
                resolve(result[0].smallestTransactionAmount);
            } else {
                reject(Error('Error:' + JSON.stringify(err, undefined, 2)));
            }
        });
    })
};