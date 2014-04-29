require.config({
    baseUrl: 'js',
        // set baseURL to 'js' when bbclient.min.js is in the folder entitled 'js' along with main.js, phaser.min.js, and require.js
    paths: {
        "BrowserBigBangClient": "bbclient.min",
        "BigBangClient": "bbclient.min"
    }
});

require(['BigBangClient', 'BrowserBigBangClient'], function (bb, bbw) {

    var client = new bbw.BrowserBigBangClient();

    client.login("tbp.app.bigbang.io", 8888, "test", "test", "98a9b82f-e847-4965-b1b2-e00c5135796d", function (result) {
        if (result.authenticated) {
            client.connect(result.hosts['websocket'], result.clientKey, function (connectResult) {
                if (connectResult.success) {
                    client.subscribe("channel1", function (err, c) {
                        if (!err) {
                            beginGame(client, c);
                        }
                        else {
                            console.log("Shit, what happened? " + err);
                        }
                    });
                } else {
                    console.log("EPIC FAIL.");
                }
            });
        } else {
            console.log("Login failed. " + result.message);
        }
    });

    function beginGame(client, channel) {
        var game = new Phaser.Game(500, 500, Phaser.AUTO, null, {
            preload: preload,
            create: create,
            update: update
        });

        //keep track of when players join (open the browser window) and leave (close the browser window):
        //function onSubscribers(joinFunction(joined);, leaveFunction(left);){}
        //here, joined and left are both id's (each is a GUID), of a player joining and leaving, respectively
        
        channel.onSubscribers(function (joined) {
            /*console.log(joined +" joined");
            spawn(joined);*/
        },function(left){
            //console.log(left +" left");
            kill(left);
        });

        var myPlayer, //my player
            label,
            style = {
                font: "11px Arial",
                fill: "#ffffff"
            } //styling players labels a bit

        //var playerName;

        var allPlayers = new Array();

        function preload() {
            game.load.spritesheet('char', 'images/char01.png', 32, 48) // define where avatar can be found. Because avatars are in a spritesheet with completely identical rectangular dimensions, just need to define 32 x 48 box to equal 1 avatar.
        }

        function create() {
            game.stage.backgroundColor = '#9966FF';
            var playerName = prompt("What is your name?");
                if (playerName == "") {
                    playerName = prompt("Please enter a name.");
                }
            var me = {
                id: client.clientId(),
                x: Math.floor(Math.random()*500),
                y: Math.floor(Math.random()*500),
                playerName: playerName
                // x: Math.floor(Math.random()*window.innerWidth),
                // y: Math.floor(Math.random()*window.innerHeight),
            };
            spawn(me); //add the sprite for the player in my window, which has the id of client.clientId(). Note, it won't have the 'joined' id
            //console.log("me.playerName = " + me.playerName);
            channel.handler = function (message) {
                var m = message.payload.getBytesAsJSON();
                //console.log("m.id = " + m.id + " and m.playerName = " + m.playerName);
                //message.payload.getBytesAsJSON appears as, "Object {id: "...long GUID...", x: #, y: #}"
                //so you can call m.id, m.x, and m.y
                //console.log("Message: m.id = " + m.id + ", m.x = " + m.x + ", and m.y = " + m.y); //display messages being sent from each channel
                uPosition(m);
            }
        }  

        function update() {
            //game.physics.collide(myPlayer, player); //prevent my player from overlapping other players, but allow to push each other?

            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                myPlayer.animations.play('left');
                myPlayer.x -= 3;
                //move my player's name label around with my player in my own window:
                myPlayer.label.x = myPlayer.x;
                myPlayer.label.y = myPlayer.y - 10; //label above player
                sendPosition(myPlayer.x, myPlayer.y, myPlayer.playerName); //sendPosition is a function defined below.
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                myPlayer.animations.play('right');
                myPlayer.x += 3;
                myPlayer.label.x = myPlayer.x;
                myPlayer.label.y = myPlayer.y - 10; //label above player
                sendPosition(myPlayer.x, myPlayer.y, myPlayer.playerName);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                myPlayer.animations.play('up');
                myPlayer.y -= 3;
                myPlayer.label.x = myPlayer.x;
                myPlayer.label.y = myPlayer.y - 10; //label above player
                sendPosition(myPlayer.x, myPlayer.y, myPlayer.playerName);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                myPlayer.animations.play('down');
                myPlayer.y += 3;
                myPlayer.label.x = myPlayer.x;
                myPlayer.label.y = myPlayer.y - 10; //label above player
                sendPosition(myPlayer.x, myPlayer.y, myPlayer.playerName);
            } 

        }

        function sendPosition(x, y, posName) {
            var pos = {}; //create pos object to hold my players's id and position's x and y coordinate
            pos.id = client.clientId();
            pos.x = x;
            pos.y = y;
            pos.playerName = posName;

            channel.publish(pos); // pos will become the (message) parameter in channel.handler once it is received by another computer.
            //console.log(pos);
        }
        


        function uPosition(mPosition) {

        }
    }
});

