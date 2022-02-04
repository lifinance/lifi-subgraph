import { clearStore, test, newMockEvent } from 'matchstick-as/assembly/index'
import { handleLiFiTransferStarted } from '../src/mapping'
import { LiFiTransferStarted } from '../generated/LiFiDiamond/LiFiDiamond'
import { ethereum } from '@graphprotocol/graph-ts'

test('simple', () => {
  let mockEvent = newMockEvent()

  const started = new LiFiTransferStarted(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  started.parameters.push(new ethereum.EventParam("transactionId", ethereum.Value.fromString('22')))
  // ToDo: add more values

  // handleLiFiTransferStarted(started)
  
  clearStore()
})