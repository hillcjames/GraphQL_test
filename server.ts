var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
/**
NOTES

see https://graphql.org/learn/pagination/ for paging

see https://github.com/graphql/graphql-js/issues/524 for multiple queries in a short time frame, optimizing.


So each class would have to define the query it wanted to be run. ?
Note that it will get the data back in the way it requested it. On the backend, things just refer to each other, but inside the client,
all returned objects will be unique. So, how often will the page request something where many items all refer to the same
(large) item? And is that offset by the fact that we're only requesting the data we need?
Probably the worst would be a reference to a type of Application, from each of many running isntances of that application. But it wouldn't
be a full Application object (disregarding that Application objects are currently small), it'd only be the things specifically requested, like
its name, id, and verison.
Biggest thing would be that a change to one wouldn't change the others, so any change to an object referenced more than
once on the page woul require an update.
That'd probably be fine. I don't think we do that at all actually.


Be careful how you implement pulls from database. You want to pull all Users, then all Vritues, and then link them. There are tools in Apollo and V
The

Note that exclamation points in the schema mean that field is non-nullable.

So for javascript there's express but that looks like something just for testing, and probably couldn't be used in production.
So, how about Apollo? https://www.apollographql.com/docs/angular/
There's also

*/



// Construct a schema, using GraphQL schema language
var schema = buildSchema(`

  type Pet {
    name: String!
    species: String!
    owner: Person
  }

  type Person {
    name: String!
    pets: [Pet]!
    friends: [Person]!
  }

  type Query {
    getPerson(name: String!): Person
    getPet(name: String!): Pet
    getAnimals(species: String = "*"): [Pet]
    getFoFriends(name: String!): [Person]
    getFriendsPets(name: String!): [Pet]
  }

  type Mutation {
    createPet(name: String!, species: String!): Pet
    createPerson(name: String!): Person
    givePet(personName: String!, petName: String!): Person
    makeFriends(p1Name: String!, p2Name: String!): [Person]
  }
`);


class Pet {
  constructor(species, name) {
    this.species = species;
    this.name = name;
    this.owner = undefined;
  }

  setOwner(person) {
    this.owner = person;
  }
}

class Person {
  constructor(name) {
    this.name = name;
    this.pets = [];
    this.friends = [];
  }

  givePet(pet) {
    this.pets.push(pet);
  }

  makeFriend(newFriend) {
    this.friends.push(newFriend);
  }
}

var fakePetDatabase = {};
var fakePersonDatabase = {};

// The root provides the top-level API endpoints
var root = {
  getPet: function ({name}) {
    if (!fakePetDatabase[name]) {
      throw new Error('no pet exists with name ' + name);
    }
    return fakePetDatabase[name];
  },
  getPerson: function ({name}) {
    if (!fakePersonDatabase[name]) {
      throw new Error('no person exists with name ' + name);
    }
    return fakePersonDatabase[name];
  },
  getAnimals: function ({species}) {
    var animals = [];
    for (var key in fakePetDatabase) {
      if (fakePetDatabase.hasOwnProperty(key)) {
        if (fakePetDatabase[key].species === species || species === "*") {
          animals.push(fakePetDatabase[key]);
        }
      }
    }
    return animals;
  },
  getFriendsPets: function ({name}) {
    if (!fakePersonDatabase[name]) {
      throw new Error('no person exists with name ' + name);
    }
    var friendsPets = [];
    for (var friend of fakePersonDatabase[name].friends) {
      for (var pet of friend.pets) {
        friendsPets.push(pet);
      }
    }
    return friendsPets;
  },
  createPet: function ({species, name}) {
    var p = new Pet(species, name);
    fakePetDatabase[name] = p;
    return fakePetDatabase[name];
  },
  createPerson: function ({name}) {
    // Create a random id for our "database".
    // var id = require('crypto').randomBytes(10).toString('hex');
    var person = new Person(name);

    fakePersonDatabase[person.name] = person;

    return fakePersonDatabase[person.name];
  },
  givePet: function ({personName, petName}) {
    if (!fakePersonDatabase[personName] || !fakePetDatabase[petName]) {
      throw new Error('invalid name(s)' + personName + " " + petName);
    }
    // This replaces all old data, but some apps might want partial update.
    fakePersonDatabase[personName].givePet(fakePetDatabase[petName]);
    fakePetDatabase[petName].setOwner(fakePersonDatabase[personName]);
    return fakePersonDatabase[personName];
  },
  makeFriends: function ({p1Name, p2Name}) {
    if (!fakePersonDatabase[p1Name] || !fakePersonDatabase[p2Name]) {
      throw new Error('invalid name(s)' + p1Name + " " + p2Name);
    }
    // This replaces all old data, but some apps might want partial update.
    fakePersonDatabase[p1Name].makeFriend(fakePersonDatabase[p2Name]);
    fakePersonDatabase[p2Name].makeFriend(fakePersonDatabase[p1Name]);
    return [fakePersonDatabase[p1Name], fakePersonDatabase[p2Name]];
  },
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4097);
console.log('Running a GraphQL API server at localhost:4097/graphql');
