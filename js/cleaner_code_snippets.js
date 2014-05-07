// to start cleaning up code some:

var fButtonPos = {
	x = 30; // x-coordinate of upper left forward button
	y = 220; // y-coordinate of upper left forward button
}
var forwardButton = {
	A : game.add.button(fButtonPos.x, fButtonPos.y, 'forwardButton'),
	B : game.add.button(fButtonPos.x+410, fButtonPos.y, 'forwardButton'),
	C : game.add.button(fButtonPos.x, fButtonPos.y+210, 'forwardButton'),
	D : game.add.button(fButtonPos.x+410, fButtonPos.y+210, 'forwardButton')
}

var rButtonPos = {
	x = 30; // x-coordinate of upper left reverse button
	y = 278; // y-coordinate of upper left reverse button
}
var reverseButton = {
	A : game.add.button(fButtonPos.x, fButtonPos.y, 'reverseButton'),
	B : game.add.button(fButtonPos.x+410, fButtonPos.y, 'reverseButton'),
	C : game.add.button(fButtonPos.x, fButtonPos.y+210, 'reverseButton'),
	D : game.add.button(fButtonPos.x+410, fButtonPos.y+210, 'reverseButton')
}


//for example, we can refer to forwardButton.A
//using position all relative to a single button will make it easier to rearrange the interface

