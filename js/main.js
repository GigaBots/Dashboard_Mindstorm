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
        var game = new Phaser.Game(1024, 768, Phaser.AUTO, null, {
            preload: preload,
            create: create,
            update: update,
            render: render,
            //paused: paused,
            //destroy: destroy
        });

        // Sorry for all the random variables right now- I think we'll start working with prototypes and/or arrays soon
        var buttonGo;
        var buttonStop;
        var lightOn;
        var lightOff;
        var background;
        var status;
        var box;
        var statusBar = {
             width : 10,
             height : 0
        }
        
        var dialNeedle;
        var degreeWheel;

        var x = 0;
        var y = 10;

        var a = 100;
        var b = 100;

        var labelMA = "Motor A";
        var style = {
                font: "11px Arial",
                fill: "#000000"
            }

        //keep track of when players join (open the browser window) and leave (close the browser window):
        //function onSubscribers(joinFunction(joined);, leaveFunction(left);){}
        //here, joined and left are both id's (each is a GUID), of a player joining and leaving, respectively
        
        channel.onSubscribers(function (joined) {
            /*console.log(joined +" joined");
            spawn(joined);*/
        },function(left){
            //console.log(left +" left");
            //kill(left);
        });


        function preload() {
            game.load.image('stall', 'images/lights/red_light.png');
            game.load.image('on', 'images/lights/green_light.png');
            game.load.image('stop', 'images/buttons/stop_button.png');
            game.load.image('go', 'images/buttons/go_button.png');
            game.load.image('needle','images/needle.png');
            game.load.image('wheel','images/degree_wheel.png')
        }

        function create() {
            game.stage.backgroundColor = '#9966FF';
            
            /* go? stop? let's go */
            buttonGo = game.add.button(100,100,'go', actionGoOnClick);
            buttonGo.scale.setTo(0.25,0.25);
            buttonStop = game.add.button(200,100,'stop', actionStopOnClick);
            buttonStop.scale.setTo(0.375,0.375);
            
            /* and box around status bar */
            box = game.add.graphics(0,0);
            box.lineStyle(2, 0x0000FF, 1);
            box.beginFill(0xFFFFFF,1);
            box.drawRect(50, 200, 10, 100);

            /* status bar experimentation */
            status = game.add.graphics(0, 0);  //init rect
            //status.lineStyle(2, 0x0000FF, 1); // width, color (0x0000FF), alpha (0 -> 1) // required settings
            status.beginFill(0xFFFF0B, 1); // color (0xFFFF0B), alpha (0 -> 1) // required settings
            
            statusBar = game.add.graphics(0, 0);  //init rect
            statusBar.beginFill(0xFFFF0B, 1); // color (0xFFFF0B), alpha (0 -> 1) // required settings
            //statusBar.drawRect(50,400,width, height);

            /* on/stall light experimentation */

            labelMA = game.add.text(250, 60, labelMA, style);

            lightOff = game.add.sprite(250,20,'stall');
            lightOff.scale.setTo(0.25, 0.25);

            /* dial experimentation */
            degreeWheel = game.add.sprite(400,0,'wheel');
            degreeWheel.scale.setTo(0.5,0.5);

            dialNeedle = game.add.sprite(525,125,'needle');
            dialNeedle.anchor.setTo(0.95,0.5);
            //dialNeedle.scale.setTo(0.5,0.5);
        }  
        
        function actionGoOnClick () {
            console.log("go");
            if(lightOff) {
                lightOff.destroy(); //delete the lightOff sprite (if it's there)
                lightOn = game.add.sprite(250,20,'on');
                lightOn.scale.setTo(0.25, 0.25);
            }
        }
        function actionStopOnClick () {
            console.log("stop");
            if(lightOn) {
                lightOn.destroy(); //delete the lightOn sprite (if it's there)
                lightOff = game.add.sprite(250,20,'stall');
                lightOff.scale.setTo(0.25, 0.25);
            }
        }

        function update() {

            if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                dialNeedle.angle += 5;
            }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)){
                dialNeedle.angle -= 5;
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){

            }else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){

            }
            else {
                /* add a little animating so that the needle slowly returns to its previous position */
                if (dialNeedle.angle >= 0) {
                    for (i=dialNeedle.angle; i>0; i--) {
                        dialNeedle.angle -= 0.15;
                    }
                } else {
                    for (i=dialNeedle.angle; i<0; i++) {
                        dialNeedle.angle += 0.15;
                    }
                }
            }
        }

        function render() {
            //console.log("render");
        }

        function paused() {
            console.log("paused");
        }

        function destroy() {
            console.log("destroy");
        }

    }
});

