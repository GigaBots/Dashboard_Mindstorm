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
                            console.log("Something bad happened. " + err);
                        }
                    });
                } else {
                    console.log("Something went wrong. ");
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
            //render: render,
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
        var fAover, fAout, fAdown, fAup, rAover, rAout, rAdown, rAup;
        var fBover, fBout, fBdown, fBup, rBover, rBout, rBdown, rBup;
        var fCover, fCout, fCdown, fCup, rCover, rCout, rCdown, rCup;
        var fDover, fDout, fDdown, fDup, rDover, rDout, rDdown, rDup;

        var sliderBarA, sliderBarB, sliderBarC, sliderBarD;
        var sliderTrackA, sliderTrackB, sliderTrackC, sliderTrackD;
        var powerA = 0, powerB = 0, powerC = 0, powerD = 0;
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
            game.load.spritesheet('minusButton','assets/buttons/gigabot_dashboard_button_minus_spritesheet.png', 44, 44);
            game.load.spritesheet('plusButton','assets/buttons/gigabot_dashboard_button_plus_spritesheet.png', 44, 44);
            game.load.image('sliderBar','assets/gigabot_dashboard_slider_bar.png', 65, 13);
            game.load.image('dialNeedle','assets/gigabot_dashboard_dial_needle.png', 5, 80);
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
            frameSensorPorts.drawRect(160, 60, 130, 60);

            frameMotorA = game.add.graphics(0,0);
            frameMotorA.lineStyle(1, 0x282828, 1);
            frameMotorA.drawRect(430, 188, 400, 200);

            frameMotorB = game.add.graphics(0,0);
            frameMotorB.lineStyle(1, 0x282828, 1);
            frameMotorB.drawRect(20, 188, 400, 200);

            frameMotorC = game.add.graphics(0,0);
            frameMotorC.lineStyle(1, 0x282828, 1);
            frameMotorC.drawRect(20, 398, 400, 200);

            frameMotorD = game.add.graphics(0,0);
            frameMotorD.lineStyle(1, 0x282828, 1);
            frameMotorD.drawRect(430, 398, 400, 200);

            /* Labels */
            labelMotorPorts = game.add.text(62,64, labelMotorPorts, labelStyle); //label at top of box indicating status of motor ports
            labelA = game.add.text(33, 100, labelMotors[0], labelStyle);
            labelB = game.add.text(63, 100, labelMotors[1], labelStyle);
            labelC = game.add.text(93, 100, labelMotors[2], labelStyle);
            labelD = game.add.text(123, 100, labelMotors[3], labelStyle);

            labelSensorPorts = game.add.text(200,64, labelSensorPorts, labelStyle); //label at top of box indicating status of motor ports
            label1 = game.add.text(173, 100, labelSensors[0], labelStyle);
            label2 = game.add.text(203, 100, labelSensors[1], labelStyle);
            label3 = game.add.text(233, 100, labelSensors[2], labelStyle);
            label4 = game.add.text(263, 100, labelSensors[3], labelStyle);

            labelMotorA = game.add.text(30, 193, labelMotorA, labelStyle2);
            labelMotorB = game.add.text(440, 193, labelMotorB, labelStyle2);
            labelMotorC = game.add.text(30, 403, labelMotorC, labelStyle2);
            labelMotorD = game.add.text(440, 403, labelMotorD, labelStyle2);

            /* Buttons */
            //Add button for starting all motors at their current settings
            startButton = game.add.button(20, 130, 'startButton', actionStartOnClick, this, 1, 0, 2, 0);
            stopButton = game.add.button(125, 130, 'stopButton', actionStopOnClick, this, 1, 0, 2, 0);
            //Add forward and reverse buttons for each motor
            fAover = 1, fAout = 0, fAdown = 2, fAup = 0;
            rAover = 1, rAout = 0, rAdown = 2, rAup = 0;
            fBover = 1, fBout = 0, fBdown = 2, fBup = 0;
            rBover = 1, rBout = 0, rBdown = 2, rBup = 0;
            fCover = 1, fCout = 0, fCdown = 2, fCup = 0;
            rCover = 1, rCout = 0, rCdown = 2, rCup = 0;
            fDover = 1, fDout = 0, fDdown = 2, fDup = 0;
            rDover = 1, rDout = 0, rDdown = 2, rDup = 0;
            forwardButtonA = game.add.button(30, 216, 'forwardButton', actionForwardOnClick, this, fAover, fAout, fAdown, fAup);
            reverseButtonA = game.add.button(30, 274, 'reverseButton', actionReverseOnClick, this, rAover, rAout, rAdown, rAup);
            forwardButtonB = game.add.button(440, 216, 'forwardButton', actionForwardOnClick, this, fBover, fBout, fBdown, fBup);
            reverseButtonB = game.add.button(440, 274, 'reverseButton', actionReverseOnClick, this, rBover, rBout, rBdown, rBup);
            forwardButtonC = game.add.button(30, 426, 'forwardButton', actionForwardOnClick, this, fCover, fCout, fCdown, fCup);
            reverseButtonC = game.add.button(30, 484, 'reverseButton', actionReverseOnClick, this, rCover, rCout, rCdown, rCup);
            forwardButtonD = game.add.button(440, 426, 'forwardButton', actionForwardOnClick, this, fDover, fDout, fDdown, fDup);
            reverseButtonD = game.add.button(440, 484, 'reverseButton', actionReverseOnClick, this, rDover, rDout, rDdown, rDup);

            minusButtonA = game.add.button(30, 332, 'minusButton', actionDecreaseOnClickA, this, 1, 0, 2, 0);
            plusButtonA = game.add.button(83, 332, 'plusButton', actionIncreaseOnClickA, this, 1, 0, 2, 0);
            minusButtonB = game.add.button(440, 332, 'minusButton', actionDecreaseOnClickB, this, 1, 0, 2, 0);
            plusButtonB = game.add.button(493, 332, 'plusButton', actionIncreaseOnClickB, this, 1, 0, 2, 0);
            minusButtonC = game.add.button(30, 542, 'minusButton', actionDecreaseOnClickC, this, 1, 0, 2, 0);
            plusButtonC = game.add.button(83, 542, 'plusButton', actionIncreaseOnClickC, this, 1, 0, 2, 0);
            minusButtonD = game.add.button(440, 542, 'minusButton', actionDecreaseOnClickD, this, 1, 0, 2, 0);
            plusButtonD = game.add.button(493, 542, 'plusButton', actionIncreaseOnClickD, this, 1, 0, 2, 0);

            /* Click and drag motor speed setting & display */
            sliderTrackA = game.add.graphics(0,0);
            sliderTrackA.beginFill(0x282828, 1);
            sliderTrackA.drawRect(175, 202, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarA = game.add.button(145, 356, 'sliderBar', actionDragOnClickA);

            sliderTrackB = game.add.graphics(0,0);
            sliderTrackB.beginFill(0x282828, 1);
            sliderTrackB.drawRect(585, 202, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarB = game.add.button(555, 356, 'sliderBar', actionDragOnClickB);
                        
            sliderTrackC = game.add.graphics(0,0);
            sliderTrackC.beginFill(0x282828, 1);
            sliderTrackC.drawRect(175, 412, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarC = game.add.button(145, 566, 'sliderBar', actionDragOnClickC);

            sliderTrackD = game.add.graphics(0,0);
            sliderTrackD.beginFill(0x282828, 1);
            sliderTrackD.drawRect(585, 412, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarD = game.add.button(555, 566, 'sliderBar', actionDragOnClickD);

            /* Rotational position dials and needles for motors */
            dialA = game.add.graphics(0,0);
            dialA.beginFill(0xD8D8D8, 1);
            dialA.lineStyle(2, 0x282828, 1);
            dialA.drawCircle(328, 282, 80);

            dialB = game.add.graphics(0,0);
            dialB.beginFill(0xD8D8D8, 1);
            dialB.lineStyle(2, 0x282828, 1);
            dialB.drawCircle(738, 282, 80);

            dialC = game.add.graphics(0,0);
            dialC.beginFill(0xD8D8D8, 1);
            dialC.lineStyle(2, 0x282828, 1);
            dialC.drawCircle(328, 492, 80);

            dialD = game.add.graphics(0,0);
            dialD.beginFill(0xD8D8D8, 1);
            dialD.lineStyle(2, 0x282828, 1);
            dialD.drawCircle(738, 492, 80);

            needleA = game.add.sprite(328, 282, 'dialNeedle');
            needleA.anchor.setTo(0.5, 0.9625);

            needleB = game.add.sprite(738, 282, 'dialNeedle');
            needleB.anchor.setTo(0.5, 0.9625);

            needleC = game.add.sprite(328, 492, 'dialNeedle');
            needleC.anchor.setTo(0.5, 0.9625);

            needleD = game.add.sprite(738, 492, 'dialNeedle');
            needleD.anchor.setTo(0.5, 0.9625);
        
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
            console.log("forward");
            // forward motor
            //forwardButtonA.overFrame = 0, forwardButtonA.outFrame = 0, forwardButtonA.downFrame = 0, forwardButtonA.downFrame = 0;
            //rAout = 0;
            //console.log ("ForwardOnClick: fAout = " + fAout + " & rAout = " +rAout);
        }
        function actionReverseOnClick () {
            console.log("reverse");
            // reverse motor
            //fAout = 2;
            //rAout = 2;
            //console.log ("ReverseOnClick: fAout = " + fAout + " & rAout = " +rAout);

        //=============================================================================
        /* Plus and Minus Buttons For Increase and Decreasing Motor Speeds (an alternative to clicking and dragging) */
        }
        function actionDecreaseOnClickA() {
            if (powerA >= 0.1) {
                powerA = powerA - 0.10;
                sliderBarA.y = sliderBarA.y + 16;
            }
            console.log(powerA.toFixed(2)); //this makes powerA a string with 2 decimal places
        }
        function actionIncreaseOnClickA() {
            if (powerA <= 0.9) {
                powerA = powerA + 0.10;
                sliderBarA.y = sliderBarA.y - 16;
            }
            console.log(powerA.toFixed(2));
        }
        function actionDecreaseOnClickB() {
            if (powerB >= 0.1) {
                powerB = powerB - 0.10;
                sliderBarB.y = sliderBarB.y + 16;
            }
            console.log(powerB.toFixed(2));
        }
        function actionIncreaseOnClickB() {
            if (powerB <= 0.9) {
                powerB = powerB + 0.10;
                sliderBarB.y = sliderBarB.y - 16;
            }
            console.log(powerB.toFixed(2));
        }
        function actionDecreaseOnClickC() {
            if (powerC >= 0.1) {
                powerC = powerC - 0.10;
                sliderBarC.y = sliderBarC.y + 16;
            }
            console.log(powerC.toFixed(2));
        }
        function actionIncreaseOnClickC() {
            if (powerC <= 0.9) {
                powerC = powerC + 0.10;
                sliderBarC.y = sliderBarC.y - 16;
            }
            console.log(powerC.toFixed(2));
        }
        function actionDecreaseOnClickD() {
            if (powerD >= 0.1) {
                powerD = powerD - 0.10;
                sliderBarD.y = sliderBarD.y + 16;
            }
            console.log(powerD.toFixed(2));
        }
        function actionIncreaseOnClickD() {
            if (powerD <= 0.9) {
                powerD = powerD + 0.10;
                sliderBarD.y = sliderBarD.y - 16;
            }
            console.log(powerD.toFixed(2));
        }

        //=============================================================================
        /* Click-and-drag functions (an alternative to the plus and minus buttons) */
        function actionDragOnClickA() {
            //we're sliding between y = 356px (0%) and y = 196px (100%). These y coordinates are at the top of the slider bar, so the center goes from 362 to 202
            sliderBarA.y = 356 - Math.round( (356 - game.input.y) / 16 ) * 16; // round to nearest 10% power
            if (sliderBarA.y < 196) { //set max power boundary limit
                sliderBarA.y = 196;
            } else if (sliderBarA.y > 356) { //set min power boundary limit
                sliderBarA.y = 356;
            }
            powerA = (0.10 * (356 - sliderBarA.y) / 16);
            console.log(powerA.toFixed(2)); //this makes powerA a string with 2 decimal places
        }

        function actionDragOnClickB() {
            //we're sliding between y = 356px (0%) and y = 196px (100%). These y coordinates are at the top of the slider bar, so the center goes from 362 to 202
            sliderBarB.y = 356 - Math.round( (356 - game.input.y) / 16 ) * 16; // round to nearest 10% power
            if (sliderBarB.y < 196) { //set max power boundary limit
                sliderBarB.y = 196;
            } else if (sliderBarB.y > 356) { //set min power boundary limit
                sliderBarB.y = 356;
            }
            powerB = (0.10 * (356 - sliderBarB.y) / 16);
            console.log(powerB.toFixed(2));
        }

        function actionDragOnClickC() {
            //we're sliding between y = 566px (0%) and y = 406px (100%). These y coordinates are at the top of the slider bar, so the center goes from 562 to 412
            sliderBarC.y = 566 - Math.round( (566 - game.input.y) / 16 ) * 16; // round to nearest 10% power
            if (sliderBarC.y < 406) { //set max power boundary limit
                sliderBarC.y = 406;
            } else if (sliderBarC.y > 566) { //set min power boundary limit
                sliderBarC.y = 406;
            }
            powerC = (0.10 * (566 - sliderBarC.y) / 16);
            console.log(powerC.toFixed(2));
        }

        function actionDragOnClickD() {
            //we're sliding between y = 566px (0%) and y = 406px (100%). These y coordinates are at the top of the slider bar, so the center goes from 562 to 412
            sliderBarD.y = 566 - Math.round( (566 - game.input.y) / 16 ) * 16; // round to nearest 10% power
            if (sliderBarD.y < 406) { //set max power boundary limit
                sliderBarD.y = 406;
            } else if (sliderBarD.y > 566) { //set min power boundary limit
                sliderBarD.y = 566;
            }
            powerD = (0.10 * (566 - sliderBarD.y) / 16);
            console.log(powerD.toFixed(2));
        }
        
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
                statusSensor1.drawCircle(177, 88, 5);
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
                statusSensor2.drawCircle(207, 88, 5);
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
                statusSensor3.drawCircle(237, 88, 5);
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
                statusSensor4.drawCircle(267, 88, 5);
            }

            //=============================================================================
            /* Convert degrees value (between 0 and 360) in message from gigabot to a degrees (between 0 and 180, and -180 and 0) value Phaser can use for rotation */ 
/*            var msgDegrees, phaserDegrees;
            if (msgDegrees >= 0) {
                if (msgDegrees <= 180) {
                    phaserDegrees = msgDegrees;
                } else { // so if msgDegrees > 180
                    phaserDegrees = 360 + msgDegrees; // so -180 < phaserDegrees < 0
                }
            }*/

            var multiplier = 50; // THIS NUMBER IS JUST A PLACE HOLDER, AND IT LIKELY BE DIFFERENT FOR LARGE AND MEDIUM MOTORS
            if (powerA > 0) {
                needleA.angle += multiplier * powerA;
            }
            if (powerB > 0) {
                needleB.angle += multiplier * powerB;
            }
            if (powerC > 0) {
                needleC.angle += multiplier * powerC;
            }
            if (powerD > 0) {
                needleD.angle += multiplier * powerD;
            }


            //=============================================================================
            /*  if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                console.log("up");
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)){
                console.log("down");
            } 
            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
                console.log("left");
            } 
            else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){
                console.log("right");
            }*/


        }

        //function render() {
            //console.log("render");
        //}

        /*function paused() {
            console.log("paused");
        }

        function destroy() {
            console.log("destroy");
        }*/

    }
});

