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
        var game = new Phaser.Game(944, 704, Phaser.AUTO, "gameWorld", { // 960 x 1068 fits nicely on an iPhone 4. 

            preload: preload, //Since this is likely the small phone screen anyone would be using, it's important to consider, since we currently have the issue of not scrolling about the Phaser game world window
            create: create,
            update: update,
            //render: render,
            //paused: paused,
            //destroy: destroy
        });

        var bbLogo, botLogo;
        //var poweredBy = "Powered by ";
        var dashboardName = "GigaBots Dashboard";
        //var titleStyle = { font: "32px Lucida Console, Arial",fill: "#313131"}
        var labelStyle = { font: "12px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc" }
        var labelStyle2 = { font: "20px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc" }        
        var labelStyle3 = { font: "16px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc"}
        var labelStyle4 = { font: "14px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc", fontWeight: "italic" }
        var labelStyle5 = { font: "20px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#414242" } 
        var messageStyle = { font: "14px Lucida Console, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#222222"}   
        var frameLineColor = 0xa3a3a3;
        var backgound, backgroundBox, backgroundBottom;

        var dragButton;

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

        /* Pause and resume buttons */
        var dashboardStatus = 1; // 1 = 'running/resumed', 0 = 'stopped/paused'
        var resumeButton, pauseButton;
       
        /* Individual motor controls and feedback */
        var frameMotor;
        var positionMotorA = { x : 15, y : 226 }
        var positionMotorB = { x : 295, y : 226 }
        var positionMotorC = { x : 15, y : 436 }
        var positionMotorD = { x : 295, y : 436 }
        var labelMotor = { a : "Motor A", b : "Motor B", c : "Motor C", d : "Motor D"}

        // forward and reverse
        var fButton;
        var rButton;
        var directionA = 1, directionB = 1, directionC = 1, directionD = 1, directionG1 = 1, directionG2 = 1; // forward = 1, reverse = -1

        // speed
        var sliderLabel;
        var sliderBarA, sliderBarB, sliderBarC, sliderBarD, sliderBarG1, sliderBarG2;
        var sliderTrackA, sliderTrackB, sliderTrackC, sliderTrackD, sliderTrackG1, sliderTrackG2;
        var minusButtonA, minusButtonB, minusButtonC, minusButtonD, minusButtonG1, minusButtonG2;
        var plusButtonA, plusButtonB, plusButtonC, plusButtonD, plusButtonG1, plusButtonG2;
        var speed;
        var speedRange = [0, 100, 200, 300, 400, 500, 600, 700];

        // rotation position         
        var labelRotation = "Motor Rotational Positions";
        var dialA, dialB, dialC, dialD;
        var labelDial = { a : "Motor A", b : "Motor B", c : "Motor C", d : "Motor D" }
        var needleA, needleB, needleC, needleD;

        var frameDials;
        var positionDial = { x : 674, y : 136 }

        /* Ganging motors together */
        var frameMotorGanging, frameMotorGang1, frameMotorGang2;
        var labelMotorGang;
        var positionMotorGang = { x : 970, y : 66 }
        var positionMotorGang1 = { x : 575, y: 226 } 
        var positionMotorGang2 = { x : 575, y: 436 } 
        var checkbox;
        var checkboxStatus;
        var fGangButton, rGangButton;

        /* // this might be the cleaner way to use a motor object, where the ports are a, b, c, & d
        var motor = { 
            port : '',
            status : '',
            speed : '',
            position : '',
            direction : ''
        }
        */
        var userType;
        var userNum;
        var motorA = {
            port: 'a',
            status : 1,
            speed : 0,
            position : 0,
            gang: 0, // 0 = not ganged with other motors, 1 = joined in gang 1, or 2 = joined in gang 2
            stalled: false
        }
        var motorB = {
            port: 'b',
            status : 1,
            speed : 0,
            position : 0,
            gang: 0,
            stalled: false
        }
        var motorC = {
            port: 'c',
            status : 1,
            speed : 0,
            position : 0,
            gang: 0,
            stalled: false
        }
        var motorD = {
            port: 'd',
            status : 1,
            speed : 0,
            position : 0,
            gang: 0,
            stalled: false
        }
        var gang1 = {
            speed : 0,
            a : false, //initially motor A is not in any gang
            b : false,
            c : false,
            d : false
        }
        var gang2 = {
            speed : 0,
            a : false, //initially motor A is not in any gang
            b : false,
            c : false,
            d : false
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
        var positionScreen = { x : 15, y : 124 }
        var labelScreen = "LCD Screen";
        var screenMessage = {
            messageDisplay1 : "Hello GigaBot!", // this is a placeholder
            messageDisplay2 : "",
            messageDisplay3 : ""
        }


        //===================================================

        // user subscribing to the channel
        channel.onSubscribers(function (joined) {
            subscribeUser(joined);
            console.log("subscriber joined " + joined);
        }, function (left) {
            console.log("subscriber left");
        });
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
                needleA.angle = val.position; // THE ERROR WE GET HERE IS BECAUSE THE NEEDLE VARIABLES DON'T GET THEIR SPRITES UNTIL LATER
                if ( val.moving ) { // WE SHOULD ADDRESS THIS ERROR AFTER WE GET OTHER THINGS WORKING AND THEN START USING A NEEDLE OBJECT, WE MIGHT HAVE TO DO SOME REARRANGING
                    motorA.status =1;
                    statusLightA.animations.play('pluggedIn');
                }
                else if ( val.stalled ) {
                    motorA.status =2;
                    statusLightA.animations.play('stalled');
                } 
                else {
                    motorA.status =0;
                    statusLightA.animations.play('unplugged');
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
/*        channel.handler = function (message) {
            console.log("update speed");
            console.log("channel handler: " + message);
            //var m = message.payload.getBytesAsJSON();
            //updateSpeed(m);
        }*/



    //==============================================================================================================================
        function preload() {
            game.load.spritesheet('statusLight', 'assets/gigabot_dashboard_status_lights_spritesheet.png', 14, 14);
            game.load.spritesheet('resumeButton','assets/buttons/gigabot_dashboard_button_resume_spritesheet.png', 97, 49);
            game.load.spritesheet('pauseButton','assets/buttons/gigabot_dashboard_button_pause_spritesheet.png', 97, 49);
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
            game.load.image('robotOrangeSm', 'assets/robot_orange_sm.png', 50, 50);
            game.load.image('dragButton','assets/buttons/gigabot_dashboard_drag_button.png', 25, 17);
            game.load.image('title','assets/gigabot_dashboard_title_2.png', 400, 50);
            game.load.image('poweredBy','assets/powered_by_big_bang.png', 280, 48);
        } //end preload

    //==============================================================================================================================
        function create() {
            //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
            this.game.stage.disableVisibilityChange = true;    

            game.world.setBounds(0, 0, 1600, 1200);
        /* Background */
            game.stage.backgroundColor = '#C8C8C8';
            var titleBox = game.add.graphics(0,0);
            //titleBox.beginFill(0xCD8500,0.75); // slightly translucent medium-dark orange
            titleBox.beginFill(0xFFFFFF,1);
            titleBox.drawRect(0,0,960,60);

            var titleBarLine = game.add.graphics(0,0);
            titleBarLine.beginFill(frameLineColor,1);
            titleBarLine.drawRect(0,50,960,1);

            backgroundBox = game.add.graphics(0,0);
            backgroundBox.beginFill(0x313233,1);
            backgroundBox.drawRect(0,51,960,1054);

            backgroundBottom = game.add.graphics(0,0);
            backgroundBottom.beginFill(0x1f1f1f,1);
            backgroundBottom.drawRect(0,650,960, 74);


        /* Title */
            //dashboardName = game.add.text(68, 10, dashboardName, titleStyle);
            dashboardName = game.add.sprite(72,0,'title');
            bbLogo = game.add.sprite(816, 1,'bbLogoSm');
            botLogo = game.add.sprite(0,0,'robotOrangeSm');
            poweredBy = game.add.sprite(665,1,'poweredBy');
            //poweredBy = game.add.text(722, 19, poweredBy, labelStyle4);
            var allRightsReserved = game.add.text(15, 665, "All Rights Reserved, TheGigabots.com", labelStyle);

        /* Frames */
            frameMotorStatus = game.add.graphics(0,0);
            frameMotorStatus.lineStyle(1, frameLineColor, 1);
            frameMotorStatus.drawRect(positionMotorStatus.x, positionMotorStatus.y, 130, 60);

            frameSensorStatus = game.add.graphics(0,0);
            frameSensorStatus.lineStyle(1, frameLineColor, 1);
            frameSensorStatus.drawRect(positionSensorStatus.x, positionSensorStatus.y, 130, 60);

            frameMotor = {
                a : game.add.graphics(0,0),
                b : game.add.graphics(0,0),
                c : game.add.graphics(0,0),
                d : game.add.graphics(0,0),
            }

            frameMotor.a.lineStyle(1, frameLineColor, 1);
            frameMotor.a.drawRect(positionMotorA.x, positionMotorA.y, 270, 200);

            frameMotor.b.lineStyle(1, frameLineColor, 1);
            frameMotor.b.drawRect(positionMotorB.x, positionMotorB.y, 270, 200);

            frameMotor.c.lineStyle(1, frameLineColor, 1);
            frameMotor.c.drawRect(positionMotorC.x, positionMotorC.y, 270, 200);

            frameMotor.d.lineStyle(1, frameLineColor, 1);
            frameMotor.d.drawRect(positionMotorD.x, positionMotorD.y, 270, 200);

            frameTouch = game.add.graphics(0,0);
            frameTouch.lineStyle(1, frameLineColor, 1);
            frameTouch.drawRect(positionTouch.x, positionTouch.y, 221, 80);

            frameIR = game.add.graphics(0,0);
            frameIR.lineStyle(1, frameLineColor, 1);
            frameIR.drawRect(positionIR.x, positionIR.y, 152, 60);

            frameUltrasonic = game.add.graphics(0,0);
            frameUltrasonic.lineStyle(1, frameLineColor, 1);
            frameUltrasonic.drawRect(positionUltrasonic.x, positionUltrasonic.y, 152, 60);

            frameColor = game.add.graphics(0,0);
            frameColor.lineStyle(1, frameLineColor, 1);
            frameColor.drawRect(positionColor.x, positionColor.y, 216, 80);

            frameBattery = game.add.graphics(0,0);
            frameBattery.lineStyle(1, frameLineColor, 1);
            frameBattery.drawRect(positionBattery.x, positionBattery.y, 124, 60);

            frameScreen = game.add.graphics(0,0);
            frameScreen.lineStyle(1, frameLineColor, 1);
            frameScreen.drawRect(positionScreen.x, positionScreen.y, 192, 92);

            // frameMotorGanging = game.add.graphics(0,0);
            // frameMotorGanging.lineStyle(1, frameLineColor, 1);
            // frameMotorGanging.drawRect(positionMotorGang.x, positionMotorGang.y, 250, 160);

            frameMotorGang1 = game.add.graphics(0,0);
            frameMotorGang1.lineStyle(1, frameLineColor, 1);
            frameMotorGang1.drawRect(positionMotorGang1.x, positionMotorGang1.y, 370, 200);

            frameMotorGang2 = game.add.graphics(0,0);
            frameMotorGang2.lineStyle(1, frameLineColor, 1);
            frameMotorGang2.drawRect(positionMotorGang2.x, positionMotorGang2.y, 370, 200);

            frameDials = game.add.graphics(0,0);
            frameDials.lineStyle(1, frameLineColor, 1);
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
                // g1 : game.add.text(positionMotorGang.x+10, positionMotorGang.y+5, "Motor Gang 1", labelStyle3), // gang 1
                // g2 : game.add.text(positionMotorGang.x+115, positionMotorGang.y+5, "Motor Gang 2", labelStyle3), // gang 2
                a1 : game.add.text(positionMotorGang1.x+38, positionMotorGang1.y+33, "Motor A", labelStyle), // motor A in gang 1
                a2 : game.add.text(positionMotorGang2.x+38, positionMotorGang2.y+33, "Motor A", labelStyle), //motor A in gang 2
                b1 : game.add.text(positionMotorGang1.x+38, positionMotorGang1.y+68, "Motor B", labelStyle), 
                b2 : game.add.text(positionMotorGang2.x+38, positionMotorGang2.y+68, "Motor B", labelStyle), 
                c1 : game.add.text(positionMotorGang1.x+38, positionMotorGang1.y+103, "Motor C", labelStyle), 
                c2 : game.add.text(positionMotorGang2.x+38, positionMotorGang2.y+103, "Motor C", labelStyle), 
                d1 : game.add.text(positionMotorGang1.x+38, positionMotorGang1.y+138, "Motor D", labelStyle), 
                d2 : game.add.text(positionMotorGang2.x+38, positionMotorGang2.y+138, "Motor D", labelStyle) 
            }

            labelGang1 = game.add.text(positionMotorGang1.x + 10, positionMotorGang1.y + 2, "Motor Gang 1", labelStyle3);
            labelGang2 = game.add.text(positionMotorGang2.x + 10, positionMotorGang2.y + 2, "Motor Gang 2", labelStyle3);


        /* Buttons */
            // Add button for resuming all motors at their current settings, after having paused them
            resumeButton = game.add.button(15, 66, 'resumeButton', actionResumeOnClick, this);
            resumeButton.setFrames(3,3,3,3); // initially the dashboard will already be active, so make the Resume not appear usable
            pauseButton = game.add.button(111, 66, 'pauseButton', actionPauseOnClick, this, 1, 0, 2, 0);
            pauseButton.input.useHandCursor = true;

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

            /* adding forward button events */
            fButton.a.events.onInputDown.add(fButtonDownAction, motorA); // motorA object declared around line 121
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

            /* set different frames for buttons out, over, down, and up */
            fButton.a.setFrames(1,0,2,2);
            rButton.a.setFrames(1,0,2,2);
            fButton.b.setFrames(1,0,2,2);
            rButton.b.setFrames(1,0,2,2);
            fButton.c.setFrames(1,0,2,2);
            rButton.c.setFrames(1,0,2,2);
            fButton.d.setFrames(1,0,2,2);
            rButton.d.setFrames(1,0,2,2);

            /* change cursor to a hand when hovering over the buttons */
            fButton.a.input.useHandCursor = true;
            rButton.a.input.useHandCursor = true;
            fButton.b.input.useHandCursor = true;
            rButton.b.input.useHandCursor = true;
            fButton.c.input.useHandCursor = true;
            rButton.c.input.useHandCursor = true;
            fButton.d.input.useHandCursor = true;
            rButton.d.input.useHandCursor = true;

            // THESE 4 FUNCTIONS SHOULD BE USABLE BY ANY NUMBER OF MOTORS
            /* forward button actions */
            function fButtonDownAction () {
                console.log("onActionDownForward"); 
                moveMotor( this.port, "f", this.speed );
            }
            function fButtonUpAction() {
                console.log("onActionUpForward");
                stopMotor( this.port ); 
            }
            /* reverse buttons actions*/
            function rButtonDownAction () {
                console.log("onActionDownReverse"); 
                moveMotor( this.port, "r", this.speed );
            }
            function rButtonUpAction() {
                console.log("onActionUpReverse");
                stopMotor( this.port ); 
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
                g1 : game.add.button(positionMotorGang1.x+105, positionMotorGang1.y+32, 'forwardButton'),
                g2 : game.add.button(positionMotorGang2.x+105, positionMotorGang2.y+32, 'forwardButton')
            }
            rGangButton = {
                g1 : game.add.button(positionMotorGang1.x+105, positionMotorGang1.y+90, 'reverseButton'),
                g2 : game.add.button(positionMotorGang2.x+105, positionMotorGang2.y+90, 'reverseButton')
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

            minusButtonG1 = game.add.button(positionMotorGang1.x+105, positionMotorGang1.y+148, 'minusButton', actionDecreaseOnClickG1, this, 1, 0, 2, 0);
            plusButtonG1 = game.add.button(positionMotorGang1.x+158, positionMotorGang1.y+148, 'plusButton', actionIncreaseOnClickG1, this, 1, 0, 2, 0);
            minusButtonG2 = game.add.button(positionMotorGang2.x+105, positionMotorGang2.y+148, 'minusButton', actionDecreaseOnClickG2, this, 1, 0, 2, 0);
            plusButtonG2 = game.add.button(positionMotorGang2.x+158, positionMotorGang2.y+148, 'plusButton', actionIncreaseOnClickG2, this, 1, 0, 2, 0);

            minusButtonG1.input.useHandCursor = true;
            plusButtonG1.input.useHandCursor = true;
            minusButtonG2.input.useHandCursor = true;
            plusButtonG2.input.useHandCursor = true;

            // Pretty quick and dirty here, hopefully this works though:
            /* forward button actions */
            function fGangButtonDownAction () {
                console.log("onActionDownForwardGang"); 
                if ( this.a === true) {
                    moveMotor( "a", "f", this.speed );
                }
                if ( this.b === true) {
                    moveMotor( "b", "f", this.speed );
                }
                if ( this.c === true) {
                    moveMotor( "c", "f", this.speed );
                }
                if ( this.d === true) {
                    moveMotor( "d", "f", this.speed );
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
            }
            /* reverse buttons actions*/
            function rGangButtonDownAction () {
                console.log("onActionDownReverseGang"); 
                if ( this.a === true) {
                    moveMotor( "a", "r", this.speed );
                }
                if ( this.b === true) {
                    moveMotor( "b", "r", this.speed );
                }
                if ( this.c === true) {
                    moveMotor( "c", "r", this.speed );
                }
                if ( this.d === true) {
                    moveMotor( "d", "r", this.speed );
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
                //a1 : game.add.button(positionMotorGang.x, positionMotorGang.y+27, 'checkbox', actionCheckbox, this),
                a1 : game.add.button(positionMotorGang1.x+10, positionMotorGang1.y+32, 'checkbox', actionCheckboxA1, this),
                a2 : game.add.button(positionMotorGang2.x+10, positionMotorGang2.y+32, 'checkbox', actionCheckboxA2, this),
                b1 : game.add.button(positionMotorGang1.x+10, positionMotorGang1.y+67, 'checkbox', actionCheckboxB1, this),
                b2 : game.add.button(positionMotorGang2.x+10, positionMotorGang2.y+67, 'checkbox', actionCheckboxB2, this),
                c1 : game.add.button(positionMotorGang1.x+10, positionMotorGang1.y+102, 'checkbox', actionCheckboxC1, this),
                c2 : game.add.button(positionMotorGang2.x+10, positionMotorGang2.y+102, 'checkbox', actionCheckboxC2, this),
                d1 : game.add.button(positionMotorGang1.x+10, positionMotorGang1.y+137, 'checkbox', actionCheckboxD1, this),
                d2 : game.add.button(positionMotorGang2.x+10, positionMotorGang2.y+137, 'checkbox', actionCheckboxD2, this)
            }
            checkboxStatus = { a1 : 0, a2 : 0, b1 : 0, b2 : 0, c1 : 0, c2 : 0, d1 : 0, d2 : 0 } // all initially unchecked (motors not members of a motor gang)
            // let's initially set the checkbox frames so that they're unchecked and if you hvoer over them, they highlight
            checkbox.a1.setFrames(2,0,1,0);
            checkbox.a2.setFrames(2,0,1,0);
            checkbox.b1.setFrames(2,0,1,0);
            checkbox.b2.setFrames(2,0,1,0);
            checkbox.c1.setFrames(2,0,1,0);
            checkbox.c2.setFrames(2,0,1,0);
            checkbox.d1.setFrames(2,0,1,0);
            checkbox.d2.setFrames(2,0,1,0);
            /*function actionCheckbox () {
                //console.log(checkboxStatus.this);
                //console.log(motorPortGang);
            }*/

            /* use hand cursor when hovering over checkboxes */
            checkbox.a1.input.useHandCursor = true;
            checkbox.a2.input.useHandCursor = true;
            checkbox.b1.input.useHandCursor = true;
            checkbox.b2.input.useHandCursor = true;
            checkbox.c1.input.useHandCursor = true;
            checkbox.c2.input.useHandCursor = true;
            checkbox.d1.input.useHandCursor = true;
            checkbox.d2.input.useHandCursor = true;

            function actionCheckboxA1 () {
                if ( checkboxStatus.a1 === 0 ) { //the checkbox is UNCHECKED
                    checkboxStatus.a1 = 1; // so check it now
                    checkbox.a1.setFrames(1,1,1,0); // over frame and out frame should now both show the box checked
                    //motorA.gang = 1; // join motor a with gang 1
                    gang1.a = true; // motor A is in gang 1
                    if ( checkboxStatus.a2 === 1 ) { // both checkboxes for a single motor cannot be checked, so if the other motor is checked
                        gang2.a = false; // motor A is no longer in gang 2
                        checkboxStatus.a2 = 0; // because the motor was checked for the other gang, we must uncheck it from that gang now
                        checkbox.a2.setFrames(2,0,1,0) // show other box as unchecked
                    }
                }
                else { // the checkbox is CHECKED
                    checkboxStatus.a1 = 0; // so uncheck it now
                    checkbox.a1.setFrames(2,0,1,0); // over frame and out frame should now both show the box unchecked
                    //motorA.gang = 0; // ungang motor a
                    gang1.a = false; // motor A is not in gang 1
                }
            }
            function actionCheckboxA2 () {
                if ( checkboxStatus.a2 === 0 ) { //the checkbox is UNCHECKED
                    checkboxStatus.a2 = 1; // so check it now
                    checkbox.a2.setFrames(1,1,1,0); // over frame and out frame should now both show the box checked
                    //motorA.gang = 2; // join motor a with gang 2
                    gang2.a = true; // motor A is in gang 2
                    if ( checkboxStatus.a1 === 1 ) { // both checkboxes for a single motor cannot be checked, so if the other motor is checked
                        gang1.a = false; // motor A is no longer in gang 1
                        checkboxStatus.a1 = 0; // because the motor was checked for the other gang, we must uncheck it from that gang now
                        checkbox.a1.setFrames(2,0,1,0) // show other box as unchecked
                    }
                }
                else { // the checkbox is CHECKED
                    checkboxStatus.a2 = 0; // so uncheck it now
                    checkbox.a2.setFrames(2,0,1,0); // over frame and out frame should now both show the box unchecked
                    //motorA.gang = 0; // ungang motor a
                    gang2.a = false; // motor A is not in gang 2
                }
            } 
            function actionCheckboxB1 () {
                if ( checkboxStatus.b1 === 0 ) {
                    checkboxStatus.b1 = 1; 
                    checkbox.b1.setFrames(1,1,1,0);
                    //motorB.gang = 1;
                    gang1.b = true;
                    if ( checkboxStatus.b2 === 1 ) { 
                        gang2.b = false;
                        checkboxStatus.b2 = 0; 
                        checkbox.b2.setFrames(2,0,1,0);
                    }
                } else {
                    checkboxStatus.b1 = 0; 
                    checkbox.b1.setFrames(2,0,1,0);
                   // motorB.gang = 0;
                   gang1.b = false;
                }
            }
            function actionCheckboxB2 () {
                if ( checkboxStatus.b2 === 0 ) { 
                    checkboxStatus.b2 = 1; 
                    checkbox.b2.setFrames(1,1,1,0);
                    //motorB.gang = 2;
                    gang2.b = true;
                    if ( checkboxStatus.b1 === 1 ) {
                        gang1.b = false;
                        checkboxStatus.b1 = 0; 
                        checkbox.b1.setFrames(2,0,1,0);
                    } 
                } else {
                    checkboxStatus.b2 = 0;
                    checkbox.b2.setFrames(2,0,1,0); 
                    //motorB.gang = 0;
                    gang2.b = false;
                }
            }
            function actionCheckboxC1 () {
                if ( checkboxStatus.c1 === 0 ) {
                    checkboxStatus.c1 = 1; 
                    checkbox.c1.setFrames(1,1,1,0);
                    //motorC.gang = 1;
                    gang1.c = true;
                    if ( checkboxStatus.c2 === 1 ) { 
                        gang2.c = false;
                        checkboxStatus.c2 = 0; 
                        checkbox.c2.setFrames(2,0,1,0);
                    }
                } else {
                    checkboxStatus.c1 = 0; 
                    checkbox.c1.setFrames(2,0,1,0);
                    //motorC.gang = 0;
                    gang1.c = false;
                }
            }
            function actionCheckboxC2 () {
                if ( checkboxStatus.c2 === 0 ) { 
                    checkboxStatus.c2 = 1; 
                    checkbox.c2.setFrames(1,1,1,0);
                    //motorC.gang = 2;
                    gang2.c = true;
                    if ( checkboxStatus.c1 === 1 ) { 
                        gang1.c = false;
                        checkboxStatus.c1 = 0; 
                        checkbox.c1.setFrames(2,0,1,0);
                    } 
                } else {
                    checkboxStatus.c2 = 0;
                    checkbox.c2.setFrames(2,0,1,0); 
                    //motorC.gang = 0;
                    gang2.c = false;
                }
            }
            function actionCheckboxD1 () {
                if ( checkboxStatus.d1 === 0 ) {
                    checkboxStatus.d1 = 1; 
                    checkbox.d1.setFrames(1,1,1,0);
                    //motorD.gang = 1;
                    gang1.d = true;
                    if ( checkboxStatus.d2 === 1 ) { 
                        gang2.d = false;
                        checkboxStatus.d2 = 0; 
                        checkbox.d2.setFrames(2,0,1,0);
                    } 
                } else { 
                    checkboxStatus.d1 = 0; 
                    checkbox.d1.setFrames(2,0,1,0); 
                    //motorD.gang = 0;
                    gang1.d = false;
                }
            }
            function actionCheckboxD2 () {
                if ( checkboxStatus.d2 === 0 ) { 
                    checkboxStatus.d2 = 1; 
                    checkbox.d2.setFrames(1,1,1,0);
                    //motorD.gang = 2;
                    gang2.d = true;
                    if ( checkboxStatus.d1 === 1 ) {
                        gang1.d = false; 
                        checkboxStatus.d1 = 0; 
                        checkbox.d1.setFrames(2,0,1,0);
                    }
                } else { 
                    checkboxStatus.d2 = 0; 
                    checkbox.d2.setFrames(2,0,1,0); 
                    //motorD.gang = 0;
                    gang2.d = false;
                }
            }

            
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

            sliderTrackB = game.add.graphics(0,0);
            sliderTrackB.beginFill(frameLineColor, 1);
            sliderTrackB.drawRect(positionMotorB.x+163, positionMotorB.y+16, 2, 156); //every 10% increase in motor speed will be a 16px difference
            sliderBarB = game.add.button(positionMotorB.x+133, positionMotorB.y+165, 'sliderBar');
            sliderBarB.inputEnabled=true;
            sliderBarB.input.useHandCursor = true;
            sliderBarB.input.enableDrag();
            sliderBarB.input.allowHorizontalDrag=false;
            sliderBarB.events.onInputUp.add(actionDragOnClickB);
                        
            sliderTrackC = game.add.graphics(0,0);
            sliderTrackC.beginFill(frameLineColor, 1);
            sliderTrackC.drawRect(positionMotorC.x+163, positionMotorC.y+16, 2, 156); //every 10% increase in motor speed will be a 16px difference
            sliderBarC = game.add.button(positionMotorC.x+133, positionMotorC.y+165, 'sliderBar');
            sliderBarC.inputEnabled=true;
            sliderBarC.input.useHandCursor = true;
            sliderBarC.input.enableDrag();
            sliderBarC.input.allowHorizontalDrag=false;
            sliderBarC.events.onInputUp.add(actionDragOnClickC);

            sliderTrackD = game.add.graphics(0,0);
            sliderTrackD.beginFill(frameLineColor, 1);
            sliderTrackD.drawRect(positionMotorD.x+163, positionMotorD.y+16, 2, 156); //every 10% increase in motor speed will be a 16px difference
            sliderBarD = game.add.button(positionMotorD.x+133, positionMotorD.y+165, 'sliderBar');
            sliderBarD.inputEnabled=true;
            sliderBarD.input.useHandCursor = true;
            sliderBarD.input.enableDrag();
            sliderBarD.input.allowHorizontalDrag=false;
            sliderBarD.events.onInputUp.add(actionDragOnClickD);

            sliderTrackG1 = game.add.graphics(0,0);
            sliderTrackG1.beginFill(frameLineColor, 1);
            sliderTrackG1.drawRect(positionMotorGang1.x+263, positionMotorGang1.y+16, 2, 156); //every 10% increase in motor speed will be a 16px difference
            sliderBarG1 = game.add.button(positionMotorGang1.x+233, positionMotorGang1.y+165, 'sliderBar2', actionDragOnClickG1);
            sliderBarG1.inputEnabled=true;
            sliderBarG1.input.useHandCursor = true;
            sliderBarG1.input.enableDrag();
            sliderBarG1.input.allowHorizontalDrag=false;
            sliderBarG1.events.onInputUp.add(actionDragOnClickG1);

            sliderTrackG2 = game.add.graphics(0,0);
            sliderTrackG2.beginFill(frameLineColor, 1);
            sliderTrackG2.drawRect(positionMotorGang2.x+263, positionMotorGang2.y+16, 2, 156); //every 10% increase in motor speed will be a 16px difference
            sliderBarG2 = game.add.button(positionMotorGang2.x+233, positionMotorGang2.y+165, 'sliderBar2', actionDragOnClickG2);
            sliderBarG2.inputEnabled=true;
            sliderBarG2.input.useHandCursor = true;
            sliderBarG2.input.enableDrag();
            sliderBarG2.input.allowHorizontalDrag=false;
            sliderBarG2.events.onInputUp.add(actionDragOnClickG2);

            // Add some labels to the sliders
            sliderLabel = {
                a : game.add.text(positionMotorA.x+129, positionMotorA.y+179, "Speed (\xB0/sec)", labelStyle),
                b : game.add.text(positionMotorB.x+129, positionMotorB.y+179, "Speed (\xB0/sec)", labelStyle),
                c : game.add.text(positionMotorC.x+129, positionMotorC.y+179, "Speed (\xB0/sec)", labelStyle),
                d : game.add.text(positionMotorD.x+129, positionMotorD.y+179, "Speed (\xB0/sec)", labelStyle),
                g1 : game.add.text(positionMotorGang1.x+229, positionMotorGang1.y+179, "Speed (\xB0/sec)" , labelStyle),
                g2 : game.add.text(positionMotorGang2.x+229, positionMotorGang2.y+179, "Speed (\xB0/sec)", labelStyle)
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
                var speedLabelG1Y = positionMotorGang1.y + 162 - 22 * i; //for gang 1
                var speedLabelG1 = game.add.text(positionMotorGang1.x+308, speedLabelG1Y, speedLabel, labelStyle)
            }
            for ( var i = 0; i <= 7; i++) {
                var speedLabel = speedRange[i] + "";
                var speedLabelG2Y = positionMotorGang2.y + 162 - 22 * i; //for gang 2
                var speedLabelG2 = game.add.text(positionMotorGang2.x+308, speedLabelG2Y, speedLabel, labelStyle)
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
            dragButton = {
                g1 : game.add.button(positionMotorGang1.x+339, positionMotorGang1.y+5, 'dragButton', actionDragG1, this),
                g2 : game.add.button(positionMotorGang2.x+339, positionMotorGang2.y+5, 'dragButton', actionDragG2, this),
                a : game.add.button(positionMotorA.x+239, positionMotorA.y+5, 'dragButton', actionDragA, this),
                b : game.add.button(positionMotorB.x+239, positionMotorB.y+5, 'dragButton', actionDragB, this),
                c : game.add.button(positionMotorC.x+239, positionMotorC.y+5, 'dragButton', actionDragC, this),
                d : game.add.button(positionMotorD.x+239, positionMotorD.y+5, 'dragButton', actionDragD, this)
            }


        /* Touch Sensor */
            touchIndicator = game.add.sprite(positionTouch.x+64, positionTouch.y+23, 'touchIndicator');
            touchIndicator.animations.add('up', [0], 1);
            touchIndicator.animations.add('pressed', [1], 1);

        /* Battery Level Sensor */
            batteryLevelBox = game.add.graphics(0,0);
            batteryLevelBox.beginFill(0xD8D8D8, 1);
            batteryLevelBox.lineStyle(1.5, frameLineColor, 1);
            batteryLevelBox.drawRect(positionBattery.x+10, positionBattery.y+31, 102, 18);

            batteryLevelShape = game.add.graphics(0,0);
            batteryLevelShape.beginFill(frameLineColor, 1);
            batteryLevelShape.drawRect(positionBattery.x+112, positionBattery.y+36, 4, 8);

            batteryLevelFill = game.add.graphics(0,0);
            batteryLevelFill.beginFill(0x808080, 1);
            batteryLevelFill.drawRect(positionBattery.x+11, positionBattery.y+32, Math.round(batteryLevel*100), 16); // the "x100" converts the battery level (whatever it initially is) to the scale of 100 px wide

        /* LCD Screen */
            LCDScreenBox = game.add.graphics(0,0);
            LCDScreenBox.beginFill(0x808080, 1);
            LCDScreenBox.lineStyle(1.5, frameLineColor, 1);
            LCDScreenBox.drawRect(positionScreen.x+10, positionScreen.y+32, 172, 50);


        /* Try to send out all speeds, so they update in each window viewing the dashboard...unless we make a keyspace for speeds */
            channel.handler = function (message) {
                console.log("update speed");
                var m = message.payload.getBytesAsJSON();
                updateSpeed(m);
            }


        } // end create 
        //=============================================================================

    /* To go with the channel handler function for updating speeds */
        function sendSpeed(port, speed) {
            var setting = {}; // create 'setting' object to hold the motor port and speed setting
            setting.port = port;
            setting.speed = speed;
            console.log ("sending speed " + setting.speed + " for port " + setting.port);
            //channel.publish(setting);

            subscribeMotor(port, speed);
            //console.log("motor joined " + joined);


        }

        // function updateSpeed(speedMessage) {
        //     console.log ("updating speed " + speedMessage.speed + " for port " + speedMessage.port);
        //     //if (speedMessage.port == 'a') {
        //     sliderBarB.y = positionMotorB.y + 11 - (154 / 700) * (speedMessage.speed - 700);
        //     // }
        // }
        // function updateMotorSpeed(motor, speed) {
        //     console.log ("updating speed " + speed + " for port " + motor);
        //     //if (speedMessage.port == 'a') {
        //     sliderBarB.y = positionMotorB.y + 11 - (154 / 700) * (speed - 700);
        //     // }
        // }
        function drawSpeed(motor, speed) {
            sliderBarB.y = positionMotorB.y + 11 - (154 / 700) * (speed - 700);
        }

    /* Motor communication with Robot via messages to Big Bang channel */
        function moveMotor( motor, direction, speed ) {
            var data = {};
            data.type = "motorStart";
            data.port = motor;
            data.dir = direction;
            data.speed = speed;
            console.log( "sending " + JSON.stringify(data));
            channel.publish( data );
        }

        function stopMotor( motor ) {
            var data = {};
            data.type = "motorStop";
            data.port = motor;
            console.log( "sending " + JSON.stringify(data));
            channel.publish( data );
        }


    /* Button-click functions */
        function actionInputOnClick () {
            game.world.remove(screenMessage.messageDisplay1); // remove any messages present
            game.world.remove(screenMessage.messageDisplay2);
            game.world.remove(screenMessage.messageDisplay3);
            messageDisplay = prompt("What would you like to display on the GigaBot's LCD screen?");

            var messageDisplay1 = messageDisplay.substring(0,20);
            var messageDisplay2 = messageDisplay.substring(20,40);
            var messageDisplay3 = messageDisplay.substring(40,60);

            if ( messageDisplay.length > 60 ) {
                alert("Sorry, too many characters! The following will be displayed: \n" + messageDisplay1 + "\n" + messageDisplay2 + "\n" + messageDisplay3);
            }
            screenMessage.messageDisplay1 = game.add.text(positionScreen.x+13, positionScreen.y+37, messageDisplay1, messageStyle);
            screenMessage.messageDisplay2 = game.add.text(positionScreen.x+13, positionScreen.y+51, messageDisplay2, messageStyle);
            screenMessage.messageDisplay3 = game.add.text(positionScreen.x+13, positionScreen.y+65, messageDisplay3, messageStyle);

            //screenMessage.messageDisplay1 = game.add.text(positionScreen.x+13, positionScreen.y+33, messageDisplay1, messageStyle);
        }

        function actionResumeOnClick () {
            // resume all motors at their current settings
            dashboardStatus = 1;
            resumeButton.setFrames(3,3,3,3);
            pauseButton.setFrames(1,0,2,0);
            resumeButton.input.useHandCursor = false;
            pauseButton.input.useHandCursor = true;
        }
        function actionPauseOnClick () {
            // stop all motors at their current settings
            dashboardStatus = 0;
            pauseButton.setFrames(3,3,3,3);
            resumeButton.setFrames(1,0,2,0);
            pauseButton.input.useHandCursor = false;
            resumeButton.input.useHandCursor = true;
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
            sendSpeed('a', motorA.speed);
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
            sendSpeed('a', motorA.speed);
            publishSpeed('a', motorA.speed);
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
            sendSpeed('b', motorB.speed);
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
            sendSpeed('b', motorB.speed);
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
            sendSpeed('c', motorC.speed);
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
            sendSpeed('c', motorC.speed);
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
            sendSpeed('d', motorD.speed);
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
            sendSpeed('d', motorD.speed);
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
            motorA.speed = 700 + (700/154) * (positionMotorA.y + 11 - sliderBarA.y);
            console.log(motorA.speed.toFixed(2)); //this makes motorA.speed a string with 2 decimal places
            sendSpeed('a', motorA.speed);
        }
        function actionDragOnClickB() {
            if (sliderBarB.y < positionMotorB.y+11) {
                sliderBarB.y = positionMotorB.y+11;
            } else if (sliderBarB.y > positionMotorB.y+165) {
                sliderBarB.y = positionMotorB.y+165;
            }
            motorB.speed = 700 + (700/154) * (positionMotorB.y + 11 - sliderBarB.y);
            console.log(motorB.speed.toFixed(2));
            sendSpeed('b', motorB.speed);
        }
        function actionDragOnClickC() {
            if (sliderBarC.y < positionMotorC.y+11) {
                sliderBarC.y = positionMotorC.y+11;
            } else if (sliderBarB.y > positionMotorC.y+165) {
                sliderBarC.y = positionMotorC.y+165;
            }
            motorC.speed = 700 + (700/154) * (positionMotorC.y + 11 - sliderBarC.y);
            console.log(motorC.speed.toFixed(2));
            sendSpeed('c', motorC.speed);
        }
        function actionDragOnClickD() {
            if (sliderBarD.y < positionMotorD.y+11) {
                sliderBarD.y = positionMotorD.y+11;
            } else if (sliderBarD.y > positionMotorD.y+165) {
                sliderBarD.y = positionMotorD.y+165;
            }
            motorD.speed = 700 + (700/154) * (positionMotorD.y + 11 - sliderBarD.y);
            console.log(motorD.speed.toFixed(2));
            sendSpeed('d', motorD.speed);
        }

        //=============================================================================
    /* Gang speed controls */
        function actionDecreaseOnClickG1() {
            if (gang1.speed >= 50) {
                gang1.speed = gang1.speed - 50;
                sliderBarG1.y = sliderBarG1.y + 11; 
            } else {
                gang1.speed = 0; // just set to min position
                sliderBarG1.y = positionMotorGang1.y + 165; //and move sliderbar to that position
            }
            console.log(gang1.speed.toFixed(2));
        }
        function actionIncreaseOnClickG1() {
            if (gang1.speed <= 650) {
                gang1.speed = gang1.speed + 50;
                sliderBarG1.y = sliderBarG1.y - 11;
            } else {
                gang1.speed = 700; //just set to max speed
                sliderBarG1.y = positionMotorGang1.y + 11; //and move sliderbar to that position
            }
            console.log(gang1.speed.toFixed(2));
        }
        function actionDecreaseOnClickG2() {
            if (gang2.speed >= 50) {
                gang2.speed = gang2.speed - 50;
                sliderBarG2.y = sliderBarG2.y + 11;
            } else {
                gang2.speed = 0;
                sliderBarG2.y = positionMotorGang2.y + 165;
            }
            console.log(gang2.speed.toFixed(2));
        }
        function actionIncreaseOnClickG2() {
            if (gang2.speed <= 650) {
                gang2.speed = gang2.speed + 50;
                sliderBarG2.y = sliderBarG2.y - 11;
            } else {
                gang2.speed = 700;
                sliderBarG2.y = positionMotorGang2.y + 11;
            }
            console.log(gang2.speed.toFixed(2));
        }
        function actionDragOnClickG1() {
            if (sliderBarG1.y < positionMotorGang1.y+11) {
                sliderBarG1.y = positionMotorGang1.y+11;
            } else if (sliderBarG1.y > positionMotorGang1.y+165) {
                sliderBarG1.y = positionMotorGang1.y+165;
            }
            gang1.speed = 700 + (700/154) * (positionMotorGang1.y + 11 - sliderBarG1.y);
            console.log(gang1.speed.toFixed(2));
        }
        function actionDragOnClickG2() {
            if (sliderBarG2.y < positionMotorGang2.y+11) {
                sliderBarG2.y = positionMotorGang2.y+11;
            } else if (sliderBarG2.y > positionMotorGang2.y+165) {
                sliderBarG2.y = positionMotorGang2.y+165;
            }
            gang2.speed = 700 + (700/154) * (positionMotorGang2.y + 11 - sliderBarG2.y);
            console.log(gang2.speed.toFixed(2));
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
        /* Publish a motor/speed combination to a motor keyspace */
        function publishSpeed(motor, speed) {
            channel.getKeyspace(motor).put(motor, speed);
            console.log("got keyspace for motor " + motor + " with speed " + speed);
            updateMotorSpeed(motor, speed);
        }

        function publishSpeedSubscriber(motor, speed) {
            channel.getKeyspace(client.clientId()).put(motor, speed);
            console.log("got keyspace for " + client.client.Id() + " with motor " + motor + " and speed " + speed);
            updateMotorSpeed(motor, speed);
        } 

        function publishSpeedPositionSubscriber(motor, speed) {
            if (channel) {
                channel.getKeyspace(client.clientId()).put("port",motor);
                channel.getKeyspace(client.clientId()).put("speed",speed);
            }
        }

        function subscribeUser(clientId) {
            channel.getKeyspace(clientId).on("pos", function (update) {
                console.log("joined = " + clientId);
                drawSpeed(clientId, update);
            }, function (deleted) {
                console.log("deleted");
            });
        }

        function subscribeMotor(port, speed) {
            channel.getKeyspace(port).on("motor", function (update) {
                console.log("joined = " + port);
                drawSpeed(port, update);
            }, function (deleted) {
                console.log("deleted");
            });
        }

        // function subscribeMotor(motor) {
        //     channel.getKeyspace(motor).on("speed", function (update) {
        //         drawSpeed(motor, update);
        //     }, function (deleted) {
        //         console.log("deleted");
        //     });
        // }

        function update() {
            // For linear interpolation of motor angles

/*            var dMotor = channel.channelData.get('d'); //this seems to just be getting data that only updates 1 time per second (i.e., it'll get the same value about 20 times before getting an updated one)
            if (dMotor) {
                //console.log(dMotor.position);
                needleD.angle = dMotor.position;
                //console.log(needleD.angle);
             }*/



            // Add something to show the current Speed of the robot, on the slider (so all viewers see the current speed)
            //sliderBarD.y = positionMotorD.y + 11 - (154 / 700) * (dMotor.speed - 700);

            /*     from moveMotor function:
            var data = {};
            data.type = "motorStart";
            data.port = motor;
            data.dir = direction;
            data.speed = speed;
            console.log( "sending " + JSON.stringify(data));
            channel.publish( data );
            */


             //needleD.angle = needleD.angle + (needleD.angle - dMotor.position) / 2; // will this make the movements less jerky (sort of an interpolation)?
            userType = document.getElementById("textEdit"); // get text in textEditor
            userNum=parseFloat(userType.innerHTML, 10); // translate text into numeric format if possible
            if (isNaN(userNum)) { // if it's NotaNumber
                console.log("Not a number. Attempted parsed value: " + userNum);
            }
            else { // if it is a number
                needleA.angle = needleA.angle + userNum;
                console.log("Success! Parsed userNum value: " + userNum);
            }
        } // end update

    } // end beginGame

}); // end require

            // NOTE, IN THIS DEVELOPMENT STAGE, WE'RE USING 'msg' AND KEYBOARD INPUTS AS PLACEHOLDERS FOR THE MESSAGES ON THE CHANNEL. 
            // THE IF BLOCK STRUCTURE MAY STAY BUT WITH DIFFERENT INPUTS

            // game.camera.y = game.input.y;
            // game.camera.x = game.input.x;
/*            if (game.input.mousePointer.y >= 600) {
                game.camera.y += 15;
            }
            if (game.input.mousePointer.y < 500) {
                game.camera.y -= 15;
            }
            if (game.input.mousePointer.x >= 900) {
                game.camera.x += 15;

            }
            if (game.input.mousePointer.x < 900) {
                game.camera.x -= 15;
            }*/
            
            // Create text editor for needleA above program
            
            // 

            /* test out dials and values */
            // if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            //     needleA.angle = needleA.angle + 10;
            //     needleB.angle = needleB.angle + 10;
            //     needleC.angle = needleC.angle + 10;
            //     needleD.angle = needleD.angle + 10;

            //     game.world.remove(color.colorValueDisplay);
            //     colorValue += 1;
            //     colorValueDisplay = colorValue;
            //     color.colorValueDisplay = game.add.text(positionColor.x + 42, positionColor.y+22, colorValueDisplay, labelStyle3);

            //     game.world.remove(color.lightIntensityDisplay);
            //     lightIntensity += 1;
            //     lightIntensityDisplay = lightIntensity;
            //     color.lightIntensityDisplay = game.add.text(positionColor.x + 98, positionColor.y+47, lightIntensityDisplay, labelStyle3);

            // }


/*            if (game.input.keyboard.isDown(Phaser.Keyboard.Y)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "Yellow"
                color.colorNameDisplay = game.add.text(positionColor.x+145, positionColor.y+22, colorNameDisplay, labelStyle3); //(colorR, colorG, colorB));
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "White"
                color.colorNameDisplay = game.add.text(positionColor.x+145, positionColor.y+22, colorNameDisplay, labelStyle3);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.B)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "Black"
                color.colorNameDisplay = game.add.text(positionColor.x+145, positionColor.y+22, colorNameDisplay, labelStyle3);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "Blue"
                color.colorNameDisplay = game.add.text(positionColor.x+145, positionColor.y+22, colorNameDisplay, labelStyle3);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.P)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "Red"
                color.colorNameDisplay = game.add.text(positionColor.x+145, positionColor.y+22, colorNameDisplay, labelStyle3);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.G)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "Green"
                color.colorNameDisplay = game.add.text(positionColor.x+145, positionColor.y+22, colorNameDisplay, labelStyle3);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.O)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "Brown"
                color.colorNameDisplay = game.add.text(positionColor.x+145, positionColor.y+22, colorNameDisplay, labelStyle3);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.L)) {
                game.world.remove(color.colorNameDisplay);
                colorNameDisplay = colorName = "Colorless"
                color.colorNameDisplay = game.add.text(positionColor.x+144, positionColor.y+22, colorNameDisplay, labelStyle3);
            }*/

            /* motor A status */
            // var msg = { Astatus : 0 }
            // if (game.input.keyboard.isDown(Phaser.Keyboard.Q)) { msg.Astatus = 0; }
            // else if (game.input.keyboard.isDown(Phaser.Keyboard.A)) { msg.Astatus = 1; }
            // else if (game.input.keyboard.isDown(Phaser.Keyboard.Z)) { msg.Astatus = 2; }
            // if (motorA.status == msg.Astatus) {
            // } else {
            //     motorA.status = msg.Astatus;
            //     if (motorA.status == 1) {
            //         statusLightA.animations.play('pluggedIn');
            //     } else if (motorA.status == 2) {
            //         statusLightA.animations.play('stalled'); 
            //     } else if (motorA.status == 0) { //default
            //         statusLightA.animations.play('unplugged');
            //     }
            // }
            /* motor B status */
            // var msg = { Bstatus : 0 }
            // if (game.input.keyboard.isDown(Phaser.Keyboard.W)) { msg.Bstatus = 0; }
            // else if (game.input.keyboard.isDown(Phaser.Keyboard.S)) { msg.Bstatus = 1; }
            // else if (game.input.keyboard.isDown(Phaser.Keyboard.X)) { msg.Bstatus = 2; }
            // if (motorB.status == msg.Bstatus) {
            // } else {
            //     motorB.status = msg.Bstatus;
            //     if (motorB.status == 1) {
            //         statusLightB.animations.play('pluggedIn');
            //     } else if (motorB.status == 2) {
            //         statusLightB.animations.play('stalled'); 
            //     } else if (motorB.status == 0) { //default
            //         statusLightB.animations.play('unplugged');
            //     }
            // }
            // /* motor C status */
            // var msg = { Cstatus : 0 }
            // if (game.input.keyboard.isDown(Phaser.Keyboard.R)) { msg.Cstatus = 0; }
            // else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) { msg.Cstatus = 1; }
            // else if (game.input.keyboard.isDown(Phaser.Keyboard.C)) { msg.Cstatus = 2; }
            // if (motorC.status == msg.Cstatus) {
            // } else {
            //     motorC.status = msg.Cstatus;
            //     if (motorC.status == 1) {
            //         statusLightC.animations.play('pluggedIn');
            //     } else if (motorC.status == 2) {
            //         statusLightC.animations.play('stalled'); 
            //     } else if (motorC.status == 0) { //default
            //         statusLightC.animations.play('unplugged');
            //     }
            // }
            // /* motor D status */
            // var msg = { Dstatus : 0 }
            // if (game.input.keyboard.isDown(Phaser.Keyboard.T)) { msg.Dstatus = 0; }
            // else if (game.input.keyboard.isDown(Phaser.Keyboard.F)) { msg.Dstatus = 1; }
            // else if (game.input.keyboard.isDown(Phaser.Keyboard.V)) { msg.Dstatus = 2; }
            // if (motorD.status == msg.Dstatus) {
            // } else {
            //     motorD.status = msg.Dstatus;
            //     if (motorD.status == 1) {
            //         statusLightD.animations.play('pluggedIn');
            //     } else if (motorD.status == 2) {
            //         statusLightD.animations.play('stalled'); 
            //     } else if (motorD.status == 0) { //default
            //         statusLightD.animations.play('unplugged');
            //     }
            // }
            // //=============================================================================
            // /* sensor 1 status */
            // var msg = { status1 : 0 }
            // if (game.input.keyboard.isDown(Phaser.Keyboard.P)) { msg.status1 = 0; }
            // else if (game.input.keyboard.isDown(Phaser.Keyboard.L)) { msg.status1 = 1; }
            // if (sensor1.status == msg.status1) {
            // } else {
            //     sensor1.status = msg.status1;
            //     if (sensor1.status == 1) {
            //         statusLight1.animations.play('pluggedIn');
            //     } else if (sensor1.status == 0) { //default
            //         statusLight1.animations.play('unplugged');
            //     }
            // }
            // /* sensor 2 status */
            // var msg = { status2 : 0 }
            // if (game.input.keyboard.isDown(Phaser.Keyboard.O)) { msg.status2 = 0; }
            // else if (game.input.keyboard.isDown(Phaser.Keyboard.K)) { msg.status2 = 1; }
            // if (sensor2.status == msg.status2) {
            // } else {
            //     sensor2.status = msg.status2;
            //     if (sensor2.status == 1) {
            //         statusLight2.animations.play('pluggedIn');
            //     } else if (sensor2.status == 0) { //default
            //         statusLight2.animations.play('unplugged');
            //     }
            // }
            // /* sensor 3 status */
            // var msg = { status3 : 0 }
            // if (game.input.keyboard.isDown(Phaser.Keyboard.I)) { msg.status3 = 0; }
            // else if (game.input.keyboard.isDown(Phaser.Keyboard.J)) { msg.status3 = 1; }
            // if (sensor3.status == msg.status3) {
            // } else {
            //     sensor3.status = msg.status3;
            //     if (sensor3.status == 1) {
            //         statusLight3.animations.play('pluggedIn');
            //     } else if (sensor3.status == 0) { //default
            //         statusLight3.animations.play('unplugged');
            //     }
            // }
            // /* sensor 4 status */
            // var msg = { status4 : 0 }
            // if (game.input.keyboard.isDown(Phaser.Keyboard.U)) { msg.status4 = 0; }
            // else if (game.input.keyboard.isDown(Phaser.Keyboard.H)) { msg.status4 = 1; }    
            // if (sensor4.status == msg.status4) {
            // } else {
            //     sensor4.status = msg.status4;
            //     if (sensor4.status == 1) {
            //         statusLight4.animations.play('pluggedIn');
            //     } else if (sensor4.status == 0) { //default
            //         statusLight4.animations.play('unplugged');
            //     }
            // }

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

            // if (dashboardStatus == 1) { // i.e., dashboard has started
            //     var multiplier = 35; // THIS NUMBER IS JUST A PLACEHOLDER
            //     if (motorA.speed > 0) {
            //         if (directionA == 1) { // i.e. direction is forward
            //             needleA.angle += multiplier * motorA.speed;
            //         } else {
            //             needleA.angle -= multiplier * motorA.speed;
            //         }
            //     }
            //     if (motorB.speed > 0) {
            //         if (directionB == 1) {
            //             needleB.angle += multiplier * motorB.speed;
            //         } else {
            //             needleB.angle -= multiplier * motorB.speed;
            //         }
            //     }
            //     if (motorC.speed > 0) {
            //         if (directionC == 1) {
            //             needleC.angle += multiplier * motorC.speed;
            //         } else {
            //             needleC.angle -= multiplier * motorC.speed;
            //         }
            //     }
            //     if (motorD.speed > 0) {
            //         if (directionD == 1) {
            //             needleD.angle += multiplier * motorD.speed;
            //         } else {
            //             needleD.angle -= multiplier * motorD.speed;
            //         }
            //     }
            // }

            //=============================================================================
            /* IR Sensor */

            // if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            //     game.world.remove(IR.IRDistDisplay);
            //     IRDist = IRDist + 0.01; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //     IRDistDisplay = IRDist;
            //     IR.IRDistDisplay = game.add.text(positionIR.x+71, positionIR.y+25, IRDistDisplay.toFixed(2), labelStyle3);
            // }
            // if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            //     game.world.remove(IR.IRDistDisplay);
            //     IRDist = IRDist - 0.01; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //     IRDistDisplay = IRDist;
            //     IR.IRDistDisplay = game.add.text(positionIR.x+71, positionIR.y+25, IRDistDisplay.toFixed(2), labelStyle3);
            // }

            //=============================================================================
            /* Color Sensor */
            // if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            //     game.world.remove(color.colorRDisplay);
            //     game.world.remove(color.colorGDisplay);
            //     game.world.remove(color.colorBDisplay);
            //     //game.world.remove(color.colorValueDisplay);
            //     if (colorR <= 255) {    
            //         colorR = colorR + 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //         colorG = colorG + 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //         colorB = colorB + 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //         //colorValue = colorValue + 0.01;
            //         colorRDisplay = colorR;
            //         colorGDisplay = colorG;
            //         colorBDisplay = colorB;
            //         //colorValueDisplay = colorValue;
            //         color.colorRDisplay = game.add.text(positionColor.x+40, positionColor.y+33, Math.round(colorRDisplay), {font: "16px Arial", fill: "red"});
            //         color.colorGDisplay = game.add.text(positionColor.x+116, positionColor.y+33, Math.round(colorGDisplay), {font: "16px Arial", fill: "green"});
            //         color.colorBDisplay = game.add.text(positionColor.x+189, positionColor.y+33, Math.round(colorBDisplay), {font: "16px Arial", fill: "blue"});
            //     }
            //     else {
            //         color.colorRDisplay = game.add.text(positionColor.x+40, positionColor.y+33, "255", {font: "16px Arial", fill: "red"});
            //         color.colorGDisplay = game.add.text(positionColor.x+116, positionColor.y+33, "255", {font: "16px Arial", fill: "green"});
            //         color.colorBDisplay = game.add.text(positionColor.x+189, positionColor.y+33, "255", {font: "16px Arial", fill: "blue"});
            //     }
            //     //color.colorValueDisplay = game.add.text(positionColor.x+189, positionColor.y+33, Math.round(colorValueDisplay), labelStyle3);
            // }
            // if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            //     game.world.remove(color.colorRDisplay);
            //     game.world.remove(color.colorGDisplay);
            //     game.world.remove(color.colorBDisplay);
            //     //game.world.remove(color.colorValueDisplay);
            //     if (colorR >= 0) {
            //         colorRDisplay = colorR = colorR - 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //         colorGDisplay = colorG = colorG - 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //         colorBDisplay = colorB = colorB - 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //         //colorValueDisplay = colorValue = colorValue + 0.01;
            //         color.colorRDisplay = game.add.text(positionColor.x+40, positionColor.y+33, Math.round(colorRDisplay), {font: "16px Arial", fill: "red"});
            //         color.colorGDisplay = game.add.text(positionColor.x+116, positionColor.y+33, Math.round(colorGDisplay), {font: "16px Arial", fill: "green"});
            //         color.colorBDisplay = game.add.text(positionColor.x+189, positionColor.y+33, Math.round(colorBDisplay), {font: "16px Arial", fill: "blue"});
            //         //color.colorValueDisplay = game.add.text(positionColor.x+189, positionColor.y+33, Math.round(colorValueDisplay), labelStyle3);
            //     }
            //     else {
            //         color.colorRDisplay = game.add.text(positionColor.x+40, positionColor.y+33, "0", {font: "16px Arial", fill: "red"});
            //         color.colorGDisplay = game.add.text(positionColor.x+116, positionColor.y+33, "0", {font: "16px Arial", fill: "green"});
            //         color.colorBDisplay = game.add.text(positionColor.x+189, positionColor.y+33, "0", {font: "16px Arial", fill: "blue"});
            //     }
            // }

            //=============================================================================


            /* LCD Screen */

        

        //function render() {
            //console.log("render");
        //}

        /*function paused() {
            console.log("paused");
        }

        function destroy() {
            console.log("destroy");
        }*/




//=======================================================================================================================================
//=======================================================================================================================================



            //fButton.a.name = "a", fButton.b.name = "b", fButton.c.name = "c", fButton.d.name = "d";
            
/*            function fButtonCallback () {
                // NOW THIS FUNCTION IS CALLED ON CLICK RATHER THAN ON RELEASE (MODIFIED LINE 3556 IN THE NON-MINIFIED PHASER FRAMEWORK FILE)

                moveMotor(this, "f", speed.this);
            
            }*/

           /*function fButtonSet (newDirectionButton) {
                this.directionButton = newDirectionButton;

                this.directionButton.events.onInputOver.add(this.directionButton.onInputOverHandler, this);
                this.directionButton.events.onInputOut.add(this.directionButton.onInputOutHandler, this);
                this.directionButton.events.onInputDown.add(this.directionButton.onInputDownHandler, this);
                this.directionButton.events.onInputUp.add(this.directionButton.onInputUpHandler, this);
                console.log("finished 1");
                console.log(this.directionButton);
                onInputDownHandler = function () {
                    console.log("here");
                }
            }*/

/*            speed = {
                a : 314, // these are placeholders for now
                b : 159,
                c : 265,
                d : 359

            }*/

// old motor forward/reverse button actions
/*
            fButton.a.events.onInputDown.add(onActionDownForwardA, this); // on click
            function onActionDownForwardA() {
                console.log("onActionDownForwardA"); 
                moveMotor( "a", "f", motorA.speed);
            }
            fButton.a.events.onInputUp.add(onActionUpForwardA, this); // on release
            function onActionUpForwardA() {
                console.log("onActionUpForwardA");
                stopMotor("a"); 
            }*/
/*            rButton.a.events.onInputDown.add(onActionDownReverseA, this); //on click
            function onActionDownReverseA() {
                console.log("onActionDownReverseA"); 
                moveMotor( "a", "r", motorA.speed);
            }
            rButton.a.events.onInputUp.add(onActionUpReverseA, this); //on release
            function onActionUpReverseA() {
                console.log("onActionUpReverseA");
                stopMotor("a"); 
            }*/

            

/*            fButton.b.events.onInputDown.add(onActionDownForwardB, this);
            function onActionDownForwardB() {
                console.log("onActionDownForwardB"); 
                moveMotor( "b", "f", motorB.speed);
            }
            fButton.b.events.onInputUp.add(onActionUpForwardB, this);
            function onActionUpForwardB() {
                console.log("onActionUpForwardB");
                stopMotor("b"); 
            }
            rButton.b.events.onInputDown.add(onActionDownReverseB, this);
            function onActionDownReverseB() {
                console.log("onActionDownReverseB"); 
                moveMotor( "b", "r", motorB.speed);
            }
            rButton.b.events.onInputUp.add(onActionUpReverseB, this);
            function onActionUpReverseB() {
                console.log("onActionUpReverseB");
                stopMotor("b"); 
            }

            

            fButton.c.events.onInputDown.add(onActionDownForwardC, this);
            function onActionDownForwardC() {
                console.log("onActionDownForwardC"); 
                moveMotor( "c", "f", motorC.speed);
            }
            fButton.c.events.onInputUp.add(onActionUpForwardC, this);
            function onActionUpForwardC() {
                console.log("onActionUpForwardC");
                stopMotor("c"); 
            }
            rButton.c.events.onInputDown.add(onActionDownReverseC, this);
            function onActionDownReverseC() {
                console.log("onActionDownReverseC"); 
                moveMotor( "c", "r", motorC.speed);
            }
            rButton.c.events.onInputUp.add(onActionUpReverseC, this);
            function onActionUpReverseC() {
                console.log("onActionUpReverseC");
                stopMotor("c"); 
            }


            
            fButton.d.events.onInputDown.add(onActionDownForwardD, this);
            function onActionDownForwardD() {
                console.log("onActionDownForwardD"); 
                moveMotor( "d", "f", motorD.speed);
            }
            fButton.d.events.onInputUp.add(onActionUpForwardD, this);
            function onActionUpForwardD() {
                console.log("onActionUpForwardD");
                stopMotor("d"); 
            }
            rButton.d.events.onInputDown.add(onActionDownReverseD, this);
            function onActionDownReverseD() {
                console.log("onActionDownReverseD"); 
                moveMotor( "d", "r", motorD.speed);
            }
            rButton.d.events.onInputUp.add(onActionUpReverseD, this);
            function onActionUpReverseD() {
                console.log("onActionUpReverseD");
                stopMotor("d"); 
            }*/


            /* Button States */
            // To change the states of buttons (i.e., their appearance when up, down, over, and out), we can set and update the states using:
            // see Phaser API file 'Button.js' at ll. 586-637




                      /* Move entire motor ganging box using a button for clicking and dragging */
            //dragButton = {
                // gang : game.add.button(positionMotorGang.x+221, positionMotorGang.y+5, 'dragButton', actionDragGang, this)
            //}
            // function actionDragGang () {
            //     // check that it's inside world bounds, so we won't lose the box!
            //     if (game.input.x + 25 < game.world.width) { //right
            //         if (game.input.x > 220) { //left
            //             if (game.input.y + 155 < game.world.height) { //bottom
            //                 if (game.input.y > 5) { // top
            //                     dragButton.gang.x = game.input.x;
            //                     dragButton.gang.y = game.input.y;
            //                 } else {
            //                     dragButton.gang.x = game.input.x;
            //                     dragButton.gang.y = 5;
            //                 }
            //             } else {
            //                 dragButton.gang.x = game.input.x;
            //                 dragButton.gang.y = game.world.height-155;
            //             } 
            //         } else {
            //             dragButton.gang.x = 220;
            //             dragButton.gang.y = game.input.y;
            //         }
            //     } else {
            //         dragButton.gang.x = game.world.width-25;
            //         dragButton.gang.y = game.input.y;
            //     }
                    
            //     // positionMotorGang.x = dragButton.gang.x - 200;
            //     // positionMotorGang.y = dragButton.y;
            //     /* update frame position */
            //     frameMotorGanging.destroy();
            //     frameMotorGanging = game.add.graphics(0,0);
            //     frameMotorGanging.lineStyle(1, frameLineColor, 1);
            //     frameMotorGanging.drawRect(dragButton.gang.x-220, dragButton.gang.y-5, 250, 160);
            //     /* update checkbox positions */
            //     checkbox.a1.x = dragButton.gang.x-211, checkbox.a1.y = dragButton.gang.y+27;
            //     checkbox.a2.x = dragButton.gang.x-105, checkbox.a2.y = dragButton.gang.y+27;
            //     checkbox.b1.x = dragButton.gang.x-211, checkbox.b1.y = dragButton.gang.y+57;
            //     checkbox.b2.x = dragButton.gang.x-106, checkbox.b2.y = dragButton.gang.y+57;
            //     checkbox.c1.x = dragButton.gang.x-211, checkbox.c1.y = dragButton.gang.y+87;
            //     checkbox.c2.x = dragButton.gang.x-106, checkbox.c2.y = dragButton.gang.y+87;
            //     checkbox.d1.x = dragButton.gang.x-211, checkbox.d1.y = dragButton.gang.y+117;
            //     checkbox.d2.x = dragButton.gang.x-106, checkbox.d2.y = dragButton.gang.y+117;
            //     /* update label positions */
            //     labelMotorGang.a1.x = dragButton.gang.x-181, labelMotorGang.a1.y = dragButton.gang.y+30;
            //     labelMotorGang.a2.x = dragButton.gang.x-76, labelMotorGang.a2.y = dragButton.gang.y+30;
            //     labelMotorGang.b1.x = dragButton.gang.x-181, labelMotorGang.b1.y = dragButton.gang.y+60;
            //     labelMotorGang.b2.x = dragButton.gang.x-76, labelMotorGang.b2.y = dragButton.gang.y+60;
            //     labelMotorGang.c1.x = dragButton.gang.x-181, labelMotorGang.c1.y = dragButton.gang.y+90;
            //     labelMotorGang.c2.x = dragButton.gang.x-76, labelMotorGang.c2.y = dragButton.gang.y+90;
            //     labelMotorGang.d1.x = dragButton.gang.x-181, labelMotorGang.d1.y = dragButton.gang.y+120;
            //     labelMotorGang.d2.x = dragButton.gang.x-76, labelMotorGang.d2.y = dragButton.gang.y+120;
            //     labelMotorGang.g1.x = dragButton.gang.x-211, labelMotorGang.g1.y = dragButton.gang.y;
            //     labelMotorGang.g2.x = dragButton.gang.x-106, labelMotorGang.g2.y = dragButton.gang.y;
            // } // end actionDragGang

