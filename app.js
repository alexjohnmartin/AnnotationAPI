var express = require('express');
var fs = require('fs');
var guid = require('node-uuid');

// server.js (Express 4.0)
var express        = require('express');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var app            = express();

app.use(express.static(__dirname + '/public'));     	// set the static files location /public/img will be /img for users
app.use(morgan('dev'));                     			// log every request to the console
app.use(bodyParser.urlencoded({ extended: false }))    	// parse application/x-www-form-urlencoded
app.use(bodyParser.json())    							// parse application/json
app.use(methodOverride());                  			// simulate DELETE and PUT

app.listen(3000);
console.log('Magic happens on port 3000');          	// shoutout to the user

var notes = [];
var file_path = "notes.json";

//******************************************************************************
//                          READ API
//******************************************************************************

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
		if (notes[i].id == data.modelId) {
			found = true;
		}
	}

	if (!found) {
		notes.push(data);
		saveNotes();
	    res.writeHead(200, {'id': data.modelId});
		res.end(JSON.stringify(data));
	} else {
		res.writeHead(405, {'id': data.modelId});
		res.end("Note already exists, cannot overwrite. Please use PUT to update an existing note.");
	}
});

app.put('/remixId/:remixId/id/:id', function(req, res) {
	var found = false;
	var data = parseUpdateRequestIntoObject(req, req.params.remixId, req.params.id); 
	for (var i = 0; i < notes.length; i++) {
		if (notes[i].id == req.params.id) {
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

app.delete('/remixId/:remixId/id/:id', function(req, res) {
	var found = false;
	var updatedNotes = []; 
	for (var i = 0; i < notes.length; i++) {
		if (notes[i].id != req.params.id) {
			updatedNotes.push(notes[i]);
		} else {			
			found = true;
		}
	}

	if (found) 	{
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
	// data.id = id;
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
	var data = JSON.stringify(notes);
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

//******************************************************************************
//                      startup - load from JSON file
//******************************************************************************

readNotes();
console.log("notes: " + JSON.stringify(notes));