pragma solidity ^0.4.18;

library SafeMath {
    function sub(uint a, uint b) internal pure returns (uint) {
        assert(b <= a);
        return a - b;
    }

    function add(uint a, uint b) internal pure returns (uint) {
        uint c = a + b;
        assert(c >= a);
        return c;
    }

    function mul(uint a, uint b) internal pure returns (uint) {
        uint c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }
}


/**
* @title SmartGuess contract
*/
contract SmartGuess {

    using SafeMath for uint;

    event LogLottery(uint indexed gameId, address player_1, address player_2, string choice_1, string choice_2, int value);

    event LogCheckWinner(uint indexed gameId, address _who, string choice, bool matched, uint amount);

    event LogBetSuc(uint indexed gameId ,address _who, string choice, uint amount);

    event LogResetSuc(uint indexed roomNum);

    // metadata
    string public name = "SmartGuess-";

    address owner;

    struct Player {
        address addr;
        string choice;
        uint amount;
        bool matched;
        int result;
        uint gameId;
    }

    mapping (string => mapping(string => int)) payoffMatrix;

    mapping (uint => address) playerIndex;

    mapping (address => Player) players;

    mapping (address => bool) playerRegistered;

    uint currGameId;

    uint roomNum;

    bool isGameLocked;
    
    uint numPlayers = 0;

    uint baseCoin = 100;

    bool hasLotteryed = false;

    modifier onlyOwner() {
        assert(msg.sender == owner);
        _;
    }

    // constructor
    constructor (uint _roomNum,uint _coin) public {
        owner = msg.sender;
        initGameRules();
        roomNum = _roomNum;
        baseCoin = _coin;
        currGameId = roomNum.mul(10000);
    }
    
    /**
    * @dev Change owner.
    * @param _who The address of new owner.
    */
    function changeOwner(address _who) external onlyOwner {
        assert(_who != address(0));
        owner = _who;
    }

    function initGameRules() private {
        payoffMatrix["rock"]["rock"] = 0;
        payoffMatrix["rock"]["paper"] = 2;
        payoffMatrix["rock"]["scissors"] = 1;
        payoffMatrix["paper"]["rock"] = 1;
        payoffMatrix["paper"]["paper"] = 0;
        payoffMatrix["paper"]["scissors"] = 2;
        payoffMatrix["scissors"]["rock"] = 2;
        payoffMatrix["scissors"]["paper"] = 1;
        payoffMatrix["scissors"]["scissors"] = 0;
    }
    
    /**
     *  单词投注,
     *  _from player address
     *  choice ['rock','paper','scissors']
     */
    function bet(address _from, string choice) external onlyOwner {

        require (!isGameLocked);
        
        require (!playerRegistered[_from]);

        // 标记此用户为注册用户
        playerRegistered[_from] = true;

        // 索引用户账户，方便后面做遍历
        playerIndex[numPlayers] = _from;

        // 初始化投注用户的信息
        players[_from].addr = _from;
        players[_from].choice = choice;
        players[_from].result = 0;
        players[_from].matched = false;
        players[_from].amount = baseCoin;
        players[_from].gameId = currGameId;
        
        // 记录当前有多少位有效玩家
        numPlayers++;

        emit LogBetSuc(currGameId, _from, choice, baseCoin);

    }

    /** 
    *   游戏的匹配规则暂定为收尾一次匹配，结果分别为-1（loss），0（draw），1（win）
    *        
    */
    function checkWinner() external onlyOwner {
        // 结算开始的时候锁定
        isGameLocked = true;
        for(uint i = 0; i < numPlayers / 2; i++) {
            
            Player storage p1 = players[playerIndex[i]];

            require (p1.matched == false);
            emit LogCheckWinner(currGameId, p1.addr, p1.choice, p1.matched, p1.amount);

            Player storage p2 = players[playerIndex[numPlayers - i - 1]];
            
            require (p1.matched == false);
            emit LogCheckWinner(currGameId, p1.addr, p1.choice, p1.matched, p1.amount);
            int winner = payoffMatrix[p1.choice][p2.choice];

            if (winner == 1) {
                p1.result = 1;
                p2.result = -1;
                p1.amount = baseCoin.mul(2);
                p2.amount = 0;
            } else if (winner == 2){
                p1.result = -1;
                p2.result = 1;
                p2.amount = baseCoin.mul(2);
                p1.amount = 0;
            } else {
                p1.result = 0;
                p2.result = 0;
            }
            p1.matched = true;
            p2.matched = true;
            emit LogLottery(currGameId, p1.addr, p2.addr, p1.choice, p2.choice, winner);
        }

        hasLotteryed = true;
    }

    function catPlayerResult(address _who) public view returns(string choice, int res, bool matched, uint amount) {
        return (players[_who].choice, players[_who].result, players[_who].matched, players[_who].amount);
    }

    function getGameId() external onlyOwner view returns(uint _gameId){
        return currGameId;
    }

    function getGameCount() external onlyOwner view returns(uint _gamecount) {
        return numPlayers;
    }

    function getRomNum() external onlyOwner view returns(uint _roomNum) {
        return roomNum;
    }

    /**
    *   resetGame
    */
    function resetBet() external onlyOwner {

        // must call checkWinner first 
        require(hasLotteryed);

        // clear player infos 
        clearMapping();

        numPlayers = 0;

        isGameLocked = false;
        hasLotteryed = false;
        
        emit LogResetSuc(roomNum);
        
        currGameId++;
    }

    /**
    *   clear mapping 
    */
    function clearMapping() internal {
        uint i = 0;
        for(i; i < numPlayers; i++) {
            address _who = playerIndex[i];
            delete players[_who];
            delete playerRegistered[_who];
            delete playerIndex[i];
        }
        
    }

}