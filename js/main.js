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
           });
        }
        else {
            console.log("CONNECT FAILURE.");
        }
    });

    function beginGame(client, channel) {
        var game = new Phaser.Game(1230, 1068, Phaser.AUTO, null, { // 960 x 1068 fits nicely on an iPhone 4. 
            preload: preload, //Since this is likely the small phone screen anyone would be using, it's important to consider, since we currently have the issue of not scrolling about the Phaser game world window
            create: create,
            update: update,
            //render: render,
            //paused: paused,
            //destroy: destroy
        });

        var bbLogo, botLogo;
        var poweredBy = "Powered by ";
        var dashboardName = "GigaBots Dashboard";
        //var titleStyle = { font: "32px Lucida Console, Arial",fill: "#313131"}
        var labelStyle = { font: "12px Arial", fill: "#bcbcbc" }
        var labelStyle2 = { font: "20px Arial", fill: "#bcbcbc" }        
        var labelStyle3 = { font: "16px Arial", fill: "#bcbcbc"}
        var labelStyle4 = { font: "14px Arial", fill: "#bcbcbc" }
        var labelStyle5 = { font: "20px Arial", fill: "#313131" } 
        var messageStyle = { font: "14px Lucida Console, Arial", fill: "#313131"}   
        var frameLineColor = 0xa3a3a3;
        var backgound, backgroundBox;

        var dragButton;

        // positions of different units are the upper left x & y coordinates of their frames

        /* Motor and sensor statuses */
        var frameMotorStatus, labelMotorStatus = "Motors";
        var positionMotorStatus = { x : 541, y : 65 }
        var frameSensorStatus, labelSensorStatus = "Sensors";
        var positionSensorStatus = { x : 681, y : 65}
        
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
        var positionMotorA = { x : 15, y : 225 }
        var positionMotorB = { x : 305, y : 225 }
        var positionMotorC = { x : 15, y : 435 }
        var positionMotorD = { x : 305, y : 435 }
        var labelMotor = { a : "Motor A", b : "Motor B", c : "Motor C", d : "Motor D"}

        // forward and reverse
        var fButton;
        var rButton;
        var directionA = 1, directionB = 1, directionC = 1, directionD = 1, directionG1 = 1, directionG2 = 1; // forward = 1, reverse = -1

        // speed
        // WE WANT TO STOP USING POWER (0-1 SCALE) AND START USING SPEED (0-700 SCALE, IN UNITS OF DEG/SEC)
        var sliderLabel;
        var sliderBarA, sliderBarB, sliderBarC, sliderBarD, sliderBarG1, sliderBarG2;
        var sliderTrackA, sliderTrackB, sliderTrackC, sliderTrackD, sliderTrackG1, sliderTrackG2;
        var powerA = 0, powerB = 0, powerC = 0, powerD = 0, powerG1 = 0, powerG2 = 0; //NEED TO REMOVE POWER AND REPLACE WITH SPEED
        var minusButtonA, minusButtonB, minusButtonC, minusButtonD, minusButtonG1, minusButtonG2;
        var plusButtonA, plusButtonB, plusButtonC, plusButtonD, plusButtonG1, plusButtonG2;
        var powerRange = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]; // REMOVE THIS SOON
        var speed;
        var speedRange = [0, 100, 200, 300, 400, 500, 600, 700];

        // rotation position         
        var labelRotation = "Motor Rotational Positions";
        var dialA, dialB, dialC, dialD;
        var labelDial = { a : "Motor A", b : "Motor B", c : "Motor C", d : "Motor D" }
        var needleA, needleB, needleC, needleD;

        var frameDials;
        var positionDial = { x : 674, y : 135 }

        /* Ganging motors together */
        var frameMotorGanging, frameMotorGang1, frameMotorGang2;
        var labelMotorGang;
        var positionMotorGang = { x : 970, y : 65 }
        var positionMotorGang1 = { x : 595, y: 225 } 
        var positionMotorGang2 = { x : 595, y: 435 } 
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

        var motorA = {
            port: 'a',
            status : 1,
            speed : 11,
            position : 0,
            gang: 0, // 0 = not ganged with other motors, 1 = joined in gang 1, or 2 = joined in gang 2
        }
        var motorB = {
            port: 'b',
            status : 1,
            speed : 22,
            position : 0,
            gang: 0,
        }
        var motorC = {
            port: 'c',
            status : 1,
            speed : 33,
            position : 0,
            gang: 0
        }
        var motorD = {
            port: 'd',
            status : 1,
            speed : 44,
            position : 0,
            gang: 0
        }
        var gang1 = {
            speed : 55

        }
        var gang2 = {
            speed : 66

        }


        // old motor stuff we can remove in a little bit
        // var motorA = {
        //     status : 3, //0 = unplugged, 1 = plugged-in, 2 = stalled // 3 for initial setting
        //     speed : '', // degrees/second
        //     position : '' //degrees
        // }
        // var motorB = {
        //     status : 3, //0 = unplugged, 1 = plugged-in, 2 = stalled
        //     speed : '', // rpm
        //     position : '' //degrees
        // }
        // var motorC = {
        //     status : 3, //0 = unplugged, 1 = plugged-in, 2 = stalled
        //     speed : '', // rpm
        //     position : '' //degrees
        // }
        // var motorD = {
        //     status : 3, //0 = unplugged, 1 = plugged-in, 2 = stalled
        //     speed : '', // rpm
        //     position : '' //degrees
        // }

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
        var touchCount = 0; //count total presses
        var touch = {
         touchCountDisplay : 0 //display number of total presses
        }
        var frameTouch;
        var positionTouch = { x : 443, y : 135 }
        var labelTouch = "Touch Sensor", labelTouched = "Touched", labelTouchCount = "Total Touches: ";
        var touchIndicator;

        /* IR sensor */
        var frameIR;
        var positionIR = { x : 217, y : 65 }
        var labelIR = "Infrared Sensor", labelIRDist = "Distance: ", labelIRUnits = "cm";
        var IRDist = 0; // THIS IS A PLACEHOLDER FOR NOW!
        var IR = {
            IRDistDisplay : 0
        }

        /* Color sensor */
        var frameColor;
        var positionColor = { x : 217, y : 135 }
        var labelColor = "Color Sensor", labelColorR = "Red: ", labelColorB = "Blue: ", labelColorG = "Green: ", labelColorValue = "RGB: ", labelColorName = "Color: ";
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
        var positionUltrasonic = { x : 379, y : 65 }
        var labelUltrasonic = "Ultrasonic Sensor", labelUltrasonicDist = "Distance: ", labelUltrasonicUnits = "cm";
        var ultrasonicDist = 0; // THIS IS A PLACEHOLDER FOR NOW!
        var ultrasonic = {
            ultrasonicDistDisplay : 0
        }

        /* Battery level sensor */
        var frameBattery;
        var positionBattery = { x : 821, y : 65 }
        var labelBattery = "Battery Level";
        var batteryLevel = 1; //initialize the level at 100% (or, 1);
        var batteryLevelBox, batteryLevelFill, batteryShape;

        /* LCD Screen */
        var frameScreen, LCDScreenBox;
        var positionScreen = { x : 15, y : 123 }
        var labelScreen = "LCD Screen";
        var screenMessage = {
            messageDisplay : "Hello GigaBot!" // this is a placeholder
        }

        //===================================================

        channel.channelData.onValue(function (key, val) {
            console.log("Add:" + key +"->"+JSON.stringify(val) );
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
            console.log("Update:" + key +"->"+JSON.stringify(val));
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
                    statusLightB.animations.play('pluggedIn');
                }
                else if ( val.stalled ) {
                    motorA.status =2;
                    statusLightB.animations.play('stalled');
                } 
                else {
                    motorA.status =0;
                    statusLightB.animations.play('unplugged');
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
                needleD.angle = val.position;
                if( !val.stalled ) {
                    statusLightD.animations.play('pluggedIn');
                } else {
                    motorD.status =2;
                    statusLightD.animations.play('stalled');
                }
            }
        }

        function setTouchSensor( val ) {
            console.log("touchSensor " + JSON.stringify(val));
            if( val.touched ) {
                touchIndicator.animations.play('pressed');
                game.world.remove(touch.touchCountDisplay);
                touchCount++;
                touchCountDisplay = touchCount;
                touch.touchCountDisplay = game.add.text(positionTouch.x+179, positionTouch.y+25, touchCountDisplay, labelStyle3);
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
            ultrasonic.ultrasonicDistDisplay = game.add.text(positionUltrasonic.x+171, positionUltrasonic.y+25, ultrasonicDistDisplay.toFixed(1), labelStyle3);
        }


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
            game.load.image('screenInputButton', 'assets/buttons/gigabot_dashboard_button_lcd_screen_input_2.png', 39, 18);
            game.load.image('bbLogoSm', 'assets/logo1_sm.png', 130, 49);
            game.load.image('robotOrangeSm', 'assets/robot_orange_sm.png', 50, 50);
            game.load.image('dragButton','assets/buttons/gigabot_dashboard_drag_button.png', 25, 17);
            game.load.image('title','assets/gigabot_dashboard_title.png', 50, 400);
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
            titleBox.drawRect(0,0,960,50);

            backgroundBox = game.add.graphics(0,0);
            backgroundBox.beginFill(0x313233,1);
            backgroundBox.lineStyle(1,frameLineColor,1);
            backgroundBox.drawRect(0,50,960,1064);

        /* Title */
            //dashboardName = game.add.text(68, 10, dashboardName, titleStyle);
            dashboardName = game.add.sprite(72,0,'title');
            bbLogo = game.add.sprite(816, 1, 'bbLogoSm');
            botLogo = game.add.sprite(0,0, 'robotOrangeSm');
            poweredBy = game.add.text(722, 19, poweredBy, labelStyle4);

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
            frameMotor.a.drawRect(positionMotorA.x, positionMotorA.y, 280, 200);

            frameMotor.b.lineStyle(1, frameLineColor, 1);
            frameMotor.b.drawRect(positionMotorB.x, positionMotorB.y, 280, 200);

            frameMotor.c.lineStyle(1, frameLineColor, 1);
            frameMotor.c.drawRect(positionMotorC.x, positionMotorC.y, 280, 200);

            frameMotor.d.lineStyle(1, frameLineColor, 1);
            frameMotor.d.drawRect(positionMotorD.x, positionMotorD.y, 280, 200);


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
            frameScreen.drawRect(positionScreen.x, positionScreen.y, 192, 102);


            frameMotorGanging = game.add.graphics(0,0);
            frameMotorGanging.lineStyle(1, frameLineColor, 1);
            frameMotorGanging.drawRect(positionMotorGang.x, positionMotorGang.y, 250, 160);

            frameMotorGang1 = game.add.graphics(0,0);
            frameMotorGang1.lineStyle(1, frameLineColor, 1);
            frameMotorGang1.drawRect(positionMotorGang1.x, positionMotorGang1.y, 350, 200);

            frameMotorGang2 = game.add.graphics(0,0);
            frameMotorGang2.lineStyle(1, frameLineColor, 1);
            frameMotorGang2.drawRect(positionMotorGang2.x, positionMotorGang2.y, 350, 200);

            frameDials = game.add.graphics(0,0);
            frameDials.lineStyle(1, frameLineColor, 1);
            frameDials.drawRect(positionDial.x, positionDial.y, 271, 80);



        /* Labels */
            labelMotorStatus = game.add.text(positionMotorStatus.x+39, positionMotorStatus.y+5, labelMotorStatus, labelStyle3); //label at top of box indicating status of motor ports
            labelA = game.add.text(positionMotorStatus.x+14, positionMotorStatus.y+42, labelMotors.a, labelStyle);
            labelB = game.add.text(positionMotorStatus.x+44, positionMotorStatus.y+42, labelMotors.b, labelStyle);
            labelC = game.add.text(positionMotorStatus.x+74, positionMotorStatus.y+42, labelMotors.c, labelStyle);
            labelD = game.add.text(positionMotorStatus.x+104, positionMotorStatus.y+42, labelMotors.d, labelStyle);

            labelSensorStatus = game.add.text(positionSensorStatus.x+34, positionSensorStatus.y+5, labelSensorStatus, labelStyle3); //label at top of box indicating status of motor ports
            label1 = game.add.text(positionSensorStatus.x+15, positionSensorStatus.y+42, labelSensors.e, labelStyle);
            label2 = game.add.text(positionSensorStatus.x+45, positionSensorStatus.y+42, labelSensors.f, labelStyle);
            label3 = game.add.text(positionSensorStatus.x+75, positionSensorStatus.y+42, labelSensors.g, labelStyle);
            label4 = game.add.text(positionSensorStatus.x+105, positionSensorStatus.y+42, labelSensors.h, labelStyle);

            labelMotor.a = game.add.text(positionMotorA.x+10, positionMotorA.y+6, labelMotor.a, labelStyle2);
            labelMotor.b = game.add.text(positionMotorB.x+10, positionMotorB.y+6, labelMotor.b, labelStyle2);
            labelMotor.c = game.add.text(positionMotorC.x+10, positionMotorC.y+6, labelMotor.c, labelStyle2);
            labelMotor.d = game.add.text(positionMotorD.x+10, positionMotorD.y+6, labelMotor.d, labelStyle2);

            labelTouch = game.add.text(positionTouch.x+10, positionTouch.y+5, labelTouch, labelStyle3);
            labelTouched = game.add.text(positionTouch.x+10, positionTouch.y+27, labelTouched, labelStyle);
            labelTouchCount = game.add.text(positionTouch.x+94, positionTouch.y+27, labelTouchCount, labelStyle); // there is room for 4 characters, so 0 to 9,999. No touching more than that!

            labelIR = game.add.text(positionIR.x+10, positionIR.y+5, labelIR, labelStyle3);
            labelIRDist = game.add.text(positionIR.x+10, positionIR.y+27, labelIRDist, labelStyle);
            labelIRUnits = game.add.text(positionIR.x+118, positionIR.y+27, labelIRUnits, labelStyle);

            labelUltrasonic = game.add.text(positionUltrasonic.x+10, positionUltrasonic.y+5, labelUltrasonic, labelStyle3);
            labelUltrasonicDist = game.add.text(positionUltrasonic.x+10, positionUltrasonic.y+27, labelUltrasonicDist, labelStyle);
            labelUltrasonicUnits = game.add.text(positionUltrasonic.x+118, positionUltrasonic.y+27, labelUltrasonicUnits, labelStyle);

            labelColor = game.add.text(positionColor.x+10, positionColor.y+5, labelColor, labelStyle3);
            labelColorValue = game.add.text(positionColor.x+10, positionColor.y+27, labelColorValue, labelStyle);
            labelColorName = game.add.text(positionColor.x+100, positionColor.y+27, labelColorName, labelStyle);

            labelBattery = game.add.text(positionBattery.x+10, positionBattery.y+5, labelBattery, labelStyle3);
            
            labelScreen = game.add.text(positionScreen.x+10, positionScreen.y+5, labelScreen, labelStyle3);

            /* Ganging motors together */
            labelMotorGang = {
                g1 : game.add.text(positionMotorGang.x+10, positionMotorGang.y+5, "Motor Gang 1", labelStyle3), // gang 1
                g2 : game.add.text(positionMotorGang.x+115, positionMotorGang.y+5, "Motor Gang 2", labelStyle3), // gang 2
                a1 : game.add.text(positionMotorGang1.x+40, positionMotorGang1.y+35, "Motor A", labelStyle), // motor A in gang 1
                a2 : game.add.text(positionMotorGang2.x+40, positionMotorGang2.y+35, "Motor A", labelStyle), //motor A in gang 2
                b1 : game.add.text(positionMotorGang1.x+40, positionMotorGang1.y+70, "Motor B", labelStyle), 
                b2 : game.add.text(positionMotorGang2.x+40, positionMotorGang2.y+70, "Motor B", labelStyle), 
                c1 : game.add.text(positionMotorGang1.x+40, positionMotorGang1.y+105, "Motor C", labelStyle), 
                c2 : game.add.text(positionMotorGang2.x+40, positionMotorGang2.y+105, "Motor C", labelStyle), 
                d1 : game.add.text(positionMotorGang1.x+40, positionMotorGang1.y+140, "Motor D", labelStyle), 
                d2 : game.add.text(positionMotorGang2.x+40, positionMotorGang2.y+140, "Motor D", labelStyle) 
            }

            labelGang1 = game.add.text(positionMotorGang1.x + 10, positionMotorGang1.y + 10, "Motor Gang 1", labelStyle3);
            labelGang2 = game.add.text(positionMotorGang2.x + 10, positionMotorGang2.y + 10, "Motor Gang 2", labelStyle3);




        /* Buttons */
            // Add button for resuming all motors at their current settings, after having paused them
            resumeButton = game.add.button(15, 65, 'resumeButton', actionResumeOnClick, this, 1, 0, 2, 0);
            pauseButton = game.add.button(111, 65, 'pauseButton', actionPauseOnClick, this, 1, 0, 2, 0);
            // Forward button object and reverse button object
            fButton = {
                //a : game.add.button(positionMotorA.x+10, positionMotorA.y+32, 'forwardButton', fButtonSet, this),
                //a : game.add.button(positionMotorA.x+10, positionMotorA.y+32, 'forwardButton', fButtonCallback, this), //fButtonCallack is now on button-click rather than button-release (mod to phaser framework)
                //a : game.add.button(positionMotorA.x+10, positionMotorA.y+32, 'forwardButton', fButtonCallback, "a"),
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

            /* adding forward button events */
            fButton.a.events.onInputDown.add(fButtonDownAction, motorA); // motorA object declared around line 121
            fButton.a.events.onInputUp.add(fButtonUpAction, motorA);
            fButton.b.events.onInputDown.add(fButtonDownAction, motorB); // motorA object declared around line 121
            fButton.b.events.onInputUp.add(fButtonUpAction, motorB);
            fButton.c.events.onInputDown.add(fButtonDownAction, motorC); // motorA object declared around line 121
            fButton.c.events.onInputUp.add(fButtonUpAction, motorC);
            fButton.d.events.onInputDown.add(fButtonDownAction, motorD); // motorA object declared around line 121
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

/*
            fButton.a.events.onInputDown.add(onActionDownForwardA, this); // on click
            function onActionDownForwardA() {
                console.log("onActionDownForwardA"); 
                moveMotor( "a", "f", powerA);
            }
            fButton.a.events.onInputUp.add(onActionUpForwardA, this); // on release
            function onActionUpForwardA() {
                console.log("onActionUpForwardA");
                stopMotor("a"); 
            }*/
/*            rButton.a.events.onInputDown.add(onActionDownReverseA, this); //on click
            function onActionDownReverseA() {
                console.log("onActionDownReverseA"); 
                moveMotor( "a", "r", powerA);
            }
            rButton.a.events.onInputUp.add(onActionUpReverseA, this); //on release
            function onActionUpReverseA() {
                console.log("onActionUpReverseA");
                stopMotor("a"); 
            }*/

            

/*            fButton.b.events.onInputDown.add(onActionDownForwardB, this);
            function onActionDownForwardB() {
                console.log("onActionDownForwardB"); 
                moveMotor( "b", "f", powerB);
            }
            fButton.b.events.onInputUp.add(onActionUpForwardB, this);
            function onActionUpForwardB() {
                console.log("onActionUpForwardB");
                stopMotor("b"); 
            }
            rButton.b.events.onInputDown.add(onActionDownReverseB, this);
            function onActionDownReverseB() {
                console.log("onActionDownReverseB"); 
                moveMotor( "b", "r", powerB);
            }
            rButton.b.events.onInputUp.add(onActionUpReverseB, this);
            function onActionUpReverseB() {
                console.log("onActionUpReverseB");
                stopMotor("b"); 
            }

            

            fButton.c.events.onInputDown.add(onActionDownForwardC, this);
            function onActionDownForwardC() {
                console.log("onActionDownForwardC"); 
                moveMotor( "c", "f", powerC);
            }
            fButton.c.events.onInputUp.add(onActionUpForwardC, this);
            function onActionUpForwardC() {
                console.log("onActionUpForwardC");
                stopMotor("c"); 
            }
            rButton.c.events.onInputDown.add(onActionDownReverseC, this);
            function onActionDownReverseC() {
                console.log("onActionDownReverseC"); 
                moveMotor( "c", "r", powerC);
            }
            rButton.c.events.onInputUp.add(onActionUpReverseC, this);
            function onActionUpReverseC() {
                console.log("onActionUpReverseC");
                stopMotor("c"); 
            }


            
            fButton.d.events.onInputDown.add(onActionDownForwardD, this);
            function onActionDownForwardD() {
                console.log("onActionDownForwardD"); 
                moveMotor( "d", "f", powerD);
            }
            fButton.d.events.onInputUp.add(onActionUpForwardD, this);
            function onActionUpForwardD() {
                console.log("onActionUpForwardD");
                stopMotor("d"); 
            }
            rButton.d.events.onInputDown.add(onActionDownReverseD, this);
            function onActionDownReverseD() {
                console.log("onActionDownReverseD"); 
                moveMotor( "d", "r", powerD);
            }
            rButton.d.events.onInputUp.add(onActionUpReverseD, this);
            function onActionUpReverseD() {
                console.log("onActionUpReverseD");
                stopMotor("d"); 
            }*/


            /* Button States */
            // To change the states of buttons (i.e., their appearance when up, down, over, and out), we can set and update the states using:
            // see Phaser API file 'Button.js' at ll. 586-637



            // buttons for motor gangs:
            fGangButton = {
                g1 : game.add.button(positionMotorGang1.x+105, positionMotorGang1.y+32, 'forwardButton'),
                g2 : game.add.button(positionMotorGang2.x+105, positionMotorGang2.y+32, 'forwardButton')
            }
            rGangButton = {
                g1 : game.add.button(positionMotorGang1.x+105, positionMotorGang1.y+90, 'reverseButton'),
                g2 : game.add.button(positionMotorGang2.x+105, positionMotorGang2.y+90, 'reverseButton')
            }
            minusButtonG1 = game.add.button(positionMotorGang1.x+105, positionMotorGang1.y+148, 'minusButton', actionDecreaseOnClickG1, this, 1, 0, 2, 0);
            plusButtonG1 = game.add.button(positionMotorGang1.x+158, positionMotorGang1.y+148, 'plusButton', actionIncreaseOnClickG1, this, 1, 0, 2, 0);
            minusButtonG2 = game.add.button(positionMotorGang2.x+105, positionMotorGang2.y+148, 'minusButton', actionDecreaseOnClickG2, this, 1, 0, 2, 0);
            plusButtonG2 = game.add.button(positionMotorGang2.x+158, positionMotorGang2.y+148, 'plusButton', actionIncreaseOnClickG2, this, 1, 0, 2, 0);

            /* Move entire motor ganging box using a button for clicking and dragging */
            dragButton = {
                gang : game.add.button(positionMotorGang.x+221, positionMotorGang.y+5, 'dragButton', actionDragGang, this),
                g1 : game.add.button(positionMotorGang1.x+321, positionMotorGang1.y+5, 'dragButton', actionDragG1, this),
                g2 : game.add.button(positionMotorGang2.x+321, positionMotorGang2.y+5, 'dragButton', actionDragG2, this)
            }
            function actionDragGang () {
                // check that it's inside world bounds, so we won't lose the box!
                if (game.input.x + 25 < game.world.width) { //right
                    if (game.input.x > 220) { //left
                        if (game.input.y + 155 < game.world.height) { //bottom
                            if (game.input.y > 5) { // top
                                dragButton.gang.x = game.input.x;
                                dragButton.gang.y = game.input.y;
                            } else {
                                dragButton.gang.x = game.input.x;
                                dragButton.gang.y = 5;
                            }
                        } else {
                            dragButton.gang.x = game.input.x;
                            dragButton.gang.y = game.world.height-155;
                        } 
                    } else {
                        dragButton.gang.x = 220;
                        dragButton.gang.y = game.input.y;
                    }
                } else {
                    dragButton.gang.x = game.world.width-25;
                    dragButton.gang.y = game.input.y;
                }
                    
                // positionMotorGang.x = dragButton.gang.x - 200;
                // positionMotorGang.y = dragButton.y;
                /* update frame position */
                frameMotorGanging.destroy();
                frameMotorGanging = game.add.graphics(0,0);
                frameMotorGanging.lineStyle(1, frameLineColor, 1);
                frameMotorGanging.drawRect(dragButton.gang.x-220, dragButton.gang.y-5, 250, 160);
                /* update checkbox positions */
                checkbox.a1.x = dragButton.gang.x-211, checkbox.a1.y = dragButton.gang.y+27;
                checkbox.a2.x = dragButton.gang.x-105, checkbox.a2.y = dragButton.gang.y+27;
                checkbox.b1.x = dragButton.gang.x-211, checkbox.b1.y = dragButton.gang.y+57;
                checkbox.b2.x = dragButton.gang.x-106, checkbox.b2.y = dragButton.gang.y+57;
                checkbox.c1.x = dragButton.gang.x-211, checkbox.c1.y = dragButton.gang.y+87;
                checkbox.c2.x = dragButton.gang.x-106, checkbox.c2.y = dragButton.gang.y+87;
                checkbox.d1.x = dragButton.gang.x-211, checkbox.d1.y = dragButton.gang.y+117;
                checkbox.d2.x = dragButton.gang.x-106, checkbox.d2.y = dragButton.gang.y+117;
                /* update label positions */
                labelMotorGang.a1.x = dragButton.gang.x-181, labelMotorGang.a1.y = dragButton.gang.y+30;
                labelMotorGang.a2.x = dragButton.gang.x-76, labelMotorGang.a2.y = dragButton.gang.y+30;
                labelMotorGang.b1.x = dragButton.gang.x-181, labelMotorGang.b1.y = dragButton.gang.y+60;
                labelMotorGang.b2.x = dragButton.gang.x-76, labelMotorGang.b2.y = dragButton.gang.y+60;
                labelMotorGang.c1.x = dragButton.gang.x-181, labelMotorGang.c1.y = dragButton.gang.y+90;
                labelMotorGang.c2.x = dragButton.gang.x-76, labelMotorGang.c2.y = dragButton.gang.y+90;
                labelMotorGang.d1.x = dragButton.gang.x-181, labelMotorGang.d1.y = dragButton.gang.y+120;
                labelMotorGang.d2.x = dragButton.gang.x-76, labelMotorGang.d2.y = dragButton.gang.y+120;
                labelMotorGang.g1.x = dragButton.gang.x-211, labelMotorGang.g1.y = dragButton.gang.y;
                labelMotorGang.g2.x = dragButton.gang.x-106, labelMotorGang.g2.y = dragButton.gang.y;
            } // end actionDragGang


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
            checkboxStatus = { a1 : 0, a2 : 0, b1 : 3, b2 : 0, c1 : 0, c2 : 0, d1 : 0, d2 : 0 } // all initially unchecked (motors not members of a motor gang)
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

            function actionCheckboxA1 () {
                if ( checkboxStatus.a1 === 0 ) { //the checkbox is UNCHECKED
                    checkboxStatus.a1 = 1; // so check it now
                    checkbox.a1.setFrames(1,1,1,0); // over frame and out frame should now both show the box checked
                    motorA.gang = 1; // join motor a with gang 1
                    if ( checkboxStatus.a2 === 1 ) { // both checkboxes for a single motor cannot be checked, so if the other motor is checked
                        checkboxStatus.a2 = 0; // because the motor was checked for the other gang, we must uncheck it from that gang now
                        checkbox.a2.setFrames(2,0,1,0) // show other box as unchecked
                    }
                }
                else { // the checkbox is CHECKED
                    checkboxStatus.a1 = 0; // so uncheck it now
                    checkbox.a1.setFrames(2,0,1,0); // over frame and out frame should now both show the box unchecked
                    motorA.gang = 0; // ungang motor a
                }
            }
            function actionCheckboxA2 () {
                if ( checkboxStatus.a2 === 0 ) { //the checkbox is UNCHECKED
                    checkboxStatus.a2 = 1; // so check it now
                    checkbox.a2.setFrames(1,1,1,0); // over frame and out frame should now both show the box checked
                    motorA.gang = 2; // join motor a with gang 2
                    if ( checkboxStatus.a1 === 1 ) { // both checkboxes for a single motor cannot be checked, so if the other motor is checked
                        checkboxStatus.a1 = 0; // because the motor was checked for the other gang, we must uncheck it from that gang now
                        checkbox.a1.setFrames(2,0,1,0) // show other box as unchecked
                    }
                }
                else { // the checkbox is CHECKED
                    checkboxStatus.a2 = 0; // so uncheck it now
                    checkbox.a2.setFrames(2,0,1,0); // over frame and out frame should now both show the box unchecked
                    motorA.gang = 0; // ungang motor a
                }
            }
            function actionCheckboxB1 () {
                if ( checkboxStatus.b1 === 0 ) {
                    checkboxStatus.b1 = 1; 
                    checkbox.b1.setFrames(1,1,1,0);
                    motorB.gang = 1;
                    if ( checkboxStatus.b2 === 1 ) { 
                        checkboxStatus.b2 = 0; 
                        checkbox.b2.setFrames(2,0,1,0);
                    }
                } else {
                    checkboxStatus.b1 = 0; 
                    checkbox.b1.setFrames(0,0,1,0);
                    motorB.gang = 0;
                }
            }
            function actionCheckboxB2 () {
                if ( checkboxStatus.b2 === 0 ) { 
                    checkboxStatus.b2 = 1; 
                    checkbox.b2.setFrames(1,1,1,0);
                    motorB.gang = 2;
                    if ( checkboxStatus.b1 === 1 ) {
                        checkboxStatus.b1 = 0; 
                        checkbox.b1.setFrames(2,0,1,0);
                    } 
                } else {
                    checkboxStatus.b2 = 0;
                    checkbox.b2.setFrames(0,0,1,0); 
                    motorB.gang = 0;
                }
            }
            function actionCheckboxC1 () {
                if ( checkboxStatus.c1 === 0 ) {
                    checkboxStatus.c1 = 1; 
                    checkbox.c1.setFrames(1,1,1,0);
                    motorC.gang = 1;
                    if ( checkboxStatus.c2 === 1 ) { 
                        checkboxStatus.c2 = 0; 
                        checkbox.c2.setFrames(2,0,1,0);
                    }
                } else {
                    checkboxStatus.c1 = 0; 
                    checkbox.c1.setFrames(0,0,1,0);
                    motorC.gang = 0;
                }
            }
            function actionCheckboxC2 () {
                if ( checkboxStatus.c2 === 0 ) { 
                    checkboxStatus.c2 = 1; 
                    checkbox.c2.setFrames(1,1,1,0);
                    motorC.gang = 2;
                    if ( checkboxStatus.c1 === 1 ) { 
                        checkboxStatus.c1 = 0; 
                        checkbox.c1.setFrames(2,0,1,0);
                    } 
                } else {
                    checkboxStatus.c2 = 0;
                    checkbox.c2.setFrames(0,0,1,0); 
                    motorC.gang = 0;
                }
            }
            function actionCheckboxD1 () {
                if ( checkboxStatus.d1 === 0 ) {
                    checkboxStatus.d1 = 1; 
                    checkbox.d1.setFrames(1,1,1,0);
                    motorD.gang = 1;
                    if ( checkboxStatus.d2 === 1 ) { 
                        checkboxStatus.d2 = 0; 
                        checkbox.d2.setFrames(2,0,1,0);
                    } 
                } else { 
                    checkboxStatus.d1 = 0; 
                    checkbox.d1.setFrames(0,0,1,0); 
                    motorD.gang = 0;
                }
            }
            function actionCheckboxD2 () {
                if ( checkboxStatus.d2 === 0 ) { 
                    checkboxStatus.d2 = 1; 
                    checkbox.d2.setFrames(1,1,1,0);
                    motorD.gang = 2;
                    if ( checkboxStatus.d1 === 1 ) { 
                        checkboxStatus.d1 = 0; 
                        checkbox.d1.setFrames(2,0,1,0);
                    }
                } else { 
                    checkboxStatus.d2 = 0; 
                    checkbox.d2.setFrames(0,0,1,0); 
                    motorD.gang = 0;
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


            /* LCD Screen Message */
            screenInputButton = game.add.button(positionScreen.x+110, positionScreen.y+5, 'screenInputButton', actionInputOnClick);


        /* Click and drag motor speed setting & display */
            sliderTrackA = game.add.graphics(0,0);
            sliderTrackA.beginFill(frameLineColor, 1);
            sliderTrackA.drawRect(positionMotorA.x+153, positionMotorA.y+14, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarA = game.add.button(positionMotorA.x+123, positionMotorA.y+168, 'sliderBar');
            sliderBarA.inputEnabled=true;
            sliderBarA.input.enableDrag();
            sliderBarA.input.allowHorizontalDrag=false;
            sliderBarA.events.onInputUp.add(actionDragOnClickA);

            sliderTrackB = game.add.graphics(0,0);
            sliderTrackB.beginFill(frameLineColor, 1);
            sliderTrackB.drawRect(positionMotorB.x+153, positionMotorB.y+14, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarB = game.add.button(positionMotorB.x+123, positionMotorB.y+168, 'sliderBar');
            sliderBarB.inputEnabled=true;
            sliderBarB.input.enableDrag();
            sliderBarB.input.allowHorizontalDrag=false;
            sliderBarB.events.onInputUp.add(actionDragOnClickB);
                        
            sliderTrackC = game.add.graphics(0,0);
            sliderTrackC.beginFill(frameLineColor, 1);
            sliderTrackC.drawRect(positionMotorC.x+153, positionMotorC.y+14, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarC = game.add.button(positionMotorC.x+123, positionMotorC.y+168, 'sliderBar');
            sliderBarC.inputEnabled=true;
            sliderBarC.input.enableDrag();
            sliderBarC.input.allowHorizontalDrag=false;
            sliderBarC.events.onInputUp.add(actionDragOnClickC);

            sliderTrackD = game.add.graphics(0,0);
            sliderTrackD.beginFill(frameLineColor, 1);
            sliderTrackD.drawRect(positionMotorD.x+153, positionMotorD.y+14, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarD = game.add.button(positionMotorD.x+123, positionMotorD.y+168, 'sliderBar');
            sliderBarD.inputEnabled=true;
            sliderBarD.input.enableDrag();
            sliderBarD.input.allowHorizontalDrag=false;
            sliderBarD.events.onInputUp.add(actionDragOnClickD);

            sliderTrackG1 = game.add.graphics(0,0);
            sliderTrackG1.beginFill(frameLineColor, 1);
            sliderTrackG1.drawRect(positionMotorGang1.x+253, positionMotorGang1.y+14, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarG1 = game.add.button(positionMotorGang1.x+223, positionMotorGang1.y+168, 'sliderBar2', actionDragOnClickG1);

            sliderTrackG2 = game.add.graphics(0,0);
            sliderTrackG2.beginFill(frameLineColor, 1);
            sliderTrackG2.drawRect(positionMotorGang2.x+253, positionMotorGang2.y+14, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarG2 = game.add.button(positionMotorGang2.x+223, positionMotorGang2.y+168, 'sliderBar2', actionDragOnClickG2);

            // Add some labels to the sliders
            sliderLabel = {
                a : game.add.text(positionMotorA.x+138, positionMotorA.y+182, "Power", labelStyle),
                b : game.add.text(positionMotorB.x+138, positionMotorB.y+182, "Power", labelStyle),
                c : game.add.text(positionMotorC.x+138, positionMotorC.y+182, "Power", labelStyle),
                d : game.add.text(positionMotorD.x+138, positionMotorD.y+182, "Power", labelStyle),
                g1 : game.add.text(positionMotorGang1.x+219, positionMotorGang1.y+182, "Speed (\xB0/sec)" , labelStyle),
                g2 : game.add.text(positionMotorGang2.x+219, positionMotorGang2.y+182, "Speed (\xB0/sec)", labelStyle)
            }
            for (var i = 0; i <= 10; i++) {
                var powerLabel = powerRange[i] + " %";
             
                var powerLabelY = { 
                    a : positionMotorA.y+167 - 16 * i,
                    b : positionMotorB.y+167 - 16 * i,
                    c : positionMotorC.y+167 - 16 * i,
                    d : positionMotorD.y+167 - 16 * i,
                }

                var powerLabelA = game.add.text(positionMotorA.x+191, powerLabelY.a, powerLabel, labelStyle)
                var powerLabelB = game.add.text(positionMotorB.x+191, powerLabelY.b, powerLabel, labelStyle)
                var powerLabelC = game.add.text(positionMotorC.x+191, powerLabelY.c, powerLabel, labelStyle)
                var powerLabelD = game.add.text(positionMotorD.x+191, powerLabelY.d, powerLabel, labelStyle);

            }

            for ( var i = 0; i <= 7; i++) {
                var speedLabel = speedRange[i] + ""; //this makes it a string, so 0 appears at bottom
                var speedLabelG1Y = positionMotorGang1.y + 167 - 22 * i; //for gang 1
                var speedLabelG1 = game.add.text(positionMotorGang1.x+291, speedLabelG1Y, speedLabel, labelStyle)
            }
            for ( var i = 0; i <= 7; i++) {
                var speedLabel = speedRange[i] + "";
                var speedLabelG2Y = positionMotorGang2.y + 167 - 22 * i; //for gang 2
                var speedLabelG2 = game.add.text(positionMotorGang2.x+291, speedLabelG2Y, speedLabel, labelStyle)
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

            labelRotation = game.add.text(positionDial.x+10, positionDial.y+5, labelRotation, labelStyle3);
            labelDial.a = game.add.text(positionDial.x+32, positionDial.y+47, 'A', labelStyle5);
            labelDial.b = game.add.text(positionDial.x+97, positionDial.y+47, 'B', labelStyle5);
            labelDial.c = game.add.text(positionDial.x+162, positionDial.y+47, 'C', labelStyle5);
            labelDial.d = game.add.text(positionDial.x+227, positionDial.y+47, 'D', labelStyle5);

            needleA = game.add.sprite(positionDial.x+38, positionDial.y+49, 'needle');
            needleA.anchor.setTo(0.48, 0.93);
            needleB = game.add.sprite(positionDial.x+103, positionDial.y+49, 'needle');
            needleB.anchor.setTo(0.48, 0.93);
            needleC = game.add.sprite(positionDial.x+168, positionDial.y+49, 'needle');
            needleC.anchor.setTo(0.48, 0.93);
            needleD = game.add.sprite(positionDial.x+233, positionDial.y+49, 'needle');
            needleD.anchor.setTo(0.48, 0.93);
        

            //labelDial.a = game.add.text(positionDial.x+17, positionDial.y+75, labelDial.a, labelStyle);
            //labelDial.b = game.add.text(positionDial.x+82, positionDial.y+75, labelDial.b, labelStyle);
            //labelDial.c = game.add.text(positionDial.x+147, positionDial.y+75, labelDial.c, labelStyle);
            //labelDial.d = game.add.text(positionDial.x+212, positionDial.y+75, labelDial.d, labelStyle);

            //labelDial.a = game.add.text(positionMotorA.x+284, positionMotorA.y+182, "Rotation", labelStyle);
            //labelDial.b = game.add.text(positionMotorB.x+284, positionMotorB.y+182, "Rotation", labelStyle);
            //labelDial.c = game.add.text(positionMotorC.x+284, positionMotorC.y+182, "Rotation", labelStyle);
            //labelDial.d = game.add.text(positionMotorD.x+284, positionMotorD.y+182, "Rotation", labelStyle);
        
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
            LCDScreenBox.beginFill(0xD8D8D8, 1);
            LCDScreenBox.lineStyle(1.5, frameLineColor, 1);
            LCDScreenBox.drawRect(positionScreen.x+10, positionScreen.y+28, 138, 24);

        } // end create 


    /* Motor communication with Robot via messages to Big Bang channel */
        function moveMotor( motor, direction, speed ) {
            var data = {};
            data.type = "motorStart";
            data.port = motor;
            data.dir = direction;
            data.speed = speed; // this will work when we swap out 'speed' (0 to 700 deg/s scale) in place of 'power' (0 to 1 scale)
            //data.speed = 200; // this is just a placeholder! (200 degrees/second)
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
            game.world.remove(screenMessage.messageDisplay);
            messageDisplay = prompt("What would you like to display on the screen?");
            screenMessage.messageDisplay = game.add.text(positionScreen.x+13, positionScreen.y+33, messageDisplay, messageStyle);
        }

        function actionResumeOnClick () {
            // resume all motors at their current settings
            dashboardStatus = 1;
        }
        function actionPauseOnClick () {
            // stop all motors at their current settings
            dashboardStatus = 0;
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

            sliderBarA.y = positionMotorA.y+168 - Math.round( (positionMotorA.y+168 - game.input.y) / 16 ) * 16; // round to nearest 10% power
            if (sliderBarA.y < positionMotorA.y+8) { //set max power boundary limit
                sliderBarA.y = positionMotorA.y+8;
            } else if (sliderBarA.y > positionMotorA.y+168) { //set min power boundary limit
                sliderBarA.y = positionMotorA.y+168;

            }
            powerA = (0.10 * (positionMotorA.y+168 - sliderBarA.y) / 16);
            console.log(powerA.toFixed(2)); //this makes powerA a string with 2 decimal places
        }
        function actionDragOnClickB() {
            //we're sliding between y = 356px (0%) and y = 196px (100%). These y coordinates are at the top of the slider bar, so the center goes from 362 to 202
            sliderBarB.y = positionMotorB.y+168 - Math.round( (positionMotorB.y+168 - game.input.y) / 16 ) * 16; // round to nearest 10% power
            if (sliderBarB.y < positionMotorB.y+8) { //set max power boundary limit
                sliderBarB.y = positionMotorB.y+8;
            } else if (sliderBarB.y > positionMotorB.y+168) { //set min power boundary limit
                sliderBarB.y = positionMotorB.y+168;
            }
            powerB = (0.10 * (positionMotorB.y+168 - sliderBarB.y) / 16);
            console.log(powerB.toFixed(2));
        }
        function actionDragOnClickC() {
            //we're sliding between y = 566px (0%) and y = 406px (100%). These y coordinates are at the top of the slider bar, so the center goes from 562 to 412
            sliderBarC.y = positionMotorC.y+168 - Math.round( (positionMotorC.y+168 - game.input.y) / 16 ) * 16; // round to nearest 10% power
            if (sliderBarC.y < positionMotorC.y+8) { //set max power boundary limit
                sliderBarC.y = positionMotorC.y+8;
            } else if (sliderBarC.y > positionMotorC.y+168) { //set min power boundary limit
                sliderBarC.y = positionMotorC.y+168;
            }
            powerC = (0.10 * (positionMotorC.y+168 - sliderBarC.y) / 16);
            console.log(powerC.toFixed(2));
        }
        function actionDragOnClickD() {
            //we're sliding between y = 566px (0%) and y = 406px (100%). These y coordinates are at the top of the slider bar, so the center goes from 562 to 412
            sliderBarD.y = positionMotorD.y+168 - Math.round( (positionMotorD.y+168 - game.input.y) / 16 ) * 16; // round to nearest 10% power
            if (sliderBarD.y < positionMotorD.y+8) { //set min power boundary limit
                sliderBarD.y = positionMotorD.y+8;
            } else if (sliderBarD.y > positionMotorD.y+168) { //set max power boundary limit
                sliderBarD.y = positionMotorD.y+168;
            }
            powerD = (0.10 * (positionMotorD.y+168 - sliderBarD.y) / 16);
            console.log(powerD.toFixed(2));
        }


        // WE SHOULD HOOK THESE UP ONCE WE'RE DONE WITH THE MOTOR ACTIONS THEMSELVES
        function actionDecreaseOnClickG1() {
            console.log("not hooked up yet");
            //
        }
        function actionIncreaseOnClickG1() {
            console.log("not hooked up yet");
            //
        }
        function actionDecreaseOnClickG2() {
            console.log("not hooked up yet");
            //
        }  
        function actionIncreaseOnClickG2() {
            console.log("not hooked up yet");
            //
        }
        function actionDragOnClickG1() {
            console.log("not hooked up yet");
            //
        }
        function actionDragOnClickG2() {
            console.log("not hooked up yet");
            //
        }
        function actionDragG1() {
            console.log("not hooked up yet");
            //
        }
        function actionDragG2() {
            console.log("not hooked up yet");
            //
        }


    //==============================================================================================================================
        function update() {
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

            if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                needleA.angle = needleA.angle + 10;
                needleB.angle = needleB.angle + 10;
                needleC.angle = needleC.angle + 10;
                needleD.angle = needleD.angle + 10;
            }

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
            //     if (powerA > 0) {
            //         if (directionA == 1) { // i.e. direction is forward
            //             needleA.angle += multiplier * powerA;
            //         } else {
            //             needleA.angle -= multiplier * powerA;
            //         }
            //     }
            //     if (powerB > 0) {
            //         if (directionB == 1) {
            //             needleB.angle += multiplier * powerB;
            //         } else {
            //             needleB.angle -= multiplier * powerB;
            //         }
            //     }
            //     if (powerC > 0) {
            //         if (directionC == 1) {
            //             needleC.angle += multiplier * powerC;
            //         } else {
            //             needleC.angle -= multiplier * powerC;
            //         }
            //     }
            //     if (powerD > 0) {
            //         if (directionD == 1) {
            //             needleD.angle += multiplier * powerD;
            //         } else {
            //             needleD.angle -= multiplier * powerD;
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

            // //=======
            // // WE MIGHT WANT TO STRUCTURE THIS LOGIC A LITTLE MORE NEATLY, BUT IT'LL DEPEND ON THE CONTENT OF THE MESSAGES, AND OF COURSE WONT TAKE KEYBOARD INPUTS
            // if (game.input.keyboard.isDown(Phaser.Keyboard.Y)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "Yellow"
            //     color.colorNameDisplay = game.add.text(positionColor.x+160, positionColor.y+5, colorNameDisplay, labelStyle3); //(colorR, colorG, colorB));
            // } else if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "White"
            //     color.colorNameDisplay = game.add.text(positionColor.x+160, positionColor.y+5, colorNameDisplay, labelStyle3);
            // } else if (game.input.keyboard.isDown(Phaser.Keyboard.B)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "Black"
            //     color.colorNameDisplay = game.add.text(positionColor.x+160, positionColor.y+5, colorNameDisplay, labelStyle3);
            // } else if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "Blue"
            //     color.colorNameDisplay = game.add.text(positionColor.x+160, positionColor.y+5, colorNameDisplay, labelStyle3);
            // } else if (game.input.keyboard.isDown(Phaser.Keyboard.R)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "Red"
            //     color.colorNameDisplay = game.add.text(positionColor.x+160, positionColor.y+5, colorNameDisplay, labelStyle3);
            // } else if (game.input.keyboard.isDown(Phaser.Keyboard.G)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "Green"
            //     color.colorNameDisplay = game.add.text(positionColor.x+160, positionColor.y+5, colorNameDisplay, labelStyle3);
            // } else if (game.input.keyboard.isDown(Phaser.Keyboard.O)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "Orange"
            //     color.colorNameDisplay = game.add.text(positionColor.x+160, positionColor.y+5, colorNameDisplay, labelStyle3);
            // } else if (game.input.keyboard.isDown(Phaser.Keyboard.P)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "Purple"
            //     color.colorNameDisplay = game.add.text(positionColor.x+160, positionColor.y+5, colorNameDisplay, labelStyle3);
            // }



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

