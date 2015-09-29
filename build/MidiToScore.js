!function(e,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports.MidiToScore=n():e.MidiToScore=n()}(this,function(){return function(e){function n(r){if(t[r])return t[r].exports;var a=t[r]={exports:{},id:r,loaded:!1};return e[r].call(a.exports,a,a.exports,n),a.loaded=!0,a.exports}var t={};return n.m=e,n.c=t,n.p="",n(0)}([function(module,exports,__webpack_require__){eval("var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1), __webpack_require__(3), __webpack_require__(2)], __WEBPACK_AMD_DEFINE_RESULT__ = function(midiFileParser, Transport, Parts){\n\n	return {\n		/**\n		 *  Convert a midi file to a Tone.Score-friendly JSON representation\n		 *  @param  {ArrayBuffer}  fileBlob  The output from fs.readFile or FileReader\n		 *  @param  {Object}  options   The parseing options\n		 *  @return  {Object}  A Tone.js-friendly object which can be consumed\n		 *                       by Tone.Score\n		 */\n		parseParts : function(fileBlob, options){\n			var midiJson = midiFileParser(fileBlob);\n			return Parts(midiJson, options);\n		},\n		/**\n		 *  Parse the Transport-relevant descriptions from the MIDI file blob\n		 *  @param  {ArrayBuffer}  fileBlob  The output from fs.readFile or FileReader\n		 *  @return  {Object}  \n		 */\n		parseTransport : function(fileBlob){\n			var midiJson = midiFileParser(fileBlob);\n			return Transport(midiJson);\n		}\n	};\n}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));\n\n\n/*****************\n ** WEBPACK FOOTER\n ** ./src/MidiToScore.js\n ** module id = 0\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./src/MidiToScore.js?")},function(module,exports){eval("// https://github.com/gasman/jasmid\n//\n//\n\nmodule.exports = function(file){\n	return MidiFile(file)\n};\n\nfunction MidiFile(data) {\n	function readChunk(stream) {\n		var id = stream.read(4);\n		var length = stream.readInt32();\n		return {\n			'id': id,\n			'length': length,\n			'data': stream.read(length)\n		};\n	}\n	\n	var lastEventTypeByte;\n	\n	function readEvent(stream) {\n		var event = {};\n		event.deltaTime = stream.readVarInt();\n		var eventTypeByte = stream.readInt8();\n		if ((eventTypeByte & 0xf0) == 0xf0) {\n			/* system / meta event */\n			if (eventTypeByte == 0xff) {\n				/* meta event */\n				event.type = 'meta';\n				var subtypeByte = stream.readInt8();\n				var length = stream.readVarInt();\n				switch(subtypeByte) {\n					case 0x00:\n						event.subtype = 'sequenceNumber';\n						if (length != 2) throw \"Expected length for sequenceNumber event is 2, got \" + length;\n						event.number = stream.readInt16();\n						return event;\n					case 0x01:\n						event.subtype = 'text';\n						event.text = stream.read(length);\n						return event;\n					case 0x02:\n						event.subtype = 'copyrightNotice';\n						event.text = stream.read(length);\n						return event;\n					case 0x03:\n						event.subtype = 'trackName';\n						event.text = stream.read(length);\n						return event;\n					case 0x04:\n						event.subtype = 'instrumentName';\n						event.text = stream.read(length);\n						return event;\n					case 0x05:\n						event.subtype = 'lyrics';\n						event.text = stream.read(length);\n						return event;\n					case 0x06:\n						event.subtype = 'marker';\n						event.text = stream.read(length);\n						return event;\n					case 0x07:\n						event.subtype = 'cuePoint';\n						event.text = stream.read(length);\n						return event;\n					case 0x20:\n						event.subtype = 'midiChannelPrefix';\n						if (length != 1) throw \"Expected length for midiChannelPrefix event is 1, got \" + length;\n						event.channel = stream.readInt8();\n						return event;\n					case 0x2f:\n						event.subtype = 'endOfTrack';\n						if (length != 0) throw \"Expected length for endOfTrack event is 0, got \" + length;\n						return event;\n					case 0x51:\n						event.subtype = 'setTempo';\n						if (length != 3) throw \"Expected length for setTempo event is 3, got \" + length;\n						event.microsecondsPerBeat = (\n							(stream.readInt8() << 16)\n							+ (stream.readInt8() << 8)\n							+ stream.readInt8()\n						)\n						return event;\n					case 0x54:\n						event.subtype = 'smpteOffset';\n						if (length != 5) throw \"Expected length for smpteOffset event is 5, got \" + length;\n						var hourByte = stream.readInt8();\n						event.frameRate = {\n							0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30\n						}[hourByte & 0x60];\n						event.hour = hourByte & 0x1f;\n						event.min = stream.readInt8();\n						event.sec = stream.readInt8();\n						event.frame = stream.readInt8();\n						event.subframe = stream.readInt8();\n						return event;\n					case 0x58:\n						event.subtype = 'timeSignature';\n						if (length != 4) throw \"Expected length for timeSignature event is 4, got \" + length;\n						event.numerator = stream.readInt8();\n						event.denominator = Math.pow(2, stream.readInt8());\n						event.metronome = stream.readInt8();\n						event.thirtyseconds = stream.readInt8();\n						return event;\n					case 0x59:\n						event.subtype = 'keySignature';\n						if (length != 2) throw \"Expected length for keySignature event is 2, got \" + length;\n						event.key = stream.readInt8(true);\n						event.scale = stream.readInt8();\n						return event;\n					case 0x7f:\n						event.subtype = 'sequencerSpecific';\n						event.data = stream.read(length);\n						return event;\n					default:\n						// console.log(\"Unrecognised meta event subtype: \" + subtypeByte);\n						event.subtype = 'unknown'\n						event.data = stream.read(length);\n						return event;\n				}\n				event.data = stream.read(length);\n				return event;\n			} else if (eventTypeByte == 0xf0) {\n				event.type = 'sysEx';\n				var length = stream.readVarInt();\n				event.data = stream.read(length);\n				return event;\n			} else if (eventTypeByte == 0xf7) {\n				event.type = 'dividedSysEx';\n				var length = stream.readVarInt();\n				event.data = stream.read(length);\n				return event;\n			} else {\n				throw \"Unrecognised MIDI event type byte: \" + eventTypeByte;\n			}\n		} else {\n			/* channel event */\n			var param1;\n			if ((eventTypeByte & 0x80) == 0) {\n				/* running status - reuse lastEventTypeByte as the event type.\n					eventTypeByte is actually the first parameter\n				*/\n				param1 = eventTypeByte;\n				eventTypeByte = lastEventTypeByte;\n			} else {\n				param1 = stream.readInt8();\n				lastEventTypeByte = eventTypeByte;\n			}\n			var eventType = eventTypeByte >> 4;\n			event.channel = eventTypeByte & 0x0f;\n			event.type = 'channel';\n			switch (eventType) {\n				case 0x08:\n					event.subtype = 'noteOff';\n					event.noteNumber = param1;\n					event.velocity = stream.readInt8();\n					return event;\n				case 0x09:\n					event.noteNumber = param1;\n					event.velocity = stream.readInt8();\n					if (event.velocity == 0) {\n						event.subtype = 'noteOff';\n					} else {\n						event.subtype = 'noteOn';\n					}\n					return event;\n				case 0x0a:\n					event.subtype = 'noteAftertouch';\n					event.noteNumber = param1;\n					event.amount = stream.readInt8();\n					return event;\n				case 0x0b:\n					event.subtype = 'controller';\n					event.controllerType = param1;\n					event.value = stream.readInt8();\n					return event;\n				case 0x0c:\n					event.subtype = 'programChange';\n					event.programNumber = param1;\n					return event;\n				case 0x0d:\n					event.subtype = 'channelAftertouch';\n					event.amount = param1;\n					return event;\n				case 0x0e:\n					event.subtype = 'pitchBend';\n					event.value = param1 + (stream.readInt8() << 7);\n					return event;\n				default:\n					throw \"Unrecognised MIDI event type: \" + eventType\n					/* \n					console.log(\"Unrecognised MIDI event type: \" + eventType);\n					stream.readInt8();\n					event.subtype = 'unknown';\n					return event;\n					*/\n			}\n		}\n	}\n	\n	stream = Stream(data);\n	var headerChunk = readChunk(stream);\n	if (headerChunk.id != 'MThd' || headerChunk.length != 6) {\n		throw \"Bad .mid file - header not found\";\n	}\n	var headerStream = Stream(headerChunk.data);\n	var formatType = headerStream.readInt16();\n	var trackCount = headerStream.readInt16();\n	var timeDivision = headerStream.readInt16();\n	\n	if (timeDivision & 0x8000) {\n		throw \"Expressing time division in SMTPE frames is not supported yet\"\n	} else {\n		ticksPerBeat = timeDivision;\n	}\n	\n	var header = {\n		'formatType': formatType,\n		'trackCount': trackCount,\n		'ticksPerBeat': ticksPerBeat\n	}\n	var tracks = [];\n	for (var i = 0; i < header.trackCount; i++) {\n		tracks[i] = [];\n		var trackChunk = readChunk(stream);\n		if (trackChunk.id != 'MTrk') {\n			throw \"Unexpected chunk - expected MTrk, got \"+ trackChunk.id;\n		}\n		var trackStream = Stream(trackChunk.data);\n		while (!trackStream.eof()) {\n			var event = readEvent(trackStream);\n			tracks[i].push(event);\n			//console.log(event);\n		}\n	}\n	\n	return {\n		'header': header,\n		'tracks': tracks\n	}\n};\n\n/* Wrapper for accessing strings through sequential reads */\nfunction Stream(str) {\n	var position = 0;\n	\n	function read(length) {\n		var result = str.substr(position, length);\n		position += length;\n		return result;\n	}\n	\n	/* read a big-endian 32-bit integer */\n	function readInt32() {\n		var result = (\n			(str.charCodeAt(position) << 24)\n			+ (str.charCodeAt(position + 1) << 16)\n			+ (str.charCodeAt(position + 2) << 8)\n			+ str.charCodeAt(position + 3));\n		position += 4;\n		return result;\n	}\n\n	/* read a big-endian 16-bit integer */\n	function readInt16() {\n		var result = (\n			(str.charCodeAt(position) << 8)\n			+ str.charCodeAt(position + 1));\n		position += 2;\n		return result;\n	}\n	\n	/* read an 8-bit integer */\n	function readInt8(signed) {\n		var result = str.charCodeAt(position);\n		if (signed && result > 127) result -= 256;\n		position += 1;\n		return result;\n	}\n	\n	function eof() {\n		return position >= str.length;\n	}\n	\n	/* read a MIDI-style variable-length integer\n		(big-endian value in groups of 7 bits,\n		with top bit set to signify that another byte follows)\n	*/\n	function readVarInt() {\n		var result = 0;\n		while (true) {\n			var b = readInt8();\n			if (b & 0x80) {\n				result += (b & 0x7f);\n				result <<= 7;\n			} else {\n				/* b is the last byte */\n				return result + b;\n			}\n		}\n	}\n	\n	return {\n		'eof': eof,\n		'read': read,\n		'readInt32': readInt32,\n		'readInt16': readInt16,\n		'readInt8': readInt8,\n		'readVarInt': readVarInt\n	}\n}\n\n/*****************\n ** WEBPACK FOOTER\n ** ./~/midi-file-parser/index.js\n ** module id = 1\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./~/midi-file-parser/index.js?")},function(module,exports,__webpack_require__){eval('var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){\n\n	/**\n	 *  Convert a MIDI number to scientific pitch notation\n	 *  @param {Number} midi The MIDI note number\n	 *  @returns {String} The note in scientific pitch notation\n	 */\n	function midiToNote(midi){\n		var scaleIndexToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];\n		var octave = Math.floor(midi / 12) - 1;\n		var note = midi % 12;\n		return scaleIndexToNote[note] + octave;\n	}\n\n	/**\n	 *  Convert MIDI PPQ into Tone.js PPQ\n	 */\n	function ticksToToneTicks(tick, ticksPerBeat, PPQ){\n		return Math.round((tick / ticksPerBeat) * PPQ) + "i";\n	}\n\n	/**\n	 *  Parse noteOn/Off from the tracks in midi JSON format into\n	 *  Tone.Score-friendly format.\n	 *  @param  {Object}  midiJson \n	 *  @param  {Object}  options   options for parseing\n	 *  @return  {Object}\n	 */\n	return function parseParts(midiJson, options){\n		var ticksPerBeat = midiJson.header.ticksPerBeat;\n		//some default values\n		options = typeof options !== "object" ? {} : options;\n		options.PPQ = typeof options.PPQ === "undefined" ? 48 : options.PPQ;\n		options.midiNote = typeof options.midiNote === "undefined" ? true : options.midiNote;\n		options.noteName = typeof options.noteName === "undefined" ? true : options.noteName;\n\n		var output = {};\n\n		//parse each of the tracks\n		for (var i = 0; i < midiJson.tracks.length; i++) {\n			var track = midiJson.tracks[i];\n			var trackName = "track"+i;\n			var trackNotes = [];\n			var currentTime = 0;\n			for (var j = 0; j < track.length; j++){\n				var evnt = track[j];\n				currentTime += evnt.deltaTime;\n				var velocity = evnt.velocity / 127;\n				if (evnt.subtype === "noteOn"){\n					var noteObj = {\n						ticks : currentTime,\n						time : currentTime, \n						note : evnt.noteNumber,\n						velocity : velocity,\n					};\n					if (options.midiNote){\n						noteObj.midiNote = evnt.noteNumber;\n					}\n					if (options.noteName){\n						noteObj.noteName =  midiToNote(evnt.noteNumber);\n					}\n					trackNotes.push(noteObj);\n				} else if (evnt.subtype === "noteOff"){\n					//add the duration\n					for (var k = trackNotes.length - 1; k >= 0; k--){\n						var trackNote = trackNotes[k];\n						if (trackNote.note === evnt.noteNumber && typeof trackNote.duration === "undefined"){\n							trackNote.duration = ticksToToneTicks(currentTime - trackNote.ticks, ticksPerBeat, options.PPQ);\n							trackNote.time = ticksToToneTicks(trackNote.time, ticksPerBeat, options.PPQ);\n							delete trackNote.note;\n							delete trackNote.ticks;\n							break;\n						}\n					}\n				} else if (evnt.type === "meta" && evnt.subtype === "trackName"){\n					trackName = evnt.text;\n					//Ableton Live adds an additional character to the track name\n					trackName = trackName.replace(/\\u0000/g, \'\');\n				}\n			}\n			if (trackNotes.length > 0){\n				output[trackName] = trackNotes;\n			}\n		}\n		return output;\n	};\n}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));\n\n/*****************\n ** WEBPACK FOOTER\n ** ./src/Parts.js\n ** module id = 2\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./src/Parts.js?')},function(module,exports,__webpack_require__){eval('var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){\n\n	/**\n	 *  Parse tempo and time signature from the midiJson\n	 *  @param  {Object}  midiJson \n	 *  @return  {Object}\n	 */\n	return function parseTransport(midiJson){\n		var ret = {};\n		for (var i = 0; i < midiJson.tracks.length; i++){\n			var track = midiJson.tracks[i];\n			for (var j = 0; j < track.length; j++){\n				var datum = track[j];\n				if (datum.type === "meta"){\n					if (datum.subtype === "timeSignature"){\n						ret.timeSignature = [datum.numerator, datum.denominator];\n					} else if (datum.subtype === "setTempo"){\n						ret.bpm = 60000000 / datum.microsecondsPerBeat;\n					}\n				} \n			}\n		}\n		return ret;\n	};\n\n}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));\n\n/*****************\n ** WEBPACK FOOTER\n ** ./src/Transport.js\n ** module id = 3\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./src/Transport.js?')}])});