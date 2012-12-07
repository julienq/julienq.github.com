"use strict";

var tags = {};
var tagged = Array.prototype.slice.call(document
  .querySelectorAll("[data-tags]"));
tagged.forEach(function(e) {
  e.dataset.tags.split(/\s+/).forEach(function (t) {
    if (t) {
      if (!tags.hasOwnProperty(t)) {
        tags[t] = [];
      }
      tags[t].push(e);
    }
  });
});

function select(div) {
  div.classList.add("selected");
  tagged.forEach(function (e) {
    if (e.dataset.tags.split(/\s+/).indexOf(div.textContent) < 0) {
      e.classList.add("hidden");
    }
  });
}

function deselect() {
  var sel = document.querySelector(".selected");
  if (sel) {
    sel.classList.remove("selected");
    Array.prototype.forEach.call(document.querySelectorAll(".hidden"),
      function (e) {
        e.classList.remove("hidden");
      });
  }
  return sel;
}

var h = document.querySelector("header");
Object.keys(tags).sort().forEach(function (t) {
  var div = h.appendChild(flexo.$("div.button", t));
  div.addEventListener("mousedown", function (e) {
    e.preventDefault();
  }, false);
  div.addEventListener("mouseup", function (e) {
    var sel = deselect();
    if (sel !== div) {
      select(div);
    }
  }, false);
});
