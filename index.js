const Gt06 = require('gt06');
const net = require('net');

var server = net.createServer((client) => {
  var gt06 = new Gt06();
  console.log('client connected');

  client.on('data', (data) => {
    try {
      gt06.parse(data);
    }
    catch (e) {
      console.log('err', e);
      return;
    }

    if (gt06.expectsResponse) {
      client.write(gt06.responseMsg);
    }

    if (gt06.imei && gt06.lat && gt06.lon) {
      console.log(gt06.imei, gt06.lat, gt06.lon)
      /* rethinkdb store 
       {
       imei: gt06.imei,
       lat: gt06.lat
       lng: gt06.lon,
       time: new Date().toISOString()
     }
      */
    }

    gt06.clearMsgBuffer();
  });
});

server.listen(5022, () => {
  console.log('started server on port:', 5022);
});
