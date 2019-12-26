# Model Conversion App [![Build Status](https://travis-ci.org/arpad1337/model-conversion-app.svg?branch=master)](https://travis-ci.org/arpad1337/model-conversion-app)

## Prerequisites

 - NodeJS 8.0 and above
 - NPM 5.0 and above
 - Docker Desktop 2.1 and above


## Build

```
docker build . -t model-conversion-app
```

## Tests

```
npm run test
```

## Running

```
docker run --detach -p 1337:1337 model-conversion-app
```

## Author

[rpi1337](https://twitter.com/rpi1337)
