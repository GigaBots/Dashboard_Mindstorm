require.config({
    baseUrl: 'js',
        // set baseURL to 'js' when bbclient.min.js is in the folder entitled 'js' along with main.js, phaser.min.js, and require.js
    paths: {
        "BrowserBigBangClient": "http://thegigabots.app.bigbang.io/client/js/bbclient.min",
        "BigBangClient": "http://thegigabots.app.bigbang.io/client/js/bbclient.min"
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
           })
        }
        else {
            console.log("CONNECT FAILURE.");
        }
    });

    

    function beginGame(client, channel) {
        /* === Dashboard control panel stuff === */
        var game = new Phaser.Game(960, 710, Phaser.AUTO, "gameWorld", { // 960 x 700 fits alright horizontally on an iPhone 4 and an iPad 
            preload: preload, //Since this is likely the small phone screen anyone would be using, it's important to consider, since we currently have the issue of not scrolling about the Phaser game world window
            create: create,
            update: update,
            //render: render,
            //paused: paused,
            //destroy: destroy
        });

        var gameBoundX = 960, gameBoundY = 710;
        var bbLogo, botLogo, dashboardTitle, allRightsReserved;

        var labelStyle = { font: "12px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc" }
        var labelStyle2 = { font: "20px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc" }        
        var labelStyle3 = { font: "16px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc"}
        var labelStyle4 = { font: "14px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc", fontWeight: "italic" }
        var labelStyle5 = { font: "20px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#414242" } 
        var messageStyle = { font: "14px Lucida Console, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#080808"}   
        var frameLineColor = 0xa3a3a3, frameFill = 0x313233, frameOpacity = 0.65;
        var backgound, uiBackground, backgroundBox, backgroundBottom, titleBox, titleBarLine, bottomLine;

        var dragBoxButton;

        // positions of different units are the upper left x & y coordinates of their frames

        /* Motor and sensor statuses */
        var frameMotorStatus, labelMotorStatus = "Motors";
        var positionMotorStatus = { x : 541, y : 66 }
        var frameSensorStatus, labelSensorStatus = "Sensors";
        var positionSensorStatus = { x : 681, y : 66}        
        var labelMotorStatus;
        var labelMotors = { a : "A", b : "B", c : "C", d : "D" }
        var labelSensors = { e : "1", f : "2", g : "3", h : "4" }
        var statusMotorA, statusMotorB, statusMotorC, statusMotorD, statusSensor1,statusSensor2, statusSensor3, statusSensor4;
        var statusLightA, statusLightB, statusLightC, statusLightD, statusLight1, statusLight2, statusLight3, statusLight4;

        /* Play/stop button and status */
        var dashboardStatus = 1; // 1 = 'running/resumed', 0 = 'stopped/paused'
        var statusButton;
        var frameStatus;
        var positionStatus = { x : 15, y : 66 }
        var labelStatus, statusDisplay = "running..."; // initially running
        var status = {
            statusDisplay : "running..."
        }
        var resume = {
            messageDisplay : 0,
            resumeOverlay : 0
        }

        /* Bot selector */
        var frameBotSelector;
        var positionBotSelector = { x : 97, y : 66 }
        var labelBotSelector = "Robot";
        var labelBot;
        var checkboxBot;
        var robotNumber = 1;
       
        /* Individual motor controls and feedback */
        var frameMotor;
        var positionMotorA = { x : 15, y : 226 }
        var positionMotorB = { x : 295, y : 226 }
        var positionMotorC = { x : 15, y : 436 }
        var positionMotorD = { x : 295, y : 436 }
        var labelMotor = { a : "Motor A", b : "Motor B", c : "Motor C", d : "Motor D"}

        /* Forward and reverse */
        var fButton;
        var rButton;
        var directionA = 1, directionB = 1, directionC = 1, directionD = 1, directionG1 = 1, directionG2 = 1; // forward = 1, reverse = -1

        /* Speed */
        var sliderLabel;
        var sliderBarA, sliderBarB, sliderBarC, sliderBarD, sliderBarG1, sliderBarG2;
        var sliderBarState = { a: "up", b: "up", c: "up", d: "up", g1: "up", g2: "up" }
        var sliderTrackA, sliderTrackB, sliderTrackC, sliderTrackD, sliderTrackG1, sliderTrackG2;
        var minusButtonA, minusButtonB, minusButtonC, minusButtonD, minusButtonG1, minusButtonG2;
        var plusButtonA, plusButtonB, plusButtonC, plusButtonD, plusButtonG1, plusButtonG2;
        var speed;
        var speedRange = [0, 100, 200, 300, 400, 500, 600, 700];

        /* Rotational position */    
        var labelRotation = "Motor Rotational Positions";
        var dialA, dialB, dialC, dialD;
        var labelDial = { a : "Motor A", b : "Motor B", c : "Motor C", d : "Motor D" }
        var needleA, needleB, needleC, needleD;
        var frameDials;
        var positionDial = { x : 674, y : 136 }
        var t1 = { a : 0, b : 0, c : 0, d : 0 }

        /* Ganging motors together */
        var frameMotorGanging, frameMotorGang1, frameMotorGang2;
        var labelMotorGang;
        var positionGang = { x : 970, y : 66 }
        var positionGang1 = { x : 575, y: 226 } 
        var positionGang2 = { x : 575, y: 436 } 
        var checkbox;
        var fGangButton, rGangButton;

        var motorA = {
            port: 'a',
            status : 1,
            speed : 0,
            position : 0,
            gang: 0, // 0 = not ganged with other motors, 1 = joined in gang 1, or 2 = joined in gang 2
            stalled: false,
            previousSpeed : 0
        }
        var motorB = {
            port: 'b',
            status : 1,
            speed : 0,
            position : 0,
            gang: 0,
            stalled: false,
            previousSpeed : 0
        }
        var motorC = {
            port: 'c',
            status : 1,
            speed : 0,
            position : 0,
            gang: 0,
            stalled: false,
            previousSpeed : 0
        }
        var motorD = {
            port: 'd',
            status : 1,
            speed : 0,
            position : 0,
            gang: 0,
            stalled: false,
            previousSpeed : 0
        }
        var gang1 = {
            speed : 0,
            a : false, //initially motor A is not in any gang
            b : false,
            c : false,
            d : false,
            previousSpeed : 0
        }
        var gang2 = {
            speed : 0,
            a : false, //initially motor A is not in any gang
            b : false,
            c : false,
            d : false,
            previousSpeed : 0
        }

        /* Sensors */
        var sensor1 = {
            status : 0, //0 = unplugged, 1 = plugged-in // 2 for initial setting
        }
        var sensor2 = {
            status : 0, //0 = unplugged, 1 = plugged-in // 2 for initial setting
        }
        var sensor3 = {
            status : 0, //0 = unplugged, 1 = plugged-in // 2 for initial setting
        }
        var sensor4 = {
            status : 0, //0 = unplugged, 1 = plugged-in // 2 for initial setting
        }

        /* Touch sensor */
        var press = 0; // 0 = not pressed, 1 = pressed
        var touchCount = 0, bumpCount = 0; //count total touches or bumps
        var touch = {
         touchCountDisplay : 0 //display number of total presses
        }
        var bump = {
         bumpCountDisplay : 0 //display number of total presses
        }
        var frameTouch;
        var positionTouch = { x : 443, y : 136 }
        var labelTouch = "Touch Sensor", labelTouched = "Touched", labelTouchCount = "Total Touches: ", labelBumpCount = "Total Bumps: ";
        var touchIndicator;

        /* IR sensor */
        var frameIR;
        var positionIR = { x : 217, y : 66 }
        var labelIR = "Infrared Sensor", labelIRDist = "Distance: ", labelIRUnits = "cm";
        var IRDist = 0; // THIS IS A PLACEHOLDER FOR NOW!
        var IR = {
            IRDistDisplay : 0
        }

        /* Color sensor */
        var frameColor;
        var positionColor = { x : 217, y : 136 }
        var labelColor = "Color Sensor", labelColorR = "Red: ", labelColorB = "Blue: ", labelColorG = "Green: ", labelColorValue = "RGB: ", labelColorName = "Color: ", labelIntensity = "Light Intensity: ";
        var colorR = 255, colorG = 255, colorB = 255, colorValue = 100000, colorName = "White", lightIntensity = 0; //THESE ARE PLACEHOLDERS FOR NOW
        var color = {
            colorRDisplay : 0,
            colorGDisplay : 0,
            colorBDisplay : 0,
            colorValueDisplay : 0,
            colorNameDisplay : 0,
            lightIntensity : 0
        }

        /* Ultrasonic sensor */
        var frameUltrasonic;
        var positionUltrasonic = { x : 379, y : 66 }
        var labelUltrasonic = "Ultrasonic Sensor", labelUltrasonicDist = "Distance: ", labelUltrasonicUnits = "cm";
        var ultrasonicDist = 0; // THIS IS A PLACEHOLDER FOR NOW!
        var ultrasonic = {
            ultrasonicDistDisplay : 0
        }

        /* Battery level sensor */
        var frameBattery;
        var positionBattery = { x : 821, y : 66 }
        var labelBattery = "Battery Level";
        var batteryLevel = 1; //initialize the level at 100% (or, 1);
        var batteryLevelBox, batteryLevelFill, batteryShape;

        /* LCD Screen */
        var frameScreen, LCDScreenBox;
        var positionScreen = { x : 15, y : 126 }
        var labelScreen = "LCD Screen";
        var screenMessage = {
            messageDisplay1 : "Hello GigaBot!", // this is a placeholder
            messageDisplay2 : "",
            messageDisplay3 : ""
        }

        /* === Text editor stuff === */
        var userType;
        var userNum;
        var theirCode;
        var codeError;
        var clicked = false;
        var cursorOverEditor;

        //===================================================

        channel.channelData.onValue(function (key, val) {
            //console.log("Add:" + key +"->"+JSON.stringify(val) );
            if( key === 'a' ||  key ==='b' || key ==='c' || key === 'd') {
                setMotorInfo(key, val);
            }
            else if ( key === 'touchSensor') {
                setTouchSensor(val);
            }
            else if ( key === 'power') {
                setBatterySensor(val);
            }
            else if ( key === 'distance') {
                setUltrasonicSensor(val);
            }

        }, function (key, val) {
            //console.log("Update:" + key +"->"+JSON.stringify(val));
            if( key === 'a' ||  key ==='b' || key ==='c' || key === 'd') {
                setMotorInfo(key, val);
            }
            else if ( key === 'touchSensor') {
                setTouchSensor(val);
            }
            else if ( key === 'power') {
                setBatterySensor(val);
            }
            else if ( key === 'distance') {
                setUltrasonicSensor(val);
            }

        }, function (key) {
            //console.log("Delete:" + key);
        });


        //quick and dirty for now
        function setMotorInfo( key, val ) {
            if( key === 'a') {
                motorA.status =1;
                //if ( typeof(needleA) !== "undefined" ) {
                    needleA.angle = val.position; // THE ERROR WE GET HERE IS BECAUSE THE NEEDLE VARIABLES DON'T GET THEIR SPRITES UNTIL LATER
                //}
                if ( val.moving ) { // WE SHOULD ADDRESS THIS ERROR AFTER WE GET OTHER THINGS WORKING AND THEN START USING A NEEDLE OBJECT, WE MIGHT HAVE TO DO SOME REARRANGING
                    motorA.status =1;
                    //if ( typeof (statusLightA) !== "undefined" ) {
                        statusLightA.animations.play('pluggedIn');
                    //}
                }
                else if ( val.stalled ) {
                    motorA.status =2;
                    //if ( typeof (statusLightA) !== "undefined" ) {
                        statusLightA.animations.play('stalled');
                    //}
                } 
                else {
                    motorA.status =0;
                    //if ( typeof (statusLightA) !== "undefined" ) {
                        statusLightA.animations.play('unplugged');
                    //}
                } 
                // is there a way to handle simply whether or not there is a motor plugged into a port?
                    //we want to be able to have motorA.status == 0 and statusLightA.animations.play('unplugged') when there is not a motor plugged into port A, for example
            }
            else if (key === 'b') {
                motorB.status =1;
                needleB.angle = val.position;
                if( !val.stalled ) {
                    statusLightB.animations.play('pluggedIn');
                } else {
                    motorB.status =2;
                    statusLightB.animations.play('stalled');
                }
            }
            else if( key === 'c') {
                motorC.status =1;
                needleC.angle = val.position;
                if( !val.stalled ) {
                    statusLightC.animations.play('pluggedIn');
                } else {
                    motorC.status =2;
                    statusLightC.animations.play('stalled');
                }
            }
            else if( key === 'd')  {
                motorD.status =1;
                needleD.angle = val.position; // in update function now
                if( !val.stalled ) {
                    statusLightD.animations.play('pluggedIn');
                } else {
                    motorD.status =2;
                    statusLightD.animations.play('stalled');
                }
            }
        }

        function setTouchSensor( val ) {
            //console.log("touchSensor " + JSON.stringify(val));
            if( val.touched ) {
                touchIndicator.animations.play('pressed');
                game.world.remove(touch.touchCountDisplay);
                touchCount++;
                touchCountDisplay = touchCount;
                touch.touchCountDisplay = game.add.text(positionTouch.x+179, positionTouch.y+22, touchCountDisplay, labelStyle3);
            }
            else {
                touchIndicator.animations.play('up');
            }
        }

        function setBatterySensor( val ) {
            batteryLevel = (val.voltage - 5) / (9 - 5); //9 V battery (6 AAs), and the robot dies around 5V
            if (batteryLevel <= 0.15) { // for almost-dead battery!
                if(batteryLevel > -0.01) { //lower boundary limit, with a little safety net for inaccuracy/error
                    batteryLevelFill.destroy();
                    batteryLevelFill = game.add.graphics(0,0);
                    batteryLevelFill.beginFill(0xFF0000, 1); // make the fill red!
                    batteryLevelFill.drawRect(positionBattery.x+11, positionBattery.y+32, Math.round(batteryLevel*100), 16);
                }
            }
            else if (batteryLevel <= 1.01) { //upper boundary limit, with a little safety net for inaccuracy/error
                if(batteryLevel > 0.1) { //lower boundary limit
                    batteryLevelFill.destroy();
                    batteryLevelFill = game.add.graphics(0,0);
                    batteryLevelFill.beginFill(0x808080, 1); // make fill grey
                    batteryLevelFill.drawRect(positionBattery.x+11, positionBattery.y+32, Math.round(batteryLevel*100), 16);
                }
            }
        }

        function setUltrasonicSensor( val ) {
            ultrasonicDist = val.distance;
            game.world.remove(ultrasonic.ultrasonicDistDisplay);
            ultrasonicDistDisplay = ultrasonicDist;
            ultrasonic.ultrasonicDistDisplay = game.add.text(positionUltrasonic.x+71, positionUltrasonic.y+22, ultrasonicDistDisplay.toFixed(1), labelStyle3);
        }

    //==============================================================================================================================
        function preload() {
            game.load.spritesheet('statusLight', 'assets/gigabot_dashboard_status_lights_spritesheet.png', 14, 14);
            game.load.spritesheet('forwardButton','assets/buttons/gigabot_dashboard_button_forward_spritesheet.png', 97, 49);
            game.load.spritesheet('reverseButton','assets/buttons/gigabot_dashboard_button_reverse_spritesheet.png', 97, 49);
            game.load.spritesheet('checkbox','assets/buttons/gigabot_dashboard_checkbox_spritesheet.png', 21, 21);
            game.load.spritesheet('minusButton','assets/buttons/gigabot_dashboard_button_minus_spritesheet.png', 44, 44);
            game.load.spritesheet('plusButton','assets/buttons/gigabot_dashboard_button_plus_spritesheet.png', 44, 44);
            game.load.spritesheet('touchIndicator','assets/gigabot_dashboard_touch_sensor_spritesheet.png', 21, 21);
            game.load.image('sliderBar','assets/gigabot_dashboard_slider_bar.png', 65, 13);
            game.load.image('sliderBar2','assets/gigabot_dashboard_slider_bar_2.png', 65, 13);
            game.load.image('needle','assets/gigabot_dashboard_needle.png', 5, 26);
            game.load.image('dialFace', 'assets/gigabot_dashboard_dial_face.png', 52, 52);
            game.load.image('screenInputButton', 'assets/buttons/gigabot_dashboard_button_lcd_screen_input.png', 43, 22);
            game.load.image('gigabotSm', 'assets/gigabots_logo_colors_sm.png', 48, 48);
            game.load.image('dragButton','assets/buttons/gigabot_dashboard_drag_button.png', 24, 14);
            game.load.image('title','assets/gigabot_dashboard_title_4.png', 400, 50);
            game.load.image('poweredBy','assets/powered_by_big_bang.png', 205, 50);
            game.load.image('uiBackground','assets/ui_background.gif',960,659);
            game.load.spritesheet('statusButton','assets/buttons/gigabot_dashboard_button_status_spritesheet.png', 63,25);
            game.load.image('resume','assets/resume_message.png',502,49);
        } //end preload

    //==============================================================================================================================
        function create() {
            //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
            this.game.stage.disableVisibilityChange = true;    

            game.world.setBounds(0, 0, gameBoundX, gameBoundY);
            game.input.onDown.add(function () {
                if ( this.game.paused ) {
                    this.game.paused = false;
                    dashboardStatus = 1;
                    game.world.remove(status.statusDisplay);
                    labelStatusDisplay = "running...";
                    status.statusDisplay = game.add.text(positionStatus.x+9, positionStatus.y+30, labelStatusDisplay, labelStyle);
                    statusButton.setFrames(1,0,0,0);
                    resume.resumeMessageDisplay.destroy();
                    resume.resumeOverlay.destroy();
                }
            }, this);

        /* Background/canvas stuff */
            game.stage.backgroundColor = '#C8C8C8';
            titleBox = game.add.graphics(0,0);
            titleBox.beginFill(0xFFFFFF,1);
            titleBox.drawRect(0,0,960,60);

            titleBarLine = game.add.graphics(0,0);
            titleBarLine.beginFill(frameLineColor,1);
            titleBarLine.drawRect(0,50,960,1);

            uiBackground = game.add.sprite(0,51,'uiBackground');
            
            backgroundBox = game.add.graphics(0,0);
            backgroundBox.beginFill(0x313233,0.05); // opacity
            backgroundBox.drawRect(0,51,960,659); // 710 - 51 = 659

            bottomLine = game.add.graphics(0,0);
            bottomLine.beginFill(0x313233,1);
            bottomLine.drawRect(0,650,960,1);

            backgroundBottom = game.add.graphics(0,0);
            backgroundBottom.beginFill(0x1f1f1f,1);
            backgroundBottom.drawRect(0,651,960, 73);

        /* Title */
            dashboardTitle = game.add.sprite(75,0,'title');
            botLogo = game.add.sprite(15,1,'gigabotSm');
            poweredBy = game.add.sprite(740,0,'poweredBy');
            allRightsReserved = game.add.text(15, 670, "All Rights Reserved, TheGigabots.com", labelStyle);

        /* Frames */
            frameMotorStatus = game.add.graphics(0,0);
            frameMotorStatus.lineStyle(1, frameLineColor, 1);
            frameMotorStatus.beginFill(frameFill,frameOpacity);
            frameMotorStatus.drawRect(positionMotorStatus.x, positionMotorStatus.y, 130, 60);

            frameSensorStatus = game.add.graphics(0,0);
            frameSensorStatus.lineStyle(1, frameLineColor, 1);
            frameSensorStatus.beginFill(frameFill,frameOpacity);
            frameSensorStatus.drawRect(positionSensorStatus.x, positionSensorStatus.y, 130, 60);

            frameStatus = game.add.graphics(0,0);
            frameStatus.lineStyle(1, frameLineColor, 1);
            frameStatus.beginFill(frameFill,frameOpacity);
            frameStatus.drawRect(positionStatus.x, positionStatus.y, 72, 50);

            frameBotSelector = game.add.graphics(0,0);
            frameBotSelector.lineStyle(1, frameLineColor, 1);
            frameBotSelector.beginFill(frameFill,frameOpacity);
            frameBotSelector.drawRect(positionBotSelector.x, positionBotSelector.y, 110, 50);

            frameMotor = {
                a : game.add.graphics(0,0),
                b : game.add.graphics(0,0),
                c : game.add.graphics(0,0),
                d : game.add.graphics(0,0),
            }

            frameMotor.a.lineStyle(1, frameLineColor, 1);
            frameMotor.a.beginFill(frameFill,frameOpacity);
            frameMotor.a.drawRect(positionMotorA.x, positionMotorA.y, 270, 200);

            frameMotor.b.lineStyle(1, frameLineColor, 1);
            frameMotor.b.beginFill(frameFill,frameOpacity);
            frameMotor.b.drawRect(positionMotorB.x, positionMotorB.y, 270, 200);

            frameMotor.c.lineStyle(1, frameLineColor, 1);
            frameMotor.c.beginFill(frameFill,frameOpacity);
            frameMotor.c.drawRect(positionMotorC.x, positionMotorC.y, 270, 200);

            frameMotor.d.lineStyle(1, frameLineColor, 1);
            frameMotor.d.beginFill(frameFill,frameOpacity);
            frameMotor.d.drawRect(positionMotorD.x, positionMotorD.y, 270, 200);

            frameTouch = game.add.graphics(0,0);
            frameTouch.lineStyle(1, frameLineColor, 1);
            frameTouch.beginFill(frameFill,frameOpacity);
            frameTouch.drawRect(positionTouch.x, positionTouch.y, 221, 80);

            frameIR = game.add.graphics(0,0);
            frameIR.lineStyle(1, frameLineColor, 1);
            frameIR.beginFill(frameFill,frameOpacity);
            frameIR.drawRect(positionIR.x, positionIR.y, 152, 60);

            frameUltrasonic = game.add.graphics(0,0);
            frameUltrasonic.lineStyle(1, frameLineColor, 1);
            frameUltrasonic.beginFill(frameFill,frameOpacity);
            frameUltrasonic.drawRect(positionUltrasonic.x, positionUltrasonic.y, 152, 60);

            frameColor = game.add.graphics(0,0);
            frameColor.lineStyle(1, frameLineColor, 1);
            frameColor.beginFill(frameFill,frameOpacity);
            frameColor.drawRect(positionColor.x, positionColor.y, 216, 80);

            frameBattery = game.add.graphics(0,0);
            frameBattery.lineStyle(1, frameLineColor, 1);
            frameBattery.beginFill(frameFill,frameOpacity);
            frameBattery.drawRect(positionBattery.x, positionBattery.y, 124, 60);

            frameScreen = game.add.graphics(0,0);
            frameScreen.lineStyle(1, frameLineColor, 1);
            frameScreen.beginFill(frameFill,frameOpacity);
            frameScreen.drawRect(positionScreen.x, positionScreen.y, 192, 90);

            frameMotorGang1 = game.add.graphics(0,0);
            frameMotorGang1.lineStyle(1, frameLineColor, 1);
            frameMotorGang1.beginFill(frameFill,frameOpacity);
            frameMotorGang1.drawRect(positionGang1.x, positionGang1.y, 370, 200);

            frameMotorGang2 = game.add.graphics(0,0);
            frameMotorGang2.lineStyle(1, frameLineColor, 1);
            frameMotorGang2.beginFill(frameFill,frameOpacity);
            frameMotorGang2.drawRect(positionGang2.x, positionGang2.y, 370, 200);

            frameDials = game.add.graphics(0,0);
            frameDials.lineStyle(1, frameLineColor, 1);
            frameDials.beginFill(frameFill,frameOpacity);
            frameDials.drawRect(positionDial.x, positionDial.y, 271, 80);

        /* Labels */
            labelMotorStatus = game.add.text(positionMotorStatus.x+37, positionMotorStatus.y+2, labelMotorStatus, labelStyle3); //label at top of box indicating status of motor ports
            labelA = game.add.text(positionMotorStatus.x+14, positionMotorStatus.y+39, labelMotors.a, labelStyle);
            labelB = game.add.text(positionMotorStatus.x+44, positionMotorStatus.y+39, labelMotors.b, labelStyle);
            labelC = game.add.text(positionMotorStatus.x+74, positionMotorStatus.y+39, labelMotors.c, labelStyle);
            labelD = game.add.text(positionMotorStatus.x+104, positionMotorStatus.y+39, labelMotors.d, labelStyle);

            labelSensorStatus = game.add.text(positionSensorStatus.x+33, positionSensorStatus.y+2, labelSensorStatus, labelStyle3); //label at top of box indicating status of motor ports
            label1 = game.add.text(positionSensorStatus.x+15, positionSensorStatus.y+39, labelSensors.e, labelStyle);
            label2 = game.add.text(positionSensorStatus.x+45, positionSensorStatus.y+39, labelSensors.f, labelStyle);
            label3 = game.add.text(positionSensorStatus.x+75, positionSensorStatus.y+39, labelSensors.g, labelStyle);
            label4 = game.add.text(positionSensorStatus.x+105, positionSensorStatus.y+39, labelSensors.h, labelStyle);

            status.statusDisplay =  game.add.text(positionStatus.x+9, positionStatus.y+30, statusDisplay, labelStyle);
            
            labelBotSelector = game.add.text(positionBotSelector.x+30, positionBotSelector.y+2, labelBotSelector, labelStyle3);
            labelBot = {
                bot1 : game.add.text(positionBotSelector.x+28, positionBotSelector.y+26, "1", labelStyle),
                bot2 : game.add.text(positionBotSelector.x+62, positionBotSelector.y+26, "2", labelStyle),
                bot3 : game.add.text(positionBotSelector.x+96, positionBotSelector.y+26, "3", labelStyle)
            }

            labelMotor.a = game.add.text(positionMotorA.x+10, positionMotorA.y+2, labelMotor.a, labelStyle2);
            labelMotor.b = game.add.text(positionMotorB.x+10, positionMotorB.y+2, labelMotor.b, labelStyle2);
            labelMotor.c = game.add.text(positionMotorC.x+10, positionMotorC.y+2, labelMotor.c, labelStyle2);
            labelMotor.d = game.add.text(positionMotorD.x+10, positionMotorD.y+2, labelMotor.d, labelStyle2);

            labelTouch = game.add.text(positionTouch.x+10, positionTouch.y+2, labelTouch, labelStyle3);
            labelTouched = game.add.text(positionTouch.x+10, positionTouch.y+25, labelTouched, labelStyle);
            labelTouchCount = game.add.text(positionTouch.x+94, positionTouch.y+25, labelTouchCount, labelStyle); // there is room for 4 characters, so 0 to 9,999. No touching more than that!
            labelBumpCount = game.add.text(positionTouch.x+10, positionTouch.y+50, labelBumpCount, labelStyle);

            labelIR = game.add.text(positionIR.x+10, positionIR.y+2, labelIR, labelStyle3);
            labelIRDist = game.add.text(positionIR.x+10, positionIR.y+25, labelIRDist, labelStyle);
            labelIRUnits = game.add.text(positionIR.x+118, positionIR.y+25, labelIRUnits, labelStyle);

            labelUltrasonic = game.add.text(positionUltrasonic.x+10, positionUltrasonic.y+2, labelUltrasonic, labelStyle3);
            labelUltrasonicDist = game.add.text(positionUltrasonic.x+10, positionUltrasonic.y+25, labelUltrasonicDist, labelStyle);
            labelUltrasonicUnits = game.add.text(positionUltrasonic.x+118, positionUltrasonic.y+25, labelUltrasonicUnits, labelStyle);

            labelColor = game.add.text(positionColor.x+10, positionColor.y+2, labelColor, labelStyle3);
            labelColorValue = game.add.text(positionColor.x+10, positionColor.y+25, labelColorValue, labelStyle);
            labelColorName = game.add.text(positionColor.x+106, positionColor.y+25, labelColorName, labelStyle);
            labelIntensity = game.add.text(positionColor.x+10, positionColor.y+50, labelIntensity, labelStyle);

            labelBattery = game.add.text(positionBattery.x+10, positionBattery.y+2, labelBattery, labelStyle3);
            
            labelScreen = game.add.text(positionScreen.x+10, positionScreen.y+2, labelScreen, labelStyle3);

            /* Ganging motors together */
            labelMotorGang = {
                // g1 : game.add.text(positionGang.x+10, positionGang.y+5, "Motor Gang 1", labelStyle3), // gang 1
                // g2 : game.add.text(positionGang.x+115, positionGang.y+5, "Motor Gang 2", labelStyle3), // gang 2
                a1 : game.add.text(positionGang1.x+38, positionGang1.y+33, "Motor A", labelStyle), // motor A in gang 1
                a2 : game.add.text(positionGang2.x+38, positionGang2.y+33, "Motor A", labelStyle), //motor A in gang 2
                b1 : game.add.text(positionGang1.x+38, positionGang1.y+75, "Motor B", labelStyle), 
                b2 : game.add.text(positionGang2.x+38, positionGang2.y+75, "Motor B", labelStyle), 
                c1 : game.add.text(positionGang1.x+38, positionGang1.y+117, "Motor C", labelStyle), 
                c2 : game.add.text(positionGang2.x+38, positionGang2.y+117, "Motor C", labelStyle), 
                d1 : game.add.text(positionGang1.x+38, positionGang1.y+159, "Motor D", labelStyle), 
                d2 : game.add.text(positionGang2.x+38, positionGang2.y+159, "Motor D", labelStyle) 
            }

            labelGang1 = game.add.text(positionGang1.x + 10, positionGang1.y + 2, "Motor Gang 1", labelStyle3);
            labelGang2 = game.add.text(positionGang2.x + 10, positionGang2.y + 2, "Motor Gang 2", labelStyle3);


        /* Buttons */
            statusButton = game.add.button(positionStatus.x+5, positionStatus.y+5, 'statusButton', actionStopOnClick);
            statusButton.setFrames(1,0,0,0);
            statusButton.input.useHandCursor = true;

            /* Select which robot to control */  // ======This will probably work for now, until we extend this project later on
            checkboxBot = {
                bot1 : game.add.button(positionBotSelector.x+7, positionBotSelector.y+24, 'checkbox', actionCheckboxBot1, this),
                bot2 : game.add.button(positionBotSelector.x+40, positionBotSelector.y+24, 'checkbox', actionCheckboxBot2, this),
                bot3 : game.add.button(positionBotSelector.x+73, positionBotSelector.y+24, 'checkbox', actionCheckboxBot3, this),
            }
            checkboxBot.bot1.setFrames(1,1,1,0);
            checkboxBot.bot2.setFrames(2,0,1,0);
            checkboxBot.bot3.setFrames(2,0,1,0);
            checkboxBot.bot1.input.useHandCursor = true;
            checkboxBot.bot2.input.useHandCursor = true;
            checkboxBot.bot3.input.useHandCursor = true;
            function actionCheckboxBot1 () {
                if ( robotNumber !== 1 ) {
                    if (robotNumber === 2 ) {
                        checkboxBot.bot2.setFrames(2,0,1,0);
                    } else if ( robotNumber === 3 ) {
                        checkboxBot.bot3.setFrames(2,0,1,0);
                    }
                    robotNumber = 1;
                    checkboxBot.bot1.setFrames(1,1,1,0);
                    console.log("Robot number " + robotNumber + " selected");
                }
            }
            function actionCheckboxBot2 () {
                if ( robotNumber !== 2 ) {
                    if (robotNumber === 1 ) {
                        checkboxBot.bot1.setFrames(2,0,1,0);
                    } else if ( robotNumber === 3 ) {
                        checkboxBot.bot3.setFrames(2,0,1,0);
                    }
                    robotNumber = 2;
                    checkboxBot.bot2.setFrames(1,1,1,0);
                    console.log("Robot number " + robotNumber + " selected");
                }
            }
            function actionCheckboxBot3 () {
                if ( robotNumber !== 3 ) {
                    if (robotNumber === 1 ) {
                        checkboxBot.bot1.setFrames(2,0,1,0);
                    } else if ( robotNumber === 2 ) {
                        checkboxBot.bot2.setFrames(2,0,1,0);
                    }
                    robotNumber = 3;
                    checkboxBot.bot3.setFrames(1,1,1,0);
                    console.log("Robot number " + robotNumber + " selected");
                }
            }

            // Forward button object and reverse button object
            fButton = {
                a : game.add.button(positionMotorA.x+10, positionMotorA.y+32, 'forwardButton'),
                b : game.add.button(positionMotorB.x+10, positionMotorB.y+32, 'forwardButton'),
                c : game.add.button(positionMotorC.x+10, positionMotorC.y+32, 'forwardButton'),
                d : game.add.button(positionMotorD.x+10, positionMotorD.y+32, 'forwardButton')                
            }
            rButton = {
                a : game.add.button(positionMotorA.x+10, positionMotorA.y+90, 'reverseButton'),  
                b : game.add.button(positionMotorB.x+10, positionMotorB.y+90, 'reverseButton'),  
                c : game.add.button(positionMotorC.x+10, positionMotorC.y+90, 'reverseButton'),  
                d : game.add.button(positionMotorD.x+10, positionMotorD.y+90, 'reverseButton')
            }

            /* set different frames for buttons out, over, down, and up */
            fButton.a.setFrames(1,0,2,0);
            rButton.a.setFrames(1,0,2,0);
            fButton.b.setFrames(1,0,2,0);
            rButton.b.setFrames(1,0,2,0);
            fButton.c.setFrames(1,0,2,0);
            rButton.c.setFrames(1,0,2,0);
            fButton.d.setFrames(1,0,2,0);
            rButton.d.setFrames(1,0,2,0);

            /* change cursor to a hand when hovering over the buttons */
            fButton.a.input.useHandCursor = true;
            rButton.a.input.useHandCursor = true;
            fButton.b.input.useHandCursor = true;
            rButton.b.input.useHandCursor = true;
            fButton.c.input.useHandCursor = true;
            rButton.c.input.useHandCursor = true;
            fButton.d.input.useHandCursor = true;
            rButton.d.input.useHandCursor = true;

            /* adding forward button events */
            fButton.a.events.onInputDown.add(fButtonDownAction, motorA);
            fButton.a.events.onInputUp.add(fButtonUpAction, motorA);
            fButton.b.events.onInputDown.add(fButtonDownAction, motorB);
            fButton.b.events.onInputUp.add(fButtonUpAction, motorB);
            fButton.c.events.onInputDown.add(fButtonDownAction, motorC);
            fButton.c.events.onInputUp.add(fButtonUpAction, motorC);
            fButton.d.events.onInputDown.add(fButtonDownAction, motorD); 
            fButton.d.events.onInputUp.add(fButtonUpAction, motorD);

            /* adding reverse button events */
            rButton.a.events.onInputDown.add(rButtonDownAction, motorA);
            rButton.a.events.onInputUp.add(rButtonUpAction, motorA);
            rButton.b.events.onInputDown.add(rButtonDownAction, motorB);
            rButton.b.events.onInputUp.add(rButtonUpAction, motorB);
            rButton.c.events.onInputDown.add(rButtonDownAction, motorC);
            rButton.c.events.onInputUp.add(rButtonUpAction, motorC);
            rButton.d.events.onInputDown.add(rButtonDownAction, motorD);
            rButton.d.events.onInputUp.add(rButtonUpAction, motorD);


            // THESE 4 FUNCTIONS SHOULD BE USABLE BY ANY NUMBER OF MOTORS
            /* forward button actions */
            function fButtonDownAction () {
                console.log("onActionDownForward"); 
                moveMotor( this.port, "f", this.speed );
                if ( this.port === 'a' ) {
                    fButton.a.setFrames(2,2,2,2); // show the forward button as down, in case keyboard button inputs were being used instead of clicking
                }
                if ( this.port === 'b' ) {
                    fButton.b.setFrames(2,2,2,2);
                }
                if ( this.port === 'c' ) {
                    fButton.c.setFrames(2,2,2,2); 
                }
                if ( this.port === 'd' ) {
                    fButton.d.setFrames(2,2,2,2); 
                }                
            }
            function fButtonUpAction() {
                console.log("onActionUpForward");
                stopMotor( this.port ); 
                if ( this.port === 'a' ) {
                    fButton.a.setFrames(1,0,2,0); // show the forward button as up (normal position)
                }
                if ( this.port === 'b' ) {
                    fButton.b.setFrames(1,0,2,0); 
                }
                if ( this.port === 'c' ) {
                    fButton.c.setFrames(1,0,2,0);
                }
                if ( this.port === 'd' ) {
                    fButton.d.setFrames(1,0,2,0); 
                } 
            }
            /* reverse buttons actions*/
            function rButtonDownAction () {
                console.log("onActionDownReverse"); 
                moveMotor( this.port, "r", this.speed );
                if ( this.port === 'a' ) {
                    rButton.a.setFrames(2,2,2,2); // show the reverse button as down, in case keyboard button inputs were being used instead of clicking
                }
                if ( this.port === 'b' ) {
                    rButton.b.setFrames(2,2,2,2);
                }
                if ( this.port === 'c' ) {
                    rButton.c.setFrames(2,2,2,2); 
                }
                if ( this.port === 'd' ) {
                    rButton.d.setFrames(2,2,2,2); 
                }  
            }
            function rButtonUpAction() {
                console.log("onActionUpReverse");
                stopMotor( this.port );
                if ( this.port === 'a' ) {
                    rButton.a.setFrames(1,0,2,0); // show the reverse button as up (normal position)
                }
                if ( this.port === 'b' ) {
                    rButton.b.setFrames(1,0,2,0); 
                }
                if ( this.port === 'c' ) {
                    rButton.c.setFrames(1,0,2,0);
                }
                if ( this.port === 'd' ) {
                    rButton.d.setFrames(1,0,2,0); 
                } 
            }


        /* Add keyboard inputs for motor controls, as an alternative when using a desktop */
            
            // add reverse/forward keyboard controls (using A,S,D,&F for forward, and Z,X,C,&V for reverse):
            var fAKey = this.input.keyboard.addKey(Phaser.Keyboard.A);
            fAKey.onDown.add(fButtonDownAction, motorA); // this will move motor A forward
            var fBKey = this.input.keyboard.addKey(Phaser.Keyboard.S);
            fBKey.onDown.add(fButtonDownAction, motorB);
            var fCKey = this.input.keyboard.addKey(Phaser.Keyboard.D);
            fCKey.onDown.add(fButtonDownAction, motorC);
            var fDKey = this.input.keyboard.addKey(Phaser.Keyboard.F);
            fDKey.onDown.add(fButtonDownAction, motorD);

            var rAKey = this.input.keyboard.addKey(Phaser.Keyboard.Z);
            rAKey.onDown.add(rButtonDownAction, motorA); // this will move motor A in reverse
            var rBKey = this.input.keyboard.addKey(Phaser.Keyboard.X);
            rBKey.onDown.add(rButtonDownAction, motorB);
            var rCKey = this.input.keyboard.addKey(Phaser.Keyboard.C);
            rCKey.onDown.add(rButtonDownAction, motorC);
            var rDKey = this.input.keyboard.addKey(Phaser.Keyboard.V);
            rDKey.onDown.add(rButtonDownAction, motorD);

            // stop motor on key up:
            fAKey.onUp.add(fButtonUpAction, motorA); // this will stop motorA
            fBKey.onUp.add(fButtonUpAction, motorB);
            fCKey.onUp.add(fButtonUpAction, motorC);
            fDKey.onUp.add(fButtonUpAction, motorD);

            rAKey.onUp.add(rButtonUpAction, motorA); // this will stop motor A
            rBKey.onUp.add(rButtonUpAction, motorB);
            rCKey.onUp.add(rButtonUpAction, motorC);
            rDKey.onUp.add(rButtonUpAction, motorD);

            // buttons for motor gangs:
            fGangButton = {
                g1 : game.add.button(positionGang1.x+105, positionGang1.y+32, 'forwardButton'),
                g2 : game.add.button(positionGang2.x+105, positionGang2.y+32, 'forwardButton')
            }
            rGangButton = {
                g1 : game.add.button(positionGang1.x+105, positionGang1.y+90, 'reverseButton'),
                g2 : game.add.button(positionGang2.x+105, positionGang2.y+90, 'reverseButton')
            }
            
            fGangButton.g1.events.onInputDown.add(fGangButtonDownAction, gang1);
            fGangButton.g1.events.onInputUp.add(fGangButtonUpAction, gang1);
            fGangButton.g2.events.onInputDown.add(fGangButtonDownAction, gang2);
            fGangButton.g2.events.onInputUp.add(fGangButtonUpAction, gang2);

            rGangButton.g1.events.onInputDown.add(rGangButtonDownAction, gang1);
            rGangButton.g1.events.onInputUp.add(rGangButtonUpAction, gang1);
            rGangButton.g2.events.onInputDown.add(rGangButtonDownAction, gang2);
            rGangButton.g2.events.onInputUp.add(rGangButtonUpAction, gang2);

            fGangButton.g1.setFrames(1,0,2,2);
            rGangButton.g1.setFrames(1,0,2,2);
            fGangButton.g2.setFrames(1,0,2,2);
            rGangButton.g2.setFrames(1,0,2,2);

            fGangButton.g1.input.useHandCursor = true;
            rGangButton.g1.input.useHandCursor = true;
            fGangButton.g2.input.useHandCursor = true;
            rGangButton.g2.input.useHandCursor = true;

            minusButtonG1 = game.add.button(positionGang1.x+105, positionGang1.y+148, 'minusButton', actionDecreaseOnClickG1, this, 1, 0, 2, 0);
            plusButtonG1 = game.add.button(positionGang1.x+158, positionGang1.y+148, 'plusButton', actionIncreaseOnClickG1, this, 1, 0, 2, 0);
            minusButtonG2 = game.add.button(positionGang2.x+105, positionGang2.y+148, 'minusButton', actionDecreaseOnClickG2, this, 1, 0, 2, 0);
            plusButtonG2 = game.add.button(positionGang2.x+158, positionGang2.y+148, 'plusButton', actionIncreaseOnClickG2, this, 1, 0, 2, 0);

            minusButtonG1.input.useHandCursor = true;
            plusButtonG1.input.useHandCursor = true;
            minusButtonG2.input.useHandCursor = true;
            plusButtonG2.input.useHandCursor = true;

            // Pretty quick and dirty here, hopefully this works though:
            /* forward button actions */
            function fGangButtonDownAction () {
                console.log("onActionDownForwardGang"); 
                if ( this.a === true) {
                    motorA.previousSpeed = motorA.speed = this.speed;
                    moveMotor( "a", "f", this.speed );
                }
                if ( this.b === true) {
                    motorB.previousSpeed = motorB.speed = this.speed;
                    moveMotor( "b", "f", this.speed );
                }
                if ( this.c === true) {
                    motorC.previousSpeed = motorC.speed = this.speed;
                    moveMotor( "c", "f", this.speed );
                }
                if ( this.d === true) {
                    motorD.previousSpeed = motorD.speed = this.speed;
                    moveMotor( "d", "f", this.speed );
                }
                if ( this === gang1 ) {
                    fGangButton.g1.setFrames(2,2,2,2); //forward button as down
                }
                if ( this === gang2 ) {
                    fGangButton.g2.setFrames(2,2,2,2);
                }
            }
            function fGangButtonUpAction() {
                console.log("onActionUpForwardGang");
                if ( this.a === true) {
                    stopMotor("a");
                }
                if ( this.b === true) {
                    stopMotor("b");
                }
                if ( this.c === true) {
                    stopMotor("c");
                }
                if ( this.d === true) {
                    stopMotor("d");
                }
                if ( this === gang1 ) {
                    fGangButton.g1.setFrames(1,0,2,0); //forward button as up
                }
                if ( this === gang2 ) {
                    fGangButton.g2.setFrames(1,0,2,0);
                }
            }
            /* reverse buttons actions*/
            function rGangButtonDownAction () {
                console.log("onActionDownReverseGang"); 
                if ( this.a === true) {
                    motorA.previousSpeed = motorA.speed = this.speed;
                    moveMotor( "a", "r", this.speed );
                }
                if ( this.b === true) {
                    motorB.previousSpeed = motorB.speed = this.speed;
                    moveMotor( "b", "r", this.speed );
                }
                if ( this.c === true) {
                    motorC.previousSpeed = motorC.speed = this.speed;
                    moveMotor( "c", "r", this.speed );
                }
                if ( this.d === true) {
                    motorD.previousSpeed = motorD.speed = this.speed;
                    moveMotor( "d", "r", this.speed );
                }
                if ( this === gang1 ) {
                    rGangButton.g1.setFrames(2,2,2,2); //reverse button as down
                }
                if ( this === gang2 ) {
                    rGangButton.g2.setFrames(2,2,2,2);
                }
            }
            function rGangButtonUpAction() {
                console.log("onActionUpReverseGang");
                if ( this.a === true) {
                    stopMotor("a");
                }
                if ( this.b === true) {
                    stopMotor("b");
                }
                if ( this.c === true) {
                    stopMotor("c");
                }
                if ( this.d === true) {
                    stopMotor("d");
                }
                if ( this === gang1 ) {
                    rGangButton.g1.setFrames(1,0,2,0); //reverse button as up
                }
                if ( this === gang2 ) {
                    rGangButton.g2.setFrames(1,0,2,0);
                }
            }

        /* Add keyboard inputs for motor gangs, as an alternative when using a desktop */
            
            //add reverse/forward keyboard controls (using Q & W for forward, and T & Y for reverse):
            var fG1Key = this.input.keyboard.addKey(Phaser.Keyboard.Q);
            fG1Key.onDown.add(fGangButtonDownAction, gang1); // this will move gang 1 forward
            var fG2Key = this.input.keyboard.addKey(Phaser.Keyboard.W);
            fG2Key.onDown.add(fGangButtonDownAction, gang2);

            var rG1Key = this.input.keyboard.addKey(Phaser.Keyboard.T);
            rG1Key.onDown.add(rGangButtonDownAction, gang1); // this will move gang 1 in reverse
            var rG2Key = this.input.keyboard.addKey(Phaser.Keyboard.Y);
            rG2Key.onDown.add(rGangButtonDownAction, gang2);

            // stop motor on key up:
            fG1Key.onUp.add(fGangButtonUpAction, gang1); // this will stop gang 1
            fG2Key.onUp.add(fGangButtonUpAction, gang2);

            rG1Key.onUp.add(rGangButtonUpAction, gang1); // this will stop gang 1
            rG2Key.onUp.add(rGangButtonUpAction, gang2);

            /* Adding motor-ganging functionality */
            checkbox = {
                //a1 : game.add.button(positionGang.x, positionGang.y+27, 'checkbox', actionCheckbox, this),
                a1 : game.add.button(positionGang1.x+10, positionGang1.y+32, 'checkbox', actionCheckboxA1, this),
                a2 : game.add.button(positionGang2.x+10, positionGang2.y+32, 'checkbox', actionCheckboxA2, this),
                b1 : game.add.button(positionGang1.x+10, positionGang1.y+74, 'checkbox', actionCheckboxB1, this),
                b2 : game.add.button(positionGang2.x+10, positionGang2.y+74, 'checkbox', actionCheckboxB2, this),
                c1 : game.add.button(positionGang1.x+10, positionGang1.y+116, 'checkbox', actionCheckboxC1, this),
                c2 : game.add.button(positionGang2.x+10, positionGang2.y+116, 'checkbox', actionCheckboxC2, this),
                d1 : game.add.button(positionGang1.x+10, positionGang1.y+158, 'checkbox', actionCheckboxD1, this),
                d2 : game.add.button(positionGang2.x+10, positionGang2.y+158, 'checkbox', actionCheckboxD2, this)
            }
            // let's initially set the checkbox frames so that they're unchecked and if you hvoer over them, they highlight
            checkbox.a1.setFrames(2,0,1,0);
            checkbox.a2.setFrames(2,0,1,0);
            checkbox.b1.setFrames(2,0,1,0);
            checkbox.b2.setFrames(2,0,1,0);
            checkbox.c1.setFrames(2,0,1,0);
            checkbox.c2.setFrames(2,0,1,0);
            checkbox.d1.setFrames(2,0,1,0);
            checkbox.d2.setFrames(2,0,1,0);

            /* use hand cursor when hovering over checkboxes */
            checkbox.a1.input.useHandCursor = true;
            checkbox.a2.input.useHandCursor = true;
            checkbox.b1.input.useHandCursor = true;
            checkbox.b2.input.useHandCursor = true;
            checkbox.c1.input.useHandCursor = true;
            checkbox.c2.input.useHandCursor = true;
            checkbox.d1.input.useHandCursor = true;
            checkbox.d2.input.useHandCursor = true;

            
            //======================

            /* Plus and Minus Increase and Decrease Speed */
            minusButtonA = game.add.button(positionMotorA.x+10, positionMotorA.y+148, 'minusButton', actionDecreaseOnClickA, this, 1, 0, 2, 0);
            plusButtonA = game.add.button(positionMotorA.x+63, positionMotorA.y+148, 'plusButton', actionIncreaseOnClickA, this, 1, 0, 2, 0);
            minusButtonB = game.add.button(positionMotorB.x+10, positionMotorB.y+148, 'minusButton', actionDecreaseOnClickB, this, 1, 0, 2, 0);
            plusButtonB = game.add.button(positionMotorB.x+63, positionMotorB.y+148, 'plusButton', actionIncreaseOnClickB, this, 1, 0, 2, 0);
            minusButtonC = game.add.button(positionMotorC.x+10, positionMotorC.y+148, 'minusButton', actionDecreaseOnClickC, this, 1, 0, 2, 0);
            plusButtonC = game.add.button(positionMotorC.x+63, positionMotorC.y+148, 'plusButton', actionIncreaseOnClickC, this, 1, 0, 2, 0);
            minusButtonD = game.add.button(positionMotorD.x+10, positionMotorD.y+148, 'minusButton', actionDecreaseOnClickD, this, 1, 0, 2, 0);
            plusButtonD = game.add.button(positionMotorD.x+63, positionMotorD.y+148, 'plusButton', actionIncreaseOnClickD, this, 1, 0, 2, 0);

            /* Use hand cursor when hovering over plus and minus buttons */
            minusButtonA.input.useHandCursor = true;
            plusButtonA.input.useHandCursor = true;
            minusButtonB.input.useHandCursor = true;
            plusButtonB.input.useHandCursor = true;
            minusButtonC.input.useHandCursor = true;
            plusButtonC.input.useHandCursor = true;
            minusButtonD.input.useHandCursor = true;
            plusButtonD.input.useHandCursor = true;

            /* LCD Screen Message */
            screenInputButton = game.add.button(positionScreen.x+142, positionScreen.y+5, 'screenInputButton', actionInputOnClick);
            screenInputButton.input.useHandCursor = true;

        /* Click and drag motor speed setting & display */
            sliderTrackA = game.add.graphics(0,0);
            sliderTrackA.beginFill(frameLineColor, 1);
            sliderTrackA.drawRect(positionMotorA.x+163, positionMotorA.y+16, 2, 156); //every 10% increase in motor speed will be a 16px difference
            sliderBarA = game.add.button(positionMotorA.x+133, positionMotorA.y+165, 'sliderBar');
            sliderBarA.inputEnabled=true;
            sliderBarA.input.useHandCursor = true;
            sliderBarA.input.enableDrag();
            sliderBarA.input.allowHorizontalDrag=false;
            sliderBarA.events.onInputUp.add(actionDragOnClickA);
            sliderBarA.events.onInputDown.add(actionDownOnSlideA);

            sliderTrackB = game.add.graphics(0,0);
            sliderTrackB.beginFill(frameLineColor, 1);
            sliderTrackB.drawRect(positionMotorB.x+163, positionMotorB.y+16, 2, 156); //every 10% increase in motor speed will be a 16px difference
            sliderBarB = game.add.button(positionMotorB.x+133, positionMotorB.y+165, 'sliderBar');
            sliderBarB.inputEnabled=true;
            sliderBarB.input.useHandCursor = true;
            sliderBarB.input.enableDrag();
            sliderBarB.input.allowHorizontalDrag=false;
            sliderBarB.events.onInputUp.add(actionDragOnClickB);
            sliderBarB.events.onInputDown.add(actionDownOnSlideB);
                        
            sliderTrackC = game.add.graphics(0,0);
            sliderTrackC.beginFill(frameLineColor, 1);
            sliderTrackC.drawRect(positionMotorC.x+163, positionMotorC.y+16, 2, 156); //every 10% increase in motor speed will be a 16px difference
            sliderBarC = game.add.button(positionMotorC.x+133, positionMotorC.y+165, 'sliderBar');
            sliderBarC.inputEnabled=true;
            sliderBarC.input.useHandCursor = true;
            sliderBarC.input.enableDrag();
            sliderBarC.input.allowHorizontalDrag=false;
            sliderBarC.events.onInputUp.add(actionDragOnClickC);
            sliderBarC.events.onInputDown.add(actionDownOnSlideC);

            sliderTrackD = game.add.graphics(0,0);
            sliderTrackD.beginFill(frameLineColor, 1);
            sliderTrackD.drawRect(positionMotorD.x+163, positionMotorD.y+16, 2, 156); //every 10% increase in motor speed will be a 16px difference
            sliderBarD = game.add.button(positionMotorD.x+133, positionMotorD.y+165, 'sliderBar');
            sliderBarD.inputEnabled=true;
            sliderBarD.input.useHandCursor = true;
            sliderBarD.input.enableDrag();
            sliderBarD.input.allowHorizontalDrag=false;
            sliderBarD.events.onInputUp.add(actionDragOnClickD);
            sliderBarD.events.onInputDown.add(actionDownOnSlideD);

            sliderTrackG1 = game.add.graphics(0,0);
            sliderTrackG1.beginFill(frameLineColor, 1);
            sliderTrackG1.drawRect(positionGang1.x+263, positionGang1.y+16, 2, 156); //every 10% increase in motor speed will be a 16px difference
            sliderBarG1 = game.add.button(positionGang1.x+233, positionGang1.y+165, 'sliderBar2');
            sliderBarG1.inputEnabled=true;
            sliderBarG1.input.useHandCursor = true;
            sliderBarG1.input.enableDrag();
            sliderBarG1.input.allowHorizontalDrag=false;
            sliderBarG1.events.onInputUp.add(actionDragOnClickG1);
            sliderBarG1.events.onInputDown.add(actionDownOnSlideG1);

            sliderTrackG2 = game.add.graphics(0,0);
            sliderTrackG2.beginFill(frameLineColor, 1);
            sliderTrackG2.drawRect(positionGang2.x+263, positionGang2.y+16, 2, 156); //every 10% increase in motor speed will be a 16px difference
            sliderBarG2 = game.add.button(positionGang2.x+233, positionGang2.y+165, 'sliderBar2');
            sliderBarG2.inputEnabled=true;
            sliderBarG2.input.useHandCursor = true;
            sliderBarG2.input.enableDrag();
            sliderBarG2.input.allowHorizontalDrag=false;
            sliderBarG2.events.onInputUp.add(actionDragOnClickG2);
            sliderBarG2.events.onInputDown.add(actionDownOnSlideG2);

            // Add some labels to the sliders
            sliderLabel = {
                a : game.add.text(positionMotorA.x+129, positionMotorA.y+179, "Speed (\xB0/sec)", labelStyle),
                b : game.add.text(positionMotorB.x+129, positionMotorB.y+179, "Speed (\xB0/sec)", labelStyle),
                c : game.add.text(positionMotorC.x+129, positionMotorC.y+179, "Speed (\xB0/sec)", labelStyle),
                d : game.add.text(positionMotorD.x+129, positionMotorD.y+179, "Speed (\xB0/sec)", labelStyle),
                g1 : game.add.text(positionGang1.x+229, positionGang1.y+179, "Speed (\xB0/sec)" , labelStyle),
                g2 : game.add.text(positionGang2.x+229, positionGang2.y+179, "Speed (\xB0/sec)", labelStyle)
            }
            for (var i = 0; i <= 7; i++) {
                var speedLabel = speedRange[i] + "";
                var speedLabelY = { 
                    a : positionMotorA.y+162 - 22 * i,
                    b : positionMotorB.y+162 - 22 * i,
                    c : positionMotorC.y+162 - 22 * i,
                    d : positionMotorD.y+162 - 22 * i,
                }
                var speedLabelA = game.add.text(positionMotorA.x+210, speedLabelY.a, speedLabel, labelStyle)
                var speedLabelB = game.add.text(positionMotorB.x+210, speedLabelY.b, speedLabel, labelStyle)
                var speedLabelC = game.add.text(positionMotorC.x+210, speedLabelY.c, speedLabel, labelStyle)
                var speedLabelD = game.add.text(positionMotorD.x+210, speedLabelY.d, speedLabel, labelStyle);
            }
            for ( var i = 0; i <= 7; i++) {
                var speedLabel = speedRange[i] + ""; //this makes it a string, so 0 appears at bottom
                var speedLabelG1Y = positionGang1.y + 162 - 22 * i; //for gang 1
                var speedLabelG1 = game.add.text(positionGang1.x+308, speedLabelG1Y, speedLabel, labelStyle)
            }
            for ( var i = 0; i <= 7; i++) {
                var speedLabel = speedRange[i] + "";
                var speedLabelG2Y = positionGang2.y + 162 - 22 * i; //for gang 2
                var speedLabelG2 = game.add.text(positionGang2.x+308, speedLabelG2Y, speedLabel, labelStyle)
            }

        /* Status Lights */
            statusLightA = game.add.sprite(positionMotorStatus.x+12, positionMotorStatus.y+26, 'statusLight');
            statusLightA.animations.add('unplugged', [0], 1);
            statusLightA.animations.add('pluggedIn', [1], 1);
            statusLightA.animations.add('stalled', [2], 1);
            statusLightB = game.add.sprite(positionMotorStatus.x+42, positionMotorStatus.y+26, 'statusLight');
            statusLightB.animations.add('unplugged', [0], 1);
            statusLightB.animations.add('pluggedIn', [1], 1);
            statusLightB.animations.add('stalled', [2], 1);
            statusLightC = game.add.sprite(positionMotorStatus.x+72, positionMotorStatus.y+26, 'statusLight');
            statusLightC.animations.add('unplugged', [0], 1);
            statusLightC.animations.add('pluggedIn', [1], 1);
            statusLightC.animations.add('stalled', [2], 1);
            statusLightD = game.add.sprite(positionMotorStatus.x+102, positionMotorStatus.y+26, 'statusLight');
            statusLightD.animations.add('unplugged', [0], 1);
            statusLightD.animations.add('pluggedIn', [1], 1);
            statusLightD.animations.add('stalled', [2], 1);

            statusLight1 = game.add.sprite(positionSensorStatus.x+12, positionSensorStatus.y+26, 'statusLight');
            statusLight1.animations.add('unplugged', [0], 1);
            statusLight1.animations.add('pluggedIn', [1], 1);
            statusLight2 = game.add.sprite(positionSensorStatus.x+42, positionSensorStatus.y+26, 'statusLight');
            statusLight2.animations.add('unplugged', [0], 1);
            statusLight2.animations.add('pluggedIn', [1], 1);
            statusLight3 = game.add.sprite(positionSensorStatus.x+72, positionSensorStatus.y+26, 'statusLight');
            statusLight3.animations.add('unplugged', [0], 1);
            statusLight3.animations.add('pluggedIn', [1], 1);
            statusLight4 = game.add.sprite(positionSensorStatus.x+102, positionSensorStatus.y+26, 'statusLight');
            statusLight4.animations.add('unplugged', [0], 1);
            statusLight4.animations.add('pluggedIn', [1], 1);

        /* Rotational position dials and needles for motors */

            dialA = game.add.sprite(positionDial.x+12, positionDial.y+23, 'dialFace');
            dialB = game.add.sprite(positionDial.x+77, positionDial.y+23, 'dialFace');
            dialC = game.add.sprite(positionDial.x+142, positionDial.y+23, 'dialFace');
            dialD = game.add.sprite(positionDial.x+207, positionDial.y+23, 'dialFace');

            labelRotation = game.add.text(positionDial.x+10, positionDial.y+2, labelRotation, labelStyle3);
            labelDial.a = game.add.text(positionDial.x+32, positionDial.y+45, 'A', labelStyle5);
            labelDial.b = game.add.text(positionDial.x+97, positionDial.y+45, 'B', labelStyle5);
            labelDial.c = game.add.text(positionDial.x+162, positionDial.y+45, 'C', labelStyle5);
            labelDial.d = game.add.text(positionDial.x+227, positionDial.y+45, 'D', labelStyle5);

            needleA = game.add.sprite(positionDial.x+38, positionDial.y+49, 'needle');
            needleA.anchor.setTo(0.495, 0.92);
            needleB = game.add.sprite(positionDial.x+103, positionDial.y+49, 'needle');
            needleB.anchor.setTo(0.495, 0.92);
            needleC = game.add.sprite(positionDial.x+168, positionDial.y+49, 'needle');
            needleC.anchor.setTo(0.495, 0.92);
            needleD = game.add.sprite(positionDial.x+233, positionDial.y+49, 'needle');
            needleD.anchor.setTo(0.495, 0.92);
        
        /* Buttons to drag entire boxes (for motors and motor gangs) */
            dragBoxButton = {
                g1 : game.add.button(positionGang1.x+341, positionGang1.y+5, 'dragButton', actionDragG1, this),
                g2 : game.add.button(positionGang2.x+341, positionGang2.y+5, 'dragButton', actionDragG2, this),
                a : game.add.button(positionMotorA.x+241, positionMotorA.y+5, 'dragButton', actionDragA, this),
                b : game.add.button(positionMotorB.x+241, positionMotorB.y+5, 'dragButton', actionDragB, this),
                c : game.add.button(positionMotorC.x+241, positionMotorC.y+5, 'dragButton', actionDragC, this),
                d : game.add.button(positionMotorD.x+241, positionMotorD.y+5, 'dragButton', actionDragD, this)
            }

        /* Touch Sensor */
            touchIndicator = game.add.sprite(positionTouch.x+64, positionTouch.y+23, 'touchIndicator');
            touchIndicator.animations.add('up', [0], 1);
            touchIndicator.animations.add('pressed', [1], 1);

        /* Battery Level Sensor */
            batteryLevelBox = game.add.graphics(0,0);
            batteryLevelBox.beginFill(0xD8D8D8, 0.8);
            batteryLevelBox.lineStyle(1.5, frameLineColor, 1);
            batteryLevelBox.drawRect(positionBattery.x+10, positionBattery.y+31, 102, 18);

            batteryLevelShape = game.add.graphics(0,0);
            batteryLevelShape.beginFill(frameLineColor, 1);
            batteryLevelShape.drawRect(positionBattery.x+112, positionBattery.y+36, 4, 8);

            batteryLevelFill = game.add.graphics(0,0);
            batteryLevelFill.beginFill(0x313233, 0.85);
            batteryLevelFill.drawRect(positionBattery.x+11, positionBattery.y+32, Math.round(batteryLevel*100), 16); // the "x100" converts the battery level (whatever it initially is) to the scale of 100 px wide

        /* LCD Screen */
            LCDScreenBox = game.add.graphics(0,0);
            LCDScreenBox.beginFill(0x808080, 0.6);
            LCDScreenBox.lineStyle(1.5, frameLineColor, 1);
            LCDScreenBox.drawRect(positionScreen.x+10, positionScreen.y+32, 172, 48);

        } // end create 
        //=============================================================================

    /* Motor communication with Robot via messages to Big Bang channel */
        function moveMotor( motor, direction, speed ) {
            var data = {};
            data.type = "motorStart";
            data.port = motor;
            data.dir = direction;
            data.speed = speed;
            console.log( "sending " + JSON.stringify(data));
            channel.publish( data );
            if (motor === 'a') {
                channel.getKeyspace('dashboard').put('a', { 'speed': speed, 'direction': direction });
                // if ( direction === 'f') {
                //     fButton.a.setFrames(2,2,2,2); // show the forward button as down, in case keyboard button inputs were being used instead of clicking
                // } else {
                //     rButton.a.setFrames(2,2,2,2); // show the reverse button as down, in case keyboard button inputs were being used instead of clicking
                // }
            }
            if (motor === 'b') {
                channel.getKeyspace('dashboard').put('b', { 'speed': speed, 'direction': direction });
            }
            if (motor === 'c') {
                channel.getKeyspace('dashboard').put('c', { 'speed': speed, 'direction': direction });
            }
            if (motor === 'd') {
                channel.getKeyspace('dashboard').put('d', { 'speed': speed, 'direction': direction });
            }
        }
        function stopMotor( motor ) {
            var data = {};
            data.type = "motorStop";
            data.port = motor;
            console.log( "sending " + JSON.stringify(data));
            channel.publish( data );
            if (data.port === 'a') {
                channel.getKeyspace('dashboard').put('a', { 'speed': motorA.speed, 'direction': "stopped" });
                // fButton.a.setFrames(1,0,2,0); // set forward button back to its normal frames (even if it hadn't changed...)
                // rButton.a.setFrames(1,0,2,0); // set reverse button back to its normal frames (even if it hadn't changed...)
            }
            if (data.port === 'b') {
                channel.getKeyspace('dashboard').put('b', { 'speed': motorB.speed, 'direction': "stopped" });
            }
            if (data.port === 'c') {
                channel.getKeyspace('dashboard').put('c', { 'speed': motorC.speed, 'direction': "stopped" });
            }
            if (data.port === 'd') {
                channel.getKeyspace('dashboard').put('d', { 'speed': motorD.speed, 'direction': "stopped" });
            }
        }

    /* Button-click functions */

        function actionStopOnClick () {
            if ( dashboardStatus === 1 ) {
                statusButton.setFrames(2,2,2,2);
                dashboardStatus = 0;
                game.paused = true;
                game.world.remove(status.statusDisplay);
                labelStatusDisplay = "stopped";
                status.statusDisplay = game.add.text(positionStatus.x+12, positionStatus.y+30, labelStatusDisplay, labelStyle);
                resume.resumeOverlay = game.add.graphics(0,0);
                resume.resumeOverlay.beginFill(0x00000,0.45);
                resume.resumeOverlay.drawRect(0,51,960,599);
                resume.resumeMessageDisplay = game.add.sprite(gameBoundX/2-251,280,'resume');
                this.game.input.keyboard.disabled = true;
            } else {
                statusButton.setFrames(1,0,0,0);
                dashboardStatus = 1;
                game.paused = false;
            }
            
        }
        function actionInputOnClick () {
            game.world.remove(screenMessage.messageDisplay1); // remove any messages present
            game.world.remove(screenMessage.messageDisplay2);
            game.world.remove(screenMessage.messageDisplay3);
            messageDisplay = prompt("What would you like to display on the Gigabot's LCD screen?");
            var messageDisplay1 = messageDisplay.substring(0,20);
            var messageDisplay2 = messageDisplay.substring(20,40);
            var messageDisplay3 = messageDisplay.substring(40,60);
            if ( messageDisplay.length > 60 ) {
                alert("Sorry, too many characters! The following will be displayed on the screen: \n \n" + messageDisplay1 + "\n" + messageDisplay2 + "\n" + messageDisplay3);
            }
            screenMessage.messageDisplay1 = game.add.text(positionScreen.x+15, positionScreen.y+35, messageDisplay1, messageStyle);
            screenMessage.messageDisplay2 = game.add.text(positionScreen.x+15, positionScreen.y+49, messageDisplay2, messageStyle);
            screenMessage.messageDisplay3 = game.add.text(positionScreen.x+15, positionScreen.y+63, messageDisplay3, messageStyle);
        }

        //=============================================================================
        /* Plus and Minus Buttons For Increase and Decreasing Motor Speeds (an alternative to clicking and dragging) */
        function actionDecreaseOnClickA() {
            if (motorA.speed >= 50) {
                motorA.speed = motorA.speed - 50;
                sliderBarA.y = sliderBarA.y + 11;
            } else {
                motorA.speed = 0; // just set the speed to the minimum
                sliderBarA.y = positionMotorA.y + 165; // and move sliderbar to that corresponding position
            }
            console.log(motorA.speed.toFixed(2)); //this makes motorA.speed a string with 2 decimal places
            channel.getKeyspace('dashboard').put('a', { 'speed': motorA.speed }); // This accesses the keyspace 'dashboard,' which if it doesn't exist is then created containing a non-null value. Then it puts a key 'a' into it, which contains the value 'speed' equal to motorA.speed
        }
        function actionIncreaseOnClickA() {
            if (motorA.speed <= 650) {
                motorA.speed = motorA.speed + 50;
                sliderBarA.y = sliderBarA.y - 11;
            } else {
                motorA.speed = 700; // just set the speed to the maximum
                sliderBarA.y = positionMotorA.y + 11; // and move sliderbar to that corresponding position
            }
            console.log(motorA.speed.toFixed(2));
            channel.getKeyspace('dashboard').put('a', { 'speed': motorA.speed }); // This accesses the keyspace 'dashboard,' which if it doesn't exist is then created containing a non-null value. Then it puts a key 'a' into it, which contains the value 'speed' equal to motorA.speed
        }
        function actionDecreaseOnClickB() {
            if (motorB.speed >= 50) {
                motorB.speed = motorB.speed - 50;
                sliderBarB.y = sliderBarB.y + 11;
            } else {
                motorB.speed = 0;
                sliderBarB.y = positionMotorB.y + 165;
            }
            console.log(motorB.speed.toFixed(2));
            channel.getKeyspace('dashboard').put('b', { 'speed': motorB.speed });
        }
        function actionIncreaseOnClickB() {
            if (motorB.speed <= 650) {
                motorB.speed = motorB.speed + 50;
                sliderBarB.y = sliderBarB.y - 11;
            } else {
                motorB.speed = 700;
                sliderBarB.y = positionMotorB.y + 11;
            }
            console.log(motorB.speed.toFixed(2));
            channel.getKeyspace('dashboard').put('b', { 'speed': motorB.speed }); 
        }
        function actionDecreaseOnClickC() {
            if (motorC.speed >= 50) {
                motorC.speed = motorC.speed - 50;
                sliderBarC.y = sliderBarC.y + 11;
            } else {
                motorC.speed = 0;
                sliderBarC.y = positionMotorC.y + 165;
            }
            console.log(motorC.speed.toFixed(2));
            channel.getKeyspace('dashboard').put('c', { 'speed': motorC.speed });
        }
        function actionIncreaseOnClickC() {
            if (motorC.speed <= 650) {
                motorC.speed = motorC.speed + 50;
                sliderBarC.y = sliderBarC.y - 11;
            } else {
                motorC.speed = 700;
                sliderBarC.y = positionMotorC.y + 11;
            }
            console.log(motorC.speed.toFixed(2));
            channel.getKeyspace('dashboard').put('c', { 'speed': motorC.speed });
        }
        function actionDecreaseOnClickD() {
            if (motorD.speed >= 50) {
                motorD.speed = motorD.speed - 50;
                sliderBarD.y = sliderBarD.y + 11;
            } else {
                motorD.speed = 0;
                sliderBarD.y = positionMotorD.y + 165;
            }
            console.log(motorD.speed.toFixed(2));
            channel.getKeyspace('dashboard').put('d', { 'speed': motorD.speed });
        }
        function actionIncreaseOnClickD() {
            if (motorD.speed <= 650) {
                motorD.speed = motorD.speed + 50;
                sliderBarD.y = sliderBarD.y - 11;
            } else {
                motorD.speed = 700;
                sliderBarD.y = positionMotorD.y + 11;
            }
            console.log(motorD.speed.toFixed(2));
            channel.getKeyspace('dashboard').put('d', { 'speed': motorD.speed });
        }

        //=============================================================================
        /* Click-and-drag functions (an alternative to the plus and minus buttons) */
        function actionDragOnClickA() {
            //we're sliding between positionMotorA.y + 11 px (0 deg/sec) and positionMotorA.y + 165px (700 deg/sec). These y coordinates are at the top of the slider bar, so the center goes from 362 to 202
            if (sliderBarA.y < positionMotorA.y+11) { //set max speed boundary limit
                sliderBarA.y = positionMotorA.y+11;
            } else if (sliderBarA.y > positionMotorA.y+165) { //set min speed boundary limit
                sliderBarA.y = positionMotorA.y+165;
            }
            motorA.speed = 700 + (700/154) * (positionMotorA.y + 11 - sliderBarA.y); // normalize speed over the range of y values on the slider track
            channel.getKeyspace('dashboard').put('a', { 'speed' : motorA.speed }); // This accesses the keyspace 'dashboard,' which if it doesn't exist is then created containing a non-null value. Then it puts a key 'a' into it, which contains the value 'speed' equal to motorA.speed
            sliderBarState.a = "up";
            console.log(motorA.speed.toFixed(2)); //this makes motorA.speed a string with 2 decimal places
        }
        function actionDragOnClickB() {
            if (sliderBarB.y < positionMotorB.y+11) {
                sliderBarB.y = positionMotorB.y+11;
            } else if (sliderBarB.y > positionMotorB.y+165) {
                sliderBarB.y = positionMotorB.y+165;
            }
            motorB.speed = 700 + (700/154) * (positionMotorB.y + 11 - sliderBarB.y);
            channel.getKeyspace('dashboard').put('b', { 'speed' : motorB.speed }); // This accesses the keyspace 'dashboard,' which if it doesn't exist is then created containing a non-null value. Then it puts a key 'b' into it, which contains the value 'speed' equal to motorB.speed
            sliderBarState.b = "up";
            console.log(motorB.speed.toFixed(2));
        }
        function actionDragOnClickC() {
            if (sliderBarC.y < positionMotorC.y+11) {
                sliderBarC.y = positionMotorC.y+11;
            } else if (sliderBarC.y > positionMotorC.y+165) {
                sliderBarC.y = positionMotorC.y+165;
            }
            motorC.speed = 700 + (700/154) * (positionMotorC.y + 11 - sliderBarC.y);
            channel.getKeyspace('dashboard').put('c', { 'speed' : motorC.speed }); 
            sliderBarState.c = "up";
            console.log(motorC.speed.toFixed(2));
        }
        function actionDragOnClickD() {
            if (sliderBarD.y < positionMotorD.y+11) {
                sliderBarD.y = positionMotorD.y+11;
            } else if (sliderBarD.y > positionMotorD.y+165) {
                sliderBarD.y = positionMotorD.y+165;
            }
            motorD.speed = 700 + (700/154) * (positionMotorD.y + 11 - sliderBarD.y);
            channel.getKeyspace('dashboard').put('d', { 'speed' : motorD.speed }); 
            sliderBarState.d = "up";
            console.log(motorD.speed.toFixed(2));
        }

        function actionDownOnSlideA() {
            sliderBarState.a = "down";
            motorA.previousSpeed = motorA.speed;
        }
        function actionDownOnSlideB() {
            sliderBarState.b = "down";
            motorB.previousSpeed = motorB.speed;                
        }
        function actionDownOnSlideC() {
            sliderBarState.c = "down";
            motorC.previousSpeed = motorC.speed;
        }
        function actionDownOnSlideD() {
            sliderBarState.d = "down";
            motorD.previousSpeed = motorD.speed;        
        }

        //=============================================================================
    /* Gang speed controls */
        //uncomment the comments when we're ready for the gang dashboard sync feature
        function actionDecreaseOnClickG1() {
            if (gang1.speed >= 50) {
                gang1.speed = gang1.speed - 50;
                sliderBarG1.y = sliderBarG1.y + 11; 
            } else {
                gang1.speed = 0; // just set to min position
                sliderBarG1.y = positionGang1.y + 165; //and move sliderbar to that position
            }
            console.log(gang1.speed.toFixed(2));
            channel.getKeyspace('dashboard').put('g1', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
        }
        function actionIncreaseOnClickG1() {
            if (gang1.speed <= 650) {
                gang1.speed = gang1.speed + 50;
                sliderBarG1.y = sliderBarG1.y - 11;
            } else {
                gang1.speed = 700; //just set to max speed
                sliderBarG1.y = positionGang1.y + 11; //and move sliderbar to that position
            }
            console.log(gang1.speed.toFixed(2));
            channel.getKeyspace('dashboard').put('g1', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
        }
        function actionDecreaseOnClickG2() {
            if (gang2.speed >= 50) {
                gang2.speed = gang2.speed - 50;
                sliderBarG2.y = sliderBarG2.y + 11;
            } else {
                gang2.speed = 0;
                sliderBarG2.y = positionGang2.y + 165;
            }
            console.log(gang2.speed.toFixed(2));
            channel.getKeyspace('dashboard').put('g2', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });
        }
        function actionIncreaseOnClickG2() {
            if (gang2.speed <= 650) {
                gang2.speed = gang2.speed + 50;
                sliderBarG2.y = sliderBarG2.y - 11;
            } else {
                gang2.speed = 700;
                sliderBarG2.y = positionGang2.y + 11;
            }
            console.log(gang2.speed.toFixed(2));
            channel.getKeyspace('dashboard').put('g2', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });
        }
        function actionDragOnClickG1() {
            if (sliderBarG1.y < positionGang1.y+11) {
                sliderBarG1.y = positionGang1.y+11;
            } else if (sliderBarG1.y > positionGang1.y+165) {
                sliderBarG1.y = positionGang1.y+165;
            }
            gang1.speed = 700 + (700/154) * (positionGang1.y + 11 - sliderBarG1.y);
            console.log(gang1.speed.toFixed(2));
            channel.getKeyspace('dashboard').put('g1', { 'speed': gang1.speed,'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            sliderBarState.g1 = "up";
        }
        function actionDragOnClickG2() {
            if (sliderBarG2.y < positionGang2.y+11) {
                sliderBarG2.y = positionGang2.y+11;
            } else if (sliderBarG2.y > positionGang2.y+165) {
                sliderBarG2.y = positionGang2.y+165;
            }
            gang2.speed = 700 + (700/154) * (positionGang2.y + 11 - sliderBarG2.y);
            console.log(gang2.speed.toFixed(2));
            channel.getKeyspace('dashboard').put('g2', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });
            sliderBarState.g2 = "up";
        }

        function actionDownOnSlideG1() {
            sliderBarState.g1 = "down";
            gang1.previousSpeed = gang1.speed;
        }
        function actionDownOnSlideG2() {
            sliderBarState.g2 = "down";
            gang2.previousSpeed = gang2.speed;        
        }

        function actionCheckboxA1 () {
            if ( gang1.a === false ) { //the checkbox is UNCHECKED
                checkbox.a1.setFrames(1,1,1,1); // over frame and out frame should now both show the box checked
                gang1.a = true; // motor A is in gang 1
                if ( gang2.a === true ) { // both checkboxes for a single motor cannot be checked, so if the other motor is checked, uncheck it now
                    checkbox.a2.setFrames(2,0,1,0) // show other box as unchecked
                    gang2.a = false; // motor A is no longer in gang 2
                }
            }
            else { // the checkbox is CHECKED
                //checkbox.a1.setFrames(2,0,1,0); // over frame and out frame should now both show the box unchecked
                gang1.a = false; // motor A is not in gang 1, so uncheck it now
            }
            channel.getKeyspace('dashboard').put('g1', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace('dashboard').put('g2', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });
            //console.log ("gang 1 speed: " + gang1.speed + " gang 2 speed: " + gang2.speed + "\na1: " + gang1.a + "  b1: " + gang1.b  + "  c1: " + gang1.c  + "  d1: " + gang1.d  + "\na2: " + gang2.a  + "  b2: " + gang2.b  + "  c2: " + gang2.c  + "  d2: " + gang2.d );
        }
        function actionCheckboxA2 () {
            if ( gang2.a === false ) { //the checkbox is UNCHECKED
                checkbox.a2.setFrames(1,1,1,1); // over frame and out frame should now both show the box checked
                gang2.a = true; // motor A is in gang 2
                if ( gang1.a === true ) { // both checkboxes for a single motor cannot be checked, so if the other motor is checked, uncheck it now
                    checkbox.a1.setFrames(2,0,1,0) // show other box as unchecked
                    gang1.a = false; // motor A is no longer in gang 1
                }
            }
            else { // the checkbox is CHECKED
                checkbox.a2.setFrames(2,0,1,0); // over frame and out frame should now both show the box unchecked
                gang2.a = false; // motor A is not in gang 2, so uncheck it now
            }
            channel.getKeyspace('dashboard').put('g1', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace('dashboard').put('g2', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });            
            //console.log ("gang 1 speed: " + gang1.speed + " gang 2 speed: " + gang2.speed + "\na1: " + gang1.a + "  b1: " + gang1.b  + "  c1: " + gang1.c  + "  d1: " + gang1.d  + "\na2: " + gang2.a  + "  b2: " + gang2.b  + "  c2: " + gang2.c  + "  d2: " + gang2.d );
        } 
        function actionCheckboxB1 () {
            if ( gang1.b === false ) {
                checkbox.b1.setFrames(1,1,1,1);
                gang1.b = true;
                if ( gang2.b === true ) {
                    checkbox.b2.setFrames(2,0,1,0);
                    gang2.b = false;
                }
            } else {
                checkbox.b1.setFrames(2,0,1,0);
                gang1.b = false;
            }
            channel.getKeyspace('dashboard').put('g1', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace('dashboard').put('g2', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });            
        }
        function actionCheckboxB2 () {
            if ( gang2.b === false ) { 
                checkbox.b2.setFrames(1,1,1,1);
                gang2.b = true;
                if ( gang1.b === true ) {
                    checkbox.b1.setFrames(2,0,1,0);
                    gang1.b = false;
                } 
            } else {
                checkbox.b2.setFrames(2,0,1,0); 
                gang2.b = false;
            }
            channel.getKeyspace('dashboard').put('g1', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace('dashboard').put('g2', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });            
        }
        function actionCheckboxC1 () {
            if ( gang1.c === false ) {
                checkbox.c1.setFrames(1,1,1,0); 
                gang1.c = true;
                if ( gang2.c === true ) { 
                    checkbox.c2.setFrames(2,0,1,0)
                    gang2.c = false;
                }
            }
            else {
                checkbox.c1.setFrames(2,0,1,0);
                gang1.c = false;
            }
            channel.getKeyspace('dashboard').put('g1', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace('dashboard').put('g2', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });
        }
        function actionCheckboxC2 () {
            if ( gang2.c === false ) { 
                checkbox.c2.setFrames(1,1,1,0);
                gang2.c = true;
                if ( gang1.c === true ) {
                    checkbox.c1.setFrames(2,0,1,0);
                    gang1.c = false;
                } 
            } else {
                checkbox.c2.setFrames(2,0,1,0); 
                gang2.c = false;
            }
            channel.getKeyspace('dashboard').put('g1', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace('dashboard').put('g2', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });            
        }
        function actionCheckboxD1 () {
            if ( gang1.d === false ) {
                checkbox.d1.setFrames(1,1,1,0); 
                gang1.d = true;
                if ( gang2.d === true ) { 
                    checkbox.d2.setFrames(2,0,1,0)
                    gang2.d = false;
                }
            }
            else {
                checkbox.d1.setFrames(2,0,1,0);
                gang1.d = false;
            }
            channel.getKeyspace('dashboard').put('g1', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace('dashboard').put('g2', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });
        }
        function actionCheckboxD2 () {
            if ( gang2.d === false ) { 
                checkbox.d2.setFrames(1,1,1,0);
                gang2.d = true;
                if ( gang1.d === true ) {
                    checkbox.d1.setFrames(2,0,1,0);
                    gang1.d = false;
                } 
            } else {
                checkbox.d2.setFrames(2,0,1,0); 
                gang2.d = false;
            }
            channel.getKeyspace('dashboard').put('g1', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace('dashboard').put('g2', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });            
        }

        //=============================================================================
    /* Draggable box functions */
        function actionDragG1() {
            console.log("not hooked up yet");
            //
        }
        function actionDragG2() {
            console.log("not hooked up yet");
            //
        }
        function actionDragA() {
            console.log("not hooked up yet");
            //
        }
        function actionDragB() {
            console.log("not hooked up yet");
            //
        }
        function actionDragC() {
            console.log("not hooked up yet");
            //
        }
        function actionDragD() {
            console.log("not hooked up yet");
            //
        }

    //==============================================================================================================================
    /* Update stuff */
        //WE CAN IMPLEMENT THIS GUY WHEN WE'RE READY AND HAVE OTHER STUFF HOOKED UP FOR SYNCING THE GANGS 
        function updateGang (key, speed, a, b, c, d) {
            if ( key === 'g1' ) {
                if ( gang1.speed !== speed ) {
                    sliderBarG1.y = positionGang1.y + 11 - (154 / 700) * (speed - 700); //back-calculate sliderbar position from speed normalized over the range of slider track y-values
                    gang1.speed = speed;
                }
                if ( gang1.a !== a ) {
                    if (a === true) {
                        checkbox.a1.setFrames(1,1,1,1);
                    } 
                    else {
                        checkbox.a1.setFrames(2,0,1,0);
                    }
                    gang1.a = a;
                }
                if ( gang1.b !== b ) {
                    if (b === true) {
                        checkbox.b1.setFrames(1,1,1,1);
                    } 
                    else {
                        checkbox.b1.setFrames(2,0,1,0);
                    }
                    gang1.b = b;
                }
                if ( gang1.c !== c ) {
                    if (c === true) {
                        checkbox.c1.setFrames(1,1,1,1);
                    } 
                    else {
                        checkbox.c1.setFrames(2,0,1,0);
                    }
                    gang1.c = c;
                }
                if ( gang1.d !== d ) {
                    if (d === true) {
                        checkbox.d1.setFrames(1,1,1,1);
                    } 
                    else {
                        checkbox.d1.setFrames(2,0,1,0);
                    }
                    gang1.d = d;
                }
                gang1.previousSpeed = speed;
            }
            if ( key === 'g2' ) {
                if ( gang2.speed !== speed) {
                    sliderBarG2.y = positionGang2.y + 11 - (154 / 700) * (speed - 700); //back-calculate sliderbar position from speed normalized over the range of slider track y-values
                    gang2.speed = speed;
                }
                if ( gang2.a !== a ) {
                    if (a === true) {
                        checkbox.a2.setFrames(1,1,1,1);
                    } 
                    else {
                        checkbox.a2.setFrames(2,0,1,0);
                    }
                    gang2.a = a;
                }
                if ( gang2.b !== b ) {
                    if (b === true) {
                        checkbox.b2.setFrames(1,1,1,1);
                    } 
                    else {
                        checkbox.b2.setFrames(2,0,1,0);
                    }
                    gang2.b = b;
                }
                if ( gang2.c !== c ) {
                    if (c === true) {
                        checkbox.c2.setFrames(1,1,1,1);
                    } 
                    else {
                        checkbox.c2.setFrames(2,0,1,0);
                    }
                    gang2.c = c;
                }
                if ( gang2.d !== d ) {
                    if (d === true) {
                        checkbox.d2.setFrames(1,1,1,1);
                    } 
                    else {
                        checkbox.d2.setFrames(2,0,1,0);
                    }
                    gang2.d = d;
                }
                gang2.previousSpeed = speed;
            }
        }

        /* Update set speeds and slider positions for all users */
        function updateSpeed (key, speed) {
            console.log ("updating speed of motor " + key + " to " + speed);
            if ( key === 'a' ) { 
                motorA.speed = speed;
                sliderBarA.y = positionMotorA.y + 11 - (154 / 700) * (speed - 700); //back-calculate sliderbar position from speed normalized over the range of slider track y-values
                motorA.previousSpeed = speed;
            }
            if ( key === 'b') { 
                motorB.speed = speed;
                sliderBarB.y = positionMotorB.y + 11 - (154 / 700) * (speed - 700); 
                motorB.previousSpeed = speed;
            }
            if ( key === 'c') { 
                motorC.speed = speed;
                sliderBarC.y = positionMotorC.y + 11 - (154 / 700) * (speed - 700); 
                motorC.previousSpeed = speed;
            }
            if ( key === 'd') { 
                motorD.speed = speed;
                sliderBarD.y = positionMotorD.y + 11 - (154 / 700) * (speed - 700); 
                motorD.previousSpeed = speed;
            }
        }

        /* Rotation of motor position dials */
        function moveDial (key, direction) { // Move the dial in realtime in all users' dashboards: this is an approximation based on the previous needle position and the current speed and direction
            var tapprox = 30;
            if ( key === 'a' ) {
                var t2a = game.time.time;
                var taDelta = t2a - t1.a; //change in time in milliseconds
                if (taDelta >= 50) {
                    taDelta = tapprox; // approximate, when the time difference is too large (when starting a motor either for the first time or after a break)
                // instead of using tapprox; 
                }
                if (direction === 'f') {
                    needleA.angle = needleA.angle + motorA.speed*taDelta/1000; //clockwise
                }
                else if (direction === 'r') {
                    needleA.angle = needleA.angle - motorA.speed*taDelta/1000; //counterclockwise
                }
                t1.a = t2a; // the next t1 will be equal to the most recent t2 (this will be used in calculating tdelta when continuously running of a motor)
            }
            if ( key === 'b' ) {
                var t2b = game.time.time;
                var tbDelta = t2b - t1.b;
                if (tbDelta >= 50) {
                    tbDelta = tapprox; 
                }                
                if (direction === 'f') {
                    needleB.angle = needleB.angle + motorB.speed*tbDelta/1000;
                }
                else if (direction === 'r') {
                    needleB.angle = needleB.angle - motorB.speed*tbDelta/1000;
                }
                t1.b = t2b;
            }
            if ( key === 'c' ) {
                var t2c = game.time.time;
                var tcDelta = t2c - t1.c;
                if (tcDelta >= 50) {
                    tcDelta = tapprox; 
                } 
                if (direction === 'f') {
                    needleC.angle = needleC.angle + motorC.speed*tcDelta/1000;
                }
                else if (direction === 'r') {
                    needleC.angle = needleC.angle - motorC.speed*tcDelta/1000;
                }
                t1.c = t2c;
            }
            if ( key === 'd' ) {
                var t2d = game.time.time;
                var tdDelta = t2d - t1.d;
                if (tdDelta >= 50) {
                    tdDelta = tapprox; 
                } 
                if (direction === 'f') {
                    needleD.angle = needleD.angle + motorD.speed*tdDelta/1000;
                }
                else if (direction === 'r') {
                    needleD.angle = needleD.angle - motorD.speed*tdDelta/1000;
                }
                t1.d = t2d;
            }
        } 
        function updateDial (key, motorData) { // Update the dial once the motor stops, at the next nearest second when the bot sends out a position value (this is more accurate)
        // May need to comment out this function this while the robot is not running. We'll figure out a way to first determine if the robot is running and connected
            if ( key === 'a' && typeof(motorData) !== "undefined" ) {
                if ( motorData.moving === false ) {
                    needleA.angle = motorData.position; //value that was published to channel by bot
                }
            }
            if ( key === 'b' && typeof(motorData) !== "undefined" ) {
                if ( motorData.moving === false) {
                    needleB.angle = motorData.position;
                }
            }
            if ( key === 'c' && typeof(motorData) !== "undefined" ) {
                if ( motorData.moving === false) {
                    needleC.angle = motorData.position;
                }
            }
            if ( key === 'd' && typeof(motorData) !== "undefined" ) {
                if ( motorData.moving === false) {
                    needleD.angle = motorData.position;
                }
            }
        }

        /* Get key-value pairs from the dashboard keyspace and do things with them */
        function getDashboardValues (key, val) {
            if ( key === 'a' ) {
                if ( motorA.speed !== val.speed && motorA.previousSpeed !== val.speed ) { // don't change anything again in the dashboard of the user who changed the speed, only in the others' dashboards
                    updateSpeed(key, val.speed);
                }
            }
            if ( key === 'b' ) {
                if ( motorB.speed !== val.speed && motorB.previousSpeed !== val.speed ) {
                    updateSpeed(key, val.speed);
                }
            }
            if ( key === 'c' ) {
                if ( motorC.speed !== val.speed && motorC.previousSpeed !== val.speed ) {
                    updateSpeed(key, val.speed);
                }
            }
            if ( key === 'd' ) {
                if ( motorD.speed !== val.speed && motorD.previousSpeed !== val.speed ) {
                    updateSpeed(key, val.speed);
                }
            }
            if ( key === 'g1' ) {
                if ( gang1.a !== val.a || gang1.b !== val.b || gang1.c !== val.c || gang1.d !== val.d ) { // adjust only if gang 1 checkboxes change
                    updateGang(key, val.speed, val.a, val.b, val.c, val.d);
                } 
                if ( gang1.previousSpeed !== val.speed && gang1.speed !== val.speed ) { // adjust only only if gang 1 speed changes
                    updateGang(key, val.speed, val.a, val.b, val.c, val.d);
                } 
            }
            if ( key === 'g2' ) {
                if ( gang2.a !== val.a || gang2.b !== val.b || gang2.c !== val.c || gang2.d !== val.d ) {
                    updateGang(key, val.speed, val.a, val.b, val.c, val.d);
                }
                if ( gang2.previousSpeed !== val.speed && gang2.speed !== val.speed ) {
                    updateGang(key, val.speed, val.a, val.b, val.c, val.d);
                }
            } 
        }

        function getDialValues (key, val) {
            if ( key === 'a' ) {
                if ( val.direction === 'f' || val.direction === 'r' ) {
                    moveDial ('a', val.direction); //smooth-ish linear interpolation
                } else if ( val.direction === "stopped" ) {
                    channel.getKeyspace('dashboard').put('a', { 'speed': motorA.speed }); // get rid of direction value until the motor's moving again (so this doesn't keep running), by replacing the key with only a speed value
                    var motorDataA = channel.channelData.get('a');
                    updateDial ('a', motorDataA); // update at the next second to the value in the message sent by the bot
                }
            }
            if ( key === 'b' ) {
                if ( val.direction === 'f' || val.direction === 'r' ) {
                    moveDial ('b', val.direction);
                } else if ( val.direction === "stopped" ) {
                    channel.getKeyspace('dashboard').put('b', { 'speed': motorB.speed }); 
                    var motorDataB = channel.channelData.get('b');
                    updateDial ('b', motorDataB); 
                }
            }
            if ( key === 'c' ) {
                if ( val.direction === 'f' || val.direction === 'r' ) {
                    moveDial ('c', val.direction); 
                } else if ( val.direction === "stopped" ) {
                    channel.getKeyspace('dashboard').put('c', { 'speed': motorC.speed }); 
                    var motorDataC = channel.channelData.get('c');
                    updateDial ('c', motorDataC); 
                }
            }
            if ( key === 'd' ) {
                if ( val.direction === 'f' || val.direction === 'r' ) {
                    moveDial ('d', val.direction);
                } else if ( val.direction === "stopped" ) {
                    channel.getKeyspace('dashboard').put('d', { 'speed': motorD.speed }); 
                    var motorDataD = channel.channelData.get('d');
                    updateDial ('d', motorDataD);
                }
            }
        }

        function update() {
            /* DASHBOARD STUFF */
            // note: keyspaces contain key-value pairs. A value in a key-value pair must be a JSON object with pairs of property names and values
            // example: // keyspace name: 'dashboard', key: 'a', value: '{speed: 0, position: 0}' and key: 'b', value: '{speed: 0, position: 0}', 'c', 'd', etc 
            /* Add something to show the set speed of a motor on all users' dashboards whenever a user adjusts it. Show it on the slider */
            if (sliderBarState.a === "up") { // this is to partially eliminate the glitch in the dashboard of the user who changed the speed
                var dashMotorA = channel.getKeyspace('dashboard').get('a'); 
                if ( typeof(dashMotorA) !== "undefined" ) {
                    getDashboardValues('a', dashMotorA);
                }               
            }
            if (sliderBarState.b === "up") {
                var dashMotorB = channel.getKeyspace('dashboard').get('b');
                if ( typeof(dashMotorB) !== "undefined" ) {
                    getDashboardValues('b', dashMotorB);
                }
            }
            if (sliderBarState.c === "up") {
                var dashMotorC = channel.getKeyspace('dashboard').get('c'); 
                if ( typeof(dashMotorC) !== "undefined" ) {
                    getDashboardValues('c', dashMotorC);
                }
            }
            if (sliderBarState.d === "up") {
                var dashMotorD = channel.getKeyspace('dashboard').get('d'); 
                if ( typeof(dashMotorD) !== "undefined" ) {
                    getDashboardValues('d', dashMotorD);
                }
            }
            // NEXT, WE CAN ADD A SIMILAR FEATURE FOR THE 2 MOTORS GANGS, TO HANDLE THEIR CURRENT SPEEDS (+/- BUTTONS AND SLIDERS) AND THE MOTORS THEY CURRENT CONTAIN (CHECKBOXES)
            if (sliderBarState.g1 === "up") {
                var dashGang1 = channel.getKeyspace('dashboard').get('g1'); 
                if ( typeof(dashGang1) !== "undefined" ) {
                    getDashboardValues('g1', dashGang1);
                }
            }
            if (sliderBarState.g2 === "up") {
                var dashGang2 = channel.getKeyspace('dashboard').get('g2'); 
                if ( typeof(dashGang2) !== "undefined" ) {
                    getDashboardValues('g2', dashGang2);
                }
            }

            var dialDataA = channel.getKeyspace('dashboard').get('a'); 
            if ( typeof(dialDataA) !== "undefined" ) {
                getDialValues('a', dialDataA);
            }
            var dialDataB = channel.getKeyspace('dashboard').get('b');
            if ( typeof(dialDataB) !== "undefined" ) {
                getDialValues('b', dialDataB);
            }
            var dialDataC = channel.getKeyspace('dashboard').get('c'); 
            if ( typeof(dialDataC) !== "undefined" ) {
                getDialValues('c', dialDataC);
            }
            var dialDataD = channel.getKeyspace('dashboard').get('d'); 
            if ( typeof(dialDataD) !== "undefined" ) {
                getDialValues('d', dialDataD);
            }

             // get text from DialA text area      
            userDialA = document.getElementById("textSpinA").innerHTML;
            // get text from text editor text area
            theirCode = document.getElementById("theirCode").innerHTML;
            // if user entered multiple lines, remove "<br>" tags that are read from the .innerHTML method
            theirCode = theirCode.replace(/<br>/g, "");

            //  on click of submit button ...
            document.getElementById("subButton").onclick = function() {
                // if DialA text is not a number, output error in error message area
                if (isNaN(parseFloat(userDialA, 10))) {
                    document.getElementById("errorMsg").innerHTML = userDialA + " is not a number";
                }
                // remove error message if previously had an error but then fixed it
                else {
                    document.getElementById("errorMsg").innerHTML = "";
                }

                // try to evalate user's input code in text editor area
                try {
                    eval(theirCode);
                }
                // if input code is not able to be run, display console's error message to user in text editor area
                catch(err) {
                    document.getElementById("errorMsg").innerHTML = "Error: " + err.message;
                }

                // evaluate their input code
                eval(theirCode);
            }


            if ( cursorOverEditor ) {
                this.game.input.keyboard.disabled = true; // allow users to type in the text editor, w/o affecting dashboard keyboard controls
            }
            else {
                this.game.input.keyboard.disabled = false; // allow users to again control the dashboard with the keyboard, w/o typing in the text editor
            }

        } // end update

        $("#textEditor").hover( function () { // code for while hovering over textEditor
            cursorOverEditor = true;
            console.log(cursorOverEditor);
        }, function() { // code for while not hovering over textEditor
            cursorOverEditor = false;
            console.log(cursorOverEditor);
        });

    } // end beginGame


}); // end require


