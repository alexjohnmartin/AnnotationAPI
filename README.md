# AnnotationAPI
Node.JS based web API to get/add/update/delete notes about a Remix model

## To run...
Install NodeJS from here: https://nodejs.org/en/download/

From the command line in the source code directory run "npm install" - this will install all packages required by the app.

From the command line in the source code directory run "node.exe app.js".

## Data storage
All notes are stored in a notes.json file in the root of the project. This source code includes a valid JSON file with a single test note in it.

## GET all notes
* HTTP GET
* http://localhost:3000/

## GET all notes for a Remix model
* HTTP GET
* http://localhost:3000/remixId/remix-id-goes-here

## POST (add) a new note
* HTTP POST
* http://localhost:3000/remixId/remix-id-goes-here
* Headers: Content-Type = application/json
* Body: "{"id":"b4023fb0-db12-11e7-b590-9dedcddba9be","remixId":"G009SVNBZ74W","text":"This is a Remix 3D note.","ModelPoint":{"X":1.0,"Y":2.0,"Z":3.0},"ModelNormal":{"X":1.0,"Y":2.0,"Z":3.0}}"

## PUT (update) an existing note
* HTTP PUT
* http://localhost:3000/remixId/remix-id-goes-here/id/note-id-goes-here
* Headers: Content-Type = application/json
* Body: "{"id":"b4023fb0-db12-11e7-b590-9dedcddba9be","remixId":"G009SVNBZ74W","text":"This is a Remix 3D note.","ModelPoint":{"X":1.0,"Y":2.0,"Z":3.0},"ModelNormal":{"X":1.0,"Y":2.0,"Z":3.0}}"

## DELETE a note
* HTTP DELETE
* http://localhost:3000/remixId/remix-id-goes-here/id/note-id-goes-here
