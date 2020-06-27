const database = require('./database');
const util = require('./util');

main = async () => {

    await database.connect();

    await database.createTransactionTable()
    .catch((e) => {
        console.log(e);
    });

    await database.createCustomerTable()
    .catch((e) => {
        console.log(e);
    });

    await Promise.all(
            database.insertCustomersFromJSONFile('./files/customers.json'),
            database.insertTransactionsFromJSONFile('./files/transactions-1.json'),
            database.insertTransactionsFromJSONFile('./files/transactions-2.json'))
    .catch((e) => {
        console.log(e);
    });

    let customers = await database.getCustomers()
    .catch((e) => {
        console.log(e);
    });

    for(var i=0 ; i<customers.length ; i++){

        let customerDepositCount = await database.getDepositCount(customers[i])
        .catch((e) => {
                console.log(e);
        });

        let customerDepositSum = await database.getDepositSum(customers[i])
        .catch((e) => {
            console.log(e);
        });

        let customerWithdrawalSum = await database.getWithdrawalSum(customers[i])
        .catch((e) => {
            console.log(e);
        });

        console.log(util.formatCustomerDepositInfo(customers[i], customerDepositCount, customerDepositSum, customerWithdrawalSum))
    }

    let noReferenceDepositCount = await database.getNoReferenceDepositCount(customers)
    .catch((e) => {
        console.log(e);
    });

    let noReferenceDepositSum = await database.getNoReferenceDepositSum(customers)
    .catch((e) => {
        console.log(e);
    });
    console.log(util.formatNoUserReferenceDepositInfo(noReferenceDepositCount, noReferenceDepositSum))

    let smallestValidDeposit = await database.getSmallestValidDeposit()
    .catch((e) => {
        console.log(e);
    });
    console.log(util.formatSmallestDepositInfo(smallestValidDeposit))

    let largestValidDeposit = await database.getLargestValidDeposit()
    .catch((e) => {
        console.log(e);
    });
    console.log(util.formatLargestDepositInfo(largestValidDeposit))
}

main();