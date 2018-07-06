const { desktopCapturer } = window.require('electron');

console.log('desktopCapturer', desktopCapturer);

function shareScreen() {
  return new Promise((resolve, reject) => {
    const sourceConfig = { types: ['window', 'screen'] };
    desktopCapturer.getSources(sourceConfig, (error, sources) => {
      if (error) throw error;

      for (let i = 0; i < sources.length; ++i) {
        if (sources[i].name === 'Entire screen') {
          navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sources[i].id,
                minWidth: 1280,
                maxWidth: 1280,
                minHeight: 720,
                maxHeight: 720,
              },
            },
          })
            .then(resolve)
            .catch(reject);
          return;
        }
      }
    });
  });
}

function receiveStream(stream) {
  const video = document.querySelector('#screen');
  console.log('video', video);
  video.srcObject = stream;
  video.onloadedmetadata = (e) => video.play();
}

function handleStream(stream) {
}

function handleError(e) {
  console.log(e);
}

module.exports.shareScreen = shareScreen;
