pragma solidity ^0.4.11;

contract DataCoinContract {

    // Owner of the WIFI contract
    address public owner;

    // Session Object
    struct Session {
        string sid;
        string unitsForPrice;
        string unitPrice;
        string deviceId;
        string sessionType;
        bool isStop;
        address buyer;
        address seller;
    }

    // Session Value Object
    struct SessionValue {
        string sid;
        uint limit;
        uint totalSessionCost;
        uint totalDataConsumed;
        string totalSessionTime;
        string startedAt;
        string stoppedAt;
    }

    Session[] public sessions; // List of sessions

    SessionValue[] public sessionValues;

    // modifier to allow only owner has full control on the function
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    // Delete / kill the contract... only the owner has rights to do this
    function kill() onlyOwner {
      suicide(owner);
    }

    // Constructor
    // @notice DataCoinContract
    // @return the transaction address
    function DataCoinContract() {
        owner = msg.sender;
    }

    // @notice add new session on blockchain
    // @param start or end session parameters The parameters of start or end sesssion
    // @return the transaction address and send the event as Transfer
    function addSession(string _id, string _unitsForPrice, string _unitPrice, string _deviceId, string _sessionType, bool _isStop, address _buyer, address _seller) onlyOwner {
        sessions.push(Session({
            sid : _id,
            unitsForPrice : _unitsForPrice,
            unitPrice : _unitPrice,
            deviceId : _deviceId,
            sessionType : _sessionType,
            isStop : _isStop,
            buyer : _buyer,
            seller : _seller
        }));
    }

    // @notice add new session values on blockchain
    // @param start or end session parameters The parameters of start or end sesssion
    // @return the transaction address and send the event as Transfer
    function addSessionValue(string _id,uint _limit, uint _totalSessionCost, uint _totalDataConsumed, string _totalSessionTime, string _startedAt, string _stoppedAt) onlyOwner {
        sessionValues.push(SessionValue({
            sid : _id,
            limit : _limit,
            totalSessionCost : _totalSessionCost,
            totalDataConsumed : _totalDataConsumed,
            totalSessionTime : _totalSessionTime,
            startedAt : _startedAt,
            stoppedAt : _stoppedAt
        }));
    }

    // @return total session count
    function getSessionCount() public constant returns(uint) {
        return sessions.length;
    }

    // @retrun session detail for the given index
    function getSessionDetail(uint _index) constant returns (string, string, string, string, string, bool) {
        return (sessions[_index].sid, sessions[_index].unitsForPrice, sessions[_index].unitPrice, sessions[_index].deviceId, sessions[_index].sessionType, sessions[_index].isStop);
    }

    // @retrun session value for the given index
    function getSessionValue(uint _index) constant returns (uint, uint, uint, string, string, string) {
        return (sessionValues[_index].limit, sessionValues[_index].totalSessionCost, sessionValues[_index].totalDataConsumed, sessionValues[_index].totalSessionTime, sessionValues[_index].startedAt, sessionValues[_index].stoppedAt);
    }

    function getStartSessionDetail(string _id) constant returns (uint) {
        uint oldTotalSessionCost = 0;
        for (uint _index = 0; _index < sessions.length; _index++) {
            if (sha3(sessions[_index].sid) == sha3(_id)) {
                oldTotalSessionCost = sessionValues[_index].totalSessionCost;
            }
        }
        return oldTotalSessionCost;
    }

    function isStartSessionAvailable(string _id) constant returns (bool) {
        bool available = false;
        for (uint _index = 0; _index < sessions.length; _index++) {
            if (sha3(sessions[_index].sid) == sha3(_id)) {
                available = true;
            }
        }
        return available;
    }

    function isEndSessionAvailable(string _id) constant returns (uint) {
      uint count = 0;
      for (uint _index = 0; _index < sessions.length; _index++) {
          if (sha3(sessions[_index].sid) == sha3(_id)) {
              count++;
          }
      }
      return count;
    }
}
