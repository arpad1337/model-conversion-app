# Model Conversion App [![Build Status](https://travis-ci.com/arpad1337/model-conversion-app.svg?branch=master)](https://travis-ci.com/arpad1337/model-conversion-app)

## Description

Its a Frontend application and the CRUD API around the [model-conversion-async](https://github.com/arpad1337/model-conversion-async) CLI for the technical assesment of Shapr3D Zrt. It uses a JSON file to store Exportable Models. Alternative solution would be to use Docker-Compose and have a MySQL image with attached volume next to the App instance. Currently each build clears the database, but in development (by using npm start) you can retain your datasets.

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
