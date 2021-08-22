const { expectRevert } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
require('dotenv').config({ path: '../.env' });
const ItemManager = artifacts.require('./ItemManager.sol');

contract('ItemManager', async (accounts) => {
  beforeEach(async () => {
    this.itemManager = await ItemManager.new();
    this.itemName = 'test1';
    this.itemPrice = 500;
  });

  it('Should let you create new items.', async () => {
    const result = await this.itemManager.createItem(
      this.itemName,
      this.itemPrice,
      {
        from: accounts[0],
      }
    );
    assert.equal(
      result.logs[0].args._itemIndex,
      0,
      'Index not found or not the first'
    );
    const item = await this.itemManager.items(0);
    assert.equal(
      item._identifier,
      this.itemName,
      'Item with different identifier'
    );
  });

  it('Only owner can create an item', async () => {
    await expectRevert(
      this.itemManager.createItem(this.itemName, this.itemPrice, {
        from: accounts[1],
      }),
      'Ownable: caller is not the owner'
    );
  });

  it('Should let you pay for an item', async () => {
    const result = await this.itemManager.createItem(
      this.itemName,
      this.itemPrice,
      {
        from: accounts[0],
      }
    );
    let itemAddress = result.logs[0].args._address;
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: itemAddress,
      value: this.itemPrice,
    });
    const item = await this.itemManager.items(0);
    assert.equal(item._step, '1', "Item wasn't paid");
  });

  it('Should deliver an item', async () => {
    const result = await this.itemManager.createItem(
      this.itemName,
      this.itemPrice,
      {
        from: accounts[0],
      }
    );
    let itemAddress = result.logs[0].args._address;
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: itemAddress,
      value: this.itemPrice,
    });
    let item = await this.itemManager.items(0);
    await this.itemManager.triggerDelivery(item._id, {
      from: accounts[0],
    });
    item = await this.itemManager.items(0);
    assert.equal(item._step, '2', "Item wasn't sent");
  });

  it('Only owner can deliver an item', async () => {
    const result = await this.itemManager.createItem(
      this.itemName,
      this.itemPrice,
      {
        from: accounts[0],
      }
    );
    let itemAddress = result.logs[0].args._address;
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: itemAddress,
      value: this.itemPrice,
    });
    let item = await this.itemManager.items(0);
    await expectRevert(
      this.itemManager.triggerDelivery(item._id, {
        from: accounts[1],
      }),
      'Ownable: caller is not the owner'
    );
  });
});
