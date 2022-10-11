import { dataSource, log } from '@graphprotocol/graph-ts';
import { CompleteTransferCall } from '../generated/Contract/Contract';

import { CompleteTransfer } from '../generated/schema';

function parseChainId(network: string): i32 {
  let chainId = 0;
  if (network == 'mainnet') {
    chainId = 1;
  } else if (network == 'ropsten') {
    chainId = 3;
  } else if (network == 'rinkeby') {
    chainId = 4;
  } else if (network == 'goerli') {
    chainId = 5;
  } else if (network == 'optimism') {
    chainId = 10;
  } else if (network == 'kovan') {
    chainId = 42;
  } else if (network == 'bsc') {
    chainId = 56;
  } else if (network == 'optimism-kovan') {
    chainId = 69;
  } else if (network == 'poa-sokol') {
    chainId = 77;
  } else if (network == 'chapel') {
    chainId = 97;
  } else if (network == 'poa-core') {
    chainId = 99;
  } else if (network == 'xdai') {
    chainId = 100;
  } else if (network == 'fuse') {
    chainId = 122;
  } else if (network == 'matic') {
    chainId = 137;
  } else if (network == 'fantom') {
    chainId = 250;
  } else if (network == 'clover') {
    chainId = 1024;
  } else if (network == 'moonriver') {
    chainId = 1285;
  } else if (network == 'mbase') {
    chainId = 1287;
  } else if (network == 'arbitrum-one') {
    chainId = 42161;
  } else if (network == 'celo') {
    chainId = 42220;
  } else if (network == 'fuji') {
    chainId = 43113;
  } else if (network == 'avalanche') {
    chainId = 43114;
  } else if (network == 'celo-alfajores') {
    chainId = 44787;
  } else if (network == 'mumbai') {
    chainId = 80001;
  } else if (network == 'arbitrum-rinkeby') {
    chainId = 421611;
  } else if (network == 'aurora') {
    chainId = 1313161554;
  } else if (network == 'aurora-testnet') {
    chainId = 1313161555;
  } else {
    log.error(`Unknown network name passed = {}`, [network]);
  }
  // near-mainnet
  // near-testnet
  return chainId;
}
/**
 * handleCompleteTransfer targets the
 *  function completeTransfer(bytes memory encodedVm) public
 * of the Wormhole token bridge contract.
 * the encodedVm is the value of the VAA (verified action approval) which means
 * that the query can be used to find the destination transaction of a token bridge
 * @param call
 */
export function handleCompleteTransfer(call: CompleteTransferCall): void {
  const completeTransfer = new CompleteTransfer(
    call.transaction.hash.toString()
  );
  const chainId = parseChainId(dataSource.network());

  completeTransfer.txHash = call.transaction.hash;
  completeTransfer.encodedVm = call.inputValues[0].value.toBytes();
  completeTransfer.from = call.transaction.from;
  completeTransfer.to = call.transaction.to;
  completeTransfer.timestamp = call.block.timestamp;
  completeTransfer.blockNumber = call.block.number;
  completeTransfer.chainId = chainId;
  completeTransfer.save();
}
