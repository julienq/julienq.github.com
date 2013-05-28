"use strict";

var synths = [];

var palette = flexo.urn(["#ff6a4d", "#0b486b", "#5eb26b", "#774f38", "#f8ca00",
  "#9e0b46", "#a61416", "#222222", "#4dbce9", "#06491d", "#f94179"]);

var count_range = document.getElementById("count-range");
var count = synths.length;
count_range.value = count;
count_range.addEventListener("change", function (e) {
  count = parseInt(count_range.value, 10);
  update_count();
}, false);

var svg = document.querySelector("svg");
var vb = svg.viewBox.baseVal;
var width = vb.width + 2 * vb.x;
var height = vb.height + 2 * vb.y;

var note_range = [36, 108];

function set_transform(elem, x, y) {
  elem.setAttribute("transform", "translate(%0, %1)".fmt(x, y));
}

function make_circle(synth) {
  var color = palette.pick();
  var circle = svg.insertBefore(flexo.$circle({ fill: color, stroke: color,
    r: synth.volume * 500 }), svg.firstChild);
  var x = flexo.random_int(0, width);
  var y = flexo.remap(synth.note, note_range[0], note_range[1], height, 0);
  set_transform(circle, x, y);

  var v = synth.volume;
  var on = true;
  var set_on = function (o) {
    on = o;
    synth.volume = on ? v : 0;
    circle.setAttribute("fill-opacity", on ? 1 : 0);
  };

  var unlocked = false;
  var down = function (e) {
    e.preventDefault();
    var offset = flexo.event_svg_point(e, svg);
    offset.x -= x;
    offset.y -= y;
    var moved = false;
    var move = function (e) {
      moved = true;
      if (on || unlocked) {
        var p = flexo.event_svg_point(e, svg);
        x = flexo.clamp(p.x - offset.x, 0, width);
        y = flexo.clamp(p.y - offset.y, 0, height);
        set_transform(circle, x, y);
        synth.note = flexo.remap(y, height, 0, note_range[0], note_range[1]);
      }
    };
    var end = function (e) {
      unlocked = false;
      if (!moved) {
        set_on(!on);
      }
      document.removeEventListener("mousemove", move, false);
      document.removeEventListener("mouseup", end, false);
    };
    document.addEventListener("mousemove", move, false);
    document.addEventListener("mouseup", end, false);
  };

  var down_ = function (e) {
    e.preventDefault();
    e.stopPropagation();
    flexo.safe_remove(circle);
    svg.appendChild(circle);
    unlocked = true;
    down(e);
  };
  circle.addEventListener("mousedown", down_, false);
  svg.addEventListener("mousedown", down, false);

  flexo.listen_once(synth, "!discarded", function () {
    svg.removeEventListener("mousedown", down, false);
    circle.removeEventListener("mousedown", down_, false);
    svg.removeChild(circle);
  });
}

function update_count() {
  if (count < synths.length) {
    for (var i = synths.length - 1; i >= count; --i) {
      synths[i].discard();
    }
    synths.length = count;
  } else {
    for (var i = synths.length; i < count; ++i) {
      var synth = new flexo.audio.synth;
      synth.color = palette.pick();
      synth.volume = flexo.random_number(0.02, 0.08);
      synth.note = flexo.random_number.apply(this, note_range);
      synths.unshift(synth);
      make_circle(synth);
    }
  }
}
