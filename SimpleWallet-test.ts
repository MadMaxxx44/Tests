import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat"; 
import { SimpleWallet, SimpleWallet__factory } from "../typechain-types"; 
import { MaximumToken } from "../typechain-types"; 

describe("SimpleWallet", () => {

    async function deploy() {
        const [deployer, user] = await ethers.getSigners();
        const SimpleWalletFactory = await ethers.getContractFactory("SimpleWallet"); 
        const simplewallet: SimpleWallet = await SimpleWalletFactory.deploy();
        await simplewallet.deployed(); 

        const MaximumTokenFactory = await ethers.getContractFactory("MaximumToken"); 
        const token: MaximumToken = await MaximumTokenFactory.deploy();
        await token.deployed(); 
        return { simplewallet, deployer, user, token }
    }

    it("should deposit ether", async () => {
        const { simplewallet, deployer, user } = await loadFixture(deploy);
        const tx = await simplewallet.connect(user).depositEther({value: 1});
        const userBalance = simplewallet.ethBalances(user.address); 
        expect(await userBalance).to.eq(1); 
        console.log(userBalance); 
    })

    it("should revert: deposit 0 ether", async () => {
        const { simplewallet, deployer, user } = await loadFixture(deploy);
        await expect(simplewallet.depositEther({value: 0})).to.be.reverted;  
    })

    it("should withdraw ether", async () => {
        const { simplewallet, deployer, user } = await loadFixture(deploy);
        const tx = await simplewallet.connect(user).depositEther({value: 1});
        const tx2 = await simplewallet.connect(user).withdrawEther(user.address, 1);
        expect(await simplewallet.ethBalances(user.address)).to.eq(0);  
    })

    it("should revert: withdraw 0 ether", async () => {
        const { simplewallet, deployer, user } = await loadFixture(deploy);
        const tx = await simplewallet.connect(user).depositEther({value: 1});
        await expect(simplewallet.connect(user).withdrawEther(user.address, 0)).to.be.reverted;  
    })

    it("should revert: withdraw more than deposited", async () => {
        const { simplewallet, deployer, user } = await loadFixture(deploy);
        const tx = await simplewallet.connect(user).depositEther({value: 1});
        await expect(simplewallet.connect(user).withdrawEther(user.address, 2)).to.be.reverted;  
    })

    it("should add token", async () => {
        const { simplewallet, deployer, user, token } = await loadFixture(deploy); 
        const tx = await simplewallet.connect(deployer).addToken(token.address); 
        const tk = (await simplewallet.tokens(token.address)).Address;
        console.log(tk); 
    })

    it("should revert: add token not owner", async () => {
        const { simplewallet, deployer, user, token } = await loadFixture(deploy); 
        await expect(simplewallet.connect(user).addToken(token.address)).to.be.reverted; 
    })

    it("should deposit token", async () => {
        const { simplewallet, deployer, user, token } = await loadFixture(deploy); 
        const transfer = await token.transfer(user.address, 100); 
        const allowance = await token.connect(user).increaseAllowance(simplewallet.address, 100); 
        const deposit = await simplewallet.connect(user).depositToken(token.address, 100);
        const userBalance = await simplewallet.connect(user).userBalance(token.address);
        console.log(userBalance); 
    })

    it("should revert: deposit 0 token amount", async () => {
        const { simplewallet, deployer, user, token } = await loadFixture(deploy);  
        await expect(simplewallet.connect(user).depositToken(token.address, 0)).to.be.reverted;
    })

    it("should withdraw token", async () => {
        const { simplewallet, deployer, user, token } = await loadFixture(deploy);  
        const transfer = await token.transfer(user.address, 100); 
        const allowance = await token.connect(user).increaseAllowance(simplewallet.address, 100); 
        const deposit = await simplewallet.connect(user).depositToken(token.address, 100);
        const withdraw = await simplewallet.connect(user).withdrawToken(token.address, 100);
    })
})
