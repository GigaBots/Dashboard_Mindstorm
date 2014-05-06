require.config({
    baseUrl: 'js',
        // set baseURL to 'js' when bbclient.min.js is in the folder entitled 'js' along with main.js, phaser.min.js, and require.js
    paths: {
        "BrowserBigBangClient": "bbclient.min",
        "BigBangClient": "bbclient.min"
    }
});

require(['BrowserBigBangClient'], function (bigbang) {

    var client = new bigbang.client.BrowserBigBangClient();

    client.connectAnonymous("thegigabots.app.bigbang.io:80", function(result) {
        if( result.success) {
           client.subscribe("bot", function( err, c) {
              if(!err) {
                  beginGame(client,c);
              }
              else {
                  console.log("Subscribe failure. " + err);
              }
           });
        }
        else {
            console.log("CONNECT FAILURE.");
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

        var bbLogo, botLogo;
        var poweredBy = "Powered by ";
        var dashboardName = "GigaBots Dashboard";
        //var titleStyle = { font: "32px Lucida Console, Arial",fill: "#F8F8F8"}
        var titleStyle = { font: "32px Lucida Console, Arial",fill: "#282828"}
        var labelStyle = { font: "12px Arial", fill: "#000000" }
        var labelStyle2 = { font: "20px Arial", fill: "#000000" }        
        var labelStyle3 = { font: "16px Arial", fill: "#000000"}
        var labelStyle4 = { font: "14px Arial", fill: "#808080" }        

        var backgound, backgroundBox;
        var frameMotorPorts, labelMotorPorts = "Motors";
        var frameSensorPorts, labelSensorPorts = "Sensors";
        var frameMotorA, frameMotorB, frameMotorC, frameMotorD;
        
        var labelMotors = ["A","B","C","D"];
        var labelSensors = ["1","2","3","4"];
        var labelMotorA = "Motor A", labelMotorB = "Motor B", labelMotorC = "Motor C", labelMotorD = "Motor D";

        var statusMotorA, statusMotorB, statusMotorC, statusMotorD, statusSensor1,statusSensor2, statusSensor3, statusSensor4;
        var statusLightA, statusLightB, statusLightC, statusLightD, statusLight1, statusLight2, statusLight3, statusLight4;

        var dashboardStatus = 0; // 1 = 'start', 0 = 'stop'
        var startButton, stopButton;
        var forwardButtonA, forwardButtonB, forwardButtonC, forwardButtonD;
        var reverseButtonA, reverseButtonB, reverseButtonC, reverseButtonD;
        var directionA = 1, directionB = 1, directionC = 1, directionD = 1; // forward = 1, reverse = -1
        var fAover, fAout, fAdown, fAup, rAover, rAout, rAdown, rAup; // "f" = forward "A" = motor A, "out" = default when mouse is not over it, "down" is when we're clicked on top of the button and clicking
        var fBover, fBout, fBdown, fBup, rBover, rBout, rBdown, rBup; // "over" = when we're hovering over the button
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
        var touch = {
         touchCountDisplay : 0 //display number of total presses
        }
        var frameTouch;
        var labelTouch = "Touch Sensor", labelTouched = "Touched", labelTouchCount = "Total Touches: ";
        var touchIndicator;

        /* IR sensor */
        var frameIR;
        var labelIR = "Infrared Sensor", labelIRDist = "Distance: ", labelIRUnits = "cm";
        var IRDist = 0; // THIS IS A PLACEHOLDER FOR NOW!
        var IR = {
            IRDistDisplay : 0
        }

        /* Color sensor */
        var frameColor;
        var labelColor = "Color Sensor", labelColorR = "Red: ", labelColorB = "Blue: ", labelColorG = "Green: ", labelColorValue = "Color: ", labelColorName = "Color: ";
        var colorR = 255, colorG = 255, colorB = 255, colorValue = 100, colorName = "White"; //THESE ARE PLACEHOLDERS FOR NOW
        var color = {
            colorRDisplay : 0,
            colorGDisplay : 0,
            colorBDisplay : 0,
            colorValueDisplay : 0,
            colorNameDisplay : 0
        }

        /* Ultrasonic sensor */
        var frameUltrasonic;
        var labelUltrasonic = "Ultrasonic Sensor", labelUltrasonicDist = "Distance: ", labelUltrasonicUnits = "cm";
        var ultrasonicDist = 0; // THIS IS A PLACEHOLDER FOR NOW!
        var ultrasonic = {
            ultrasonicDistDisplay : 0
        }

        /* Battery level sensor */
        var frameBattery;
        var labelBattery = "Battery Level";
        var batteryLevel = 1; //initialize the level at 100% (or, 1);
        var batteryLevelBox, batteryLevelFill;

        /* LCD Screen */
        var frameScreen, LCDScreenBox;
        var labelScreen = "LCD Screen";
        var screenMessage = {
            messageDisplay : "Hello GigaBot!" // this is a placeholder
        }
        //var screenMessage; // we want this to be a screenMessage object, which has property screenMessage.messageDisplay equal to the user input text
        //var messageDisplay;

        //===================================================
        channel.onSubscribers(function (joined) {
            /*console.log(joined +" joined");
            spawn(joined);*/
        },function(left){
            //console.log(left +" left");
            //kill(left);
        });

        channel.channelData.onValue(function (key, val) {
            //console.log("Add:" + key +"->"+JSON.stringify(val) );

            if( key === 'a' ||  key ==='b' || key ==='c' || key === 'd') {
                setMotorInfo(key, val);
            }
            else if ( key === 'touchSensor') {
                setTouchSensor(val);
            }

        }, function (key, val) {
            //console.log("Update:" + key +"->"+JSON.stringify(val));
            if( key === 'a' ||  key ==='b' || key ==='c' || key === 'd') {
                setMotorInfo(key, val);
            }
            else if ( key === 'touchSensor') {
                setTouchSensor( val);
            }

        }, function (key) {
            //console.log("Delete:" + key);
        });


        //quick and dirty for now
        function setMotorInfo( key, val ) {
            if( key === 'a') {
                motorA.status =1;
                needleA.angle = val.position;
            }
            else if (key === 'b') {
                motorB.status =1;
                needleB.angle = val.position;
            }
            else if( key === 'c') {
                motorC.status =1;
                needleC.angle = val.position;
            }
            else if( key === 'd')  {
                motorD.status =1;
                needleD.angle = val.position;
            }
        }

        function setTouchSensor( val ) {
            console.log("touchSensor " + JSON.stringify(val));
            if( val.touched ) {
                touchIndicator.animations.play('pressed');
            }
            else {
                touchIndicator.animations.play('up');
            }
        }


    //==============================================================================================================================
        function preload() {
            game.load.spritesheet('statusLight', 'assets/gigabot_dashboard_status_lights_spritesheet.png', 12, 12);
            game.load.spritesheet('startButton','assets/buttons/gigabot_dashboard_button_start_spritesheet.png', 97, 49);
            game.load.spritesheet('stopButton','assets/buttons/gigabot_dashboard_button_stop_spritesheet.png', 97, 49);
            game.load.spritesheet('forwardButton','assets/buttons/gigabot_dashboard_button_forward_spritesheet.png', 97, 49);
            game.load.spritesheet('reverseButton','assets/buttons/gigabot_dashboard_button_reverse_spritesheet.png', 97, 49);
            game.load.spritesheet('minusButton','assets/buttons/gigabot_dashboard_button_minus_spritesheet.png', 44, 44);
            game.load.spritesheet('plusButton','assets/buttons/gigabot_dashboard_button_plus_spritesheet.png', 44, 44);
            game.load.spritesheet('touchIndicator','assets/gigabot_dashboard_touch_sensor_spritesheet.png', 21, 21);
            game.load.image('sliderBar','assets/gigabot_dashboard_slider_bar.png', 65, 13);
            game.load.image('dialNeedle','assets/gigabot_dashboard_dial_needle.png', 5, 80);
            game.load.image('screenInputButton', 'assets/buttons/gigabot_dashboard_button_lcd_screen_input.png', 39, 18);
            game.load.image('bbLogoSm', 'assets/logo1_sm.png', 130, 49);
            game.load.image('robotOrangeSm', 'assets/robot_orange_sm.png', 50, 50);
        } //end preload

    //==============================================================================================================================
        function create() {
            //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
            this.game.stage.disableVisibilityChange = true;    

        /* Background */
            game.stage.backgroundColor = '#C8C8C8';
            var titleBox = game.add.graphics(0,0);
            //titleBox.beginFill(0xCD8500,0.75); // slightly translucent medium-dark orange
            titleBox.beginFill(0xFFFFFF,1);
            titleBox.drawRect(0,0,960,50);

            backgroundBox = game.add.graphics(0,0);
            backgroundBox.lineStyle(1,0x282828,1);
            backgroundBox.drawRect(0,0,960,1064);

        /* Title */
            dashboardName = game.add.text(68, 10, dashboardName, titleStyle);
            bbLogo = game.add.sprite(701, 1, 'bbLogoSm');
            botLogo = game.add.sprite(0,0, 'robotOrangeSm');
            poweredBy = game.add.text(606, 19, poweredBy, labelStyle4);

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
            frameIR.drawRect(462, 130, 179, 48);

            frameUltrasonic = game.add.graphics(0,0);
            frameUltrasonic.lineStyle(1, 0x282828, 1);
            frameUltrasonic.drawRect(651, 130, 179, 48);

            frameColor = game.add.graphics(0,0);
            frameColor.lineStyle(1, 0x282828, 1);
            frameColor.drawRect(430, 60, 232, 60);

            frameBattery = game.add.graphics(0,0);
            frameBattery.lineStyle(1, 0x282828, 1);
            frameBattery.drawRect(300, 60, 120, 60);

            frameScreen = game.add.graphics(0,0);
            frameColor.lineStyle(1, 0x282828, 1);
            frameColor.drawRect(672, 60, 158, 60);

        /* Labels */
            labelMotorPorts = game.add.text(58,65, labelMotorPorts, labelStyle3); //label at top of box indicating status of motor ports
            labelA = game.add.text(34, 102, labelMotors[0], labelStyle);
            labelB = game.add.text(64, 102, labelMotors[1], labelStyle);
            labelC = game.add.text(94, 102, labelMotors[2], labelStyle);
            labelD = game.add.text(124, 102, labelMotors[3], labelStyle);

            labelSensorPorts = game.add.text(193,65, labelSensorPorts, labelStyle3); //label at top of box indicating status of motor ports
            label1 = game.add.text(175, 102, labelSensors[0], labelStyle);
            label2 = game.add.text(205, 102, labelSensors[1], labelStyle);
            label3 = game.add.text(235, 102, labelSensors[2], labelStyle);
            label4 = game.add.text(265, 102, labelSensors[3], labelStyle);

            labelMotorA = game.add.text(30, 194, labelMotorA, labelStyle2);
            labelMotorB = game.add.text(440, 194, labelMotorB, labelStyle2);
            labelMotorC = game.add.text(30, 404, labelMotorC, labelStyle2);
            labelMotorD = game.add.text(440, 404, labelMotorD, labelStyle2);

            labelTouch = game.add.text(241, 135, labelTouch, labelStyle3);
            labelTouched = game.add.text(241, 157, labelTouched, labelStyle);
            labelTouchCount = game.add.text(325, 157, labelTouchCount, labelStyle); // there is room for 4 characters, so 0 to 9,999. No touching more than that!

            labelIR = game.add.text(472, 135, labelIR, labelStyle3);
            labelIRDist = game.add.text(472, 157, labelIRDist, labelStyle);
            labelIRUnits = game.add.text(580, 157, labelIRUnits, labelStyle);

            labelUltrasonic = game.add.text(661, 135, labelUltrasonic, labelStyle3);
            labelUltrasonicDist = game.add.text(661, 157, labelUltrasonicDist, labelStyle);
            labelUltrasonicUnits = game.add.text(769, 157, labelUltrasonicUnits, labelStyle);

            labelColor = game.add.text(440, 65, labelColor, labelStyle3);
            labelColorR = game.add.text(440, 95, labelColorR, labelStyle);
            labelColorG = game.add.text(505, 95, labelColorG, labelStyle);
            labelColorB = game.add.text(585, 95, labelColorB, labelStyle);
            //labelColorValue = game.add.text(580, 67, labelColorValue, labelStyle);
            labelColorName = game.add.text(551, 67, labelColorName, labelStyle);

            labelBattery = game.add.text(310, 65, labelBattery, labelStyle3);
            labelScreen = game.add.text(682, 65, labelScreen, labelStyle3);



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

            screenInputButton = game.add.button(782, 65, 'screenInputButton', actionInputOnClick);

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

        /* Status Lights */
            statusLightA = game.add.sprite(33, 86, 'statusLight');
            statusLightA.animations.add('unplugged', [0], 1);
            statusLightA.animations.add('pluggedIn', [1], 1);
            statusLightA.animations.add('stalled', [2], 1);
            statusLightB = game.add.sprite(63, 86, 'statusLight');
            statusLightB.animations.add('unplugged', [0], 1);
            statusLightB.animations.add('pluggedIn', [1], 1);
            statusLightB.animations.add('stalled', [2], 1);
            statusLightC = game.add.sprite(93, 86, 'statusLight');
            statusLightC.animations.add('unplugged', [0], 1);
            statusLightC.animations.add('pluggedIn', [1], 1);
            statusLightC.animations.add('stalled', [2], 1);
            statusLightD = game.add.sprite(123, 86, 'statusLight');
            statusLightD.animations.add('unplugged', [0], 1);
            statusLightD.animations.add('pluggedIn', [1], 1);
            statusLightD.animations.add('stalled', [2], 1);

            statusLight1 = game.add.sprite(173, 86, 'statusLight');
            statusLight1.animations.add('unplugged', [0], 1);
            statusLight1.animations.add('pluggedIn', [1], 1);
            statusLight2 = game.add.sprite(203, 86, 'statusLight');
            statusLight2.animations.add('unplugged', [0], 1);
            statusLight2.animations.add('pluggedIn', [1], 1);
            statusLight3 = game.add.sprite(233, 86, 'statusLight');
            statusLight3.animations.add('unplugged', [0], 1);
            statusLight3.animations.add('pluggedIn', [1], 1);
            statusLight4 = game.add.sprite(263, 86, 'statusLight');
            statusLight4.animations.add('unplugged', [0], 1);
            statusLight4.animations.add('pluggedIn', [1], 1);

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

        /* Battery Level Sensor */
            batteryLevelBox = game.add.graphics(0,0);
            batteryLevelBox.beginFill(0xD8D8D8, 1);
            batteryLevelBox.lineStyle(1.5, 0x282828, 1);
            batteryLevelBox.drawRect(309, 91, 102, 18);

            batteryLevelFill = game.add.graphics(0,0);
            batteryLevelFill.beginFill(0x808080, 1);
            batteryLevelFill.drawRect(310, 92, Math.round(batteryLevel*100), 16); // the "x100" converts the battery level (whatever it initially is) to the scale of 100 px wide

        /* LCD Screen */
            LCDScreenBox = game.add.graphics(0,0);
            LCDScreenBox.beginFill(0xD8D8D8, 1);
            LCDScreenBox.lineStyle(1.5, 0x282828, 1);
            LCDScreenBox.drawRect(682, 88, 138, 24);

        } // end create 

    /* Button-click functions */
        function actionInputOnClick () {
            game.world.remove(screenMessage.messageDisplay);
            messageDisplay = prompt("What would you like to display on the screen?");
            screenMessage.messageDisplay = game.add.text(685, 93, messageDisplay, labelStyle3);
        }

        function actionStartOnClick () {
            // start all motors at their current settings
            dashboardStatus = 1;
        }
        function actionStopOnClick () {
            // stop all motors at their current settings
            dashboardStatus = 0;
        }
        function actionForwardOnClickA () {
            moveMotor("a", "f", powerA * 1000);
        }
        function actionReverseOnClickA () {
            moveMotor("a", "r", powerA * 1000);
        }
        function actionForwardOnClickB () {
            moveMotor( "b", "f", powerB * 1000);
        }
        function actionReverseOnClickB () {
            moveMotor( "b", "r", powerB * 1000);
        }
        function actionForwardOnClickC () {
            moveMotor( "c", "f",powerC * 1000);
        }
        function actionReverseOnClickC () {
            moveMotor( "c", "r",powerC * 1000);
        }
        function actionForwardOnClickD () {
            moveMotor( "d", "f", powerD * 1000);
            console.log("forward");
        }
        function actionReverseOnClickD () {
            moveMotor("d", "r",powerD * 1000);
        }

        function moveMotor( motor, direction, duration ) {
            var data = {};
            data.type = "motor";
            data.port = motor;
            data.dir = direction;
            data.duration = duration;
            console.log( "sending " + JSON.stringify(data));
            channel.publish( data );
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
            if (sliderBarD.y < 406) { //set min power boundary limit
                sliderBarD.y = 406;
            } else if (sliderBarD.y > 566) { //set max power boundary limit
                sliderBarD.y = 566;
            }
            powerD = (0.10 * (566 - sliderBarD.y) / 16);
            console.log(powerD.toFixed(2));
        }

    //==============================================================================================================================
        function update() {
            // NOTE, IN THIS DEVELOPMENT STAGE, WE'RE USING 'msg' AND KEYBOARD INPUTS AS PLACEHOLDERS FOR THE MESSAGES ON THE CHANNEL. 
            // THE IF BLOCK STRUCTURE MAY STAY BUT WITH DIFFERENT INPUTS

            /* motor A status */
            var msg = { Astatus : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.Q)) { msg.Astatus = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.A)) { msg.Astatus = 1; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.Z)) { msg.Astatus = 2; }
            if (motorA.status == msg.Astatus) {
            } else {
                motorA.status = msg.Astatus;
                if (motorA.status == 1) {
                    statusLightA.animations.play('pluggedIn');
                } else if (motorA.status == 2) {
                    statusLightA.animations.play('stalled'); 
                } else if (motorA.status == 0) { //default
                    statusLightA.animations.play('unplugged');
                }
            }
            /* motor B status */
            var msg = { Bstatus : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.W)) { msg.Bstatus = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.S)) { msg.Bstatus = 1; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.X)) { msg.Bstatus = 2; }
            if (motorB.status == msg.Bstatus) {
            } else {
                motorB.status = msg.Bstatus;
                if (motorB.status == 1) {
                    statusLightB.animations.play('pluggedIn');
                } else if (motorB.status == 2) {
                    statusLightB.animations.play('stalled'); 
                } else if (motorB.status == 0) { //default
                    statusLightB.animations.play('unplugged');
                }
            }
            /* motor C status */
            var msg = { Cstatus : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.R)) { msg.Cstatus = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) { msg.Cstatus = 1; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.C)) { msg.Cstatus = 2; }
            if (motorC.status == msg.Cstatus) {
            } else {
                motorC.status = msg.Cstatus;
                if (motorC.status == 1) {
                    statusLightC.animations.play('pluggedIn');
                } else if (motorC.status == 2) {
                    statusLightC.animations.play('stalled'); 
                } else if (motorC.status == 0) { //default
                    statusLightC.animations.play('unplugged');
                }
            }
            /* motor D status */
            var msg = { Dstatus : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.T)) { msg.Dstatus = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.F)) { msg.Dstatus = 1; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.V)) { msg.Dstatus = 2; }
            if (motorD.status == msg.Dstatus) {
            } else {
                motorD.status = msg.Dstatus;
                if (motorD.status == 1) {
                    statusLightD.animations.play('pluggedIn');
                } else if (motorD.status == 2) {
                    statusLightD.animations.play('stalled'); 
                } else if (motorD.status == 0) { //default
                    statusLightD.animations.play('unplugged');
                }
            }
            //=============================================================================
            /* sensor 1 status */
            var msg = { status1 : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.P)) { msg.status1 = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.L)) { msg.status1 = 1; }
            if (sensor1.status == msg.status1) {
            } else {
                sensor1.status = msg.status1;
                if (sensor1.status == 1) {
                    statusLight1.animations.play('pluggedIn');
                } else if (sensor1.status == 0) { //default
                    statusLight1.animations.play('unplugged');
                }
            }
            /* sensor 2 status */
            var msg = { status2 : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.O)) { msg.status2 = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.K)) { msg.status2 = 1; }
            if (sensor2.status == msg.status2) {
            } else {
                sensor2.status = msg.status2;
                if (sensor2.status == 1) {
                    statusLight2.animations.play('pluggedIn');
                } else if (sensor2.status == 0) { //default
                    statusLight2.animations.play('unplugged');
                }
            }
            /* sensor 3 status */
            var msg = { status3 : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.I)) { msg.status3 = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.J)) { msg.status3 = 1; }
            if (sensor3.status == msg.status3) {
            } else {
                sensor3.status = msg.status3;
                if (sensor3.status == 1) {
                    statusLight3.animations.play('pluggedIn');
                } else if (sensor3.status == 0) { //default
                    statusLight3.animations.play('unplugged');
                }
            }
            /* sensor 4 status */
            var msg = { status4 : 0 }
            if (game.input.keyboard.isDown(Phaser.Keyboard.U)) { msg.status4 = 0; }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.H)) { msg.status4 = 1; }    
            if (sensor4.status == msg.status4) {
            } else {
                sensor4.status = msg.status4;
                if (sensor4.status == 1) {
                    statusLight4.animations.play('pluggedIn');
                } else if (sensor4.status == 0) { //default
                    statusLight4.animations.play('unplugged');
                }
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

            if (dashboardStatus == 1) { // i.e., dashboard has started
                var multiplier = 50; // THIS NUMBER IS JUST A PLACEHOLDER
                if (powerA > 0) {
                    if (directionA == 1) { // i.e. direction is forward
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

            if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {       
                game.world.remove(touch.touchCountDisplay);
                touchCount++;
                touchCountDisplay = touchCount;
                touch.touchCountDisplay =  game.add.text(410, 155, touchCountDisplay, labelStyle3);
                touchIndicator.animations.play('pressed');
                // THE TOUCH COUNT COUNTS THE FRACTIONS OF A SECOND THE BUTTON IS HELD DOWN, NOT HOW MANY TIMES IT'S BEEN PRESSED
                // This is at the rate that the Update function runs: about 20 times per second
            } else {
                touchIndicator.animations.play('up');
            }

            //=============================================================================
            /* IR Sensor */

            if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                game.world.remove(IR.IRDistDisplay);
                IRDist = IRDist + 0.01; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
                IRDistDisplay = IRDist;
                IR.IRDistDisplay = game.add.text(533, 155, IRDistDisplay.toFixed(2), labelStyle3);
            }
            if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                game.world.remove(IR.IRDistDisplay);
                IRDist = IRDist - 0.01; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
                IRDistDisplay = IRDist;
                IR.IRDistDisplay = game.add.text(533, 155, IRDistDisplay.toFixed(2), labelStyle3);
            }

            //=============================================================================
            /* Ultrasonic Sensor */

            if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                game.world.remove(ultrasonic.ultrasonicDistDisplay);
                ultrasonicDist = ultrasonicDist + 0.1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
                ultrasonicDistDisplay = ultrasonicDist;
                ultrasonic.ultrasonicDistDisplay = game.add.text(722, 155, ultrasonicDistDisplay.toFixed(1), labelStyle3);
            }
            if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                game.world.remove(ultrasonic.ultrasonicDistDisplay);
                ultrasonicDist = ultrasonicDist - 0.1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
                ultrasonicDistDisplay = ultrasonicDist;
                ultrasonic.ultrasonicDistDisplay = game.add.text(722, 155, ultrasonicDistDisplay.toFixed(1), labelStyle3);
            }

            //=============================================================================
            /* Color Sensor */
            if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                game.world.remove(color.colorRDisplay);
                game.world.remove(color.colorGDisplay);
                game.world.remove(color.colorBDisplay);
                //game.world.remove(color.colorValueDisplay);
                if (colorR <= 255) {    
                    colorR = colorR + 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
                    colorG = colorG + 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
                    colorB = colorB + 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
                    //colorValue = colorValue + 0.01;
                    colorRDisplay = colorR;
                    colorGDisplay = colorG;
                    colorBDisplay = colorB;
                    //colorValueDisplay = colorValue;
                    color.colorRDisplay = game.add.text(470, 93, Math.round(colorRDisplay), {font: "16px Arial", fill: "red"});
                    color.colorGDisplay = game.add.text(546, 93, Math.round(colorGDisplay), {font: "16px Arial", fill: "green"});
                    color.colorBDisplay = game.add.text(619, 93, Math.round(colorBDisplay), {font: "16px Arial", fill: "blue"});
                }
                else {
                    color.colorRDisplay = game.add.text(470, 93, "255", {font: "16px Arial", fill: "red"});
                    color.colorGDisplay = game.add.text(546, 93, "255", {font: "16px Arial", fill: "green"});
                    color.colorBDisplay = game.add.text(619, 93, "255", {font: "16px Arial", fill: "blue"});
                }
                //color.colorValueDisplay = game.add.text(619, 93, Math.round(colorValueDisplay), labelStyle3);
            }
            if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                game.world.remove(color.colorRDisplay);
                game.world.remove(color.colorGDisplay);
                game.world.remove(color.colorBDisplay);
                //game.world.remove(color.colorValueDisplay);
                if (colorR >= 0) {
                    colorRDisplay = colorR = colorR - 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
                    colorGDisplay = colorG = colorG - 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
                    colorBDisplay = colorB = colorB - 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
                    //colorValueDisplay = colorValue = colorValue + 0.01;
                    color.colorRDisplay = game.add.text(470, 93, Math.round(colorRDisplay), {font: "16px Arial", fill: "red"});
                    color.colorGDisplay = game.add.text(546, 93, Math.round(colorGDisplay), {font: "16px Arial", fill: "green"});
                    color.colorBDisplay = game.add.text(619, 93, Math.round(colorBDisplay), {font: "16px Arial", fill: "blue"});
                    //color.colorValueDisplay = game.add.text(619, 93, Math.round(colorValueDisplay), labelStyle3);
                }
                else {
                    color.colorRDisplay = game.add.text(470, 93, "0", {font: "16px Arial", fill: "red"});
                    color.colorGDisplay = game.add.text(546, 93, "0", {font: "16px Arial", fill: "green"});
                    color.colorBDisplay = game.add.text(619, 93, "0", {font: "16px Arial", fill: "blue"});
                }
            }

            // WE MIGHT WANT TO STRUCTURE THIS LOGIC A LITTLE MORE NEATLY...
            if (game.input.keyboard.isDown(Phaser.Keyboard.Y)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "Yellow"
                color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3); //(colorR, colorG, colorB));
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "White"
                color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.B)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "Black"
                color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "Blue"
                color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.R)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "Red"
                color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.G)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "Green"
                color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.O)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "Orange"
                color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.P)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "Purple"
                color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
            }


            //=============================================================================
            /* Battery Level Sensor */
            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                if (batteryLevel <= 0.15) { // for almost-dead battery!
                    if(batteryLevel > 0) { //lower boundary limit
                        batteryLevel = batteryLevel - 0.01;
                        batteryLevelFill.destroy();
                        batteryLevelFill = game.add.graphics(0,0);
                        batteryLevelFill.beginFill(0xFF0000, 1); // make the fill red!
                        batteryLevelFill.drawRect(310, 92, Math.round(batteryLevel*100), 16);
                    }
                }
                else if (batteryLevel <= 1) { //upper boundary limit
                    if(batteryLevel > 0.1) { //lower boundary limit
                        batteryLevel = batteryLevel - 0.01;
                        batteryLevelFill.destroy();
                        batteryLevelFill = game.add.graphics(0,0);
                        batteryLevelFill.beginFill(0x808080, 1);
                        batteryLevelFill.drawRect(310, 92, Math.round(batteryLevel*100), 16);
                    }
                }
            }
            if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                if (batteryLevel < 0.15) { // for almost-dead battery!
                    if(batteryLevel >= -0.001) { //lower boundary limit, with a little safety padding
                        batteryLevel = batteryLevel + 0.01;
                        batteryLevelFill.destroy();
                        batteryLevelFill = game.add.graphics(0,0);
                        batteryLevelFill.beginFill(0xFF0000, 1); // make the fill red!
                        batteryLevelFill.drawRect(310, 92, Math.round(batteryLevel*100), 16);
                    }
                }
                else if (batteryLevel < 1) { //upper boundary limit
                    if(batteryLevel >= -0.001) { //lower boundary limit, with al little safety padding
                        batteryLevel = batteryLevel + 0.01;
                        batteryLevelFill.destroy();
                        batteryLevelFill = game.add.graphics(0,0);
                        batteryLevelFill.beginFill(0x808080, 1);
                        batteryLevelFill.drawRect(310, 92, Math.round(batteryLevel*100), 16);
                    }
                }
            }
            
            //=============================================================================
            /* LCD Screen */

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

