Shoutcast
============

Shoutcast is a popular streaming audio server protocol. NodeJS lends itself very nicely to doing this kind of thing so building an app around it makes sense.


Disclaimer
============

Whatever is worse than alpha, this is it. Don't use it yet unless you want to help dev it. :) In that case, use it and submit patches. Thanks.


Usage
============

From the CLI

`node shoutcast.js [mp3 directory]`

From Code

    var cast = require('shoutcast');
    var station = cast.Station(conf);

    http.createServer(function (req, res) {
      first.connect(res, function() {
        console.log("Stream ended?");
      });
    }).listen(7000);

    station.start();


License
============

MIT
