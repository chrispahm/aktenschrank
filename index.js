const Gt06 = require('gt06');
const net = require('net');
const credentials = require('./credentials')
const nano = require('nano')(`http://${credentials.server.user}:${encodeURIComponent(credentials.server.password)}@localhost:5984`)
const gps = nano.db.use('gps')

var server = net.createServer(async (client) => {
  var gt06 = new Gt06();
  console.log('client connected');

  client.on('data', (data) => {
    try {
      gt06.parse(data);
    }
    catch (e) {
      return;
    }

    if (gt06.expectsResponse) {
      client.write(gt06.responseMsg);
    }

    if (gt06.imei && gt06.lat && gt06.lon) {
      console.log(gt06.imei, gt06.lat, gt06.lon)
      try {
        await gps.insert({
          imei: gt06.imei,
          pos: [gt06.lon, gt06.lat],
          time: new Date().toISOString()
        })
      } catch (e) {
        console.log('Couch Error: ' + e);
      }
    }

    gt06.clearMsgBuffer();
  });
});

server.listen(5022, () => {
  console.log('started server on port:', 5022);
});
