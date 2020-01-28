const Gt06 = require('gt06');

const data = [
  '787822221401030d1532cb0596a9ba00e56911001400010601390a004fb40000000052fc540d0a',
  // '78780a13440602000100513bad0d0a',
  // '78780a13440602000100557d890d0a',
  // '78780a134500640001005a987a0d0a'
]

data.forEach(d => {
  const buf = new Buffer.from(d, 'hex')
  var gt06 = new Gt06();
  gt06.parse(buf);
  console.log(gt06);
})