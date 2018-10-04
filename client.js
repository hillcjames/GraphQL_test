var fetch = require("node-fetch");


var m = `mutation {
	m01: createPet(name: "Phil", species: "cat") {
	  name
    species
	}
	m02: createPet(name: "Maximus", species: "cat") {
	  name
    species
	}
	m03: createPet(name: "Bob", species: "cat") {
	  name
    species
	}
	m04: createPet(name: "Max", species: "dog") {
	  name
    species
	}
	m05: createPet(name: "Terry", species: "dog") {
	  name
    species
	}
	m06: createPet(name: "Roger the terrible", species: "hamster") {
	  name
    species
	}
	m07: createPerson(name: "Alice") {
	  name
	}
	m08: createPerson(name: "Bill") {
	  name
	}
	m09: createPerson(name: "Carlos") {
	  name
	}
	newPet1: givePet(personName: "Carlos", petName: "Roger the terrible") {
	  name
	}
	newPet2: givePet(personName: "Bill", petName: "Bob") {
	  name
	}
	newPet3: givePet(personName: "Bill", petName: "Max") {
	  name
	}
	newPet4: givePet(personName: "Alice", petName: "Phil") {
	  name
	}
	newPet5: givePet(personName: "Alice", petName: "Terry") {
	  name
	}
	newPet: givePet(personName: "Alice", petName: "Maximus") {
	  name
	}
	friends: makeFriends(p1Name: "Alice", p2Name: "Bill") {
	  name
	}
}`;

var q = `{
  getAnimals: getAnimals() {
    name
    species
    owner {
      name
    }
  }
  alicesFriendsPets: getFriendsPets(name: "Alice") {
    name
    species
    owner {
      name
    }
  }
}`;

fetch('http://localhost:4097/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify( {query: m} )
})
  .then(r => r.json())
  .then(data => {
    console.log('data returned:', data);
    console.log("\n");
  });

fetch('http://localhost:4097/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    query: q,
    variables: { },
  })
})
  .then(r => r.json())
  .then(data => {
    console.log('data returned:', data);
    console.log("\n");
  });
