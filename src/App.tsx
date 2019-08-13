import React from 'react'
import './reset.css'
import './App.css'
import { getQrCode, awaitStatus } from './utils/sockets'
const jolocomLogo = require('./images/JO_icon.svg')

interface State {
  loading: boolean
  qrCode: {
    source: string
  }
}

const initialState: State = {
  loading: false,
  qrCode: {
    source: '',
  },
}

class App extends React.Component {
  state = initialState

  handleClick = async () => {
    const { qrCode } = this.state
    const { qrCode: ssoQrCode, socket, identifier } = await getQrCode(
      `authenticate`,
      {},
    )
    qrCode.source = ssoQrCode
    this.setState({ qrCode })

    await awaitStatus({ socket, identifier })
  }

  render() {
    return (
      <React.Fragment>
        <header className="c-header">
          <h1>Generic Frontend</h1>
        </header>
        <main>
          <article className="c-qrcode-container">
            {this.state.qrCode.source ? (
              <img
                src={this.state.qrCode.source}
                className="c-qrcode"
                alt="QR Code"
              />
            ) : (
              <button onClick={this.handleClick} className="c-qr-button">
                <img
                  src={jolocomLogo}
                  className="c-qr-button__image"
                  alt="Jolocom logo"
                />
                Get QR Code
              </button>
            )}
          </article>
        </main>
      </React.Fragment>
    )
  }
}

export default App
