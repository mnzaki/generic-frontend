import io from 'socket.io-client'
import { serviceUrl, serviceHostport } from '../config'

const serviceWsUrl = `ws://${serviceHostport}`

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
  const chanResp = await fetch(`${serviceUrl}/${socketName}`, { method: 'POST' })
  const chanJSON = await chanResp.json()
  console.log('this is', `${serviceWsUrl}/${socketName}`, chanJSON)
  console.log('connecting to RPC Proxy at', `${chanJSON.paths.rpc}`, chanJSON)
  rpcWS = new WebSocket(`${serviceWsUrl}${chanJSON.paths.rpc}`)
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
        ws: chanJSON.paths.rpc,
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
