export default class Listener {
  constructor(setupCallbacks) {
    const onUpdate = (data) => {
      if (typeof this.successListener === 'function') {
        this.successListener(data);
      }
    };
    const onError = (error) => {
      if (typeof this.errorListener === 'function') {
        this.errorListener(error);
      }
    };
    setupCallbacks(onUpdate, onError);
  }

  listen(successListener) {
    this.successListener = successListener;
    return this;
  }

  catch(errorListener) {
    this.errorListener = errorListener;
    return this;
  }
}
