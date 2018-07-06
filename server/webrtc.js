const session = require('./session');
const connected_clients = {};

module.exports = function (io) {

  io.on('connection', conn => {
    conn.on('identify', identity => {
      const valid = session.validateSessionId(identity.id, identity.pin);
      if (valid.valid) {
        conn.identity = identity;
        conn.validity = valid;
        const session = connected_clients[identity.id];
        if (session) {
          const search = searchSession(session, conn);
          console.log('search', search);
          if (search.connInSession) {
            session[search.connIdx] = conn;
          } else {
            session.push(conn);
          }
          conn.emit('waiting', valid);
          setTimeout(() => {
            let ready = isReadyForNegotiation(session);
            if (ready.ready) {
              console.log('ready');
              ready.host.emit('send_offer');
            }
          }, 1000);
        } else {
          connected_clients[identity.id] = [conn];
          conn.emit('waiting', valid);
        }
      } else {
        conn.emit('invalid_identity');
        conn.disconnect(true);
      }
    });

    conn.on('offer_answer', payload => {
      let session = connected_clients[conn.identity.id];

      if (session) {
        let ready = isReadyForNegotiation(session);
        if (ready.ready) {
          if (payload.offer) {
            ready.client.emit('send_answer', payload.offer);
          } else if (payload.answer) {
            ready.host.emit('complete_connection', payload.answer);
          }
        } else {
          conn.emit('waiting', conn.validity);
        }
      } else {
        conn.emit('send_identity');
      }
    });

    conn.on('disconnect', () => {
      if (conn.identity && connected_clients[conn.identity.id]) {
        let session = connected_clients[conn.identity.id];
        for (let i = 0; i < session.length; i++) {
          if (conn === session[i]) {
            session.splice(i, 1);
            break;
          }
        }
        if (session.length === 0) {
          delete connected_clients[conn.identity.id];
        }
      }
    });
  });
};

function isReadyForNegotiation(session) {
  let ready = { ready: false, client: null, host: null };
  if (session.length >= 2) {
    for (let i = 0; i < session.length; i++) {
      if (session[i].validity.host) {
        ready.host = session[i];
      } else if (!ready.client) {
        ready.client = session[i];
      }
    }

    if (ready.client && ready.host) {
      ready.ready = true;
    }
  }
  return ready;
}

function searchSession(session, conn) {
  const out = { connInSession: false, sessionHasHost: false };
  if (session.length > 0) {
    for (let i = 0; i < session.length; i++) {
      let c = session[i];
      if (c === conn) {
        out.connInSession = true;
        out.connIdx = i;
      }

      if (c.validity.host) {
        out.sessionHasHost = true;
      }
    }
  }
  return out;
}
