import io from 'socket.io-client'
import { backendUrl } from '../config'

interface QrCodeServerResponse {
  qrCode: string
  identifier: any
}

export interface QrCodeClientResponse {
  qrCode: string
  socket: SocketIOClient.Socket
  identifier: string
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
    socket.on('qrCode', ({ qrCode, identifier }: QrCodeServerResponse) => {
      return resolve({ qrCode, socket, identifier })
    }),
  )
}

export const awaitStatus = ({ socket, identifier }: Status) => {
  return new Promise((resolve, reject) => {
    socket.on(identifier, (data: any) => {
      const parsedData = JSON.parse(data)
      if (parsedData.status === 'failure') {
        reject(parsedData)
      } else {
        resolve(parsedData)
      }
    })
  })
}
