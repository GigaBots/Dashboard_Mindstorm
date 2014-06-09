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

    var botStore = {};

    client.connectAnonymous("thegigabots.app.bigbang.io:80", function(result) {
        if( result.success) {
           client.subscribe("newBot", function( err, c) {
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
        var game = new Phaser.Game(960, 646, Phaser.AUTO, "gameWorld", { // 960 x 700 fits alright horizontally on an iPhone 4 and an iPad 
            preload: preload, //Since this is likely the small phone screen anyone would be using, it's important to consider, since we currently have the issue of not scrolling about the Phaser game world window
            create: create,
            update: update,
            //render: render,
            //paused: paused,
            //destroy: destroy
        }, true); // final "true" value notes that background should be transparent


        var getKeyspaceButton;


        channel.onSubscribers( function(joined) {
           // subscribeBotUser(joined);
            console.log('join ' + joined);

            var roboInfo = channel.getKeyspace(joined).get('robot');

            if( roboInfo ) {
                botStore[joined] = roboInfo.ev3.name;
            }
            channel.getKeyspace(joined).on('robot', function(val) {
                botStore[joined] = val.ev3.name;
            });
        }, function(left) {
            console.log("leave " + left);
            delete botStore[left];
         });

        var gameBoundX = 960, gameBoundY = 646;
        var bbLogo, botLogo, dashboardTitle, allRightsReserved;

        var labelStyle = { font: "12px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc" }
        var labelStyle2 = { font: "20px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc" }        
        var labelStyle3 = { font: "16px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc"}
        var labelStyle4 = { font: "20px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#414242" } 
        var labelStyle5 = { font: "14px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#313233"}        
        var labelStyle6 = { font: "italic 13px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#ff5000" }
        var messageStyle = { font: "14px Lucida Console, Courier New, Monaco, monospace, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#080808"}   
        var frameLineColor = 0xa3a3a3, frameFill = 0x313233, frameOpacity = 0.8;
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
        var botDropdown, dropdownBox;
        //var droppedDown = false;
        var dropHighlight = { 1 : 0 }
        var botLabels = new Array();
        var botId = "";
        var botName = 'Select a robot';
        var bot = {
            nameDisplay : ""
        }
        var botStore = { //formated as:
            // client id (GUID) : bot name
        }
        var dropdown;
      
        /* Individual motor controls and feedback */
        var frameMotor;
        var positionMotorA = { x : 15, y : 226 }
        var positionMotorB = { x : 295, y : 226 }
        var positionMotorC = { x : 15, y : 439 }
        var positionMotorD = { x : 295, y : 439 }
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
        var sliderIncrements = { a : '', b : '', c : '', d : '', g1 : '', g2 : ''}
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
        var positionDial = { x : 674, y : 133 }
        var t1 = { a : 0, b : 0, c : 0, d : 0 }

        /* Ganging motors together */
        var frameMotorGanging, frameMotorGang1, frameMotorGang2;
        var labelMotorGang;
        var positionGang = { x : 970, y : 66 }
        var positionGang1 = { x : 575, y: 226 } 
        var positionGang2 = { x : 575, y: 439 } 
        var checkbox;
        var fGangButton, rGangButton;

        var motorA = {
            port: 'a',
            status : 1,
            speed : 0,
            position : 0,
            gang: 0, // 0 = not ganged with other motors, 1 = joined in gang 1, or 2 = joined in gang 2
            stalled: false,
            previousSpeed : 0,
            speedDisplay : ''
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
        var positionTouch = { x : 443, y : 133 }
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
        var positionColor = { x : 217, y : 133 }
        var labelColor = "Color Sensor", labelColorR = "Red: ", labelColorB = "Blue: ", labelColorG = "Green: ", labelColorValue = "RGB: ", labelColorName = "Color: ", labelIntensity = "Light Intensity: ";
        var colorRDisplay = 0, colorGDisplay = 0, colorBDisplay = 0;
        var color = {
            r : 0,
            g : 0,
            b : 0,
            value : 0,
            name : '',
            lightIntensity : 0
        }
        var color = {
            rDisplay : 0,
            gDisplay : 0,
            bDisplay : 0,
            valueDisplay : 0,
            nameDisplay : '',
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
        var frameBattery, labelBattery = "Battery Level", batteryOutline, batteryLevel = 1; //initialize the level at 100% (or, 1)
        var positionBattery = { x : 821, y : 66 }

        /* LCD Screen */
        var frameScreen, LCDScreenBox;
        var positionScreen = { x : 15, y : 133 }
        var labelScreen = "LCD Screen";
        var screenMessage = {
            messageDisplay1 : "",
            messageDisplay2 : "",
            messageDisplay3 : ""
        }

        /* === Text editor stuff === */
        var userType;
        var userNum;
        var currentCode;
        var codeError;
        var clicked = false;
        // array for textEditor code inputs to be stored, first dimension is input, second is output
        var codeArray = [,];
        var iterationNum = 0;
        // element to determine which code to display for "up" and "down" presses
        var indexArray = iterationNum;
        // user's code if uses "up" arrow but didn't hit submit before doing so.
        var tempCode;

        //===================================================

        function listenToBot() { // this is called once the user selects a bot

            channel.getKeyspace(botId).onValue(function (key, val) {
                //console.log("Add:" + key +"->"+JSON.stringify(val) );
                if ( key === 'a' ||  key ==='b' || key ==='c' || key === 'd') {
                    setMotorInfo(key, val);
                }
                else if ( key === 'S1' || key === 'S2' || key === 'S3' || key === 'S4' ) {
                    if ( val.sensorType === 'lejos.hardware.sensor.EV3IRSensor' ) {
                        setIRSensor(val);
                    }
                    else if ( val.sensorType === 'lejos.hardware.sensor.EV3TouchSensor' ) {
                        setTouchSensor(val);
                    }
                    else if ( val.sensorType === 'lejos.hardware.sensor.EV3ColorSensor' ) {
                        setColorSensor(val);
                    }
                }
                else if ( key === 'robot' ) {
                    setBatteryLevel(val.ev3.power);
                }
                else if ( key === 'distance') {
                    setUltrasonicSensor(val);
                }

            }, function (key, val) {
                //console.log("Update:" + key +"->"+JSON.stringify(val));
                if ( key === 'a' ||  key ==='b' || key ==='c' || key === 'd') {
                    setMotorInfo(key, val);
                }
                else if ( key === 'S1' || key === 'S2' || key === 'S3' || key === 'S4' ) {
                    if ( val.sensorType === 'lejos.hardware.sensor.EV3IRSensor' ) {
                        setIRSensor(val);
                    }
                    else if ( val.sensorType === 'lejos.hardware.sensor.EV3TouchSensor' ) {
                        setTouchSensor(val);
                    }
                    else if ( val.sensorType === 'lejos.hardware.sensor.EV3ColorSensor' ) {
                        setColorSensor(val);
                    }
                }
                else if ( key === 'robot') {
                        setBatteryLevel(val.ev3.power);
                }
                else if ( key === 'distance') {
                    setUltrasonicSensor(val);
                }
            }, function (key) {
                //console.log("Delete:" + key);
            });

        }

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
                if( val.values[0] === 1 ) {
                    touchIndicator.animations.play('pressed');
                    game.world.remove(touch.touchCountDisplay);
                    touchCount++;
                    touchCountDisplay = touchCount;
                    touch.touchCountDisplay = game.add.text(positionTouch.x+179, positionTouch.y+22, touchCountDisplay, labelStyle3);
                    channel.getKeyspace(botId).put('touchDash', { 'touchCount' : touchCount });
                }
                else {
                    touchIndicator.animations.play('up');
                }
        }

        function setColorSensor( val ) {
            game.world.remove(color.rDisplay);
            game.world.remove(color.gDisplay);
            game.world.remove(color.bDisplay);
            //game.world.remove(color.valueDisplay);
            //game.world.remove(color.nameDisplay);
            //game.world.remove(color.lightIntensityDisplay);
            color.r = val.values[0];
            color.g = val.values[1];
            color.b = val.values[2];
            colorRDisplay = color.r;
            colorGDisplay = color.g;
            colorBDisplay = color.b;
            color.rDisplay = game.add.text(positionColor.x+45, positionColor.y+22, colorRDisplay.toFixed(1), labelStyle3);
            //color.gDisplay = game.add.text(positionColor.x+65, positionColor.y+22, colorGDisplay.toFixed(1), labelStyle3);
            //color.bDisplay = game.add.text(positionColor.x+85, positionColor.y+22, colorBDisplay.toFixed(1), labelStyle3);
        }
        function setIRSensor( val ) {
            game.world.remove(IR.IRDistDisplay);
            IRDist = val.values[0];
            IRDistDisplay = IRDist;
            IR.IRDistDisplay = game.add.text(positionIR.x+71, positionIR.y+24, IRDistDisplay.toFixed(2), labelStyle3);
        }
        function setUltrasonicSensor( val ) {
            ultrasonicDist = val.distance;
            game.world.remove(ultrasonic.ultrasonicDistDisplay);
            ultrasonicDistDisplay = ultrasonicDist;
            ultrasonic.ultrasonicDistDisplay = game.add.text(positionUltrasonic.x+71, positionUltrasonic.y+24, ultrasonicDistDisplay.toFixed(1), labelStyle3);
        }
        function setBatteryLevel( val ) {
            batteryLevel = (val.voltage - 5) / (9 - 5); //9 V battery (6 AAs), and the robot dies around 5V
            if (batteryLevel <= 0.15) { // for almost-dead battery!
                if(batteryLevel > -0.01) { //lower boundary limit, with a little safety net for inaccuracy/error
                    batteryLevelFill.destroy();
                    batteryLevelFill = game.add.graphics(0,0);
                    batteryLevelFill.beginFill(0xFF0000, 1); // make the fill red!
                    batteryLevelFill.drawRect(positionBattery.x+11, positionBattery.y+30, Math.round(batteryLevel*100), 16);
                }
            }
            else if (batteryLevel <= 1.01) { //upper boundary limit, with a little safety net for inaccuracy/error
                if(batteryLevel > 0.1) { //lower boundary limit
                    batteryLevelFill.destroy();
                    batteryLevelFill = game.add.graphics(0,0);
                    batteryLevelFill.beginFill(0x808080, 1); // make fill grey
                    batteryLevelFill.drawRect(positionBattery.x+11, positionBattery.y+30, Math.round(batteryLevel*100), 16);
                }
            }
            channel.getKeyspace(botId).put('batteryDash', { 'batteryLevel' : batteryLevel });
        }

        /* Bot selection */
        Object.size = function(obj) { // get size of an object
            var size = 0, key;
            for (key in obj) {
                if(obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
        function actionDropdown() {
            var numBots = Object.size(botStore);
            botDropdown.setFrames(2,2,2,2);
            //droppedDown = true;
            dropdownBox = game.add.graphics(0,0);
            dropdownBox.beginFill(0xFFFFFF,0.8);
            dropdownBox.drawRect(positionBotSelector.x+5, positionBotSelector.y+29, 150, numBots*24); //24 is height of a row (the highlight "button")
            var j =0;
            for ( var key in botStore ) {
                var obj = botStore[key];
                var name = botStore[key];
                dropHighlight[j] = game.add.button(positionBotSelector.x+5, positionBotSelector.y+29+24*j, 'highlighter');
                dropHighlight[j].setFrames(0,2,1,2);
                dropHighlight[j].events.onInputDown.add(actionSelectBot, key);
                dropHighlight[j].input.useHandCursor = true;
                botLabels[j] = game.add.text(positionBotSelector.x+8, positionBotSelector.y+31+24*j, name, labelStyle5);
                j++;
            }
            botDropdown.input.stop();
            dropdown = {
                noBotSelection : game.add.button(positionBotSelector.x+5, positionBotSelector.y+5, 'botDropdown')
            }
            dropdown.noBotSelection.events.onInputDown.add(actionNoBotSelection);
            dropdown.noBotSelection.setFrames(2,2,2,2);
            dropdown.noBotSelection.input.useHandCursor = true;
        }
        function actionSelectBot() {
            console.log("selected bot with clientId " + this + " and name " + botStore[this]);
            dropdownBox.destroy();
            dropdown.noBotSelection.destroy();
            var numBots = Object.size(botStore);
            for ( var j = 0; j < numBots; j++ ) {
                botLabels[j].destroy();
                dropHighlight[j].destroy();
            }
            botId = this.toString(); //for some reason the botId was becoming a JSON object of the clientId string's letters without this
            botName = botStore[this];
            listenToBot(); // start listening to the bot that was just selected
            getInitialTouchCount();
            getInitialBatteryLevel();
            game.world.remove(bot.nameDisplay);
            bot.nameDisplay = game.add.text(positionBotSelector.x+5, positionBotSelector.y+33, botName, labelStyle);
            botDropdown.input.start();
            botDropdown.setFrames(1,0,2,0);
            botDropdown.input.useHandCursor = true;
            //droppedDown = false;
        }
        function actionNoBotSelection() {
            dropdownBox.destroy();
            dropdown.noBotSelection.destroy();
            var numBots = Object.size(botStore);
            for ( var j = 0; j < numBots; j++ ) {
                botLabels[j].destroy();
                dropHighlight[j].destroy();
            }
            botDropdown.input.start();
            botDropdown.setFrames(1,0,2,0);
            botDropdown.input.useHandCursor = true;
            //droppedDown = false;
        }

        /* Initialization of touch sensor display and battery display on dashboard */
        function getInitialTouchCount() {
            var touchCountData = channel.getKeyspace(botId).get('touchDash'); // get the current touch count
            setInitialTouchCount('touchDash', touchCountData);
        }
        function setInitialTouchCount( key, val ) {
            game.world.remove(touch.touchCountDisplay);
            if ( typeof(val) !== "undefined" ) {
                touchCount = touchCountDisplay = val.touchCount;
                touch.touchCountDisplay = game.add.text(positionTouch.x+179, positionTouch.y+22, touchCountDisplay, labelStyle3);
            }
        }
        function getInitialBatteryLevel() {
            var batteryLevelData = channel.getKeyspace(botId).get('batteryDash'); // get the current battery level, before occassional updates
            setInitialBatteryLevel('batteryDash', batteryLevelData);
        }
        function setInitialBatteryLevel( key, val ) { // set the current battery level if it exists (it's ben calculated in a dashboard somewhere)
            if ( typeof(val) !== 'undefined' ) {
                batteryLevel = val.batteryLevel;
                if (batteryLevel <= 0.15) { // for almost-dead battery!
                    if(batteryLevel > -0.01) { //lower boundary limit, with a little safety net for inaccuracy/error
                        batteryLevelFill.destroy();
                        batteryLevelFill = game.add.graphics(0,0);
                        batteryLevelFill.beginFill(0xFF0000, 1); // make the fill red!
                        batteryLevelFill.drawRect(positionBattery.x+11, positionBattery.y+30, Math.round(batteryLevel*100), 16);
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
            game.load.image('sliderBar','assets/gigabot_dashboard_slider_bar.png', 65, 14);
            game.load.image('sliderBar2','assets/gigabot_dashboard_slider_bar_2.png', 65, 13);
            game.load.image('needle','assets/gigabot_dashboard_needle.png', 5, 26);
            game.load.image('dialFace', 'assets/gigabot_dashboard_dial_face.png', 52, 52);
            game.load.image('screenInputButton', 'assets/buttons/gigabot_dashboard_button_lcd_screen_input.png', 43, 22);
            game.load.image('gigabotSm', 'assets/gigabots_logo_colors_sm_on_dark.png', 48, 48);
            game.load.image('dragButton','assets/buttons/gigabot_dashboard_drag_button.png', 24, 14);
            game.load.image('title','assets/gigabot_dashboard_title_on_dark.png', 400, 50);
            game.load.image('poweredBy','assets/powered_by_big_bang_on_dark.png', 205, 50);
            game.load.spritesheet('statusButton','assets/buttons/gigabot_dashboard_button_status_spritesheet.png', 63,25);
            game.load.image('resume','assets/resume_message.png',502,49);
            game.load.spritesheet('botDropdown','assets/buttons/gigabot_dashboard_button_dropdown.png',101,25);
            game.load.spritesheet('highlighter','assets/buttons/dropdown_highlight_spritesheet.png',151,25);
            game.load.image('sliderIncrements','assets/slider_increments.png',52,156);
            game.load.image('batteryOutline','assets/battery_outline.png',110,22);
        } //end preload

    //==============================================================================================================================
        function create() {            
//            getKeyspaceButton = game.add.button(400,10,'highlighter', actionGetKeyspace);

            this.game.stage.disableVisibilityChange = true;
            game.input.keyboard.disabled = false;
            game.world.setBounds(0, 0, gameBoundX, gameBoundY);
            game.input.onDown.add(function () {
                if ( this.game.paused ) {
                    this.game.paused = false;
                    dashboardStatus = 1;
                    game.world.remove(status.statusDisplay);
                    labelStatusDisplay = "running...";
                    status.statusDisplay = game.add.text(positionStatus.x+5, positionStatus.y+33, labelStatusDisplay, labelStyle);
                    statusButton.setFrames(1,0,0,0);
                    resume.resumeMessageDisplay.destroy();
                    resume.resumeOverlay.destroy();
                }
            }, this);

        /* Title */
            dashboardTitle = game.add.sprite(75,8,'title');
            botLogo = game.add.sprite(15,9,'gigabotSm');
            poweredBy = game.add.sprite(740,8,'poweredBy');

        /* Frames */
            frameMotorStatus = game.add.graphics(0,0);
            frameMotorStatus.lineStyle(1, frameLineColor, 1);
            frameMotorStatus.beginFill(frameFill,frameOpacity);
            frameMotorStatus.drawRect(positionMotorStatus.x, positionMotorStatus.y, 130, 57);

            frameSensorStatus = game.add.graphics(0,0);
            frameSensorStatus.lineStyle(1, frameLineColor, 1);
            frameSensorStatus.beginFill(frameFill,frameOpacity);
            frameSensorStatus.drawRect(positionSensorStatus.x, positionSensorStatus.y, 130, 57);

            frameStatus = game.add.graphics(0,0);
            frameStatus.lineStyle(1, frameLineColor, 1);
            frameStatus.beginFill(frameFill,frameOpacity);
            frameStatus.drawRect(positionStatus.x, positionStatus.y, 72, 57);

            frameBotSelector = game.add.graphics(0,0);
            frameBotSelector.lineStyle(1, frameLineColor, 1);
            frameBotSelector.beginFill(frameFill,frameOpacity);
            frameBotSelector.drawRect(positionBotSelector.x, positionBotSelector.y, 110, 57);

            frameMotor = {
                a : game.add.graphics(0,0),
                b : game.add.graphics(0,0),
                c : game.add.graphics(0,0),
                d : game.add.graphics(0,0),
            }

            frameMotor.a.lineStyle(1, frameLineColor, 1);
            frameMotor.a.beginFill(frameFill,frameOpacity);
            frameMotor.a.drawRect(positionMotorA.x, positionMotorA.y, 270, 203);

            frameMotor.b.lineStyle(1, frameLineColor, 1);
            frameMotor.b.beginFill(frameFill,frameOpacity);
            frameMotor.b.drawRect(positionMotorB.x, positionMotorB.y, 270, 203);

            frameMotor.c.lineStyle(1, frameLineColor, 1);
            frameMotor.c.beginFill(frameFill,frameOpacity);
            frameMotor.c.drawRect(positionMotorC.x, positionMotorC.y, 270, 203);

            frameMotor.d.lineStyle(1, frameLineColor, 1);
            frameMotor.d.beginFill(frameFill,frameOpacity);
            frameMotor.d.drawRect(positionMotorD.x, positionMotorD.y, 270, 203);

            frameTouch = game.add.graphics(0,0);
            frameTouch.lineStyle(1, frameLineColor, 1);
            frameTouch.beginFill(frameFill,frameOpacity);
            frameTouch.drawRect(positionTouch.x, positionTouch.y, 221, 83);

            frameIR = game.add.graphics(0,0);
            frameIR.lineStyle(1, frameLineColor, 1);
            frameIR.beginFill(frameFill,frameOpacity);
            frameIR.drawRect(positionIR.x, positionIR.y, 152, 57);

            frameUltrasonic = game.add.graphics(0,0);
            frameUltrasonic.lineStyle(1, frameLineColor, 1);
            frameUltrasonic.beginFill(frameFill,frameOpacity);
            frameUltrasonic.drawRect(positionUltrasonic.x, positionUltrasonic.y, 152, 57);

            frameColor = game.add.graphics(0,0);
            frameColor.lineStyle(1, frameLineColor, 1);
            frameColor.beginFill(frameFill,frameOpacity);
            frameColor.drawRect(positionColor.x, positionColor.y, 216, 83);

            frameBattery = game.add.graphics(0,0);
            frameBattery.lineStyle(1, frameLineColor, 1);
            frameBattery.beginFill(frameFill,frameOpacity);
            frameBattery.drawRect(positionBattery.x, positionBattery.y, 124, 57);

            frameScreen = game.add.graphics(0,0);
            frameScreen.lineStyle(1, frameLineColor, 1);
            frameScreen.beginFill(frameFill,frameOpacity);
            frameScreen.drawRect(positionScreen.x, positionScreen.y, 192, 83);

            frameMotorGang1 = game.add.graphics(0,0);
            frameMotorGang1.lineStyle(1, frameLineColor, 1);
            frameMotorGang1.beginFill(frameFill,frameOpacity);
            frameMotorGang1.drawRect(positionGang1.x, positionGang1.y, 370, 203);

            frameMotorGang2 = game.add.graphics(0,0);
            frameMotorGang2.lineStyle(1, frameLineColor, 1);
            frameMotorGang2.beginFill(frameFill,frameOpacity);
            frameMotorGang2.drawRect(positionGang2.x, positionGang2.y, 370, 203);

            frameDials = game.add.graphics(0,0);
            frameDials.lineStyle(1, frameLineColor, 1);
            frameDials.beginFill(frameFill,frameOpacity);
            frameDials.drawRect(positionDial.x, positionDial.y, 271, 83);

        /* Labels */
            labelMotorStatus = game.add.text(positionMotorStatus.x+37, positionMotorStatus.y+2, labelMotorStatus, labelStyle3); //label at top of box indicating status of motor ports
            labelA = game.add.text(positionMotorStatus.x+14, positionMotorStatus.y+37, labelMotors.a, labelStyle);
            labelB = game.add.text(positionMotorStatus.x+44, positionMotorStatus.y+37, labelMotors.b, labelStyle);
            labelC = game.add.text(positionMotorStatus.x+74, positionMotorStatus.y+37, labelMotors.c, labelStyle);
            labelD = game.add.text(positionMotorStatus.x+104, positionMotorStatus.y+37, labelMotors.d, labelStyle);

            labelSensorStatus = game.add.text(positionSensorStatus.x+33, positionSensorStatus.y+2, labelSensorStatus, labelStyle3); //label at top of box indicating status of motor ports
            label1 = game.add.text(positionSensorStatus.x+15, positionSensorStatus.y+37, labelSensors.e, labelStyle);
            label2 = game.add.text(positionSensorStatus.x+45, positionSensorStatus.y+37, labelSensors.f, labelStyle);
            label3 = game.add.text(positionSensorStatus.x+75, positionSensorStatus.y+37, labelSensors.g, labelStyle);
            label4 = game.add.text(positionSensorStatus.x+105, positionSensorStatus.y+37, labelSensors.h, labelStyle);

            status.statusDisplay =  game.add.text(positionStatus.x+5, positionStatus.y+33, statusDisplay, labelStyle);

            bot.nameDisplay = game.add.text(positionBotSelector.x+5, positionBotSelector.y+33, botName, labelStyle6);

            labelMotor.a = game.add.text(positionMotorA.x+10, positionMotorA.y+2, labelMotor.a, labelStyle2);
            labelMotor.b = game.add.text(positionMotorB.x+10, positionMotorB.y+2, labelMotor.b, labelStyle2);
            labelMotor.c = game.add.text(positionMotorC.x+10, positionMotorC.y+2, labelMotor.c, labelStyle2);
            labelMotor.d = game.add.text(positionMotorD.x+10, positionMotorD.y+2, labelMotor.d, labelStyle2);

            labelTouch = game.add.text(positionTouch.x+10, positionTouch.y+2, labelTouch, labelStyle3);
            labelTouched = game.add.text(positionTouch.x+10, positionTouch.y+25, labelTouched, labelStyle);
            labelTouchCount = game.add.text(positionTouch.x+94, positionTouch.y+25, labelTouchCount, labelStyle); // there is room for 4 characters, so 0 to 9,999. No touching more than that!
            labelBumpCount = game.add.text(positionTouch.x+10, positionTouch.y+50, labelBumpCount, labelStyle);

            labelIR = game.add.text(positionIR.x+10, positionIR.y+2, labelIR, labelStyle3);
            labelIRDist = game.add.text(positionIR.x+10, positionIR.y+27, labelIRDist, labelStyle);
            labelIRUnits = game.add.text(positionIR.x+118, positionIR.y+27, labelIRUnits, labelStyle);

            labelUltrasonic = game.add.text(positionUltrasonic.x+10, positionUltrasonic.y+2, labelUltrasonic, labelStyle3);
            labelUltrasonicDist = game.add.text(positionUltrasonic.x+10, positionUltrasonic.y+27, labelUltrasonicDist, labelStyle);
            labelUltrasonicUnits = game.add.text(positionUltrasonic.x+118, positionUltrasonic.y+27, labelUltrasonicUnits, labelStyle);

            labelColor = game.add.text(positionColor.x+10, positionColor.y+2, labelColor, labelStyle3);
            labelColorValue = game.add.text(positionColor.x+10, positionColor.y+25, labelColorValue, labelStyle);
            labelColorName = game.add.text(positionColor.x+106, positionColor.y+25, labelColorName, labelStyle);
            labelIntensity = game.add.text(positionColor.x+10, positionColor.y+50, labelIntensity, labelStyle);

            labelBattery = game.add.text(positionBattery.x+10, positionBattery.y+2, labelBattery, labelStyle3);
            
            labelScreen = game.add.text(positionScreen.x+10, positionScreen.y+2, labelScreen, labelStyle3);

            /* Ganging motors together */
            labelMotorGang = {
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

            /* Select which robot to control */
            botDropdown = game.add.button(positionBotSelector.x+5, positionBotSelector.y+5, 'botDropdown');
            botDropdown.events.onInputDown.add(actionDropdown);
            botDropdown.setFrames(1,0,2,0);
            botDropdown.input.useHandCursor = true;

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
                moveMotor( botId, this.port, "f", this.speed );
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
                stopMotor( botId, this.port ); 
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
                moveMotor( botId, this.port, "r", this.speed );
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
                stopMotor( botId, this.port );
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
                    moveMotor( botId, "a", "f", this.speed );
                }
                if ( this.b === true) {
                    motorB.previousSpeed = motorB.speed = this.speed;
                    moveMotor( botId, "b", "f", this.speed );
                }
                if ( this.c === true) {
                    motorC.previousSpeed = motorC.speed = this.speed;
                    moveMotor( botId, "c", "f", this.speed );
                }
                if ( this.d === true) {
                    motorD.previousSpeed = motorD.speed = this.speed;
                    moveMotor( botId, "d", "f", this.speed );
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
                    stopMotor(botId, "a");
                }
                if ( this.b === true) {
                    stopMotor(botId, "b");
                }
                if ( this.c === true) {
                    stopMotor(botId, "c");
                }
                if ( this.d === true) {
                    stopMotor(botId, "d");
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
                    moveMotor( botId, "a", "r", this.speed );
                }
                if ( this.b === true) {
                    motorB.previousSpeed = motorB.speed = this.speed;
                    moveMotor( botId, "b", "r", this.speed );
                }
                if ( this.c === true) {
                    motorC.previousSpeed = motorC.speed = this.speed;
                    moveMotor( botId, "c", "r", this.speed );
                }
                if ( this.d === true) {
                    motorD.previousSpeed = motorD.speed = this.speed;
                    moveMotor( botId, "d", "r", this.speed );
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
                    stopMotor(botId, "a");
                }
                if ( this.b === true) {
                    stopMotor(botId, "b");
                }
                if ( this.c === true) {
                    stopMotor(botId, "c");
                }
                if ( this.d === true) {
                    stopMotor(botId, "d");
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
            screenInputButton = game.add.button(positionScreen.x+142, positionScreen.y+4, 'screenInputButton', actionInputOnClick);
            screenInputButton.input.useHandCursor = true;

        /* Click and drag motor speed setting & display */
            sliderTrackA = game.add.graphics(0,0);
            sliderTrackA.beginFill(frameLineColor, 1);
            sliderIncrements.a = game.add.sprite(positionMotorA.x+138, positionMotorA.y+16, 'sliderIncrements');
            sliderBarA = game.add.button(positionMotorA.x+133, positionMotorA.y+165, 'sliderBar');
            sliderBarA.inputEnabled=true;
            sliderBarA.input.useHandCursor = true;
            sliderBarA.input.enableDrag();
            sliderBarA.input.allowHorizontalDrag=false;
            sliderBarA.events.onInputUp.add(actionDragOnClickA);
            sliderBarA.events.onInputDown.add(actionDownOnSlideA);

            sliderTrackB = game.add.graphics(0,0);
            sliderTrackB.beginFill(frameLineColor, 1);
            sliderIncrements.b = game.add.sprite(positionMotorB.x+138, positionMotorB.y+16, 'sliderIncrements');
            sliderBarB = game.add.button(positionMotorB.x+133, positionMotorB.y+165, 'sliderBar');
            sliderBarB.inputEnabled=true;
            sliderBarB.input.useHandCursor = true;
            sliderBarB.input.enableDrag();
            sliderBarB.input.allowHorizontalDrag=false;
            sliderBarB.events.onInputUp.add(actionDragOnClickB);
            sliderBarB.events.onInputDown.add(actionDownOnSlideB);
                        
            sliderTrackC = game.add.graphics(0,0);
            sliderTrackC.beginFill(frameLineColor, 1);
            sliderIncrements.c = game.add.sprite(positionMotorC.x+138, positionMotorC.y+16, 'sliderIncrements');
            sliderBarC = game.add.button(positionMotorC.x+133, positionMotorC.y+165, 'sliderBar');
            sliderBarC.inputEnabled=true;
            sliderBarC.input.useHandCursor = true;
            sliderBarC.input.enableDrag();
            sliderBarC.input.allowHorizontalDrag=false;
            sliderBarC.events.onInputUp.add(actionDragOnClickC);
            sliderBarC.events.onInputDown.add(actionDownOnSlideC);

            sliderTrackD = game.add.graphics(0,0);
            sliderTrackD.beginFill(frameLineColor, 1);
            sliderIncrements.d = game.add.sprite(positionMotorD.x+138, positionMotorD.y+16, 'sliderIncrements');
            sliderBarD = game.add.button(positionMotorD.x+133, positionMotorD.y+165, 'sliderBar');
            sliderBarD.inputEnabled=true;
            sliderBarD.input.useHandCursor = true;
            sliderBarD.input.enableDrag();
            sliderBarD.input.allowHorizontalDrag=false;
            sliderBarD.events.onInputUp.add(actionDragOnClickD);
            sliderBarD.events.onInputDown.add(actionDownOnSlideD);

            sliderTrackG1 = game.add.graphics(0,0);
            sliderTrackG1.beginFill(frameLineColor, 1);
            sliderIncrements.g1 = game.add.sprite(positionGang1.x+238, positionGang1.y+16, 'sliderIncrements');
            sliderBarG1 = game.add.button(positionGang1.x+233, positionGang1.y+165, 'sliderBar2');
            sliderBarG1.inputEnabled=true;
            sliderBarG1.input.useHandCursor = true;
            sliderBarG1.input.enableDrag();
            sliderBarG1.input.allowHorizontalDrag=false;
            sliderBarG1.events.onInputUp.add(actionDragOnClickG1);
            sliderBarG1.events.onInputDown.add(actionDownOnSlideG1);

            sliderTrackG2 = game.add.graphics(0,0);
            sliderTrackG2.beginFill(frameLineColor, 1);
            sliderIncrements.g2 = game.add.sprite(positionGang2.x+238, positionGang2.y+16, 'sliderIncrements');
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
            statusLightA = game.add.sprite(positionMotorStatus.x+12, positionMotorStatus.y+24, 'statusLight');
            statusLightA.animations.add('unplugged', [3], 1);
            statusLightA.animations.add('pluggedIn', [1], 1);
            statusLightA.animations.add('stalled', [2], 1);
            statusLightB = game.add.sprite(positionMotorStatus.x+42, positionMotorStatus.y+24, 'statusLight');
            statusLightB.animations.add('unplugged', [3], 1);
            statusLightB.animations.add('pluggedIn', [1], 1);
            statusLightB.animations.add('stalled', [2], 1);
            statusLightC = game.add.sprite(positionMotorStatus.x+72, positionMotorStatus.y+24, 'statusLight');
            statusLightC.animations.add('unplugged', [3], 1);
            statusLightC.animations.add('pluggedIn', [1], 1);
            statusLightC.animations.add('stalled', [2], 1);
            statusLightD = game.add.sprite(positionMotorStatus.x+102, positionMotorStatus.y+24, 'statusLight');
            statusLightD.animations.add('unplugged', [3], 1);
            statusLightD.animations.add('pluggedIn', [1], 1);
            statusLightD.animations.add('stalled', [2], 1);

            statusLight1 = game.add.sprite(positionSensorStatus.x+12, positionSensorStatus.y+24, 'statusLight');
            statusLight1.animations.add('unplugged', [3], 1);
            statusLight1.animations.add('pluggedIn', [1], 1);
            statusLight2 = game.add.sprite(positionSensorStatus.x+42, positionSensorStatus.y+24, 'statusLight');
            statusLight2.animations.add('unplugged', [3], 1);
            statusLight2.animations.add('pluggedIn', [1], 1);
            statusLight3 = game.add.sprite(positionSensorStatus.x+72, positionSensorStatus.y+24, 'statusLight');
            statusLight3.animations.add('unplugged', [3], 1);
            statusLight3.animations.add('pluggedIn', [1], 1);
            statusLight4 = game.add.sprite(positionSensorStatus.x+102, positionSensorStatus.y+24, 'statusLight');
            statusLight4.animations.add('unplugged', [3], 1);
            statusLight4.animations.add('pluggedIn', [1], 1);

        /* Rotational position dials and needles for motors */

            dialA = game.add.sprite(positionDial.x+12, positionDial.y+24, 'dialFace');
            dialB = game.add.sprite(positionDial.x+77, positionDial.y+24, 'dialFace');
            dialC = game.add.sprite(positionDial.x+142, positionDial.y+24, 'dialFace');
            dialD = game.add.sprite(positionDial.x+207, positionDial.y+24, 'dialFace');

            labelRotation = game.add.text(positionDial.x+10, positionDial.y+2, labelRotation, labelStyle3);
            labelDial.a = game.add.text(positionDial.x+32, positionDial.y+45, 'A', labelStyle4);
            labelDial.b = game.add.text(positionDial.x+97, positionDial.y+45, 'B', labelStyle4);
            labelDial.c = game.add.text(positionDial.x+162, positionDial.y+45, 'C', labelStyle4);
            labelDial.d = game.add.text(positionDial.x+227, positionDial.y+45, 'D', labelStyle4);

            needleA = game.add.sprite(positionDial.x+38, positionDial.y+50, 'needle');
            needleA.anchor.setTo(0.495, 0.92);
            needleB = game.add.sprite(positionDial.x+103, positionDial.y+50, 'needle');
            needleB.anchor.setTo(0.495, 0.92);
            needleC = game.add.sprite(positionDial.x+168, positionDial.y+50, 'needle');
            needleC.anchor.setTo(0.495, 0.92);
            needleD = game.add.sprite(positionDial.x+233, positionDial.y+50, 'needle');
            needleD.anchor.setTo(0.495, 0.92);
        
        /* Buttons to drag entire boxes (for motors and motor gangs) */
            // dragBoxButton = {
            //     g1 : game.add.button(positionGang1.x+341, positionGang1.y+5, 'dragButton', actionDragG1, this),
            //     g2 : game.add.button(positionGang2.x+341, positionGang2.y+5, 'dragButton', actionDragG2, this),
            //     a : game.add.button(positionMotorA.x+241, positionMotorA.y+5, 'dragButton', actionDragA, this),
            //     b : game.add.button(positionMotorB.x+241, positionMotorB.y+5, 'dragButton', actionDragB, this),
            //     c : game.add.button(positionMotorC.x+241, positionMotorC.y+5, 'dragButton', actionDragC, this),
            //     d : game.add.button(positionMotorD.x+241, positionMotorD.y+5, 'dragButton', actionDragD, this)
            // }

        /* Touch Sensor */
            touchIndicator = game.add.sprite(positionTouch.x+64, positionTouch.y+23, 'touchIndicator');
            touchIndicator.animations.add('up', [0], 1);
            touchIndicator.animations.add('pressed', [1], 1);

        /* Battery Level Sensor */
            batteryLevelOutline = game.add.sprite(positionBattery.x+8, positionBattery.y+27, 'batteryOutline');

            batteryLevelFill = game.add.graphics(0,0);
            batteryLevelFill.beginFill(0xa3a3a3, 1);
            batteryLevelFill.drawRect(positionBattery.x+11, positionBattery.y+30, Math.round(batteryLevel*100), 16); // the "x100" converts the battery level (whatever it initially is) to the scale of 100 px wide

        /* LCD Screen */
            LCDScreenBox = game.add.graphics(0,0);
            LCDScreenBox.beginFill(0x808080, 0.6);
            LCDScreenBox.lineStyle(1.5, frameLineColor, 1);
            LCDScreenBox.drawRect(positionScreen.x+10, positionScreen.y+29, 172, 46);

        } // end create 
        //=============================================================================

        function actionGetKeyspace() {
        // this is to query the current bot's keyspace, for testing
            console.log("Getting Keyspace Info for Bot...");
            var keys = channel.getKeyspace(botId).keys();
            console.log(keys); //["robot", "a", "b", "c", "d", "S1"]
            console.log("Bot Info from Robot:");
            var isRobot = channel.getKeyspace(botId).get('robot');
            console.log(isRobot); //Object {imTotallyARobot: "yup"} 
            var ma = channel.getKeyspace(botId).get('a');
            console.log(ma); //Object {port: "a", position: 161, stalled: false, moving: false}
            var mb = channel.getKeyspace(botId).get('b');
            console.log(mb);
            var mc = channel.getKeyspace(botId).get('c');
            console.log(mc);
            var md = channel.getKeyspace(botId).get('d');
            console.log(md);
            var s1 = channel.getKeyspace(botId).get('S1');
            console.log(s1); //Object {sensorType: "lejos.hardware.sensor.EV3IRSensor", port: "S1", mode: "Distance", values: Array[1]}
            var s2 = channel.getKeyspace(botId).get('S2');
            console.log(s2); //Object {sensorType: "lejos.hardware.sensor.EV3TouchSensor", port: "S2", mode: "Touch", values: Array[1]}
            var s3 = channel.getKeyspace(botId).get('S3');
            console.log(s3); //Object {sensorType: "lejos.hardware.sensor.EV3ColorSensor", port: "S3", mode: "RGB", values: Array[3]}
            var s4 = channel.getKeyspace(botId).get('S4');
            console.log(s4);
            console.log("Dashboard Info from Robot:")
            var da = channel.getKeyspace(botId).get('aDash');
            console.log(da);
            var db = channel.getKeyspace(botId).get('bDash');
            console.log(db);
            var dc = channel.getKeyspace(botId).get('cDash');
            console.log(dc);
            var dd = channel.getKeyspace(botId).get('dDash');
            console.log(dd);
            var dg1 = channel.getKeyspace(botId).get('g1Dash');
            console.log(dg1);
            var dg2 = channel.getKeyspace(botId).get('g2Dash');
            console.log(dg2);
            var dt = channel.getKeyspace(botId).get('touchDash');
            console.log(dt);
            var dbl = channel.getKeyspace(botId).get('batteryDash');
            console.log(dbl);
        }

    /* Motor communication with Robot via messages to Big Bang channel */
        function moveMotor( recipient, motor, direction, speed ) {
            var data = {};
            data.type = "motorStart";
            data.recipient = recipient;
            data.port = motor;
            data.dir = direction;
            data.speed = speed;
            console.log( "sending " + JSON.stringify(data));
            channel.publish( data );
            if (motor === 'a') {
                channel.getKeyspace(botId).put('aDash', { 'speed': speed, 'direction': direction });
            }
            if (motor === 'b') {
                channel.getKeyspace(botId).put('bDash', { 'speed': speed, 'direction': direction });
            }
            if (motor === 'c') {
                channel.getKeyspace(botId).put('cDash', { 'speed': speed, 'direction': direction });
            }
            if (motor === 'd') {
                channel.getKeyspace(botId).put('dDash', { 'speed': speed, 'direction': direction });
            }
        }
        function stopMotor( recipient, motor ) {
            var data = {};
            data.recipient = recipient;
            data.type = "motorStop";
            data.port = motor;
            console.log( "sending " + JSON.stringify(data));
            channel.publish( data );
            if (data.port === 'a') {
                channel.getKeyspace(botId).put('aDash', { 'speed': motorA.speed, 'direction': "stopped" });
            }
            if (data.port === 'b') {
                channel.getKeyspace(botId).put('bDash', { 'speed': motorB.speed, 'direction': "stopped" });
            }
            if (data.port === 'c') {
                channel.getKeyspace(botId).put('cDash', { 'speed': motorC.speed, 'direction': "stopped" });
            }
            if (data.port === 'd') {
                channel.getKeyspace(botId).put('dDash', { 'speed': motorD.speed, 'direction': "stopped" });
            }
        }

    /* Button-click functions (most of them anyway...) */
        function actionStopOnClick () {
            if ( dashboardStatus === 1 ) {
                statusButton.setFrames(2,2,2,2);
                dashboardStatus = 0;
                game.paused = true;
                game.world.remove(status.statusDisplay);
                labelStatusDisplay = "stopped";
                status.statusDisplay = game.add.text(positionStatus.x+5, positionStatus.y+33, labelStatusDisplay, labelStyle);
                resume.resumeOverlay = game.add.graphics(0,0);
                resume.resumeOverlay.beginFill(0x00000,0.45);
                // resume.resumeOverlay.drawRect(0,51,960,599);
                resume.resumeOverlay.drawRect(14,66,932,577);
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
            screenMessage.messageDisplay1 = game.add.text(positionScreen.x+15, positionScreen.y+32, messageDisplay1, messageStyle);
            screenMessage.messageDisplay2 = game.add.text(positionScreen.x+15, positionScreen.y+46, messageDisplay2, messageStyle);
            screenMessage.messageDisplay3 = game.add.text(positionScreen.x+15, positionScreen.y+60, messageDisplay3, messageStyle);
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
            channel.getKeyspace(botId).put('aDash', { 'speed': motorA.speed }); // This accesses the keyspace 'dashboard,' which if it doesn't exist is then created containing a non-null value. Then it puts a key 'a' into it, which contains the value 'speed' equal to motorA.speed
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
            channel.getKeyspace(botId).put('aDash', { 'speed': motorA.speed }); // This accesses the keyspace 'dashboard,' which if it doesn't exist is then created containing a non-null value. Then it puts a key 'a' into it, which contains the value 'speed' equal to motorA.speed
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
            channel.getKeyspace(botId).put('bDash', { 'speed': motorB.speed });
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
            channel.getKeyspace(botId).put('bDash', { 'speed': motorB.speed }); 
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
            channel.getKeyspace(botId).put('cDash', { 'speed': motorC.speed });
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
            channel.getKeyspace(botId).put('cDash', { 'speed': motorC.speed });
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
            channel.getKeyspace(botId).put('dDash', { 'speed': motorD.speed });
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
            channel.getKeyspace(botId).put('dDash', { 'speed': motorD.speed });
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
            channel.getKeyspace(botId).put('aDash', { 'speed' : motorA.speed }); // This accesses the keyspace 'dashboard,' which if it doesn't exist is then created containing a non-null value. Then it puts a key 'a' into it, which contains the value 'speed' equal to motorA.speed
            sliderBarState.a = "up";
            console.log(motorA.speed.toFixed(2)); //this makes motorA.speed a string with 2 decimal places
            var motorASpeedDisplay = motorA.speed.toFixed(0);
            //game.world.remove(motorA.speedDisplay);
            //motorA.speedDisplay = game.add.text(positionMotorA.x+235, sliderBarA.y-3, motorASpeedDisplay + " ", labelStyle6);
        }
        function actionDragOnClickB() {
            if (sliderBarB.y < positionMotorB.y+11) {
                sliderBarB.y = positionMotorB.y+11;
            } else if (sliderBarB.y > positionMotorB.y+165) {
                sliderBarB.y = positionMotorB.y+165;
            }
            motorB.speed = 700 + (700/154) * (positionMotorB.y + 11 - sliderBarB.y);
            channel.getKeyspace(botId).put('bDash', { 'speed' : motorB.speed }); // This accesses the keyspace 'dashboard,' which if it doesn't exist is then created containing a non-null value. Then it puts a key 'b' into it, which contains the value 'speed' equal to motorB.speed
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
            channel.getKeyspace(botId).put('cDash', { 'speed' : motorC.speed }); 
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
            channel.getKeyspace(botId).put('dDash', { 'speed' : motorD.speed }); 
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
            channel.getKeyspace(botId).put('g1Dash', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
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
            channel.getKeyspace(botId).put('g1Dash', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
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
            channel.getKeyspace(botId).put('g2Dash', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });
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
            channel.getKeyspace(botId).put('g2Dash', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });
        }
        function actionDragOnClickG1() {
            if (sliderBarG1.y < positionGang1.y+11) {
                sliderBarG1.y = positionGang1.y+11;
            } else if (sliderBarG1.y > positionGang1.y+165) {
                sliderBarG1.y = positionGang1.y+165;
            }
            gang1.speed = 700 + (700/154) * (positionGang1.y + 11 - sliderBarG1.y);
            console.log(gang1.speed.toFixed(2));
            channel.getKeyspace(botId).put('g1Dash', { 'speed': gang1.speed,'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
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
            channel.getKeyspace(botId).put('g2Dash', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });
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
            channel.getKeyspace(botId).put('g1Dash', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace(botId).put('g2Dash', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });
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
            channel.getKeyspace(botId).put('g1Dash', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace(botId).put('g2Dash', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });            
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
            channel.getKeyspace(botId).put('g1Dash', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace(botId).put('g2Dash', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });            
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
            channel.getKeyspace(botId).put('g1Dash', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace(botId).put('g2Dash', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });            
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
            channel.getKeyspace(botId).put('g1Dash', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace(botId).put('g2Dash', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });
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
            channel.getKeyspace(botId).put('g1Dash', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace(botId).put('g2Dash', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });            
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
            channel.getKeyspace(botId).put('g1Dash', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace(botId).put('g2Dash', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });
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
            channel.getKeyspace(botId).put('g1Dash', { 'speed' : gang1.speed, 'a' : gang1.a, 'b' : gang1.b, 'c' : gang1.c, 'd' : gang1.d });
            channel.getKeyspace(botId).put('g2Dash', { 'speed' : gang2.speed, 'a' : gang2.a, 'b' : gang2.b, 'c' : gang2.c, 'd' : gang2.d });            
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
            if ( key === 'g1Dash' ) {
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
            if ( key === 'g2Dash' ) {
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
            if ( key === 'aDash' ) { 
                motorA.speed = speed;
                sliderBarA.y = positionMotorA.y + 11 - (154 / 700) * (speed - 700); //back-calculate sliderbar position from speed normalized over the range of slider track y-values
                motorA.previousSpeed = speed;
            }
            if ( key === 'bDash') { 
                motorB.speed = speed;
                sliderBarB.y = positionMotorB.y + 11 - (154 / 700) * (speed - 700); 
                motorB.previousSpeed = speed;
            }
            if ( key === 'cDash') { 
                motorC.speed = speed;
                sliderBarC.y = positionMotorC.y + 11 - (154 / 700) * (speed - 700); 
                motorC.previousSpeed = speed;
            }
            if ( key === 'dDash') { 
                motorD.speed = speed;
                sliderBarD.y = positionMotorD.y + 11 - (154 / 700) * (speed - 700); 
                motorD.previousSpeed = speed;
            }
        }

        /* Rotation of motor position dials */
        function moveDial (key, direction) { // Move the dial in realtime in all users' dashboards: this is an approximation based on the previous needle position and the current speed and direction
            var tapprox = 30;
            if ( key === 'aDash' ) {
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
            if ( key === 'bDash' ) {
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
            if ( key === 'cDash' ) {
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
            if ( key === 'dDash' ) {
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
            if ( key === 'aDash' && typeof(motorData) !== "undefined" ) {
                if ( motorData.moving === false ) {
                    needleA.angle = motorData.position; //value that was published to channel by bot
                }
            }
            if ( key === 'bDash' && typeof(motorData) !== "undefined" ) {
                if ( motorData.moving === false) {
                    needleB.angle = motorData.position;
                }
            }
            if ( key === 'cDash' && typeof(motorData) !== "undefined" ) {
                if ( motorData.moving === false) {
                    needleC.angle = motorData.position;
                }
            }
            if ( key === 'dDash' && typeof(motorData) !== "undefined" ) {
                if ( motorData.moving === false) {
                    needleD.angle = motorData.position;
                }
            }
        }

        /* Get key-value pairs from the dashboard keyspace and do things with them */
        function getDashboardValues (key, val) {
            if ( key === 'aDash' ) {
                if ( motorA.speed !== val.speed && motorA.previousSpeed !== val.speed ) { // don't change anything again in the dashboard of the user who changed the speed, only in the others' dashboards
                    updateSpeed(key, val.speed);
                }
            }
            if ( key === 'bDash' ) {
                if ( motorB.speed !== val.speed && motorB.previousSpeed !== val.speed ) {
                    updateSpeed(key, val.speed);
                }
            }
            if ( key === 'cDash' ) {
                if ( motorC.speed !== val.speed && motorC.previousSpeed !== val.speed ) {
                    updateSpeed(key, val.speed);
                }
            }
            if ( key === 'dDash' ) {
                if ( motorD.speed !== val.speed && motorD.previousSpeed !== val.speed ) {
                    updateSpeed(key, val.speed);
                }
            }
            if ( key === 'g1Dash' ) {
                if ( gang1.a !== val.a || gang1.b !== val.b || gang1.c !== val.c || gang1.d !== val.d ) { // adjust only if gang 1 checkboxes change
                    updateGang(key, val.speed, val.a, val.b, val.c, val.d);
                } 
                if ( gang1.previousSpeed !== val.speed && gang1.speed !== val.speed ) { // adjust only only if gang 1 speed changes
                    updateGang(key, val.speed, val.a, val.b, val.c, val.d);
                } 
            }
            if ( key === 'g2Dash' ) {
                if ( gang2.a !== val.a || gang2.b !== val.b || gang2.c !== val.c || gang2.d !== val.d ) {
                    updateGang(key, val.speed, val.a, val.b, val.c, val.d);
                }
                if ( gang2.previousSpeed !== val.speed && gang2.speed !== val.speed ) {
                    updateGang(key, val.speed, val.a, val.b, val.c, val.d);
                }
            } 
        }

        function getDialValues (key, val) {
            if ( key === 'aDash' ) {
                if ( val.direction === 'f' || val.direction === 'r' ) {
                    moveDial ('aDash', val.direction); //smooth-ish linear interpolation
                } else if ( val.direction === "stopped" ) {
                    channel.getKeyspace(botId).put('aDash', { 'speed': motorA.speed }); // get rid of direction value until the motor's moving again (so this doesn't keep running), by replacing the key with only a speed value
                    var motorDataA = channel.channelData.get('aDash');
                    updateDial ('aDash', motorDataA); // update at the next second to the value in the message sent by the bot
                }
            }
            if ( key === 'bDash' ) {
                if ( val.direction === 'f' || val.direction === 'r' ) {
                    moveDial ('bDash', val.direction);
                } else if ( val.direction === "stopped" ) {
                    channel.getKeyspace(botId).put('bDash', { 'speed': motorB.speed }); 
                    var motorDataB = channel.channelData.get('bDash');
                    updateDial ('bDash', motorDataB); 
                }
            }
            if ( key === 'cDash' ) {
                if ( val.direction === 'f' || val.direction === 'r' ) {
                    moveDial ('cDash', val.direction); 
                } else if ( val.direction === "stopped" ) {
                    channel.getKeyspace(botId).put('cDash', { 'speed': motorC.speed }); 
                    var motorDataC = channel.channelData.get('cDash');
                    updateDial ('cDash', motorDataC); 
                }
            }
            if ( key === 'dDash' ) {
                if ( val.direction === 'f' || val.direction === 'r' ) {
                    moveDial ('dDash', val.direction);
                } else if ( val.direction === "stopped" ) {
                    channel.getKeyspace(botId).put('dDash', { 'speed': motorD.speed }); 
                    var motorDataD = channel.channelData.get('dDash');
                    updateDial ('dDash', motorDataD);
                }
            }
        }

        function update() {
            /* DASHBOARD STUFF */
                // note: keyspaces contain key-value pairs. A value in a key-value pair must be a JSON object with pairs of property names and values
                // example: // keyspace name: 'dashboard', key: 'a', value: '{speed: 0, position: 0}' and key: 'b', value: '{speed: 0, position: 0}', 'c', 'd', etc 
            if (sliderBarState.a === "up") { // this is to partially eliminate the glitch in the dashboard of the user who changed the speed
                var dashMotorA = channel.getKeyspace(botId).get('aDash'); 
                if ( typeof(dashMotorA) !== "undefined" ) {
                    getDashboardValues('aDash', dashMotorA);
                }               
            }
            if (sliderBarState.b === "up") {
                var dashMotorB = channel.getKeyspace(botId).get('bDash');
                if ( typeof(dashMotorB) !== "undefined" ) {
                    getDashboardValues('bDash', dashMotorB);
                }
            }
            if (sliderBarState.c === "up") {
                var dashMotorC = channel.getKeyspace(botId).get('cDash'); 
                if ( typeof(dashMotorC) !== "undefined" ) {
                    getDashboardValues('cDash', dashMotorC);
                }
            }
            if (sliderBarState.d === "up") {
                var dashMotorD = channel.getKeyspace(botId).get('dDash'); 
                if ( typeof(dashMotorD) !== "undefined" ) {
                    getDashboardValues('dDash', dashMotorD);
                }
            }
            if (sliderBarState.g1 === "up") {
                var dashGang1 = channel.getKeyspace(botId).get('g1Dash'); 
                if ( typeof(dashGang1) !== "undefined" ) {
                    getDashboardValues('g1Dash', dashGang1);
                }
            }
            if (sliderBarState.g2 === "up") {
                var dashGang2 = channel.getKeyspace(botId).get('g2Dash'); 
                if ( typeof(dashGang2) !== "undefined" ) {
                    getDashboardValues('g2Dash', dashGang2);
                }
            }

            var dialDataA = channel.getKeyspace(botId).get('aDash'); 
            if ( typeof(dialDataA) !== "undefined" ) {
                getDialValues('aDash', dialDataA);
            }
            var dialDataB = channel.getKeyspace(botId).get('bDash');
            if ( typeof(dialDataB) !== "undefined" ) {
                getDialValues('bDash', dialDataB);
            }
            var dialDataC = channel.getKeyspace(botId).get('cDash'); 
            if ( typeof(dialDataC) !== "undefined" ) {
                getDialValues('cDash', dialDataC);
            }
            var dialDataD = channel.getKeyspace(botId).get('dDash'); 
            if ( typeof(dialDataD) !== "undefined" ) {
                getDialValues('dDash', dialDataD);
            }

        } // end update


        // Text editor
        // When the Submit button is clicked
        document.getElementById("runButton").onclick = function() {
            
            // clear old error message so as to re-evaluate new code
            document.getElementById("errorMsg").innerHTML = "";

            // get text along with formatting from text editor text area
            var formatCode = document.getElementById("currentCode").innerHTML;
            // get plain text w/o format from text editor
            var evalCode = document.getElementById("currentCode").innerText;

            // try to evalate user's input code in text editor area. Will evaluate if possible.
            try {
                eval(evalCode);
            }
            // if input code is not able to be run, display console's error message to user in text editor area
            catch(err) {
                document.getElementById("errorMsg").innerHTML = "Error: " + err.message;
                codeArray[iterationNum,1] = err.message;
            }

            // store currentCode in an array to be accessed if they press the up key
            codeArray[iterationNum,0] = formatCode;
            editorContent(iterationNum);
            iterationNum = iterationNum + 1;
            indexArray = iterationNum

            $("html").scrollTop($("html")[0].scrollHeight)

            
        } // end .onclick

        function editorContent(elementNum) {
            var secIterator = 0;
            var prevText = "";
            var prevError = "";
            // Create prevText which has all inputs within it
            for (secIterator; secIterator <= elementNum; secIterator++) {
                prevText += codeArray[secIterator,0] + "<br>";
                prevError += codeArray[secIterator,1] + "<br>";
            };
            console.log(prevText);
            // Display all previous code (from array) in previousCode area
            document.getElementById("previousCode").innerHTML = prevText + prevError;
            // scroll to bottom of previousCode text (showing last input)
            $("#previousCode").scrollTop($("#previousCode")[0].scrollHeight)
            // clear currentCode to validate that code was submitted
            document.getElementById("currentCode").innerHTML = "";
            $("#currentCode").focus();
        }
        function disableKeyboard() {
            game.input.keyboard.disabled = true;
        }
        function enableKeyboard() {
            game.input.keyboard.disabled = false;
        }

        $("#textEditor").click( function () { // hovering over textEditor
            disableKeyboard();
        });
        $("#gameWorld").click( function () { // hovering over textEditor
            enableKeyboard();
        });

        // Handling up and down arrow key event to maneuver through user's previously input code.
        // When a key is pressed
        $(document).keydown(function(e) {
            // detect which key it is
            switch(e.which) {

//============= Display previous codes in array above current code ========


                // If up key is pressed (keycode number 38) then
                case 38: // up
                    // If at the last element in the array and they press up
                    if (indexArray === iterationNum) {
                        // Remember their unsubmitted code in a tempCode variable so in case they want to return what they previously wrote
                        tempCode = document.getElementById("currentCode").innerHTML;
                    }
                    // If not at the first element of the array
                    if (indexArray != 0) {
                        //Maneuver back through previous input code
                        indexArray=indexArray-1;
                        document.getElementById("currentCode").innerHTML = codeArray[indexArray];
                    }
                break;
                // If down key is pressed
                case 40: // down
                    // Maneuver forward through newer code input
                    if (indexArray != iterationNum) {
                        indexArray=indexArray+1;
                        document.getElementById("currentCode").innerHTML = codeArray[indexArray];
                    }
                    if (indexArray === iterationNum) {
                        document.getElementById("currentCode").innerHTML = tempCode; 
                    }
                break;
                default: return; // exit this handler for other keys
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
            // move to of code in currentCode
            $("#currentCode").scrollTop($("#currentCode")[0].scrollHeight);
        });

    } // end beginGame

}); // end require