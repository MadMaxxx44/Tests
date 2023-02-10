import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat"; 
import { Accountant, Accountant__factory } from "../typechain-types"; 

describe("Accountant", () => {

    async function deploy() {
        const [deployer, user] = await ethers.getSigners();
        const AccountantFactory = await ethers.getContractFactory("Accountant"); 
        const accountant: Accountant = await AccountantFactory.deploy();
        await accountant.deployed(); 
        await accountant.addCategory("Food");
        await accountant.addCategory("Car");
        await accountant.addCategory("Cat");

        return { accountant, deployer, user }
    }

    it("should add category", async () => {
        const { accountant, deployer, user } = await loadFixture(deploy);
        const add = await accountant.addCategory("TEST");    
        const names = await accountant.viewCatigories();  
        console.log(names);  
    })

    it("should revert: add category not owner", async () => {
        const { accountant, deployer, user } = await loadFixture(deploy);
        await expect(accountant.connect(user).addCategory("TEST")).to.be.reverted; 
    })

    it("should add income", async () => {
        const { accountant, deployer, user } = await loadFixture(deploy);
        const income = await accountant.connect(user).addIncome(100, 0); 
        const userBalance = await accountant.connect(user).viewIncome(0); 
        console.log(userBalance); 
    })

    it("should revert add 0 income amount", async () => {
        const { accountant, deployer, user } = await loadFixture(deploy);
        await expect(accountant.connect(user).addIncome(0, 0)).to.be.reverted;
    })

    it("should add spending", async () => {
        const { accountant, deployer, user } = await loadFixture(deploy);
        const spending = await accountant.connect(user).addSpending(100, "Food"); 
        const userBalance = await accountant.connect(user).viewCategorySpendings("Food"); 
        console.log(userBalance); 
    })

    it("should revert: add spending for undefined category", async () => {
        const { accountant, deployer, user } = await loadFixture(deploy);
        await expect(accountant.connect(user).addSpending(100, "Clothes")).to.be.reverted; 
    })

    it("should revert: add 0 spending amount", async () => {
        const { accountant, deployer, user } = await loadFixture(deploy);
        await expect(accountant.connect(user).addSpending(0, "Food")).to.be.reverted; 
    })
})
