const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const audioElement = document.querySelector('audio');
const track = audioContext.createMediaElementSource(audioElement);

const randomNumber = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
const randomRGB = () => [
    randomNumber(0, 255),
    randomNumber(0, 255),
    randomNumber(0, 255)
];
const randomColorString = () => {
    const rgb = randomRGB();
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}
let bgVar;
const animateBackground = () => {
    document.body.style.backgroundColor = randomColorString();
    bgVar = setTimeout(animateBackground, 5000);
};
const stopAnimateBackground = () => {
    clearTimeout(bgVar);
};

//Play/Pause Button
const playButton = document.querySelector('button');
playButton.addEventListener("click", function() {
    if (audioContext.state === "suspended"){
        audioContext.resume();
    }
    if (this.dataset.playing === "false") {
        audioElement.play();
        playButton.textContent = "Pause";
        this.dataset.playing = "true";
        animateBackground();
    } else if (this.dataset.playing === "true") {
        audioElement.pause();
        playButton.textContent = "Resume";
        this.dataset.playing = false;
        stopAnimateBackground();
    }
}, false);
audioElement.addEventListener("ended", () => {
    playButton.dataset.playing = "false";
}, false);

//Gain Slider
const gainNode = audioContext.createGain();
const volumeControl = document.querySelector("#volume");
volumeControl.addEventListener('input', function(){
    gainNode.gain.value = this.value;
}, false);

//Visualizer
///Analyser Setup
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
///Canvas Setup & Draw
const canvas = document.querySelector('.viz');
const canvasContext = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const background = randomColorString();
canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
function draw() {
    const drawVisual = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);
    canvasContext.fillStyle = background;
    canvasContext.fillRect(0, 0, WIDTH, HEIGHT);
    canvasContext.lineWidth = 5;
    canvasContext.strokeStyle = 'rgb(255,255,255)';
    canvasContext.beginPath();
    const sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;
    for(let i = 0 ; i < bufferLength; i ++) {
        let v = dataArray[i] / 128.0;
        let y = v * HEIGHT / 2;
        if(i === 0) canvasContext.moveTo(x, y);
        else canvasContext.lineTo(x, y);
        x += sliceWidth;
    }
    canvasContext.lineTo(canvas.width, canvas.height/2);
    canvasContext.stroke();
};

draw();
track.connect(gainNode).connect(analyser).connect(audioContext.destination);

/// Chris Mojekwu 2020