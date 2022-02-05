import { dataSource } from '@graphprotocol/graph-ts'
import { LiFiTransferStarted } from '../generated/LiFiDiamond/LiFiDiamond'
import { LiFiTransfer } from '../generated/schema'

/*
* @param event - The contract event to update the subgraph record with
*/
export function handleLiFiTransferStarted(event: LiFiTransferStarted): void {

  // load or create entity for transactionId
  let transferId = event.params.transactionId.toHex()
  let lifiTransfer = LiFiTransfer.load(transferId)
  if (lifiTransfer == null) {
    lifiTransfer = new LiFiTransfer(transferId)
  }

  // store event data in entity
  lifiTransfer.integrator = event.params.integrator
  lifiTransfer.referrer = event.params.referrer
  lifiTransfer.fromTokenAddress = event.params.sendingAssetId
  lifiTransfer.toTokenAddress = event.params.receivingAssetId
  lifiTransfer.toAddress = event.params.receiver
  lifiTransfer.fromAmount = event.params.amount
  lifiTransfer.toChainId = event.params.destinationChainId.toI32()

  // store additional information
  lifiTransfer.timestamp = event.params.timestamp
  lifiTransfer.gasLimit = event.transaction.gasLimit
  lifiTransfer.gasPrice = event.transaction.gasPrice
  lifiTransfer.fromAddress = event.transaction.from
  lifiTransfer.transactionHash = event.transaction.hash

  // parse bridge
  const callSignature = event.transaction.input.toHexString()
  if (callSignature.startsWith('0xe18a8fdb')) {
    lifiTransfer.bridge = 'multichain'
    lifiTransfer.hasSourceSwap = false
  } else if (callSignature.startsWith('0x73bbd5c6')) {
    lifiTransfer.bridge = 'multichain'
    lifiTransfer.hasSourceSwap = true
  } else if (callSignature.startsWith('0x7d7aecd3')) {
    lifiTransfer.bridge = 'connext'
    lifiTransfer.hasSourceSwap = false
  } else if (callSignature.startsWith('0x2a7a7042')) {
    lifiTransfer.bridge = 'connext'
    lifiTransfer.hasSourceSwap = true
  } else if (callSignature.startsWith('0x327a564d')) {
    lifiTransfer.bridge = 'hop'
    lifiTransfer.hasSourceSwap = false
  } else if (callSignature.startsWith('0x2722a4a8')) {
    lifiTransfer.bridge = 'hop'
    lifiTransfer.hasSourceSwap = true
  } else if (callSignature.startsWith('0xc2c134df')) {
    lifiTransfer.bridge = 'cbridge'
    lifiTransfer.hasSourceSwap = false
  } else if (callSignature.startsWith('0x01c0a31a')) {
    lifiTransfer.bridge = 'cbridge'
    lifiTransfer.hasSourceSwap = true
  }

  // parse fromChainId
  let network = dataSource.network()
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
  }
  // near-mainnet
  // near-testnet
  lifiTransfer.fromChainId = chainId

  // save changes
  lifiTransfer.save()
}
