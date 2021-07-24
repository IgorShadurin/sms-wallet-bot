// store wallet info for different currencies. map(hash(phone))=>Wallet[defaultCurrency, KES=>uint, UGX=>uint,]
// bonus store
// escrow process
// mark is user verified or not
// set oracle data about currency price for convertation

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

//pragma experimental ABIEncoderV2;

contract WalletEscrow {
    address public owner;
    mapping(bytes32 => UserInfo) public Users;

    struct UserInfo
    {
        bytes32 usernameHash;
        string referenceHash;
        address owner;
        bool isActive;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    function setOwner(address _address) onlyOwner public {
        owner = _address;
    }

    constructor() public {
        owner = msg.sender;
        //        _createUser(keccak256('admin'), msg.sender, "");
    }
}
