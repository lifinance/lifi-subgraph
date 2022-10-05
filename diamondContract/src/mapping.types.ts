export interface BridgeData {
    transactionId: string
    bridge: string
    integrator: string
    referrer: string
    sendingAssetId: string
    receiver: string
    minAmount: string
    destinationChainId: string
    hasSourceSwap: boolean
    hasDestinationCall: boolean
}