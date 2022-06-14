// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.4;

// import "@openzeppelin/contracts@4.6.0/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts@4.6.0/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts@4.6.0/token/ERC721/extensions/ERC721Burnable.sol";
// import "@openzeppelin/contracts@4.6.0/access/AccessControl.sol";
// import "@openzeppelin/contracts@4.6.0/utils/Counters.sol";

// contract BSquare is ERC721, ERC721URIStorage, ERC721Burnable, AccessControl {
//     using Counters for Counters.Counter;

//     bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
//     bytes32 public constant URISETTER_ROLE = keccak256("URISETTER_ROLE");

//     Counters.Counter public _tokenIdCounter;

//     string public tokenBaseURI;

//     constructor(string memory _name, string memory _symbol, address userAddress) ERC721(_name, _symbol) {
//         _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
//         _grantRole(MINTER_ROLE, msg.sender);
//         _grantRole(MINTER_ROLE, userAddress);
//         _grantRole(URISETTER_ROLE, msg.sender);
//     }

//     function setTokenBaseURI(string memory _baseURI) external onlyRole(URISETTER_ROLE) {
//         tokenBaseURI = _baseURI;
//     }

//     function safeMint(address to, string memory uri) public onlyRole(MINTER_ROLE) {
//         uint256 tokenId = _tokenIdCounter.current();
//         _tokenIdCounter.increment();
//         _safeMint(to, tokenId);
//         _setTokenURI(tokenId, uri);
//     }

//     // The following functions are overrides required by Solidity.

//     function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
//         super._burn(tokenId);
//     }

//     function tokenURI(uint256 tokenId)
//         public
//         view
//         override(ERC721, ERC721URIStorage)
//         returns (string memory)
//     {
//         return super.tokenURI(tokenId);
//     }

//     function supportsInterface(bytes4 interfaceId)
//         public
//         view
//         override(ERC721, AccessControl)
//         returns (bool)
//     {
//         return super.supportsInterface(interfaceId);
//     }
// }
