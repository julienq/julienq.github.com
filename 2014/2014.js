(function () {
  "use strict";

  var svg = document.querySelector("svg");
  var g = svg.querySelector("g");
  var bbox = svg.viewBox.baseVal;
  var h = bbox.height;
  var w = bbox.width;
  var text = "2014";
  var n = text.length;
  var threshold = 5;

  for (var y = 0, i = n - 1; y < h; ++i) {
    var elem = g.appendChild(document.createElementNS(g.namespaceURI, "text"));
    elem.setAttribute("dominant-baseline", "middle");
    elem.setAttribute("font-weight", "bold");
    elem.setAttribute("fill", "#ff4040");
    elem.setAttribute("y", y);

    var t = "";
    for (var j = 0; j < i; ++j) {
      t += text[j % n];
    }
    elem.textContent = t;
    var min = 0;
    var max = w;
    var size = w / 2;
    while (true) {
      elem.setAttribute("font-size", size);
      var bbox = elem.getBBox();
      var dw = bbox.width - w;
      if (dw < -threshold) {
        min = size;
        size = (max + min) / 2;
      } else if (dw > threshold) {
        max = size;
        size = (max + min) / 2;
      } else {
        var m = t.length * 2;
        m += m % n;
        for (; j < m; ++j) {
          t += text[j % n];
        }
        elem.textContent = t;
        bbox = elem.getBBox();
        elem.textContent += t;
        y = bbox.y + bbox.height;
        var anim = elem.appendChild(document.createElementNS(elem.namespaceURI,
              "animateTransform"));
        anim.setAttribute("attributeName", "transform");
        anim.setAttribute("attributeType", "XML");
        anim.setAttribute("type", "translate");
        anim.setAttribute("from", 0);
        anim.setAttribute("to", -bbox.width);
        anim.setAttribute("repeatCount", "indefinite");
        anim.setAttribute("dur", "5s");
        anim.setAttribute("additive", "replace");
        break;
      }
    }
  }

}());
