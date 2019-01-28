
/******************************************************************************************
/ Webcam smile detection with animation overlay
/ Based on https://github.com/foo123/HAAR.js and http://neave.github.com/face-detection/
******************************************************************************************/

// requestAnimationFrame to get the best framerate posible
(function() {
    var i = 0,
        lastTime = 0,
        vendors = ['ms', 'moz', 'webkit', 'o'];

    while (i < vendors.length && !window.requestAnimationFrame) {
        window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
        i++;
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime(),
                timeToCall = Math.max(0, 1000 / 60 - currTime + lastTime),
                id = setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);

            lastTime = currTime + timeToCall;
            return id;
        };
    }
}());

var App = {

    // After the user accepts using his webcam, set the canvas dimensions and start drawing
    start: function(stream) {
        App.video.addEventListener('canplay', function() {
            // App.video.removeEventListener('canplay');
            setTimeout(function() {
                App.video.play();
                App.canvas.style.display = 'inline';
                App.info.style.display = 'none';
                App.canvas.width = App.video.videoWidth;
                App.canvas.height = App.video.videoHeight;
                App.backCanvas.width = App.video.videoWidth / 4;
                App.backCanvas.height = App.video.videoHeight / 4;
                App.backContext = App.backCanvas.getContext('2d');

                var w = 244 / 4 * 0.8,
                        h = 200 / 4 * 0.8;

                App.comp = [{
                        x: (App.video.videoWidth / 4 - w) / 2,
                        y: (App.video.videoHeight / 4 - h) / 2,
                        width: w,
                        height: h
                }];

                App.drawToCanvas();

            }, 100);
        }, true);

        var domURL = window.URL || window.webkitURL;
        App.video.srcObject = stream;
    },
    denied: function() {
            App.info.innerHTML = 'Camera access denied!<br>Please reload and try again.';
    },
    error: function(e) {
        if (e) {
                console.error(e);
        }
        App.info.innerHTML = 'Please go to about:flags in Google Chrome and enable the &quot;MediaStream&quot; flag.';
    },
    drawToCanvas: function() {
        requestAnimationFrame(App.drawToCanvas);

        var video = App.video,
                ctx = App.context,
                backCtx = App.backContext,
                m = 3.8,
                w = 3.8,
                i,
                comp;

        // Draw the video from the webcam
        ctx.drawImage(video, 0, 0, App.canvas.width, App.canvas.height);
        backCtx.drawImage(video, 0, 0, App.backCanvas.width, App.backCanvas.height);

        // If the smile is detected, moth will not be null and will contain the position and size of the smile
        if( mouth )
        {
            // Draw the animation overlay
            ctx.drawImage(App.beard, mouth.x - 45, mouth.y - 55, mouth.width + 100, mouth.height + 100);
        }
    }
};

App.beard = new Image();
App.beard.src = 'img/beard.png';

// Start the video streaming from the webcam
App.init = function()
{
    App.video = document.getElementById('video');
    App.backCanvas = document.createElement('canvas');
    App.canvas = document.querySelector('#output');
    App.canvas.style.display = 'none';
    App.context = App.canvas.getContext('2d');
    App.info = document.querySelector('#info');

    navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    try {
        navigator.getUserMedia_({
                video: true,
                audio: false
        }, App.start, App.denied);
    } catch (e) {
        try {
                navigator.getUserMedia_('video', App.start, App.denied);
        } catch (e) {
                App.error(e);
        }
    }

    App.video.loop = App.video.muted = true;
    App.video.load();
};

App.init();

// Start the smile detection
var sd = new SmileDetector("video");

sd.onSmile( function(isSmile)
{
    if (isSmile){
        document.getElementById("smile").setAttribute("class", "happy");
    }
    else{
        document.getElementById("smile").setAttribute("class", "sad");
    }
});

sd.start(300);

// Take the screenshot and display the image
$('#save').click( function()
{
    var canvas = document.getElementById("output");
    var img = canvas.toDataURL("image/jpg");
    document.write('<img src="'+img+'"/>');
});
