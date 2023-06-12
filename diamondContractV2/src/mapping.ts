import { dataSource, log } from '@graphprotocol/graph-ts'
import {
  AssetSwapped,
  LiFiSwappedGeneric,
  LiFiTransferCompleted,
  LiFiTransferStarted,
} from '../generated/LiFiDiamond/LiFiDiamond'
import {
  LiFiSwap,
  LiFiTransfer,
  LiFiTransferDestinationSide,
  Swap,
  User,
} from '../generated/schema'

// If we support more than 2 swaps in tx, change this number
const MAX_SWAPS_COUNT = 2

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
  if (!event.params || !event.params.bridgeData) return
  const bridgeData = event.params.bridgeData

  // fromAddress
  const fromAddress = event.transaction.from
  let fromUser = User.load(fromAddress.toHex())
  if (fromUser == null) {
    fromUser = new User(fromAddress.toHex())
    fromUser.address = fromAddress.toHex()
    fromUser.save()
  }

  // toAddress
  const toAddress = bridgeData.receiver.toHexString()
  let toUser = User.load(toAddress)
  if (toUser == null) {
    toUser = new User(toAddress)
    toUser.address = toAddress
    toUser.save()
  }

  // parse fromChainId
  let network = dataSource.network()
  let chainId = parseChainId(network)

  // load or create entity for transactionId
  let transferId = bridgeData.transactionId.toHexString()
  let lifiTransfer = LiFiTransfer.load(transferId)
  if (lifiTransfer == null) {
    lifiTransfer = new LiFiTransfer(transferId)
  }
  // Old handling
  // Search for the first swap
  let swap = Swap.load(`${transferId}_0`)
  if (swap) {
    lifiTransfer.sourceSwap = swap.id
  }

  // store event data in entity
  lifiTransfer.fromAddress = fromAddress
  lifiTransfer.fromUser = fromUser.id
  lifiTransfer.fromTokenAddress = bridgeData.sendingAssetId.toHexString()
  lifiTransfer.fromAmount = bridgeData.minAmount
  lifiTransfer.fromChainId = chainId

  lifiTransfer.toAddress = toAddress
  lifiTransfer.toUser = bridgeData.receiver.toHexString()

  // in some cases with old Solana chain id, the id has more than i32 symbols (1151111081099710)
  // so it breaks the mapping and the whole subgraph
  if (!bridgeData.destinationChainId.isI32()) return

  lifiTransfer.toChainId = bridgeData.destinationChainId.toI32()

  lifiTransfer.hasSourceSwap = bridgeData.hasSourceSwaps
  lifiTransfer.hasDestinationCall = bridgeData.hasDestinationCall
  //lifiTransfer.hasServerSign = lifiTransfer.hasServerSign || false

  lifiTransfer.bridge = bridgeData.bridge
  lifiTransfer.integrator = bridgeData.integrator
  lifiTransfer.referrer = bridgeData.referrer.toHexString()
  lifiTransfer.gasLimit = event.transaction.gasLimit
  lifiTransfer.gasPrice = event.transaction.gasPrice
  lifiTransfer.transactionHash = event.transaction.hash
  lifiTransfer.timestamp = event.block.timestamp
  lifiTransfer.block = event.block.number

  for (let i = 0; i < MAX_SWAPS_COUNT; i++) {
    let swapUniqueId = `${transferId}_${i}`
    let swap = Swap.load(swapUniqueId)
    if (swap) {
      swap.lifiTransfer = transferId
      swap.save()
    }
  }

  // save changes
  lifiTransfer.save()
}

/*
 * @param event - The contract event to update the subgraph record with
 * This event emits by Executor contract, needs to be removed and created
 * the new subgraph if needed
 */
export function handleLiFiTransferCompleted(
  event: LiFiTransferCompleted
): void {
  const transferId = event.params.transactionId.toHex()

  let lifiTransfer = LiFiTransferDestinationSide.load(transferId)
  if (lifiTransfer == null) {
    lifiTransfer = new LiFiTransferDestinationSide(transferId)
  }

  const toAddress = event.params.receiver
  let toUser = User.load(toAddress.toHex())
  if (toUser == null) {
    toUser = new User(toAddress.toHex())
    toUser.address = toAddress.toHex()
    toUser.save()
  }

  let swap = Swap.load(transferId)
  if (swap) lifiTransfer.destinationSwap = swap.id

  //toUser
  lifiTransfer.toUser = toUser.id
  lifiTransfer.timestamp = event.params.timestamp
  lifiTransfer.toAddress = event.params.receiver
  lifiTransfer.toTokenAddress = event.params.receivingAssetId
  lifiTransfer.toAmount = event.params.amount
  lifiTransfer.timestamp = event.block.timestamp
  lifiTransfer.transactionHash = event.transaction.hash
  lifiTransfer.block = event.block.number

  // save changes
  lifiTransfer.save()
}

/*
 * @param event - The contract event to update the subgraph record with
 */
export function handleLiFiSwappedGeneric(event: LiFiSwappedGeneric): void {
  const transferId = event.params.transactionId.toHex()

  const fromAddress = event.params.fromAssetId
  let fromUser = User.load(fromAddress.toHex())
  if (fromUser == null) {
    fromUser = new User(fromAddress.toHex())
    fromUser.address = fromAddress.toHex()
    fromUser.save()
  }

  let lifiSwap = LiFiSwap.load(transferId)

  if (lifiSwap == null) {
    lifiSwap = new LiFiSwap(transferId)
  }

  lifiSwap.integrator = event.params.integrator
  lifiSwap.referrer = event.params.referrer
  lifiSwap.timestamp = event.block.timestamp
  lifiSwap.fromUser = fromUser.id
  lifiSwap.transactionHash = event.transaction.hash

  for (let i = 0; i < MAX_SWAPS_COUNT; i++) {
    let swapUniqueId = `${transferId}_${i}`
    let swap = Swap.load(swapUniqueId)
    if (swap) {
      swap.lifiSwap = transferId
      swap.save()
    }
  }

  // Old handling
  // Search for the first swap
  let swap = Swap.load(`${transferId}_0`)
  if (swap) {
    lifiSwap.swap = swap.id
  }

  lifiSwap.save()
}

export function handleAssetSwapped(event: AssetSwapped): void {
  const transferId = event.params.transactionId.toHex()
  // Try to load first swap
  let swapUniqueId = `${transferId}_0`
  let swap = Swap.load(swapUniqueId)
  if (swap) {
    for (let i = 1; i < MAX_SWAPS_COUNT; i++) {
      swapUniqueId = `${transferId}_${i}`
      swap = Swap.load(swapUniqueId)
      if (!swap) {
        swap = new Swap(swapUniqueId)
        break
      }
    }
  } else {
    swap = new Swap(`${transferId}_0`)
  }

  let lifiTransfer = LiFiTransfer.load(transferId)
  if (lifiTransfer) {
    // Old handling
    lifiTransfer.sourceSwap = swap.id
    lifiTransfer.save()

    swap.lifiTransfer = lifiTransfer.id
  }

  let lifiTransferDestinationSide = LiFiTransferDestinationSide.load(transferId)
  if (lifiTransferDestinationSide) {
    lifiTransferDestinationSide.destinationSwap = swap.id
    lifiTransferDestinationSide.save()
  }

  let lifiSwap = LiFiSwap.load(transferId)
  if (lifiSwap) {
    // Old handling
    lifiSwap.swap = swap.id
    lifiSwap.save()

    swap.lifiSwap = lifiSwap.id
  }

  swap.dex = event.params.dex
  swap.fromTokenAddress = event.params.fromAssetId
  swap.toTokenAddress = event.params.toAssetId
  swap.fromAmount = event.params.fromAmount
  swap.toAmount = event.params.toAmount
  swap.timestamp = event.params.timestamp
  swap.transactionHash = event.transaction.hash

  swap.save()
}
