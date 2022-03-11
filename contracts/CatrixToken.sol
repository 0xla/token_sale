pragma solidity ^0.4.22;

contract CatrixToken{
    uint256 public totalSupply;
    string public name;
    string public symbol;
    string public standard;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    constructor(uint256 _initialSupply) public{
        name = "Catrix Coin";
        symbol = "CRX";
        standard = "Catrix Coin v1.0";
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply; // where msg.sender is the account deploying the contract 
    }

    // Transfer 
    // Exception if account doesnt have enough 
    // Return a boolean 
    // Transfer Event 

    function transfer(address _to, uint256 _value) public returns(bool success){
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function approve(address _spender, uint256 _value) public returns(bool success){
        require(balanceOf[msg.sender] >= _value);
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public returns(bool success){
        // require from to have enough tokens
        require(balanceOf[_from] >= _value);
        // require allowance to be big enough
        require(allowance[_from][msg.sender] >= _value);
        // do trasaction from to to 
        // change the balance
        allowance[_from][msg.sender] -= _value;
        // update the amount
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        // call transfer event
        emit Transfer(_from, _to, _value);
        // return bool
        return true;
    }
}