/*
  Exercise 2
  JavaScript quirks and tricks
*/

var schoolName = "Parsons";
var schoolYear = 1936;

// Task 1
// What is the value of test3?
var test1;
if (1 == true) {        // loose equality -> converts types
  test1 = true;
} else {
  test1 = false;
}

var test2;
if (1 === true) {       // strict equality -> no type conversion
  test2 = true;
} else {
  test2 = false;
}

var test3 = test1 === test2;

// test 1 = true
// test 2 = false
// test 3 = false

// Task 2
// Change this code so test4 is false and test5 is true. Use console.log() to confirm your cod works.

var test4 = 0 === "";    // strict equality, no type conversion
var test5 = 1 == "1";    // loose quality, string "1" coerces to number

console.log("test4 is", test4, "and test 5 is", test5);

// test4 is now false
// test5 is now true

// Task 3
// What are the values of p, q, and r? Research what is going on here.
var w = 0.1;
var x = 0.2;
var y = 0.4;
var z = 0.5;

var p = w + x;          // 0.30000000000000004
var q = z - x;          // 0.3
var r = y - w;          // 0.30000000000000004

console.log("p:", p, "q:", q, "r:", r);