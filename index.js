const Gt06 = require('gt06');
const net = require('net');
const credentials = require('./credentials')
const nano = require('nano')(`http://${credentials.server.user}:${encodeURIComponent(credentials.server.password)}@localhost:5984`)
const gps = nano.db.use('gps')

var server = net.createServer((client) => {
  var gt06 = new Gt06();
  console.log('client connected');

  client.on('data', async (data) => {
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
        const timestamp = new Date().toISOString()
        await gps.insert({
          _id: `${gt06.imei}::${timestamp}::${gt06.lon}::${gt06.lat}`,
          imei: gt06.imei,
          pos: [gt06.lon, gt06.lat],
          time: timestamp
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
