# Sample npuser client

This sample NodeJS project demonstrates how a npusr client sends the initial 
authorization request to the npuser server. It then prompts the user, on the command line,
to enter the verification code.  Get and enter the code. The sample app then sends the verification
request which validates the user.

## How to obtain the verification code for testing.

If you are running this as a developer of npuser then you can see the npuser server's 
console output. The verification code is there. 

If you are running this as a developer of an application that will use the npuser server
then configure this sample to reach out to a running service. You will then need to 
modify the sample code to use a real email address that you can access. The verification
code will appear in your inbox. 


## How was this project created?

```
# initialize the project
npm init -y

# install webbpack
npm install webpack webpack-cli --save-dev
npm install nodemon-webpack-plugin --save-dev
touch webpack.config.js

# application dependencies
npm install dotenv --save
npm install npuser-client --save
npm install readline --save

```

Add a webpage.config.js file (set target as node)
```
const NodemonPlugin = require('nodemon-webpack-plugin'); // Ding
const path = require('path')
module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve('./dist'),
    filename: 'main.js',
  },
  plugins: [
    new NodemonPlugin(), // Dong
  ],
  target: 'node'
};
```

Adjust the scripts in the package.json file.
```
  "scripts": {
    "watch": "webpack --watch --mode=development",
    "build": "webpack --mode=development && npm run run",
    "run": "node dist/main.js"
  },
```
