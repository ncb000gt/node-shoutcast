var net = require("net")
,fs = require("fs")
,sys = require("sys")
,http = require('http')
,file = require('./lib/file');

var song_queue = {
  songs: [],
  idx: 0
};

var STATION = {
  NAME: 'Node Shoutcasts R Us',
  GENRE: 'Musak',
  URL: 'http://github.com/ncb000gt/node-shoutcast/',
  NOTICE: 'I\'m a little teapot...'
};

var config = require('/usr/local/etc/node-shoutcast/config');
sys.debug('config: ' + JSON.stringify(config));
if ('STATION' in config) {
  var config_station = config.STATION;
  if ('NAME' in config_station) {
    STATION.NAME = config_station.NAME;
  } else if ('GENRE' in config_station) {
    STATION.GENRE = config_station.GENRE;
  } else if ('URL' in config_station) {
    STATION.URL = config_station.URL;
  } else if ('NOTICE' in config_station) {
    STATION.NOTICE = config_station.NOTICE;
  }
}

var PLAYLIST = config.PLAYLIST;
var QUEUE_SIZE = config.QUEUE_SIZE || 10;

sys.debug('PLAYLIST: ' + PLAYLIST);
var stats = fs.statSync(PLAYLIST);
if (stats.isDirectory()) {
  file.walkSync(PLAYLIST, function(p, dirs, files) {
                  var len = files.length;
                  for (var i = 0; i < len; i++) {
                    var file = files[i];
                    if (file.indexOf('.mp3') >= 0) {
                      song_queue.songs.push(p+'/'+file);
                    }
                    if (song_queue.songs.length > QUEUE_SIZE) {
                      break;
                    }
                  }
                });
}

var headers = {
  'icy-notice1': STATION.NOTICE,
  'icy-notice2': "NodeJS Streaming Shoutcast Server/v0.1",
  'icy-name': STATION.NAME,
  'icy-genre': STATION.GENRE,
  'icy-url': STATION.URL,
  'Content-Type': 'audio/mpegurl',
  'icy-pub':'0',
  'icy-br':'56',
  'icy-metaint': '0'//1024'
};

var currentSong = null;
var filetoread = "/home/ncampbell/Music/Amazon MP3/David Guetta/One Love (Deluxe Version)/Memories (Feat Kid Cudi).mp3";

var bytesOut = 0;

http.createServer(
  function (req, res) {
    var o = req.headers;
    for (var p in o) {
      sys.puts(p + ': ' + o[p]);
    }

    sys.puts('Starting stream...');

    res.writeHead(200, headers);

    //TODO: pop song and make read song as a stream separate from the request, requests should just tie into the already running stream
    var song = song_queue.songs[song_queue.idx];
    sys.debug('song: ' + song);
    var fStream = fs.createReadStream(song, {bufferSize:1024});

    pump(fStream, res, function() { sys.puts("No more data. Closing."); });

  }).listen(7000);

setInterval(function() {
              sys.debug('Total Bytes Written: ' + bytesOut);
            }, 3000);

sys.puts('Server running at http://0.0.0.0:7000/');

function pump(readStream, writeStream, callback) {
  var callbackCalled = false;

  function call (a, b, c) {
    if (callback && !callbackCalled) {
      callback(a, b, c);
      callbackCalled = true;
    }
  }

  if (!readStream.pause) readStream.pause = function () {readStream.emit("pause")};
  if (!readStream.resume) readStream.resume = function () {readStream.emit("resume")};

  readStream.addListener("data", function (chunk) {
                           bytesOut+=chunk.length;
                           if (writeStream.write(chunk) === false) readStream.pause();
                         });

  writeStream.addListener("pause", function () {
                            readStream.pause();
                          });

  writeStream.addListener("drain", function () {
                            readStream.resume();
                          });

  writeStream.addListener("resume", function () {
                            readStream.resume();
                          });

  readStream.addListener("end", function () {
                           writeStream.end();
                         });

  readStream.addListener("close", function () {
                           call();
                         });

  readStream.addListener("error", function (err) {
                           writeStream.end();
                           call(err);
                         });

  writeStream.addListener("error", function (err) {
                            readStream.destroy();
                            call(err);
                          });
};