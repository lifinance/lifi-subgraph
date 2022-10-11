import { CompleteTransferCall } from '../generated/Contract/Contract';
import { CompleteTransfer } from '../generated/schema';

/**
 * handleCompleteTransfer targets the
 *  function completeTransfer(bytes memory encodedVm) public
 * of the Wormhole token bridge contract.
 * the encodedVm is the value of the VAA (verified action approval) which means
 * that the query can be used to find the destination transaction of a token bridge
 * @param call
 */
export function handleCompleteTransfer(call: CompleteTransferCall): void {
  const transfer = new CompleteTransfer(call.transaction.hash.toString());
  const toAddress = call.transaction.to;
  const amount = call.transaction.value;
  transfer.txHash = call.transaction.hash;
  transfer.encodedVm = call.inputValues[0].value.toBytes();
  transfer.from = call.transaction.from;
  if (toAddress) {
    transfer.to = toAddress;
  }
  transfer.value = amount;
  transfer.timestamp = call.block.timestamp;
  transfer.blockNumber = call.block.number;
  transfer.save();
}
