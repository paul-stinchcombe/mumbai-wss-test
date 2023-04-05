const Web3 = require('web3')

const WSS_Link =
  'wss://polygon-testnet.blastapi.io/f377cfe7-e769-4d72-9cd6-30bedb3744e9'
// const WSS_Link =
//   'wss://snowy-winter-voice.matic-testnet.discover.quiknode.pro/bef327d1b16299005bcedf6aa56a023f0b3c1982'

const web3 = new Web3(WSS_Link)

const options721 = {
  topics: [web3.utils.sha3('Transfer(address,address,uint256)')],
}

const options1155 = {
  topics: [
    web3.utils.sha3('TransferSingle(address,address,address,uint256,uint256)'),
  ],
}

async function main() {
  await web3.eth
    .getBalance('0xa56299b3cCa872B251a1caf49DDFA2a36FAC2Cd9')
    .then(console.log)

  let subscription721 = web3.eth.subscribe('logs', options721)
  let subscription1155 = web3.eth.subscribe('logs', options1155)

  subscription721.on('error', (err) => {
    throw err
  })
  subscription1155.on('error', (err) => {
    throw err
  })

  subscription721.on('connected', (nr) =>
    console.log('Subscription on ERC-721 started with ID %s', nr),
  )
  subscription1155.on('connected', (nr) =>
    console.log('Subscription on ERC-1155 started with ID %s', nr),
  )

  listenTo721(subscription721)
  listenTo1155(subscription1155)
}

function listenTo721(subscription721) {
  subscription721.on('data', (event) => {
    if (event.topics.length == 4) {
      let transaction = web3.eth.abi.decodeLog(
        [
          {
            type: 'address',
            name: 'from',
            indexed: true,
          },
          {
            type: 'address',
            name: 'to',
            indexed: true,
          },
          {
            type: 'uint256',
            name: 'tokenId',
            indexed: true,
          },
        ],
        event.data,
        [event.topics[1], event.topics[2], event.topics[3]],
      )
      console.log(
        `\n` +
          `New ERC-721 transaction found in block ${event.blockNumber} with hash ${event.transactionHash}\n` +
          `From: ${
            transaction.from === '0x0000000000000000000000000000000000000000'
              ? 'New mint!'
              : transaction.from
          }\n` +
          `To: ${transaction.to}\n` +
          ```Token contract: ${event.address}\n` +
          `Token ID: ${transaction.tokenId}`,
      )
    }
  })
}

function listenTo1155(subscription1155) {
  subscription1155.on('data', (event) => {
    let transaction = web3.eth.abi.decodeLog(
      [
        {
          type: 'address',
          name: 'operator',
          indexed: true,
        },
        {
          type: 'address',
          name: 'from',
          indexed: true,
        },
        {
          type: 'address',
          name: 'to',
          indexed: true,
        },
        {
          type: 'uint256',
          name: 'id',
        },
        {
          type: 'uint256',
          name: 'value',
        },
      ],
      event.data,
      [event.topics[1], event.topics[2], event.topics[3]],
    )
    console.log(
      `\n` +
        `New ERC-1155 transaction found in block ${event.blockNumber} with hash ${event.transactionHash}\n` +
        `Operator: ${transaction.operator}\n` +
        `From: ${
          transaction.from === '0x0000000000000000000000000000000000000000'
            ? 'New mint!'
            : transaction.from
        }\n` +
        `To: ${transaction.to}\n` +
        `id: ${transaction.id}\n` +
        `value: ${transaction.value}`,
    )
  })
}

;(async () => {
  await main()
})()
