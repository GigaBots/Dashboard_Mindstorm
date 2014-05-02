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
        var game = new Phaser.Game(960, 1068, Phaser.AUTO, null, {
            preload: preload,
            create: create,
            update: update,
            render: render,
            //paused: paused,
            //destroy: destroy
        });

        var dashboardName = "GigaBots Dashboard";
        var titleStyle = { font: "32px Lucida Console, Arial",fill: "#282828"}        

        var backgroundBox;
        var frameMotorPorts, labelMotorPorts = "Motors";
        var frameSensorPorts, labelSensorPorts = "Sensors";
        
        var labelMotors = ["A","B","C","D"];
        var labelSensors = ["1","2","3","4"];

        var statusMotorA, statusMotorB, statusMotorC, statusMotorD;
        var statusSensor1,statusSensor2, statusSensor3, statusSensor4;

        var motorA = {
            status : 4, //0 = unplugged, 1 = plugged-in, 2 = stalled
            speed : '', // rpm
            position : '' //degrees
        }

        var buttonGo;
        var buttonStop;
        var lightOn;
        var lightOff;
        var background;
        var status;
        var box;
        var statusBar = {
             //width : 10,
             //height : 0
        }
        var power = 0;
        var width = 8;
        var height = 0;

        var startButton;
        
        var dialNeedle;
        var degreeWheel;

        var x = 0;
        var y = 10;        

        var labelStyle = { font: "12px Arial", fill: "#000000" }

        var cursorx;
        var cursory;
        var cursorLabel;

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
            game.load.spritesheet('startButton','assets/buttons/gigabot_dashboard_button_start_spritesheet.png')
            game.load.image('stall','assets/lights/red_light.png');
            game.load.image('on','assets/lights/green_light.png');
            game.load.image('needle','assets/needle.png');
            game.load.image('wheel','assets/degree_wheel.png')
        }

        function create() {
            //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
            this.game.stage.disableVisibilityChange = false;    

            /* Background */
            game.stage.backgroundColor = '#C0C0C0';
            backgroundBox = game.add.graphics(0,0);
            backgroundBox.lineStyle(1,0x282828,1);
            backgroundBox.drawRect(0,0,960,1064);

            /* Title */
            dashboardName = game.add.text(300, 10, dashboardName, titleStyle);
            
            /* Frames */
            frameMotorPorts = game.add.graphics(0,0);
            frameMotorPorts.lineStyle(1, 0x282828, 1);
            //frameMotorPorts.beginFill(0xFFFFFF,1);
            frameMotorPorts.drawRect(20, 60, 130, 60);
            labelMotorPorts = game.add.text(60,64, labelMotorPorts, labelStyle); //label at top of box indicating status of motor ports
            labelA = game.add.text(32, 100, labelMotors[0], labelStyle);
            labelB = game.add.text(62, 100, labelMotors[1], labelStyle);
            labelC = game.add.text(92, 100, labelMotors[2], labelStyle);
            labelD = game.add.text(122, 100, labelMotors[3], labelStyle);

            /*statusMotorA = game.add.graphics(0,0);
            statusMotorA.beginFill(0x00FF00, 1);
            statusMotorA.drawCircle(36, 88, 5);*/

            statusMotorB = game.add.graphics(0,0);
            statusMotorB.beginFill(0x00FF00, 1);
            statusMotorB.drawCircle(66, 88, 5);

            statusMotorB = game.add.graphics(0,0);
            statusMotorB.beginFill(0x00FF00, 1);
            statusMotorB.drawCircle(96, 88, 5);

            statusMotorB = game.add.graphics(0,0);
            statusMotorB.beginFill(0x101010, 1);
            statusMotorB.drawCircle(126, 88, 5);


            //buttonGo = game.add.button(100,100,'go', actionGoOnClick);
            //buttonGo.scale.setTo(0.25,0.25);
            //buttonStop = game.add.button(200,100,'stop', actionStopOnClick);
            //buttonStop.scale.setTo(0.375,0.375);
            //startButton = game.add.button(100, 100, 'startButton', actionStartOnClick, this, 2, 1, 0)

            /* status bar experimentation */
            // box around status bar
            box = game.add.graphics(0,0);
            box.lineStyle(1, 0x000000, 1);
            box.beginFill(0xFFFFFF,1);
            box.drawRect(50, 200, 10, 100);
            var tickmark = game.add.graphics(0,0);
            tickmark.beginFill(0x000000,1);
            tickmark.drawRect(47, 250, 16, 1);
            status = game.add.graphics(0, 0);  //init rect
            //status.lineStyle(2, 0x0000FF, 1); // width, color (0x0000FF), alpha (0 -> 1) // required settings
            status.beginFill(0xFFFF0B, 1); // color (0xFFFF0B), alpha (0 -> 1) // required settings
            statusBar = game.add.graphics(0, 0);  //init rect
            statusBar.beginFill(0xFF0000, 1); // color (0xFFFF0B), alpha (0 -> 1) // required settings
            //statusBar.drawRect(50,250, width, height);            

            lightOff = game.add.button(500,200,'stall', actionDragOnClick);
            lightOff.scale.setTo(0.25, 0.25);

            /* dial experimentation */
            //degreeWheel = game.add.sprite(400,0,'wheel');
            //degreeWheel.scale.setTo(0.5,0.5);
            //degreeWheel.anchor.setTo(1,0);
            //degreeWheel.angle = -90; // let's rotate our dial face 90 degrees counterclockwise

            dialNeedle = game.add.sprite(525,125,'needle');
            dialNeedle.anchor.setTo(0.944,0.5); // 0.944 ( = 83/88) because the point about which the needle should rotate is around at 83 pixels along the 88-pixel length of the needle image
            //dialNeedle.scale.setTo(0.5,0.5);


            //var buttonOn = new Button(this.game, 100, 100);
            //var button = new Button(game, 2, 146, 'button-texture', doSomething, this, 0, 0, 0);


        }  

        function actionDragOnClick() {
            console.log("click");
            //lightOff.x = game.input.x;
            lightOff.y = game.input.y;
        }
        
        /*function actionStartOnClick () {
            console.log("start");
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
        }*/

        function update() {
            /* motor status */
            var msg = { Astatus : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
                msg.Astatus = 0;
            }
            if (game.input.keyboard.isDown(Phaser.Keyboard.P)) {
                msg.Astatus = 1;
            }
            if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
                msg.Astatus = 2;
            }

            statusMotorA = game.add.graphics(0,0);
            if (motorA.status == msg.Astatus) {
            } else {
                motorA.status = msg.Astatus;
                if (motorA.status == 1) {
                    statusMotorA.beginFill(0x00FF00, 1); //green
                } else if (motorA.status == 2) {
                    statusMotorA.beginFill(0xF00000, 1); //red
                } else if (motorA.status == 0) { //default
                    statusMotorA.beginFill(0x383838, 1); //dark grey
                }
                statusMotorA.drawCircle(36, 88, 5);
            }
            



            var cursorLabel;
            cursorx = game.input.x;
            cursory = game.input.y;

            //lightOff.x = game.input.x;
            //lightOff.y = game.input.y;
            cursorLabel = cursorx + ", " + cursory;
            cursorLabel = game.add.text(10,10, cursorLabel, labelStyle);

            /* Press up to increase degrees, and down to decrease degrees */
            if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                dialNeedle.angle += 5;
            } 
            else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)){
                dialNeedle.angle -= 5;
            } 
            else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){

            } 
            else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){

            }
            else {
                /* add a little animating so that the needle slowly returns to its previous position */
                // rotation goes from 0' to 180' to -180' to 0' */
                if (dialNeedle.angle != 0) {
                    var r;
                    if (dialNeedle.angle > 0) {
                        r = dialNeedle.angle;
                    } else if (dialNeedle.angle < -0.1) { // the -0.1 is so the needle doesn't keep spinning, since it won't get exactly to 0 with our increment of 0.1 (it could go slightly past)
                        r = 360 + dialNeedle.angle;
                    }
                }
                if (r > 0) {
                    for (var i = r; i >= 0; i--) {
                        dialNeedle.angle -= 0.1;
                    }
                }


/*                    if (dialNeedle.angle > 0) {
                        for (var i = dialNeedle.angle; i > 0; i--) {
                            dialNeedle.angle -= 0.1; // -0.15 seems to be a good enough "rate"
                        }
                    } else if (dialNeedle.angle < 0) {
                        for (var i = (-1)*dialNeedle.angle; i <= 180; i++) {
                            dialNeedle.angle -= 0.1;
                        }
                    }*/
            }

            /* Press W to increase power, and S to decrease power */
            //NOTE: this works, but we should prob figure out a different way to do it, as it just deletes the statusBar rectangle and adds a new one each time...
            if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                if (power >= -48) {
                    power -= 2;
                    statusBar.destroy();
                    statusBar = game.add.graphics(0, 0);  //init rect
                    statusBar.beginFill(0xFF0000, 1);
                    statusBar.drawRect(51,250, width, power);
                }
            }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)){
                if (power <= +48) {
                    power += 2;
                    statusBar.destroy();
                    statusBar = game.add.graphics(0, 0);  //init rect
                    statusBar.beginFill(0xFF0000, 1);
                    statusBar.drawRect(51,250, width, power);
                }
            }
        }

        function render() {
            //console.log("render");
        }

        /*function paused() {
            console.log("paused");
        }

        function destroy() {
            console.log("destroy");
        }*/

    }
});

