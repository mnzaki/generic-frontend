import React, { useState } from 'react'
import { getQrCode, awaitStatus, getEncryptedData } from '../utils/sockets'
import { InteractionButton } from './interactionButton'

export const InteractionContainer = () => {
  const [identifier, setIdentifier] = useState<string>('')
  const [wsAddr, setWsAddress] = useState<string>('')
  const [qr, setQr] = useState<string>('')
  const [jwt, setJwt] = useState<string>('')
  const [err, setErr] = useState<boolean>(false)

  const [encryptInput, setEncryptInput] = useState('')
  //const [decryptInput, setDecryptInput] = useState('')
  const [encryptOutput, setEncryptOutput] = useState<string>('')
  //const [decryptOutput, setdecryptOutput] = useState<string>('')
  const [encryptReady, setEncryptReady] = useState(false)

  const onClickStart = async () => {
    const { authTokenQR, ws, authToken, socket, identifier } = await getQrCode('rpcProxy')
    setQr(authTokenQR)
    setJwt(authToken)
    setIdentifier(identifier)
    setWsAddress(ws)
    awaitStatus(identifier)
      .then(() => {
        setQr('')
        setJwt('')
        setEncryptReady(true)
      })
      .catch((e: any) => setErr(e))
  }

  const onClickEncrypt = async () => {
    getEncryptedData(identifier, encryptInput).then(setEncryptOutput)
  }

  return (
    <div
      style={{
        background: '#ffefdf',
        marginTop: '70px',
        marginBottom: '70px',
        marginLeft: '10px',
        marginRight: '10px',
        padding: '30px',
        boxShadow: '0px 0px 80px 2px gray',
        borderRadius: '40px',
      }}
    >
      <h2>RPC Encrypt</h2>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        {encryptReady ? (
          <>
            <div style={{ paddingTop: '20px', width: '100%' }}>
              <h4>Data to encrypt</h4>
              <input
                style={{
                  margin: '10px',
                  width: '100%',
                }}
                type="text"
                name="description"
                value={encryptInput}
                onChange={e => setEncryptInput(e.target.value)}
              />
            </div>
            <InteractionButton
              onClick={onClickEncrypt}
              text={'Request Encryption'}
            />
          </>
        ) : (
          <InteractionButton onClick={onClickStart} text={'Start RPC Demo'} />
        )}

        {err ? (
          <b>Error</b>
        ) : (
          <div>
            <img src={qr} className="c-qrcode" alt="QR Code" />
            <pre>{jwt}</pre>
            <pre>yarn run ts-node rpc_agent {wsAddr}</pre>
          </div>
        )}
        {!!encryptOutput.length && (
          <div
            style={{
              border: '1px solid black',
              padding: '20px',
              backgroundColor: 'white',
              width: '500px',
              textAlign: 'center',
              overflowWrap: 'break-word',
              borderRadius: '10px',
            }}
          >
            <i>{encryptOutput}</i>
          </div>
        )}
      </div>
    </div>
  )
}
