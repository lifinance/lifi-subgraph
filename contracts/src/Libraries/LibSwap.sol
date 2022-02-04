// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { LibAsset } from "./LibAsset.sol";

library LibSwap {
    struct SwapData {
        address callTo;
        address sendingAssetId;
        address receivingAssetId;
        uint256 fromAmount;
        bytes callData;
    }

    event AssetSwapped(
        bytes32 transactionId,
        address dex,
        address fromAssetId,
        address toAssetId,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 timestamp
    );

    function swap(bytes32 transactionId, SwapData calldata _swapData) internal {
        uint256 fromAmount = _swapData.fromAmount;
        uint256 toAmount = LibAsset.getOwnBalance(_swapData.receivingAssetId);
        address fromAssetId = _swapData.sendingAssetId;
        if (!LibAsset.isNativeAsset(fromAssetId) && LibAsset.getOwnBalance(fromAssetId) != fromAmount) {
            LibAsset.transferFromERC20(_swapData.sendingAssetId, msg.sender, address(this), fromAmount);
        }

        LibAsset.approveERC20(IERC20(fromAssetId), _swapData.callTo, fromAmount);
        (bool success, ) = _swapData.callTo.call{ value: msg.value }(_swapData.callData);
        require(success, "ERR_DEX_SWAP_FAILED");

        toAmount = LibAsset.getOwnBalance(_swapData.receivingAssetId) - toAmount;
        emit AssetSwapped(
            transactionId,
            _swapData.callTo,
            _swapData.sendingAssetId,
            _swapData.receivingAssetId,
            fromAmount,
            toAmount,
            block.timestamp
        );
    }
}
