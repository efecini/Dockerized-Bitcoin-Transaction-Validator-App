module.exports.makeFullName = function (customer) {
    var fullName = customer.customer_firstname;
    if (customer.customer_middlename) fullName = fullName + ' ' + customer.customer_middlename;
    if (customer.customer_lastname) fullName = fullName + ' ' + customer.customer_lastname;
    return fullName;
}

module.exports.formatCustomerDepositInfo = function (customer, customerDepositCount, customerDepositSum, customerWithdrawalSum) {
    let fullName = this.makeFullName(customer);
    let totalDeposit = Number(customerDepositSum) + Number(customerWithdrawalSum);
    return ('Deposited for ' + fullName + ': count=' + customerDepositCount + ' sum=' + totalDeposit.toFixed(8));
}

module.exports.formatNoUserReferenceDepositInfo = function (noReferenceDepositCount, noReferenceDepositSum) {
    return ('Deposited without reference: count=' + noReferenceDepositCount + ' sum=' + noReferenceDepositSum.toFixed(8));
}

module.exports.formatSmallestDepositInfo = function (smallestValidDeposit) {
    return ('Smallest valid deposit: ' + smallestValidDeposit.toFixed(8))
}

module.exports.formatLargestDepositInfo = function (largestValidDeposit) {
    return ('Largest valid deposit: ' + largestValidDeposit.toFixed(8))
}