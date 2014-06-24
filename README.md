# Gigabots Dashboard

A JavaScript web app for controlling LEGO Mindstorm Robots from a computer, phone, or tablet. Powered by the Big Bang platform and uses the Phaser JavaScript framework. This project is funded by the Mozilla Gigabit Community Fund.

By Jonathan Wagner, John DiBaggio, and Cole Bittel
Version 2.0.1 - Released June 9th, 2014

* View the [Official Website] (https://thegigabots.com)
* Follow on [Twitter] (https://twitter.com/TheGigabots)
* Join developers on [Github] (#)

![div](http://thegigabots.com/wp-content/uploads/2014/04/hello_gigabot.jpg)


#Instructions for Use

Use the web app with a Mindstorm robot running the leJOS firmware with the Big Bang Client for Java and custom Gigabot-specific code. The web app uses the Big Bang Client for JavaScript. The custom Gigabot firmware contains a basic API to allow users to program the Gigabot in realtime from a REPL/console in the web app.



# Phaser
The main.js file utilizes the [Phaser Framework] (www.phaser.io). Phaser is intended for multiplay 2D online game creation. This was chosen primarily because it utilizes an fast and efficient refresh rate, rendering realtime data communication in Big Bang in a smooth manner. The entire dashboard panel is placed in a <canvas> element. For this reason, no individual component within the canvas can be altered through CSS or jQuery, beacuse each relies on identification of classes or id's. Thus, all stylistic effects for buttons, fonts, colors, are controlled within the main.js file preceding the state definitions.

A Phaser Framework relies on a succession of different states to create the dashboard and update the dashboard as needed. The states used in this program:
* Preload - Loads the necessary assets to be used in the dashboard. Primarily, this is in the form of images, such as the background, and sprites.
* Create - Called immediately following the preload state. Instantiates the initial dashboard panel using preloaded assets. Visually renders front-end. Defines necessary functionality and interactivity. Functions within only called when change in variable state occurs (ie. button is clicked. Different from update function, which calls at 60Hz regardless of if there's a change.)
* Update - Called immediately following the create state. Loops through around 60 times a second. Handles channels and bot keyspaces s.t. realtime information passed through channels to keyspaces and updated. Runs at 60Hertz regardless of change in any variable/states/values.