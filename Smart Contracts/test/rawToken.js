const { expect } = require("chai");

describe("RawToken", async () => {
    
    var owner;
    var accounts;
    var contract;

    beforeEach(async () => {
        [owner, ...accounts] = await ethers.getSigners();

        let RawToken = await ethers.getContractFactory("RawToken");
        contract = await RawToken.deploy(1000);
        await contract.deployed();
    });

    it("Admin should have 1000 Tokens initially!", async () => {
        let adminBalance = await contract.balanceOf(owner.address);
        let amountInWei = await ethers.utils.parseUnits("1000", 18);

        expect(adminBalance).to.equal(amountInWei.toString());
    });

    it("Admin should able to mint 500 tokens!", async () => {
        let beforeBalance = await contract.balanceOf(owner.address);

        let amountInWei = await ethers.utils.parseUnits("500", 18);
        let txn = await contract.mint(owner.address, amountInWei);
        await txn.wait();

        let afterBalance = await contract.balanceOf(owner.address);

        let diff = (Number(afterBalance) / (10 ** 18)) - (Number(beforeBalance) / (10 ** 18))

        expect(diff).to.equal(500);
    });

    it("Owner should pay fee when mint more than 6000 Tokens!", async () => {
        let beforeBalance = await contract.balanceOf(owner.address);

        let amountInWei = await ethers.utils.parseUnits("6000", 18);
        let txn = await contract.mint(owner.address, amountInWei);
        await txn.wait();

        let afterBalance = await contract.balanceOf(owner.address);

        let diff = (Number(afterBalance) / (10 ** 18)) - (Number(beforeBalance) / (10 ** 18))
        
        expect(diff).to.equal(6000);
    });

    it("User should not able to mint more than 5000 Tokens!", async () => {
        let amountInWei = await ethers.utils.parseUnits("6000", 18);

        await expect(
            contract.connect(accounts[0]).mint(accounts[0].address, amountInWei)
        ).to.be.revertedWith("Should pay fee if exceeding the max minting limit!");
    });

    it("User should able to mint 6000 Tokens by giving 0.001 ETH fee!", async () => {
        let amountInWei = await ethers.utils.parseUnits("6000", 18);

        let feeInWei = await ethers.utils.parseUnits("0.001", 18);

        let txn = await contract.connect(accounts[0]).mint(accounts[0].address, amountInWei, {
            value: feeInWei
        })
        await txn.wait();

        let userBalance = await contract.balanceOf(accounts[0].address);

        expect(Number(userBalance)/(10**18)).to.equal(6000);
    });

    it("Admin should able to change the fee amount!", async () => {
        let feeInWei = await ethers.utils.parseUnits("0.00001", 18);

        let txn = await contract.setFee(feeInWei);
        await txn.wait();

        let currentFee = await contract.fee();

        expect(currentFee).to.equal(feeInWei);
    });

    it("Admin should able to change the max mint limit!", async () => {
        let limitInWei = await ethers.utils.parseUnits("10000", 18);

        let txn = await contract.setMaxMintLimit(limitInWei);
        await txn.wait();

        let maxMintLimit = await contract.max_mint_limit();

        expect(maxMintLimit).to.equal(limitInWei);
    });

    it("User cannot able to change the fee amount!", async () => {
        let limitInWei = await ethers.utils.parseUnits("10000", 18);

        await expect(
            contract.connect(accounts[0]).setMaxMintLimit(limitInWei)
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });
});