import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat"; 
import { NFTMarketplace, NFTMarketplace__factory } from "../typechain-types"; 
import { Dota2Collection, Dota2Collection__factory } from "../typechain-types";
import { MaximumToken, MaximumToken__factory } from "../typechain-types";
import { Flower, Flower__factory } from "../typechain-types";

describe("NFTMarketplace", () => {

    async function deploy() {
        const [deployer, user, user2, user3, user4] = await ethers.getSigners();
        const NFTMarketplaceFactory = await ethers.getContractFactory("NFTMarketplace"); 
        const marketplace: NFTMarketplace = await NFTMarketplaceFactory.deploy();
        await marketplace.deployed(); 

        const Dota2CollectionFactory = await ethers.getContractFactory("Dota2Collection");
        const erc1155: Dota2Collection = await Dota2CollectionFactory.deploy();
        await erc1155.deployed(); 

        const ERC20Factory = await ethers.getContractFactory("MaximumToken");
        const erc20: MaximumToken = await ERC20Factory.deploy();
        await erc20.deployed(); 

        const FlowerFactory = await ethers.getContractFactory("Flower");
        const erc721: Flower = await FlowerFactory.deploy();
        await erc721.deployed(); 

        marketplace.setPaymentToken(erc20.address);

        return { marketplace, erc1155, erc721, erc20, deployer, user, user2, user3, user4 }
    }

    it("should return payment token", async () => {
        const { marketplace, erc1155, erc20, deployer, user } = await loadFixture(deploy);
        console.log(await marketplace.paymentToken());
    })

    it("should revert with error", async () => {
        const { marketplace, erc1155, erc20, deployer, user } = await loadFixture(deploy);
        await expect(marketplace.sell1155NFTs(erc1155.address, [0,1,2], [0,0,0], 50)).to.be.revertedWith("can not sell 0 tokens");
    })

    it("should sell NFT721", async () => {
        const { marketplace, erc1155, erc721, erc20, deployer, user } = await loadFixture(deploy);
        await erc721.mint(user.address, 1);
        await erc721.connect(user).setApprovalForAll(marketplace.address, true); 
        await marketplace.connect(user).sellNFT721(erc721.address, 1, 25);
        expect(await (await marketplace.NFTs721(1)).price).to.eq(25);
    })

    it("should buy NFT721", async () => {
        const { marketplace, erc1155, erc721, erc20, deployer, user, user2 } = await loadFixture(deploy);
        await erc721.mint(user.address, 1);
        await erc721.connect(user).setApprovalForAll(marketplace.address, true); 
        await marketplace.connect(user).sellNFT721(erc721.address, 1, 30);
        await erc20.transfer(user2.address, 200);
        await erc20.connect(user2).increaseAllowance(marketplace.address, 200);
        await marketplace.connect(user2).buyNFT721(1);
        expect(await erc20.balanceOf(user.address)).to.eq(27);
    })

    it("should sell 1155NFTs", async () => {
        const { marketplace, erc1155, erc20, deployer, user } = await loadFixture(deploy);
        await erc1155.safeBatchTransferFrom(deployer.address, user.address, [0,1,2], [5,6,7], "0x00");
        await erc1155.connect(user).setApprovalForAll(marketplace.address, true);
        await marketplace.connect(user).sell1155NFTs(erc1155.address, [0,1,2], [5,6,7], 10);
        expect(await erc1155.balanceOf(marketplace.address, 0)).to.eq(5);
    })

    it("should buy 1155NFTs", async () => {
        const { marketplace, erc1155, erc20, deployer, user, user2 } = await loadFixture(deploy);
        await erc1155.safeBatchTransferFrom(deployer.address, user.address, [0,1,2], [5,6,7], "0x00");
        await erc1155.connect(user).setApprovalForAll(marketplace.address, true);
        await marketplace.connect(user).sell1155NFTs(erc1155.address, [0,1,2], [5,6,7], 10);
        await erc20.transfer(user2.address, 190);
        await erc20.connect(user2).increaseAllowance(marketplace.address, 190);
        await marketplace.connect(user2).buy1155NFTs(1);
        expect(await erc20.balanceOf(user2.address)).to.eq(10);
        expect(await erc1155.balanceOf(user2.address, 0)).to.eq(5);
    })

    it("should buy 1155NFTs(single 1155 token)", async () => {
        const { marketplace, erc1155, erc20, deployer, user, user2 } = await loadFixture(deploy);
        await erc1155.safeBatchTransferFrom(deployer.address, user.address, [0,1,2], [5,6,7], "0x00");
        await erc1155.connect(user).setApprovalForAll(marketplace.address, true);
        await marketplace.connect(user).sell1155NFTs(erc1155.address, [0], [1], 10);
        await erc20.transfer(user2.address, 190);
        await erc20.connect(user2).increaseAllowance(marketplace.address, 190);
        await marketplace.connect(user2).buy1155NFTs(1);
        expect(await erc20.balanceOf(user2.address)).to.eq(180);
        expect(await erc1155.balanceOf(user2.address, 0)).to.eq(1);
    })

    it("should close NFT1155 sale by owner", async () => {
        const { marketplace, erc1155, erc20, deployer, user } = await loadFixture(deploy);
        await erc1155.safeBatchTransferFrom(deployer.address, user.address, [0,1,2], [5,6,7], "0x00");
        await erc1155.connect(user).setApprovalForAll(marketplace.address, true);
        await marketplace.connect(user).sell1155NFTs(erc1155.address, [0,1,2], [5,6,7], 10);
        await marketplace.close1155Sale(1);
        expect(await (await marketplace.NFTs1155(1)).price).to.eq(0);
        expect(await erc1155.balanceOf(user.address, 0)).to.eq(5);
    })

    it("should close NFT1155 sale by seller", async () => {
        const { marketplace, erc1155, erc20, deployer, user } = await loadFixture(deploy);
        await erc1155.safeBatchTransferFrom(deployer.address, user.address, [0,1,2], [5,6,7], "0x00");
        await erc1155.connect(user).setApprovalForAll(marketplace.address, true);
        await marketplace.connect(user).sell1155NFTs(erc1155.address, [0,1,2], [5,6,7], 10);
        await marketplace.connect(user).close1155Sale(1);
        expect(await (await marketplace.NFTs1155(1)).price).to.eq(0);
        expect(await erc1155.balanceOf(user.address, 1)).to.eq(6);
    })

    it("should close NFT721 sale by seller", async () => {
        const { marketplace, erc1155, erc721, erc20, deployer, user } = await loadFixture(deploy);
        await erc721.mint(user.address, 1);
        await erc721.connect(user).setApprovalForAll(marketplace.address, true); 
        await marketplace.connect(user).sellNFT721(erc721.address, 1, 25);
        await marketplace.connect(user).closeNFT721Sale(1);
    })

    it("should close NFT721 sale by owner", async () => {
        const { marketplace, erc1155, erc721, erc20, deployer, user } = await loadFixture(deploy);
        await erc721.mint(user.address, 1);
        await erc721.connect(user).setApprovalForAll(marketplace.address, true); 
        await marketplace.connect(user).sellNFT721(erc721.address, 1, 25);
        await marketplace.closeNFT721Sale(1);
    })

    it("should set fee", async () => {
        const { marketplace, erc1155, erc721, erc20, deployer, user } = await loadFixture(deploy);
        await marketplace.setFee(10);
    })

    it("should withdraw tokens", async () => {
        const { marketplace, erc1155, erc20, deployer, user } = await loadFixture(deploy);
        await erc20.mint(marketplace.address, 1000); 
        await marketplace.withdrawToken(user.address);
        expect(await erc20.balanceOf(user.address)).to.eq(1000);
    })

    it("should withdraw ether from marketplace", async () => {
        const { marketplace, erc1155, erc721, erc20, deployer, user } = await loadFixture(deploy);
        console.log("Deployer eth balance before transfer", ethers.utils.formatEther(await deployer.getBalance()));
        await marketplace.connect(user).fallback({value: ethers.utils.parseEther("1")}); 
        console.log("Marketplace eth balance", ethers.utils.formatEther(await marketplace.viewEthBalance()));
        await marketplace.withdrawEth();
        console.log("Deployer eth balance after withdraw eth from marketplace", ethers.utils.formatEther(await deployer.getBalance()));
    })

    it("should test marketplace functional", async() => {
        const { marketplace, erc1155, erc721, erc20, deployer, user, user2, user3, user4 } = await loadFixture(deploy);
        //minting nfts721 to address user & user2 and setting aproval 
        await erc721.mint(user.address, 1); 
        await erc721.connect(user).setApprovalForAll(marketplace.address, true); 
        expect(await erc721.ownerOf(1)).to.eq(user.address);
        await erc721.mint(user2.address, 2);
        await erc721.connect(user2).setApprovalForAll(marketplace.address, true);
        expect(await erc721.ownerOf(2)).to.eq(user2.address);
        //minting nfts1155 to address user & user2 and setting approval
        await erc1155.mint(user.address, 0, 10, "0x00");
        await erc1155.mint(user.address, 1, 10, "0x00");
        await erc1155.connect(user).setApprovalForAll(marketplace.address, true);
        expect(await erc1155.balanceOf(user.address, 0)).to.eq(10);
        await erc1155.mint(user2.address, 3, 10, "0x00");
        await erc1155.mint(user2.address, 4, 10, "0x00");
        await erc1155.connect(user2).setApprovalForAll(marketplace.address, true);
        expect(await erc1155.balanceOf(user2.address, 3)).to.eq(10);
        //minting erc20 tokens for user3 & user4 and increasing allowance, so they can buy nfts
        await erc20.mint(user3.address, 500); 
        await erc20.connect(user3).increaseAllowance(marketplace.address, 500); 
        expect(await erc20.balanceOf(user3.address)).to.eq(500);
        await erc20.mint(user4.address, 500);
        await erc20.connect(user4).increaseAllowance(marketplace.address, 500);
        expect(await erc20.balanceOf(user4.address)).to.eq(500);
        await marketplace.connect(user).sellNFT721(erc721.address, 1, 30);
        console.log("erc721(user) sale nonce:", await (await marketplace.nonce()).toNumber() - 1); 
        await marketplace.connect(user2).sellNFT721(erc721.address, 2, 40);
        console.log("erc721(user2) sale nonce:", await (await marketplace.nonce()).toNumber() - 1);
        await marketplace.connect(user).sell1155NFTs(erc1155.address, [0,1], [10,10], 10);
        console.log("erc1155(user) sale nonce:", await (await marketplace.nonce()).toNumber() - 1);
        await marketplace.connect(user2).sell1155NFTs(erc1155.address, [3,4], [10,10], 12);
        console.log("erc1155(user2) sale nonce:", await (await marketplace.nonce()).toNumber() - 1);
        //user3 buying erc721 from user
        await marketplace.connect(user3).buyNFT721(1); 
        expect(await erc721.ownerOf(1)).to.eq(user3.address);
        expect(await erc20.balanceOf(user.address)).to.eq(27);
        expect(await erc20.balanceOf(marketplace.address)).to.eq(3); 
        //user4 buying erc1155 from user2
        await marketplace.connect(user4).buy1155NFTs(4);
        expect(await erc1155.balanceOf(user4.address, 3)).to.eq(10); 
        expect(await erc20.balanceOf(user2.address)).to.eq(220);
        expect(await erc20.balanceOf(user4.address)).to.eq(260);
        expect(await erc20.balanceOf(marketplace.address)).to.eq(23);
        //user3 selling erc721 
        await erc721.connect(user3).setApprovalForAll(marketplace.address, true); 
        await marketplace.connect(user3).sellNFT721(erc721.address, 1, 50); 
        console.log("erc721(user3) sale nonce:", await (await marketplace.nonce()).toNumber() - 1);
        await marketplace.closeNFT721Sale(5); 
        //user3 selling erc721 again 
        await erc721.connect(user3).setApprovalForAll(marketplace.address, true);
        await marketplace.connect(user3).sellNFT721(erc721.address, 1, 50); 
        console.log("erc721(user3) sale nonce:", await (await marketplace.nonce()).toNumber() - 1);
        await erc20.connect(user2).increaseAllowance(marketplace.address, 50); 
        // //user2 buying erc721 from user3
        await marketplace.connect(user2).buyNFT721(6);
        expect(await erc721.ownerOf(1)).to.eq(user2.address);
        expect(await erc20.balanceOf(user3.address)).to.eq(515); 
        expect(await erc20.balanceOf(marketplace.address)).to.eq(28);
        await marketplace.withdrawToken(deployer.address); 
    })
})
