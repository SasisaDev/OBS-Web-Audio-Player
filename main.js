const express = require('express');
const path = require('path');
const fs = require('fs');
const { STATUS_CODES } = require('http');
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');

const app = express();

var stream_info = {
    audio: '',
    title: '',
    author: '',
    time: 0,
    duration: 0,
    isPlaying: false
}

app.use(express.static(path.join(__dirname, 'application/build')));
app.use('/obs', express.static(path.join(__dirname, 'OBS/')));
app.use('/audio', express.static(path.join(__dirname, 'audio')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'application/build/index.html'));
});

app.get('/obs', (req, res) => {
    res.sendFile(path.join(__dirname, 'OBS/index.html'));
});

app.get('/stream', (req, res) => {
    res.json(stream_info);
})

app.get('/next', async (req, res) => {
    await NextSong();
    res.json(stream_info);
});

app.put('/update_stream/:time', (req, res)=>{
    stream_info.time = req.params.time;
    console.log(req.params.time);
    res.sendStatus(200);
})

async function NextSong() {
    var audio_files = [];
    fs.readdirSync(path.join(__dirname, '/audio')).forEach(file => {
        console.log(file);
        audio_files.push(file);
    });
    
    const audio_file = audio_files[Math.floor(Math.random()*audio_files.length)];

    const basename = path.basename(audio_file).replace(/.mp3/, '');
    const author = basename.split('.')[0];
    const title = basename.split('.')[1];

    let info = await ffprobe(`./audio/${audio_file}`, { path: ffprobeStatic.path });

    stream_info.duration = parseInt(info.streams[0].duration);

    stream_info.audio = `http://localhost:1337/audio/${basename}.mp3`;
    stream_info.title = title;
    stream_info.author = author;
    stream_info.time = 0;
    stream_info.isPlaying = true;
}

function Tick() {
    if(stream_info.isPlaying)
    {
        if(stream_info.time >= stream_info.duration) 
        {
            NextSong();
        }
        else if(stream_info.isPlaying === true) 
        {
            stream_info.time++;
        }
    }

    console.log(stream_info);

    setTimeout(Tick, 1000);
}

NextSong();
Tick();

app.listen(1337);