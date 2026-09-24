// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Unsaid {

    enum ReactionType { Love, Relate, Respect, Brave, Shook, Anxious, Painful }

    struct Confession {
        address author;
        string text;
        uint256 timestamp;
    }

    Confession[] public confessions;

    mapping(uint256 => mapping(uint8 => uint256)) public reactions;

    event ConfessionPosted(uint256 indexed id, uint256 timestamp);
    event ReactionGiven(uint256 indexed id, uint8 reactionType, uint256 newCount);

    function postConfession(string memory _text) public {
        require(bytes(_text).length > 0, "Confession cannot be empty");
        require(bytes(_text).length <= 280, "Keep it under 280 characters");

        confessions.push(Confession({
            author: msg.sender,
            text: _text,
            timestamp: block.timestamp
        }));

        emit ConfessionPosted(confessions.length - 1, block.timestamp);
    }

    function react(uint256 _id, uint8 _reactionType) public {
        require(_id < confessions.length, "Confession does not exist");
        require(_reactionType <= uint8(ReactionType.Painful), "Invalid reaction type");

        reactions[_id][_reactionType] += 1;
        emit ReactionGiven(_id, _reactionType, reactions[_id][_reactionType]);
    }

    function getReactionCounts(uint256 _id) public view returns (
        uint256 love,
        uint256 relate,
        uint256 respect,
        uint256 brave,
        uint256 shook,
        uint256 anxious,
        uint256 painful
    ) {
        require(_id < confessions.length, "Confession does not exist");
        return (
            reactions[_id][uint8(ReactionType.Love)],
            reactions[_id][uint8(ReactionType.Relate)],
            reactions[_id][uint8(ReactionType.Respect)],
            reactions[_id][uint8(ReactionType.Brave)],
            reactions[_id][uint8(ReactionType.Shook)],
            reactions[_id][uint8(ReactionType.Anxious)],
            reactions[_id][uint8(ReactionType.Painful)]
        );
    }

    function getTotalConfessions() public view returns (uint256) {
        return confessions.length;
    }

    function getConfession(uint256 _id) public view returns (
        address author,
        string memory text,
        uint256 timestamp
    ) {
        require(_id < confessions.length, "Confession does not exist");
        Confession memory c = confessions[_id];
        return (c.author, c.text, c.timestamp);
    }
}
