// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import { AppStorage } from "../Libraries/AppStorage.sol";

contract HopInit {
    AppStorage internal s;

    function init(
        address[] memory _tokenAddresses,
        address[] memory _bridges,
        uint256 _chainId
    ) external {
        for (uint8 i; i < _tokenAddresses.length; i++) {
            s.hopBridges[_tokenAddresses[i]] = _bridges[i];
        }
        s.hopChainId = _chainId;
    }
}
