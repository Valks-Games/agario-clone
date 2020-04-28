// Using express: http://expressjs.com/
var express = require('express')
// Create the app
var app = express()

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 2040, listen)

// This call back just tells us that the server has started
function listen () {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://' + host + ':' + port)
}

app.use(express.static('public'))

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server)

var blobs = []
var pellets = []

function Blob (id, x, y, r, name) {
  this.id = id
  this.x = x
  this.y = y
  this.r = r
  this.name = name
}

function Pellet (x, y, r) {
  this.x = x
  this.y = y
  this.r = r
}

setInterval(heartbeat, 33)

function heartbeat () {
  io.sockets.emit('heartbeat', pellets)
  io.sockets.emit('player_heartbeat', blobs)
}

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
    console.log('Client ' + socket.id + ' connected')

    socket.on('pellets_start',
      function (data) {
        var pellet = new Pellet(data.x, data.y, data.r)
        pellets.push(pellet)
      }
    )

    socket.on('pellets_update',
      function (data) {
        for (var i = 0; i < data.length; i++) {
          // console.log(data[i].x);
          pellets[i].x = data[i].x
          pellets[i].y = data[i].y
          pellets[i].r = data[i].r
        }
      }
    )

    socket.on('player_start',
      function (data) {
        console.log(data.name + ' has joined')
        var blob = new Blob(socket.id, data.x, data.y, data.r, data.name)
        blobs.push(blob)
      }
    )

    socket.on('player_update',
      function (data) {
        // console.log(socket.id + " " + data.x + " " + data.y + " " + data.r);
        var blob
        for (var i = 0; i < blobs.length; i++) {
          if (socket.id == blobs[i].id) {
            blob = blobs[i]
          }
        }
        blob.x = data.x
        blob.y = data.y
        blob.r = data.r
        blob.name = data.name
      }
    )

    socket.on('disconnect', function () {
      var blob
		  for (var i = 0; i < blobs.length; i++) {
			  if (socket.id == blobs[i].id) {
				  blobs.splice(i, 1)
			  }
		  }
      console.log('Client has disconnected')
    })
  }
)
