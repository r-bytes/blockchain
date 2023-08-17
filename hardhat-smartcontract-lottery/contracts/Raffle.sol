// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
// import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

// Raffle

// Enter the lottery (paying some ETH)

// Pick a random (verifiable) winner

// Winner to be selected, every X minutes (automatically)

// Chainlink oracle => Ramdomness, Automated execution (chainlink keepers)

// errors
error Raffle__NotEnoughETHEntered();

contract Raffle is VRFConsumerBaseV2 {
    // state variables
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;

    // events
    // naming convention function name reversed
    event RaffleEnter(address indexed player);

    constructor(address vrfCoordinatorV2, uint256 entranceFee) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughETHEntered();
        }
        // push sender to array and typecast as payable
        s_players.push(payable(msg.sender));

        // emit an event when updating dynamic arrays || mappings
        emit RaffleEnter(msg.sender);
    }

    function requestRandomWinner() external {
        // request random number
        // once we get it, do something with it
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {}

    // view, pure functions
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }
}
