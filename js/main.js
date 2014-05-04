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
        var titleStyle = { font: "32px Lucida Console, Arial",fill: "#F8F8F8"}
        var labelStyle = { font: "12px Arial", fill: "#000000" }
        var labelStyle2 = { font: "18px Arial", fill: "#000000" }        

        var backgound, backgroundBox;
        var frameMotorPorts, labelMotorPorts = "Motors";
        var frameSensorPorts, labelSensorPorts = "Sensors";
        var frameMotorA, frameMotorB, frameMotorC, frameMotorD;
        
        var labelMotors = ["A","B","C","D"];
        var labelSensors = ["1","2","3","4"];
        var labelMotorA = "Motor A", labelMotorB = "Motor B", labelMotorC = "Motor C", labelMotorD = "Motor D";

        var statusMotorA, statusMotorB, statusMotorC, statusMotorD;
        var statusSensor1,statusSensor2, statusSensor3, statusSensor4;

        var startButton, stopButton;
        var forwardButtonA, forwardButtonB, forwardButtonC, forwardButtonD;
        var reverseButtonA, reverseButtonB, reverseButtonC, reverseButtonD;
        var fAover, fAout, fAdown, fAup;
        var rAover, rAout, rAdown, rAup;

        var sliderBarA, sliderBarB, sliderBarC, sliderBarD;
        var sliderTrackA, sliderTrackB, sliderTrackC, sliderTrackD;
        var powerA, powerB, powerC, powerD;
        var minusButtonA, minusButtonB, minusButtonC, minusButtonD;
        var plusButtonA, plusButtonB, plusButtonC, plusButtonD;

        var dialA, dialB, dialC, dialD;
        var needleA, needleB, needleC, needleD;

        var motorA = {
            status : 3, //0 = unplugged, 1 = plugged-in, 2 = stalled // 3 for initial setting
            speed : '', // rpm
            position : '' //degrees
        }
        var motorB = {
            status : 3, //0 = unplugged, 1 = plugged-in, 2 = stalled
            speed : '', // rpm
            position : '' //degrees
        }
        var motorC = {
            status : 3, //0 = unplugged, 1 = plugged-in, 2 = stalled
            speed : '', // rpm
            position : '' //degrees
        }
        var motorD = {
            status : 3, //0 = unplugged, 1 = plugged-in, 2 = stalled
            speed : '', // rpm
            position : '' //degrees
        }

        var sensor1 = {
            status : 2, //0 = unplugged, 1 = plugged-in // 2 for initial setting
        }
        var sensor2 = {
            status : 2, //0 = unplugged, 1 = plugged-in // 2 for initial setting
        }
        var sensor3 = {
            status : 2, //0 = unplugged, 1 = plugged-in // 2 for initial setting
        }
        var sensor4 = {
            status : 2, //0 = unplugged, 1 = plugged-in // 2 for initial setting
        }

        var lightOn;
        var lightOff;
        var status;
        var box;
        var statusBar = {
             //width : 10,
             //height : 0
        }
        var power = 0;
        var width = 8;
        var height = 0;

        var x = 0;
        var y = 10;        

        

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
            game.load.spritesheet('startButton','assets/buttons/gigabot_dashboard_button_start_spritesheet.png', 97, 49);
            game.load.spritesheet('stopButton','assets/buttons/gigabot_dashboard_button_stop_spritesheet.png', 97, 49);
            game.load.spritesheet('forwardButton','assets/buttons/gigabot_dashboard_button_forward_spritesheet.png', 97, 49);
            game.load.spritesheet('reverseButton','assets/buttons/gigabot_dashboard_button_reverse_spritesheet.png', 97, 49);
            game.load.image('minusButton','assets/buttons/gigabot_dashboard_button_minus.png', 44, 44);
            game.load.image('plusButton','assets/buttons/gigabot_dashboard_button_plus.png', 44, 44);
            game.load.image('sliderBar','assets/gigabot_dashboard_slider_bar.png', 65, 13);
            game.load.image('dialNeedle','assets/gigabot_dashboard_dial_needle.png', 80, 5);
        }

        function create() {
            //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
            this.game.stage.disableVisibilityChange = false;    

            /* Background */
            game.stage.backgroundColor = '#C0C0C0';
            var titleBox = game.add.graphics(0,0);
            titleBox.beginFill(0xFF3333,1);
            titleBox.drawRect(0,0,960,50);

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

            frameSensorPorts = game.add.graphics(0,0);
            frameSensorPorts.lineStyle(1, 0x282828, 1);
            //frameSensorPorts.beginFill(0xFFFFFF,1);
            frameSensorPorts.drawRect(155, 60, 130, 60);

            frameMotorA = game.add.graphics(0,0);
            frameMotorA.lineStyle(1, 0x282828, 1);
            //frameMotorPorts.beginFill(0xFFFFFF,1);
            frameMotorA.drawRect(20, 188, 400, 200);

            /* Labels */
            labelMotorPorts = game.add.text(60,64, labelMotorPorts, labelStyle); //label at top of box indicating status of motor ports
            labelA = game.add.text(33, 100, labelMotors[0], labelStyle);
            labelB = game.add.text(63, 100, labelMotors[1], labelStyle);
            labelC = game.add.text(93, 100, labelMotors[2], labelStyle);
            labelD = game.add.text(123, 100, labelMotors[3], labelStyle);

            labelSensorPorts = game.add.text(195,64, labelSensorPorts, labelStyle); //label at top of box indicating status of motor ports
            label1 = game.add.text(168, 100, labelSensors[0], labelStyle);
            label2 = game.add.text(198, 100, labelSensors[1], labelStyle);
            label3 = game.add.text(228, 100, labelSensors[2], labelStyle);
            label4 = game.add.text(258, 100, labelSensors[3], labelStyle);

            labelMotorA = game.add.text(30, 193, labelMotorA, labelStyle2);
            //NEED LABELS FOR OTHER 3 MOTORS

            /* Buttons */
            //Add button for starting all motors at their current settings
            startButton = game.add.button(20, 130, 'startButton', actionStartOnClick, this, 1, 0, 2, 0);
            stopButton = game.add.button(120, 130, 'stopButton', actionStopOnClick, this, 1, 0, 2, 0);
            //Add forward and reverse buttons for each motor
            fAover = 1, fAout = 0, fAdown = 2, fAup = 0;
            rAover = 1, rAout = 0, rAdown = 2, rAup = 0;
            forwardButtonA = game.add.button(30, 216, 'forwardButton', actionForwardOnClick, this, fAover, fAout, fAdown, fAup);
            reverseButtonB = game.add.button(30, 274, 'reverseButton', actionReverseOnClick, this, rAover, rAout, rAdown, rAup);
            //NEED FORWARD AND REVERSE BUTTONS FOR THE OTHER 3 MOTORS
            minusButtonA = game.add.button(30, 332, 'minusButton', actionDecreaseOnClick);
            plusButtonA = game.add.button(83, 332, 'plusButton', actionIncreaseOnClick);
            //NEED PLUS AND MINUS BUTTONS FOR OTHER 3 MOTORS

            /* Click and drag motor speed setting & display */
            sliderTrackA = game.add.graphics(0,0);
            sliderTrackA.beginFill(0x282828, 1);
            sliderTrackA.drawRect(175, 202, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarA = game.add.sprite(145, 350, 'sliderBar');
            //NEED SLIDERS FOR THE OTHER 3 MOTORS

            /* Rotational position dials and needles for motors */
            dialA = game.add.graphics(0,0);
            dialA.beginFill(0xD8D8D8, 1);
            dialA.lineStyle(1, 0x282828, 1);
            dialA.drawCircle(315, 282, 80);
            //NEED DIALS FOR THE OTHER 3 MOTORS

            needleA = game.add.sprite(315, 282, 'dialNeedle');
            needleA.anchor.setTo(0.0375, 0.5);
            //NEED NEEDLES FOR THE OTHER 3 MOTORS
        
        }  

        /* Button-click functions */
        function actionStartOnClick () {
            // start all motors at their current settings
        }
        function actionStopOnClick () {
            // stop all motors at their current settings
        }

        //NEED TO DISTINGUISH EACH OF THE 4 MOTORS!
        function actionForwardOnClick () {
            // forward motor
            forwardButtonA.overFrame = 0, forwardButtonA.outFrame = 0, forwardButtonA.downFrame = 0, forwardButtonA.downFrame = 0;
            rAout = 0;
            console.log ("ForwardOnClick: fAout = " + fAout + " & rAout = " +rAout);
        }
        function actionReverseOnClick () {
            // reverse motor
            fAout = 2;
            rAout = 2;
            console.log ("ReverseOnClick: fAout = " + fAout + " & rAout = " +rAout);

        }
        function actionDecreaseOnClick() {

        }
        function actionIncreaseOnClick() {

        }

        /* Click-and-drag functions */
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
            /* motor A status */
            var msg = { Astatus : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.Q)) { msg.Astatus = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.A)) { msg.Astatus = 1; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.Z)) { msg.Astatus = 2; }
            if (motorA.status == msg.Astatus) {
            } else {
                statusMotorA = game.add.graphics(0,0);
                motorA.status = msg.Astatus;
                if (motorA.status == 1) {
                    statusMotorA.beginFill(0x33FF33, 1); //green
                } else if (motorA.status == 2) {
                    statusMotorA.beginFill(0xFF0000, 1); //red
                } else if (motorA.status == 0) { //default
                    statusMotorA.lineStyle(1, 0x282828, 1);
                    statusMotorA.beginFill(0x909090, 1); //dark grey
                }
                statusMotorA.drawCircle(37, 88, 5);
            }
            /* motor B status */
            var msg = { Bstatus : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.W)) { msg.Bstatus = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.S)) { msg.Bstatus = 1; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.X)) { msg.Bstatus = 2; }
            if (motorB.status == msg.Bstatus) {
            } else {
                statusMotorB = game.add.graphics(0,0);
                motorB.status = msg.Bstatus;
                if (motorB.status == 1) {
                    statusMotorB.beginFill(0x33FF33, 1); //green
                } else if (motorB.status == 2) {
                    statusMotorB.beginFill(0xFF0000, 1); //red
                } else if (motorB.status == 0) { //default
                    statusMotorB.lineStyle(1, 0x282828, 1);
                    statusMotorB.beginFill(0x909090, 1); //dark grey
                }
                statusMotorB.drawCircle(67, 88, 5);
            }
            /* motor C status */
            var msg = { Cstatus : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.R)) { msg.Cstatus = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) { msg.Cstatus = 1; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.C)) { msg.Cstatus = 2; }
            if (motorC.status == msg.Cstatus) {
            } else {
                statusMotorC = game.add.graphics(0,0);
                motorC.status = msg.Cstatus;
                if (motorC.status == 1) {
                    statusMotorC.beginFill(0x33FF33, 1); //green
                } else if (motorC.status == 2) {
                    statusMotorC.beginFill(0xFF0000, 1); //red
                } else if (motorC.status == 0) { //default
                    statusMotorC.lineStyle(1, 0x282828, 1);
                    statusMotorC.beginFill(0x909090, 1); //dark grey
                }
                statusMotorC.drawCircle(97, 88, 5);
            }
            /* motor D status */
            var msg = { Dstatus : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.T)) { msg.Dstatus = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.F)) { msg.Dstatus = 1; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.V)) { msg.Dstatus = 2; }
            if (motorD.status == msg.Dstatus) {
            } else {
                statusMotorD = game.add.graphics(0,0);
                motorD.status = msg.Dstatus;
                if (motorD.status == 1) {
                    statusMotorD.beginFill(0x33FF33, 1); //green
                } else if (motorD.status == 2) {
                    statusMotorD.beginFill(0xFF0000, 1); //red
                } else if (motorD.status == 0) { //default
                    statusMotorD.lineStyle(1, 0x282828, 1);
                    statusMotorD.beginFill(0x909090, 1); //dark grey
                }
                statusMotorD.drawCircle(127, 88, 5);
            }
            //=============================================================================
            /* sensor 1 status */
            var msg = { status1 : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.P)) { msg.status1 = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.L)) { msg.status1 = 1; }
            if (sensor1.status == msg.status1) {
            } else {
                statusSensor1 = game.add.graphics(0,0);
                sensor1.status = msg.status1;
                if (sensor1.status == 1) {
                    statusSensor1.beginFill(0x33FF33, 1); //green
                } else if (sensor1.status == 0) { //default
                    statusSensor1.lineStyle(1, 0x282828, 1);
                    statusSensor1.beginFill(0x909090, 1); //dark grey
                }
                statusSensor1.drawCircle(172, 88, 5);
            }
            /* sensor 2 status */
            var msg = { status2 : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.O)) { msg.status2 = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.K)) { msg.status2 = 1; }
            if (sensor2.status == msg.status2) {
            } else {
                statusSensor2 = game.add.graphics(0,0);
                sensor2.status = msg.status2;
                if (sensor2.status == 1) {
                    statusSensor2.beginFill(0x33FF33, 1); //green
                } else if (sensor2.status == 0) { //default
                    statusSensor2.lineStyle(1, 0x282828, 1);
                    statusSensor2.beginFill(0x909090, 1); //dark grey
                }
                statusSensor2.drawCircle(202, 88, 5);
            }
            /* sensor 3 status */
            var msg = { status3 : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.I)) { msg.status3 = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.J)) { msg.status3 = 1; }
            if (sensor3.status == msg.status3) {
            } else {
                statusSensor3 = game.add.graphics(0,0);
                sensor3.status = msg.status3;
                if (sensor3.status == 1) {
                    statusSensor3.beginFill(0x33FF33, 1); //green
                } else if (sensor3.status == 0) { //default
                    statusSensor3.lineStyle(1, 0x282828, 1);
                    statusSensor3.beginFill(0x909090, 1); //dark grey
                }
                statusSensor3.drawCircle(232, 88, 5);
            }
            /* sensor 4 status */
            var msg = { status4 : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.U)) { msg.status4 = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.H)) { msg.status4 = 1; }    
            if (sensor4.status == msg.status4) {
            } else {
                statusSensor4 = game.add.graphics(0,0);
                sensor4.status = msg.status4;
                if (sensor4.status == 1) {
                    statusSensor4.beginFill(0x33FF33, 1); //green
                } else if (sensor4.status == 0) { //default
                    statusSensor4.lineStyle(1, 0x282828, 1);
                    statusSensor4.beginFill(0x909090, 1); //dark grey
                }
                statusSensor4.drawCircle(262, 88, 5);
            }
            //=============================================================================

            
            //var cursorLabel;
            ////cursorx = game.input.x;
            cursory = game.input.y;

            //lightOff.x = game.input.x;
            //lightOff.y = game.input.y;
            //cursorLabel = cursorx + ", " + cursory;
            //cursorLabel = game.add.text(10,10, cursorLabel, labelStyle);

            /* Convert degrees value (between 0 and 360) in message from gigabot to a degrees (between 0 and 180, and -180 and 0) value Phaser can use for rotation */ 
            var msgDegrees, phaserDegrees;
            if (msgDegrees >= 0) {
                if (msgDegrees <= 180) {
                    phaserDegrees = msgDegrees;
                } else { // so if msgDegrees > 180
                    phaserDegrees = 360 + msgDegrees; // so -180 < phaserDegrees < 0
                }
            }

            /* Press up to increase degrees, and down to decrease degrees */
            if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                needleA.angle += 5;
            } 
            else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)){
                needleA.angle -= 5;
            } 
            else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){

            } 
            else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){

            }
            else {
                //NEED TO FIX THESE ANIMATIONS IF WE WANT THEM
                /* add a little animating so that the needle slowly returns to its previous position */
                // rotation goes from 0' to 180' to -180' to 0' */
/*                if (needleA.angle != 0) {
                    var r;
                    if (needleA.angle > 0) {
                        r = needleA.angle;
                    } else if (needleA.angle < -0.1) { // the -0.1 is so the needle doesn't keep spinning, since it won't get exactly to 0 with our increment of 0.1 (it could go slightly past)
                        r = 360 + needleA.angle;
                    }
                }
                if (r > 0) {
                    for (var i = r; i >= 0; i--) {
                        needleA.angle -= 0.1;
                    }
                }

                    if (needleA.angle > 0) {
                        for (var i = needleA.angle; i > 0; i--) {
                            needleA.angle -= 0.1; // -0.15 seems to be a good enough "rate"
                        }
                    } else if (needleA.angle < 0) {
                        for (var i = (-1)*needleA.angle; i <= 180; i++) {
                            needleA.angle -= 0.1;
                        }
                    }*/
            }

            /* Press W to increase power, and S to decrease power */
            //NOTE: this works, but we should prob figure out a different way to do it, as it just deletes the statusBar rectangle and adds a new one each time...
            if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {

            }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)){

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

