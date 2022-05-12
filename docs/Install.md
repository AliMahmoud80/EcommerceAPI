# Insatllation Guide

## Setting up the right nodejs version

---
This appliaction is developed on nodejs verision `16.13.2` and yarn `1.22.17` so those are required.

### Install node modules:

---
`yarn install`

### Create .env file

---
Rename `.env.example` to `.env` and fill it with the required information.

### Migrate database tables

---
`yarn migrate`

This will create database tables but make sure to set your database credentials correctly, otherwise this step will fails.

### Seed database

---
`yarn seed:all`

Seed database with basic data that is neccessary to run the application.

### Start application in development mode

---
`yarn start:dev`

Start the application in development mode using `nodemon`

### Start application in production mode

---
`yarn start`

This command will build the application using `babel` and start the application in production mode using `pm2`

### Build API documentaion [optional]

---
`yarn docs:build`

Generate API documentation using [Redoc](https://github.com/Redocly/redoc) from the specification file.

### Serve API documentation [optional]

---
`yarn docs:serve`

Serve generated API documentation.