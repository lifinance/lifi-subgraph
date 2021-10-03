# LiFi contract Subgraph

# Relevant Events in Lifi Contracts


## 1. NXTPFacet.sol
[File Link](https://github.com/lifinance/lifi-contracts/blob/master/src/Facets/NXTPFacet.sol)
```
Line: 69    emit LiFiTransferStarted(
                _lifiData.transactionId,
                _lifiData.integrator,
                _lifiData.referrer,
                _lifiData.timestamp
            );
```

## 2. NXTPFacet.sol
[File Link](https://github.com/lifinance/lifi-contracts/blob/master/src/Facets/NXTPFacet.sol)
```
Line: 101    emit LiFiTransferStarted(
                _lifiData.transactionId,
                _lifiData.integrator,
                _lifiData.referrer,
                _lifiData.timestamp
            );
```

## 3. NXTPFacet.sol
[File Link](https://github.com/lifinance/lifi-contracts/blob/master/src/Facets/NXTPFacet.sol)
```
Line: 69    emit LiFiTransferCompleted(
                _lifiData.transactionId,
                _lifiData.integrator,
                _lifiData.referrer,
                _lifiData.timestamp
            );
```

## 4. NXTPFacet.sol
[File Link](https://github.com/lifinance/lifi-contracts/blob/master/src/Facets/NXTPFacet.sol)
```
Line: 69    emit LiFiTransferCompleted(
                _lifiData.transactionId,
                _lifiData.integrator,
                _lifiData.referrer,
                _lifiData.timestamp
            );
```

## 5. NXTPFacet.sol
[File Link](https://github.com/lifinance/lifi-contracts/blob/master/src/Facets/NXTPFacet.sol)
```
Line: 78        
        emit NXTPBridgeStarted(
            result.user,
            result.router,
            result.transactionId,
            result,
            msg.sender,
            _nxtpData.encryptedCallData,
            _nxtpData.encodedBid,
            _nxtpData.bidSignature
        );
```

## 6. LibLiFi.sol
[File Link](https://github.com/lifinance/lifi-contracts/blob/master/src/Libraries/LibLiFi.sol)
```
Line: 29        emit AssetSwapped(_swapData.fromToken, _swapData.toToken, _swapData.fromAmount, _swapData.toAmount);
```

## 7. LibDiamond.sol
[File Link](https://github.com/lifinance/lifi-contracts/blob/master/src/Libraries/LibDiamond.sol)
```
Line: 78        emit DiamondCut(_diamondCut, _init, _calldata);
```

## 8. LibDiamond.sol
[File Link](https://github.com/lifinance/lifi-contracts/blob/master/src/Libraries/LibDiamond.sol)
```
Line: 47        emit OwnershipTransferred(previousOwner, _newOwner);
```

## 9. WithdrawFacet.sol
[File Link](https://github.com/lifinance/lifi-contracts/blob/master/src/Facets/WithdrawFacet.sol)
```
Line: 37        emit LogWithdraw(sendTo, _assetAddress, _amount);
```

Contract address: 
```
0xa74D44ed9C3BB96d7676E7A274c33A05210cf35a
```
goerli
rinkeby
ropsten
mumbai
polygon
xdai
bsc
fantom
