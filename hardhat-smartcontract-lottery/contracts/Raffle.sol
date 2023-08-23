// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
// import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

// Raffle

// Enter the lottery (paying some ETH)

// Pick a random (verifiable) winner

// Winner to be selected, every X minutes (automatically)

// Chainlink oracle => Ramdomness, Automated execution (chainlink keepers)

// * errors
error Raffle__NotEnoughETHEntered();
error Raffle__TransferFailed();
error Raffle__NotOpen();
error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

contract Raffle is VRFConsumerBaseV2, AutomationCompatible {
    // * type declarations
    enum RaffelState {
        OPEN,
        CALCULATING
    }

    // * state variables
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUMWORDS = 1;
    uint256 private immutable s_lastTimestamp;
    uint256 private immutable i_interval;

    // * lottery variables
    address private s_recentWinner;
    RaffelState private s_raffelState;

    // * events
    // naming convention function name reversed
    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    constructor(
        address vrfCoordinatorV2,
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffelState = RaffelState.OPEN;
        s_lastTimestamp = block.timestamp;
        i_interval = interval;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughETHEntered();
        }
        if (s_raffelState != RaffelState.OPEN) {
            revert Raffle__NotOpen();
        }
        // push sender to array and typecast as payable
        s_players.push(payable(msg.sender));

        // emit an event when updating dynamic arrays || mappings
        emit RaffleEnter(msg.sender);
    }

    /**
     * @dev this is the function that chainlink keeper nodes call
     * they look for the 'upkeepNeeded' to return true.
     * the following should be true in order to return true:
     * 1. the lottery state should be open
     * 2. our given time interval should have passed
     * 3. our lottery should have min 1 player with ETH
     * 4. our subscription is funded with LINK
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    ) public override returns (bool upkeepNeeded, bytes memory /* performData */) {
        bool isOpen = (RaffelState.OPEN == s_raffelState);
        // (block.timestamp - lastBlockTimestamp) > interval
        bool timePassed = ((block.timestamp - s_lastTimestamp) > i_interval);
        bool hasPlayers = (s_players.length > 0);
        bool hasBallance = address(this).balance > 0;
        bool upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBallance && hasPlayers);
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        // check if upkeep is needed
        (bool upkeepNeeded, ) = checkUpkeep("");

        if (!upkeepNeeded) {
            Raffle__UpkeepNotNeeded(address(this).balance, s_players.length, uint256(s_raffelState));
        }

        // request random number
        // will revert if subscription is not set and funded.
        s_raffelState = RaffelState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, // gasLane
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUMWORDS
        );

        // once we get it, do something with it
        emit RequestedRaffleWinner(requestId);
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        // use modulo to fulfill random nummber
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;

        // reset raffle state, players array and lastTimestamp
        s_raffelState = RaffelState.OPEN;
        s_players = new address payable[](0);
        s_lastTimestamp = block.timestamp;

        // send the balance in the contract
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        // require success
        if (!success) {
            revert Raffle__TransferFailed();
        }

        emit WinnerPicked(recentWinner);
    }

    // * view, pure functions
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }
}
