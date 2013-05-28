"use strict";

// Midi note to frequency conversion (69 = A440)
function mtof(m) {
  return Math.pow(2, (m - 69) / 12) * 440;
}

(function (audio) {
  var context = audio.context =
    new (window.AudioContext || window.webkitAudioContext);

  var volume = audio.volume = context.createGainNode();
  volume.connect(context.destination);

  audio.synth = function () {
    this.osc = context.createOscillator();
    this.vol = context.createGainNode();
    this.vol.gain.value = 0;
    this.osc.connect(this.vol);
    this.vol.connect(context.destination);
    this.osc.noteOn(0);

    flexo.make_property(this, "volume", function (v) {
      this.vol.gain.setTargetValueAtTime(v, context.currentTime + 0.1, 0.01);
      return v;
    }, 0);

    flexo.make_property(this, "note", function (m) {
      this.osc.frequency.value = mtof(m);
      return m;
    });

    flexo.make_property(this, "frequency", function (f) {
      return this.osc.frequency.value = f;
    }, this.osc.frequency.value);
  };

  var synth = audio.synth.prototype;

  synth.remove = function () {
    this.vol.disconnect();
  };

  synth.discard = function () {
    this.volume = 0;
    flexo.notify(this, "!discarded");
    setTimeout(function () {
      this.remove();
      this.osc.disconnect();
      this.osc.noteOff(0);
      delete this.osc;
      delete this.vol;
    }.bind(this), 200);
  };

}(flexo.audio = {}));
