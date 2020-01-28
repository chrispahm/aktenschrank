const Gt06 = require('gt06');
const net = require('net');
const turf = require('@turf/turf')
const credentials = require('./credentials')
const nano = require('nano')(`http://${credentials.server.user}:${encodeURIComponent(credentials.server.password)}@localhost:5984`)
const gps = nano.db.use('gps')

const cache = {}

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
      // check moving distance
      if (!cache[gt06.imei]) cache[gt06.imei] = []
      // store latest two locations, add the new location to the start of the array
      cache[gt06.imei].unshift([gt06.lon, gt06.lat])
      if (cache[gt06.imei].length === 4) {
        // remove last location from array
        cache[gt06.imei].pop()
        // check the distance between the points
        const first = turf.point(cache[gt06.imei][2])
        const second = turf.point(cache[gt06.imei][0])
        const distance = turf.distance(first,second) * 1000
        console.log(distance)
      }
      //
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
