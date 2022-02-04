import { BigInt, dataSource } from "@graphprotocol/graph-ts";

import {
  LiFiTransferStarted
} from "../generated/LiFiDiamond/LiFiDiamond"
import { LiFiTransfer } from "../generated/schema";

 /*
 * @param event - The contract event to update the subgraph record with
 */
 export function handleLiFiTransferStarted(event: LiFiTransferStarted): void {

  let transferId = event.params.transactionId.toHex();
  let lifiTransfer = LiFiTransfer.load(transferId);
  if (lifiTransfer == null) {
    lifiTransfer = new LiFiTransfer(transferId);
  }

 lifiTransfer.integrator = event.params.integrator;
  lifiTransfer.referrer = event.params.referrer;
  lifiTransfer.sendingAssetId = event.params.sendingAssetId;
  lifiTransfer.receivingAssetId = event.params.receivingAssetId;
  lifiTransfer.receiver = event.params.receiver;
  lifiTransfer.amount = event.params.amount;
  lifiTransfer.destinationChainId = event.params.destinationChainId;
  lifiTransfer.timestamp = event.params.timestamp;
  lifiTransfer.save()
}
