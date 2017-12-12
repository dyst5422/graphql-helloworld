const { makeExecutableSchema } = require('graphql-tools');
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

const schema = `
  schema {
    query: Queries
  }

  type Queries {
    personById(id: String!): Person!
  }

  type Person {
    name: String!
    age: Int!
    friendIDs: [String]!
    friends: [Person]!
  }
`;

const people = {
  '0': {
    name: 'Tom',
    age: 23,
    friendIDs: ['1', '2'],
  },
  '1': {
    name: 'Mike',
    age: 32,
    friendIDs: ['0'],
  },
  '2': {
    name: 'Niko',
    age: 44,
    friendIDs: ['0'],
  }
}

const resolver = {
  Queries: {
    /* Resolve an object that then gets passed to the Person
    resolver below because the schema specified this query would return
    a Person type
    */
    personById: (_, args) => people[args.id],
  },
  /* This root resolver that will receive the object returned by ANY resolver specified to return a Person type
    so that it can resolve any "descendent" fields specified by Person in the schema.
    Here, we populate the friends field by looking up in our database the person objects by id
    Holy Cow! We can now have client-specified circular dependency resolution!
  */
  Person: {
    friends: (obj) => obj.friendIDs.map(id => people[id]),
  },
};

/* Query to try
  query {
    person(id: "0") {
      name
      age
      friendIDs
      friends {
        name
        age
        friends {
          name
          friends {
            name
          }
        }
      }
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
