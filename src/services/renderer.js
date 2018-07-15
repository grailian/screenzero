const { desktopCapturer } = window.require('electron');

function shareScreen() {
  return new Promise((resolve, reject) => {
    const sourceConfig = { types: ['window', 'screen'] };
    desktopCapturer.getSources(sourceConfig, (error, sources) => {
      if (error) throw error;

      for (let i = 0; i < sources.length; ++i) {
        if (sources[i].name === 'Entire screen') {
          navigator.mediaDevices.getUserMedia({
            // audio: {
            //   mandatory: {
            //     chromeMediaSource: 'desktop'
            //   }
            // },
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

module.exports.shareScreen = shareScreen;
