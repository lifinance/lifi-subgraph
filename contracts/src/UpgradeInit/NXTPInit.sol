// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import { AppStorage } from "../Libraries/AppStorage.sol";
import { ITransactionManager } from "../Interfaces/ITransactionManager.sol";

contract NXTPInit {
    AppStorage internal s;

    function init(ITransactionManager _txMgrAddr) external {
        s.nxtpTxManager = _txMgrAddr;
    }
}
