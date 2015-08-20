var QueueStream = require('queuestream').QueueStream,
    util = require('util'),
    fs = require('fs'),
    Stream = require('stream').Stream;

function ShoutStream(opts) {
  QueueStream.call(this);

  this.setMaxListeners(100);
  
  var self = this;
  setInterval(function() {
    self.resume();
  }, 1000);
}
util.inherits(ShoutStream, QueueStream);

ShoutStream.prototype.currentData = function(data) {
  // throttle bitrate...(atm hard coded)
  this.pause();
  this.emit('data', data);
}

function Station(opts) {
  if (!opts) opts = {};

  this.name = opts.name;
  this.genre = opts.genre;
  this.url = opts.url;
  this.notice = opts.notice;
  this.notice2 = "NodeJS Streaming Shoutcast Server/v0.1";

  this.stream = new ShoutStream();

  this.playlist = {
  };

  this.stats = {
    bytesWritten: 0,
    numPlayed: 0,
    connected: 0,
    connections: 0
  };

  var self = this;
  this.stream.on('data', function(data) {
    self.stats.bytesWritten += data.length;
  });
  this.stream.on('next', function(nextTrack) {
    self.stats.numPlayed++;
    console.log('Next: ');
    console.log(self.playlist[nextTrack.path]);
  });
}

Station.prototype.start = function() {
  this.stream.startNext();
}

Station.prototype.connect = function(req, res, cb) {
  var headers = {
    'icy-notice1': this.notice,
    'icy-notice2': this.notice2,
    'icy-name': this.name,
    'icy-genre': this.genre,
    'icy-url': this.url,
    'Content-Type': 'audio/mpegurl',
    'icy-pub':'0',
    'icy-br':'56',
    'icy-metaint': '0' //32*1024
  };

  this.stats.connected++;
  this.stats.connections++;

  var self = this;

  req.connection.on('end', function() {
    console.log('connection ended.');
    self.stats.connected--;
  });

  this.stream.getCurrent().pipe(res, function() {
      console.log('Shhhart');
      res.end();
    });
  }
}

Station.prototype.addTrack = function(track) {
  var self = this;
  function add(f) {
    if (f instanceof Stream) {
      self.stream.queue(f);
    } else {
      add(fs.createReadStream(f, {bufferSize: 128*1024}));
    }
  }

  this.playlist[(track.file || track.stream.path)] = track;
  add(track.stream || track.file);
}

module.exports = {
  Station: function(opts) {
    return new Station(opts);
  }
};
