// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GreenHydrogenCredits
 * @dev ERC-1155 based system for Green Hydrogen Credits
 * Supports credit generation, validation, transfer, and retirement
 */
contract GreenHydrogenCredits is ERC1155, Ownable {
    
    // Structs
    struct Credit {
        uint256 id;
        uint256 amount;
        string renewableSource;
        uint256 productionDate;
        address producerId;
        string facilityId;
        bool isValidated;
        address validatedBy;
        uint256 validatedAt;
        bool isRetired;
        address ownerId;
        uint256 price;
        uint256 createdAt;
    }
    
    struct Facility {
        string id;
        string name;
        string location;
        string renewableSource;
        uint256 capacity;
        address producerId;
        bool isActive;
        uint256 createdAt;
    }
    
    // State variables
    uint256 private _creditIds = 0;
    uint256 private _facilityIds = 0;
    
    mapping(uint256 => Credit) public credits;
    mapping(string => Facility) public facilities;
    mapping(address => uint256[]) public producerCredits;
    mapping(address => uint256[]) public ownerCredits;
    
    // Events
    event CreditGenerated(
        uint256 indexed creditId,
        uint256 amount,
        string renewableSource,
        address indexed producerId,
        string facilityId,
        uint256 timestamp
    );
    
    event CreditValidated(
        uint256 indexed creditId,
        address indexed validator,
        uint256 timestamp
    );
    
    event CreditTransferred(
        uint256 indexed creditId,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );
    
    event CreditRetired(
        uint256 indexed creditId,
        address indexed owner,
        uint256 timestamp
    );

    event CreditPurchased(
        uint256 indexed creditId,
        address indexed seller,
        address indexed buyer,
        uint256 amount,
        uint256 totalPrice,
        uint256 timestamp
    );
    
    event FacilityCertified(
        string indexed facilityId,
        string name,
        address indexed producerId,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyProducer() {
        require(producerCredits[msg.sender].length > 0, "Not a producer");
        _;
    }
    
    modifier onlyValidator() {
        require(msg.sender == owner() || _isValidator(msg.sender), "Not a validator");
        _;
    }
    
    modifier creditExists(uint256 creditId) {
        require(credits[creditId].id != 0, "Credit does not exist");
        _;
    }
    
    modifier facilityExists(string memory facilityId) {
        require(bytes(facilities[facilityId].id).length > 0, "Facility does not exist");
        _;
    }
    
    // Constructor
    constructor() ERC1155("") Ownable(msg.sender) {}
    
    // Core functions
    
    /**
     * @dev Certify a new facility
     */
    function certifyFacility(
        string memory facilityId,
        string memory name,
        string memory location,
        string memory renewableSource,
        uint256 capacity
    ) external returns (string memory) {
        require(bytes(facilityId).length > 0, "Invalid facility ID");
        require(bytes(facilities[facilityId].id).length == 0, "Facility already exists");
        
        facilities[facilityId] = Facility({
            id: facilityId,
            name: name,
            location: location,
            renewableSource: renewableSource,
            capacity: capacity,
            producerId: msg.sender,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit FacilityCertified(facilityId, name, msg.sender, block.timestamp);
        return facilityId;
    }
    
    /**
     * @dev Generate new green hydrogen credits
     */
    function issueCredits(
        uint256 amount,
        string memory renewableSource,
        uint256 productionDate,
        string memory facilityId,
        uint256 price
    ) external facilityExists(facilityId) returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(facilities[facilityId].producerId == msg.sender, "Not facility owner");
        require(facilities[facilityId].isActive, "Facility not active");
        
        _creditIds++;
        uint256 creditId = _creditIds;
        
        credits[creditId] = Credit({
            id: creditId,
            amount: amount,
            renewableSource: renewableSource,
            productionDate: productionDate,
            producerId: msg.sender,
            facilityId: facilityId,
            isValidated: false,
            validatedBy: address(0),
            validatedAt: 0,
            isRetired: false,
            ownerId: msg.sender,
            price: price,
            createdAt: block.timestamp
        });
        
        // Mint ERC-1155 tokens
        _mint(msg.sender, creditId, amount, "");
        
        // Update mappings
        producerCredits[msg.sender].push(creditId);
        ownerCredits[msg.sender].push(creditId);
        
        emit CreditGenerated(creditId, amount, renewableSource, msg.sender, facilityId, block.timestamp);
        return creditId;
    }
    
    /**
     * @dev Validate credits (only validators can do this)
     */
    function validateCredits(uint256 creditId) external onlyValidator creditExists(creditId) {
        require(!credits[creditId].isValidated, "Credits already validated");
        require(!credits[creditId].isRetired, "Credits already retired");
        
        credits[creditId].isValidated = true;
        credits[creditId].validatedBy = msg.sender;
        credits[creditId].validatedAt = block.timestamp;
        
        emit CreditValidated(creditId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Transfer credits to another address
     */
    function transferCredits(
        uint256 creditId,
        address to,
        uint256 amount
    ) external creditExists(creditId) {
        require(credits[creditId].isValidated, "Credits must be validated");
        require(!credits[creditId].isRetired, "Credits already retired");
        require(balanceOf(msg.sender, creditId) >= amount, "Insufficient balance");
        require(to != address(0), "Invalid recipient");
        
        // Transfer ERC-1155 tokens
        _safeTransferFrom(msg.sender, to, creditId, amount, "");
        
        // Update owner if full amount transferred
        if (balanceOf(msg.sender, creditId) == 0) {
            _removeFromOwnerCredits(msg.sender, creditId);
        }
        _addToOwnerCredits(to, creditId);
        
        emit CreditTransferred(creditId, msg.sender, to, amount, block.timestamp);
    }

    /**
     * @dev Purchase credits from marketplace with ETH payment
     */
    function purchaseCredits(
        uint256 creditId,
        uint256 amount
    ) external payable creditExists(creditId) {
        require(credits[creditId].isValidated, "Credits must be validated");
        require(!credits[creditId].isRetired, "Credits already retired");
        require(balanceOf(credits[creditId].ownerId, creditId) >= amount, "Insufficient credits available");
        require(msg.value >= credits[creditId].price * amount, "Insufficient ETH payment");
        
        address seller = credits[creditId].ownerId;
        uint256 totalPrice = credits[creditId].price * amount;
        
        // Transfer ETH to seller (producer)
        (bool success, ) = seller.call{value: totalPrice}("");
        require(success, "ETH transfer to seller failed");
        
        // Transfer ERC-1155 tokens to buyer
        _safeTransferFrom(seller, msg.sender, creditId, amount, "");
        
        // Update ownership
        if (balanceOf(seller, creditId) == 0) {
            _removeFromOwnerCredits(seller, creditId);
        }
        _addToOwnerCredits(msg.sender, creditId);
        
        // Refund excess ETH if any
        uint256 excess = msg.value - totalPrice;
        if (excess > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: excess}("");
            require(refundSuccess, "ETH refund failed");
        }
        
        emit CreditPurchased(creditId, seller, msg.sender, amount, totalPrice, block.timestamp);
    }
    
    /**
     * @dev Retire credits (remove from circulation)
     */
    function retireCredits(uint256 creditId) external creditExists(creditId) {
        require(credits[creditId].isValidated, "Credits must be validated");
        require(!credits[creditId].isRetired, "Credits already retired");
        require(balanceOf(msg.sender, creditId) > 0, "No credits to retire");
        
        uint256 balance = balanceOf(msg.sender, creditId);
        
        // Burn ERC-1155 tokens
        _burn(msg.sender, creditId, balance);
        
        // Mark as retired
        credits[creditId].isRetired = true;
        
        // Remove from owner credits
        _removeFromOwnerCredits(msg.sender, creditId);
        
        emit CreditRetired(creditId, msg.sender, block.timestamp);
    }
    
    // View functions
    
    /**
     * @dev Get credit details
     */
    function getCredit(uint256 creditId) external view returns (Credit memory) {
        return credits[creditId];
    }
    
    /**
     * @dev Get facility details
     */
    function getFacility(string memory facilityId) external view returns (Facility memory) {
        return facilities[facilityId];
    }
    
    /**
     * @dev Get producer credits
     */
    function getProducerCredits(address producer) external view returns (uint256[] memory) {
        return producerCredits[producer];
    }
    
    /**
     * @dev Get owner credits
     */
    function getOwnerCredits(address owner) external view returns (uint256[] memory) {
        return ownerCredits[owner];
    }
    
    /**
     * @dev Get total credits count
     */
    function getTotalCredits() external view returns (uint256) {
        return _creditIds;
    }
    
    /**
     * @dev Get total facilities count
     */
    function getTotalFacilities() external view returns (uint256) {
        return _facilityIds;
    }
    
    // Internal functions
    
    function _isValidator(address account) internal view returns (bool) {
        // For now, only owner is validator. Can be extended with validator registry
        return account == owner();
    }
    
    function _addToOwnerCredits(address owner, uint256 creditId) internal {
        // Check if already exists
        for (uint i = 0; i < ownerCredits[owner].length; i++) {
            if (ownerCredits[owner][i] == creditId) {
                return;
            }
        }
        ownerCredits[owner].push(creditId);
    }
    
    function _removeFromOwnerCredits(address owner, uint256 creditId) internal {
        uint256[] storage ownerCreditsArray = ownerCredits[owner];
        for (uint i = 0; i < ownerCreditsArray.length; i++) {
            if (ownerCreditsArray[i] == creditId) {
                ownerCreditsArray[i] = ownerCreditsArray[ownerCreditsArray.length - 1];
                ownerCreditsArray.pop();
                break;
            }
        }
    }
    
    // Override ERC1155 functions to add custom logic
    
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        // Additional validation logic can be added here
        for (uint i = 0; i < ids.length; i++) {
            require(credits[ids[i]].isValidated, "Credits must be validated");
            require(!credits[ids[i]].isRetired, "Credits already retired");
        }
    }
}
