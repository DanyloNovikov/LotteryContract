const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { abi, evm } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await  web3.eth.getAccounts();
    lottery = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object })
        .send({
            // ставим лимит 1_000_000
            // что бы транзакция быстрее крутилась
            gas: '1000000',
            from: accounts[0]
        });
});

describe('Lottery Contract', () => {
    it('deploy contract', () => {
        assert.ok(lottery.options.address);
    });
});
