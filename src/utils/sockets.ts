import io from 'socket.io-client'
//import { backendUrl } from '../config'

const backendHostport = 'localhost:9000'
const backendUrl = `http://${backendHostport}`
const backendWSURL = `ws://${backendHostport}`

interface QrCodeServerResponse {
  authTokenQR: string
  authToken: string
  identifier: string
  ws: string
}

export interface QrCodeClientResponse extends QrCodeServerResponse {
  socket: WebSocket
}

interface Status {
  socket: WebSocket
  identifier: string
}

const sockMap: {[id: string]: any} = {}
/*  : {[identifier: string]: {
  socket: WebSocket,
  identifier: string,
  msgN: number,
  ws: string
} = {}
*/

let rpcWS: WebSocket

export const getQrCode = async (
  socketName: string,
): Promise<QrCodeClientResponse> => {
  const chanResp = await fetch(`${backendUrl}/${socketName}`, { method: 'POST' })
  const chanJSON = await chanResp.json()
  console.log('this is', `${backendUrl}/${socketName}`, chanJSON)
  console.log('connecting to RPC Proxy at', `${chanJSON.urls.rpc}`, chanJSON)
  rpcWS = new WebSocket(`${chanJSON.urls.rpc}`)
  rpcWS.onmessage = (evt) => {
    console.log('received from SSI Agent over rpcWS', evt.data)
    // FIXME TODO
  }
  const promise = new Promise<QrCodeClientResponse>(resolve => {
    rpcWS.onopen = (evt) => {
      resolve({
        authTokenQR: '',
        authToken: chanJSON.jwt,
        identifier: chanJSON.nonce,
        ws: chanJSON.urls.rpc,
        socket: rpcWS
      })
    }
  });

  sockMap[chanJSON.nonce] = {
    socket: rpcWS,
    promise,
    msgN: 0,
    messages: {}
  }

  return promise
}

export const getEncryptedData = (identifier: string, data: string): Promise<string> => {
  return new Promise(resolve => {
    const session = sockMap[identifier.toString()]
    const ws = session.socket
    const msgID = session.msgN++
    const msg = session.messages[msgID] = { id: msgID, rpc: 'asymEncrypt', request: data }
    ws.send(JSON.stringify(msg))
  })
}

export const awaitStatus = (identifier: string) => {
  return sockMap[identifier].promise
}
