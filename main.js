const express = require('express');
const path = require('path');
const fs = require('fs');
const { STATUS_CODES } = require('http');

const app = express();

var stream_info = {
    audio: '',
    title: '',
    author: '',
    time: 0,
}

app.use(express.static(path.join(__dirname, 'application/public')));
app.use('/obs', express.static(path.join(__dirname, 'OBS/')));
app.use('/audio', express.static(path.join(__dirname, 'audio')));

app.get('/', (req, res) => {

});

app.get('/obs', (req, res) => {
    res.sendFile(path.join(__dirname, 'OBS/index.html'));
});

app.get('/stream', (req, res) => {
    res.json(stream_info);
})

app.get('/next', (req, res) => {
    var audio_files = [];
    fs.readdirSync(path.join(__dirname, '/audio')).forEach(file => {
        console.log(file);
        audio_files.push(file);
    });
    
    const audio_file = audio_files[Math.floor(Math.random()*audio_files.length)];

    const basename = path.basename(audio_file).replace(/.mp3/, '');
    const author = basename.split('.')[0];
    const title = basename.split('.')[1];

    stream_info.audio = `http://localhost:1337/audio/${basename}.mp3`;
    stream_info.title = title;
    stream_info.author = author;

    console.log(`author: ${author}`);
    console.log(`title: ${title}`);
    console.log(`url: ${basename}`);

    res.json({
        audio: `http://localhost:1337/audio/${basename}.mp3`,
        title: title,
        author: author
    });
});

app.put('/update_stream/:time', (req, res)=>{
    stream_info.time = req.params.time;
    console.log(req.params.time);
    res.sendStatus(200);
})

app.listen(1337);