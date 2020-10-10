# npuser-client

> server API to access the npuser "No password user authentication" service

See https://github.com/bryan-gilbert/npuser

The npuser "no password user authentication" service is very easy to use both
for the users of your application and for you the developer.  npuser verifies that
the user has access to the email address they have entered. This is as secure
as any password based service that uses email to let users reset their password 
(e.g. forgot your password?)

Yet, npuser is more secure because the authorization service does not store any user
data. There is zero risk of hackers breaking into the user authorization service and
obtaining user ids and passwords because they simply don't exist.

> npuser is easy for your users

Users simply enter their email address. Press submit. They then check their email for 
the verification code( just like the "forgot password" process).
They enter the verification code and they are authenticated.

> npuser is easy for developers

You'll use the npuser-client npm package
to send two post methods; one with the email and then the second with the verification
code.  Check out the sample application. 
 
## Sample usage

The best way to see how to use this client of the npuser authentication services
is to see the code in the ```sample-client``` folder. 

```
  const np = new NoPasswordAuthorizer({
    baseUrl: config.NPUSER_URL,
    clientId: config.CLIENT_ID,
    sharedSecretKey: config.SECRET
  })

  const emailAddress = getEmailAddress()
  const authResponse = await np.sendAuth(emailAddress)
  
  const code = getCodeFromUser()

  const validationResponse = await np.sendValidation(emailAddress, authResponse.token, code)
```

A sample validation response:
```
Validation response: {
  message: 'User validated',
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbWVvbmVAZXhhbXBsZS5jb20iLCJ0b2RvIjoiY2FuIGFkZCBvdGhlciBkYXRhIGhlcmUgc3VjaCBhcyBjdXJyZW50IHRpbWVzdGFtcCIsImlhdCI6MTYwMjM0MzU5MH0.Kl_3PdWS3TRm_QzWMrcJi2jY2LLLvvZoSjfaSCNdwbA'
}
```

Store the jwt for later verification.  Normally, you will send the jwt to the browser client and
store it in the browser localstorage. Your client application can then send this jwt along with
requests to your server. Your server can validate the jwt with the npuser authorization service
to be sure the user has a valid authorization.


## Module developer tasks

To bump the version
```
npm version patch
```

https://travis-ci.org/github/bryan-gilbert/npuser-client
