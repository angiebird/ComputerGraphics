var CrossfadeSample = {playing:false};

CrossfadeSample.play = function() {
  // Create two sources.
  this.ctl1 = createSource(BUFFERS.rotate);
  //this.ctl2 = createSourceWithFilter(BUFFERS.drums);
  // Mute the second source.
  this.ctl1.gainNode.gain.value = 0;
  // Start playback in a loop
  if (!this.ctl1.source.start) {
    this.ctl1.source.noteOn(0);
    //this.ctl2.source.noteOn(0);
  } else {
    this.ctl1.source.start(0);
    //this.ctl2.source.start(0);
  }

  function createSource(buffer) {
    var source = context.createBufferSource();
    var gainNode = context.createGain ? context.createGain() : context.createGainNode();
    source.buffer = buffer;
    // Turn on looping
    source.loop = true;
    // Connect source to gain.
    source.connect(gainNode);
    // Connect gain to destination.
    gainNode.connect(context.destination);

    return {
      source: source,
      gainNode: gainNode
    };
  }

  function createSourceWithFilter(buffer) {
    var source = context.createBufferSource();
    var gainNode = context.createGain ? context.createGain() : context.createGainNode();
    source.buffer = buffer;

    // Turn on looping
    source.loop = true;

    // Connect source to gain.
    source.connect(gainNode);
    
	  // Create the filter.
	  var filter = context.createBiquadFilter();
	  //filter.type is defined as string type in the latest API. But this is defined as number type in old API.
	  filter.type = (typeof filter.type === 'string') ? 'lowpass' : 0; // LOWPASS
	  filter.frequency.value = 5000;

    // Connect gain to destination.
    gainNode.connect(filter);

	  filter.connect(context.destination);

    return {
      source: source,
      gainNode: gainNode,
      filter: filter
    };
  }
};

CrossfadeSample.stop = function() {
  if (!this.ctl1.source.stop) {
    this.ctl1.source.noteOff(0);
    //this.ctl2.source.noteOff(0);
  } else {
    this.ctl1.source.stop(0);
    //this.ctl2.source.stop(0);
  }
};

// Fades between 0 (all source 1) and 1 (all source 2)
CrossfadeSample.crossfade = function(element) {
  var x = element.value / element.max;
  // Use an equal-power crossfading curve:
  var gain1 = Math.cos(x * 0.5*Math.PI);
  var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);
  this.ctl1.gainNode.gain.value = gain1;
  this.ctl2.gainNode.gain.value = gain2;
};

CrossfadeSample.changeFrequency = function(element) {
  // Clamp the frequency between the minimum value (40 Hz) and half of the
  // sampling rate.
  var x = element.value / element.max;
  var minValue = 40;
  var maxValue = context.sampleRate / 2;
  // Logarithm (base 2) to compute how many octaves fall in the range.
  var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
  // Compute a multiplier from 0 to 1 based on an exponential scale.
  var multiplier = Math.pow(2, numberOfOctaves * (x - 1.0));
  // Get back to the frequency value between min and max.
  this.ctl2.filter.frequency.value = maxValue * multiplier;
};

CrossfadeSample.toggle = function() {
  this.playing ? this.stop() : this.play();
  this.playing = !this.playing;
};
