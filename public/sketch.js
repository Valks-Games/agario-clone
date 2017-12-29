const DEFAULT_SIZE = 8;
const ZOOM_ACC = 0.1;

const NAME_SIZE = 10;

var zoom = 1;
var name;

var socket;

var blob;
var players = [];
var pellets = [];

var playerCreated = false;
var playing = false;

var worldWidth = 500;
var worldHeight = 500;

function setup(){
	createCanvas(windowWidth, windowHeight);
	socket = io.connect('http://206.45.199.56:2040');
	
	initPellets(100);
	
	noLag();
	
	
	
	socket.on('heartbeat',
		function(data){
			pellets = data;
		}
	);
}

function initPlayer(){
	if (playerCreated){
		playerCreated = false;
		playing = true;
		
		blob = new Blob(random(width), random(height), random(8, 24), name);
		
		var data = {
			x: blob.pos.x,
			y: blob.pos.y,
			r: blob.r,
			name: blob.name
		};
		socket.emit('player_start', data);
	
		socket.on('player_heartbeat',
			function(data){
				players = data;
			}
		);
	}
}

function draw(){
	background(0);
	
	initPlayer();
	if (playing){
		textSize(NAME_SIZE);
		text("X: " + round(blob.pos.x) + ", Y: " + round(blob.pos.y), mouseX, mouseY);
		handleOrigin();
		handlePellets();
	}
	
	drawPlayers();
	
	
	var data = [];
	for (var i = 0; i < pellets.length; i++){
		var pellet = pellets[i];
		data.push(pellet);
	}
	socket.emit('pellets_update', data);
	
	if (blob != undefined){
		//blob.display();
		blob.update();
		blob.constrain();
		var data = {
			x: blob.pos.x,
			y: blob.pos.y,
			r: blob.r,
			name: blob.name
		};
		socket.emit('player_update', data);
	}
}

function noLag(){
	noStroke();
	noSmooth();
}

function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
}

function drawPlayers(){
	for (var i = 0; i < players.length; i++){
		fill(100, 100, 255);
		ellipse(players[i].x, players[i].y, players[i].r * 2, players[i].r * 2);
		textAlign(CENTER);
		textSize(10);
		text(players[i].name, players[i].x, players[i].y + players[i].r * 2);
	}
}

function initPellets(amount){
	for (var i = 0; i < amount; i++){
		var x = random(-worldWidth/2, worldWidth/2);
		var y = random(-worldHeight/2, worldHeight/2);
		var r = random(1, 2);
		pellets[i] = new Pellet(x, y, r);
	}
	
	for (var i = 0; i < pellets.length; i++){
		var data = {
			x: pellets[i].x,
			y: pellets[i].y,
			r: pellets[i].r
		}
		socket.emit('pellets_start', data);
	}
}

/*
 * Draw and check to see if pellets were eaten.
 */
function handlePellets(){
	for (var i = 0; i < pellets.length; i++){
		fill(120, 255, 120);
		ellipse(pellets[i].x, pellets[i].y, pellets[i].r * 2, pellets[i].r * 2);
		if (blob.eats(pellets[i].x, pellets[i].y, pellets[i].r)){
			pellets.splice(i, 1);
		}
	}
}

/*
 * Centers the view on the player and handles zoom
 * with respect to its diameter.
 */
function handleOrigin(){
	var newZoom = DEFAULT_SIZE / blob.r*5; //Precalculate the new zoom.
	zoom = lerp(zoom, newZoom, ZOOM_ACC); //Slowly 'lerp' to the new zoom from the old zoom.
	
	translate(width/2, height/2); //Center the view.
	scale(zoom); //Scale the view.
	translate(-blob.pos.x, -blob.pos.y); //Translate view with respect to player movement.
}