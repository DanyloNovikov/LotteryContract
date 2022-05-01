// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Lottery {
    address public manager;
    address[] public players;

    constructor() {
        manager = msg.sender;
    }
    /*
        From: Solidity v0.5.0 Breaking Changes
        Explicit data location for all variables of struct,
        array or mapping types is now mandatory.
        This is also applied to function parameters and return variables.
        For example, change uint[] x = m_x to uint[] storage x = m_x,
        and function f(uint[][] x) to function f(uint[][] memory x) where memory
        is the data location and might be replaced by storage or calldata accordingly.
        Note that external functions require parameters with a data location of calldata.
    */
    function getPlayers() public view returns(address[] memory) {
        return players;
    }

    function entry() public payable {
        // самая обычная валидация проверяем что у пользователя
        // который деплоит транзакцию не меньше нужного нам количества
        // ethereum-a
        require(msg.value > .01 ether);
        players.push(msg.sender);
    }

    function random() private view returns(uint256) {
        // keccak берет генерирует случайное число по этим параметрам
        return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % players.length;
    }

    // не забыть указать payable потому что мы переводим ether
    // почему-то раньше payable использовался только для зачестеления
    // но с 0.6 и для перевода
    function pickWinner() public restricted payable {
        address player = players[random()];
        // метод transfer необходим для передачи ether
        // да, самое главное не забывать конвертировать в тип
        // address payable
        // example:
        // address payable player = payable(player)
        payable(player).transfer(address(this).balance);
        players = new address[](0);
    }

    modifier restricted() {
        require(msg.sender == manager);
        // будет указывать на то что бы функция выолняла код дальше
        // если не указать _ то функция в которой указываеться restricted
        // закончит выполнение на на после require
        _;
    }
}

