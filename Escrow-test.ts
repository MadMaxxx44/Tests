import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat"; 
import { Escrow, Escrow__factory } from "../typechain-types"; 
import { Flower, Flower__factory } from "../typechain-types"; 

describe("Escrow", () => {
    async function deploy() {
        const [deployer, user, seller, buyer] = await ethers.getSigners();
        const FlowerFactory = await ethers.getContractFactory("Flower"); 
        const flower: Flower = await FlowerFactory.deploy();
        await flower.deployed(); 
        await flower.mint(seller.address, 1); 

        const EscrowFactory = await ethers.getContractFactory("Escrow"); 
        const escrow: Escrow = await EscrowFactory.deploy(
            flower.address, 
            1,  
            1555, 
            100, 
            seller.address, 
            buyer.address);
        await escrow.deployed(); 

        return { escrow, flower, deployer, user, seller, buyer }
    }

    it("should test escrow", async () => {
        const { escrow, deployer, user, buyer, seller, flower} = await loadFixture(deploy);
        await escrow.connect(buyer).depositPledge({value: ethers.utils.parseEther("1555")});
        await escrow.connect(buyer).approveSale();
        await escrow.connect(seller).approveSale();
        console.log(await escrow.getBalance());
        await flower.connect(seller).setApprovalForAll(escrow.address, true);
        console.log("Seller balance before:", await ethers.utils.formatEther(await seller.getBalance()));
        await escrow.connect(buyer).finalizeSale();
        console.log(await escrow.purchasePrice());
        expect(await flower.ownerOf(1)).to.eq(buyer.address);
        console.log("Seller balance after:", await ethers.utils.formatEther(await seller.getBalance()));
    })
})
