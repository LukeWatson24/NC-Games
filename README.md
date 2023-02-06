# Live API

The live api can be found here: https://nc-games-api.onrender.com/api

# Summary

A restful API for fetching board game review data from an SQL database using node postgres.

# Running the repo locally

## Initial Setup

1. Ensure you have at least node version 14 and postgres version 12 installed
2. Create a fork of this repo and clone it locally
3. Run the following command to install the required dependencies:

```
npm install
```

---

## Environment Variables

In order to run this repo locally you will first need to create three .env files in the root folder of your local repo named '.env.test', '.env.development' and '.env.jwt' and add the following to the files:

```
PGDATABASE=nc_games_test
```

to the '.env.test' file,

```
PGDATABASE=nc_games
```

to the .env.development file. and

```
TOKEN_KEY="secret-key"
```

to the .env.jwt file. You should replace the "secret-key" with your own secret key. You could use a site such as [this one](https://generate-random.org/encryption-key-generator) to genereate a strong key.

---

## Setting up the databases

Once both of the above environment vairables are setup run the following commands to setup and seed the development database:

```
npm run setup-dbs
```

```
npm run seed
```

You can check that the development database is seeded correctly by running the following commands:

```
psql
```

```
\c nc_games
```

```
\dt
```

If the seeding was successful then you should see the following four tables:

- categories
- comments
- reviews
- users

---

## Testing

To make sure everything is setup correctly run the following command to run the test suites:

```
npm test
```

If everything is setup correctly then all tests should pass.
