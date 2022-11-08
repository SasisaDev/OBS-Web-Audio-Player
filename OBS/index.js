var CurrentAudio;
var context = new AudioContext();

var discRotation = 0;

window.addEventListener('load', ()=>{
    NextSong();
    function guardedAnimate() {
        animate();
        setTimeout(guardedAnimate, 45000);
    }
    guardedAnimate();

    function guardedTick() {
        if(discRotation < 360) {
            discRotation++;
        } else {
            discRotation = 0;
        }

        document.getElementById('disc').style.rotate = `${discRotation}deg`;

        setTimeout(guardedTick, 1000/30);
    }

    guardedTick();
})

function NextSong() {
    animate();

    fetch('http://localhost:1337/next').then((resp) => {
        resp.json().then((value) => {
            document.getElementById('cross').className = "hidden";
            document.getElementById('disc').className = "";

            document.getElementById('title').textContent = value.title;
            document.getElementById('author').textContent = value.author;
            CurrentAudio = new Audio(value.audio);
            CurrentAudio.play();
            CurrentAudio.onended = NextSong;
            CurrentAudio.ontimeupdate = () => {
                fetch(`http://localhost:1337/update_stream/${CurrentAudio.currentTime}`, {
                    method: 'PUT'
                })
            }
        })
    }).catch(reason => {
        document.getElementById('cross').className = "";
        document.getElementById('disc').className = "hidden";

        document.getElementById('title').textContent = "Server is down";
        document.getElementById('author').textContent = "Sasisa-San...";
        console.log('Failed fetching /next route');
        setTimeout(NextSong, 2500);
    })
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