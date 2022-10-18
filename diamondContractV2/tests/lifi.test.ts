import { clearStore, test, newMockEvent } from 'matchstick-as/assembly/index'
import { handleLiFiTransferStarted } from '../src/mapping'
import { LiFiTransferStarted } from '../generated/LiFiDiamond/LiFiDiamond'
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'

test('simple', () => {
  let mockEvent = newMockEvent()

  const tuple = new ethereum.Tuple()

  tuple[0] = ethereum.Value.fromBytes(Bytes.fromHexString('0x4e42aa82610ddcfbbcb843621d8b207a0223a2297da23bc1ef28fb1437052fc0'))//transactionId
  tuple[1] = ethereum.Value.fromString('multichain') //bridge
  tuple[2] = ethereum.Value.fromString('localhost') //integrator
  tuple[3] = ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000000')) //referrer
  tuple[4] = ethereum.Value.fromAddress(Address.fromString('0xd69b31c3225728cc57ddaf9be532a4ee1620be51')) //sendingAssetId
  tuple[5] = ethereum.Value.fromAddress(Address.fromString('0x552008c0f6870c2f77e5cc1d2eb9bdff03e30ea0')) //receiver
  tuple[6] = ethereum.Value.fromUnsignedBigInt(new BigInt(12000000)) //minAmount
  tuple[7] = ethereum.Value.fromUnsignedBigInt(new BigInt(42161)) //destinationChainId
  tuple[8] = ethereum.Value.fromBoolean(false) //hasSourceSwap
  tuple[9] = ethereum.Value.fromBoolean(false) //hasDestincationCall

  const started = new LiFiTransferStarted(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    [
      new ethereum.EventParam("bridgeData", ethereum.Value.fromTuple(tuple))
    ],
    mockEvent.receipt
  )

  handleLiFiTransferStarted(started)
  
  clearStore()
})