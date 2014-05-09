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
        //var titleStyle = { font: "32px Lucida Console, Arial",fill: "#F8F8F8"}
        var titleStyle = { font: "32px Lucida Console, Arial",fill: "#282828"}
        var labelStyle = { font: "12px Arial", fill: "#000000" }
        var labelStyle2 = { font: "20px Arial", fill: "#000000" }        
        var labelStyle3 = { font: "16px Arial", fill: "#000000"}
        var labelStyle4 = { font: "14px Arial", fill: "#808080" }        
        var frameLineColor = 0x282828;

        var backgound, backgroundBox;
        var frameMotorPorts, labelMotorPorts = "Motors";
        var frameSensorPorts, labelSensorPorts = "Sensors";
        var frameMotor;
        var frameMotorPos = {
            x : 20, // x-coordinate of upper left motor frame
            y : 188 // y-coordinate of upper left motor frame
        }

        var frameMotorGanging;
        
        var labelMotors = ["A","B","C","D"];
        var labelSensors = ["1","2","3","4"];
        var labelMotorA = "Motor A", labelMotorB = "Motor B", labelMotorC = "Motor C", labelMotorD = "Motor D";

        var statusMotorA, statusMotorB, statusMotorC, statusMotorD, statusSensor1,statusSensor2, statusSensor3, statusSensor4;
        var statusLightA, statusLightB, statusLightC, statusLightD, statusLight1, statusLight2, statusLight3, statusLight4;

        var dashboardStatus = 1; // 1 = 'running/resumed', 0 = 'stopped/paused'
        var resumeButton, pauseButton;

        var fButtonPos = {
            x : 30, // x-coordinate of upper left forward button
            y : 220 // y-coordinate of upper left forward button
        }
        var fButton;
        var rButtonPos = {
            x : 30, // x-coordinate of upper left reverse button
            y : 278 // y-coordinate of upper left reverse button
        }
        var rButton;


        /* Ganging motors together */
        var labelMotorGang;
        var motorGangPos = {
            x : 850,
            y : 65
        } 
        var checkbox;
        var checkboxStatus;

        var dragButton;

        var directionA = 1, directionB = 1, directionC = 1, directionD = 1; // forward = 1, reverse = -1

        var sliderBarA, sliderBarB, sliderBarC, sliderBarD;
        var sliderTrackA, sliderTrackB, sliderTrackC, sliderTrackD;
        var powerA = 100, powerB = 0, powerC = 0, powerD = 0;
        var minusButtonA, minusButtonB, minusButtonC, minusButtonD;
        var plusButtonA, plusButtonB, plusButtonC, plusButtonD;
        var powerRange = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

        var dialA, dialB, dialC, dialD;
        var needleA, needleB, needleC, needleD;



        var speed;

        // WE WANT TO STOP USING POWER (0-1 SCALE) AND START USING SPEED (0-700 SCALE, IN UNITS OF DEG/SEC)
        
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
        }
        var motorB = {
            port: 'b',
            status : 1,
            speed : 22,
            position : '',
        }
        var motorC = {
            port: 'c',
            status : 1,
            speed : 33,
            position : '',
        }
        var motorD = {
            port: 'd',
            status : 1,
            speed : 44,
            position : 0,
        }


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
                touch.touchCountDisplay = game.add.text(410, 155, touchCountDisplay, labelStyle3);
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
                    batteryLevelFill.drawRect(310, 92, Math.round(batteryLevel*100), 16);
                }
            }
            else if (batteryLevel <= 1.01) { //upper boundary limit, with a little safety net for inaccuracy/error
                if(batteryLevel > 0.1) { //lower boundary limit
                    batteryLevelFill.destroy();
                    batteryLevelFill = game.add.graphics(0,0);
                    batteryLevelFill.beginFill(0x808080, 1); // make fill grey
                    batteryLevelFill.drawRect(310, 92, Math.round(batteryLevel*100), 16);
                }
            }
        }

        function setUltrasonicSensor( val ) {
            ultrasonicDist = val.distance;
            game.world.remove(ultrasonic.ultrasonicDistDisplay);
            ultrasonicDistDisplay = ultrasonicDist;
            ultrasonic.ultrasonicDistDisplay = game.add.text(722, 155, ultrasonicDistDisplay.toFixed(1), labelStyle3);
        }


    //==============================================================================================================================
        function preload() {
            game.load.spritesheet('statusLight', 'assets/gigabot_dashboard_status_lights_spritesheet.png', 12, 12);
            game.load.spritesheet('resumeButton','assets/buttons/gigabot_dashboard_button_resume_spritesheet.png', 97, 49);
            game.load.spritesheet('pauseButton','assets/buttons/gigabot_dashboard_button_pause_spritesheet.png', 97, 49);
            game.load.spritesheet('forwardButton','assets/buttons/gigabot_dashboard_button_forward_spritesheet.png', 97, 49);
            game.load.spritesheet('reverseButton','assets/buttons/gigabot_dashboard_button_reverse_spritesheet.png', 97, 49);
            game.load.spritesheet('checkbox','assets/buttons/gigabot_dashboard_checkbox_spritesheet.png', 21, 21);
            game.load.spritesheet('minusButton','assets/buttons/gigabot_dashboard_button_minus_spritesheet.png', 44, 44);
            game.load.spritesheet('plusButton','assets/buttons/gigabot_dashboard_button_plus_spritesheet.png', 44, 44);
            game.load.spritesheet('touchIndicator','assets/gigabot_dashboard_touch_sensor_spritesheet.png', 21, 21);
            game.load.image('sliderBar','assets/gigabot_dashboard_slider_bar.png', 65, 13);
            game.load.image('dialNeedle','assets/gigabot_dashboard_dial_needle.png', 5, 80);
            game.load.image('screenInputButton', 'assets/buttons/gigabot_dashboard_button_lcd_screen_input_2.png', 39, 18);
            game.load.image('bbLogoSm', 'assets/logo1_sm.png', 130, 49);
            game.load.image('robotOrangeSm', 'assets/robot_orange_sm.png', 50, 50);
            game.load.image('dragButton','assets/buttons/gigabot_dashboard_drag_button.png', 25, 17);
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
            backgroundBox.lineStyle(1,frameLineColor,1);
            backgroundBox.drawRect(0,0,960,1064);

        /* Title */
            dashboardName = game.add.text(68, 10, dashboardName, titleStyle);
            bbLogo = game.add.sprite(701, 1, 'bbLogoSm');
            botLogo = game.add.sprite(0,0, 'robotOrangeSm');
            poweredBy = game.add.text(606, 19, poweredBy, labelStyle4);

        /* Frames */
            frameMotorPorts = game.add.graphics(0,0);
            frameMotorPorts.lineStyle(1, frameLineColor, 1);
            frameMotorPorts.drawRect(20, 60, 130, 60);

            frameSensorPorts = game.add.graphics(0,0);
            frameSensorPorts.lineStyle(1, frameLineColor, 1);
            frameSensorPorts.drawRect(160, 60, 130, 60);

            frameMotor = {
                a : game.add.graphics(0,0),
                b : game.add.graphics(0,0),
                c : game.add.graphics(0,0),
                d : game.add.graphics(0,0),
            }

            frameMotor.a.lineStyle(1, frameLineColor, 1);
            frameMotor.a.drawRect(frameMotorPos.x, frameMotorPos.y, 400, 200);

            frameMotor.b.lineStyle(1, frameLineColor, 1);
            frameMotor.b.drawRect(frameMotorPos.x+410, frameMotorPos.y, 400, 200);

            frameMotor.c.lineStyle(1, frameLineColor, 1);
            frameMotor.c.drawRect(frameMotorPos.x, frameMotorPos.y+210, 400, 200);

            frameMotor.d.lineStyle(1, frameLineColor, 1);
            frameMotor.d.drawRect(frameMotorPos.x+410, frameMotorPos.y+210, 400, 200);


            frameTouch = game.add.graphics(0,0);
            frameTouch.lineStyle(1, frameLineColor, 1);
            frameTouch.drawRect(231, 130, 221, 48);

            frameIR = game.add.graphics(0,0);
            frameIR.lineStyle(1, frameLineColor, 1);
            frameIR.drawRect(462, 130, 179, 48);

            frameUltrasonic = game.add.graphics(0,0);
            frameUltrasonic.lineStyle(1, frameLineColor, 1);
            frameUltrasonic.drawRect(651, 130, 179, 48);

            frameColor = game.add.graphics(0,0);
            frameColor.lineStyle(1, frameLineColor, 1);
            frameColor.drawRect(430, 60, 232, 60);

            frameBattery = game.add.graphics(0,0);
            frameBattery.lineStyle(1, frameLineColor, 1);
            frameBattery.drawRect(300, 60, 120, 60);

            frameScreen = game.add.graphics(0,0);
            frameColor.lineStyle(1, frameLineColor, 1);
            frameColor.drawRect(672, 60, 158, 60);


            frameMotorGanging = game.add.graphics(0,0);
            frameMotorGanging.lineStyle(1, frameLineColor, 1);
            frameMotorGanging.drawRect(840, 60, 240, 160);



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

            /* Ganging motors together */
            labelMotorGang = {
                g1 : game.add.text(motorGangPos.x, motorGangPos.y, "Motor Gang 1", labelStyle3), // gang 1
                g2 : game.add.text(motorGangPos.x+100, motorGangPos.y, "Motor Gang 2", labelStyle3), // gang 2
                a1 : game.add.text(motorGangPos.x+30, motorGangPos.y+30, "Motor A", labelStyle), // motor A in gang 1
                a2 : game.add.text(motorGangPos.x+130, motorGangPos.y+30, "Motor A", labelStyle), //motor A in gang 2
                b1 : game.add.text(motorGangPos.x+30, motorGangPos.y+60, "Motor B", labelStyle), 
                b2 : game.add.text(motorGangPos.x+130, motorGangPos.y+60, "Motor B", labelStyle), 
                c1 : game.add.text(motorGangPos.x+30, motorGangPos.y+90, "Motor C", labelStyle), 
                c2 : game.add.text(motorGangPos.x+130, motorGangPos.y+90, "Motor C", labelStyle), 
                d1 : game.add.text(motorGangPos.x+30, motorGangPos.y+120, "Motor D", labelStyle), 
                d2 : game.add.text(motorGangPos.x+130, motorGangPos.y+120, "Motor D", labelStyle) 
            }




        /* Buttons */
            // Add button for resuming all motors at their current settings, after having paused them
            resumeButton = game.add.button(20, 130, 'resumeButton', actionResumeOnClick, this, 1, 0, 2, 0);
            pauseButton = game.add.button(125, 130, 'pauseButton', actionPauseOnClick, this, 1, 0, 2, 0);
            // Forward button object and reverse button object
            fButton = {
                //a : game.add.button(fButtonPos.x, fButtonPos.y, 'forwardButton', fButtonSet, this),
                //a : game.add.button(fButtonPos.x, fButtonPos.y, 'forwardButton', fButtonCallback, this), //fButtonCallack is now on button-click rather than button-release (mod to phaser framework)
                //a : game.add.button(fButtonPos.x, fButtonPos.y, 'forwardButton', fButtonCallback, "a"),
                a : game.add.button(fButtonPos.x, fButtonPos.y, 'forwardButton'),
                b : game.add.button(fButtonPos.x+410, fButtonPos.y, 'forwardButton'),
                c : game.add.button(fButtonPos.x, fButtonPos.y+210, 'forwardButton'),
                d : game.add.button(fButtonPos.x+410, fButtonPos.y+210, 'forwardButton')
            }
            rButton = {
                a : game.add.button(rButtonPos.x, rButtonPos.y, 'reverseButton'),
                b : game.add.button(rButtonPos.x+410, rButtonPos.y, 'reverseButton'),
                c : game.add.button(rButtonPos.x, rButtonPos.y+210, 'reverseButton'),
                d : game.add.button(rButtonPos.x+410, rButtonPos.y+210, 'reverseButton')
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


            /* Move entire motor ganging box using a button for clicking and dragging */
            dragButton = {
                gang : game.add.button(1050, 65, 'dragButton', actionDragGang, this)
            }
            function actionDragGang () {
                console.log("Drag gang");
                dragButton.gang.x = game.input.x;
                dragButton.gang.y = game.input.y;
                // motorGangPos.x = dragButton.gang.x - 200;
                // motorGangPos.y = dragButton.y;
                /* update frame position */
                frameMotorGanging.destroy();
                frameMotorGanging = game.add.graphics(0,0);
                frameMotorGanging.lineStyle(1, frameLineColor, 1);
                frameMotorGanging.drawRect(dragButton.gang.x-210, dragButton.gang.y-5, 240, 160);
                /* update checkbox positions */
                checkbox.a1.x = dragButton.gang.x-200, checkbox.a1.y = dragButton.gang.y+27;
                checkbox.a2.x = dragButton.gang.x-100, checkbox.a2.y = dragButton.gang.y+27;
                checkbox.b1.x = dragButton.gang.x-200, checkbox.b1.y = dragButton.gang.y+57;
                checkbox.b2.x = dragButton.gang.x-100, checkbox.b2.y = dragButton.gang.y+57;
                checkbox.c1.x = dragButton.gang.x-200, checkbox.c1.y = dragButton.gang.y+87;
                checkbox.c2.x = dragButton.gang.x-100, checkbox.c2.y = dragButton.gang.y+87;
                checkbox.d1.x = dragButton.gang.x-200, checkbox.d1.y = dragButton.gang.y+117;
                checkbox.d2.x = dragButton.gang.x-100, checkbox.d2.y = dragButton.gang.y+117;
                /* update label positions */
                labelMotorGang.a1.x = dragButton.gang.x-170, labelMotorGang.a1.y = dragButton.gang.y+30;
                labelMotorGang.a2.x = dragButton.gang.x-70, labelMotorGang.a2.y = dragButton.gang.y+30;
                labelMotorGang.b1.x = dragButton.gang.x-170, labelMotorGang.b1.y = dragButton.gang.y+60;
                labelMotorGang.b2.x = dragButton.gang.x-70, labelMotorGang.b2.y = dragButton.gang.y+60;
                labelMotorGang.c1.x = dragButton.gang.x-170, labelMotorGang.c1.y = dragButton.gang.y+90;
                labelMotorGang.c2.x = dragButton.gang.x-70, labelMotorGang.c2.y = dragButton.gang.y+90;
                labelMotorGang.d1.x = dragButton.gang.x-170, labelMotorGang.d1.y = dragButton.gang.y+120;
                labelMotorGang.d2.x = dragButton.gang.x-70, labelMotorGang.d2.y = dragButton.gang.y+120;
                labelMotorGang.g1.x = dragButton.gang.x-200, labelMotorGang.g1.y = dragButton.gang.y;
                labelMotorGang.g2.x = dragButton.gang.x-100, labelMotorGang.g2.y = dragButton.gang.y;
            }


            /* Adding motor-ganging functionality */
            checkbox = {
                //a1 : game.add.button(motorGangPos.x, motorGangPos.y+27, 'checkbox', actionCheckbox, this),

                a1 : game.add.button(motorGangPos.x, motorGangPos.y+27, 'checkbox', actionCheckboxA1, this),
                a2 : game.add.button(motorGangPos.x+100, motorGangPos.y+27, 'checkbox', actionCheckboxA2, this),
                b1 : game.add.button(motorGangPos.x, motorGangPos.y+57, 'checkbox', actionCheckboxB1, this),
                b2 : game.add.button(motorGangPos.x+100, motorGangPos.y+57, 'checkbox', actionCheckboxB2, this),
                c1 : game.add.button(motorGangPos.x, motorGangPos.y+87, 'checkbox', actionCheckboxC1, this),
                c2 : game.add.button(motorGangPos.x+100, motorGangPos.y+87, 'checkbox', actionCheckboxC2, this),
                d1 : game.add.button(motorGangPos.x, motorGangPos.y+117, 'checkbox', actionCheckboxD1, this),
                d2 : game.add.button(motorGangPos.x+100, motorGangPos.y+117, 'checkbox', actionCheckboxD2, this)
            }
            checkboxStatus = { a1 : 0, a2 : 0, b1 : 3, b2 : 0, c1 : 0, c2 : 0, d1 : 0, d2 : 0 } // all initially unchecked

            /*function actionCheckbox () {
                //console.log(checkboxStatus.this);
                //console.log(motorPortGang);
            }*/

            function actionCheckboxA1 () {
                if ( checkboxStatus.a1 === 0 ) { //the checkbox is UNCHECKED
                    checkboxStatus.a1 = 1; // so check it now
                    checkbox.a1.setFrames(1,1,1,0); // over frame and out frame should now both show the box checked
                    if ( checkboxStatus.a2 === 1 ) { // both checkboxes for a single motor cannot be checked, so if the other motor is checked
                        checkboxStatus.a2 = 0; // because the motor was checked for the other gang, we must uncheck it from that gang now
                        checkbox.a2.setFrames(0,0,1,0) // show other box as unchecked
                    }
                }
                else { // the checkbox is CHECKED
                    checkboxStatus.a1 = 0; // so uncheck it now
                    checkbox.a1.setFrames(0,0,1,0); // over frame and out frame should now both show the box unchecked
                }
            }
            function actionCheckboxA2 () {
                if ( checkboxStatus.a2 === 0 ) { //the checkbox is UNCHECKED
                    checkboxStatus.a2 = 1; // so check it now
                    checkbox.a2.setFrames(1,1,1,0); // over frame and out frame should now both show the box checked
                    if ( checkboxStatus.a1 === 1 ) { // both checkboxes for a single motor cannot be checked, so if the other motor is checked
                        checkboxStatus.a1 = 0; // because the motor was checked for the other gang, we must uncheck it from that gang now
                        checkbox.a1.setFrames(0,0,1,0) // show other box as unchecked
                    }
                }
                else { // the checkbox is CHECKED
                    checkboxStatus.a2 = 0; // so uncheck it now
                    checkbox.a2.setFrames(0,0,1,0); // over frame and out frame should now both show the box unchecked
                }
            }
            function actionCheckboxB1 () {
                if ( checkboxStatus.b1 === 0 ) {
                    checkboxStatus.b1 = 1; 
                    checkbox.b1.setFrames(1,1,1,0);
                    if ( checkboxStatus.b2 === 1 ) { 
                        checkboxStatus.b2 = 0; 
                        checkbox.b2.setFrames(0,0,1,0) 
                    }
                } else {
                    checkboxStatus.b1 = 0; 
                    checkbox.b1.setFrames(0,0,1,0);
                }
            }
            function actionCheckboxB2 () {
                if ( checkboxStatus.b2 === 0 ) { 
                    checkboxStatus.b2 = 1; 
                    checkbox.b2.setFrames(1,1,1,0);
                    if ( checkboxStatus.b1 === 1 ) {
                        checkboxStatus.b1 = 0; 
                        checkbox.b1.setFrames(0,0,1,0) 
                    } 
                } else {
                    checkboxStatus.b2 = 0;
                    checkbox.b2.setFrames(0,0,1,0); 
                }
            }
            function actionCheckboxC1 () {
                if ( checkboxStatus.c1 === 0 ) {
                    checkboxStatus.c1 = 1; 
                    checkbox.c1.setFrames(1,1,1,0);
                    if ( checkboxStatus.c2 === 1 ) { 
                        checkboxStatus.c2 = 0; 
                        checkbox.c2.setFrames(0,0,1,0) 
                    }
                } else {
                    checkboxStatus.c1 = 0; 
                    checkbox.c1.setFrames(0,0,1,0);
                }
            }
            function actionCheckboxC2 () {
                if ( checkboxStatus.c2 === 0 ) { 
                    checkboxStatus.c2 = 1; 
                    checkbox.c2.setFrames(1,1,1,0);
                    if ( checkboxStatus.c1 === 1 ) { 
                        checkboxStatus.c1 = 0; 
                        checkbox.c1.setFrames(0,0,1,0) 
                    } 
                } else {
                    checkboxStatus.c2 = 0;
                    checkbox.c2.setFrames(0,0,1,0); 
                }
            }
            function actionCheckboxD1 () {
                if ( checkboxStatus.d1 === 0 ) {
                    checkboxStatus.d1 = 1; 
                    checkbox.d1.setFrames(1,1,1,0);
                    if ( checkboxStatus.d2 === 1 ) { 
                        checkboxStatus.d2 = 0; 
                        checkbox.d2.setFrames(0,0,1,0) 
                    } 
                } else { 
                    checkboxStatus.d1 = 0; 
                    checkbox.d1.setFrames(0,0,1,0); 
                }
            }
            function actionCheckboxD2 () {
                if ( checkboxStatus.d2 === 0 ) { 
                    checkboxStatus.d2 = 1; 
                    checkbox.d2.setFrames(1,1,1,0);
                    if ( checkboxStatus.d1 === 1 ) { 
                        checkboxStatus.d1 = 0; 
                        checkbox.d1.setFrames(0,0,1,0) 
                    }
                } else { 
                    checkboxStatus.d2 = 0; 
                    checkbox.d2.setFrames(0,0,1,0); 
                }
            }

            


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
            sliderTrackA.beginFill(frameLineColor, 1);
            sliderTrackA.drawRect(173, 202, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarA = game.add.button(143, 356, 'sliderBar');
            sliderBarA.events.onInputDown.add(actionDragOnClickA);
            sliderBarA.events.onInputUp.add(actionDragOnClickA);
            // fButton.a.events.onInputDown.add(fButtonDownAction, motorA);

            sliderTrackB = game.add.graphics(0,0);
            sliderTrackB.beginFill(frameLineColor, 1);
            sliderTrackB.drawRect(583, 202, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarB = game.add.button(553, 356, 'sliderBar', actionDragOnClickB);
                        
            sliderTrackC = game.add.graphics(0,0);
            sliderTrackC.beginFill(frameLineColor, 1);
            sliderTrackC.drawRect(173, 412, 2, 160); //every 10% increase in motor speed will be a 16px difference
            sliderBarC = game.add.button(143, 566, 'sliderBar', actionDragOnClickC);

            sliderTrackD = game.add.graphics(0,0);
            sliderTrackD.beginFill(frameLineColor, 1);
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
            dialA.lineStyle(2, frameLineColor, 1);
            dialA.drawCircle(328, 282, 80);

            dialB = game.add.graphics(0,0);
            dialB.beginFill(0xD8D8D8, 1);
            dialB.lineStyle(2, frameLineColor, 1);
            dialB.drawCircle(738, 282, 80);

            dialC = game.add.graphics(0,0);
            dialC.beginFill(0xD8D8D8, 1);
            dialC.lineStyle(2, frameLineColor, 1);
            dialC.drawCircle(328, 492, 80);

            dialD = game.add.graphics(0,0);
            dialD.beginFill(0xD8D8D8, 1);
            dialD.lineStyle(2, frameLineColor, 1);
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
            batteryLevelBox.lineStyle(1.5, frameLineColor, 1);
            batteryLevelBox.drawRect(309, 91, 102, 18);

            batteryLevelFill = game.add.graphics(0,0);
            batteryLevelFill.beginFill(0x808080, 1);
            batteryLevelFill.drawRect(310, 92, Math.round(batteryLevel*100), 16); // the "x100" converts the battery level (whatever it initially is) to the scale of 100 px wide

        /* LCD Screen */
            LCDScreenBox = game.add.graphics(0,0);
            LCDScreenBox.beginFill(0xD8D8D8, 1);
            LCDScreenBox.lineStyle(1.5, frameLineColor, 1);
            LCDScreenBox.drawRect(682, 88, 138, 24);

        } // end create 

    /* Button-click functions */
        function actionInputOnClick () {
            game.world.remove(screenMessage.messageDisplay);
            messageDisplay = prompt("What would you like to display on the screen?");
            screenMessage.messageDisplay = game.add.text(685, 93, messageDisplay, labelStyle3);
        }

        function actionResumeOnClick () {
            // resume all motors at their current settings
            dashboardStatus = 1;
        }
        function actionPauseOnClick () {
            // stop all motors at their current settings
            dashboardStatus = 0;
        }

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
            sliderBarA.inputEnabled=true;
            sliderBarA.input.enableDrag(false);
            sliderBarA.input.allowHorizontalDrag=false;
            console.log('hi');
            sliderBarA.y = 356 - Math.round( (356 - game.input.mousePointer.y) / 16 ) * 16; // round to nearest 10% power
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
            //     IR.IRDistDisplay = game.add.text(533, 155, IRDistDisplay.toFixed(2), labelStyle3);
            // }
            // if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            //     game.world.remove(IR.IRDistDisplay);
            //     IRDist = IRDist - 0.01; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //     IRDistDisplay = IRDist;
            //     IR.IRDistDisplay = game.add.text(533, 155, IRDistDisplay.toFixed(2), labelStyle3);
            // }

            //=============================================================================
            /* Color Sensor */
//             if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
//                 game.world.remove(color.colorRDisplay);
//                 game.world.remove(color.colorGDisplay);
//                 game.world.remove(color.colorBDisplay);
//                 //game.world.remove(color.colorValueDisplay);
//                 if (colorR <= 255) {    
//                     colorR = colorR + 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
//                     colorG = colorG + 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
//                     colorB = colorB + 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
//                     //colorValue = colorValue + 0.01;
//                     colorRDisplay = colorR;
//                     colorGDisplay = colorG;
//                     colorBDisplay = colorB;
//                     //colorValueDisplay = colorValue;
//                     color.colorRDisplay = game.add.text(470, 93, Math.round(colorRDisplay), {font: "16px Arial", fill: "red"});
//                     color.colorGDisplay = game.add.text(546, 93, Math.round(colorGDisplay), {font: "16px Arial", fill: "green"});
//                     color.colorBDisplay = game.add.text(619, 93, Math.round(colorBDisplay), {font: "16px Arial", fill: "blue"});
//                 }
//                 else {
//                     color.colorRDisplay = game.add.text(470, 93, "255", {font: "16px Arial", fill: "red"});
//                     color.colorGDisplay = game.add.text(546, 93, "255", {font: "16px Arial", fill: "green"});
//                     color.colorBDisplay = game.add.text(619, 93, "255", {font: "16px Arial", fill: "blue"});
//                 }
//                 //color.colorValueDisplay = game.add.text(619, 93, Math.round(colorValueDisplay), labelStyle3);
//             }
//             if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
//                 game.world.remove(color.colorRDisplay);
//                 game.world.remove(color.colorGDisplay);
//                 game.world.remove(color.colorBDisplay);
//                 //game.world.remove(color.colorValueDisplay);
//                 if (colorR >= 0) {
//                     colorRDisplay = colorR = colorR - 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
//                     colorGDisplay = colorG = colorG - 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
//                     colorBDisplay = colorB = colorB - 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
//                     //colorValueDisplay = colorValue = colorValue + 0.01;
//                     color.colorRDisplay = game.add.text(470, 93, Math.round(colorRDisplay), {font: "16px Arial", fill: "red"});
//                     color.colorGDisplay = game.add.text(546, 93, Math.round(colorGDisplay), {font: "16px Arial", fill: "green"});
//                     color.colorBDisplay = game.add.text(619, 93, Math.round(colorBDisplay), {font: "16px Arial", fill: "blue"});
//                     //color.colorValueDisplay = game.add.text(619, 93, Math.round(colorValueDisplay), labelStyle3);
//                 }
//                 else {
//                     color.colorRDisplay = game.add.text(470, 93, "0", {font: "16px Arial", fill: "red"});
//                     color.colorGDisplay = game.add.text(546, 93, "0", {font: "16px Arial", fill: "green"});
//                     color.colorBDisplay = game.add.text(619, 93, "0", {font: "16px Arial", fill: "blue"});
//                 }
//             }

//             // WE MIGHT WANT TO STRUCTURE THIS LOGIC A LITTLE MORE NEATLY, BUT IT'LL DEPEND ON THE CONTENT OF THE MESSAGES, AND OF COURSE WONT TAKE KEYBOARD INPUTS
//             if (game.input.keyboard.isDown(Phaser.Keyboard.Y)) {
//                 game.world.remove(color.colorNameDisplay);
//                 colorNameDisplay = colorName = "Yellow"
//                 color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3); //(colorR, colorG, colorB));
//             } else if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
//                 game.world.remove(color.colorNameDisplay);
//                 colorNameDisplay = colorName = "White"
//                 color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
//             } else if (game.input.keyboard.isDown(Phaser.Keyboard.B)) {
//                 game.world.remove(color.colorNameDisplay);
//                 colorNameDisplay = colorName = "Black"
//                 color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
//             } else if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
//                 game.world.remove(color.colorNameDisplay);
//                 colorNameDisplay = colorName = "Blue"
//                 color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
//             } else if (game.input.keyboard.isDown(Phaser.Keyboard.R)) {
//                 game.world.remove(color.colorNameDisplay);
//                 colorNameDisplay = colorName = "Red"
//                 color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
//             } else if (game.input.keyboard.isDown(Phaser.Keyboard.G)) {
//                 game.world.remove(color.colorNameDisplay);
//                 colorNameDisplay = colorName = "Green"
//                 color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
//             } else if (game.input.keyboard.isDown(Phaser.Keyboard.O)) {
//                 game.world.remove(color.colorNameDisplay);
//                 colorNameDisplay = colorName = "Orange"
//                 color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
//             } else if (game.input.keyboard.isDown(Phaser.Keyboard.P)) {
//                 game.world.remove(color.colorNameDisplay);
//                 colorNameDisplay = colorName = "Purple"
//                 color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
//             }
// =======

            // if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            //     game.world.remove(color.colorRDisplay);
            //     game.world.remove(color.colorGDisplay);
            //     game.world.remove(color.colorBDisplay);
            //     //game.world.remove(color.colorValueDisplay);
            //     colorR = colorR + 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //     colorG = colorG + 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //     colorB = colorB + 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //     //colorValue = colorValue + 0.01;
            //     colorRDisplay = colorR;
            //     colorGDisplay = colorG;
            //     colorBDisplay = colorB;
            //     //colorValueDisplay = colorValue;
            //     color.colorRDisplay = game.add.text(470, 93, Math.round(colorRDisplay), labelStyle3);
            //     color.colorGDisplay = game.add.text(546, 93, Math.round(colorGDisplay), labelStyle3);
            //     color.colorBDisplay = game.add.text(619, 93, Math.round(colorBDisplay), labelStyle3);
            //     //color.colorValueDisplay = game.add.text(619, 93, Math.round(colorValueDisplay), labelStyle3);
            // }
            // if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            //     game.world.remove(color.colorRDisplay);
            //     game.world.remove(color.colorGDisplay);
            //     game.world.remove(color.colorBDisplay);
            //     //game.world.remove(color.colorValueDisplay);
            //     colorRDisplay = colorR = colorR - 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //     colorGDisplay = colorG = colorG - 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //     colorBDisplay = colorB = colorB - 1; //THIS IS A PLACEHOLDER, AS IT WILL DEPEND ON THE MESSAGE'S CONTENT
            //     //colorValueDisplay = colorValue = colorValue + 0.01;
            //     color.colorRDisplay = game.add.text(470, 93, Math.round(colorRDisplay), labelStyle3);
            //     color.colorGDisplay = game.add.text(546, 93, Math.round(colorGDisplay), labelStyle3);
            //     color.colorBDisplay = game.add.text(619, 93, Math.round(colorBDisplay), labelStyle3);
            //     //color.colorValueDisplay = game.add.text(619, 93, Math.round(colorValueDisplay), labelStyle3);
            // }

            // // WE MIGHT WANT TO STRUCTURE THIS LOGIC A LITTLE MORE NEATLY, BUT IT'LL DEPEND ON THE CONTENT OF THE MESSAGES, AND OF COURSE WONT TAKE KEYBOARD INPUTS
            // if (game.input.keyboard.isDown(Phaser.Keyboard.Y)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "Yellow"
            //     color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
            // } else if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "White"
            //     color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
            // } else if (game.input.keyboard.isDown(Phaser.Keyboard.B)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "Black"
            //     color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
            // } else if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "Blue"
            //     color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
            // } else if (game.input.keyboard.isDown(Phaser.Keyboard.R)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "Red"
            //     color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
            // } else if (game.input.keyboard.isDown(Phaser.Keyboard.G)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "Green"
            //     color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
            // } else if (game.input.keyboard.isDown(Phaser.Keyboard.O)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "Orange"
            //     color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
            // } else if (game.input.keyboard.isDown(Phaser.Keyboard.P)) {
            //     game.world.remove(color.colorNameDisplay);
            //     colorNameDisplay = colorName = "Purple"
            //     color.colorNameDisplay = game.add.text(590, 65, colorNameDisplay, labelStyle3);
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

