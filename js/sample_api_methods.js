bot.g1.rotateTo(200);

gangRotate(1,200);

function gangRotate (gangId, position) {
	bot.beep();
	var motorPosition;
	var gangedMotors = {}
	for( var m in motors ) {
		if( gangs[ gangId ][m] === true ) {
			gangedMotors[m] = {}
			var motorData = channel.getKeyspace(botId).get(m);
			gangedMotors[m].oldMotorPosition = motorData.position;
			gangedMotors[m].newMotorPosition = motorData.position + position;		
		}
	}
	console.dir(gangedMotors);
	for( var i=1; i<=position; i++ ) {
		for( var n in gangedMotors ) {
			var command = bot[n]rotateTo(gangedMotors[m].newMotorPosition-position+i);
			channel.publish({ "type": "js", "js": command, "recipient": botId });
		}
	}
}



channel.publish({
	"type":"js",
	"js": "function beeperTest() {
		bot.beep();
		bot.a.rotateTo(100);
		bot.beep();
	}",
	"recipient": botId
});


function beeperTest() {
		bot.beep();
		bot.beep();
}

beeperTest(); //or beepTest()

function moveMotors(motor1, motor2, position) {
	bot.beep();
	bot[motor1].rotateTo(position);
	bot[motor2].rotateTo(position);
}



function moveUntil(motor) {
	bot.beep();
	bot[motor].rtz();
	var position = 0;
	for (var i = 0; i<=1000; i++ ) {
		var touchData = channel.getKeyspace(botId).get('S3');
		if( touchData.values[0] === 0 ) {
			position++;
			bot[motor].rotateTo(position);
		}
	}
}

function moveUntil(motor) {
	//var motorData = channel.getKeyspace(botId).get('b');
	bot[b].rtz();
	var position = 0;
	//var position = motorData.position;
	//var data = channel.getKeyspace(botId).get('S3');
	for (var i = 0; i<=1000; i++ ) {
		//var touchData = channel.getKeyspace(botId).get('S3');
		//if( touchData.values[0] === 0 ) {
			position++;
			bot[motor].rotateTo(position);
		//}
	}
	bot.beep();
}

function motorToZero(motor) {
	bot[motor].rtz();
	bot.beep();
}

function beepIfTouched() {
	bot.beep();
	var touchData = channel.getKeyspace(botId).get('S3');
	if( touchData.values[0] === 1 ) {
		bot.sing();
	}
	else {
		bot.beep();
	}
}

function driveWith(motor1,motor2,position) {
	bot[motor1].rtz();
	bot[motor2].rtz();
	bot.beep();
	for( var i=1; i<=position; i+=10 ) {
		bot[motor1].rotateTo(i);
		bot[motor2].rotateTo(i);
	}
}

function spinWith(motor1,motor2,position) {
	for( var i=1; i<=position; i+=10 ) {
		bot[motor1].rotateTo(i);
		bot[motor2].rotateTo(-i);
	}
}


function publish(botCode) {
    channel.publish({ "type": "js", "js": botCode, "recipient": botId });
}

for(var i=0; i<=700; i+=20) {
	var touchData = channel.getKeyspace(botId).get('S3');
	if ( touchData.values[0] === 0 ) {
		var botCode = "bot.d.rotateTo(" + i.toString() + ")"
		channel.publish({ "type": "js", "js": botCode, "recipient": botId });
	}
	else {
		channel.publish({ "type": "js", "js": "bot.beep()", "recipient": botId });
	}
}

for(var i=0; i<=700; i+=20) {
	if ( touchStatus === false ) {
		var botCode = "bot.d.rotateTo(" + i.toString() + ")"
		channel.publish({ "type": "js", "js": botCode, "recipient": botId });
	}
	else {
		channel.publish({ "type": "js", "js": "bot.beep()", "recipient": botId });
	}
}


if (bot.sensors.pressedAction.result === true ) {
	bot.beep();
	bot.beep();
}

if (bot.pressedAction.result(Boolean.valueOf(sample[0] == 1.0F))) {
bot.beep();
}