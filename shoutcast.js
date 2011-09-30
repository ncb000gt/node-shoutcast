var net = require("net"),
    http = require('http'),
    fs = require('fs'),
    file = require('./lib/file'),
    shoutcast = require('./lib/shoutcast');

var config = {
  name: 'Node Shoutcasts R Us',
  genre: 'Musak',
  url: 'http://github.com/ncb000gt/node-shoutcast/',
  notice: 'I\'m a little teapot...'
};

var stations = [];

var first = shoutcast.Station(config);
stations.push(first);

var dir = process.argv[2];

console.log('dir: ' + dir);
var stats = fs.statSync(dir);
if (stats.isDirectory()) {
  file.walkSync(dir, function(p, dirs, files) {
    var len = files.length;
    for (var i = 0; i < len; i++) {
      var f = files[i];

      if (f.indexOf('.mp3') >= 0) {
        first.addTrack({file: p+'/'+f});
      }
    }
  });
}

http.createServer(
    function (req, res) {
      first.connect(res, function() {
        console.log("Stream ended?");
      });
    }).listen(7000);
first.start();

setInterval(function() {
  var total = 0;
  var played = 0;
  
  var len = stations.length;
  for (var idx = 0; idx < len; idx++) {
    total += stations[idx].stats.bytesWritten;
    played += stations[idx].stats.numPlayed;
  }

  console.log('Total Bytes Written: ' + total);
  console.log('Total Tracks Played: ' + played);
}, 20000);

console.log('Server running at http://0.0.0.0:7000/');
