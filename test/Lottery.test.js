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

    it('allows accounts to enter', async () => {
        for(let i = 0; i < 3; i++) {
            await lottery.methods.entry().send({
                from: accounts[i],
                value: web3.utils.toWei('0.02', 'ether')
            });
        };

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        // проверяем что пользователь который заявку на участие
        // есть в списке участников.
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });

    it('requires a minimum amount of ether to entry', async () => {
        // ожидаем что мы получим ошибку из за неправильной суммы;
        try {
            await lottery.methods.entry().send({
                from: accounts[0],
                value: web3.utils.toWei('0.001', 'ether')
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({ from: accounts[1] });
            assert(false);
        } catch (err) {
            console.log(err)
            assert(err);
        };
    });

    it('sends money to the winner and resets the players array', async () => {
        await lottery.methods.entry().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;

        assert(difference > web3.utils.toWei('1.8', 'ether'));
    });
});
