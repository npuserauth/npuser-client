# npuser-client

> server API to access the npuser "No password user authentication" service

See https://github.com/bryan-gilbert/npuser

## Sample usage

```ecmascript 6
import NoPasswordAuthorizer from 'npuser-client'
import readline from 'readline'

async function getCode () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise(resolve => {
    rl.question('What is the verification code  ? ', function (code) {
      console.log(`${code}`)
      rl.close()
      resolve(code)
    })
  })
}

async function f1 () {
  const np = new NoPasswordAuthorizer({
    baseUrl: 'http://localhost:27001',
    clientId: 'client id with np user',
    sharedSecretKey: 'some secret shared with np user'
  })
  const emailAddress = 'someone@g.c'
  const d = await np.sendAuth(emailAddress)
  console.log('f1 ', d)
  const code = await getCode()
  const v = await np.sendValidation(emailAddress, d.token, code)
  console.log('f1', v)
}

f1()

```

## Module developer tasks

To bump the version
```
npm version patch
git push --follow-tags origin
```

https://travis-ci.org/github/bryan-gilbert/npuser-client
