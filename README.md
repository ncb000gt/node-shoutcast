Shoutcast
============

Shoutcast is a popular streaming audio server protocol. NodeJS lends itself very nicely to doing this kind of thing so building an app around it makes sense.


Disclaimer
============

Whatever is worse than alpha, this is it. Don't use it yet unless you want to help dev it. :) In that case, use it and submit patches. Thanks.


Usage
============

node shoutcast.js

If you want to custom configure the options (kind of have to at this point) you have to create `config.js` in `/usr/local/etc/node-shoutcast/` such that it looks like the following (the url is not the url to access the station at, instead it is what is provided for meta data about the station).

    exports.STATION = { 
      NAME: 'Bleh', 
      GENRE: 'MUZAK', 
      URL: 'http://somedomain.com', 
      NOTICE: 'le what?' 
    }; 
    exports.PLAYLIST = '/path/to/my/mp3s/'; 
    exports.QUEUE_SIZE = 20; 


License
============

see LICENSE file