$(document).ready(function() {
        $("#progressbar").progressbar({value: 10});
        var progress = setInterval(function() {
       var currentVal = $("#progressbar").progressbar("option", "value");
       var nextVal = currentVal + 15;
       if (nextVal > 100) {
           clearInterval(progress);
       } else {
           $("#progressbar").progressbar({value: nextVal});
       }
    }, 400);
});

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
                            console.log("Shit, what happened? " + err);
                        }
                    });
                } else {
                    console.log("EPIC FAIL.");
                }
            });
        } else {
            console.log("Login failed. " + result.message);
        }
    });

    function beginGame(client, channel) {
        var game = new Phaser.Game(1000, 1000, Phaser.AUTO, null, {
            preload: preload,
            create: create,
            update: update
        });

        var buttonGo;
        var buttonStop;
        var lightOn;
        var lightOff;
        var background;

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
            game.load.image('stall', 'images/lights/red_light.png');
            game.load.image('on', 'images/lights/green_light.png');
            game.load.image('stop', 'images/buttons/stop_button.png');
            game.load.image('go', 'images/buttons/go_button.png');
        }

        function create() {
            game.stage.backgroundColor = '#F0F0F0';
            buttonGo = game.add.button(100,100,'go', actionGoOnClick);
            buttonStop = game.add.button(400,100,'stop', actionStopOnClick);
        }  

        function actionGoOnClick () {
            console.log("go");
            lightOn = game.add.sprite(250,20,'on');
            lightOn.scale.setTo(0.25, 0.25);
            if(lightOff) {
                lightOff.destroy(); //delete the lightOff sprite (if it's there)
            }
        }

        function actionStopOnClick () {
            console.log("stop");
            lightOff = game.add.sprite(250,20,'stall');
            lightOff.scale.setTo(0.25, 0.25);
            if(lightOn) {
                lightOn.destroy(); //delete the lightOn sprite (if it's there)
            }
        }
        


        function update() {

        }

        function sendPosition(x, y, posName) {

        }
        


        function uPosition(mPosition) {

        }
    }
});

