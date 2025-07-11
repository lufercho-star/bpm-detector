
const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");
const bpmDisplay = document.getElementById("bpmDisplay");

let audioContext, processor, microphoneStream;

function calculateBPM(audioData, sampleRate) {
  const threshold = 0.9;
  let peaks = [];
  for (let i = 1; i < audioData.length - 1; i++) {
    if (audioData[i] > threshold && audioData[i] > audioData[i - 1] && audioData[i] > audioData[i + 1]) {
      peaks.push(i);
    }
  }
  if (peaks.length < 2) return 0;
  let intervals = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const bpm = (60 * sampleRate) / avgInterval;
  return Math.round(bpm);
}

startBtn.onclick = async () => {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    microphoneStream = audioContext.createMediaStreamSource(stream);
    processor = audioContext.createScriptProcessor(2048, 1, 1);

    microphoneStream.connect(processor);
    processor.connect(audioContext.destination);

    statusText.textContent = "Detectando BPM...";

    processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      const bpm = calculateBPM(input, audioContext.sampleRate);
      if (bpm > 30 && bpm < 300) {
        bpmDisplay.textContent = bpm + " BPM";
      }
    };
  } catch (err) {
    console.error(err);
    statusText.textContent = "Error al acceder al micrófono";
  }
};
