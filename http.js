const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer((req, res) => {
	let url = req.url;
	let query = "";
	if ( url.includes('?') ) {
		url = url.replace(/\?.*/g, '');
		query = req.url.replace(/.*\?/g, '');
	}
	let f = path.join('./', url == "/" ? "index.html" : url);
	if ( f.match(/index\.html$/) ) {
		// do not anything.
	} else {
		if ( f.match(/\/$/) ) {
			if ( path.extname(f) === '' ) {
				f += "index.html";
			}
		} else {
			if ( path.extname(f) === '' ) {
				f += ".html";
			}
		}
	}


	res.writeHead(200);

	console.log(f);
	try {
		if ( fs.existsSync(f) ) {
			res.write(fs.readFileSync(f));
		}
	} catch (err) {
		console.log(err);
	}
	res.end();
}).listen(10000);
console.log('listen 10000');
