# Live API

The live api can be found here: https://nc-games-api.onrender.com/api

# Summary

# Running the repo locally

## Initial Setup

1. Create a fork and clone the repo locally
2. Run the following command to install the required dependencies:

```
npm install
```

## Environment Variables

In order to run this repo locally you will first need to create two .env files in the root folder of your local repo named '.env.test' and '.env.development' and add the following to the files:

```
PGDATABASE=nc_games_test
```

to the '.env.test' file and

```
PGDATABASE=nc_games
```

to the .env.development file.

## Setting up the databases

Once both of the above environment vairables are in your
