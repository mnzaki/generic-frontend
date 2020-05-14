import io from 'socket.io-client'
import { backendUrl } from '../config'

interface QrCodeServerResponse {
  authTokenQR: string
  start: string
  identifier: string
}

export interface QrCodeClientResponse extends QrCodeServerResponse {
  socket: SocketIOClient.Socket
}

interface Status {
  socket: SocketIOClient.Socket
  identifier: string
}

export const getQrCode = (
  socketName: string,
  query: any,
): Promise<QrCodeClientResponse> => {
  const socket: SocketIOClient.Socket = io(`${backendUrl}/${socketName}`, {
    forceNew: true,
    query,
  })

  return new Promise(resolve =>
    socket.on(
      'RPCauth/req',
      ({ authTokenQR, identifier, start }: QrCodeServerResponse) => {
        return resolve({ authTokenQR, start, socket, identifier })
      },
    ),
  )
}

export const getEncryptedData = (data: string): Promise<string> => {
  const socket: SocketIOClient.Socket = io(`${backendUrl}/RPCencrypt`, {
    forceNew: true,
    query: { rpc: 'asymEncrypt', request: data },
  })

  return new Promise(resolve =>
    socket.on(
      'RPCencrypt/done',
      ({ response }: { rpc: string; response: string }) => {
        return resolve(response)
      },
    ),
  )
}

export const awaitStatus = ({ socket, identifier }: Status) => {
  return new Promise((resolve, reject) => {
    socket.on(identifier, (data: any) => {
      const parsedData = JSON.parse(data)
      if (parsedData.walletReady) {
        reject(parsedData)
      } else {
        resolve(parsedData)
      }
    })
  })
}
