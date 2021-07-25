// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract WalletEscrow {
    address public owner;
    // key - keccak256('PHONE_NUMBER')
    // phone_number === 0 - test number
    // phone_number === 1 - liquidstar number
    mapping(bytes32 => UserWallet) public Phones;
    mapping(uint => Order) public Orders;

    uint public orderId;
    bytes32 public TypeWater = 0x7464bd924e765ce487910dde7cf78faee47c96a6328f88a0cd374cd7c2491abd;
    bytes32 public TypeBattery = 0xa3dff00f6f863c6e9712ee43c469b14000a9f63073ae34afaa647763cb18c186;

    // US Dollar
    bytes32 public CurrencyUSD = 0xc4ae21aac0c6549d71dd96035b7e0bdb6c79ebdba8891b666115bc976d16a29e;
    // Nigerian naira
    bytes32 public CurrencyNGN = 0xc86df68658952a08317197d7ef595a27d44b37f41622030c813206b26f675349;
    // Djiboutian franc
    bytes32 public CurrencyDJF = 0xd76a95916688d85014953105a5437b5ae053924ac2b269cafe3cd6e453fac815;
    // West African CFA franc
    bytes32 public CurrencyXOF = 0xe14aac48809d86944f63c7c241c81173d25cd5dda2a1535c2025343eadea00ef;
    // Indonesian rupiah
    bytes32 public CurrencyIDR = 0xc681c4652bae8bd4b59bec1cdb90f868d93cc9896af9862b196843f54bf254b3;
    // Kenyan shilling
    bytes32 public CurrencyKES = 0x589be49821419c9c2fbb26087748bf3420a5c13b45349828f5cac24c58bbaa7b;

    bytes32 public TestPhone = 0x044852b2a670ade5407e78fb2863c51de9fcb96542a07186fe3aeda6bb8a116d;
    bytes32 public CompanyPhone = 0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6;

    struct UserWallet
    {
        mapping(bytes32 => uint) balanceCurrency;

        bool isActive;
    }

    struct Order
    {
        uint id;
        bytes32 phone;
        bytes32 orderType;
        bytes32 currency;
        uint totalDeposit;
        uint endSum;
        // 0 - new, 1 - complete
        uint status;
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
        orderId = 1;
    }

    function createOrder(bytes32 phone, bytes32 orderType, uint totalDeposit, uint endSum, bytes32 currency) onlyOwner public returns (uint) {
        require(orderType == TypeWater || orderType == TypeBattery, "Incorrect order type");
        require(totalDeposit >= endSum, "Total deposit should be more or equal end sum");
        require(Phones[phone].balanceCurrency[currency] >= totalDeposit, "User hasn't enough funds");

        Phones[phone].balanceCurrency[currency] = Phones[phone].balanceCurrency[currency] - totalDeposit;
        Phones[CompanyPhone].balanceCurrency[currency] = Phones[CompanyPhone].balanceCurrency[currency] + totalDeposit;
        Orders[orderId] = Order({id : orderId, phone : phone, orderType : orderType, currency : currency, totalDeposit : totalDeposit, endSum : endSum, status : 0});
        uint returnId = orderId;
        orderId = orderId + 1;

        return returnId;
    }

    function releaseDeposit(uint _orderId) onlyOwner public {
        require(Orders[_orderId].status == 0, "Incorrect order status");

        Order memory order = Orders[_orderId];
        uint returnSum = order.totalDeposit - order.endSum;
        // plus funds to user
        Phones[order.phone].balanceCurrency[order.currency] = Phones[order.phone].balanceCurrency[order.currency] + returnSum;
        // minus fund from company
        Phones[CompanyPhone].balanceCurrency[order.currency] = Phones[CompanyPhone].balanceCurrency[order.currency] - returnSum;

        Orders[_orderId].status = 1;
    }

    function fundPhoneWallet(bytes32 phone, bytes32 currency, uint sum) onlyOwner public {
        Phones[phone].balanceCurrency[currency] = Phones[phone].balanceCurrency[currency] + sum;
    }
}
