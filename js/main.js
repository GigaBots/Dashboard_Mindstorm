/*
* The Gigabots Dashboard
* http://thegigabots.com https://github.com/GigaBots/Dashboard_Mindstorm
* Jonathan Wagner, founder & CEO of Big Bang
* John DiBaggio and Cole Bittel
*
* main.js contains the control panel, text editor, and loading progress bar
*/

// Loading progress bar
function updateBar (progress, $element) {
    var progressBarWidth = progress * $element.width() / 100;
    $element.find('div').animate({ width: progressBarWidth }, 0).html(progress + "%&nbsp;");
    if (progress === 100) {
        $("#progressBar").remove();
    }
}

updateBar(24, $("#progressBar"));

var client;
var game;
var restartState;
var gameStates = {}

var botStore = { // client id (GUID) : bot name
    'fakeBotId1' : 'Fake Bot 1',
    'fakeBotId2' : 'Fake Bot 2'
}

var gameStates = {}

var botId = "", botIndex = 0, botName = "";
var bot = { nameDisplay : "" }

var listenToBot;
var getInitialTouchData;
var setInitialTouchData;
var getInitialBatteryLevel;
var setInitialBatteryLevel;
var setSensorIDs;
var setInitialDashboardSettings;
var displayName;
var rearrangeDashboard;

// resize html elements
function adjustHtml ( newWidth, newHeight) {
    var newDimensions = {
        x : newWidth + 'px',
        y : newHeight + 'px'
    }
    // resize #gameWorld width and height
    document.getElementById("gameWorld").style.width = newDimensions.x;
    document.getElementById("gameWorld").style.height = newDimensions.y; 
    // resize #textEditor width
    document.getElementById("textEditor").style.width = newDimensions.x; 
    // move text editor buttons
    var textEditButtons1 = '-moz-calc(50% - ' + newWidth/2 + 'px)';
    var textEditButtons2 = '-webkit-calc(50% - ' + newWidth/2 + 'px)';
    var textEditButtons3 = 'calc(50% - ' + newWidth/2 + 'px)';
    document.getElementById("runButton").style.left = textEditButtons1; 
    document.getElementById("runButton").style.left = textEditButtons2;
    document.getElementById("runButton").style.left = textEditButtons3;
    document.getElementById("repoButton").style.left = textEditButtons1; 
    document.getElementById("repoButton").style.left = textEditButtons2;
    document.getElementById("repoButton").style.left = textEditButtons3;      
}

function appendDropdown( robotClientId ) {
  /* add a new html element to the dropdown menu for the new bot */
    var para = document.createElement( "li" ); // create list element
    var subPara = document.createElement( "a" ); // create link element in the list element
    var node = document.createTextNode( botStore[ robotClientId ] ); // create text (the bot name for each bot id in the botStore associative array)
    subPara.appendChild( node ); // append the text to the new link element
    para.setAttribute("class", "botName"); // "botName" class to the new element
    para.setAttribute("id", robotClientId ); // set id of the new element to be the bot's id
    para.appendChild( subPara ); // append the link element (containing bot name) to the new list element
    var element = document.getElementById( "botSelectorList" ); // get the parent dropdown menu element, with id "botSelectorList"
    var child = document.getElementById( "dropdownDivider" ); // get the element we want to place the new bot above
    element.insertBefore(para,child); // append the new list element to the dropdown menu element, inserting it above the divider element
    var newString = "#" + robotClientId;
  /* action once a bot is selected */
    $( newString ).click( function() {
        botId = this.id;
        console.log("selected bot with clientId " + botId + " and name " + botStore[ botId ]);
        botName = botStore[ botId ];
        botIndex++; // increment the index corresponding to the bot being listened to
        listenToBot( botId, botIndex ); // start listening to the bot that was just selected
        // dashboard and keyspace initializations:
        getInitialTouchData( botId );
        getInitialBatteryLevel( botId );
        setInitialDashboardSettings( botId );
        setSensorIDs();
        // bot name display on dashboard in system box
        displayName( botName );
    });
}

// add bots to drop-down menu in navbar (here, it's just for bots that are declared in botStore - the fakebots)
for ( var k in botStore ) {
    appendDropdown( k );
}

$("#botSelector").css('cursor', 'pointer');
$("#botSelectorList").css('cursor', 'pointer'); // the bot names don't link to anywhere, so manually show to the hand when hovering within the drop-down menu

require.config({
    baseUrl: 'js',
    paths: {
        "BrowserBigBangClient": "http://thegigabots.app.bigbang.io/client/js/bbclient.min",
        "BigBangClient": "http://thegigabots.app.bigbang.io/client/js/bbclient.min",
        "PewRuntime": "http://thegigabots.app.bigbang.io/client/js/bbclient.min"
    }
});
require(['BrowserBigBangClient', 'PewRuntime'], function (bigbang, pew) {

    client = new bigbang.client.BrowserBigBangClient();
    client.connectAnonymous("thegigabots.app.bigbang.io:80", function(result) {
        if( result.success) {
            client.subscribe("newBot", function( err, c) {
                if(!err) {
                    beginGame(client,c);
                    //console.dir(c);
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

        /* === Dashboard control panel === */

        var canvasWidth = document.getElementById('gameWorld').offsetWidth;
        var canvasHeight = 530;
        //var canvasWidth = 1132, canvasHeight = 530;
        
        game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.AUTO, "gameWorld", {
            preload: preload, 
            create: create,
            update: update
        }, true); // final "true" value notes that background should be transparent
        
        var NewState = function( game ) { };
        NewState.prototype = {
            preload: preload, 
            create: create,
            update: update
        }
        game.state.add( 'newState', NewState );

        updateBar(78, $("#progressBar"));

        channel.onMessage( function(evt ) {
            var msg = evt.payload.getBytesAsJSON();
            if( 'log' === msg.type) {
               consoleAppend(msg.message);
            }
        });


        channel.onSubscribers( function(joined) { // keep track of subscribers to the gigabots channel, and determine which subscribers are robots
            console.log('join ' + joined);
            var roboInfo = channel.getKeyspace(joined).get('robot');
            if( roboInfo ) {
                if ( !(joined in botStore) ) {
                    // add newly connected bots to botStore and the drop-down menu
                    botStore[joined] = roboInfo.ev3.name;
                    appendDropdown( joined );
                }
            }
            channel.getKeyspace(joined).on('robot', function(val) {
                if ( !(joined in botStore) ) {
                    // add already connected bots to botStore and the drop-down menu
                    botStore[joined] = val.ev3.name;
                    appendDropdown( joined );
                }
            });
            //console.dir(botStore);
        }, function(left) {
            console.log("leave " + left);
            if ( left in botStore ) {
                // remove bots that have disconnected
                var parent = document.getElementById( "botSelectorList" );
                var child = document.getElementById( left );
                parent.removeChild( child );
                delete botStore[ left ];
            }
        });

        /* Add new bot */
        $("#addBot").click(function() {
            var newBotName = prompt("Enter the name of the bot.");
            var newBotId = prompt("Enter a temporary id for the bot.");
            if ( newBotName === '' || typeof newBotName ===  "undefined" || newBotName === null ) {
                newBotName = 'default name';
            }
            if ( newBotId === '' || typeof newBotId === "undefined" || newBotId === null ) {
                newBotId = 'defaultId';
            }
            botStore[ newBotId ] = newBotName;
            appendDropdown( newBotId );
        })

        var textStyles = {
            label : { font: "12px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc" },
            note : { font: "italic 12px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#808080" },
            title : { font: "16px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#202020" },
            selectBot : { font: "italic 13px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#ff5000" },
            data : { font: "16px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#dfdfdf" },
            status : { font: "13px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#eaeaea" },
            message : { font: "12px Lucida Console, Courier New, Monaco, monospace, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#080808" }   
        }

        /* Two objects, for referring to motors (or sensors, etc), by a letter corresponding to a number and a number coresponding to the letter. This is for building objects and then using them */
        var numbers = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, o: 15, p: 16, q: 17, r: 18, s: 19, t: 20, u: 21, v: 22, w: 23, x: 24, y: 25, z: 26 }
        var letters = { 1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e', 6: 'f', 7: 'g', 8: 'h', 9: 'i', 10: 'j', 11: 'k', 12: 'l', 13: 'm', 14: 'n', 15: 'o', 16: 'p', 17: 'q', 18: 'r', 19: 's', 20: 't', 21: 'u', 22: 'v', 23: 'w', 24: 'x', 25: 'y', 26: 'z' }

        /* Responsive page stuff */
        var $window = $(window); // this is used with the window resive event listener

        // Specify the number of motors
        var numMotors = 4; //specify # of motors (for now, it must be no more than 26 )
        var motorColumns = 2, motorRows = ''; //specify either # of columns or # of rows (NOT both!) 
        var motorHeight = 232; // height of a motor box

        /* Motor positions */
        var positionMotors = {}
        if ( motorColumns !== '' && typeof motorRows === 'string' ) {
            var maxMotorColumns = motorColumns;
            var maxMotorRows = Math.ceil(numMotors/motorColumns);
        }
        else {
            var maxMotorColumns = Math.ceil(numMotors/motorRows);
            var maxMotorRows = motorRows;
        }
        // set motor frame positions
        if ( maxMotorRows === 1 ) {
            for ( var j = 1; j <= maxMotorColumns; j++ ) {
                positionMotors[ letters[ j ] ] = { x : 286 + (j-1)*285, y : 1 }
            }            
        }
        else {
            switch ( maxMotorColumns ) {
                case 1:
                    for ( var i = 1; i <= maxMotorRows; i++ ) {
                        positionMotors[ letters[ i ] ] = { x : 286, y : 1 + (i-1)*242 }
                    }
                    break;
                case 2:
                    for ( var i = 1; i <= maxMotorRows; i++ ) { 
                        for ( var j = 1; j <= maxMotorColumns; j++ ) {
                            if ( j === 1 ) var subIndex = j + 1 + (i - 1)/i;
                            else var subIndex = j + 1;
                            var index = subIndex * i - i;
                            if (index > numMotors) break;
                            positionMotors[ letters[ index ] ] = { x : 286 + (j-1)*285 , y : 1 + (i-1)*242 }
                        } // this is a sequence to position motors (laid out in a grid)
                    }
                    break;
                case 3: 
                    var subIndex, subIndex1 = 2, denominator = 1;
                    for ( var i = 1; i <= maxMotorRows; i++ ) {
                        for ( var j = 1; j <= maxMotorColumns; j++ ) {
                            if ( j === 1 ) {
                                if ( i !== 1 ) {
                                    subIndex = subIndex1 += 1/denominator;
                                    denominator += i;
                                }
                                else if ( i === 1 ) subIndex = subIndex1 +=0;
                            }
                            else if ( j === 2 ) 
                                subIndex = subIndex2 = 3 + (i-1)/i;
                            else if ( j === 3 ) subIndex = 4;
                            var index = subIndex * i -i;
                            if (index > numMotors) break;
                            positionMotors[ letters[ index ] ] = { x : 286 + (j-1)*285 , y : 1 + (i-1)*242 }
                        } // this is a sequence to position motors (laid out in a grid)
                    }
                    break;
                default:
                    alert("Please specify 1, 2, or 3 columns, or specify 1 row.");
                    break;
            }
        }

        // Specify the number of gangs
        var numGangs = 2; // specify number of gangs
        var gangColumns = 1, gangRows = ''; // default value
        var gangHeightMin = 231;

        /* Gang positions */
        var numCheckboxRows = 1 + Math.floor( (numMotors - 1) / 6 );
        var positionGangs = {}
        var col = 4; // just a default, to prevent error in case window width isn't found

        rearrangeDashboard = function () {

            var size = {
                width : $window.width(),
                height : $window.height()
            }
            // knowing the window width, determine how wide canvas should be and set the number of columns in the dashboard accordingly
            if ( size.width >= 1132 ) {
                canvasWidth = 1132; // 4 columns
                col = 4; // total # columns in dashboard
            } 
            else if ( size.width <= 562 ) {
                canvasWidth = 562; // 2 columns
                col = 2;
            }
            else {
                canvasWidth = 847; // 3 columns
                col = 3;
            }
            if ( col === 4 ) {
                gangColumns = 1; //make 1 columns of gangs, which will be the rightmost columns
                gangRows = Math.ceil( numGangs / gangColumns );
                var heightMotors = maxMotorRows * ( motorHeight + 10 ) - 10; // total height of motors 
                var heightGangs = gangRows * ( gangHeightMin + ( numCheckboxRows ) * 28 + 10 ) - 10; // total height of gangs
                //var heightSensors = ; // total height of sensors
                var heightMax = Math.max( heightMotors, heightGangs );
                //var heightMax = Math.max( heightMotors, heightGangs, heightSensors );
                if ( heightMax + 2 !== canvasHeight ) canvasHeight = heightMax + 2; // set new canvas height to be eqaul to 
                for ( var i = 1; i <= numGangs; i++ ) {
                    positionGangs[ i ] = { x : 856, y : 1 + ( i - 1 ) * ( gangHeightMin + ( numCheckboxRows ) * 28 + 10 ) } // rightmost column position
                }
            }
            else if ( col === 3 ) {
                gangColumns = 2; // make 2 columns of gangs, placed next to sensors, and under motors
                gangRows = Math.ceil( numGangs / gangColumns );
                canvasHeight = 2 + maxMotorRows * ( motorHeight + 10 ) + gangRows * ( gangHeightMin + ( numCheckboxRows ) * 28 + 10 ) - 10;
                for ( var r = 1; r <= gangRows; r++ ) { 
                    for ( var c = 1; c <= gangColumns; c++ ) {
                        if ( c === 1 ) var j = c + 1 + (r - 1)/r;
                        else var j = c + 1;
                        var i = j * r - r;
                        if ( i > numGangs ) break;
                        positionGangs[ i ] = { x : 286 + (c-1)*285 , y : 1 + maxMotorRows * ( motorHeight + 10 ) + (r-1) * ( gangHeightMin + ( numCheckboxRows ) * 28 + 10 ) }
                    } // this sequence positions gangs (laid out in two-column a grid)
                }
            }
            else if ( col === 2 ) {
                /*
                * TODO
                */
            }
            if ( typeof game !== "undefined" ) {
                game.height = canvasHeight;
                game.width = canvasWidth;
            }

            adjustHtml( canvasWidth, canvasHeight );
        }
        rearrangeDashboard();


        /* Motor object */
        var motors = {}
        var labelMotors = {}
        Motor = function ( game, port ) {
            this.port = port;
            this.name = 'Motor ' + port.toUpperCase();
            this.status = 1;
            this.speed = 0;
            this.position = 0;
            this.gang = 0; // 0 = not ganged with other motors, 1 = joined in gang 1, or 2 = joined in gang 2. etc
            this.stalled = false;
            this.previousSpeed = 0;
            this.speedDisplay = ''; 
            this.directionSwapped = false;
            this.time1 = 0;
            //this.previousDirectionSwapped = false;
        }
        Motor.prototype.constructor = Motor;

        /* Motor Forward Button */
        var forwardButtons = {}
        ForwardButton = function ( game, motor ) {
            Phaser.Button.call( this, game, positionMotors[motor].x+10, positionMotors[motor].y+100, 'forwardButton' );
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
            Phaser.Button.call( this, game, positionMotors[motor].x+10, positionMotors[motor].y+152, 'reverseButton' );
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
            Phaser.Button.call ( this, game, positionMotors[motor].x+112, positionMotors[motor].y+103, 'plusButton' );
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
            Phaser.Button.call ( this, game, positionMotors[motor].x+112, positionMotors[motor].y+150, 'minusButton' );
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
            Phaser.Button.call ( this, game, positionMotors[motor].x+165, positionMotors[motor].y+188, 'sliderBar2' );
            this.events.onInputDown.add( changeSpeedSlideActionDown, motors[motor] );
            this.events.onInputUp.add( changeSpeedSlideActionUp, motors[motor] );
            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.input.enableDrag();
            this.input.allowHorizontalDrag = false;
            this.setFrames(1,0,2,0);
            this.motor = motor;
            //this.state = 'up';
            this.name = 'slider bar ' + motor;
            game.add.existing(this);
        }
        SliderBar.prototype = Object.create(Phaser.Button.prototype);
        SliderBar.prototype.constructor = SliderBar;
        var sliderTracks = {}
        var sliderSpeedLabels = {}
        var sliderSpeedIncrements = {}
        var currentSpeedLabels = {}

        /* Motor Swap Directions Checkbox (Button) */
        var directionChecks = {}
        DirectionCheckbox = function ( game, motor ) {
            Phaser.Button.call ( this, game, positionMotors[motor].x+10, positionMotors[motor].y+204, 'checkbox' );
            this.events.onInputDown.add( configDirectionsActionDown, motors[motor] );
            this.events.onInputUp.add( configDirectionsActionUp, motors[motor])
            this.input.useHandCursor = true;
            this.setFrames(2,0,1,0);
            this.motor = motor;
            this.name = 'swap direction button ' + motor;
            this.state = 'up';
            game.add.existing(this);
        }
        DirectionCheckbox.prototype = Object.create(Phaser.Button.prototype);
        DirectionCheckbox.prototype.constructor = DirectionCheckbox;
        var directionConfigLabels = {}

        /* Motor rotational position dial and needle */
        var dials = {}
        RotationDial = function ( game, motor, index ) {
            Phaser.Sprite.call( this, game, positionMotors[motor].x+10, positionMotors[motor].y+33, 'dialFace' );
            this.motor = motor;
            this.animations.add('pluggedIn', [0], 1);
            this.animations.add('stalled', [1], 1);
            this.name = 'dial ' + motor;
            game.add.existing(this);
        }
        RotationDial.prototype = Object.create(Phaser.Sprite.prototype);
        RotationDial.prototype.constructor = RotationDial;
        var needles = {}
        RotationNeedle = function ( game, motor, index ) {
            Phaser.Sprite.call( this, game, dials[ motor ].x+26, dials[ motor ].y+26, 'needle' );            
            this.anchor.setTo(0.495, 0.92);
            this.motor = motor;
            this.name = 'needle ' + motor;
            game.add.existing(this);
        }
        RotationNeedle.prototype = Object.create(Phaser.Sprite.prototype);
        RotationNeedle.prototype.constructor = RotationNeedle;

        /* Gang object */
        var gangs = {}
        Gang = function ( game, gangId ) {
            this.gangId = gangId;
            this.name = 'Motor Gang ' + gangId;
            this.speed = 0;
            for ( var g = 1; g <= numMotors; g++ ) {
                this[ letters[g] ] = false; // set each gang to contain none of the motors
            }
            this.previousSpeed = 0;
            this.direction = "stopped";
        }
        Gang.prototype.constructor = Gang;
        var gangIds = {}
        var gangLabels = {}

        /* Gang Increase Speed Plus Button */
        var gangPlusButtons = {}
        GangPlusButton = function ( game, gang ) {
            Phaser.Button.call ( this, game, positionGangs [gang].x+112, positionGangs [gang].y+68, 'plusButton' );
            this.events.onInputDown.add( increaseGangSpeedClickActionDown, gangs[gang] );
            this.input.useHandCursor = true;
            this.setFrames(1,0,2,0);
            this.gang = gang;
            this.name = 'plus button ' + gang;
            game.add.existing(this);
        }
        GangPlusButton.prototype = Object.create(Phaser.Button.prototype);
        GangPlusButton.prototype.constructor = GangPlusButton;

        /* Gang Decrease Speed Minus Button */
        var gangMinusButtons = {}
        GangMinusButton = function ( game, gang ) {
            Phaser.Button.call ( this, game, positionGangs[gang].x+112, positionGangs[gang].y+115, 'minusButton' );
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
            Phaser.Button.call ( this, game, positionGangs[gang].x+165, positionGangs[gang].y+188, 'sliderBar' );
            this.events.onInputDown.add( changeGangSpeedSlideActionDown, gangs[gang] );
            this.events.onInputUp.add( changeGangSpeedSlideActionUp, gangs[gang] );
            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.input.enableDrag();
            this.input.allowHorizontalDrag = false;
            this.setFrames(1,0,2,0);
            this.gang = gang;
            //this.state = 'up';
            this.name = 'slider bar ' + gang;
            game.add.existing(this);
        }
        GangSliderBar.prototype = Object.create(Phaser.Button.prototype);
        GangSliderBar.prototype.constructor = GangSliderBar;

        /* Gang object for holding motor checkboxes */
        var gangCheckboxes = {}
        GangCheckbox = function ( game, gang ) {
            this.gang = gang;
            this.name = 'checkbox gang ' + gang;
        }
        GangCheckbox.prototype = Object.create(Phaser.Button.prototype);
        GangCheckbox.prototype.constructor = GangCheckbox;

        /* Gang motor checkbox */
        var motorCheckboxes = {}
        MotorCheckbox = function ( game, gang, motor, x, y ) {
            Phaser.Button.call ( this, game, x, y, 'checkbox' );
            this.events.onInputDown.add( actionMotorCheckbox, this );
            this.input.useHandCursor = true;
            this.setFrames(2,0,1,0);
            this.gang = gang;
            this.motor = motor;
            this.motor.gang = gang;
            this.name = 'checkbox gang ' + gang + ' motor ' + motor;
            game.add.existing(this);
        }
        MotorCheckbox.prototype = Object.create(Phaser.Button.prototype);
        MotorCheckbox.prototype.constructor = MotorCheckbox;

        /* Gang motor labels */
        var gangMotorLabels = {}
        GangMotorLabel = function ( game, gang ) {
            this.gang = gang;
            this.name = 'checkbox gang ' + gang;
        }
        GangMotorLabel.prototype = Object.create(Phaser.Button.prototype);
        GangMotorLabel.prototype.constructor = GangMotorLabel;

        /* Gang Forward Button */
        var gangForwardButtons = {}
        GangForwardButton = function ( game, gang ) {
            Phaser.Button.call( this, game, positionGangs[gang].x+10, positionGangs[gang].y+65, 'forwardButton' );
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

        /* Gang Reverse Button */
        var gangReverseButtons = {}
        GangReverseButton = function ( game, gang ) {
            Phaser.Button.call( this, game, positionGangs[gang].x+10, positionGangs[gang].y+117, 'reverseButton' );
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

        var directionsNote = {}

        /* Dashboard components frames */
        var frames = {}
        Frame = function ( game, owner, x, y, width, height ) {
            this.owner = game.add.graphics(0,0);
            this.owner.lineStyle( 1 + browserFix/4, 0xa3a3a3, 1 - browserFix/10);
            this.owner.beginFill( 0x313233, 0.60);
            this.owner.drawRect( x, y, width, height );
            this.width = width;
            this.height = height;
            this.initialX = this.x = x;
            this.initialY = this.y = y;
            this.move = function ( x1, y1, x2, y2 ) {
                if ( x2 === this.initialX ) this.owner.x = 0; //return to initial x position
                else this.owner.x = x2 - x1; //this actually increments the x coordinate by this difference
                if ( y2 === this.initialY ) this.owner.y = 0; //return to initial y position
                else this.owner.y = y2 - y1; //this increments the y coordinate by this difference
                this.x = x2;
                this.y = y2;
            }
        }
        Frame.prototype.constructor = Frame;

        var topBars = {}
        var dividers = {}

        /* Play/stop button and status */
        var labelStatus, statusButton;
        var dashboardStatus = 1; // 1 = 'running/resumed', 0 = 'stopped/paused'
        var status = { statusDisplay : "running..." } // initially running
        var resume = { messageDisplay : 0, resumeOverlay : 0 }

        /* Sensor ID labels */
        var sensorIDLabels = {
            IR : '',
            touch : '',
            color : '',
            ultrasonic : ''
        }
        var sensorOverlays = { 
            // IR : '',
            // touch : '',
            // color : '',
            // ultrasonic : ''
        }

        /* System info */
        var positionSystem = { x : 1, y : 2 }

        /* Touch sensor */
        var positionTouch = { x : 1, y : 96 }
        var labelTouch, labelTouched, labelTouchCount, labelTouchTime, labelTouchTimeUnits;
        var touch = {
            count : 0, // total number of touches
            time : 0, //total time pressed
            t1 : 0, //initialize total touch time to 0sec
            countDisplay : 0, //display total number of touches
            timeDisplay : 0 //display total time pressed
        } 
        var touchIndicator;

        /* Color sensor */
        var positionColor = { x : 1, y : 192 }
        var labelColor, labelColorName, labelIntensity, labelColorRGB;
        var color = { r : 0, g : 0, b : 0, value : 0, name : '', lightIntensity : 0, rgbDisplay : 0, nameDisplay : '', lightIntensityDisplay : 0 }
        var colorDisplay;

        /* IR sensor */
        var positionIR = { x : 1, y : 290 }
        var labelIR, labelIRDist, labelIRUnits;
        var IRDist = 0; 
        var IR = { IRDistDisplay : 0 }

        /* Ultrasonic sensor */
        var positionUltrasonic = { x : 1, y : 360 }
        var labelUltrasonic, labelUltrasonicDist, labelUltrasonicUnits;
        var ultrasonicDist = 0;
        var ultrasonic = { ultrasonicDistDisplay : 0 }

        /* Battery level sensor */
        var labelBattery, batteryOutline;
        var battery = {
            level : 1, // initialize the level at 100% (or, 1)
            levelDisplay : 1
        }
        /* LCD Screen */
        var positionScreen = { x : 1, y : 430 }
        var labelScreen, LCDScreenBox;
        var screenMessage = { messageDisplay1 : "", messageDisplay2 : "", messageDisplay3 : "", messageDisplay4 : "" }

        /* Button for testing */
        var getKeyspaceButton;

        /* === Text editor stuff === */
        var userType;
        var userNum;
        var currentCode;
        var codeError;
        var clicked = false;
        // array for textEditor code inputs to be stored, first dimension is input, second is output
        var codeArray = [];
        var iterationNum = 0;
        // element to determine which code to display for "up" and "down" presses
        var indexArray = iterationNum;
        // user's code if uses "up" arrow but didn't hit submit before doing so.
        var tempCode;

        updateBar(92,$("#progressBar"));

        //===================================================

        listenToBot = function ( robotClientId, selectionIndex ) { // this is called once the user selects a bot from the drop-down

            channel.getKeyspace(robotClientId).onValue(function (key, val) {
                //console.log("Add:" + key +"->"+JSON.stringify(val) );
                if ( robotClientId !== botId ) {
                    return 0;
                }
                if ( selectionIndex < botIndex ) {
                    return 0;
                }
                if ( key in motors ) {
                    setMotorInfo( key, val );
                }
                else if ( key === 'S1' || key === 'S2' || key === 'S3' || key === 'S4' ) {
                    if ( val.sensorType === 'lejos.hardware.sensor.EV3IRSensor' ) {
                        setIRSensor(val);
                    }
                    else if ( val.sensorType === 'lejos.hardware.sensor.EV3ColorSensor' ) {
                        setColorSensor(val);
                    }
                    else if ( val.sensorType === 'lejos.hardware.sensor.EV3TouchSensor' ) {
                        setTouchSensor(val);
                    }
                    else if ( val.sensorType === 'lejos.hardware.sensor.EV3UltrasonicSensor' ) {
                        setUltrasonicSensor(val);
                    }
                }
                else if ( key === 'robot' ) {
                    setBatteryLevel(val.ev3.power);
                }
            }, function (key, val) {
                //console.log("Update:" + key +"->"+JSON.stringify(val));
                if ( robotClientId !== botId ) {
                    return 0;
                }
                if ( selectionIndex < botIndex ) {
                    return 0;
                }
                if ( key in motors ) {
                    setMotorInfo( key, val );
                }
                else if ( key === 'S1' || key === 'S2' || key === 'S3' || key === 'S4' ) {
                    if ( val.sensorType === 'lejos.hardware.sensor.EV3IRSensor' ) {
                        setIRSensor(val);
                    }
                    else if ( val.sensorType === 'lejos.hardware.sensor.EV3ColorSensor' ) {
                        setColorSensor(val);
                    }
                    else if ( val.sensorType === 'lejos.hardware.sensor.EV3TouchSensor' ) {
                        setTouchSensor(val);
                    }
                    else if ( val.sensorType === 'lejos.hardware.sensor.EV3UltrasonicSensor' ) {
                        setUltrasonicSensor(val);
                    }
                }
                else if ( key === 'robot') {
                    setBatteryLevel(val.ev3.power);
                }
            }, function (key) {
                console.log("bot " + robotClientId + " left");
                //console.log("Delete:" + key);
            });

        }
        function setMotorInfo( key, val ) {
            needles[key].angle = val.position;
            if ( !val.stalled ) {
                dials[ key ].animations.play('pluggedIn');
            }
            else if ( val.stalled ) {
                dials[ key ].animations.play('stalled');
            }
        }
        function setTouchSensor( val ) {
            //console.log("touchSensor " + JSON.stringify(val));
            if( val.values[0] === 1 ) {
                touch.t1 = game.time.time;
                touchIndicator.animations.play('pressed');
                game.world.remove(touch.countDisplay);
                touch.count++;
                var countDisplay = touch.count.toString();
                if ( countDisplay.length > 7 ) {
                    countDisplay = countDisplay.slice(countDisplay.length-7, countDisplay.length);
                }
                touch.countDisplay = game.add.text(positionTouch.x+198, positionTouch.y+29+browserFix, countDisplay, textStyles.data);
                channel.getKeyspace(botId).put('touchDash', { 'touchCount' : touch.count, 'touchTime' : touch.time });
            }
            else {
                t2 = game.time.time;
                touch.time = touch.time + (t2 - touch.t1)/1000; // current total touch time plus delta t (in seconds)
                game.world.remove(touch.timeDisplay);
                var timeDisplay = (touch.time.toFixed(2)).toString();
                if ( timeDisplay.length > 8 ) {
                    timeDisplay = touch.time.toFixed(1).toString();
                    if ( timeDisplay.length > 8 ) {
                        timeDisplay = touch.time.toFixed(0).toString();
                        if ( timeDisplay.length > 8 ) {
                            timeDisplay = timeDisplay.slice(0, 8);
                        }
                    }
                } 
                touch.timeDisplay = game.add.text(positionTouch.x+132, positionTouch.y+54+browserFix, timeDisplay, textStyles.data); 
                channel.getKeyspace(botId).put('touchDash', { 'touchCount' : touch.count, 'touchTime' : touch.time });                
                touchIndicator.animations.play('up');
            }
        }
        function setColorSensor( val ) {
            if (val.mode === "ColorID") {
                var colorNameDisplay;
                game.world.remove(color.nameDisplay);
                switch ( val.values[ 0 ] ) {
                    case 0:
                        colorNameDisplay = "Red";
                        colorDisplay.animations.play(0);
                        break;
                    case 1:
                        colorNameDisplay = "Green";
                        colorDisplay.animations.play(1);
                        break;
                    case 2:
                        colorNameDisplay = "Blue";
                        colorDisplay.animations.play(2);
                        break;
                    case 3:
                        colorNameDisplay = "Yellow";
                        colorDisplay.animations.play(3);
                        break;
                    case 4:
                        colorNameDisplay = "Magenta";
                        colorDisplay.animations.play(4);
                        break;
                    case 5:
                        colorNameDisplay = "Orange";
                        colorDisplay.animations.play(5);
                        break;
                    case 6:
                        colorNameDisplay = "White";
                        colorDisplay.animations.play(6);
                        break;
                    case 7:
                        colorNameDisplay = "Black";
                        colorDisplay.animations.play(7);
                        break;
                    case 8:
                        colorNameDisplay = "Pink";
                        colorDisplay.animations.play(8);
                        break;
                    case 9:
                        colorNameDisplay = "Gray";
                        colorDisplay.animations.play(9);
                        break;
                    case 10:
                        colorNameDisplay = "Light Gray";
                        colorDisplay.animations.play(10);
                        break;
                    case 11:
                        colorNameDisplay = "Dark Gray";
                        colorDisplay.animations.play(11);
                        break;
                    case 12:
                        colorNameDisplay = "Cyan";
                        colorDisplay.animations.play(12);
                        break;
                    case 13:
                        colorNameDisplay = "Brown";
                        colorDisplay.animations.play(13);
                        break;
                    default:
                        colorNameDisplay = "N/A";
                        colorDisplay.animations.play(14);
                        break;
                    }
                color.nameDisplay = game.add.text(positionColor.x + 182, positionColor.y+29+browserFix,colorNameDisplay, textStyles.data);
            } 
            else if (val.mode === "RGB") {
                game.world.remove(color.rgbDisplay)
                color.r = val.values[0];
                color.g = val.values[1];
                color.b = val.values[2];
                var rgbDisplay = "(" + color.r.toFixed(0) + ", " + color.g.toFixed(0) + ", " + color.b.toFixed(0) + ")";
                color.rgbDisplay = game.add.text(positionColor.x+47, positionColor.y+54+browserFix, rgbDisplay, textStyles.data);
            }
            else if (val.mode === "Ambient") {
                game.world.remove(color.lightIntensityDisplay)
                color.lightIntensity = val.values[0];
                color.lightIntensityDisplay = game.add.text(positionColor.x+101, positionColor.y+29+browserFix, color.lightIntensity, textStyles.data);
            }
            else if (val.mode === "Red") {
                //
            }
        }
        function setIRSensor( val ) {
            game.world.remove(IR.IRDistDisplay);
            IRDist = val.values[0];
            IRDistDisplay = IRDist;
            IR.IRDistDisplay = game.add.text(positionIR.x+70, positionIR.y+29+browserFix, IRDistDisplay.toFixed(2), textStyles.data);
        }
        function setUltrasonicSensor( val ) {
            ultrasonicDist = val.values[0];
            game.world.remove(ultrasonic.ultrasonicDistDisplay);
            ultrasonicDistDisplay = ultrasonicDist;
            ultrasonic.ultrasonicDistDisplay = game.add.text(positionUltrasonic.x+70, positionUltrasonic.y+29+browserFix, ultrasonicDistDisplay.toFixed(2), textStyles.data);
        }
        function setBatteryLevel( val ) {
            battery.level = (val.voltage - 5) / (9 - 5); //9 V battery (6 AAs), and the robot dies around 5V
            game.world.remove( battery.levelDisplay );
            battery.levelDisplay = game.add.text( positionSystem.x+216, positionSystem.y+61+browserFix, Math.round(battery.level * 100) + " %", textStyles.status );
            if ( battery.level <= 0.15 ) { // for almost-dead battery!
                if( battery.level > -0.01 ) { //lower boundary limit, with a little safety net for inaccuracy/error
                    batteryLevelFill.destroy();
                    batteryLevelFill = game.add.graphics(0,0);
                    batteryLevelFill.beginFill(0xFF0000, 1); // make the fill red!
                    batteryLevelFill.drawRect(positionSystem.x+207, positionSystem.y+37, Math.round(battery.level*50), 16);
                }
                else if ( battery.level <= -0.01 ) { //protection against errors
                    batteryLevelFill.destroy();
                }
            }
            else if ( battery.level <= 1.01 ) { //upper boundary limit, with a little safety net for inaccuracy/error
                if( battery.level > 0.1 ) { //lower boundary limit
                    batteryLevelFill.destroy();
                    batteryLevelFill = game.add.graphics(0,0);
                    batteryLevelFill.beginFill(0x808080, 1); // make fill grey
                    batteryLevelFill.drawRect(positionSystem.x+207, positionSystem.y+37, Math.round(battery.level*50), 16);
                }
            }
            else if ( battery.level > 1.01 ) { //protection against errors
                batteryLevelFill.destroy();
                batteryLevelFill = game.add.graphics(0,0);
                batteryLevelFill.beginFill(0x808080, 1); // make fill grey
                batteryLevelFill.drawRect(positionSystem.x+207, positionSystem.y+37, 50, 16);
            }
            channel.getKeyspace(botId).put('batteryDash', { 'batteryLevel' : battery.level });
        }
        /* Initialization of touch sensor display and battery display on dashboard */
        getInitialTouchData = function( robotClientId ) {
            var touchData = channel.getKeyspace(botId).get('touchDash'); // get the current touch count
            setInitialTouchData('touchDash', touchData);
        }
        function setInitialTouchData( key, val ) {
            game.world.remove(touch.countDisplay);
            game.world.remove(touch.timeDisplay);
            if ( typeof(val) !== "undefined" ) {
                touch.count = val.touchCount;
                var countDisplay = touch.count.toString();
                if ( countDisplay.length > 7 ) {
                    countDisplay = countDisplay.slice(countDisplay.length-7, countDisplay.length);
                }
                touch.countDisplay = game.add.text(positionTouch.x+198, positionTouch.y+29+browserFix, countDisplay, textStyles.data);
                touch.time = val.touchTime;
                var timeDisplay = (touch.time.toFixed(2)).toString();
                if ( timeDisplay.length > 8 ) {
                    timeDisplay = touch.time.toFixed(1).toString();
                    if ( timeDisplay.length > 8 ) {
                        timeDisplay = touch.time.toFixed(0).toString();
                        if ( timeDisplay.length > 8 ) {
                            timeDisplay = timeDisplay.slice(0, 8);
                        }
                    }
                } 
                touch.timeDisplay = game.add.text(positionTouch.x+132, positionTouch.y+54+browserFix, timeDisplay, textStyles.data);                
            }
            console.log("initial touch count set to " + touch.count + " and total time pressed to " + touch.time);
        }
        getInitialBatteryLevel = function( robotClientId ) {
            var batteryLevelData = channel.getKeyspace(botId).get('batteryDash'); // get the current battery level, before occassional updates
            setInitialBatteryLevel('batteryDash', batteryLevelData);
        }
        setInitialBatteryLevel = function( key, val ) { // set the current battery level if it exists (it's been calculated in a dashboard somewhere)
            if ( typeof val !== 'undefined' ) {
                battery.level = val.batteryLevel;
                game.world.remove( battery.levelDisplay );
                battery.levelDisplay = game.add.text( positionSystem.x+216, positionSystem.y+61+browserFix, Math.round(battery.level * 100) + " %", textStyles.status );
                if (battery.level <= 0.15) { // for almost-dead battery!
                    if(battery.level > -0.01) { //lower boundary limit, with a little safety net for inaccuracy/error
                        batteryLevelFill.destroy();
                        batteryLevelFill = game.add.graphics(0,0);
                        batteryLevelFill.beginFill(0xFF0000, 1); // make the fill red!
                        batteryLevelFill.drawRect(positionSystem.x+207, positionSystem.y+37, Math.round(battery.level*50), 16);
                    }
                    else if ( battery.level <= -0.01 ) { //protection against errors
                        batteryLevelFill.destroy();
                    }
                }
                else if (battery.level <= 1.01) { //upper boundary limit, with a little safety net for inaccuracy/error
                    if(battery.level > 0.1) { //lower boundary limit
                        batteryLevelFill.destroy();
                        batteryLevelFill = game.add.graphics(0,0);
                        batteryLevelFill.beginFill(0x808080, 1); // make fill grey
                        batteryLevelFill.drawRect(positionSystem.x+207, positionSystem.y+37, Math.round(battery.level*50), 16);
                    }
                }
                else if ( battery.level > 1.01 ) { //protection against errors
                    batteryLevelFill.destroy();
                    batteryLevelFill = game.add.graphics(0,0);
                    batteryLevelFill.beginFill(0x808080, 1); // make fill grey
                    batteryLevelFill.drawRect(positionSystem.x+207, positionSystem.y+37, 50, 16);
                }
            }
        }
        setSensorIDs = function() {
            var botData = channel.getKeyspace(botId).get('robot');
            if ( typeof botData !== "undefined" ) {
                for ( var s in botData.ev3.sensors ) {
                    if ( botData.ev3.sensors[ s ].sensorType === 'lejos.hardware.sensor.EV3IRSensor' ) {
                        game.world.remove(sensorIDLabels.IR);
                        sensorIDLabels.IR = game.add.text(positionIR.x+frames['IR'].width-25, positionIR.y+1+browserFix, s, textStyles.status );
                        if ( typeof sensorOverlays.IR !== "undefined" ) sensorOverlays.IR.destroy();
                    }
                    else if ( botData.ev3.sensors[ s ].sensorType === 'lejos.hardware.sensor.EV3TouchSensor' ) {
                        game.world.remove(sensorIDLabels.touch);
                        sensorIDLabels.touch = game.add.text(positionTouch.x+frames['touch'].width-25, positionTouch.y+1+browserFix, s, textStyles.status );
                        if ( typeof sensorOverlays.touch !== "undefined" ) sensorOverlays.touch.destroy();
                    }
                    else if ( botData.ev3.sensors[ s ].sensorType === 'lejos.hardware.sensor.EV3ColorSensor' ) {
                        game.world.remove(sensorIDLabels.color);
                        sensorIDLabels.color = game.add.text(positionColor.x+frames['color'].width-25, positionColor.y+1+browserFix, s, textStyles.status );          
                        if ( typeof sensorOverlays.color !== "undefined" ) sensorOverlays.color.destroy();
                    }
                    else if ( botData.ev3.sensors[ s ].sensorType === 'lejos.hardware.sensor.EV3UltrasonicSensor' ) {
                        game.world.remove(sensorIDLabels.ultrasonic);
                        sensorIDLabels.ultrasonic = game.add.text(positionUltrasonic.x+frames['ultrasonic'].width-25, positionUltrasonic.y+1+browserFix, s, textStyles.status );
                        if ( typeof sensorOverlays.ultrasonic !== "undefined" ) sensorOverlays.ultrasonic.destroy();
                    }
                }
            }
            //console.dir(sensorIDLabels);
            for ( var n in sensorIDLabels ) {
                if ( sensorIDLabels[ n ] === "" ) { //sensor must not be connected or available
                    if ( n === 'IR') {
                        if ( typeof sensorOverlays.IR === "undefined" ) {
                            sensorOverlays.IR = game.add.graphics(0,0);
                            sensorOverlays.IR.beginFill(0x00000,0.45);
                            sensorOverlays.IR.drawRect(positionIR.x+1, positionIR.y+1, frames[ 'IR' ].width-2, frames[ 'IR' ].height-2 );
                        }
                    }
                    else if ( n === 'touch') {
                        if ( typeof sensorOverlays.touch === "undefined" ) {
                            sensorOverlays.touch = game.add.graphics(0,0);
                            sensorOverlays.touch.beginFill(0x00000,0.45);
                            sensorOverlays.touch.drawRect(positionTouch.x+1, positionTouch.y+1, frames[ 'touch' ].width-2, frames[ 'touch' ].height-2 );
                        }
                    }
                    else if ( n === 'color') {
                        if ( typeof sensorOverlays.color === "undefined" ) {
                            sensorOverlays.color = game.add.graphics(0,0);
                            sensorOverlays.color.beginFill(0x00000,0.45);
                            sensorOverlays.color.drawRect(positionColor.x+1, positionColor.y+1, frames[ 'color' ].width-2, frames[ 'color' ].height-2 );
                        }
                    }
                    else if ( n === 'ultrasonic') {
                        if ( typeof sensorOverlays.ultrasonic === "undefined" ) {
                            sensorOverlays.ultrasonic = game.add.graphics(0,0);
                            sensorOverlays.ultrasonic.beginFill(0x00000,0.45);
                            sensorOverlays.ultrasonic.drawRect(positionUltrasonic.x+1, positionUltrasonic.y+1, frames[ 'ultrasonic' ].width-2, frames[ 'ultrasonic' ].height-2 );
                        }
                    }
                }
            }
            //console.dir(sensorOverlays);
        }
        setInitialDashboardSettings = function( robotClientId ) { // if the bot has just been connected and has no dashboard settings in its keyspace
            var dashMotorA = channel.getKeyspace(robotClientId).get('aDash');
            if ( typeof dashMotorA === 'undefined' ) { // if this is undefined, that will mean that the bot is just being accessed for the first time, so it doesn't have any dashboard settings in each keyspace.
                console.log("initializing keyspace and dashboard settings for the newly connected bot...");
                channel.getKeyspace(botId).put('touchDash', { 'touchCount' : 0, 'touchTime' : 0 });                
                channel.getKeyspace(botId).put('batteryDash', { 'batteryLevel' : 0 });
                for ( var m in motors ) {
                    var dashKey = m + 'Dash';
                    channel.getKeyspace(botId).put( dashKey, { 'speed': 0, 'direction': "stopped", 'directionSwapped': false }); //dashboard settings
                    channel.getKeyspace(botId).put(m, { 'port': m, 'position': 0, 'stalled': false, 'moving': false }); //robot data
                }
                for ( var g in gangs ) {
                    var dashKey = g + 'Dash';
                    var initialChannelData = {
                        'speed' : 0,
                        'direction' : "stopped"
                    }
                    for ( var k in motors ) {
                        initialChannelData[ k ] = false;
                    }
                    channel.getKeyspace(botId).put( dashKey, initialChannelData );
                }
            }
        }
        displayName = function( robotName ) {
            game.world.remove( bot.nameDisplay );
            if ( robotName.length > 15 ) var botNameDisplay = robotName.slice(0, 15);
            else var botNameDisplay = robotName;
            bot.nameDisplay = game.add.text(positionSystem.x+145-botNameDisplay.length*60/16, positionSystem.y+61+browserFix, botNameDisplay, textStyles.status);
        }
      //==============================================================================================================================
        function preload() {
            game.load.spritesheet('forwardButton','assets/buttons/forward_button_spritesheet.png', 89, 45);
            game.load.spritesheet('reverseButton','assets/buttons/reverse_button_spritesheet.png', 89, 45);
            game.load.spritesheet('checkbox','assets/buttons/checkbox_spritesheet.png', 24, 23);
            game.load.spritesheet('minusButton','assets/buttons/minus_button_spritesheet.png', 44, 44);
            game.load.spritesheet('plusButton','assets/buttons/plus_button_spritesheet.png', 44, 44);
            game.load.spritesheet('touchIndicator','assets/touch_sensor_spritesheet.png', 21, 21);
            game.load.spritesheet('statusButton','assets/buttons/status_button_spritesheet.png', 76, 32);
            game.load.spritesheet('dialFace','assets/dial_face_spritesheet.png', 52, 52);
            game.load.spritesheet('screenInputButton', 'assets/buttons/lcd_screen_input_button_spritesheet.png', 56, 32);
            game.load.spritesheet('colorOutput', 'assets/color_output_spritesheet.png', 59, 20);
            game.load.image('sliderBar','assets/buttons/slider_bar.png', 72, 24);
            game.load.image('sliderBar2','assets/buttons/slider_bar_2.png', 72, 24);
            game.load.image('needle','assets/needle.png', 5, 26);
            game.load.image('resume','assets/resume_message.png',502,49);
            game.load.image('sliderIncrements','assets/slider_increments.png',52,156);
            game.load.image('batteryOutline','assets/battery_outline.png',60,22);
            game.load.image('testingButton','assets/buttons/testing_button.png',70,32);
            game.load.image('motorBar','assets/motor_bar.png',273,23);
            game.load.image('gangBar','assets/gang_bar.png',273,23);
            game.load.image('sensorBar','assets/sensor_bar.png',273,23);
            game.load.image('dividerLine','assets/divider_line.png',144,1);
            game.load.image('dividerLine2','assets/divider_line_2.png',261,22);
            game.load.image('dividerPair','assets/divider_pair.png',99,24);
        } //end preload
      //==============================================================================================================================
        function create() {          
            updateBar(100, $("#progressBar")); 
            this.game.stage.disableVisibilityChange = true;
            game.input.keyboard.disabled = false;
            // game.world.setBounds(0, 0, canvasWidth, canvasHeight);
            game.input.onDown.add(function () {
                if ( this.game.paused ) {
                    this.game.paused = false;
                    dashboardStatus = 1;
                    game.world.remove(status.statusDisplay);
                    status.statusDisplay = game.add.text(positionSystem.x+12, positionSystem.y+61+browserFix, "running...", textStyles.status);
                    statusButton.setFrames(1,0,0,0);
                    resume.resumeMessageDisplay.destroy();
                    resume.resumeOverlay.destroy();
                    botIndex--; // //this is part of a little hack, to resume the channel.getKeyspace.onValue function after we resume, so we don't update anything (like we do to deal with selecting the same bot multiple times)
                }
            }, this);

          /* Frames */
            frames[ 'system' ] = new Frame( game, 'system', positionSystem.x, positionSystem.y, 275, 86);
            frames[ 'touch' ] = new Frame( game, 'touch', positionTouch.x, positionTouch.y, 275, 86);
            frames[ 'color' ] = new Frame( game, 'color', positionColor.x, positionColor.y, 275, 88);
            frames[ 'IR' ] = new Frame( game, 'IR', positionIR.x, positionIR.y, 275, 60);
            frames[ 'ultrasonic' ] = new Frame( game, 'ultrasonic', positionUltrasonic.x, positionUltrasonic.y, 275, 60);
            frames[ 'screen' ] = new Frame( game, 'screen', positionScreen.x, positionScreen.y, 275, 99);

          /* Top Bars */
            topBars[ 'system' ] = game.add.sprite( positionSystem.x+1, positionSystem.y+1,'sensorBar');
            topBars[ 'touch' ] = game.add.sprite( positionTouch.x+1, positionTouch.y+1,'sensorBar');
            topBars[ 'color' ] = game.add.sprite( positionColor.x+1, positionColor.y+1,'sensorBar');
            topBars[ 'IR' ] = game.add.sprite( positionIR.x+1, positionIR.y+1,'sensorBar');
            topBars[ 'ultrasonic' ] = game.add.sprite( positionUltrasonic.x+1, positionUltrasonic.y+1,'sensorBar');
            topBars[ 'screen' ] = game.add.sprite( positionScreen.x+1, positionScreen.y+1,'sensorBar');

          /* Labels */
            labelSystem = game.add.text(positionSystem.x+8, positionSystem.y+1+browserFix, "System", textStyles.title);

            status.statusDisplay =  game.add.text(positionSystem.x+12, positionSystem.y+61+browserFix, "running...", textStyles.status);

            var botLabelivider = game.add.sprite(positionSystem.x+95,positionSystem.y+33,'dividerPair');
            var botLabel = game.add.text(positionSystem.x+98, positionSystem.y+36+browserFix,"Controlling bot:", { font: "13px Open Sans, Helvetica, Trebuchet MS, Arial, sans-serif", fill: "#bcbcbc" } );
            if ( botId === '' ) bot.nameDisplay = game.add.text(positionSystem.x+91, positionSystem.y+62+browserFix, "No robot selected ", textStyles.selectBot);
            else { 
                displayName( botName );
            }

            battery.levelDisplay = game.add.text( positionSystem.x+216, positionSystem.y+61, Math.round(battery.level * 100) + " %", textStyles.status );

            labelTouch = game.add.text(positionTouch.x+8, positionTouch.y+1+browserFix, "Touch Sensor", textStyles.title);
            labelTouched = game.add.text(positionTouch.x+12, positionTouch.y+32+browserFix, "Touched", textStyles.label);
            labelTouchCount = game.add.text(positionTouch.x+108, positionTouch.y+32+browserFix, "Total Touches:", textStyles.label); // there is room for 4 characters, so 0 to 9,999. No touching more than that!
            labelTouchTime = game.add.text(positionTouch.x+12, positionTouch.y+57+browserFix, "Total Time Pressed:", textStyles.label);
            labelTouchTimeUnits = game.add.text(positionTouch.x+210, positionTouch.y+57+browserFix, "seconds", textStyles.label);

            labelColor = game.add.text(positionColor.x+8, positionColor.y+1+browserFix, "Color Sensor", textStyles.title);
            labelColorRGB = game.add.text(positionColor.x+12, positionColor.y+57+browserFix, "RGB:", textStyles.label);
            labelColorName = game.add.text(positionColor.x+138, positionColor.y+32+browserFix, "Color:", textStyles.label);
            labelIntensity = game.add.text(positionColor.x+12, positionColor.y+32+browserFix, "Light Intensity:", textStyles.label);

            labelIR = game.add.text(positionIR.x+8, positionIR.y+1+browserFix, "Infrared Sensor", textStyles.title);
            labelIRDist = game.add.text(positionIR.x+12, positionIR.y+32+browserFix, "Distance:", textStyles.label);
            labelIRUnits = game.add.text(positionIR.x+128, positionIR.y+32+browserFix, "cm", textStyles.label);

            labelUltrasonic = game.add.text(positionUltrasonic.x+8+browserFix, positionUltrasonic.y+1+browserFix, "Ultrasonic Sensor", textStyles.title);
            labelUltrasonicDist = game.add.text(positionUltrasonic.x+12+browserFix, positionUltrasonic.y+32+browserFix, "Distance:", textStyles.label);
            labelUltrasonicUnits = game.add.text(positionUltrasonic.x+128+browserFix, positionUltrasonic.y+32+browserFix, "cm", textStyles.label);
            
            labelScreen = game.add.text(positionScreen.x+8, positionScreen.y+1+browserFix, "LCD Screen", textStyles.title);

          /* Dashboard stop/resume button */
            statusButton = game.add.button(positionSystem.x+10, positionSystem.y+33, 'statusButton', actionStopOnClick);
            statusButton.setFrames(1,0,0,0);
            statusButton.input.useHandCursor = true;
          /* Touch Sensor */
            touchIndicator = game.add.sprite(positionTouch.x+68, positionTouch.y+30, 'touchIndicator');
            touchIndicator.animations.add('up', [0], 1);
            touchIndicator.animations.add('pressed', [1], 1);
            touchIndicator.animations.play('up');
          /* Color Sensor */        
            colorDisplay = game.add.sprite( positionColor.x+179, positionColor.y+57, 'colorOutput' );
            for (var i = 0; i<=14; i++) {
                colorDisplay.animations.add(i,[i],1);
            }
            colorDisplay.animations.play(14);
          /* Battery Level Sensor */
            batteryLevelOutline = game.add.sprite(positionSystem.x+204, positionSystem.y+34, 'batteryOutline');
            batteryLevelFill = game.add.graphics(0,0);
            batteryLevelFill.beginFill(0x808080, 1);
            batteryLevelFill.drawRect(positionSystem.x+207, positionSystem.y+37, Math.round(battery.level*50), 16); // the "x50" converts the battery level (whatever it initially is) to the scale of 50 px wide
          /* LCD Screen */
            LCDScreenBox = game.add.graphics(0,0);
            LCDScreenBox.beginFill(0x808080, 0.6);
            LCDScreenBox.lineStyle(2, 0xa3a3a3, 1);
            LCDScreenBox.drawRect(positionScreen.x+10, positionScreen.y+32, 190, 57);
            screenInputButton = game.add.button(positionScreen.x+210, positionScreen.y+31, 'screenInputButton', actionInputMessageOnClick);
            screenInputButton.setFrames(1,0,2,0);
            screenInputButton.input.useHandCursor = true;
            displayOnLCDScreen( "Display a message on the  Gigabots's LCD screen..." );

          /* Create Motors */
            for ( var i = 1; i <= numMotors; i++ ) {
                var motorPort = letters[i];
                motors[ motorPort ] = new Motor( game, motorPort );
                var positionX = positionMotors[ motorPort ].x;
                var positionY = positionMotors[ motorPort ].y;
                frames[ motorPort ] = new Frame( game, motorPort, positionX, positionY, 275, motorHeight );
                topBars[ motorPort ] = game.add.sprite( positionX+1, positionY+1,'motorBar');
                labelMotors[ motorPort ] = game.add.text( positionX+8, positionY+1+browserFix, motors[ letters[i] ].name, textStyles.title );
                dials[ motorPort ] = new RotationDial( game, motorPort , numbers[ motorPort ] );               
                dials[ motorPort ].animations.play('pluggedIn');
                needles[ motorPort ] = new RotationNeedle( game, motorPort , numbers[ motorPort ] );
                dividers[ motorPort ] = game.add.sprite( positionX+7, positionY+93, 'dividerLine' );
                sliderTracks[ motorPort] = game.add.sprite( positionX+170, positionY+39, 'sliderIncrements' );
                for ( var k = 0; k <= 7; k++ ) {
                    var speedLabel = 100 * k + "";
                    sliderSpeedIncrements[ motorPort ] = game.add.text( positionX+243, positionY+185-22*k+browserFix, speedLabel, textStyles.label );
                }
                sliderSpeedLabels[ motorPort ] = game.add.text( positionX+160, positionY+206+browserFix, "Speed (\xB0/sec)", textStyles.label );
                currentSpeedLabels[ motorPort ] = game.add.text( positionX+69, positionY+38+browserFix, "Current Speed", textStyles.label );
                directionConfigLabels[ motorPort ] = game.add.text(positionX+37, positionY+206+browserFix, "Swap Directions", textStyles.label );
                forwardButtons[ motorPort ] = new ForwardButton( game, motorPort );
                reverseButtons[ motorPort ] = new ReverseButton( game, motorPort );
                motorPlusButtons[ motorPort ] = new MotorPlusButton( game, motorPort );
                motorMinusButtons[ motorPort ] = new MotorMinusButton( game, motorPort );
                sliderBars[ motorPort ] = new SliderBar( game, motorPort );
                directionChecks[ motorPort ] = new DirectionCheckbox( game, motorPort );
            }
          /* Create Gangs */
            for ( var i = 1; i <= numGangs; i++ ) {
                gangs[ i ] = new Gang( game, i );
                var positionX = positionGangs[ i ].x;
                var positionY = positionGangs[ i ].y;
                frames[ i ] = new Frame( game, i, positionX, positionY, 275, gangHeightMin + numCheckboxRows * 28);
                topBars[ i ] = game.add.sprite( positionX+1, positionY+1,'gangBar');                
                dividers[ i + 'a' ] = game.add.sprite( positionX+7, positionY+58, 'dividerLine' );
                dividers[ i + 'b' ] = game.add.sprite( positionX+7, positionY+204, 'dividerLine2' );
                gangLabels[ i ] = game.add.text( positionX+8, positionY+1+browserFix, gangs[ i ].name, textStyles.title );
                sliderTracks[ i ] = game.add.sprite( positionX+170, positionY+39, 'sliderIncrements' );                
                sliderSpeedIncrements[ i ] = {}
                for ( var k = 0; k <= 7; k++ ) {
                    var speedLabel = 100 * k + "";
                    sliderSpeedIncrements[ i ][ k ] = game.add.text( positionX+243, positionY+185-22*k+browserFix, speedLabel, textStyles.label );
                }
                sliderSpeedLabels[ i ] = game.add.text( positionX+160, positionY+206+browserFix, "Speed (\xB0/sec)", textStyles.label );
                currentSpeedLabels[ i ] = game.add.text( positionX+12, positionY+33+browserFix, "Current Speed", textStyles.label );
                directionsNote[ i ] = game.add.text(positionX+11, positionY+166+browserFix, "*Forward and Reverse\n directions are relative", textStyles.note), 
                gangForwardButtons[ i ] = new GangForwardButton( game, i );
                gangReverseButtons[ i ] = new GangReverseButton( game, i );
                gangPlusButtons[ i ] = new GangPlusButton( game, i );
                gangMinusButtons[ i ] = new GangMinusButton( game, i );
                gangSliderBars[ i ] = new GangSliderBar( game, i );
                gangCheckboxes[ i ] = new GangCheckbox( game, i );
                gangMotorLabels[ i ] = new GangMotorLabel( game, i );
                gangMotorLabels[ i ][ 'motors' ] = game.add.text( positionX+12, positionY+207+browserFix, "Motors Selected", textStyles.label );
                // arrange checkboxes:
                if ( numMotors <= 6 ) {
                    var spacing = Math.ceil( frames[ i ].width / ( numMotors + 1 ) );
                    for ( var j = 1; j <= numMotors; j++ ) {
                        gangCheckboxes[ i ][ letters[j] ] = new MotorCheckbox( game, i, letters[j], positionX + Math.floor( spacing/2 ) + (j-1) * spacing, positionY + gangHeightMin );
                        gangMotorLabels[ i ][ letters[j] ] = game.add.text( gangCheckboxes[i][ letters[j] ].x + 26, gangCheckboxes[i][ letters[j] ].y + 2 + browserFix, letters[j].toUpperCase(), textStyles.label );
                    }
                }
                if ( numMotors > 6 ) {
                    var checkboxRow = {}
                    var numMotorsAdded = 0;
                    for ( var k = 1; k <= numCheckboxRows; k++ ) {
                        if ( k === 1 ) {
                            checkboxRow[ k ] = Math.ceil( numMotors / numCheckboxRows )
                            checkboxRow[ k + 'spacing' ] = Math.ceil( frames[ i ].width / ( checkboxRow[ k ] + 1 ) );
                            for ( var j = 1; j <= checkboxRow[ k ]; j++ ) {
                                gangCheckboxes[ i ][ letters[j] ] = new MotorCheckbox( game, i, letters[j], positionX + Math.floor( checkboxRow[ k + 'spacing' ] / 2 ) + (j-1) * checkboxRow[ k + 'spacing' ], positionY + 203 + k * 28 );
                                gangMotorLabels[ i ][ letters[j] ] = game.add.text( gangCheckboxes[i][ letters[j] ].x + 26, gangCheckboxes[i][ letters[j] ].y + 2 + browserFix, letters[j].toUpperCase(), textStyles.label );
                            }
                            numMotorsAdded += checkboxRow[ k ];
                        } 
                        else {
                            checkboxRow[ k ] = Math.ceil( ( numMotors - numMotorsAdded ) / ( numCheckboxRows - ( k - 1 ) ) );
                            checkboxRow[ k + 'spacing' ] = Math.ceil( frames[ i ].width / ( checkboxRow[ k ] + 1 ) );
                            for ( var j = numMotorsAdded + 1; j <= numMotorsAdded + checkboxRow[ k ]; j++ ) {
                                gangCheckboxes[ i ][ letters[j] ] = new MotorCheckbox( game, i, letters[j], positionX + Math.floor( checkboxRow[ k + 'spacing' ] / 2 ) + (j-1-numMotorsAdded) * checkboxRow[ k + 'spacing' ], positionY + 203 + k * 28 );
                                gangMotorLabels[ i ][ letters[j] ] = game.add.text( gangCheckboxes[i][ letters[j] ].x + 26, gangCheckboxes[i][ letters[j] ].y + 2 + browserFix, letters[j].toUpperCase(), textStyles.label );
                            }
                            numMotorsAdded += checkboxRow[ k ];
                        }
                    }
                }    
            }

            /* Add keyboard inputs to control up to 9 motors and 3 gangs, as an alternative when using a desktop */
            // Motor forward: Q, W, E, R, T, Y, U, I, & O; Motor reverse: A, S, D, F, G, H, J, K, & L
            // Gang forward: Z, X, & C; Gang reverse: B, N, & M 
            var keyboardControls = {
                'f' : {},
                'r' : {}
            }
            var keyboardKeys1 = { 'a':'Q', 'b':'W', 'c':'E', 'd':'R', 'e':'T', 'f':'Y', 'g':'U', 'h':'I', 'i':'O' }
            var keyboardKeys2 = { 'a':'A', 'b':'S', 'c':'D', 'd':'F', 'e':'G', 'f':'H', 'g':'J', 'h':'K', 'i':'L' }
            var keyboardKeys3 = { 1:'Z', 2:'X', 3:'C' }
            var keyboardKeys4 = { 1:'B', 2:'N', 3:'M' }
            for ( k in motors ) {
                if ( numbers[ k ] <= 9 ) {
                    keyboardControls[ 'f' ][ k ] = this.input.keyboard.addKey( Phaser.Keyboard[ keyboardKeys1[ k ] ] ); // forward
                    keyboardControls[ 'f' ][ k ].onDown.add( forwardDirectionActionDown, motors[ k ] ); // start motor on key down
                    keyboardControls[ 'f' ][ k ].onUp.add( forwardDirectionActionUp, motors[ k ] ); // stop motor on key up
                    keyboardControls[ 'r' ][ k ] = this.input.keyboard.addKey( Phaser.Keyboard[ keyboardKeys2[ k ] ] ); // reverse
                    keyboardControls[ 'r' ][ k ].onDown.add( reverseDirectionActionDown, motors[ k ] );
                    keyboardControls[ 'r' ][ k ].onUp.add( reverseDirectionActionUp, motors[ k ] );
                }
            }
            for ( k in gangs ) {
                if ( k <= 3 ) {
                    keyboardControls[ 'f' ][ k ] = this.input.keyboard.addKey( Phaser.Keyboard[ keyboardKeys3[ k ] ] ); //forward
                    keyboardControls[ 'f' ][ k ].onDown.add( gangForwardDirectionActionDown, gangs[ k ] ); // start motor on key down
                    keyboardControls[ 'f' ][ k ].onUp.add( gangForwardDirectionActionUp, gangs[ k ] ); // stop motor on key up
                    keyboardControls[ 'r' ][ k ] = this.input.keyboard.addKey( Phaser.Keyboard[ keyboardKeys4[ k ] ] ); // reverse
                    keyboardControls[ 'r' ][ k ].onDown.add( gangReverseDirectionActionDown, gangs[ k ] );
                    keyboardControls[ 'r' ][ k ].onUp.add( gangReverseDirectionActionUp, gangs[ k ] );
                }
            }

          /* this button is for testing. it's invisible but it's placed above the battery level display */   
            getKeyspaceButton = game.add.button(positionSystem.x+203, positionSystem.y+28,'testingButton', actionGetKeyspace);

        } // end create 

        function configDirectionsActionDown () {
            var motorPort = this.port;
            directionChecks[ motorPort ].state = 'down';
            var temp = this.directionSwapped;
            if ( !this.directionSwapped ) {
                this.directionSwapped = true;
                directionChecks[ motorPort ].setFrames(1,1,1,1); //checked
            } 
            else {
                this.directionSwapped = false;
                directionChecks[ motorPort ].setFrames(2,0,1,0); //unchecked
            }
            //motors[ motorPort ].previousDirectionSwapped = motors[ motorPort ].directionSwapped;
            var dashKey = motorPort + 'Dash';
            var keyspaceData = channel.getKeyspace(botId).get(dashKey);
            if ( keyspaceData.direction !== "stopped" ) { // if the motor is currently moving, we need to make it move in the updated direction
                moveMotor( botId, motorPort, keyspaceData.direction, keyspaceData.speed, this.directionSwapped );
            }
            channel.getKeyspace(botId).put(dashKey, { 'speed': keyspaceData.speed, 'direction': keyspaceData.direction, 'directionSwapped': this.directionSwapped }); 
            //console.log("flipping directions for motor " + motorPort + " from " + temp + " to " + this.directionSwapped );
        }
        function configDirectionsActionUp () {
            directionChecks[ this.port ].state = 'up';
        }
        function increaseSpeedClickActionDown () {
            var motorPort = this.port;
            if ( motors[ motorPort ].speed <= 650 ) {
                motors[ motorPort ].speed += 50; // increase speed by 50 degrees/sec
                sliderBars[ motorPort ].y -= 11;
            }
            else {
                motors[ motorPort ].speed = 700; // just set the speed to the maximum
                sliderBars[ motorPort ].y = positionMotors[ motorPort ].y + 34;
            }
            var dashKey = motorPort + 'Dash'; // we're creating a string which will be the keyspace key for this motor's dashboard settings
            var keyspaceData = channel.getKeyspace(botId).get(dashKey);
            if ( keyspaceData.direction !== "stopped" ) { // if the motor is currently moving, we need to make it move at the updated speed
                moveMotor( botId, motorPort, keyspaceData.direction, motors[ motorPort ].speed, keyspaceData.directionSwapped );
            }
            channel.getKeyspace(botId).put(dashKey, { 'speed': motors[ motorPort ].speed, 'direction': keyspaceData.direction, 'directionSwapped': keyspaceData.directionSwapped }); 
            game.world.remove( motors[ motorPort ].currentSpeedDisplay );
            motors[ motorPort ].currentSpeedDisplay = game.add.text(positionMotors[motorPort].x+91, positionMotors[motorPort].y+59+browserFix, motors[ motorPort ].speed.toFixed(1), textStyles.data);
            //console.log("increasing motor " + motorPort + " speed to " + motors[ motorPort ].speed.toFixed(2) );
        }
        function decreaseSpeedClickActionDown () {
            var motorPort = this.port;
            if (motors[ motorPort ].speed >= 50) {
                motors[ motorPort ].speed -= 50;
                sliderBars[ motorPort ].y += 11;
            } else {
                motors[ motorPort ].speed = 0; // just set the speed to the minimum
                sliderBars[ motorPort ].y = positionMotors[ motorPort ].y + 188; 
            }
            var dashKey = motorPort + 'Dash'; 
            var keyspaceData = channel.getKeyspace(botId).get(dashKey);
            if ( keyspaceData.direction !== "stopped" ) { 
                moveMotor( botId, motorPort, keyspaceData.direction, motors[ motorPort ].speed, keyspaceData.directionSwapped );
            }
            channel.getKeyspace(botId).put(dashKey, { 'speed': motors[ motorPort ].speed, 'direction': keyspaceData.direction, 'directionSwapped': keyspaceData.directionSwapped }); 
            game.world.remove( motors[ motorPort ].currentSpeedDisplay );
            motors[ motorPort ].currentSpeedDisplay = game.add.text(positionMotors[motorPort].x+91, positionMotors[motorPort].y+59+browserFix, motors[ motorPort ].speed.toFixed(1), textStyles.data);
            //console.log("decreasing motor " + motorPort + " speed to " + motors[ motorPort ].speed.toFixed(2) );
        }
        function changeSpeedSlideActionDown () {
            var motorPort = this.port;
            //sliderBars[ motorPort ].state = 'down';
            motors[ motorPort ].previousSpeed = motors[ motorPort ].speed;
            // add something for changing the slider bar in realtime while the motor is moving (e.g. for smooth acceleration functionality)
            var dashKey = motorPort + 'Dash';
            var dashData = channel.getKeyspace(botId).get(dashKey);
            if ( dashData.direction !== "stopped" ) {
                //console.log('motor is moving');
                var motorPort = motorPort;
                liveSpeed = setInterval( function() { changeLiveSpeed(motorPort) }, 17 );
                grabHeight = game.input.mousePointer.y - sliderBars[ motorPort ].y;
            }
        }
        var liveSpeed, grabHeight;
        function changeLiveSpeed( motorPort ) {
            //console.log("adjusting while motor is moving...");
            sliderBars[ motorPort ].y = game.input.mousePointer.y - grabHeight;
            if ( sliderBars[ motorPort ].y < positionMotors[ motorPort ].y+34 ) { //set max speed boundary limit
                sliderBars[ motorPort ].y = positionMotors[ motorPort ].y+34;
            } else if ( sliderBars[motorPort].y > positionMotors[motorPort].y+188 ) { //set min speed boundary limit
                sliderBars[ motorPort ].y = positionMotors[ motorPort ].y+188;
            }
            motors[ motorPort ].speed = 700 + ( 700/154 ) * (positionMotors[motorPort].y + 34 - sliderBars[motorPort].y); // normalize speed over the range of y values on the slider track
            var dashKey = motorPort + 'Dash'; 
            var keyspaceData = channel.getKeyspace(botId).get(dashKey);
            if ( keyspaceData.direction !== "stopped" ) { 
                moveMotor( botId, motorPort, keyspaceData.direction, motors[ motorPort ].speed, keyspaceData.directionSwapped );
            }
            channel.getKeyspace(botId).put(dashKey, { 'speed': motors[ motorPort ].speed, 'direction': keyspaceData.direction, 'directionSwapped': keyspaceData.directionSwapped }); 
            game.world.remove( motors[ motorPort ].currentSpeedDisplay );
            motors[ motorPort ].currentSpeedDisplay = game.add.text(positionMotors[motorPort].x+91, positionMotors[motorPort].y+59+browserFix, motors[ motorPort ].speed.toFixed(1), textStyles.data);
            //console.log("changing speed of motor " + motorPort + " to " + motors[ motorPort ].speed.toFixed(2));
        }
        function changeSpeedSlideActionUp () {
            var motorPort = this.port;
            clearInterval(liveSpeed); // stop the live speed adjusting
            //sliderBars[ motorPort ].state = 'up';
            //we're sliding between positionMotors[ motorPort ].y + 13 px (0 deg/sec) and positionMotors[ motorPort ].y + 167px (700 deg/sec). These y coordinates are at the top of the slider bar, so the center goes from 362 to 202
            if ( sliderBars[ motorPort ].y < positionMotors[ motorPort ].y+34 ) { //set max speed boundary limit
                sliderBars[ motorPort ].y = positionMotors[ motorPort ].y+34;
            } else if ( sliderBars[motorPort].y > positionMotors[motorPort].y+188 ) { //set min speed boundary limit
                sliderBars[ motorPort ].y = positionMotors[ motorPort ].y+188;
            }
            motors[ motorPort ].speed = 700 + ( 700/154 ) * (positionMotors[motorPort].y + 34 - sliderBars[motorPort].y); // normalize speed over the range of y values on the slider track
            var dashKey = motorPort + 'Dash'; 
            var keyspaceData = channel.getKeyspace(botId).get(dashKey);
            if ( keyspaceData.direction !== "stopped" ) { 
                moveMotor( botId, motorPort, keyspaceData.direction, motors[ motorPort ].speed, keyspaceData.directionSwapped );
            }
            channel.getKeyspace(botId).put(dashKey, { 'speed': motors[ motorPort ].speed, 'direction': keyspaceData.direction, 'directionSwapped': keyspaceData.directionSwapped }); 
            game.world.remove( motors[ motorPort ].currentSpeedDisplay );
            motors[ motorPort ].currentSpeedDisplay = game.add.text(positionMotors[motorPort].x+91, positionMotors[motorPort].y+59+browserFix, motors[ motorPort ].speed.toFixed(1), textStyles.data);
            //console.log("changing speed of motor " + motorPort + " to " + motors[ motorPort ].speed.toFixed(2));
        }
        function forwardDirectionActionDown () {
            //console.log("move motor " + this.port + " forward"); 
            moveMotor( botId, this.port, "f", this.speed, this.directionSwapped );
            forwardButtons[this.port].setFrames(2,2,2,2); // show the forward button as down, in case keyboard button inputs were being used instead of clicking            
        }
        function forwardDirectionActionUp() {
            //console.log("stop motor " + this.port);
            stopMotor( botId, this.port ); 
            forwardButtons[this.port].setFrames(1,0,2,0); // show the forward button as up (normal position)
        }
        function reverseDirectionActionDown () {
            //console.log("move motor " + this.port + " in reverse"); 
            moveMotor( botId, this.port, "r", this.speed, this.directionSwapped );
            reverseButtons[this.port].setFrames(2,2,2,2); // show the reverse button as down, in case keyboard button inputs were being used instead of clicking            
        }
        function reverseDirectionActionUp() {
            //console.log("stop motor " + this.port);
            stopMotor( botId, this.port ); 
            reverseButtons[this.port].setFrames(1,0,2,0); // show the reverse button as up (normal position)
        }

        /* Gang controls */
        function increaseGangSpeedClickActionDown () {
            var id = this.gangId;
            if ( gangs[ id ].speed <= 650 ) {
                gangs[ id ].speed += 50; // increase speed by 50 degrees/sec
                gangSliderBars[ id ].y -= 11;
            }
            else {
                gangs[ id ].speed = 700; // just set the speed to the maximum
                gangSliderBars[ id ].y = positionGangs[ id ].y + 34;
            }
            var dashKey = id + 'Dash'; // we're creating a string which will be the keyspace key for this gang's dashboard settings
            var gangChannelData = {
                'speed' : gangs[ id ].speed,
                'direction' : gangs[ id ].direction
            }
            for ( var k in motors ) {
                gangChannelData[ k ] = gangs[ id ][ k ];
                if ( gangs[ id ].direction === "f" || gangs[ id ].direction === "r"  ) { // update the gang's motors speed if changed while the motors are moving
                    if ( gangChannelData[ k ] === true ) {
                        var dashMotorKey = k + 'Dash';
                        var keyspaceMotorData = channel.getKeyspace(botId).get(dashMotorKey);
                        moveMotor( botId, k, keyspaceMotorData.direction, gangs[ id ].speed, keyspaceMotorData.directionSwapped );
                    }
                }
            }
            channel.getKeyspace(botId).put( dashKey, gangChannelData ); 
            game.world.remove( gangs[ id ].currentSpeedDisplay );
            gangs[ id ].currentSpeedDisplay = game.add.text(positionGangs[id].x+103, positionGangs[id].y+30+browserFix, gangs[ id ].speed.toFixed(1), textStyles.data);
            //console.log("increasing gang " + id + " speed to " + gangs[ id ].speed.toFixed(2) );
        }
        function decreaseGangSpeedClickActionDown () {
            var id = this.gangId;
            if (gangs[ id ].speed >= 50) {
                gangs[ id ].speed -= 50;
                gangSliderBars[ id ].y += 11;
            } else {
                gangs[ id ].speed = 0; // just set the speed to the minimum
                gangSliderBars[ id ].y = positionGangs[ id ].y + 188; 
            }
            var dashKey = id + 'Dash'; 
            var gangChannelData = {
                'speed' : gangs[ id ].speed,
                'direction' : gangs[ id ].direction
            }
            for ( var k in motors ) {
                gangChannelData[ k ] = gangs[ id ][ k ];
                if ( gangs[ id ].direction === "f" || gangs[ id ].direction === "r" ) { 
                    if ( gangChannelData[ k ] === true ) {
                        var dashMotorKey = k + 'Dash';
                        var keyspaceMotorData = channel.getKeyspace(botId).get(dashMotorKey);
                        moveMotor( botId, k, keyspaceMotorData.direction, gangs[ id ].speed, keyspaceMotorData.directionSwapped );
                    }
                }
            }
            channel.getKeyspace(botId).put( dashKey, gangChannelData ); 
            game.world.remove( gangs[ id ].currentSpeedDisplay );
            gangs[ id ].currentSpeedDisplay = game.add.text(positionGangs[id].x+103, positionGangs[id].y+30+browserFix, gangs[ id ].speed.toFixed(1), textStyles.data);
            //console.log("decreasing gang " + id + " speed to " + gangs[ id ].speed.toFixed(2) );
        }
        function changeGangSpeedSlideActionDown () {
            var id = this.gangId;
            //gangSliderBars[ id ].state = 'down';
            gangs[ id ].previousSpeed = gangs[ id ].speed;
            // add something for changing the slider bar in realtime while the motor is moving (e.g. for smooth acceleration functionality)
            var dashKey = id + 'Dash';
            var dashData = channel.getKeyspace(botId).get(dashKey);
            if ( dashData.direction !== "stopped" ) {
                //console.log('motor is moving');
                var gangId = id;
                liveGangSpeed = setInterval( function() { changeLiveGangSpeed(gangId) }, 1000/60 );
                gangGrabHeight = game.input.mousePointer.y - gangSliderBars[ gangId ].y;
            }
        }
        var liveGangSpeed, gangGrabHeight;
        function changeLiveGangSpeed( gangId ) {
            //console.log("adjusting while gang's motors are moving...");
            gangSliderBars[ gangId ].y = game.input.mousePointer.y - gangGrabHeight;
            if ( gangSliderBars[ gangId ].y < positionGangs[ gangId ].y+34 ) { //set max speed boundary limit
                gangSliderBars[ gangId ].y = positionGangs[ gangId ].y+34;
            } else if ( gangSliderBars[ gangId].y > positionGangs[ gangId ].y+188 ) { //set min speed boundary limit
                gangSliderBars[ gangId ].y = positionGangs[ gangId ].y+188;
            }
            gangs[ gangId ].speed = 700 + ( 700/154 ) * (positionGangs[gangId].y + 34 - gangSliderBars[gangId].y); // normalize speed over the range of y values on the slider track
            var dashKey = gangId + 'Dash'; 
            var gangChannelData = {
                'speed' : gangs[ gangId ].speed,
                'direction' : gangs[ gangId ].direction
            }
            for ( var k in motors ) {
                gangChannelData[ k ] = gangs[ gangId ][ k ];
                if ( gangs[ gangId ].direction === "f" || gangs[ gangId ].direction === "r"  ) {
                    if ( gangChannelData[ k ] === true ) {
                        var dashMotorKey = k + 'Dash';
                        var keyspaceMotorData = channel.getKeyspace(botId).get(dashMotorKey);
                        moveMotor( botId, k, keyspaceMotorData.direction, gangs[ gangId ].speed, keyspaceMotorData.directionSwapped );
                    }
                }
            }
            channel.getKeyspace(botId).put( dashKey, gangChannelData ); 
            game.world.remove( gangs[ gangId ].currentSpeedDisplay );
            gangs[ gangId ].currentSpeedDisplay = game.add.text(positionGangs[gangId].x+103, positionGangs[gangId].y+30+browserFix, gangs[ gangId ].speed.toFixed(1), textStyles.data);
            //console.log("changing speed of gang " + this.gangId + " to " + gangs[ this.gangId ].speed.toFixed(2));
        }
        function changeGangSpeedSlideActionUp () {
            var id = this.gangId;
            clearInterval(liveGangSpeed); // stop the live gang speed adjusting
            //gangSliderBars[ id ].state = 'up';
            //we're sliding between positionGangs[ id ].y + 13 px (0 deg/sec) and positionGangs[ id ].y + 167px (700 deg/sec). These y coordinates are at the top of the slider bar, so the center goes from 362 to 202
            if ( gangSliderBars[ id ].y < positionGangs[ id ].y+34 ) { //set max speed boundary limit
                gangSliderBars[ id ].y = positionGangs[ id ].y+34;
            } else if ( gangSliderBars[id].y > positionGangs[id].y+188 ) { //set min speed boundary limit
                gangSliderBars[ id ].y = positionGangs[ id ].y+188;
            }
            gangs[ id ].speed = 700 + ( 700/154 ) * (positionGangs[id].y + 34 - gangSliderBars[id].y); // normalize speed over the range of y values on the slider track
            var dashKey = id + 'Dash'; 
            var gangChannelData = {
                'speed' : gangs[ id ].speed,
                'direction' : gangs[ id ].direction
            }
            for ( var k in motors ) {
                gangChannelData[ k ] = gangs[ id ][ k ];
                if ( gangs[ id ].direction === "f" || gangs[ id ].direction === "r"  ) {
                    if ( gangChannelData[ k ] === true ) {
                        var dashMotorKey = k + 'Dash';
                        var keyspaceMotorData = channel.getKeyspace(botId).get(dashMotorKey);
                        moveMotor( botId, k, keyspaceMotorData.direction, gangs[ id ].speed, keyspaceMotorData.directionSwapped );
                    }
                }
            }
            channel.getKeyspace(botId).put( dashKey, gangChannelData ); 
            game.world.remove( gangs[ id ].currentSpeedDisplay );
            gangs[ id ].currentSpeedDisplay = game.add.text(positionGangs[id].x+103, positionGangs[id].y+30+browserFix, gangs[ id ].speed.toFixed(1), textStyles.data);
            //console.log("changing speed of gang " + id + " to " + gangs[ id ].speed.toFixed(2));
        }
        function actionMotorCheckbox () {
            var gangId = this.gang;
            var motorPort = this.motor;
            var otherGangId;
            if ( gangs[ gangId ][ motorPort ] === false ) {
                gangs[ gangId ][ motorPort ] = true;
                motors[ motorPort ].gang = gangId;
                gangCheckboxes[ gangId ][ motorPort ].setFrames(1,1,1,1); // check the box
                for ( var k = 1; k <= numGangs; k++ ) { // check to see if the motor is in any other gang, and if so, remove it from that gang
                    if ( gangs[ k ][ motorPort ] === true ) {
                        if ( k !== gangId ) {
                            gangs[ k ][ motorPort ] = false;
                            gangCheckboxes[ k ][ motorPort ].setFrames(2,0,1,0); // uncheck the other box
                            var otherDashKey = k + 'Dash';
                            var otherGangChannelData = {
                                'speed' : gangs[ k ].speed,
                                'direction' : gangs[ k ].direction
                            }
                            for ( var n in motors ) {
                                otherGangChannelData[ n ] = gangs[ k ][ n ];
                            }
                            if ( otherGangChannelData.direction === "f" || otherGangChannelData.direction === "r" ) {
                                if ( gangs[ gangId ].direction === "stopped" ) { // stop a motor when it's removed from a gang in motion because it was added to a gang, which happened to not be in motion
                                    stopMotor( botId, motorPort );
                                }
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

            if ( gangs[ gangId ].direction === "f" || gangs[ gangId ].direction === "r" ) { // start or stop a motor if it's added to or removed from a motor gang that's in motion
                // console.log("motor moving");
                var dashMotorKey = motorPort + 'Dash';
                var keyspaceMotorData = channel.getKeyspace(botId).get(dashMotorKey);
                if ( gangs[ gangId ][ motorPort ] === true ) {
                    moveMotor( botId, motorPort, gangs[ gangId ].direction, gangs[ gangId ].speed, keyspaceMotorData.directionSwapped );
                }
                else {
                    stopMotor( botId, motorPort );
                }
            }

            var dashKey = gangId + 'Dash';
            //var gangVal = 'gang' + gangId;
            var gangChannelData = {
                'speed' : gangs[ gangId ].speed,
                'direction' : gangs[ gangId ].direction
            }
            for ( var m in motors ) {
                //var gangVal = 'gang' + gangId + '.' + m;
                gangChannelData[ m ] = gangs[ gangId ][ m ];
            }
            channel.getKeyspace(botId).put( dashKey, gangChannelData ); // replace key value with all of the gang's data (not just the updated info)
        }
        function gangForwardDirectionActionDown () {
            //console.log("move gang " + this.gangId + " forward"); 
            gangs[ this.gangId ].direction = "f";
            for ( var m in motors ) {
                if ( this[ m ] === true) {
                    moveMotor( botId, m, "f", this.speed, motors[ m ].directionSwapped );
                    forwardButtons[ m ].setFrames(2,2,2,2); // show the forward button as down, in case keyboard button inputs were being used instead of clicking            
                }
            }
            var dashKey = this.gangId + 'Dash';
            var gangChannelData = {
                'speed' : gangs[ this.gangId ].speed,
                'direction' : "f"
            }
            for ( var m in motors ) {
                gangChannelData[ m ] = gangs[ this.gangId ][ m ];
            }
            channel.getKeyspace(botId).put( dashKey, gangChannelData );
        }
        function gangForwardDirectionActionUp() {
            //console.log("stop gang " + this.gangId); 
            gangs[ this.gangId ].direction = "stopped";
            for ( var m in motors ) {
                if ( this[ m ] === true ) {
                    stopMotor( botId, m );                     
                    forwardButtons[ m ].setFrames(1,0,2,0); // show the forward button as up (normal position)
                }
            }
            var dashKey = this.gangId + 'Dash';
            var gangChannelData = {
                'speed' : gangs[ this.gangId ].speed,
                'direction' : "stopped"
            }
            for ( var m in motors ) {
                gangChannelData[ m ] = gangs[ this.gangId ][ m ];
            }
            channel.getKeyspace(botId).put( dashKey, gangChannelData );
        }
        function gangReverseDirectionActionDown () {
            //console.log("move gang " + this.gangId + " in reverse"); 
            gangs[ this.gangId ].direction = "r";
            for ( var m in motors ) {
                if ( this[ m ] === true) {
                    moveMotor( botId, m, "r", this.speed, motors[ m ].directionSwapped );
                    reverseButtons[ m ].setFrames(2,2,2,2);         
                }
            }
            var dashKey = this.gangId + 'Dash';
            var gangChannelData = {
                'speed' : gangs[ this.gangId ].speed,
                'direction' : "r"
            }
            for ( var m in motors ) {
                gangChannelData[ m ] = gangs[ this.gangId ][ m ];
            }
            channel.getKeyspace(botId).put( dashKey, gangChannelData );      
        }
        function gangReverseDirectionActionUp() {
            //console.log("stop gang " + this.gangId); 
            gangs[ this.gangId ].direction = "stopped";
            for ( var m in motors ) {
                if ( this[ m ] === true ) {
                    stopMotor( botId, m );
                    reverseButtons[ m ].setFrames(1,0,2,0);                     
                }
            } 
            var dashKey = this.gangId + 'Dash';
            var gangChannelData = {
                'speed' : gangs[ this.gangId ].speed,
                'direction' : "stopped"
            }
            for ( var m in motors ) {
                gangChannelData[ m ] = gangs[ this.gangId ][ m ];
            }
            channel.getKeyspace(botId).put( dashKey, gangChannelData );
        }
        //=============================================================================
      /* Motor communication with Robot via messages to Big Bang channel */
        function moveMotor( recipient, motor, direction, speed, swapped ) {
            var data = {};
            data.type = "motorStart";
            data.recipient = recipient;
            data.port = motor;
            if ( swapped === false ) {
                data.dir = direction;
            } 
            else {
                if ( direction === 'f' ) data.dir = 'r';
                else data.dir = 'f';                 
            }               
            data.speed = speed;
            //console.log( "sending " + JSON.stringify(data));
            channel.publish( data );
            var dashKey = motor + 'Dash';
            channel.getKeyspace(botId).put( dashKey, { 'speed': speed, 'direction': direction, 'directionSwapped': swapped } );
        }
        function stopMotor( recipient, motor ) {
            var data = {};
            data.recipient = recipient;
            data.type = "motorStop";
            data.port = motor;
            //console.log( "sending " + JSON.stringify(data));
            channel.publish( data );
            var dashKey = motor + 'Dash';
            channel.getKeyspace(botId).put( dashKey, { 'speed': motors[ motor ].speed, 'direction': "stopped", 'directionSwapped': motors[ motor ].directionSwapped } );
        }
      //=============================================================================
        function actionStopOnClick () {
            if ( dashboardStatus === 1 ) {
                statusButton.setFrames(2,2,2,2);
                dashboardStatus = 0;
                game.paused = true;
                game.world.remove(status.statusDisplay);
                status.statusDisplay = game.add.text(positionSystem.x+12, positionSystem.y+61, "stopped", textStyles.status);
                resume.resumeOverlay = game.add.graphics(0,0);
                resume.resumeOverlay.beginFill(0x00000,0.45);
                resume.resumeOverlay.drawRect(0, 0, canvasWidth, canvasHeight);
                resume.resumeMessageDisplay = game.add.sprite(canvasWidth/2-251,225,'resume');
                this.game.input.keyboard.disabled = true;
                botIndex++; //this is part of a little hack, to exit the channel.getKeyspace.onValue function while we're paused, so we don't update anything (like we do to deal with selecting the same bot multiple times)
            } else {
                statusButton.setFrames(1,0,0,0);
                dashboardStatus = 1;
                game.paused = false;
            }
        }
        function actionInputMessageOnClick() {
            var messageDisplay = prompt("What would you like to display on the Gigabot's LCD screen?");
            displayOnLCDScreen( messageDisplay );
        }
        function displayOnLCDScreen( message ) {
            game.world.remove(screenMessage.messageDisplay1); // remove any messages present
            game.world.remove(screenMessage.messageDisplay2);
            game.world.remove(screenMessage.messageDisplay3);
            game.world.remove(screenMessage.messageDisplay4);
            var messageDisplay1 = message.substring(0,26);
            var messageDisplay2 = message.substring(26,52);
            var messageDisplay3 = message.substring(52,78);
            var messageDisplay4 = message.substring(78,104);
            if ( message.length > 104 ) {
                alert("Sorry, too many characters! The following will be displayed on the screen: \n \n" + messageDisplay1 + "\n" + messageDisplay2 + "\n" + messageDisplay3 + "\n" + messageDisplay4);
            }
            screenMessage.messageDisplay1 = game.add.text(positionScreen.x+13, positionScreen.y+36+browserFix, messageDisplay1, textStyles.message);
            screenMessage.messageDisplay2 = game.add.text(positionScreen.x+13, positionScreen.y+49+browserFix, messageDisplay2, textStyles.message);
            screenMessage.messageDisplay3 = game.add.text(positionScreen.x+13, positionScreen.y+62+browserFix, messageDisplay3, textStyles.message);
            screenMessage.messageDisplay4 = game.add.text(positionScreen.x+13, positionScreen.y+75+browserFix, messageDisplay4, textStyles.message);
        }
        function actionGetKeyspace() {
            // this is to query the current bot's keyspace, for testing/debugging
            console.log("\nGetting Keyspace Info for Bot " + botStore[ botId ] + "...\nBot Client Id = " + botId + "\nand bot selection index = " + botIndex);
            var keys = channel.getKeyspace(botId).keys();
            console.log(keys); //["robot", "a", "b", "c", "d", "S1"]
            console.log("Bot Info from Robot:");
            var botData = channel.getKeyspace(botId).get('robot');
            console.log(botData);
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
            var db = channel.getKeyspace(botId).get('batteryDash');
            console.log(db);
        }

    //==============================================================================================================================
    /* Update stuff */
      /* Update the dashboard speed setting of gangs */
        function updateGangSpeed (key, speed) {
          //if ( gangSliderBars[ key ].state === "up"  ) {
            //console.log ("updating speed of gang " + gangId + " to " + speed);
            gangs[ key ].speed = speed;
            gangSliderBars[ key ].y = positionGangs[ key ].y + 34 - (154 / 700) * (speed - 700); //back-calculate sliderbar position from speed normalized over the range of slider track y-values
            gangs[ key ].previousSpeed = speed;
            game.world.remove( gangs[ key ].currentSpeedDisplay );
            gangs[ key ].currentSpeedDisplay = game.add.text( positionGangs[ key ].x+103, positionGangs[ key ].y+30+browserFix, speed.toFixed(1), textStyles.data );
          //}
        }
      /* Update the dashboard motor selection in gangs */
        function updateGangMotors (key, motor, status ) {
            //console.log( "updating motor " + motor + " within gang " + key );
            gangs[ key ][ motor ] = status;
            if ( status === true ) gangCheckboxes[ key ][ motor ].setFrames(1,1,1,1);   
            else gangCheckboxes[ key ][ motor ].setFrames(2,0,1,0);                  
        }
      /* Get key-value pairs related to dashboard gang settings from the keyspace and execute other functions with them  */
        function getGangValues (key, val) {
            for ( var k in val ) {
                if ( val[ k ] !== gangs[ key ][ k ] ) {
                    gangs[ key ][ k ] = val[ k ];
                    if ( k === 'speed' && val[ k ] !== gangs[ key ].previousSpeed ) updateGangSpeed( key, val[ k ] );
                    if ( k in motors ) updateGangMotors( key, k, val[k] );

                    if ( k === 'direction' ) {
                        gangs[ key ].direction = val.direction;
                    }

                }
            } 
        }
      /* Update the direction configurations of the motors for all users */
        function updateMotorDirections ( key, swapDirection ) {
            if ( motors[ key ].directionSwapped === swapDirection ) return 0; // exit function if the values are already equal
            //console.log ("updating direction of motor " + key + " to " + swapDirection);
            if ( swapDirection === false ) {
                motors[ key ].directionSwapped = false;
                directionChecks[ key ].setFrames(2,0,1,0);
            } else {
                motors[ key ].directionSwapped = true;
                directionChecks[ key ].setFrames(1,1,1,1);
            }
        }
      /* Update set speeds and slider positions for all users */
        function updateMotorSpeed (key, speed) {
            if ( motors[ key ].speed === speed ) return 0;
            //console.log ("updating speed of motor " + motorPort + " to " + speed);
            motors[ key ].speed = speed;
            sliderBars[ key ].y = positionMotors[ key ].y + 34 - (154 / 700) * (speed - 700); //back-calculate sliderbar position from speed normalized over the range of slider track y-values
            motors[ key ].previousSpeed = speed;
            game.world.remove( motors[ key ].currentSpeedDisplay );
            motors[ key ].currentSpeedDisplay = game.add.text( positionMotors[ key ].x+91, positionMotors[ key ].y+59+browserFix, speed.toFixed(1), textStyles.data );
        }
      /* Once motor stops, update its dial to the precise value measured by the robot and published to channel */
        function updateMotorDial (key, motorData) { // Update the dial once the motor stops, at the next nearest second when the bot sends out a position value (this is more accurate)
            if ( typeof motorData !== "undefined" && motorData.moving === false ) {
                needles[ key ].angle = motorData.position;
            }
        }
      /* Approximate rotation of motor position dials in realtime */
        function rotateMotorDial (key, speed, direction, swapped ) { // Move the dial in realtime in all users' dashboards: this is a linear approximation based on the previous needle position and the motor's current speed and direction
            var time2 = game.time.time;
            var deltaTime = time2 - motors[ key ].time1;
            if ( deltaTime >= 80 ) deltaTime = 100/6; // approximate, when the time difference is too large (when starting a motor either for the first time or after a break)
            if ( swapped === false ) {
                if ( direction === 'f' ) needles[ key ].angle += speed * deltaTime / 1000; // CW
                else if ( direction === 'r' ) needles[ key ].angle -= speed * deltaTime / 1000; // CCW
            }
            else { // directions are swapped
                if ( direction === 'f' ) needles[ key ].angle -= speed * deltaTime / 1000; // CCW
                else if ( direction === 'r' ) needles[ key ].angle += speed * deltaTime / 1000; // CW                
            }
            motors[ key ].time1 = time2;
            //console.log("rotating dial " + key + " at " + speed + " deg/sec, in " + direction + " direction...");
        }
      /* Get key-value pairs related to dashboard motor settings from the keyspace and execute other functions with them  */
        function getDashData ( key, val ) {
            if ( motors[ key ].speed !== val.speed && motors[ key ].previousSpeed !== val.speed ) { // don't change anything again in the dashboard of the user who changed the speed, only in the others' dashboards
                updateMotorSpeed( key, val.speed );
            }
            if ( typeof val.directionSwapped !== 'undefined' && motors[ key ].directionSwapped !== val.directionSwapped ) {
                 updateMotorDirections( key, val.directionSwapped );
            }
        }
      /* Update function infinite loop (~60x/sec) */
        function update() {
            if ( botId === '' ) return 0; // don't do anything when we're not dealing with a particular bot

            for ( var k in motors ) {
                var dashKey = k + 'Dash';
                var dashData = channel.getKeyspace(botId).get(dashKey); 
                if ( typeof dashData !== "undefined" ) {
                    if ( dashData.direction === 'f' || dashData.direction === 'r' ) { // || motorData.moving === true ) {
                        rotateMotorDial( k, dashData.speed, dashData.direction, dashData.directionSwapped );
                    }
                    else if ( dashData.direction === "stopped" ) {
                        var motorData = channel.getKeyspace(botId).get(k);
                        if ( typeof motorData !== "undefined" ) {
                            if ( motorData.moving === false ) {
                                updateMotorDial ( k, motorData ); // update at the next second to the value in the message sent by the bot
                            }
                            else if ( motorData.moving === true && game.time.time > motors[ k ].time1 + 999 ) { // if text editor id used, the bot's keyspace dashboard motor key would show it as "stopped" whereas the bot's motor data key would show it as moving. We must deal with a little lag, so add 999 milliseconds of padding
                                // based on positions, we need to figure out which direction it's moving
                                if ( motorData.position > needles[ k ].angle ) {
                                    rotateMotorDial( k, dashData.speed, 'f', false ); // we don't know if it's swapped or not, just how it's moving
                                }
                                else if ( motorData.position < needles[ k ].angle ) {
                                    rotateMotorDial( k, dashData.speed, 'r', false ); // we don't know if it's swapped or not, just how it's moving
                                }
                                // based on positions, we can figure out the speed it's moving at
                                if ( typeof motors[ k ].position1 !== "undefined" && typeof motors[ k ].timePosition !== "undefined" ) {
                                    var speedCalc = Math.abs( motors [ k ].position1 - motorData.position ) / ( ( game.time.time - motors[ k ].timePosition ) / 1000 );
                                    if ( speedCalc <= 700 ) {
                                        updateMotorSpeed( k, speedCalc );
                                    }
                                }
                                motors[ k ].position1 = motorData.position;
                                motors[ k ].timePosition = game.time.time;
                            }
                        }
                    }
                    getDashData( k, dashData );
                }
            }                    

            for ( var g in gangs ) {
                var dashKey = g + 'Dash';
                //if ( gangSliderBars[ g ].state === "up" ) {
                var dashGang = channel.getKeyspace(botId).get(dashKey);
                //if ( typeof dashGang !== "undefined" ) {
                // we can swap to use just the first letter of the key right here instead of slicing dashKey later in other functions
                getGangValues( g, dashGang );
                //}
                //}
            }

        } // end update

        restartState = function () {
            console.log("Connection timeout. Reconnecting client and restarting dashboard state...");
            client.connectAnonymous("thegigabots.app.bigbang.io:80", function(result) {
                if( result.success) {
                    client.subscribe("newBot", function( err, c) {
                        if(!err) {
                            game.state.start('newState');
                            // game.world.removeAll();
                            // game.state.restart('MainScreen'); //restarts game state to the current state. This also works: game.state.start(game.state.current);
                            // beginGame(client,c);
                            // console.dir(c);
                            // game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.AUTO, "gameWorld", {
                            //     preload: preload, 
                            //     create: create,
                            //     update: update,
                            // }, true);

                            botName = botStore[ botId ];
                            botIndex++;
                            listenToBot( botId, botIndex ); // start listening to the bot that was previously being used
                            //getInitialTouchData( botId );
                            //getInitialBatteryLevel( botId );
                            setInitialDashboardSettings( botId );
                            //var textDisplay = game.add.text(400, 20, "reconnected...", textStyles.data);                
                            console.log("Reconnected to bot " + botId + " with name " + botName);
                        }
                        else {
                            console.log("Resubscribe failure. " + err);
                        }
                    })
                }
                else {
                    console.log("RECONNECT FAILURE.");
                }
            });

        }

        /* responsive stuff */

        var compare = 'same';

        window.onresize = function(event) {
            var size = {
                width : $window.width(),
                height : $window.height()
            }
            if ( size.width >= 1132 ) {
                canvasWidth = 1132; // 4 columns
            } 
            else if ( size.width <= 562 ) {
                canvasWidth = 562; // 2 columns
            }
            else {
                canvasWidth = 847; // 3 columns
            }
            if ( game.width !== canvasWidth && canvasWidth === 847 ) { // if current game width is greater than the new width, make it smaller
                game.scale.width = game.canvas.width = game.stage.width = game.width = canvasWidth;
                game.renderer.resize(canvasWidth, canvasHeight);
                if ( compare !== 'medium') {
                    for ( var k in gangs ) {
                        moveGang( k, 3 )
                    }
                    //
                }
                compare = 'medium';
            }
            else if ( game.width !== canvasWidth && canvasWidth === 1132 ) { // make it bigger;
                game.scale.width = game.canvas.width = game.stage.width = game.width = canvasWidth;
                game.renderer.resize(canvasWidth, canvasHeight);
                if ( compare !== 'large') {
                    for ( var k in gangs ) {
                        moveGang( k, 4 )
                    }
                    //
                }
                compare = 'large';
            }
            else if ( game.width !== canvasWidth && canvasWidth === 562 ) { // make it bigger;
                game.scale.width = game.canvas.width = game.stage.width = game.width = canvasWidth;
                game.renderer.resize(canvasWidth, canvasHeight);
                if ( compare !== 'small') {
                    for ( var k in gangs ) {
                        moveGang( k, 2 )
                    }
                    //
                }
                compare = 'small';
            }
            else {
                return 0;
            }

            // resize html elements
            adjustHtml( canvasWidth, canvasHeight );

        }

        function moveGang( id, col ) {
          // set new positions:
            if ( col === 4 ) {
                gangColumns = 1; // make 1 column of gangs
                gangRows = numGangs/gangColumns;
                var heightMotors = maxMotorRows * ( motorHeight + 10 ) - 10;
                var heightGangs = gangRows * ( gangHeightMin + ( numCheckboxRows ) * 28 + 10 ) - 10;
                var heightMax = Math.max( heightMotors, heightGangs );
                if ( heightMax + 2 > canvasHeight ) {
                    canvasHeight = heightMax + 2;
                }
                else if ( heightMax + 2 < canvasHeight ) {
                    canvasHeight = heightMax + 2;
                }
                game.scale.height = game.canvas.height = game.stage.height = game.height = canvasHeight;
                game.renderer.resize(canvasWidth, canvasHeight);
                var x = 286 + 285*2;
                var y = 1 + ( id - 1 ) * ( gangHeightMin + ( numCheckboxRows ) * 28 + 10 );
            }
            else if ( col === 3 ) { //total # columns in dashboard
                gangColumns = 2; // make 2 columns of gangs
                game.scale.height = game.canvas.height = game.stage.height = game.height = canvasHeight = 2 + maxMotorRows * ( motorHeight + 10 ) + Math.ceil( numGangs / gangColumns ) * ( 231 + ( numCheckboxRows ) * 28 + 10 ) - 10;
                game.renderer.resize(canvasWidth, canvasHeight);
                if ( id % gangColumns === 0 ) {
                    var x = 286 + 285;
                }
                else {
                    var x = 286;
                }
                var y = 1 + maxMotorRows * ( motorHeight + 10 ) + ( Math.floor( id / 2 - .25 ) ) * (  gangHeightMin + ( numCheckboxRows ) * 28 + 10 );
            }
            else if ( col === 2 ) {
                console.log("2 columns");
                /*
                * TODO
                */
            }
            // really quick and dirty for now, just trying to get this movement to work - work out a more efficient way to do this. Maybe after creating everything, store it all in a gang object (for each gang id), and then just move everything by the same amount that the gang position moved.
            frames[ id ].move( positionGangs[ id ].x, positionGangs[ id ].y, x, y );
            topBars[ id ].x = x + 1;
            topBars[ id ].y = y + 1;
            dividers[ id + 'a' ].x = x + 7;
            dividers[ id + 'a' ].y = y + 58;
            dividers[ id + 'b' ].x = x + 7;
            dividers[ id + 'b' ].y = y + 204;
            gangLabels[ id ].x = x + 8;
            gangLabels[ id ].y = y + 1 + browserFix;
            sliderTracks[ id ].x = x + 170;
            sliderTracks[ id ].y = y + 39;
            for ( var k = 0; k <= 7; k++ ) {
                var speedLabel = 100 * k + "";
                sliderSpeedIncrements[ id ][ k ].x = x + 243;
                sliderSpeedIncrements[ id ][ k ].y = y + 185 - 22*k + browserFix;
            }
            sliderSpeedLabels[ id ].x = x + 160;
            sliderSpeedLabels[ id ].y = y + 206 + browserFix;
            currentSpeedLabels[ id ].x = x + 12;
            currentSpeedLabels[ id ].y = y + 33 + browserFix;
            directionsNote[ id ].x = x + 11;
            directionsNote[ id ].y = y + 166 + browserFix;
            gangForwardButtons[ id ].x = x + 10;
            gangForwardButtons[ id ].y = y + 65;
            gangReverseButtons[ id ].x = x + 10;
            gangReverseButtons[ id ].y = y + 117;
            gangPlusButtons[ id ].x = x + 112;
            gangPlusButtons[ id ].y = y + 68
            gangMinusButtons[ id ].x = x + 112;
            gangMinusButtons[ id ].y = y + 115;
            gangSliderBars[ id ].x = x + 165;
            gangSliderBars[ id ].y = y + 188;
            gangMotorLabels[ id ][ 'motors' ].x = x + 12;
            gangMotorLabels[ id ][ 'motors' ].y = y + 207;
            if ( typeof gangs[ id ].currentSpeedDisplay !== "undefined") {
                gangs[ id ].currentSpeedDisplay.x = x + 103;
                gangs[ id ].currentSpeedDisplay.y = y + 30 + browserFix;
            }
            // do this more efficiently... (make a position ganged motor checkbox function that takes the gang id and the number of motors or something, which we can use in create() and here)
            if ( numMotors <= 6 ) {
                var spacing = Math.ceil( frames[ id ].width / ( numMotors + 1 ) );
                for ( var j = 1; j <= numMotors; j++ ) {
                    gangCheckboxes[ id ][ letters[j] ].x = x + Math.floor( spacing/2 ) + (j-1) * spacing;
                    gangCheckboxes[ id ][ letters[j] ].y = y + gangHeightMin;
                    gangMotorLabels[ id ][ letters[j] ].x = gangCheckboxes[id][ letters[j] ].x + 26;
                    gangMotorLabels[ id ][ letters[j] ].y = gangCheckboxes[id][ letters[j] ].y + 2 + browserFix;
                }
            }
            else if ( numMotors > 6 ) {
                /*
                * TODO
                * prob something more efficient here (and above) later...
                */
            }
            positionGangs[ id ] = { // replace old positions 
                x : x , 
                y : y 
            }            

        }

        // end responsive stuff

        /* === Dashboard console-based text editor === */

        // When the latest click is within the dashboard, enable the hotkeys
        // When the latest click is within the textEditor, disable the hotkeys s.t. user can use all letters when typing
        $("#textEditor").click( function () { // hovering over textEditor
            disableKeyboard();
        });
        function disableKeyboard() {
            game.input.keyboard.disabled = true;
        }
        $("#gameWorld").click( function () { // hovering over textEditor
            enableKeyboard();
        });
        function enableKeyboard() {
            game.input.keyboard.disabled = false;
        }

        function publish(botCode) {
            channel.publish({ "type": "js", "js": botCode, "recipient": botId });
        }

        // When the Run Code button is clicked
        document.getElementById("runButton").onclick = function() {
            // get text along with formatting from text editor text area
            var formatCode = document.getElementById("currentCode").innerHTML;
            // get plain text w/o format from text editor
            var evalCode = document.getElementById("currentCode").innerText;


            console.log(evalCode);

            //There fix up special funky characters.



            channel.publish({ "type": "js", "js": pew.base64_encode(evalCode), "recipient": botId });

            // store currentCode in an array to be accessed if they press the up key
            codeArray.push([formatCode]);
            // = codeArray[inputCode]
            


           // $( ".previousCode" ).append( '<div style="text-align:left; color:white; margin:0;">' +  codeArray[iterationNum][0] + '</div>');



            iterationNum = iterationNum + 1;
            indexArray = iterationNum;
            $(".previousCode").scrollTop($(".previousCode")[0].scrollHeight);
            $("html").scrollTop($("html")[0].scrollHeight);
            document.getElementById("currentCode").innerHTML = "";

        } // end .onclick


        function consoleAppend( msg ) {
            $( ".previousCode" ).append( '<div style="text-align:left; color:orange; margin:0;">' + msg  +  '</div>');
        }


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
                        document.getElementById("currentCode").innerHTML = codeArray[indexArray][0];
                    }
                break;
                // If down key is pressed
                case 40: // down
                    // Maneuver forward through newer code input
                    if (indexArray != iterationNum) {
                        indexArray=indexArray+1;
                        document.getElementById("currentCode").innerHTML = codeArray[indexArray][0];
                    }
                    if (indexArray+1 === iterationNum) {
                        indexArray = indexArray+1;
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
        

    // when the connection barfs out
    client.disconnected( function() {
        console.log("Connection lost");
        restartState(); //restart the current game state, without refreshing the page. Select the same bot as before
    });

}); // end require