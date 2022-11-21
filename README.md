# express-http-proxy - `stream` POC

This POC demonstrates how to run two express servers that uses streams to send data between the two, and what options are available to log the data that's responded from the proxy, both from the response and the headers set.

## Prerequisites

It's assumed you have the following installed:

- NVM
- Node 16.17
- NPM

## Quick Start

In order to get started, run the following commands:

```
nvm use
npm i
```

The run the following command, this starts both the proxy and the server.

```
npm start
```

## Routes

The following routes are available:

| Route Name | Host / Path                 | Example Response   |
| ---------- | --------------------------- | ------------------ |
| JSON       | http://localhost:5000/json  | `{ id: "string" }` |
| Images     | http://localhost:5000/image | Stream (image)     |
