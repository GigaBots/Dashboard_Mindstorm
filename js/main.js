function updateBar (progress, $element) {
    var progressBarWidth = progress * $element.width() / 100;
    $element.find('div').animate({ width: progressBarWidth }, 0).html(progress + "%&nbsp;");
    if (progress === 100) {
        $("#progressBar").remove();
    }
}

require.config({
    baseUrl: 'js',
        // set baseURL to 'js' when bbclient.min.js is in the folder entitled 'js' along with main.js, phaser.min.js, and require.js
    paths: {
        "BrowserBigBangClient": "http://thegigabots.app.bigbang.io/client/js/bbclient.min",
        "BigBangClient": "http://thegigabots.app.bigbang.io/client/js/bbclient.min"
    }
});
updateBar(24, $("#progressBar")) ;

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
    updateBar(59, $("#progressBar"));    

    function beginGame(client, channel) {
        var gameBoundX = 960, gameBoundY = 650;

        /* === Dashboard control panel stuff === */
        var game = new Phaser.Game(gameBoundX, gameBoundY, Phaser.AUTO, "gameWorld", { // 960 x 700 fits alright horizontally on an iPhone 4 and an iPad 
            preload: preload, //Since this is likely the small phone screen anyone would be using, it's important to consider, since we currently have the issue of not scrolling about the Phaser game world window
            create: create,
            update: update,
            //render: render,
            //paused: paused,
            //destroy: destroy
        }, true); // final "true" value notes that background should be transparent
        updateBar(78, $("#progressBar"));
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

        var bbLogo, botLogo, dashboardTitle, allRightsReserved;

        var labelStyle = { font: "12px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc" }
        var noteStyle = { font: "italic 12px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#808080" }
        var largeTitleStyle = { font: "19px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc" }        
        var smallTitleStyle = { font: "16px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc"}
        var dialLabelStyle = { font: "20px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#414242" } 
        var dropdownStyle = { font: "14px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#313233"}        
        var selectBotStyle = { font: "italic 13px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#ff5000" }
        var dataOutputStyle = { font: "16px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#dfdfdf"}
        var statusStyle = { font: "13px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#eaeaea" }
        var messageStyle = { font: "14px Lucida Console, Courier New, Monaco, monospace, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#080808"}   
        var frameLineColor = 0xa3a3a3, frameFill = 0x313233, frameOpacity = 0.7;
        var backgound, uiBackground, backgroundBox, backgroundBottom, titleBox, titleBarLine, bottomLine;
        var dragBoxButton;

        /* Two objects, for referring to motors (or sensors, etc), by a letter corresponding to a number and a number coresponding to the letter. This is for building objects and then using them */
        var numbers = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, o: 15, p: 16, q: 17, r: 18, s: 19, t: 20, u: 21, v: 22, w: 23, x: 24, y: 25, z: 26 }
        var letters = { 1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e', 6: 'f', 7: 'g', 8: 'h', 9: 'i', 10: 'j', 11: 'k', 12: 'l', 13: 'm', 14: 'n', 15: 'o', 16: 'p', 17: 'q', 18: 'r', 19: 's', 20: 't', 21: 'u', 22: 'v', 23: 'w', 24: 'x', 25: 'y', 26: 'z' }

        /* Specify the number of motors */
        var numMotors = 4; //specify # of motors (for now, it must be a multiple of the # of columns or rows and no more than 26 )
        var motorColumns = 2, motorRows = ''; //specify either # of columns or # of rows (NOT both!) (for now, it must be divisible by the number of motors)

        /* Motor positions */
        var positionMotors = {}
        if ( motorColumns !== '' && typeof(motorRows) === 'string' ) {
            var maxMotorColumns = motorColumns;
            var maxMotorRows = numMotors/motorColumns;
        } else {
            var maxMotorColumns = numMotors/motorRows;
            var maxMotorRows = motorRows;
        }
        for ( var i = 1; i <= maxMotorRows; i++ ) { 
            for ( var j = 1; j <= maxMotorColumns; j++ ) {
                if ( j === 1) var subIndex = j + 1 + (i - 1)/i;
                else var subIndex = j + 1;
                var index = subIndex*i - i;
                positionMotors[ letters[ index ] ] = { x : 15 + (j-1)*283 , y : 226 + (i-1)*215 }
            } // this is a sequence to position motors (laid out in a grid). It only handles rectangular arrangements right now...
        }

        var motors = {}
        var labelMotors = {}
        Motor = function ( game, port ) { //prototype for building motor objects
            this.port = port;
            this.name = 'Motor ' + port.toUpperCase();
            this.status = 1;
            this.speed = 0;
            this.position = 0;
            this.gang = 0; // 0 = not ganged with other motors, 1 = joined in gang 1, or 2 = joined in gang 2
            this.stalled = false;
            this.previousSpeed = 0;
            this.speedDisplay = ''; 
            this.directionSwitched = false;
            this.time1 = 0;
            //this.previousDirectionSwitched = false;
        }
        Motor.prototype.constructor = Motor;

        /* Motor Forward Button */
        var forwardButtons = {}
        ForwardButton = function ( game, motor ) {
            Phaser.Button.call( this, game, positionMotors[motor].x+10, positionMotors[motor].y+34, 'forwardButton' );
            this.events.onInputDown.add( forwardDirectionActionDown, motors[motor] );
            this.events.onInputUp.add( forwardDirectionActionUp, motors[motor] );
            this.input.useHandCursor = true
            this.setFrames(1,0,2,0);
            this.motor = motor;
            this.name = 'forward button ' + motor;
            game.add.existing(this);
        }
        ForwardButton.prototype = Object.create(Phaser.Button.prototype);
        ForwardButton.prototype.constructor = ForwardButton;
        
        /* Motor Reverse Button */
        var reverseButtons = {}
        ReverseButton = function ( game, motor ) {
            Phaser.Button.call( this, game, positionMotors[motor].x+10, positionMotors[motor].y+92, 'reverseButton' );
            this.events.onInputDown.add( reverseDirectionActionDown, motors[motor] );
            this.events.onInputUp.add( reverseDirectionActionUp, motors[motor] );
            this.input.useHandCursor = true
            this.setFrames(1,0,2,0);
            this.motor = motor;
            this.name = 'reverse button ' + motor;
            game.add.existing(this);
        }
        ReverseButton.prototype = Object.create(Phaser.Button.prototype);
        ReverseButton.prototype.constructor = ReverseButton;

        /* Motor Increase Speed Plus Button */
        var motorPlusButtons = {}
        MotorPlusButton = function ( game, motor ) {
            Phaser.Button.call ( this, game, positionMotors[motor].x+107, positionMotors[motor].y+35, 'plusButton' );
            this.events.onInputDown.add( increaseSpeedClickActionDown, motors[motor] );
            this.input.useHandCursor = true;
            this.setFrames(1,0,2,0);
            this.motor = motor;
            this.name = 'plus button ' + motor;
            game.add.existing(this);
        }
        MotorPlusButton.prototype = Object.create(Phaser.Button.prototype);
        MotorPlusButton.prototype.constructor = MotorPlusButton;

        /* Motor Decrease Speed Minus Button */
        var motorMinusButtons = {}
        MotorMinusButton = function ( game, motor ) {
            Phaser.Button.call ( this, game, positionMotors[motor].x+107, positionMotors[motor].y+93, 'minusButton' );
            this.events.onInputDown.add( decreaseSpeedClickActionDown, motors[motor] );
            this.input.useHandCursor = true;
            this.setFrames(1,0,2,0);
            this.motor = motor;
            this.name = 'minus button ' + motor;
            game.add.existing(this);
        }
        MotorMinusButton.prototype = Object.create(Phaser.Button.prototype);
        MotorMinusButton.prototype.constructor = MotorMinusButton;

        /* Motor Change/Display Speed Slider Bar (Button) */
        var sliderBars = {}
        SliderBar = function ( game, motor ) {
            Phaser.Button.call ( this, game, positionMotors[motor].x+158, positionMotors[motor].y+167, 'sliderBar' );
            this.events.onInputDown.add( changeSpeedSlideActionDown, motors[motor] );
            this.events.onInputUp.add( changeSpeedSlideActionUp, motors[motor] );
            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.input.enableDrag();
            this.input.allowHorizontalDrag = false;
            this.setFrames(1,0,2,0);
            this.motor = motor;
            this.state = 'up';
            this.name = 'slider bar ' + motor;
            game.add.existing(this);
        }
        SliderBar.prototype = Object.create(Phaser.Button.prototype);
        SliderBar.prototype.constructor = SliderBar;
        var sliderTracks = {}
        var sliderSpeedLabels = {}
        var sliderSpeedIncrements = {}
        var currentSpeedLabels = {}

        /* Motor Switch Directions Checkbox (Button) */
        var directionChecks = {}
        DirectionCheckbox = function ( game, motor ) {
            Phaser.Button.call ( this, game, positionMotors[motor].x+10, positionMotors[motor].y+150, 'checkbox' );
            this.events.onInputDown.add( configDirectionsActionDown, motors[motor] );
            this.events.onInputUp.add( configDirectionsActionUp, motors[motor])
            this.input.useHandCursor = true;
            this.setFrames(2,0,1,0);
            this.motor = motor;
            this.name = 'switch direction button ' + motor;
            this.state = 'up';
            game.add.existing(this);
        }
        DirectionCheckbox.prototype = Object.create(Phaser.Button.prototype);
        DirectionCheckbox.prototype.constructor = DirectionCheckbox;
        var directionConfigLabels = {}

        /* Motor rotational position needle */
        var needles = {}
        RotationNeedle = function ( game, motor, index ) {
            Phaser.Sprite.call( this, game, positionDial.x+38+65*(index-1), positionDial.y+50, 'needle' );
            this.anchor.setTo(0.495, 0.92);
            this.motor = motor;
            this.name = 'needle ' + motor;
            game.add.existing(this);
        }
        RotationNeedle.prototype = Object.create(Phaser.Sprite.prototype);
        RotationNeedle.prototype.constructor = RotationNeedle;
        var dials = {}
        var labelDials = {}


        /* Specify the number of gangs */
        var numGangs = 2;
        var gangColumns = 1, gangRows = '';

        /* Gang positions */
        var positionGangs = {}
        for ( var i = 1; i <= numGangs; i++ ) {
            positionGangs[ i ] = { x : 581, y : 226 + (i-1)*215 }
        }
        // if ( gangColumns !== '' && typeof(gangRows) === 'string' ) {
        //     var maxGangColumns = gangColumns;
        //     var maxGangRows = numGangs/gangColumns;
        // } else {
        //     var maxGangColumns = numGangs/gangRows;
        //     var maxGangRows = gangRows;
        // }
        //for ( var i = 1; i <= maxGangRows; i++ ) { 
            //for ( var j = 1; j <= maxGangColumns; j++ ) {
                //if ( j === 1 ) var subIndex = j + 1 + (i - 1)/i;
                //else var subIndex = j + 1;
                //var index = subIndex*i - i;
                //positionGangs[ index ] = { x : 581 + (j-1)*374 , y : 228 + (i-1)*215 }
            //} // this is a sequence to position gangs (laid out in a grid). It only handles rectangular arrangements right now...
        //}

        var gangs = {}
        Gang = function ( game, gangId ) {
            this.gangId = gangId;
            this.name = 'Gang ' + gangId;
            this.speed = 0;
            for ( var g = 1; g <= numMotors; g++ ) {
                this[ letters[g] ] = false; // set each gang to contain none of the motors
            }
            this.previousSpeed = 0;
        }
        Gang.prototype.constructor = Gang;
        var gangIds = {}
        var gangLabels = {}

        var gangPlusButtons = {}
        GangPlusButton = function ( game, gang ) {
            Phaser.Button.call ( this, game, positionGangs[gang].x+198, positionGangs[gang].y+33, 'plusButton' );
            this.events.onInputDown.add( increaseGangSpeedClickActionDown, gangs[gang] );
            this.input.useHandCursor = true;
            this.setFrames(1,0,2,0);
            this.gang = gang;
            this.name = 'plus button ' + gang;
            game.add.existing(this);
        }
        GangPlusButton.prototype = Object.create(Phaser.Button.prototype);
        GangPlusButton.prototype.constructor = GangPlusButton;

        var gangMinusButtons = {}
        GangMinusButton = function ( game, gang ) {
            Phaser.Button.call ( this, game, positionGangs[gang].x+198, positionGangs[gang].y+91, 'minusButton' );
            this.events.onInputDown.add( decreaseGangSpeedClickActionDown, gangs[gang] );
            this.input.useHandCursor = true;
            this.setFrames(1,0,2,0);
            this.gang = gang;
            this.name = 'minus button ' + gang;
            game.add.existing(this);
        }
        GangMinusButton.prototype = Object.create(Phaser.Button.prototype);
        GangMinusButton.prototype.constructor = GangMinusButton;

        /* Gang Change/Display Speed Slider Bar (Button) */
        var gangSliderBars = {}
        GangSliderBar = function ( game, gang ) {
            Phaser.Button.call ( this, game, positionGangs[gang].x+249, positionGangs[gang].y+165, 'sliderBar2' );
            this.events.onInputDown.add( changeGangSpeedSlideActionDown, gangs[gang] );
            this.events.onInputUp.add( changeGangSpeedSlideActionUp, gangs[gang] );
            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.input.enableDrag();
            this.input.allowHorizontalDrag = false;
            this.setFrames(1,0,2,0);
            this.gang = gang;
            this.state = 'up';
            this.name = 'slider bar ' + gang;
            game.add.existing(this);
        }
        GangSliderBar.prototype = Object.create(Phaser.Button.prototype);
        GangSliderBar.prototype.constructor = GangSliderBar;

        var directionsNote = {}

        var gangCheckboxes = {}
        GangCheckbox = function ( game, gang ) {
            this.gang = gang;
            this.name = 'checkbox gang ' + gang;
        }
        GangCheckbox.prototype = Object.create(Phaser.Button.prototype);
        GangCheckbox.prototype.constructor = GangCheckbox;

        var motorCheckboxes = {}
        MotorCheckbox = function ( game, gang, motor, x, y ) {
            Phaser.Button.call ( this, game, x, y, 'checkbox' );
            this.events.onInputDown.add( actionMotorCheckbox, this );
            this.input.useHandCursor = true;
            this.setFrames(2,0,1,0);
            this.gang = gang;
            this.motor = motor;
            this.motor.gang = gang;
            this.name = 'checkbox Motor ' + gang + ' motor ' + motor;
            game.add.existing(this);
        }
        MotorCheckbox.prototype = Object.create(Phaser.Button.prototype);
        MotorCheckbox.prototype.constructor = MotorCheckbox;

        var gangMotorLabels = {}
        GangMotorLabel = function ( game, gang ) {
            this.gang = gang;
            this.name = 'checkbox gang ' + gang;
        }
        GangMotorLabel.prototype = Object.create(Phaser.Button.prototype);
        GangMotorLabel.prototype.constructor = GangMotorLabel;

        var gangForwardButtons = {}
        GangForwardButton = function ( game, gang ) {
            Phaser.Button.call( this, game, positionGangs[gang].x+101, positionGangs[gang].y+32, 'forwardButton' );
            this.events.onInputDown.add( gangForwardDirectionActionDown, gangs[gang] );
            this.events.onInputUp.add( gangForwardDirectionActionUp, gangs[gang] );
            this.input.useHandCursor = true
            this.setFrames(1,0,2,0);
            this.gang = gang;
            this.name = 'forward button ' + gang;
            game.add.existing(this);
        }
        GangForwardButton.prototype = Object.create(Phaser.Button.prototype);
        GangForwardButton.prototype.constructor = GangForwardButton;

        var gangReverseButtons = {}
        GangReverseButton = function ( game, gang ) {
            Phaser.Button.call( this, game, positionGangs[gang].x+101, positionGangs[gang].y+90, 'reverseButton' );
            this.events.onInputDown.add( gangReverseDirectionActionDown, gangs[gang] );
            this.events.onInputUp.add( gangReverseDirectionActionUp, gangs[gang] );
            this.input.useHandCursor = true
            this.setFrames(1,0,2,0);
            this.gang = gang;
            this.name = 'reverse button ' + gang;
            game.add.existing(this);
        }
        GangReverseButton.prototype = Object.create(Phaser.Button.prototype);
        GangReverseButton.prototype.constructor = GangReverseButton;

        var frames = {}
        Frame = function ( game, recipient, x, y, width, height ) {
            this.recipient = game.add.graphics(0,0);
            this.recipient.lineStyle(1, frameLineColor, 1);
            this.recipient.beginFill(frameFill,frameOpacity);
            this.recipient.drawRect(x, y, width, height);
        }
        Frame.prototype.constructor = Frame;

        // positions of different units are the upper left x & y coordinates of their frames

        /* Motor and sensor statuses */
        var frameMotorStatus, labelMotorStatus = "Motors";
        var positionMotorStatus = { x : 541, y : 66 }
        var frameSensorStatus, labelSensorStatus = "Sensors";
        var positionSensorStatus = { x : 681, y : 66}        
        var labelMotorStatus;
        var labelSensors = { e : "1", f : "2", g : "3", h : "4" }
        var statusLight = { a : '', b : '', c : '', d : '', s1 : '', s2 : '', s3 : '', s4 : '' }

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
        var positionBotSelector = { x : 97, y : 66 }
        var botDropdown, dropdownBox, dropdown;
        var dropHighlight = { 1 : 0 }
        var botLabels = new Array();
        var botId = "", botIndex = 0, botName = 'Select a robot ';
        var bot = {
            nameDisplay : ""
        }
        var botStore = {
            // client id (GUID) : bot name
            'fakeBotId1' : 'Fake Bot 1',
            'fakeBotId2' : 'Fake Bot 2'
        } 

        /* Rotational position */    
        var labelRotation = "Motor Rotational Positions";
        var frameDials;        
        var positionDial = { x : 674, y : 133 }

        /* Ganging motors together */
        var checkbox;

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
        var touchCount = 0, bumpCount = 0, touchTime = 0; //count total touches or bumps
        var touch = {
         touchCountDisplay : 0 //display number of total presses
        }
        var bump = {
         bumpCountDisplay : 0 //display number of total bumps
        }
        var time = {
            touchTimeDisplay : 0 //display total time
        }
        var positionTouch = { x : 443, y : 133 }
        var labelTouch = "Touch Sensor", labelTouched = "Touched", labelTouchCount = "Total Touches: ", labelBumpCount = "Total Bumps: ", labelTouchTime = "Total Time Pressed: ", labelTouchTimeUnits = "sec";
        var touchIndicator;
        var t1Touch;

        /* IR sensor */
        var positionIR = { x : 217, y : 66 }
        var labelIR = "Infrared Sensor", labelIRDist = "Distance: ", labelIRUnits = "cm";
        var IRDist = 0; // THIS IS A PLACEHOLDER FOR NOW!
        var IR = {
            IRDistDisplay : 0
        }

        /* Color sensor */
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
        var LCDScreenBox;
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

        function listenToBot(robotClientId, selectionIndex) { // this is called once the user selects a bot

            channel.getKeyspace(robotClientId).onValue(function (key, val) {
                //console.log("Add:" + key +"->"+JSON.stringify(val) );
                if ( robotClientId !== botId ) {
                    return 0;
                }
                if ( selectionIndex < botIndex ) {
                    return 0;
                }
                if ( key === 'a' ||  key ==='b' || key ==='c' || key === 'd') {
                    setMotorInfo( key, val);
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
                if ( robotClientId !== botId ) {
                    return 0;
                }
                if ( selectionIndex < botIndex ) {
                    return 0;
                }
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
                console.log("bot " + botId + " left");
                //console.log("Delete:" + key);
            });

        }
        updateBar(92,$("#progressBar"));
        //quick and dirty for now
        function setMotorInfo( key, val ) {
            needles[key].angle = val.position;
            // if( key === 'a') {
            //     motorA.status =1;
            //     needles[key].angle = val.position;
            //     if( !val.stalled ) {
            //         statusLight.a.animations.play('pluggedIn');
            //     } else {
            //         motorA.status =2;
            //         statusLight.a.animations.play('stalled');
            //     }
            // }
            // else if (key === 'b') {
            //     motorB.status =1;
            //     needles[key].angle = val.position;
            //     if( !val.stalled ) {
            //         statusLight.b.animations.play('pluggedIn');
            //     } else {
            //         motorB.status =2;
            //         statusLight.b.animations.play('stalled');
            //     }
            // }
            // else if( key === 'c') {
            //     motorC.status =1;
            //     needles[key].angle = val.position;
            //     if( !val.stalled ) {
            //         statusLight.c.animations.play('pluggedIn');
            //     } else {
            //         motorC.status =2;
            //         statusLight.c.animations.play('stalled');
            //     }
            // }
            // else if( key === 'd')  {
            //     //motorD.status =1;
            //     needles[key].angle = val.position;
            //     if ( val.moving ) {
            //         motorD.status =1;
            //         statusLight.d.animations.play('pluggedIn');
            //     }
            //     else if ( val.stalled ) {
            //         motorD.status =2;
            //         statusLight.d.animations.play('stalled');
            //     } 
            //     else {
            //         motorD.status =0;
            //         statusLight.d.animations.play('unplugged');
            //     } 
            //     // motorD.status =1;
            //     // needles['d'].angle = val.position; // in update function now
            //     // if ( val.stalled ) {
            //     //     statusLight.d.animations.play('stalled');
            //     // } 
            //     // else {
            //     //     if (motorD.status === "unplugged" ) {
            //     //         statusLight.d.animations.play('unplugged');
            //     //     }
            //     //     else {
            //     //         statusLight.d.animations.play('pluggedIn');
            //     //     }
            //     // }
            //     // if( !val.stalled ) {
            //     //     statusLight.d.animations.play('pluggedIn');
            //     // } else {
            //     //     motorD.status =2;
            //     //     statusLight.d.animations.play('stalled');
            //     // }
            // }
        }
        function setTouchSensor( val ) {
            //console.log("touchSensor " + JSON.stringify(val));
            if( val.values[0] === 1 ) {
                t1Touch = game.time.time;
                touchIndicator.animations.play('pressed');
                game.world.remove(touch.touchCountDisplay);
                touchCount++;
                var touchCountDisplay = touchCount.toString();
                if ( touchCountDisplay.length > 4 ) {
                    touchCountDisplay = touchCountDisplay.slice(touchCountDisplay.length-4, touchCountDisplay.length);
                }
                touch.touchCountDisplay = game.add.text(positionTouch.x+179, positionTouch.y+24, touchCountDisplay, dataOutputStyle);
                channel.getKeyspace(botId).put('touchDash', { 'touchCount' : touchCount, 'touchTime' : touchTime });
            }
            else {
                t2 = game.time.time;
                touchTime = touchTime + (t2 - t1Touch)/1000; // current total touch time plus delta t (in seconds)
                game.world.remove(touch.touchTimeDisplay);
                var touchTimeDisplay = (touchTime.toFixed(2)).toString();
                if ( touchTimeDisplay.length > 6 ) {
                    touchTimeDisplay = touchTimeDisplay.slice(touchTimeDisplay.length-6, touchTimeDisplay.length);
                }
                if ( touchTimeDisplay.length > 7 ) {
                    touchTimeDisplay = touchTimeDisplay.slice(touchTimeDisplay.length-7, touchTimeDisplay.length-3);
                }               
                touch.touchTimeDisplay = game.add.text(positionTouch.x+125, positionTouch.y+47, touchTimeDisplay, dataOutputStyle);
                channel.getKeyspace(botId).put('touchDash', { 'touchCount' : touchCount, 'touchTime' : touchTime });                
                touchIndicator.animations.play('up');
            }
        }

        function setColorSensor( val ) {
            if (val.mode === "RGB") {
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
                color.rDisplay = game.add.text(positionColor.x+45, positionColor.y+24, colorRDisplay.toFixed(0), dataOutputStyle);
                //color.gDisplay = game.add.text(positionColor.x+65, positionColor.y+24, colorGDisplay.toFixed(0), dataOutputStyle);
                //color.bDisplay = game.add.text(positionColor.x+85, positionColor.y+24, colorBDisplay.toFixed(0), dataOutputStyle);
            }
            
            /* After determining output of ColorID sensor, use if statements to implement output into dashboard
            else if (val.mode === "ColorID") {
                var colorNameDisplay;
                var colorOutputStyle = { font: "16px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif"}
                game.world.remove(color.nameDisplay);
                if (val.value[1] === 0)) {
                    colorNameDisplay = "Red";
                    colorOutputStyle.fill = #F00;
                }
                else if (val.value[1] === 1) {
                    colorNameDisplay = "Green";
                    colorOutputStyle.fill = #0F0;
                }
                else if (val.value[1] === 2) {
                    colorNameDisplay = "Blue";
                    colorOutputStyle.fill = #0F0;
                }
                else if (val.value[1] === 3) {
                    colorNameDisplay = "Yellow";
                    colorOutputStyle.fill = #0F0;
                }
                else if (val.value[1] === 4) {
                    colorNameDisplay = "Magenta";
                    colorOutputStyle.fill = #0F0;
                }
                else if (val.value[1] === 5) {
                    colorNameDisplay = "Orange";
                    colorOutputStyle.fill = #0F0;
                }
                else if (val.value[1] === 6) {
                    colorNameDisplay = "White";
                    colorOutputStyle.fill = #0F0;
                }
                else if (val.value[1] === 7) {
                    colorNameDisplay = "Black";
                    colorOutputStyle.fill = #0F0;
                }
                else if (val.value[1] === 8) {
                    colorNameDisplay = "Pink";
                    colorOutputStyle.fill = #0F0;
                }
                else if (val.value[1] === 9) {
                    colorNameDisplay = "Gray";
                    colorOutputStyle.fill = #0F0;
                }
                else if (val.value[1] === 10) {
                    colorNameDisplay = "Light Gray";
                    colorOutputStyle.fill = #0F0;
                }
                else if (val.value[1] === 11) {
                    colorNameDisplay = "Dark Gray";
                    colorOutputStyle.fill = #0F0;
                }
                else if (val.value[1] === 12) {
                    colorNameDisplay = "Cyan";
                    colorOutputStyle.fill = #0F0;
                }
                else if (val.value[1] === 13) {
                    colorNameDisplay = "Brown";
                    colorOutputStyle.fill = #0F0;
                }
                velse if (val.value[1] === -1) {
                    colorNameDisplay = "N/A";
                    colorOutputStyle.fill = #0F0;
                }
                color.nameDisplay = game.add.text(positionColor.x + 150, positionColor.y+24,colorNameDisplay, colorOutputStyle);
            } */
        }
        function setIRSensor( val ) {
            game.world.remove(IR.IRDistDisplay);
            IRDist = val.values[0];
            IRDistDisplay = IRDist;
            IR.IRDistDisplay = game.add.text(positionIR.x+67, positionIR.y+24, IRDistDisplay.toFixed(2), dataOutputStyle);
        }
        function setUltrasonicSensor( val ) {
            ultrasonicDist = val.distance;
            game.world.remove(ultrasonic.ultrasonicDistDisplay);
            ultrasonicDistDisplay = ultrasonicDist;
            ultrasonic.ultrasonicDistDisplay = game.add.text(positionUltrasonic.x+67, positionUltrasonic.y+24, ultrasonicDistDisplay.toFixed(1), dataOutputStyle);
        }
        function setBatteryLevel( val ) {
            batteryLevel = (val.voltage - 5) / (9 - 5); //9 V battery (6 AAs), and the robot dies around 5V
            if ( batteryLevel <= 0.15 ) { // for almost-dead battery!
                if( batteryLevel > -0.01 ) { //lower boundary limit, with a little safety net for inaccuracy/error
                    batteryLevelFill.destroy();
                    batteryLevelFill = game.add.graphics(0,0);
                    batteryLevelFill.beginFill(0xFF0000, 1); // make the fill red!
                    batteryLevelFill.drawRect(positionBattery.x+11, positionBattery.y+30, Math.round(batteryLevel*100), 16);
                }
            }
            else if ( batteryLevel <= 1.01 ) { //upper boundary limit, with a little safety net for inaccuracy/error
                if( batteryLevel > 0.1 ) { //lower boundary limit
                    batteryLevelFill.destroy();
                    batteryLevelFill = game.add.graphics(0,0);
                    batteryLevelFill.beginFill(0x808080, 1); // make fill grey
                    batteryLevelFill.drawRect(positionBattery.x+11, positionBattery.y+30, Math.round(batteryLevel*100), 16);
                }
            }

            channel.getKeyspace(botId).put('batteryDash', { 'batteryLevel' : batteryLevel });
        }

        /* Bot selection */
        function getSize(obj) { // get size of an object
            var size = 0, key;
            for (key in obj) {
                if(obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
        function actionDropdown() {
            var numBots = getSize(botStore);
            botDropdown.setFrames(2,2,2,2);
            dropdownBox = game.add.graphics(0,0);
            dropdownBox.beginFill(0xFFFFFF,0.8);
            dropdownBox.drawRect(positionBotSelector.x+5, positionBotSelector.y+29, 150, (numBots+1)*24); //24 is height of a row (the highlight "button")
            var j =0;
            for ( var key in botStore ) {
                var obj = botStore[key];
                var name = botStore[key];
                dropHighlight[j] = game.add.button(positionBotSelector.x+5, positionBotSelector.y+29+24*j, 'highlighter');
                dropHighlight[j].setFrames(0,2,1,2);
                dropHighlight[j].events.onInputDown.add(actionSelectBot, key);
                dropHighlight[j].input.useHandCursor = true;
                if ( name.length < 20 ) {
                    var botNameDropdown = name;
                }
                else {
                    var botNameDropdown = name.slice(0, 19);
                }
                botLabels[j] = game.add.text(positionBotSelector.x+8, positionBotSelector.y+31+24*j, botNameDropdown, dropdownStyle);
                j++;
            }
            /* create a 'Add a New Bot' button at the bottom of the list */
            dropHighlight[j] = game.add.button(positionBotSelector.x+5, positionBotSelector.y+29+24*j, 'highlighter');
            dropHighlight[j].setFrames(0,2,1,2);
            dropHighlight[j].events.onInputDown.add(actionAddNewBot);
            dropHighlight[j].input.useHandCursor = true;
            botLabels[j] = game.add.text(positionBotSelector.x+8, positionBotSelector.y+31+24*j, 'Add a New Bot', dropdownStyle);
            
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
            var numBots = getSize(botStore);
            for ( var j = 0; j < numBots+1; j++ ) {
                botLabels[j].destroy();
                dropHighlight[j].destroy();
            }

            botId = this.toString(); //for some reason the botId was becoming a JSON object of the clientId string's letters without this
            botName = botStore[this];
            botIndex++;
            listenToBot(botId, botIndex); // start listening to the bot that was just selected
            getInitialTouchData(botId);
            getInitialBatteryLevel(botId);
            game.world.remove(bot.nameDisplay);
            if ( botName.length > 15 ) {
                var botNameDisplay = botName.slice(0, 15);
            }
            else {
                var botNameDisplay = botName;
            }
            bot.nameDisplay = game.add.text(positionBotSelector.x+5, positionBotSelector.y+34, botNameDisplay, statusStyle);
            botDropdown.input.start();
            botDropdown.setFrames(1,0,2,0);
            botDropdown.input.useHandCursor = true;
            //droppedDown = false;
            //getInitialMotorStatus();
            setInitialDashboardSettings(botId);
        }
        function actionNoBotSelection() {
            dropdownBox.destroy();
            dropdown.noBotSelection.destroy();
            var numBots = getSize(botStore);
            for ( var j = 0; j < numBots+1; j++ ) {
                botLabels[j].destroy();
                dropHighlight[j].destroy();
            }
            botDropdown.input.start();
            botDropdown.setFrames(1,0,2,0);
            botDropdown.input.useHandCursor = true;
            //droppedDown = false;
        }
        function actionAddNewBot() {
            var newBotName = prompt("Enter the name of the bot.");
            var newBotId = prompt("Enter a temporary id for the bot.");
            dropdownBox.destroy();
            dropdown.noBotSelection.destroy();
            var numBots = getSize(botStore);
            for ( var j = 0; j < numBots+1; j++ ) {
                botLabels[j].destroy();
                dropHighlight[j].destroy();
            }
            if ( newBotName === '' || typeof(newBotName) === 'undefined' || newBotName === null ) {
                newBotName = 'default name';
            }
            if ( newBotId === '' || typeof(newBotId) === 'undefined' || newBotId === null ) {
                newBotId = 'defaultId';
            }
            botStore[ newBotId ] = newBotName;
            // botId = this.toString(); //for some reason the botId was becoming a JSON object of the clientId string's letters without this
            // botName = botStore[this];
            // botIndex++;
            // listenToBot(botId, botIndex); // start listening to the bot that was just selected
            // getInitialTouchData(botId);
            // getInitialBatteryLevel(botId);
            // game.world.remove(bot.nameDisplay);
            // if ( botName.length > 15 ) {
            //     var botNameDisplay = botName.slice(0, 15);
            // }
            // else {
            //     var botNameDisplay = botName;
            // }
            // bot.nameDisplay = game.add.text(positionBotSelector.x+5, positionBotSelector.y+34, botNameDisplay, statusStyle);
            botDropdown.input.start();
            botDropdown.setFrames(1,0,2,0);
            botDropdown.input.useHandCursor = true;
            //droppedDown = false;
            //getInitialMotorStatus();
            
            //setInitialDashboardSettings(botId);
        }
        /* Initialization of touch sensor display and battery display on dashboard */
        function getInitialTouchData(robotClientId) {
            var touchData = channel.getKeyspace(botId).get('touchDash'); // get the current touch count
            setInitialTouchData('touchDash', touchData);
        }
        function setInitialTouchData( key, val ) {
            game.world.remove(touch.touchCountDisplay);
            game.world.remove(touch.touchTimeDisplay);
            if ( typeof(val) !== "undefined" ) {
                touchCount = val.touchCount;
                var touchCountDisplay = touchCount.toString();
                if ( touchCountDisplay.length > 4 ) {
                    touchCountDisplay = touchCountDisplay.slice(touchCountDisplay.length-4, touchCountDisplay.length);
                }
                touch.touchCountDisplay = game.add.text(positionTouch.x+179, positionTouch.y+24, touchCountDisplay, dataOutputStyle);
                touchTime = val.touchTime;
                var touchTimeDisplay = (touchTime.toFixed(2)).toString();
                if ( touchTimeDisplay.length > 6 ) {
                    touchTimeDisplay = touchTimeDisplay.slice(touchTimeDisplay.length-6, touchTimeDisplay.length);
                }
                if ( touchTimeDisplay.length > 7 ) {
                    touchTimeDisplay = touchTimeDisplay.slice(touchTimeDisplay.length-7, touchTimeDisplay.length-3);
                } 
                touch.touchTimeDisplay = game.add.text(positionTouch.x+125, positionTouch.y+47, touchTimeDisplay, dataOutputStyle);                
            }
            //console.log("initial touch count set to " + touchCount + " and total time pressed to " + touchTime);
        }
        function getInitialBatteryLevel(robotClientId) {
            var batteryLevelData = channel.getKeyspace(botId).get('batteryDash'); // get the current battery level, before occassional updates
            setInitialBatteryLevel('batteryDash', batteryLevelData);
        }
        function setInitialBatteryLevel( key, val ) { // set the current battery level if it exists (it's been calculated in a dashboard somewhere)
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
                        batteryLevelFill.drawRect(positionBattery.x+11, positionBattery.y+30, Math.round(batteryLevel*100), 16);
                    }
                }
            }
        }
        function setInitialDashboardSettings(robotClientId) { // if the bot has just been connected and has no dashboard settings in its keyspace
            var dashMotorA = channel.getKeyspace(robotClientId).get('aDash');
            if (typeof(dashMotorA) === 'undefined') { // if this is undefined, that will mean that the bot is just being accessed for the first time, so it doesn't have any dashboard settings in each keyspace.
                console.log("initializing keyspace and dashboard settings for the newly connected bot...");
                channel.getKeyspace(botId).put('touchDash', { 'touchCount' : 0, 'touchTime' : 0 });                
                channel.getKeyspace(botId).put('batteryDash', { 'batteryLevel' : 0 });
                for ( var m in motors ) {
                    var dashKey = m + 'Dash';
                    channel.getKeyspace(botId).put( dashKey, { 'speed': 0, 'direction': "stopped", 'directionSwitched': false }); //dashboard settings
                    channel.getKeyspace(botId).put(m, { 'port': m, 'position': 0, 'stalled': false, 'moving': false }); //robot data
                }
                for ( var g in gangs ) {
                    var dashKey = g + 'Dash';
                    var initialChannelData = {
                        'speed' : 0
                    }
                    for ( var k in motors ) {
                        initialChannelData[ k ] = gangs[ g ][ k ];
                    }
                    channel.getKeyspace(botId).put( dashKey, initialChannelData );
                }
            }
        }

        //EXPERIMENTING...trying to show motor statuses correctly
        // function getInitialMotorStatus() {
        //     var currentPosD = needles['d'].angle;
        //     moveMotor(botId,'d','f',1);
        //     if (currentPosD === needles['d'].angle) {
        //         statusLight.d.animations.play('unplugged');
        //         motorD.status = "unplugged";
        //     } 
        //     else {
        //         statusLight.d.animations.play('pluggedIn');
        //         motorD.status = "pluggedIn";
        //     }
        //     moveMotor(botId,'d','r',1);
        //     moveMotor(botId,'d','f',0);
        // }

    //==============================================================================================================================
        function preload() {
            game.load.spritesheet('statusLight', 'assets/gigabot_dashboard_status_lights_spritesheet.png', 14, 14);
            game.load.spritesheet('forwardButton','assets/buttons/gigabot_dashboard_button_forward_spritesheet.png', 89, 45);
            game.load.spritesheet('reverseButton','assets/buttons/gigabot_dashboard_button_reverse_spritesheet.png', 89, 45);
            game.load.spritesheet('checkbox','assets/buttons/gigabot_dashboard_checkbox_spritesheet.png', 24, 23);
            game.load.spritesheet('minusButton','assets/buttons/gigabot_dashboard_button_minus_spritesheet.png', 44, 44);
            game.load.spritesheet('plusButton','assets/buttons/gigabot_dashboard_button_plus_spritesheet.png', 44, 44);
            game.load.spritesheet('touchIndicator','assets/gigabot_dashboard_touch_sensor_spritesheet.png', 21, 21);
            game.load.image('sliderBar','assets/buttons/gigabot_dashboard_slider_bar.png', 72, 24);
            game.load.image('sliderBar2','assets/buttons/gigabot_dashboard_slider_bar_2.png', 72, 24);
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
            game.load.image('testingButton','assets/buttons/testing_button.png',100,50);
        } //end preload

    //==============================================================================================================================
        function create() {          
            /* this button is for testing. it's invisible and in the upper right corner */   
            updateBar(100, $("#progressBar")); 
            getKeyspaceButton = game.add.button(840,0,'testingButton', actionGetKeyspace);

            this.game.stage.disableVisibilityChange = true;
            game.input.keyboard.disabled = false;
            game.world.setBounds(0, 0, gameBoundX, gameBoundY);
            game.input.onDown.add(function () {
                if ( this.game.paused ) {
                    this.game.paused = false;
                    dashboardStatus = 1;
                    game.world.remove(status.statusDisplay);
                    labelStatusDisplay = "running...";
                    status.statusDisplay = game.add.text(positionStatus.x+5, positionStatus.y+34, labelStatusDisplay, statusStyle);
                    statusButton.setFrames(1,0,0,0);
                    resume.resumeMessageDisplay.destroy();
                    resume.resumeOverlay.destroy();
                    botIndex--; // //this is part of a little hack, to resume the channel.getKeyspace.onValue function after we resume, so we don't update anything (like we do to deal with selecting the same bot multiple times)
                }
            }, this);

        /* Title */
            dashboardTitle = game.add.sprite(75,8,'title');
            botLogo = game.add.sprite(15,9,'gigabotSm');
            poweredBy = game.add.sprite(740,8,'poweredBy');

        /* Frames */
            frames[ 'status' ] = new Frame( game, 'status', positionStatus.x, positionStatus.y, 72, 57);
            frames[ 'botSelector' ] = new Frame( game, 'botSelector', positionBotSelector.x, positionBotSelector.y, 110, 57);
            frames[ 'motorStatus' ] = new Frame( game, 'motorStatus', positionMotorStatus.x, positionMotorStatus.y, 130, 57);
            frames[ 'sensorStatus' ] = new Frame( game, 'sensorStatus', positionSensorStatus.x, positionSensorStatus.y, 130, 57);
            frames[ 'battery' ] = new Frame( game, 'Battery', positionBattery.x, positionBattery.y, 124, 57);
            frames[ 'IR' ] = new Frame( game, 'IR', positionIR.x, positionIR.y, 152, 57);
            frames[ 'ultrasonic' ] = new Frame( game, 'ultrasonic', positionUltrasonic.x, positionUltrasonic.y, 152, 57);
            frames[ 'touch' ] = new Frame( game, 'touch', positionTouch.x, positionTouch.y, 221, 83);
            frames[ 'color' ] = new Frame( game, 'color', positionColor.x, positionColor.y, 216, 83);
            frames[ 'screen' ] = new Frame( game, 'screen', positionScreen.x, positionScreen.y, 192, 83);
            frames[ 'dials' ] = new Frame( game, 'dials', positionDial.x, positionDial.y, 271, 83);

        /* Labels */
            status.statusDisplay =  game.add.text(positionStatus.x+5, positionStatus.y+34, statusDisplay, statusStyle);

            bot.nameDisplay = game.add.text(positionBotSelector.x+5, positionBotSelector.y+34, botName, selectBotStyle);

            labelMotorStatus = game.add.text(positionMotorStatus.x+10, positionMotorStatus.y+2, labelMotorStatus, smallTitleStyle); //label at top of box indicating status of motor ports
            labelA = game.add.text(positionMotorStatus.x+14, positionMotorStatus.y+37, 'A', labelStyle);
            labelB = game.add.text(positionMotorStatus.x+44, positionMotorStatus.y+37, 'B', labelStyle);
            labelC = game.add.text(positionMotorStatus.x+74, positionMotorStatus.y+37, 'C', labelStyle);
            labelD = game.add.text(positionMotorStatus.x+104, positionMotorStatus.y+37, 'D', labelStyle);

            labelSensorStatus = game.add.text(positionSensorStatus.x+10, positionSensorStatus.y+2, labelSensorStatus, smallTitleStyle); //label at top of box indicating status of motor ports
            label1 = game.add.text(positionSensorStatus.x+15, positionSensorStatus.y+37, labelSensors.e, labelStyle);
            label2 = game.add.text(positionSensorStatus.x+45, positionSensorStatus.y+37, labelSensors.f, labelStyle);
            label3 = game.add.text(positionSensorStatus.x+75, positionSensorStatus.y+37, labelSensors.g, labelStyle);
            label4 = game.add.text(positionSensorStatus.x+105, positionSensorStatus.y+37, labelSensors.h, labelStyle);

            labelTouch = game.add.text(positionTouch.x+10, positionTouch.y+2, labelTouch, smallTitleStyle);
            labelTouched = game.add.text(positionTouch.x+10, positionTouch.y+27, labelTouched, labelStyle);
            labelTouchCount = game.add.text(positionTouch.x+94, positionTouch.y+27, labelTouchCount, labelStyle); // there is room for 4 characters, so 0 to 9,999. No touching more than that!
            //labelBumpCount = game.add.text(positionTouch.x+10, positionTouch.y+50, labelBumpCount, labelStyle);
            labelTouchTime = game.add.text(positionTouch.x+10, positionTouch.y+50, labelTouchTime, labelStyle);
            labelTouchTimeUnits = game.add.text(positionTouch.x+180, positionTouch.y+50, labelTouchTimeUnits, labelStyle);

            labelIR = game.add.text(positionIR.x+10, positionIR.y+2, labelIR, smallTitleStyle);
            labelIRDist = game.add.text(positionIR.x+10, positionIR.y+27, labelIRDist, labelStyle);
            labelIRUnits = game.add.text(positionIR.x+121, positionIR.y+27, labelIRUnits, labelStyle);

            labelUltrasonic = game.add.text(positionUltrasonic.x+10, positionUltrasonic.y+2, labelUltrasonic, smallTitleStyle);
            labelUltrasonicDist = game.add.text(positionUltrasonic.x+10, positionUltrasonic.y+27, labelUltrasonicDist, labelStyle);
            labelUltrasonicUnits = game.add.text(positionUltrasonic.x+121, positionUltrasonic.y+27, labelUltrasonicUnits, labelStyle);

            labelColor = game.add.text(positionColor.x+10, positionColor.y+2, labelColor, smallTitleStyle);
            labelColorValue = game.add.text(positionColor.x+10, positionColor.y+27, labelColorValue, labelStyle);
            labelColorName = game.add.text(positionColor.x+106, positionColor.y+27, labelColorName, labelStyle);
            labelIntensity = game.add.text(positionColor.x+10, positionColor.y+50, labelIntensity, labelStyle);

            labelBattery = game.add.text(positionBattery.x+10, positionBattery.y+2, labelBattery, smallTitleStyle);
            
            labelScreen = game.add.text(positionScreen.x+10, positionScreen.y+2, labelScreen, smallTitleStyle);

        /* Dashboard stop/resume button */
            statusButton = game.add.button(positionStatus.x+5, positionStatus.y+5, 'statusButton', actionStopOnClick);
            statusButton.setFrames(1,0,0,0);
            statusButton.input.useHandCursor = true;
        /* Select which robot to control */
            botDropdown = game.add.button(positionBotSelector.x+5, positionBotSelector.y+5, 'botDropdown');
            botDropdown.events.onInputDown.add(actionDropdown);
            botDropdown.setFrames(1,0,2,0);
            botDropdown.input.useHandCursor = true;
        /* Touch Sensor */
            touchIndicator = game.add.sprite(positionTouch.x+64, positionTouch.y+25, 'touchIndicator');
            touchIndicator.animations.add('up', [0], 1);
            touchIndicator.animations.add('pressed', [1], 1);
            touchIndicator.animations.play('up');
        /* Battery Level Sensor */
            batteryLevelOutline = game.add.sprite(positionBattery.x+8, positionBattery.y+27, 'batteryOutline');
            batteryLevelFill = game.add.graphics(0,0);
            batteryLevelFill.beginFill(0x808080, 1);
            batteryLevelFill.drawRect(positionBattery.x+11, positionBattery.y+30, Math.round(batteryLevel*100), 16); // the "x100" converts the battery level (whatever it initially is) to the scale of 100 px wide
        /* LCD Screen */
            LCDScreenBox = game.add.graphics(0,0);
            LCDScreenBox.beginFill(0x808080, 0.6);
            LCDScreenBox.lineStyle(1.5, frameLineColor, 1);
            LCDScreenBox.drawRect(positionScreen.x+10, positionScreen.y+29, 172, 46);
            //input button
            screenInputButton = game.add.button(positionScreen.x+142, positionScreen.y+4, 'screenInputButton', actionInputOnClick);
            screenInputButton.input.useHandCursor = true;

        /* Status Lights */
            statusLight.a = game.add.sprite(positionMotorStatus.x+12, positionMotorStatus.y+24, 'statusLight');
            statusLight.a.animations.add('unplugged', [3], 1);
            statusLight.a.animations.add('pluggedIn', [1], 1);
            statusLight.a.animations.add('stalled', [2], 1);
            statusLight.b = game.add.sprite(positionMotorStatus.x+42, positionMotorStatus.y+24, 'statusLight');
            statusLight.b.animations.add('unplugged', [3], 1);
            statusLight.b.animations.add('pluggedIn', [1], 1);
            statusLight.b.animations.add('stalled', [2], 1);
            statusLight.c = game.add.sprite(positionMotorStatus.x+72, positionMotorStatus.y+24, 'statusLight');
            statusLight.c.animations.add('unplugged', [3], 1);
            statusLight.c.animations.add('pluggedIn', [1], 1);
            statusLight.c.animations.add('stalled', [2], 1);
            statusLight.d = game.add.sprite(positionMotorStatus.x+102, positionMotorStatus.y+24, 'statusLight');
            statusLight.d.animations.add('unplugged', [3], 1);
            statusLight.d.animations.add('pluggedIn', [1], 1);
            statusLight.d.animations.add('stalled', [2], 1);

            statusLight.s1 = game.add.sprite(positionSensorStatus.x+12, positionSensorStatus.y+24, 'statusLight');
            statusLight.s1.animations.add('unplugged', [3], 1);
            statusLight.s1.animations.add('pluggedIn', [1], 1);
            statusLight.s2 = game.add.sprite(positionSensorStatus.x+42, positionSensorStatus.y+24, 'statusLight');
            statusLight.s2.animations.add('unplugged', [3], 1);
            statusLight.s2.animations.add('pluggedIn', [1], 1);
            statusLight.s3 = game.add.sprite(positionSensorStatus.x+72, positionSensorStatus.y+24, 'statusLight');
            statusLight.s3.animations.add('unplugged', [3], 1);
            statusLight.s3.animations.add('pluggedIn', [1], 1);
            statusLight.s4 = game.add.sprite(positionSensorStatus.x+102, positionSensorStatus.y+24, 'statusLight');
            statusLight.s4.animations.add('unplugged', [3], 1);
            statusLight.s4.animations.add('pluggedIn', [1], 1);

            /* Rotational position dials and needles for motors */
            labelRotation = game.add.text(positionDial.x+10, positionDial.y+2, labelRotation, smallTitleStyle);

            /* Create Motors */
            for ( var i = 1; i <= numMotors; i++ ) {
                var motorPort = letters[i];
                motors[ motorPort ] = new Motor( game, motorPort );
                
                /* inside motor frames */                
                frames[motorPort] = new Frame( game, motorPort, positionMotors[ motorPort ].x, positionMotors[ motorPort ].y, 273, 205);
                labelMotors[ motorPort ] = game.add.text( positionMotors[ motorPort ].x+10, positionMotors[ motorPort ].y+2, motors[ letters[i] ].name, largeTitleStyle );
                sliderTracks[ motorPort] = game.add.sprite( positionMotors[ motorPort ].x+163, positionMotors[ motorPort].y+18, 'sliderIncrements' );
                for ( var k = 0; k <= 7; k++ ) {
                    var speedLabel = 100 * k + "";
                    sliderSpeedIncrements[ motorPort ] = game.add.text( positionMotors[ motorPort ].x+237, positionMotors[ motorPort ].y+164 - 22 * k, speedLabel, labelStyle );
                }
                sliderSpeedLabels[ motorPort ] = game.add.text( positionMotors[ motorPort ].x+154, positionMotors[ motorPort ].y+181, "Speed (\xB0/sec)", labelStyle );
                currentSpeedLabels[ motorPort ] = game.add.text( positionMotors[ motorPort ].x+10, positionMotors[ motorPort ].y+181, "Current Speed:", labelStyle );
                directionConfigLabels[ motorPort ] = game.add.text(positionMotors[ motorPort ].x+38, positionMotors[ motorPort ].y+152, "Switch Directions", labelStyle );
                forwardButtons[ motorPort ] = new ForwardButton( game, motorPort );
                reverseButtons[ motorPort ] = new ReverseButton( game, motorPort );
                motorPlusButtons[ motorPort ] = new MotorPlusButton( game, motorPort );
                motorMinusButtons[ motorPort ] = new MotorMinusButton( game, motorPort );
                sliderBars[ motorPort ] = new SliderBar( game, motorPort );
                directionChecks[ motorPort ] = new DirectionCheckbox( game, motorPort );

                /* outside of motor frames */
                dials[ motorPort ] = game.add.sprite( positionDial.x+12+(i-1)*65, positionDial.y+24, 'dialFace' );
                labelDials[ motorPort ] = game.add.text( positionDial.x+32+(i-1)*65, positionDial.y+45, motorPort.toUpperCase(), dialLabelStyle );
                needles[ motorPort ] = new RotationNeedle ( game, motorPort , numbers[ motorPort ] );
            }

            /* Create Gangs */
            for ( var i = 1; i <= numGangs; i++ ) {
                gangs[ i ] = new Gang( game, i );
                frames[ i ] = new Frame( game, i, positionGangs[ i ].x, positionGangs[ i ].y, 364, 205);
                gangLabels[ i ] = game.add.text( positionGangs[ i ].x+10, positionGangs[ i ].y+2, gangs[ i ].name, largeTitleStyle );
                sliderTracks[ i ] = game.add.sprite( positionGangs[ i ].x+254, positionGangs[ i ].y+18, 'sliderIncrements' );                
                for ( var k = 0; k <= 7; k++ ) {
                    var speedLabel = 100 * k + "";
                    sliderSpeedIncrements[ i ] = game.add.text( positionGangs[ i ].x+328, positionGangs[ i ].y+164 - 22 * k, speedLabel, labelStyle );
                }
                sliderSpeedLabels[ i ] = game.add.text( positionGangs[ i ].x+245, positionGangs[ i ].y+181, "Speed (\xB0/sec)", labelStyle );
                currentSpeedLabels[ i ] = game.add.text( positionGangs[ i ].x+101, positionGangs[ i ].y+181, "Current Speed:", labelStyle );
                directionsNote[ i ] = game.add.text(positionGangs[ i ].x+101, positionGangs[ i ].y+144, "*Forward and Reverse\n directions are relative", noteStyle), 
                gangForwardButtons[ i ] = new GangForwardButton( game, i );
                gangReverseButtons[ i ] = new GangReverseButton( game, i );
                gangPlusButtons[ i ] = new GangPlusButton( game, i );
                gangMinusButtons[ i ] = new GangMinusButton( game, i );
                gangSliderBars[ i ] = new GangSliderBar( game, i );
                gangCheckboxes[i] = new GangCheckbox( game, i );
                gangMotorLabels[i] = new GangMotorLabel( game, i );
                var spacing = Math.floor((161 - 35)/(numMotors-1));
                for ( var j = 1; j <= numMotors; j++ ) {
                    var motorName = "Motor " + letters[j].toUpperCase();
                    gangMotorLabels[ i ][ letters[j] ] = game.add.text( positionGangs[ i ].x+38, positionGangs[ i ].y+35+(j-1)*spacing, motorName, labelStyle );
                    gangCheckboxes[ i ][ letters[j] ] = new MotorCheckbox( game, i, letters[j], positionGangs[ i ].x+10, positionGangs[ i ].y+34+(j-1)*spacing );
                }              
            }

            /* Add keyboard inputs for motor controls, as an alternative when using a desktop */
            // add reverse/forward keyboard controls (using A,S,D,& F for forward, and Z,X,C,& V for reverse):
            var fAKey = this.input.keyboard.addKey(Phaser.Keyboard.A);
            fAKey.onDown.add(forwardDirectionActionDown, motors['a']); // this will move motor A forward
            var fBKey = this.input.keyboard.addKey(Phaser.Keyboard.S);
            fBKey.onDown.add(forwardDirectionActionDown, motors['b']);
            var fCKey = this.input.keyboard.addKey(Phaser.Keyboard.D);
            fCKey.onDown.add(forwardDirectionActionDown, motors['c']);
            var fDKey = this.input.keyboard.addKey(Phaser.Keyboard.F);
            fDKey.onDown.add(forwardDirectionActionDown, motors['d']);
            var rAKey = this.input.keyboard.addKey(Phaser.Keyboard.Z);
            rAKey.onDown.add(reverseDirectionActionDown, motors['a']); // this will move motor A in reverse
            var rBKey = this.input.keyboard.addKey(Phaser.Keyboard.X);
            rBKey.onDown.add(reverseDirectionActionDown, motors['b']);
            var rCKey = this.input.keyboard.addKey(Phaser.Keyboard.C);
            rCKey.onDown.add(reverseDirectionActionDown, motors['c']);
            var rDKey = this.input.keyboard.addKey(Phaser.Keyboard.V);
            rDKey.onDown.add(reverseDirectionActionDown, motors['d']);
            // stop motor on key up:
            fAKey.onUp.add(forwardDirectionActionUp, motors['a']); // this will stop motor A
            fBKey.onUp.add(forwardDirectionActionUp, motors['b']);
            fCKey.onUp.add(forwardDirectionActionUp, motors['c']);
            fDKey.onUp.add(forwardDirectionActionUp, motors['d']);
            rAKey.onUp.add(reverseDirectionActionUp, motors['a']); // this will stop motor A
            rBKey.onUp.add(reverseDirectionActionUp, motors['b']);
            rCKey.onUp.add(reverseDirectionActionUp, motors['c']);
            rDKey.onUp.add(reverseDirectionActionUp, motors['d']);
            /* Add keyboard inputs for motor gangs, as an alternative when using a desktop */
            // add reverse/forward keyboard controls (using Q & W for forward, and E & R for reverse):
            var fG1Key = this.input.keyboard.addKey(Phaser.Keyboard.Q);
            fG1Key.onDown.add(gangForwardDirectionActionDown, gangs[1]); // this will move gang 1 forward
            var fG2Key = this.input.keyboard.addKey(Phaser.Keyboard.W);
            fG2Key.onDown.add(gangForwardDirectionActionDown, gangs[2]);
            var rG1Key = this.input.keyboard.addKey(Phaser.Keyboard.E);
            rG1Key.onDown.add(gangReverseDirectionActionDown, gangs[1]); // this will move gang 1 in reverse
            var rG2Key = this.input.keyboard.addKey(Phaser.Keyboard.R);
            rG2Key.onDown.add(gangReverseDirectionActionDown, gangs[2]);
            // stop motor on key up:
            fG1Key.onUp.add(gangForwardDirectionActionUp, gangs[1]); // this will stop gang 1
            fG2Key.onUp.add(gangForwardDirectionActionUp, gangs[2]);
            rG1Key.onUp.add(gangReverseDirectionActionUp, gangs[1]); // this will stop gang 1
            rG2Key.onUp.add(gangReverseDirectionActionUp, gangs[2]);

        } // end create 

        function configDirectionsActionDown () {
            directionChecks[ this.port ].state = 'down';
            var temp = this.directionSwitched;
            if ( !this.directionSwitched ) {
                this.directionSwitched = true;
                directionChecks[ this.port ].setFrames(1,1,1,1); //checked
            } 
            else {
                this.directionSwitched = false;
                directionChecks[ this.port ].setFrames(2,0,1,0); //unchecked
            }
            //motors[ this.port ].previousDirectionSwitched = motors[ this.port ].directionSwitched;
            var dashKey = this.port + 'Dash';
            channel.getKeyspace(botId).put(dashKey, { 'speed': this.speed, 'directionSwitched': this.directionSwitched });
            console.log("flipping directions for motor " + this.port + " from " + temp + " to " + this.directionSwitched );
        }
        function configDirectionsActionUp () {
            directionChecks[ this.port ].state = 'up';
        }
        function increaseSpeedClickActionDown () {
            if ( motors[ this.port ].speed <= 650 ) {
                motors[ this.port ].speed += 50; // increase speed by 50 degrees/sec
                sliderBars[ this.port ].y -= 11;
            }
            else {
                motors[ this.port ].speed = 700; // just set the speed to the maximum
                sliderBars[ this.port ].y = positionMotors[ this.port ].y + 13;
            }
            var dashKey = this.port + 'Dash'; // we're creating a string which will be the keyspace key for this motor's dashboard settings
            channel.getKeyspace(botId).put(dashKey, { 'speed': motors[ this.port ].speed }); // This accesses the keyspace 'dashboard,' which if it doesn't exist is then created containing a non-null value. Then it puts a key this.port into it, which contains the value 'speed' equal to motors[this.port].speed
            game.world.remove( motors[ this.port ].currentSpeedDisplay );
            motors[ this.port ].currentSpeedDisplay = game.add.text(positionMotors[this.port].x+100, positionMotors[this.port].y+178, motors[ this.port ].speed.toFixed(1), dataOutputStyle);
            //console.log("increasing motor " + this.port + " speed to " + motors[ this.port ].speed.toFixed(2) );
        }
        function decreaseSpeedClickActionDown () {
            if (motors[ this.port ].speed >= 50) {
                motors[ this.port ].speed -= 50;
                sliderBars[ this.port ].y += 11;
            } else {
                motors[ this.port ].speed = 0; // just set the speed to the minimum
                sliderBars[ this.port ].y = positionMotors[ this.port ].y + 167; 
            }
            var dashKey = this.port + 'Dash'; // we're creating a string which will be the keyspace key for this motor's dashboard settings
            channel.getKeyspace(botId).put(dashKey, { 'speed': motors[ this.port ].speed }); // This accesses the keyspace 'dashboard,' which if it doesn't exist is then created containing a non-null value. Then it puts a key this.port into it, which contains the value 'speed' equal to motors[this.port].speed
            game.world.remove( motors[ this.port ].currentSpeedDisplay );
            motors[ this.port ].currentSpeedDisplay = game.add.text(positionMotors[this.port].x+100, positionMotors[this.port].y+178, motors[ this.port ].speed.toFixed(1), dataOutputStyle);
            //console.log("decreasing motor " + this.port + " speed to " + motors[ this.port ].speed.toFixed(2) );
        }
        function changeSpeedSlideActionDown () {
            sliderBars[ this.port ].state = 'down';
            motors[ this.port ].previousSpeed = motors[ this.port ].speed;
        }
        function changeSpeedSlideActionUp () {
            sliderBars[ this.port ].state = 'up';
            //we're sliding between positionMotors[ this.port ].y + 11 px (0 deg/sec) and positionMotors[ this.port ].y + 165px (700 deg/sec). These y coordinates are at the top of the slider bar, so the center goes from 362 to 202
            if ( sliderBars[ this.port ].y < positionMotors[ this.port ].y+13 ) { //set max speed boundary limit
                sliderBars[ this.port ].y = positionMotors[ this.port ].y+13;
            } else if ( sliderBars[this.port].y > positionMotors[this.port].y+167 ) { //set min speed boundary limit
                sliderBars[ this.port ].y = positionMotors[ this.port ].y+167;
            }
            motors[ this.port ].speed = 700 + ( 700/154 ) * (positionMotors[this.port].y + 13 - sliderBars[this.port].y); // normalize speed over the range of y values on the slider track
            var dashKey = this.port + 'Dash'; // we're creating a string which will be the keyspace key for this motor's dashboard settings
            channel.getKeyspace(botId).put(dashKey, { 'speed': motors[ this.port ].speed }); // This accesses the keyspace 'dashboard,' which if it doesn't exist is then created containing a non-null value. Then it puts a key this.port into it, which contains the value 'speed' equal to motors[this.port].speed
            game.world.remove( motors[ this.port ].currentSpeedDisplay );
            motors[ this.port ].currentSpeedDisplay = game.add.text(positionMotors[this.port].x+100, positionMotors[this.port].y+178, motors[ this.port ].speed.toFixed(1), dataOutputStyle);
            //console.log("changing speed of motor " + this.port + " to " + motors[ this.port ].speed.toFixed(2));
        }
        function forwardDirectionActionDown () {
            //console.log("move motor " + this.port + " forward"); 
            moveMotor( botId, this.port, "f", this.speed, this.directionSwitched );
            forwardButtons[this.port].setFrames(2,2,2,2); // show the forward button as down, in case keyboard button inputs were being used instead of clicking            
        }
        function forwardDirectionActionUp() {
            //console.log("stop motor " + this.port);
            stopMotor( botId, this.port ); 
            forwardButtons[this.port].setFrames(1,0,2,0); // show the forward button as up (normal position)
        }
        function reverseDirectionActionDown () {
            //console.log("move motor " + this.port + " in reverse"); 
            moveMotor( botId, this.port, "r", this.speed, this.directionSwitched );
            reverseButtons[this.port].setFrames(2,2,2,2); // show the reverse button as down, in case keyboard button inputs were being used instead of clicking            
        }
        function reverseDirectionActionUp() {
            //console.log("stop motor " + this.port);
            stopMotor( botId, this.port ); 
            reverseButtons[this.port].setFrames(1,0,2,0); // show the reverse button as up (normal position)
        }

        /* Gang controls */
        function increaseGangSpeedClickActionDown () {
            if ( gangs[ this.gangId ].speed <= 650 ) {
                gangs[ this.gangId ].speed += 50; // increase speed by 50 degrees/sec
                gangSliderBars[ this.gangId ].y -= 11;
            }
            else {
                gangs[ this.gangId ].speed = 700; // just set the speed to the maximum
                gangSliderBars[ this.gangId ].y = positionGangs[ this.gangId ].y + 13;
            }
            var dashKey = this.gangId + 'Dash'; // we're creating a string which will be the keyspace key for this gang's dashboard settings
            var gangChannelData = {
                'speed' : gangs[ this.gangId ].speed
            }
            for ( var k in motors ) {
                gangChannelData[ k ] = gangs[ this.gangId ][ k ];
            }
            channel.getKeyspace(botId).put( dashKey, gangChannelData ); // This accesses the keyspace 'dashboard,' which if it doesn't exist is then created containing a non-null value. Then it puts a key this.gangId into it, which contains the value 'speed' equal to gangs[this.gangId].speed
            game.world.remove( gangs[ this.gangId ].currentSpeedDisplay );
            gangs[ this.gangId ].currentSpeedDisplay = game.add.text(positionGangs[this.gangId].x+191, positionGangs[this.gangId].y+178, gangs[ this.gangId ].speed.toFixed(1), dataOutputStyle);
            //console.log("increasing gang " + this.gangId + " speed to " + gangs[ this.gangId ].speed.toFixed(2) );
        }
        function decreaseGangSpeedClickActionDown () {
            if (gangs[ this.gangId ].speed >= 50) {
                gangs[ this.gangId ].speed -= 50;
                gangSliderBars[ this.gangId ].y += 11;
            } else {
                gangs[ this.gangId ].speed = 0; // just set the speed to the minimum
                gangSliderBars[ this.gangId ].y = positionGangs[ this.gangId ].y + 167; 
            }
            var dashKey = this.gangId + 'Dash'; // we're creating a string which will be the keyspace key for this gang's dashboard settings
            var gangChannelData = {
                'speed' : gangs[ this.gangId ].speed
            }
            for ( var k in motors ) {
                gangChannelData[ k ] = gangs[ this.gangId ][ k ];
            }
            channel.getKeyspace(botId).put( dashKey, gangChannelData ); 
            game.world.remove( gangs[ this.gangId ].currentSpeedDisplay );
            gangs[ this.gangId ].currentSpeedDisplay = game.add.text(positionGangs[this.gangId].x+191, positionGangs[this.gangId].y+178, gangs[ this.gangId ].speed.toFixed(1), dataOutputStyle);
            //console.log("decreasing gang " + this.gangId + " speed to " + gangs[ this.gangId ].speed.toFixed(2) );
        }
        function changeGangSpeedSlideActionDown () {
            gangSliderBars[ this.gangId ].state = 'down';
            gangs[ this.gangId ].previousSpeed = gangs[ this.gangId ].speed;
        }
        function changeGangSpeedSlideActionUp () {
            gangSliderBars[ this.gangId ].state = 'up';
            //we're sliding between positionGangs[ this.gangId ].y + 11 px (0 deg/sec) and positionGangs[ this.gangId ].y + 165px (700 deg/sec). These y coordinates are at the top of the slider bar, so the center goes from 362 to 202
            if ( gangSliderBars[ this.gangId ].y < positionGangs[ this.gangId ].y+13 ) { //set max speed boundary limit
                gangSliderBars[ this.gangId ].y = positionGangs[ this.gangId ].y+13;
            } else if ( gangSliderBars[this.gangId].y > positionGangs[this.gangId].y+167 ) { //set min speed boundary limit
                gangSliderBars[ this.gangId ].y = positionGangs[ this.gangId ].y+167;
            }
            gangs[ this.gangId ].speed = 700 + ( 700/154 ) * (positionGangs[this.gangId].y + 13 - gangSliderBars[this.gangId].y); // normalize speed over the range of y values on the slider track
            var dashKey = this.gangId + 'Dash'; // we're creating a string which will be the keyspace key for this gang's dashboard settings
            var gangChannelData = {
                'speed' : gangs[ this.gangId ].speed
            }
            for ( var k in motors ) {
                gangChannelData[ k ] = gangs[ this.gangId ][ k ];
            }
            channel.getKeyspace(botId).put( dashKey, gangChannelData ); 
            game.world.remove( gangs[ this.gangId ].currentSpeedDisplay );
            gangs[ this.gangId ].currentSpeedDisplay = game.add.text(positionGangs[this.gangId].x+191, positionGangs[this.gangId].y+178, gangs[ this.gangId ].speed.toFixed(1), dataOutputStyle);
            //console.log("changing speed of gang " + this.gangId + " to " + gangs[ this.gangId ].speed.toFixed(2));
        }
        function actionMotorCheckbox () {
            var gangId = this.gang;
            var motorPort = this.motor;
            var otherGangId;
            if ( gangs[ gangId ][ motorPort ] === false ) {
                gangs[ gangId ][ motorPort ] = true;
                gangCheckboxes[ gangId ][ motorPort ].setFrames(1,1,1,1); // check the box
                for ( var k = 1; k <= numGangs; k++ ) { // check to see if the motor is in any other gang, and if so, remove it from that gang
                    if ( gangs[ k ][ motorPort ] === true ) {
                        if ( k !== gangId ) {
                            gangs[ k ][ motorPort] = false;
                            gangCheckboxes[ k ][ motorPort ].setFrames(2,0,1,0); // uncheck the other box
                            var otherDashKey = k + 'Dash';
                            var otherGangChannelData = {
                                'speed' : gangs[ k ].speed
                            }
                            for ( var n in motors ) {
                                otherGangChannelData[ n ] = gangs[ k ][ n ];
                            }       
                            channel.getKeyspace(botId).put( otherDashKey, otherGangChannelData ); // replace key value with all of the gang's data (not just the updated info)
                        }  
                    }
                }
            }
            else {
                gangs[ gangId ][ motorPort ] = false;
                gangCheckboxes[ gangId ][ motorPort ].setFrames(2,0,1,0); // uncheck the box
            }
            var dashKey = gangId + 'Dash';
            //var gangVal = 'gang' + gangId;
            var gangChannelData = {
                'speed' : gangs[ gangId ].speed
            }
            for ( var m in motors ) {
                //var gangVal = 'gang' + gangId + '.' + m;
                gangChannelData[ m ] = gangs[ gangId ][ m ];
            }
            channel.getKeyspace(botId).put( dashKey, gangChannelData ); // replace key value with all of the gang's data (not just the updated info)
        }
        function gangForwardDirectionActionDown () {
            //console.log("move gang " + this.gangId + " forward"); 
            for ( var m in motors ) {
                if ( this[ m ] === true) {
                    moveMotor( botId, m, "f", this.speed, motors[ m ].directionSwitched );
                    forwardButtons[ m ].setFrames(2,2,2,2); // show the forward button as down, in case keyboard button inputs were being used instead of clicking            
                }
            }
        }
        function gangForwardDirectionActionUp() {
            //console.log("stop gang " + this.gangId); 
            for ( var m in motors ) {
                if ( this[ m ] === true ) {
                    stopMotor( botId, m );                     
                    forwardButtons[ m ].setFrames(1,0,2,0); // show the forward button as up (normal position)
                }
            }
        }
        function gangReverseDirectionActionDown () {
            //console.log("move gang " + this.gangId + " in reverse"); 
            for ( var m in motors ) {
                if ( this[ m ] === true) {
                    moveMotor( botId, m, "r", this.speed, motors[ m ].directionSwitched );
                    reverseButtons[ m ].setFrames(2,2,2,2);         
                }
            }       
        }
        function gangReverseDirectionActionUp() {
            //console.log("stop gang " + this.gangId); 
            for ( var m in motors ) {
                if ( this[ m ] === true ) {
                    stopMotor( botId, m );
                    reverseButtons[ m ].setFrames(1,0,2,0);                     
                }
            } 
        }

        //=============================================================================
    /* Motor communication with Robot via messages to Big Bang channel */
        function moveMotor( recipient, motor, direction, speed, switched ) {
            var data = {};
            data.type = "motorStart";
            data.recipient = recipient;
            data.port = motor;
            if ( switched === true ) {
                if ( direction === 'f' ) direction = 'r';
                else direction = 'f';
            }
            data.dir = direction;
            data.speed = speed;
            console.log( "sending " + JSON.stringify(data));
            channel.publish( data );
            var dashKey = motor + 'Dash';
            channel.getKeyspace(botId).put(dashKey, { 'speed': speed, 'direction': direction, 'directionSwitched': switched });
        }
        function stopMotor( recipient, motor ) {
            var data = {};
            data.recipient = recipient;
            data.type = "motorStop";
            data.port = motor;
            console.log( "sending " + JSON.stringify(data));
            channel.publish( data );
            var dashKey = motor + 'Dash';
            channel.getKeyspace(botId).put(dashKey, { 'speed': motors[motor].speed, 'direction': "stopped", 'directionSwitched': motors[motor].directionSwitched });
        }

    /* Button-click functions (most of them anyway...) */
        function actionStopOnClick () {
            if ( dashboardStatus === 1 ) {
                statusButton.setFrames(2,2,2,2);
                dashboardStatus = 0;
                game.paused = true;
                game.world.remove(status.statusDisplay);
                labelStatusDisplay = "stopped";
                status.statusDisplay = game.add.text(positionStatus.x+5, positionStatus.y+34, labelStatusDisplay, statusStyle);
                resume.resumeOverlay = game.add.graphics(0,0);
                resume.resumeOverlay.beginFill(0x00000,0.45);
                resume.resumeOverlay.drawRect(14, 66, gameBoundX-28, gameBoundY-69);
                resume.resumeMessageDisplay = game.add.sprite(gameBoundX/2-251,280,'resume');
                this.game.input.keyboard.disabled = true;
                botIndex++; //this is part of a little hack, to exit the channel.getKeyspace.onValue function while we're paused, so we don't update anything (like we do to deal with selecting the same bot multiple times)
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

        function actionGetKeyspace() {
        // this is to query the current bot's keyspace, for testing/debugging
            console.log("\nGetting Keyspace Info for Bot...\nBot Client Id = " + botId + "\nand bot selection index = " + botIndex);
            var keys = channel.getKeyspace(botId).keys();
            console.log(keys); //["robot", "a", "b", "c", "d", "S1"]
            var isRobot = channel.getKeyspace(botId).get('robot');
            console.log(isRobot); //Object {imTotallyARobot: "yup"} 
            console.log("Bot Info from Robot:");
            for ( var m in motors ) {
                var motorData = channel.getKeyspace(botId).get( m );
                console.log( motorData);
            }
            var s1 = channel.getKeyspace(botId).get('S1');
            console.log(s1); //Object {sensorType: "lejos.hardware.sensor.EV3IRSensor", port: "S1", mode: "Distance", values: Array[1]}
            var s2 = channel.getKeyspace(botId).get('S2');
            console.log(s2); //Object {sensorType: "lejos.hardware.sensor.EV3TouchSensor", port: "S2", mode: "Touch", values: Array[1]}
            var s3 = channel.getKeyspace(botId).get('S3');
            console.log(s3); //Object {sensorType: "lejos.hardware.sensor.EV3ColorSensor", port: "S3", mode: "RGB", values: Array[3]}
            var s4 = channel.getKeyspace(botId).get('S4');
            console.log(s4);
            console.log("Dashboard Info:")
            for ( var m in motors ) {
                var dashKey = m + 'Dash';
                var motorSettings = channel.getKeyspace(botId).get( dashKey );
                console.log( motorSettings );
            }
            for ( var g in gangs ) {
                var dashKey = g + 'Dash';
                var gangSettings = channel.getKeyspace(botId).get( dashKey );
                console.log( gangSettings );
            }
            var dt = channel.getKeyspace(botId).get('touchDash');
            console.log(dt);
            var dbl = channel.getKeyspace(botId).get('batteryDash');
            console.log(dbl);

        }

    //==============================================================================================================================
    /* Update stuff */
        /* Update the dashboard speed setting of gangs */
        function updateGangSpeed (key, speed) {
            var gangId = key.slice(0,1);
            //if ( gangSliderBars[ gangId ].state === "up " ) {
                //console.log ("updating speed of gang " + gangId + " to " + speed);
                gangs[ gangId ].speed = speed;
                gangSliderBars[ gangId ].y = positionGangs[ gangId ].y + 13 - (154 / 700) * (speed - 700); //back-calculate sliderbar position from speed normalized over the range of slider track y-values
                gangs[ gangId ].previousSpeed = speed;
                game.world.remove( gangs[ gangId ].currentSpeedDisplay );
                gangs[ gangId ].currentSpeedDisplay = game.add.text( positionGangs[ gangId ].x+191, positionGangs[ gangId ].y+178, speed.toFixed(1), dataOutputStyle );
            //}
        }
        /* Update the dashboard motor selection in gangs */
        function updateGangMotors (key, motor, status ) {
            var gangId = key.slice(0,1);
            //console.log( "updating motor " + motor + " within gang " + gangId );
            gangs[ gangId ][ motor ] = status;
            if ( status === true ) {
                gangCheckboxes[ gangId ][ motor ].setFrames(1,1,1,1);   
            } else {
                gangCheckboxes[ gangId ][ motor ].setFrames(2,0,1,0);                  
            }
        }
        /* Update the direction configurations of the motors for all users */
        function updateDirections ( key, switchDirection ) {
            var motorPort = key.slice(0,1);
            if ( motors[ motorPort ].directionSwitched === switchDirection ) {
                return 0;
            }
            //console.log ("updating direction of motor " + motorPort + " to " + switchDirection);
            if ( switchDirection === false ) {
                motors[ motorPort ].directionSwitched = false;
                directionChecks[ motorPort ].setFrames(2,0,1,0);
            } else {
                motors[ motorPort ].directionSwitched = true;
                directionChecks[ motorPort ].setFrames(1,1,1,1);
            }
            //motors[ motorPort ].previousDirectionSwitched = switchDirection;
        }
        /* Update set speeds and slider positions for all users */
        function updateSpeed (key, speed) {
            var motorPort = key.slice(0,1);
            //if ( sliderBars[ motorPort ].state === "up " ) {
                //console.log ("updating speed of motor " + motorPort + " to " + speed);
                motors[ motorPort ].speed = speed;
                sliderBars[ motorPort ].y = positionMotors[ motorPort ].y + 13 - (154 / 700) * (speed - 700); //back-calculate sliderbar position from speed normalized over the range of slider track y-values
                motors[ motorPort ].previousSpeed = speed;
                game.world.remove( motors[ motorPort ].currentSpeedDisplay );
                motors[ motorPort ].currentSpeedDisplay = game.add.text( positionMotors[ motorPort ].x+100, positionMotors[ motorPort ].y+178, speed.toFixed(1), dataOutputStyle );
            //}
        }
        /* Rotation of motor position dials */
        function moveDial (key, direction) { // Move the dial in realtime in all users' dashboards: this is an approximation based on the previous needle position and the current speed and direction
            var motorPort = key.slice(0,1);
            var time2 = game.time.time;
            var deltaTime = time2 - motors[ motorPort ].time1;
            if ( deltaTime >= 60 ) {
                deltaTime = 30; // approximate, when the time difference is too large (when starting a motor either for the first time or after a break)
            }
            if ( direction === 'f' ) {
                needles[ motorPort ].angle += motors[ motorPort ].speed * deltaTime / 1000; // CW
            }
            if ( direction === 'r' ) {
                needles[ motorPort ].angle -= motors[ motorPort ].speed * deltaTime / 1000; // CCW
            }
            motors[ motorPort ].time1 = time2;
        } 
        function updateDial (key, motorData) { // Update the dial once the motor stops, at the next nearest second when the bot sends out a position value (this is more accurate)
        // May need to comment out this function this while the robot is not running. We'll figure out a way to first determine if the robot is running and connected
            var motorPort = key.slice(0,1);
            if ( typeof(motorData) !== "undefined" ) {
                if ( motorData.moving === false ) {
                    needles[ motorPort ].angle = motorData.position //now, update to exact value that was published to channel by bot
                }
            }
        }
        function getGangValues (key, val) {
            var gangId = key.slice(0,1); // take only the gang's number from the keyspace dashboard motor settings (e.g., take 'a' from 'aDash')
            for ( var k in val ) {
                if ( val[k] !== gangs[ gangId ][k] ) {
                    gangs[ gangId ][k] = val[k];
                    if ( k === 'speed' ) {
                        updateGangSpeed( key, val[k] );
                    }
                    for ( var m in motors ) {
                        if ( k === m ) {
                            updateGangMotors( key, m, val[ k ] );
                        }
                    }
                }
            } 
        }
        /* Get key-value pairs from the dashboard keyspace and do things with them */
        function getDashboardValues (key, val) {
            //console.log("getting dashboard values for " + key); 
            var motorPort = key.slice(0,1); // take only the letter from the keyspace dashboard motor settings (e.g., take 'a' from 'aDash')
            if ( motors[ motorPort ].speed !== val.speed && motors[ motorPort ].previousSpeed !== val.speed ) { // don't change anything again in the dashboard of the user who changed the speed, only in the others' dashboards
                updateSpeed( key, val.speed );
            }
            //if ( directionChecks[motorPort].state == 'up ') {
            if ( typeof(val.directionSwitched) !== 'undefined' && motors[ motorPort ].directionSwitched !== val.directionSwitched ) {
                updateDirections( key, val.directionSwitched );
            }
            //} 
        }
        function getDialValues (key, val) {
            //console.log("getting dial values for " + key); 
            var motorPort = key.slice(0,1);
            if ( val.direction === 'f' || val.direction === 'r' ) {
                moveDial (key, val.direction); //smooth-ish linear extrapolation
            } else if ( val.direction === "stopped" ) {
                channel.getKeyspace(botId).put( key, { 'speed': motors[ motorPort ].speed }); // get rid of direction value until the motor's moving again (so this doesn't keep running), by replacing the key with only a speed value
                var motorData = channel.channelData.get( key );
                updateDial (key, motorData ); // update at the next second to the value in the message sent by the bot
            }
        }
        function update() {
            if ( botId === '' ) { // don't do anything when we're not dealing with a particular bot
                return 0;
            }
            /* DASHBOARD STUFF */
            for ( var k in motors ) {
                var dashKey = k + 'Dash';
                //if ( sliderBars[k].state === "up" ) { // this was to partially eliminate the glitch in the dashboard of the user who changed the speed
                var dashMotor = channel.getKeyspace(botId).get(dashKey); 
                if ( typeof(dashMotor) !== "undefined" ) {
                    getDashboardValues( dashKey, dashMotor );
                    getDialValues( dashKey, dashMotor );
                }               
                //}
            }
            for ( var g in gangs ) {
                var dashKey = g + 'Dash';
                var dashGang = channel.getKeyspace(botId).get(dashKey);
                //if ( typeof(dashGang) !== "undefined" ) {
                    getGangValues( dashKey, dashGang );
                //}
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
            // if input code is not able to be run, display console's error message to user in text editor area. codeArray[input, output#]. If error, stored as an output in codeArray. Multidimensional: codeArray[inputIteration, outPut[0 or 1]]. output[0] stores input of iteration. output[1] stores output, be it an error message or a console log.
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