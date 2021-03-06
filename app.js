var constants = require('constants');

var express = require('express');
var fs = require('fs');
var guid = require('node-uuid');

// server.js (Express 4.0)
var express			= require('express');
var morgan			= require('morgan');
var bodyParser		= require('body-parser');
var methodOverride	= require('method-override');
var app				= express();

app.use(express.static(__dirname + '/public'));			// set the static files location /public/img will be /img for users
app.use(morgan('dev'));									// log every request to the console
app.use(bodyParser.urlencoded({ extended: false }))		// parse application/x-www-form-urlencoded

app.use(bodyParser.json())								// parse application/json
app.use(bodyParser.raw({
	inflate: true,
	limit: '10mb',
	type: [ 'image/gif', 'audio/mpeg' ]
}));

app.use(methodOverride());								// simulate DELETE and PUT

app.listen(3000);
console.log('Magic happens on port 3000');				// shoutout to the user

var notes = [];
var file_path = "notes.json";

//******************************************************************************
//                          READ API
//******************************************************************************

app.get('/remixId/:remixId/id/:id/audio', function (req, res) {
	getFile(req.params.remixId, req.params.id, '.mp3', res, 'audio/mpeg');
});

app.get('/remixId/:remixId/id/:id/ink', function (req, res) {
	getFile(req.params.remixId, req.params.id, '.gif', res, 'image/gif');
});

app.get('/remixId/:remixId', function(req, res) {
	res.writeHead(200, {'Content-Type': 'application/json'});
	res.end(JSON.stringify(getNotesByRemixId(req.params.remixId)));
});

app.get('/', function(req, res) {
	res.writeHead(200, {'Content-Type': 'application/json'});
	res.end(JSON.stringify(notes));
});


//******************************************************************************
//                          WRITE API
//******************************************************************************

app.post('/remixId/:remixId', function(req, res) {
	var found = false;
	var data = parseUpdateRequestIntoObject(req, req.params.remixId);

	for (var i = 0; i < notes.length; i++) {
		if (notes[i].noteId == data.noteId) {
			found = true;
		}
	}

	if (!found) {
		notes.push(data);
		saveNotes();
		res.writeHead(200, {'id': data.noteId});
		res.end(JSON.stringify(data));
	} else {
		res.writeHead(405, {'id': data.noteId});
		res.end("Note already exists, cannot overwrite. Please use PUT to update an existing note.");
	}
});

app.put('/remixId/:remixId/id/:id', function(req, res) {
	var found = false;
	var data = parseUpdateRequestIntoObject(req, req.params.remixId, req.params.id);
	for (var i = 0; i < notes.length; i++) {
		if (notes[i].noteId == req.params.id) {
			notes[i] = data;
			found = true;
		}
	}

	if (found) {
		saveNotes();
		res.writeHead(200, {'id': req.params.id});
		res.end(JSON.stringify(data));
	} else {
		res.writeHead(404, {'id': req.params.id});
		res.end();
	}
});

app.put('/remixId/:remixId/id/:id/audio', function (req, res) {
	putFile(req.params.remixId, req.params.id, req.body, '.mp3', res);
});

app.put('/remixId/:remixId/id/:id/ink', function (req, res) {
	putFile(req.params.remixId, req.params.id, req.body, '.gif', res);
});

app.delete('/remixId/:remixId/id/:id', function(req, res) {
	var found = false;
	var updatedNotes = [];
	for (var i = 0; i < notes.length; i++) {
		if (notes[i].noteId != req.params.id) {
			updatedNotes.push(notes[i]);
		} else {
			found = true;
		}
	}

	if (found) {
		notes = updatedNotes;
		saveNotes();
		res.writeHead(200, {'id': req.params.id});
		res.end('deleted');
	} else {
		res.writeHead(404, {'id': req.params.id});
		res.end();
	}
});


//******************************************************************************
//                          helper methods
//******************************************************************************

function parseUpdateRequestIntoObject(req, remixId, id) {
	var data = req.body;
	// data.noteId = id;
	// data.remixId = remixId;
	//console.log("Object: " + JSON.stringify(data));
	return data;
}

function getNotesByRemixId(remixId) {
	var filteredNotes = [];
	for (var i = 0; i < notes.length; i++) {
		if (notes[i].remixId == remixId) {
			filteredNotes.push(notes[i]);
		}
	}
	return filteredNotes;
}

function saveNotes() {
	var data = JSON.stringify(notes, null, '\t');
	console.log("writing notes file: " + file_path);
	try {
		fs.writeFileSync(file_path, data, "utf8");
	} catch (err) {
		console.log("...error: " + err);
	}
}

function readNotes() {
	console.log("reading notes file: " + file_path);
	try {
		notes = JSON.parse(fs.readFileSync(file_path, 'utf8'));
	} catch (err) {
		console.log("...error: " + err);
	}
}

function putFile(remixId, id, body, extension, res) {
	if (id.includes('/') || id.includes('..') || remixId.includes('/') || remixId.includes('..')) {
		res.writeHead(400, { 'id': data.noteId });
		res.end("Invalid ID.");
	}
	var filename = 'data/' + remixId + '/';
	fs.mkdir(filename, (ignored) => {
		filename += id + extension;
		fs.writeFile(filename, body, 'binary', (err) => {
			if (err) {
				res.writeHead(500, { 'id': id });
				res.end("Cannot write file: " + err);
			} else {
				res.writeHead(200, { 'id': id });
				res.end();
			}
		});
	});
}

function getFile(remixId, id, extension, res, contentType) {
	if (id.includes('/') || id.includes('..') || remixId.includes('/') || remixId.includes('..')) {
		res.writeHead(400, { 'id': data.noteId });
		res.end("Invalid ID.");
	}
	var filename = 'data/' + remixId + '/' + id + extension;
	fs.readFile(filename, 'binary', (err, data) => {
		if (err) {
			res.writeHead(404, { 'id': id });
			res.end("Note does not exist or contains no data.");
		} else {
			res.writeHead(200, {
				'Content-Type': contentType,
				'Content-Length': data.length
			});
			res.end(new Buffer(data, 'binary'));
		}
	});
}


//******************************************************************************
//                      startup - load from JSON file
//******************************************************************************

readNotes();
console.log("notes: " + JSON.stringify(notes));
