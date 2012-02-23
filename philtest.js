
$(function () {
	"use strict";
	var x, y, vx = 0, vy = 0, theta = 0, thrust = 1, omega = 0.1, canvas, context, framerate = 60, measured_framerate = 0;
	var frametimes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var shapeFlyingV = {
		'points' : [[0, -20], [10, 10],  [0, 4], [-10, 10]],
		'fireport': [0,-20]
	};
	
	var shapeStartrek = {
		'points': [[0, -20], [10, -12],  [10, -4], [0,4], [0, 12], [10, 16], [10, 24], [10, 16], [0, 12], [-10, 16], [-10, 24], [-10, 16], [0, 12], [0, 4], [-10, -4], [-10, -12]],
		'fireport': [0, -20]
		};
		
	var i = 0;
	var sprites = [];
	var newShot = 0;
	
	var myShip = {
		'thrusting' : false,
		'rotation' : 'none', // 'left', 'right', or 'none'
		'type'   : 'ship',
		'shape'  : shapeFlyingV,
		'thrust' : 0.1 ,
		'omega'  : 0.1 ,
		'theta'  : 0.0 ,
		'x'      : 0 ,
		'y'      : 0 ,
		'vx'     : 0.0,
		'vy'     : 0.0
	};
	
	var oneShot = {
		'type'	 : 'shot',
		'radius' : 2,
		'speed'	 : 10,
		'x'	 : 100,
		'y'	 : 100,
		'vx'	 : 50 * Math.cos(Math.PI / 4), // calculated at creation as convenience
		'vy'	 : 50 * Math.sin(Math.PI / 4), // also calculated at creation
		'rangeleft' : 1000
	};
	
	var now = new Date();
	
	for (i = 0; i < 10; i++) {
		frametimes[i] = now.getTime();
	}

	
	canvas = $("#canvas")[0];
	context = canvas.getContext("2d");
	context.font = "8pt sans-serif";
	context.strokeStyle = "#fff";
	context.fillStyle = "#fff";

	myShip.x = canvas.width / 2;
	myShip.y = canvas.height / 2;

	if (typeof Object.beget !== 'function') {
	     Object.beget = function (o) {
		 var F = function () {};
		 F.prototype = o;
		 return new F();
	     };
	}
	
	function drawFrame() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		for (i = 0; i < sprites.length; i++) {
			drawSprite(sprites[i]);
		}
		
	}
	
	function drawSprite(sprite) {
		if (sprite.type === 'shot') {
			drawShot(sprite);
		}
		if (sprite.type === 'ship') {
			drawShip(sprite);
		}
		
	}
	
	function moveSprites() {
		var i;
		for (i = 0; i < sprites.length; i++) {

			//Check to see that shots do not travel too far.
			if (sprites[i].type === "shot"){
				if (sprites[i].rangeleft <= 0){
					sprites.splice(i,1);
					break;
				}
				else{
					sprites[i].rangeleft -= sprites[i].speed;
				}
			}
			
			sprites[i].x += sprites[i].vx;
			sprites[i].y += sprites[i].vy;

			if (sprites[i].y < 0) {
				sprites[i].y += canvas.height;
			}
			if (sprites[i].y > canvas.height) {
				sprites[i].y -= canvas.height;
			}
			if (sprites[i].x < 0) {
				sprites[i].x += canvas.width;
			}
			if (sprites[i].x > canvas.width) {
				sprites[i].x -= canvas.width;
			}
			
		}
	}
	
	function drawShot(shot) {
		context.beginPath();
		context.arc(shot.x, shot.y, shot.radius , 0, 2 * Math.PI, false);
		context.fillStyle = "#fff";
		context.fill();
	}
	
	function drawShip(ship) {
		var i;
		// clear screen, translate reference frame and draw ship, restore frame
		context.translate(ship.x,ship.y);
		context.rotate(ship.theta);
		context.beginPath();
		context.moveTo(ship.shape.points[0][0], ship.shape.points[0][1]);
		for (i = 1; i < ship.shape.points.length; i++) {
			context.lineTo(ship.shape.points[i][0], ship.shape.points[i][1]);
		}
		context.closePath();
		context.stroke();
		context.setTransform(1, 0, 0, 1, 0, 0);

	}

	function fireShot(firingShip){
		newShot = Object.beget(oneShot);
		newShot.x = firingShip.x + firingShip.shape.fireport[0] * Math.cos(firingShip.theta) - firingShip.shape.fireport[1] * Math.sin(firingShip.theta);
		newShot.y = firingShip.y + firingShip.shape.fireport[1] * Math.cos(firingShip.theta) + firingShip.shape.fireport[0] * Math.sin(firingShip.theta);
		newShot.vx = firingShip.vx + newShot.speed * Math.sin(firingShip.theta);
		newShot.vy = firingShip.vy - newShot.speed * Math.cos(firingShip.theta);
		sprites.push(newShot);
	}
	
	function applyThrust(){
			myShip.vy -= myShip.thrust * Math.cos(myShip.theta);
			myShip.vx += myShip.thrust * Math.sin(myShip.theta);
	}
	
	function doRotation(){
		
		if (myShip.rotation === 'left'){
			myShip.theta -= myShip.omega;
			if (myShip.theta < 0) {
				myShip.theta += 2 * Math.PI;
			}
		}
		if (myShip.rotation === 'right'){
			myShip.theta += myShip.omega;
			if (myShip.theta > 2 * Math.PI) {
				myShip.theta -= 2 * Math.PI;
			}
		}
	}
	
	// add ship
	sprites.push(myShip);

	setInterval(function () {
		
		if (myShip.thrusting){
			applyThrust();
		}
		
		doRotation();		
		moveSprites();
		drawFrame();
		
		now = new Date();
		for (i = 0; i < 9; i++) {
			frametimes[i] = frametimes[i + 1];
		}
		frametimes[9] = now.getTime();
		measured_framerate = 10000 / (frametimes[9] - frametimes[0]);
		
		$("#framecounter").text("FPS: " + measured_framerate);		
		
	}, 1000 / framerate);
	
	window.addEventListener('keyup', function(event){
		
		switch (event.which){
		case 38: //up arrow
			myShip.thrusting = false;
			break;
		case 37: //left arrow
			myShip.rotation = 'none';
			break;
		case 39: //right arrow
			myShip.rotation = 'none';
			break;
		}
	}, true);
	

	window.addEventListener('keydown', function (event) {
		
		switch (event.which) {
		case 38: // up arrow
			myShip.thrusting = true;
			break;
		case 40: // down arrow
			
			break;
		case 37: // left arrow
			myShip.rotation = 'left';
			break;
		case 39: // right arrow
			myShip.rotation = 'right';
			break;
		case 72: // h
			myShip.x = Math.floor(Math.random() * canvas.width) + 1;
			myShip.y = Math.floor(Math.random() * canvas.height) + 1;
			myShip.theta = Math.random() * 2 * Math.PI;
			break;
		case 70: // f
			fireShot(myShip);
			break;
		}
	}, true);
});
