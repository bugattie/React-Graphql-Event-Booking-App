const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const morgan = require("morgan");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const Event = require("./models/eventModel");
const User = require("./models/userModel");
const bcrypt = require("bcryptjs");

const app = express();

dotenv.config({ path: "./config.env" });
app.use(bodyParser.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map((event) => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator),
      };
    });
  } catch (err) {
    throw err;
  }
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      password: null,
      createdEvents: events.bind(this, user._doc.createdEvents),
    };
  } catch (err) {
    throw err;
  }
};

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type User {
          _id: ID!
          email: String!
          password: String
          createdEvents: [Event!]
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String
        }

        input UserInput {
          email: String!
          password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: async () => {
        try {
          const result = await Event.find();

          return result.map((event) => {
            return {
              ...event._doc,
              _id: result.id,
              date: new Date(event._doc.date).toISOString(),
              creator: user.bind(this, event._doc.creator),
            };
          });
        } catch (err) {
          throw err;
        }
      },
      createEvent: async (args) => {
        try {
          const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: args.eventInput.price,
            date: new Date(),
            creator: "61f53d2993d703f9d1179913",
          });
          const createdEvent = await event.save();

          const creator = await User.findById("61f53d2993d703f9d1179913");

          if (!creator) {
            throw new Error("User not found");
          }

          creator.createdEvents.push(createdEvent);
          await creator.save();

          return {
            ...createdEvent._doc,
            _id: createdEvent.id,
            date: new Date(createdEvent._doc.date).toISOString(),
            creator: user.bind(this, createdEvent._doc.creator),
          };
        } catch (err) {
          throw err;
        }
      },

      createUser: async (args) => {
        try {
          const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

          const user = new User({
            email: args.userInput.email,
            password: hashedPassword,
          });
          const result = await user.save();

          return { ...result._doc, password: null, _id: result.id };
        } catch (err) {
          throw err;
        }
      },
    },
    graphiql: true,
  })
);

module.exports = app;
