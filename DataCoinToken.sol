pragma solidity ^0.4.11;

library SafeMath {
    function mul(uint256 a, uint256 b) internal constant returns (uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal constant returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal constant returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal constant returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

contract IERC20 {

    function totalSupply() constant returns (uint256);
    function balanceOf(address who) constant returns (uint256);
    function transfer(address to, uint256 value);
    function transferFrom(address from, address to, uint256 value);
    function approve(address spender, uint256 value);
    function allowance(address owner, address spender) constant returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

}

contract DataCoinToken is IERC20 {

    using SafeMath for uint256;

    // Token properties
    string public name;
    string public symbol;
    uint public decimals;
    uint public _totalSupply;

    uint public _tokensaleSupply;

    // Balances for each account
    mapping (address => uint256) balances;

    mapping (address => uint256) holdBalances;

    event HoldToken(address indexed from, uint256 value);
    event SessionPayment(address indexed buyer, address indexed seller, uint256 value, uint256 shareGvalue);

    // Owner of account approves the transfer of an amount to another account
    mapping (address => mapping(address => uint256)) allowed;

    // Owner of Token
    address public owner;

    // Wallet Address of Token
    address public multisig;

    // 1 ether = 100 TGW token
    uint public PRICE;

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
    // @notice DataCoinToken Contract
    // @return the transaction address
    function DataCoinToken(string _name, string _symbol, uint _decimals, uint _initalSupply, address _multisig, uint _tokenPrice) {

        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _totalSupply = _initalSupply;
        multisig = _multisig;
        PRICE = _tokenPrice;

        _tokensaleSupply = _totalSupply;
        balances[multisig] = _totalSupply;

        owner = msg.sender;
    }

    // Payable method
    // @notice Anyone can buy the tokens on tokensale by paying ether
    function () payable {
        tokensale(msg.sender);
    }

    // @notice tokensale
    // @param recipient The address of the recipient
    // @return the transaction address and send the event as Transfer
    function tokensale(address recipient) payable {
        require (
            msg.value > 0
        );

        uint tokens = msg.value.mul(getPrice());
        tokens = tokens.div(1 ether);

        require (
            _tokensaleSupply > tokens
        );

        balances[multisig] = balances[multisig].sub(tokens);
        balances[recipient] = balances[recipient].add(tokens);
        _tokensaleSupply = _tokensaleSupply.sub(tokens);
        Transfer(multisig, recipient, tokens);

        multisig.transfer(msg.value);
    }

    // @return total tokens supplied
    function totalSupply() constant returns (uint256) {
        return _totalSupply;
    }

    // @return total tokensale tokens supplied
    function tokensaleSupply() constant returns (uint256) {
        return _tokensaleSupply;
    }

    // What is the balance of a particular account?
    // @param who The address of the particular account
    // @return the balanace the particular account
    function balanceOf(address who) constant returns (uint256) {
        return balances[who];
    }

    function holdTokenForSessionPayment(address _buyer, uint256 _value) onlyOwner {
        require (
            balances[_buyer] >= _value
        );
        holdBalances[_buyer] = holdBalances[_buyer].add(_value);
        balances[_buyer] = balances[_buyer].sub(_value);
        HoldToken(_buyer, _value);
    }

    function processSessionPayment(address _buyer, address _seller, address _shareG, uint256 _totalSessionCost, uint256 _unusedTokens, uint256 _sellerPercentage) onlyOwner {
        require (
            holdBalances[_buyer] >= _totalSessionCost
        );

        uint _sellerCost = _totalSessionCost.mul(_sellerPercentage).div(100);
        uint _shareGCost = _totalSessionCost.sub(_sellerCost);

        holdBalances[_buyer] = holdBalances[_buyer].sub(_unusedTokens);
        balances[_buyer] = balances[_buyer].add(_unusedTokens);

        balances[_seller] = balances[_seller].add(_sellerCost);
        balances[_shareG] = balances[_shareG].add(_shareGCost);
        holdBalances[_buyer] = holdBalances[_buyer].sub(_totalSessionCost);
        SessionPayment(_buyer, _seller, _sellerCost, _shareGCost);
    }

    function holdBalanceOf(address who) constant returns (uint256) {
        return holdBalances[who];
    }

    // Check the tokan available for user as per the rquired
    // @param who The address of the particular account
    // @param requiredToken The token required
    // @return the status as true or false
    function checkAvailableTokan(address who, uint requiredToken) constant returns (bool) {
        uint availableToken = balances[who];
        bool status = false;
        if (availableToken >= requiredToken) {
            status = true;
        }
        return status;
    }

    // @notice send `value` token to `to` from `msg.sender`
    // @param to The address of the recipient
    // @param value The amount of token to be transferred
    // @return the transaction address and send the event as Transfer
    function transfer(address to, uint256 value) {
        require (
            balances[msg.sender] >= value && value > 0
        );
        balances[msg.sender] = balances[msg.sender].sub(value);
        balances[to] = balances[to].add(value);
        Transfer(msg.sender, to, value);
    }

    // @notice send `value` token to `to` from `from`
    // @param from The address of the sender
    // @param to The address of the recipient
    // @param value The amount of token to be transferred
    // @return the transaction address and send the event as Transfer
    function transferFrom(address from, address to, uint256 value) {
        require (
            allowed[from][msg.sender] >= value && balances[from] >= value && value > 0
        );
        balances[from] = balances[from].sub(value);
        balances[to] = balances[to].add(value);
        allowed[from][msg.sender] = allowed[from][msg.sender].sub(value);
        Transfer(from, to, value);
    }

    // Allow spender to withdraw from your account, multiple times, up to the value amount.
    // If this function is called again it overwrites the current allowance with value.
    // @param spender The address of the sender
    // @param value The amount to be approved
    // @return the transaction address and send the event as Approval
    function approve(address spender, uint256 value) {
        require (
            balances[msg.sender] >= value && value > 0
        );
        allowed[msg.sender][spender] = value;
        Approval(msg.sender, spender, value);
    }

    // Check the allowed value for the spender to withdraw from owner
    // @param owner The address of the owner
    // @param spender The address of the spender
    // @return the amount which spender is still allowed to withdraw from owner
    function allowance(address _owner, address spender) constant returns (uint256) {
        return allowed[_owner][spender];
    }

    // Get current price of a Token
    // @return the price or token value for a ether
    function getPrice() constant returns (uint result) {
      return PRICE;
    }
}
