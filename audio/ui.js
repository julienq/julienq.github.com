"use strict";

(function (ui) {

  ui.handler = function (element, svg) {
    this.element = element;
    this.svg = svg;
    this.children = [];
  };

  ui.handler.prototype.togglable = function () {
    if (!this.toggle) {
      this.toggle = new ui.togglable(this);
      this.children.push(this.toggle);
    }
    return this;
  };

  ui.handler.prototype.draggable = function () {
    if (!this.drag) {
      this.drag = new ui.draggable(this);
      this.children.push(this.drag);
    }
    return this;
  };

  ui.handler.prototype.commit = function (child) {
    this.committed = child;
    this.children.forEach(function (ch) {
      if (ch != this.committed) {
        ch.cancel();
      }
    }, this);
  };

  ui.handler.prototype.uncommit = function (child) {
    if (this.committed == child) {
      delete this.committed;
    }
  }

  ui.togglable = function (parent) {
    this.parent = parent;
    flexo.make_property(this, "enabled", function (enabled) {
      if (enabled) {
        this.parent.element.addEventListener("mousedown", this, false);
        this.parent.element.addEventListener("touchstart", this, false);
      } else {
        this.parent.element.removeEventListener("mousedown", this, false);
        this.parent.element.removeEventListener("touchstart", this, false);
      }
      return enabled;
    });
    this.enabled = true;
  };

  ui.togglable.prototype.begin = flexo.nop;
  ui.togglable.prototype.done = flexo.nop;

  ui.togglable.prototype.cancel = function () {
    document.removeEventListener("mouseup", this, false);
    document.removeEventListener("touchend", this, false);
  };

  ui.togglable.prototype.handleEvent = function (e) {
    if (e.type == "mousedown") {
      document.addEventListener("mouseup", this, false);
      this.begin();
    } else if (e.type == "mouseup") {
      this.cancel();
      if (e.target == this.parent.element) {
        this.parent.commit(this);
        this.done();
      }
    }
  };

  ui.draggable = function (parent) {
    this.parent = parent;
    flexo.make_property(this, "enabled", function (enabled) {
      if (enabled) {
        this.parent.element.addEventListener("mousedown", this, false);
        this.parent.element.addEventListener("touchstart", this, false);
      } else {
        this.parent.element.removeEventListener("mousedown", this, false);
        this.parent.element.removeEventListener("touchstart", this, false);
      }
      return enabled;
    });
    this.enabled = true;
  };

  ui.draggable.prototype.begin = flexo.nop;
  ui.draggable.prototype.progress = flexo.id;
  ui.draggable.prototype.done = flexo.nop;

  ui.draggable.prototype.start = function (e) {
    e.preventDefault();
    this.x = this.parent.element.cx ? "cx" : "x";
    this.y = this.parent.element.cy ? "cy" : "y";
    this.position = { x: this.parent.element[this.x].baseVal.value,
      y: this.parent.element[this.y].baseVal.value };
    this.origin = flexo.event_svg_point(e, this.parent.svg);
    this.begin();
  };

  ui.draggable.prototype.move = function (e) {
    if (!this.committed) {
      this.parent.commit(this);
    }
    this.committed = true;
    var p = flexo.event_svg_point(e, this.parent.svg);
    p.x += this.position.x - this.origin.x;
    p.y += this.position.y - this.origin.y;
    p = this.progress(p);
    if (p) {
      this.parent.element.setAttribute(this.x, p.x);
      this.parent.element.setAttribute(this.y, p.y);
    }
  };

  ui.draggable.prototype.cancel = function () {
    delete this.position;
    delete this.origin;
    document.removeEventListener("mousemove", this, false);
    document.removeEventListener("mouseup", this, false);
    document.removeEventListener("touchmove", this, false);
    document.removeEventListener("touchend", this, false);
  };

  ui.draggable.prototype.stop = function () {
    this.cancel();
    delete this.committed;
    this.parent.uncommit(this);
    this.done();
  };

  ui.draggable.prototype.handleEvent = function (e) {
    if (e.type == "mousedown") {
      document.addEventListener("mousemove", this, false);
      document.addEventListener("mouseup", this, false);
      this.start(e);
    } else if (e.type == "touchstart") {
      document.addEventListener("touchmove", this, false);
      document.addEventListener("touchend", this, false);
      this.start(e);
    } else if (e.type == "mousemove" || e.type == "touchmove") {
      this.move(e);
    } else if (e.type == "mouseup" || e.type == "touchend") {
      this.stop();
    }
  };

}(this.ui = {}));
