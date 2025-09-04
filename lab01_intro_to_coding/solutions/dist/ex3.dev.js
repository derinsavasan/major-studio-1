"use strict";

/*
  Exercise 3
  DOM manipulation with vanilla JS
*/
// Task
// Select HTML elements
var viz = document.body.querySelector(".viz");
var button = document.body.querySelector("#button"); // This function creates a new div as a "child" of the viz element
// it is called from the function drawIrisData

var addChildToViz = function addChildToViz(len) {
  var newChild = document.createElement("div");
  newChild.className = "rectangle";
  newChild.style.height = len * 10 + "px";
  viz.appendChild(newChild);
}; // Task
// Modify index.html to make this event listener work


button.addEventListener("click", addChildToViz); // fetches iris data
// runs through data and creates one rectangle per petal item

function drawIrisData() {
  window.fetch("./iris_json.json").then(function (data) {
    return data.json();
  }).then(function (data) {
    data.forEach(function (e) {
      addChildToViz(e.petallength);
    });
  });
}

drawIrisData(); // Task
// Modify the code above to visualize the Iris dataset in the preview of index.html.
// More on the Iris dataset: https://en.wikipedia.org/wiki/Iris_flower_data_set#Data_set
// The data set consists of 50 samples from each of three species of Iris (Iris setosa, Iris virginica and Iris versicolor).