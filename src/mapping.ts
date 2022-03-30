import { Address, Bytes, dataSource, log } from '@graphprotocol/graph-ts'
import { AssetSwapped, LiFiTransferStarted, NXTPBridgeStarted } from '../generated/LiFiDiamond/LiFiDiamond'
import { DestinationSwap, LiFiTransfer, User } from '../generated/schema'

const serverSigner = Address.fromString('0x997f29174a766A1DA04cf77d135d59Dd12FB54d1')

function parseChainId(network: string): i32 {
  let chainId = 0
  if (network == 'mainnet') {
    chainId = 1
  } else if (network == 'ropsten') {
    chainId = 3
  } else if (network == 'rinkeby') {
    chainId = 4
  } else if (network == 'goerli') {
    chainId = 5
  } else if (network == 'optimism') {
    chainId = 10
  } else if (network == 'kovan') {
    chainId = 42
  } else if (network == 'bsc') {
    chainId = 56
  } else if (network == 'optimism-kovan') {
    chainId = 69
  } else if (network == 'poa-sokol') {
    chainId = 77
  } else if (network == 'chapel') {
    chainId = 97
  } else if (network == 'poa-core') {
    chainId = 99
  } else if (network == 'xdai') {
    chainId = 100
  } else if (network == 'fuse') {
    chainId = 122
  } else if (network == 'matic') {
    chainId = 137
  } else if (network == 'fantom') {
    chainId = 250
  } else if (network == 'clover') {
    chainId = 1024
  } else if (network == 'moonriver') {
    chainId = 1285
  } else if (network == 'mbase') {
    chainId = 1287
  } else if (network == 'arbitrum-one') {
    chainId = 42161
  } else if (network == 'celo') {
    chainId = 42220
  } else if (network == 'fuji') {
    chainId = 43113
  } else if (network == 'avalanche') {
    chainId = 43114
  } else if (network == 'celo-alfajores') {
    chainId = 44787
  } else if (network == 'mumbai') {
    chainId = 80001
  } else if (network == 'arbitrum-rinkeby') {
    chainId = 421611
  } else if (network == 'aurora') {
    chainId = 1313161554
  } else if (network == 'aurora-testnet') {
    chainId = 1313161555
  } else {
    log.error(`Unknown network name passed = {}`, [network])
  }
  // near-mainnet
  // near-testnet
  return chainId
}

function parseCalledBridge(callData: Bytes): string | null {
  const callSignature = callData.toHexString()
  let bridge: string
  let hasSourceSwap: boolean
  if (callSignature.startsWith('0xe18a8fdb')) {
    bridge = 'multichain'
    hasSourceSwap = false
  } else if (callSignature.startsWith('0x73bbd5c6')) {
    bridge = 'multichain'
    hasSourceSwap = true
  } else if (callSignature.startsWith('0x7d7aecd3')) {
    bridge = 'connext'
    hasSourceSwap = false
  } else if (callSignature.startsWith('0x2a7a7042')) {
    bridge = 'connext'
    hasSourceSwap = true
  } else if (callSignature.startsWith('0x327a564d')) {
    bridge = 'hop'
    hasSourceSwap = false
  } else if (callSignature.startsWith('0x2722a4a8')) {
    bridge = 'hop'
    hasSourceSwap = true
  } else if (callSignature.startsWith('0xc2c134df')) {
    bridge = 'cbridge'
    hasSourceSwap = false
  } else if (callSignature.startsWith('0x01c0a31a')) {
    bridge = 'cbridge'
    hasSourceSwap = true
  } else {
    log.error('Unknown callSignature passed = {}', [callSignature])
  }

  return bridge
}

/*
* @param event - The contract event to update the subgraph record with
*/
export function handleLiFiTransferStarted(event: LiFiTransferStarted): void {
  // parse bridge
  const bridge = parseCalledBridge(event.transaction.input)

  // it might happen that we don't know the bridge signature yet. in this case we skip the transaction
  if (bridge) {
    // fromAddress
    const fromAddress = event.transaction.from
    let fromUser = User.load(fromAddress.toHex())
    if (fromUser == null) {
      fromUser = new User(fromAddress.toHex())
      fromUser.address = fromAddress
      fromUser.save()
    }

    // toAddress
    const toAddress = event.params.receiver
    let toUser = User.load(toAddress.toHex())
    if (toUser == null) {
      toUser = new User(toAddress.toHex())
      toUser.address = toAddress
      toUser.save()
    }

    // parse fromChainId
    let network = dataSource.network()
    let chainId = parseChainId(network)

    // load or create entity for transactionId
    let transferId = event.params.transactionId.toHex()
    let lifiTransfer = LiFiTransfer.load(transferId)
    if (lifiTransfer == null) {
      lifiTransfer = new LiFiTransfer(transferId)
    }

    // store event data in entity
    lifiTransfer.fromAddress = fromAddress
    lifiTransfer.fromUser = fromUser.id
    lifiTransfer.fromTokenAddress = event.params.sendingAssetId
    lifiTransfer.fromAmount = event.params.amount
    lifiTransfer.fromChainId = chainId

    lifiTransfer.toAddress = toAddress
    lifiTransfer.toUser = toUser.id
    lifiTransfer.toTokenAddress = event.params.receivingAssetId
    lifiTransfer.toChainId = event.params.destinationChainId.toI32()

    lifiTransfer.hasSourceSwap = lifiTransfer.hasSourceSwap || false
    lifiTransfer.hasDestinationSwap = lifiTransfer.hasDestinationSwap || false
    lifiTransfer.hasServerSign = lifiTransfer.hasServerSign || false

    lifiTransfer.bridge = bridge
    lifiTransfer.integrator = event.params.integrator
    lifiTransfer.referrer = event.params.referrer
    lifiTransfer.gasLimit = event.transaction.gasLimit
    lifiTransfer.gasPrice = event.transaction.gasPrice
    lifiTransfer.timestamp = event.params.timestamp
    lifiTransfer.transactionHash = event.transaction.hash

    // save changes
    lifiTransfer.save()
  }
}

/*
* @param event - The contract event to update the subgraph record with
*/
export function handleNXTPBridgeStarted(event: NXTPBridgeStarted): void {
  // load or create entity for transactionId
  let transferId = event.params.lifiTransactionId.toHex()
  let lifiTransfer = LiFiTransfer.load(transferId)
  if (lifiTransfer == null) {
    lifiTransfer = new LiFiTransfer(transferId)
  }

  // store event data in entity
  lifiTransfer.hasDestinationSwap = !event.params.txData.callTo.equals(Address.zero())
  lifiTransfer.hasServerSign = event.params.txData.user.equals(serverSigner)

  // save changes
  lifiTransfer.save()
}

export function handleAssetSwapped(event: AssetSwapped): void {
  // load or create entity for transactionId
  let transferId = event.params.transactionId.toHex()

  const bridge = parseCalledBridge(event.transaction.input)
  if (bridge) {
    // we can be sure this is call on the source chain
    let entity = LiFiTransfer.load(transferId)
    if (entity == null) {
      entity = new LiFiTransfer(transferId)
      entity.hasSourceSwap = true
    }

    // store event data in entity
    entity.transactionHash = event.transaction.hash
    entity.swapExchangeAddress = event.params.dex
    entity.swapTokenAddress = event.params.fromAssetId
    entity.swapFromAmount = event.params.fromAmount

    // save changes
    entity.save()
  } else {
    // has to be a destination swap
    let entity = DestinationSwap.load(transferId)
    if (entity == null) {
      entity = new DestinationSwap(transferId)
    }

    // store event data in entity (duplicate code because entity can only be defined with one type)
    entity.transactionHash = event.transaction.hash
    entity.swapExchangeAddress = event.params.dex
    entity.swapTokenAddress = event.params.fromAssetId
    entity.swapFromAmount = event.params.fromAmount

    // save changes
    entity.save()
  }
}
