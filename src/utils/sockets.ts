import io from 'socket.io-client'
//import { backendUrl } from '../config'

const backendUrl = 'ws://localhost:9000'
interface QrCodeServerResponse {
  authTokenQR: string
  authToken: string
  identifier: string
  ws: string
}

export interface QrCodeClientResponse extends QrCodeServerResponse {
  socket: SocketIOClient.Socket
}

interface Status {
  socket: SocketIOClient.Socket
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

export const getQrCode = (
  socketName: string,
): Promise<QrCodeClientResponse> => {
  console.log('this is', `${backendUrl}/${socketName}`)
  const socket = new WebSocket(`${backendUrl}/${socketName}`)
  const promise = new Promise(resolve => {
    socket.onmessage = (evt) => {
      const { authTokenQR, authToken, identifier }: QrCodeServerResponse = JSON.parse(evt.data)
      sockMap[identifier] = {
        socket,
        promise,
        msgN: 0,
        messages: {}
      }
      resolve({ authTokenQR, authToken, identifier, socket })
    }
  })
  return promise as Promise<QrCodeClientResponse>
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
