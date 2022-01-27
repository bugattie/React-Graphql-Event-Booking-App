const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');


const app = express();

dotenv.config({ path: "./config.env" });
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return ['All-night coding', 'Reading'];
        },
        createEvent(args) {
            return args.name;
        }
    },
    graphiql: true
}))

module.exports = app;