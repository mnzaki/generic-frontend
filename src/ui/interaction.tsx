import React, { useState } from 'react'
import { getQrCode, awaitStatus } from '../utils/sockets'
import { InteractionButton } from './interactionButton'
import { SelectionComponent } from './selectionComponent'
import {
  InteractionType,
  ServiceCredentials,
  ShareCredentials,
} from '../config'

interface Props {
  interactionType: InteractionType
}

export const InteractionContainer = (props: Props) => {
  const { interactionType } = props
  const [qr, setQr] = useState<string>('')
  const [err, setErr] = useState<boolean>(false)

  // TODO use Set instead of array
  const [issuedCredentials, setIssued] = useState<Array<string>>([
    ServiceCredentials.FirstCredential,
  ])
  const [invalidCredentials, setInvalid] = useState<Array<string>>([])
  const [requestedCredentials, setRequested] = useState<Array<string>>([
    ShareCredentials.Email,
  ])
  const [description, setDescription] = useState<string>('Unlock your scooter')

  const availableIssueCredentials = Object.values(ServiceCredentials)
  const availableShareCredentials = [
    ...Object.values(ShareCredentials),
    ...availableIssueCredentials,
  ]

  const onClick = async () => {
    const { qrCode, socket, identifier } = await getQrCode(interactionType, {
      ...(interactionType === InteractionType.Receive && {
        types: Array.from(new Set(issuedCredentials)),
        invalid: Array.from(new Set(invalidCredentials)),
      }),
      ...(interactionType === InteractionType.Share && {
        types: Array.from(new Set(requestedCredentials)),
      }),
      ...(interactionType === InteractionType.Auth && {
        desc: description,
      }),
    })

    setQr(qrCode)
    awaitStatus({ socket, identifier })
      .then((obj: any) => {
        if (obj.status === 'success') setQr('')
      })
      .catch(e => setErr(e))
  }

  const handleSelect = (array: string[], item: string) => {
    return !array.includes(item)
      ? [...array, item]
      : array.filter(val => val !== item)
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
      <h2>{interactionType.toUpperCase()}</h2>
      {interactionType === InteractionType.Receive && (
        <>
          <SelectionComponent
            title={'Available Credentials'}
            options={availableIssueCredentials}
            onSelect={type => setIssued(handleSelect(issuedCredentials, type))}
            selectedItems={issuedCredentials}
          />
          <SelectionComponent
            title={'Break Credentials'}
            options={issuedCredentials}
            onSelect={type =>
              setInvalid(handleSelect(invalidCredentials, type))
            }
            selectedItems={invalidCredentials}
          />
        </>
      )}

      {interactionType === InteractionType.Share && (
        <SelectionComponent
          title={'Request Credentials'}
          options={availableShareCredentials}
          onSelect={type =>
            setRequested(handleSelect(requestedCredentials, type))
          }
          selectedItems={requestedCredentials}
        />
      )}

      {interactionType === InteractionType.Auth && (
        <div style={{ paddingTop: '20px' }}>
          <h4>Description</h4>
          <input
            style={{
              margin: '10px',
              width: '100%',
            }}
            type="text"
            name="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
      )}

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
        <InteractionButton
          onClick={onClick}
          text={interactionType.toUpperCase()}
        />

        {err ? (
          <b>Error</b>
        ) : (
          qr && <img src={qr} className="c-qrcode" alt="QR Code" />
        )}
      </div>
    </div>
  )
}
