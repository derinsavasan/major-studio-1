/*
  Exercise 1
  JavaScript data structures & functions
*/

var names = [
  "Rubin Museum",
  "The Cooper Hewitt (Smithsonian)",
  "The Morgan Library and Museum",
  "The Whitney Museum of American Art",
  "The Frick Collection",
  "American Museum of Natural History",
];

var URLs = [
  "rubinmuseum.org",
  "cooperhewitt.org",
  "themorgan.org",
  "whitney.org",
  "frick.org",
  "amnh.org",
];

var years = [
  2004,
  1896,
  1924,
  1930,
  1935,
  1869
];

// Task 1
// Console log the length of each Array
console.log(names.length)
console.log(URLs.length)
console.log(years.length)


// Task 2
// add a new item to an array
var newName = "The International Center of Photography"
var newURL = "icp.org"
var newYear = 1974

names.push(newName);                  // add to names
URLs[URLs.length] = newURL;           // add to URLs at the end
years = years.concat([newYear]);      // cocat returns a new array

// Task 3
// construct an Object out of our three Arrays
// the result should look similar to this:
var result = {
  "Museum Name 1": {
    URL: "www.museumwebsite.com",
    year: 2019
  }
}

var museums = {};
for (var i = 0; i < names.length; i++) {
  var currentName = names[i];        // museum name
  var currentURL = URLs[i];          // corresponging URL
  var currentYear = years[i];        // corresponding year

  museums[currentName] = {};
  museums[currentName]["URL"] = currentURL;
  museums[currentName].year = currentYear;
}

console.log('museums', museums)

var museums2 = {};
names.forEach(function(n, i) {      // n = name, i = index
  museums2[n] = {};

  var currentURL = URLs[i];
  var currentYear = years[i];

  museums2[n].URL = currentURL;
  museums2[n]["year"] = currentYear;
});

console.log('museums2', museums2)

// Task 4
// Write a function to add a new museum object, with properties URL and year, to an existing museums object. Call it on museums2
function addAMuseum(museums, newName, newURL, newYear){
  museums[newName] = {
    URL: newURL,
    year: newYear
  };
  return museums;
}

addAMuseum(museums2, "Test Museum", "test.org", 2025);

console.log('museums2 after adding new museum', museums2);
