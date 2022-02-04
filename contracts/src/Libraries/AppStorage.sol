// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import { ITransactionManager } from "../Interfaces/ITransactionManager.sol";

struct AppStorage {
    ITransactionManager nxtpTxManager;
    mapping(address => address) hopBridges;
    uint256 hopChainId;
    // Only add new variables *BELOW* the last variable
}
