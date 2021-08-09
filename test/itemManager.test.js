const ItemManager = artifacts.require('./ItemManager.sol');

contract('ItemManager', (accounts) => {
  it('Should let you create new items.', async () => {
    const itemManagerInstance = await ItemManager.deployed();
    const itemName = 'test1';
    const itemPrice = 500;

    const result = await itemManagerInstance.createItem(itemName, itemPrice, {
      from: accounts[0],
    });
    assert.equal(
      result.logs[0].args._itemIndex,
      0,
      'Index not found or not the first'
    );
    const item = await itemManagerInstance.items(0);
    assert.equal(item._identifier, itemName, 'Item with different identifier');
  });
});
