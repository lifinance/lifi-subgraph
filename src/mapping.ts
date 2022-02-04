import {
  LiFiTransferStarted
} from "../generated/LiFiDiamond/LiFiDiamond"
import { LiFiTransfer } from "../generated/schema";

/*
* @param event - The contract event to update the subgraph record with
*/
export function handleLiFiTransferStarted(event: LiFiTransferStarted): void {

  // load or create entity for transactionId
  let transferId = event.params.transactionId.toHex();
  let lifiTransfer = LiFiTransfer.load(transferId);
  if (lifiTransfer == null) {
    lifiTransfer = new LiFiTransfer(transferId);
  }

  // store event data in entity
  lifiTransfer.integrator = event.params.integrator;
  lifiTransfer.referrer = event.params.referrer;
  lifiTransfer.sendingAssetId = event.params.sendingAssetId;
  lifiTransfer.receivingAssetId = event.params.receivingAssetId;
  lifiTransfer.receiver = event.params.receiver;
  lifiTransfer.amount = event.params.amount;
  lifiTransfer.destinationChainId = event.params.destinationChainId;

  // store additional information
  lifiTransfer.timestamp = event.params.timestamp
  lifiTransfer.gasUsed = event.transaction.gasUsed
  lifiTransfer.gasPrice = event.transaction.gasPrice
  lifiTransfer.sender = event.transaction.from
  lifiTransfer.transactionHash = event.transaction.hash

  // call
  const callSignature = event.transaction.input.toHexString()
  if (callSignature.startsWith('0xe18a8fdb')) {
    lifiTransfer.bridge = 'multichain'
    lifiTransfer.hasSourceSwap = false
  } else if (callSignature.startsWith('XX')) {
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
  } else if (callSignature.startsWith('XX')) {
    lifiTransfer.bridge = 'cbridge'
    lifiTransfer.hasSourceSwap = true
  }

  // save changes
  lifiTransfer.save()
}
