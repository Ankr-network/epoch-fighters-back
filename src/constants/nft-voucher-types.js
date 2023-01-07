const NFT_VOUCHER_TYPES = {
  ItemInfo: [
    {name: "tokenId", type: "uint256"},
    {name: "torso", type: "uint8[2]"},
    {name: "horns", type: "uint8[2]"},
    {name: "arms", type: "uint8[2]"},
    {name: "eyes", type: "uint8[2]"},
    {name: "legs", type: "uint8[2]"},
    {name: "tail", type: "uint8[2]"},
    {name: "speed", type: "uint8"},
    {name: "ability1", type: "uint8"},
    {name: "ability2", type: "uint8"},
    {name: "expireTime", type: "uint256"},
  ]
};

module.exports = {
  NFT_VOUCHER_TYPES
}
