import { Address, Bytes, dataSource, log } from '@graphprotocol/graph-ts'
import { LiFiTransferCompleted, LiFiTransferStarted, LiFiSwappedGeneric, AssetSwapped } from '../generated/LiFiDiamond/LiFiDiamond'
import { LiFiTransfer, User, LiFiSwap, Swap, LiFiTransferDestinationSide } from '../generated/schema'

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

/*
* @param event - The contract event to update the subgraph record with
*/
export function handleLiFiTransferStarted(event: LiFiTransferStarted): void {

  const bridge = event.params.bridge

  // it might happen that we don't know the bridge signature yet. in this case we skip the transaction
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

    lifiTransfer.hasSourceSwap = event.params.hasSourceSwap
    lifiTransfer.hasDestinationCall = event.params.hasDestinationCall
    lifiTransfer.hasServerSign = lifiTransfer.hasServerSign || false

    lifiTransfer.bridge = bridge
    lifiTransfer.integrator = event.params.integrator
    lifiTransfer.referrer = event.params.referrer
    lifiTransfer.gasLimit = event.transaction.gasLimit
    lifiTransfer.gasPrice = event.transaction.gasPrice
    lifiTransfer.transactionHash = event.transaction.hash
    lifiTransfer.timestamp = event.block.timestamp

    // save changes
    lifiTransfer.save()
}

/*
* @param event - The contract event to update the subgraph record with
*/
export function handleLiFiTransferCompleted(event: LiFiTransferCompleted): void {
  const transferId = event.params.transactionId.toHex()

  let lifiTransfer = LiFiTransferDestinationSide.load(transferId)
    if (lifiTransfer == null) {
      lifiTransfer = new LiFiTransferDestinationSide(transferId)
    }

  const toAddress = event.params.receiver
  let toUser = User.load(toAddress.toHex())
  if (toUser == null) {
      toUser = new User(toAddress.toHex())
      toUser.address = toAddress
      toUser.save()
  }


  //toUser
  lifiTransfer.toUser = toUser.id
  lifiTransfer.timestamp = event.params.timestamp
  lifiTransfer.toAddress = event.params.receiver
  lifiTransfer.toTokenAddress = event.params.receivingAssetId
  lifiTransfer.toAmount = event.params.amount
  lifiTransfer.timestamp = event.block.timestamp

  // save changes
  lifiTransfer.save()
}

/*
* @param event - The contract event to update the subgraph record with
*/
export function handleLiFiSwappedGeneric(event: LiFiSwappedGeneric): void {
  const transferId = event.params.transactionId.toHex()

  let swap = Swap.load(transferId)
  if (!swap) {
    swap = new Swap(transferId)
  }

  swap.fromTokenAddress = event.params.fromAssetId
  swap.toTokenAddress = event.params.toAssetId
  swap.fromAmount = event.params.fromAmount
  swap.toAmount = event.params.toAmount
  swap.timestamp = event.block.timestamp


  let lifiSwap = LiFiSwap.load(transferId)
  
  if (lifiSwap == null) {
    lifiSwap = new LiFiSwap(transferId)
  }

  lifiSwap.integrator = event.params.integrator
  lifiSwap.referrer = event.params.referrer
  lifiSwap.swap = swap.id

  //save changes
  swap.save()
  lifiSwap.save()
}

export function handleAssetSwapped(event: AssetSwapped): void {
  const transferId = event.params.transactionId.toHex()

  let lifiTransfer = LiFiTransfer.load(transferId)

  if (lifiTransfer) {
    let lifiSwap = new LiFiSwap(transferId)
    lifiSwap.timestamp = event.block.timestamp
    lifiTransfer.sourceSwap = lifiSwap.id
    lifiSwap.save()
    lifiTransfer.save()
  }

  let lifiTransferDest = LiFiTransferDestinationSide.load(transferId)
  if (lifiTransferDest) {
    let lifiSwap = new LiFiSwap(transferId)
    lifiSwap.timestamp = event.block.timestamp
    lifiTransferDest.destinationSwap = lifiSwap.id
    lifiSwap.save()
    lifiTransferDest.save()
  }

  let swap = Swap.load(transferId)
  if (!swap) {
    swap = new Swap(transferId)
  }

  swap.dex = event.params.dex
  swap.fromTokenAddress = event.params.fromAssetId
  swap.toTokenAddress = event.params.toAssetId
  swap.fromAmount = event.params.fromAmount
  swap.toAmount = event.params.toAmount
  swap.timestamp = event.params.timestamp

  swap.save()
}
