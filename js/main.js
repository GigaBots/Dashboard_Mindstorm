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
        var labelStyle2 = { font: "20px Arial", fill: "#000000" }        
        var labelStyle3 = { font: "16px Arial", fill: "#000000" }        

        var backgound, backgroundBox;
        var frameMotorPorts, labelMotorPorts = "Motors";
        var frameSensorPorts, labelSensorPorts = "Sensors";
        var frameMotorA, frameMotorB, frameMotorC, frameMotorD;
        
        var labelMotors = ["A","B","C","D"];
        var labelSensors = ["1","2","3","4"];
        var labelMotorA = "Motor A", labelMotorB = "Motor B", labelMotorC = "Motor C", labelMotorD = "Motor D";

        var statusMotorA, statusMotorB, statusMotorC, statusMotorD;
        var statusSensor1,statusSensor2, statusSensor3, statusSensor4;

        var dashboardStatus = 0; // 1 = 'start', 0 = 'stop'
        var startButton, stopButton;
        var forwardButtonA, forwardButtonB, forwardButtonC, forwardButtonD;
        var reverseButtonA, reverseButtonB, reverseButtonC, reverseButtonD;
        var directionA = 1, directionB = 1, directionC = 1, directionD = 1; // forward = 1, reverse = -1
        var fAover, fAout, fAdown, fAup, rAover, rAout, rAdown, rAup;
        var fBover, fBout, fBdown, fBup, rBover, rBout, rBdown, rBup;
        var fCover, fCout, fCdown, fCup, rCover, rCout, rCdown, rCup;
        var fDover, fDout, fDdown, fDup, rDover, rDout, rDdown, rDup;

        var sliderBarA, sliderBarB, sliderBarC, sliderBarD;
        var sliderTrackA, sliderTrackB, sliderTrackC, sliderTrackD;
        var powerA = 0, powerB = 0, powerC = 0, powerD = 0;
        var minusButtonA, minusButtonB, minusButtonC, minusButtonD;
        var plusButtonA, plusButtonB, plusButtonC, plusButtonD;
        var powerRange = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

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

        /* Touch sensor */
        var press = 0; // 0 = not pressed, 1 = pressed
        var touchCount = 0; //count total presses
        var frameTouch;
        var labelTouch = "Touch Sensor", labelTouched = "Touched", labelTouchCount = "Total Touches: ";
        var touchIndicator;

        /* IR sensor */
        var frameIR;
        var labelIR = "Infrared Sensor", labelIRDist = "Distance: ", labelIRUnits = "cm";

        /* Color sensor */
        var frameColor;
        var labelColor = "Color Sensor";
        var colorRed, colorGreen, colorBlue, color; 

        /* Ultrasonic sensor */
        var frameUltrasonic;
        var labelUltrasonic = "Ultrasonic Sensor", labelUltrasonicDist = "Distance: ", labelUltrasonicUnits = "cm";

        /* Battery level sensor */
        var frameBattery;
        var labelBattery = "Battery Level";
        var batteryLevel = 1; //initialize the level at 100% (or, 1);
        var batteryLevelBox, batteryLevelFill;
     
        //===================================================
        channel.onSubscribers(function (joined) {
            /*console.log(joined +" joined");
            spawn(joined);*/
        },function(left){
            //console.log(left +" left");
            //kill(left);
        });

    //==============================================================================================================================
        function preload() {
            game.load.spritesheet('startButton','assets/buttons/gigabot_dashboard_button_start_spritesheet.png', 97, 49);
            game.load.spritesheet('stopButton','assets/buttons/gigabot_dashboard_button_stop_spritesheet.png', 97, 49);
            game.load.spritesheet('forwardButton','assets/buttons/gigabot_dashboard_button_forward_spritesheet.png', 97, 49);
            game.load.spritesheet('reverseButton','assets/buttons/gigabot_dashboard_button_reverse_spritesheet.png', 97, 49);
            game.load.spritesheet('minusButton','assets/buttons/gigabot_dashboard_button_minus_spritesheet.png', 44, 44);
            game.load.spritesheet('plusButton','assets/buttons/gigabot_dashboard_button_plus_spritesheet.png', 44, 44);
            game.load.spritesheet('touchIndicator','assets/gigabot_dashboard_touch_sensor_spritesheet.png', 21, 21);
            game.load.image('sliderBar','assets/gigabot_dashboard_slider_bar.png', 65, 13);
            game.load.image('dialNeedle','assets/gigabot_dashboard_dial_needle.png', 5, 80);
        } //end preload

    //==============================================================================================================================
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

            frameTouch = game.add.graphics(0,0);
            frameTouch.lineStyle(1, 0x282828, 1);
            frameTouch.drawRect(231, 130, 221, 48);

            frameIR = game.add.graphics(0,0);
            frameIR.lineStyle(1, 0x282828, 1);
            frameIR.drawRect(462, 130, 200, 48);

            frameColor = game.add.graphics(0,0);
            frameColor.lineStyle(1, 0x282828, 1);
            frameColor.drawRect(430, 60, 232, 60);

            frameUltrasonic = game.add.graphics(0,0);
            frameUltrasonic.lineStyle(1, 0x282828, 1);
            frameUltrasonic.drawRect(672, 60, 158, 118);

            frameBattery = game.add.graphics(0,0);
            frameBattery.lineStyle(1, 0x282828, 1);
            frameBattery.drawRect(300, 60, 120, 60);

        /* Labels */
            labelMotorPorts = game.add.text(58,65, labelMotorPorts, labelStyle3); //label at top of box indicating status of motor ports
            labelA = game.add.text(33, 102, labelMotors[0], labelStyle);
            labelB = game.add.text(63, 102, labelMotors[1], labelStyle);
            labelC = game.add.text(93, 102, labelMotors[2], labelStyle);
            labelD = game.add.text(123, 102, labelMotors[3], labelStyle);

            labelSensorPorts = game.add.text(193,65, labelSensorPorts, labelStyle3); //label at top of box indicating status of motor ports
            label1 = game.add.text(173, 102, labelSensors[0], labelStyle);
            label2 = game.add.text(203, 102, labelSensors[1], labelStyle);
            label3 = game.add.text(233, 102, labelSensors[2], labelStyle);
            label4 = game.add.text(263, 102, labelSensors[3], labelStyle);

            labelMotorA = game.add.text(30, 194, labelMotorA, labelStyle2);
            labelMotorB = game.add.text(440, 194, labelMotorB, labelStyle2);
            labelMotorC = game.add.text(30, 404, labelMotorC, labelStyle2);
            labelMotorD = game.add.text(440, 404, labelMotorD, labelStyle2);

            labelTouch = game.add.text(241, 135, labelTouch, labelStyle3);
            labelTouched = game.add.text(241, 157, labelTouched, labelStyle);
            labelTouchCount = game.add.text(325, 157, labelTouchCount, labelStyle); // there is room for 4 characters, so 0 to 9,999. No touching more than that!

            //touchCount = game.add.text(410, 155, touchCount, labelStyle3);

            labelIR = game.add.text(472, 135, labelIR, labelStyle3);
            labelColor = game.add.text(440, 65, labelColor, labelStyle3);
            labelUltrasonic = game.add.text(682, 65, labelUltrasonic, labelStyle3);
            labelBattery = game.add.text(310, 65, labelBattery, labelStyle3);

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
            forwardButtonA = game.add.button(30, 220, 'forwardButton', actionForwardOnClickA, this, fAover, fAout, fAdown, fAup);
            reverseButtonA = game.add.button(30, 278, 'reverseButton', actionReverseOnClickA, this, rAover, rAout, rAdown, rAup);
            forwardButtonB = game.add.button(440, 220, 'forwardButton', actionForwardOnClickB, this, fBover, fBout, fBdown, fBup);
            reverseButtonB = game.add.button(440, 278, 'reverseButton', actionReverseOnClickB, this, rBover, rBout, rBdown, rBup);
            forwardButtonC = game.add.button(30, 430, 'forwardButton', actionForwardOnClickC, this, fCover, fCout, fCdown, fCup);
            reverseButtonC = game.add.button(30, 488, 'reverseButton', actionReverseOnClickC, this, rCover, rCout, rCdown, rCup);
            forwardButtonD = game.add.button(440, 430, 'forwardButton', actionForwardOnClickD, this, fDover, fDout, fDdown, fDup);
            reverseButtonD = game.add.button(440, 488, 'reverseButton', actionReverseOnClickD, this, rDover, rDout, rDdown, rDup);

            minusButtonA = game.add.button(30, 336, 'minusButton', actionDecreaseOnClickA, this, 1, 0, 2, 0);
            plusButtonA = game.add.button(83, 336, 'plusButton', actionIncreaseOnClickA, this, 1, 0, 2, 0);
            minusButtonB = game.add.button(440, 336, 'minusButton', actionDecreaseOnClickB, this, 1, 0, 2, 0);
            plusButtonB = game.add.button(493, 336, 'plusButton', actionIncreaseOnClickB, this, 1, 0, 2, 0);
            minusButtonC = game.add.button(30, 546, 'minusButton', actionDecreaseOnClickC, this, 1, 0, 2, 0);
            plusButtonC = game.add.button(83, 546, 'plusButton', actionIncreaseOnClickC, this, 1, 0, 2, 0);
            minusButtonD = game.add.button(440, 546, 'minusButton', actionDecreaseOnClickD, this, 1, 0, 2, 0);
            plusButtonD = game.add.button(493, 546, 'plusButton', actionIncreaseOnClickD, this, 1, 0, 2, 0);

        /* Click and drag motor speed setting & display */
            sliderTrackA = game.add.graphics(0,0);
            sliderTrackA.beginFill(0x282828, 1);
            sliderTrackA.drawRect(173, 202, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarA = game.add.button(143, 356, 'sliderBar', actionDragOnClickA);

            sliderTrackB = game.add.graphics(0,0);
            sliderTrackB.beginFill(0x282828, 1);
            sliderTrackB.drawRect(583, 202, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarB = game.add.button(553, 356, 'sliderBar', actionDragOnClickB);
                        
            sliderTrackC = game.add.graphics(0,0);
            sliderTrackC.beginFill(0x282828, 1);
            sliderTrackC.drawRect(173, 412, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarC = game.add.button(143, 566, 'sliderBar', actionDragOnClickC);

            sliderTrackD = game.add.graphics(0,0);
            sliderTrackD.beginFill(0x282828, 1);
            sliderTrackD.drawRect(583, 412, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarD = game.add.button(553, 566, 'sliderBar', actionDragOnClickD);

            // Add some labels to the sliders
            var sliderLabel = game.add.text(158, 370, "Power", labelStyle);
            sliderLabel = game.add.text(568, 370, "Power", labelStyle);
            sliderLabel = game.add.text(158, 580, "Power", labelStyle);
            sliderLabel = game.add.text(568, 580, "Power", labelStyle);
            for (var i = 0; i <= 10; i++) {
                var powerLabel = powerRange[i] + " %";
                //console.log(powerRange[i]);
                var powerLabelY1 = 355 - 16 * i;
                var powerLabelY2 = 565 - 16 * i;
                var powerLabelA = game.add.text(211, powerLabelY1, powerLabel, labelStyle)
                var powerLabelB = game.add.text(621, powerLabelY1, powerLabel, labelStyle)
                var powerLabelC = game.add.text(211, powerLabelY2, powerLabel, labelStyle)
                var powerLabelD = game.add.text(621, powerLabelY2, powerLabel, labelStyle);
            }

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
        
            var dialLabel = game.add.text(304, 370, "Rotation", labelStyle);
            dialLabel = game.add.text(714, 370, "Rotation", labelStyle);
            dialLabel = game.add.text(304, 580, "Rotation", labelStyle);
            dialLabel = game.add.text(714, 580, "Rotation", labelStyle);
        
        /* Touch Sensor */
            touchIndicator = game.add.sprite(295, 153, 'touchIndicator');
            touchIndicator.animations.add('up', [0], 1);
            touchIndicator.animations.add('pressed', [1], 1);

        /* IR Sensor */


        /* Color Sensor */

        /* Ultrasonic Sensor */

        /* Battery Level Sensor */
            batteryLevelBox = game.add.graphics(0,0);
            batteryLevelBox.lineStyle(1.5, 0x282828, 1);
            batteryLevelBox.drawRect(309, 90, 102, 20);

            batteryLevelFill = game.add.graphics(0,0);
            batteryLevelFill.beginFill(0x808080, 1);
            batteryLevelFill.drawRect(310, 91, Math.round(batteryLevel*100), 18); // the "x100" converts the battery level (whatever it initially is) to the scale of 100 px wide

        } // end create 

    /* Button-click functions */
        function actionStartOnClick () {
            // start all motors at their current settings
            dashboardStatus = 1;
        }
        function actionStopOnClick () {
            // stop all motors at their current settings
            dashboardStatus = 0;
        }


        function actionForwardOnClickA () {
            directionA = 1;
            console.log("forward");
            // forward motor
            //forwardButtonA.overFrame = 0, forwardButtonA.outFrame = 0, forwardButtonA.downFrame = 0, forwardButtonA.downFrame = 0;
            //rAout = 0;
            //console.log ("ForwardOnClick: fAout = " + fAout + " & rAout = " +rAout);
        }
        function actionReverseOnClickA () {
            directionA = -1;
            console.log("reverse");
            // reverse motor
            //fAout = 2;
            //rAout = 2;
            //console.log ("ReverseOnClick: fAout = " + fAout + " & rAout = " +rAout);
        }
        function actionForwardOnClickB () {
            directionB = 1;
            console.log("forward");
        }
        function actionReverseOnClickB () {
            directionB = -1;
            console.log("reverse");
        }
        function actionForwardOnClickC () {
            directionC = 1;
            console.log("forward");
        }
        function actionReverseOnClickC () {
            directionC = -1;
            console.log("reverse");
        }
        function actionForwardOnClickD () {
            directionC = 1;
            console.log("forward");
        }
        function actionReverseOnClickD () {
            directionD = -1;
            console.log("reverse");
        }
        
        //=============================================================================
        /* Plus and Minus Buttons For Increase and Decreasing Motor Speeds (an alternative to clicking and dragging) */
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

    //==============================================================================================================================
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
                statusMotorA.drawCircle(37, 91, 5);
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
                statusMotorB.drawCircle(67, 91, 5);
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
                statusMotorC.drawCircle(97, 91, 5);
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
                statusMotorD.drawCircle(127, 91, 5);
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
                statusSensor1.drawCircle(177, 91, 5);
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
                statusSensor2.drawCircle(207, 91, 5);
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
                statusSensor3.drawCircle(237, 91, 5);
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
                statusSensor4.drawCircle(267, 91, 5);
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

            if (dashboardStatus == 1) {
                var multiplier = 50; // THIS NUMBER IS JUST A PLACE HOLDER, AND IT LIKELY BE DIFFERENT FOR LARGE AND MEDIUM MOTORS
                if (powerA > 0) {
                    if (directionA == 1) {
                        needleA.angle += multiplier * powerA;
                    } else {
                        needleA.angle -= multiplier * powerA;
                    }
                }
                if (powerB > 0) {
                    if (directionB == 1) {
                        needleB.angle += multiplier * powerB;
                    } else {
                        needleB.angle -= multiplier * powerB;
                    }
                }
                if (powerC > 0) {
                    if (directionC == 1) {
                        needleC.angle += multiplier * powerC;
                    } else {
                        needleC.angle -= multiplier * powerC;
                    }
                }
                if (powerD > 0) {
                    if (directionD == 1) {
                        needleD.angle += multiplier * powerD;
                    } else {
                        needleD.angle -= multiplier * powerD;
                    }
                }
            }

            //=============================================================================
            /* Touch Sensor */
            var touchCountDisplay;
  
/*            if(!game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                touchCountDisplay = game.add.text(410, 155, touchCount, labelStyle3);
            } else if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                //touchCountDisplay.destroy();
                //touchCount++;
            }*/
            if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {       
                touchCountDisplay = game.add.text(410, 155, touchCount, labelStyle3);
                touchCountDisplay.destroy();
                touchIndicator.animations.play('pressed');
                // THE TOUCH COUNT COUNTS THE FRACTIONS OF A SECOND THE BUTTON IS HELD DOWN, NOT HOW MANY TIMES IT'S BEEN PRESSED
                touchCount++;
                console.log(touchCount);
                touchCountDisplay = game.add.text(410, 155, touchCount, labelStyle3);

            } else {
                touchIndicator.animations.play('up');
                //touchCountDisplay.destroy()
                //touchCountDisplay = game.add.text(410, 155, touchCount, labelStyle3);

            }


            //=============================================================================
            /* IR Sensor */


            //=============================================================================
            /* Color Sensor */


            //=============================================================================
            /* Ultrasonic Sensor */

            //=============================================================================
            /* Battery Level Sensor */
            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                if (batteryLevel <= 1) { //upper boundary limit
                    if(batteryLevel > 0) { //lower boundary limit
                        batteryLevel = batteryLevel - 0.01;
                        batteryLevelFill.destroy();
                        batteryLevelFill = game.add.graphics(0,0);
                        batteryLevelFill.beginFill(0x808080, 1);
                        batteryLevelFill.drawRect(310, 91, Math.round(batteryLevel*100), 18);
                    }
                }
            }
            if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                if (batteryLevel < 1) { //upper boundary limit
                    if(batteryLevel >= 0) { //lower boundary limit
                        batteryLevel = batteryLevel + 0.01;
                        batteryLevelFill.destroy();
                        batteryLevelFill = game.add.graphics(0,0);
                        batteryLevelFill.beginFill(0x808080, 1);
                        batteryLevelFill.drawRect(310, 91, Math.round(batteryLevel*100), 18);
                    }
                }
            }
            

        } // end update

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

