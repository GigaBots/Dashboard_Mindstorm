Gigabots Dashboard
====================
A JavaScript web app for controlling LEGO Mindstorm Robots from a computer, phone, or tablet. Powered by the Big Bang platform and uses the Phaser JavaScript framework. This project is funded by the Mozilla Gigabit Community Fund.

Instructions for Use
====================
Use the web app with a Mindstorm robot running the leJOS firmware with the Big Bang Client for Java and custom Gigabot-specific code. The web app uses the Big Bang Client for JavaScript. The custom Gigabot firmware contains a basic API to allow users to program the Gigabot in realtime from a REPL/console in the web app.



Developers:

Phaser
====================
The main.js file utilizes the Phaser Framework (www.phaser.io). Phaser is intended for multiplay 2D online game creation. This was chosen primarily because it utilizes an fast and efficient refresh rate, rendering realtime data communication in Big Bang in a smooth manner. The entire dashboard panel is placed in a <canvas> element. For this reason, no individual  
A Phaser Framework relies on a succession of different states to create the dashboard and update the dashboard as needed. The states:
	*Preload - Loads the necessary assets to be used in the dashboard. Primarily, this is in the form of images, such as the background, and sprites.
	*Create - 