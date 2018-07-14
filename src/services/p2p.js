import Peer from 'simple-peer'
import { shareScreen } from './renderer'

class P2P {
  constructor (){
    this.localPeer = null
  }

  connectToFriend(useVideo, signal){
    if(this.localPeer && signal){
      this.localPeer.signal(signal)
      console.log('final signal')
      return
    }

    // return navigator.mediaDevices.getUserMedia({ video: useVideo, audio: true})
    return shareScreen()
      .then(stream => {
        console.log(stream)
        let initiator = true
        if(signal){
          initiator = false
        }

        this.newPeer(initiator, stream)
        if(signal){
          signal = JSON.parse(signal)
          this.localPeer.signal(signal)
        }

        return this
      })
      .catch(err => {
        console.error('failed to getUserMedia', err)
      })
  }

  newPeer(initiator, stream){
    console.log('newPeer', initiator, stream)
    this.localPeer = new Peer({initiator, stream, trickle: false})
    this.localPeer.on('signal', this.onSignal.bind(this))
    this.localPeer.on('stream', this.onStream.bind(this))
    this.localPeer.on('connect', this.onConnect.bind(this))
    this.localPeer.on('close', this.onClose.bind(this))
    this.localPeer.on('track', this.onTrack.bind(this))
    this.localPeer.on('error', this.onError.bind(this))
    this.localPeer.on('data', this.onData.bind(this))
  }

  onConnect(){
    this.localPeer.send('hey peer')
    console.log('onConnect')
    if(typeof this._onConnect === 'function'){
      this._onConnect()
    }
    return this
  }

  setOnConnect(callback){
    this._onConnect = callback
  }

  onTrack(track, stream){
    if(typeof this._onTrack === 'function'){
      this._onTrack(track, stream)
    }
    return this
  }

  setOnTrack(callback){
    this._onTrack = callback
  }

  onData(data){
    console.log('got data', data)
    if(typeof this._onData === 'function'){
      this._onData(data)
    }
    return this
  }

  setOnData(callback){
    this._onData = callback
  }

  onSignal(signal){
    console.log('signal', signal)
    if(typeof this._onSignal === 'function'){
      this._onSignal(signal)
    }
    return this
  }

  setOnSignal(callback){
    this._onSignal = callback
  }

  onStream(stream){
    console.log('onStream')
    if(typeof this._onStream === 'function'){
      this._onStream(stream)
    }
    return this
  }

  setOnStream(callback){
    this._onStream = callback
  }

  onError(err){
    if(typeof this._onError === 'function'){
      this._onError(err)
    }
    return this
  }

  setOnError(callback){
    this._onError = callback
  }

  onClose(){
    if(typeof this._onClose === 'function'){
      this._onClose()
    }
    this.localPeer = false
    return this
  }

  setOnClose(callback){
    this._onClose = callback
  }
}

export default new P2P()