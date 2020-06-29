# A Dockerized Bitcoin Transaction Validator Application

This app contains 2 json files that represent the data from 2 separate calls that is similar to bitcoind rpc call `listsinceblock`. This app processes those files and detects all valid incoming deposits.

These instructions do not specify every single detail you should take into consideration. This is done on purpose to test your ability to analyze a problem and come up with a reasonable and safe approach. Keep in mind that your code will determine how much money each customer will get. Thoroughness is one of the most important qualities for this role.

# What does this app do ?

Process transactions and filter them for valid deposits:

1. Read all customers from `customers.json` and store all customers into a MySql database.
2. Read all transactions from `transactions-1.json` and `transactions-2.json` and store all deposits into a MySql database.
3. Read deposits from the database that are good to credit to users and prints them.
4. Read deposits from the database that doesn't belong to customers and print the sum of them.
5. Read the smallest and largest deposits from the database and print them.

**Note**: A deposit is considered valid when it has at least 6 confirmations.

Customer Lists
* Wesley Crusher: mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ
* Leonard McCoy: mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp
* Jonathan Archer: mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n
* Jadzia Dax: 2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo
* Montgomery Scott: mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8
* James T. Kirk: miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM
* Spock: mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV

# Running the project
1. Install docker from https://www.docker.com to your computer and open the docker app.
2. Go to project folder from your terminal.
3. Run `docker-compose up command`.

# Sample Output
`Deposited for Wesley Crusher: count=35 sum=217.00000000`<br/>
`Deposited for Leonard McCoy: count=15 sum=64.00000000`<br/>
`Deposited for Jonathan Archer: count=28 sum=154.20000000`<br/>
`Deposited for Jadzia Dax: count=12 sum=59.49000000`<br/>
`Deposited for Montgomery Scott: count=24 sum=108.04593000`<br/>
`Deposited for James T. Kirk: count=28 sum=1267.00848015`<br/>
`Deposited for Spock: count=17 sum=830.55492390`<br/>
`Deposited without reference: count=22 sum=954.03578583`<br/>
`Smallest valid deposit: 0.00000000`<br/>
`Largest valid deposit: 99.49379661`<br/>
