var CurrentAudio;
var context = new AudioContext();

var discRotation = 0;

window.addEventListener('load', ()=>{
    UpdateSong();
    function guardedAnimate() {
        animate();
        setTimeout(guardedAnimate, 45000);
    }
    guardedAnimate();

    // Tick each 1/30th of a frame
    function guardedTick() {
        if(discRotation < 360) {
            discRotation++;
        } else {
            discRotation = 0;
        }

        document.getElementById('disc').style.rotate = `${discRotation}deg`;

        setTimeout(guardedTick, 1000/30);
    }

    // Update state of widget from server each 5 seconds
    function guardedStateTick() {
        fetch(`http://localhost:1337/stream`).then((resp) => {
            resp.json().then((value) => {
                console.log(value)

                // If audio is playing in browser, but not on server - stop it. Otherwise - resume from server time.
                if(CurrentAudio) {
                    if(value.isPlaying == true && CurrentAudio.paused === true) {
                        CurrentAudio.play();
                        CurrentAudio.currentTime = value.time;
                    } else if(value.isPlaying == false && CurrentAudio.paused === false){
                        CurrentAudio.pause();
                    }
                }
            })
        }).catch((err)=>{
            InitiateError();
        });

        setTimeout(guardedStateTick, 1000*5);
    }

    guardedTick();
    guardedStateTick();
})

function UpdateSong(next = false) {
    animate();

    // Delete previous song from cache
    if(CurrentAudio) {
        CurrentAudio.pause();
        delete CurrentAudio;
    }

    let URI = next ? `http://localhost:1337/next` : `http://localhost:1337/stream`;

    // Fetch new song data
    fetch(URI).then((resp) => {
        resp.json().then((value) => {
            document.getElementById('cross').className = "hidden";
            document.getElementById('disc').className = "";

            document.getElementById('title').textContent = value.title;
            document.getElementById('author').textContent = value.author;
            CurrentAudio = new Audio(value.audio);
            CurrentAudio.play();
            CurrentAudio.onended = UpdateSong;
        })
    }).catch(reason => {
        InitiateError();
    })
}

function InitiateError() {
    if(CurrentAudio) CurrentAudio.pause();

    document.getElementById('cross').className = "";
    document.getElementById('disc').className = "hidden";

    document.getElementById('title').textContent = "Server is down";
    document.getElementById('author').textContent = "Sasisa-San...";
    console.log('Failed fetching /next route');
    setTimeout(UpdateSong, 2500);
}

const Colors = [
    '#fff',
    '#ffe3a2',
    '#bee8b9',
    '#ff6bbc',
    '#66a3ff',
    '#66ffed'
]

function animate() {
    const item = Math.floor(Math.random()*Colors.length);
    console.log(item);
    document.getElementById('base').style.color = Colors[item];

    anime({
        targets: '.obs',
        keyframes: [
            {opacity: 0, delay: 0},
            {opacity: 1, duration: 1000, delay: 1000},
            {opacity: 0, duration: 1000, delay: 7500}
        ],
        easing: 'linear'
    });
}