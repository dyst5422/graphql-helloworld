const { makeExecutableSchema } = require('graphql-tools');
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

const schema = `
  schema {
    query: Queries
  }

  type Queries {
    hello: String!
    appendStrings(string1: String!, string2: String!): String!
    deepHello: Hello!
  }

  type Hello {
    hello: String!
  }
`;

const resolver = {
  Queries: {
    hello: () => 'Hello world!',
    appendStrings: (_obj, args) => args.string1 + args.string2,
    deepHello: () => ({
      hello: "Hello Deep World",
    }),
  },
};

/* Query to try
  query {
    hello
    appendStrings(string1: "Hello ", string2: "World!")
    deepHello {
      hello
    }
  }
*/

/*
  Some stuff to set up the actual server part
*/
const executableSchema = makeExecutableSchema({
  typeDefs: [schema],
  resolvers: resolver,
})

const PORT = 3000;

const app = express();

/* Endpoint to hit for queries */
app.use('/graphql',
  bodyParser.json(),
  graphqlExpress({
    schema: executableSchema,
  }),
);
/* Serving up the GraphiQL dev tool */
app.use('/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
  }),
);
app.listen(PORT, () => {
  console.log(`GraphiQL available on http://localhost:${PORT}/graphiql`);
});
