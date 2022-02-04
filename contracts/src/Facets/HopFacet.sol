// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ILiFi } from "../Interfaces/ILiFi.sol";
import { IHopBridge } from "../Interfaces/IHopBridge.sol";
import { LibAsset } from "../Libraries/LibAsset.sol";
import { LibSwap } from "../Libraries/LibSwap.sol";
import { AppStorage } from "../Libraries/AppStorage.sol";

contract HopFacet is ILiFi {
    /* ========== App Storage ========== */

    AppStorage internal s;

    /* ========== Types ========== */

    struct HopData {
        uint256 chainId;
        uint256 amount;
        uint256 relayerFee;
        address assetId;
        address recipient;
    }

    /* ========== Public Bridge Functions ========== */

    /**
     * @notice Bridges tokens via Hop Protocol
     * @param _lifiData data used purely for tracking and analytics
     * @param _hopData data specific to Hop Protocol
     */
    function startBridgeTokensViaHop(LiFiData memory _lifiData, HopData calldata _hopData) public payable {
        LibAsset.transferFromERC20(_hopData.assetId, msg.sender, address(this), _hopData.amount);

        _startBridge(_hopData);

        emit LiFiTransferStarted(
            _lifiData.transactionId,
            _lifiData.integrator,
            _lifiData.referrer,
            _lifiData.sendingAssetId,
            _lifiData.receivingAssetId,
            _lifiData.receiver,
            _lifiData.amount,
            _lifiData.destinationChainId,
            block.timestamp
        );
    }

    /**
     * @notice Performs a swap before bridging via Hop Protocol
     * @param _lifiData data used purely for tracking and analytics
     * @param _swapData an array of swap related data for performing swaps before bridging
     * @param _hopData data specific to Hop Protocol
     */
    function swapAndStartBridgeTokensViaHop(
        LiFiData memory _lifiData,
        LibSwap.SwapData[] calldata _swapData,
        HopData calldata _hopData
    ) public payable {
        address fromToken = _hopData.assetId;
        uint256 _fromTokenBalance = LibAsset.getOwnBalance(fromToken);

        // Swap
        for (uint8 i; i < _swapData.length; i++) {
            LibSwap.swap(_lifiData.transactionId, _swapData[i]);
        }

        require(LibAsset.getOwnBalance(fromToken) - _fromTokenBalance >= _hopData.amount, "ERR_INVALID_AMOUNT");

        _startBridge(_hopData);

        emit LiFiTransferStarted(
            _lifiData.transactionId,
            _lifiData.integrator,
            _lifiData.referrer,
            _lifiData.sendingAssetId,
            _lifiData.receivingAssetId,
            _lifiData.receiver,
            _lifiData.amount,
            _lifiData.destinationChainId,
            block.timestamp
        );
    }

    /* ========== Internal Functions ========== */

    /**
     * @dev Conatains the business logic for the bridge via Hop Protocol
     * @param _hopData data specific to Hop Protocol
     */
    function _startBridge(HopData calldata _hopData) internal {
        // Do HOP stuff
        require(s.hopChainId != _hopData.chainId, "Cannot bridge to the same network.");

        LibAsset.approveERC20(IERC20(_hopData.assetId), address(s.hopBridges[_hopData.assetId]), _hopData.amount);

        // Give Connext approval to bridge tokens
        LibAsset.approveERC20(IERC20(_hopData.assetId), address(s.hopBridges[_hopData.assetId]), _hopData.amount);

        if (s.hopChainId == 1) {
            // Ethereum L1
            IHopBridge(s.hopBridges[_hopData.assetId]).sendToL2(
                _hopData.chainId,
                _hopData.recipient,
                _hopData.amount,
                0,
                0,
                address(0),
                0
            );
        } else {
            // L2
            IHopBridge(s.hopBridges[_hopData.assetId]).send(
                _hopData.chainId,
                _hopData.recipient,
                _hopData.amount,
                0,
                0
            );
        }
    }
}
