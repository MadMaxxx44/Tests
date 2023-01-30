//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import { Test } from "forge-std/Test.sol"; 
import { console } from "forge-std/console.sol"; 
import { PublicMultySale } from "../src/PublicMultySale.sol";
import { MaximumToken } from "../src/MaximumToken.sol";
import { TOKEN } from "../src/TOKEN.sol";


contract PublicMultySaleTest is Test {
    PublicMultySale public publicmultysale; 
    MaximumToken public token;
    TOKEN public token2;
    
    function setUp() public {
        publicmultysale = new PublicMultySale();
        token = new MaximumToken();
        token2 = new TOKEN();
    }

    function testAddTokenForPrepayment() public {
        publicmultysale.addTokenForPrepayment(token);
    }

    function testFailAddTokenForPrepayment() public {
        address alice = address(10);
        vm.prank(alice); 
        publicmultysale.addTokenForPrepayment(token);
    }

    function testRemoveTokenForPrepayment() public {
        publicmultysale.addTokenForPrepayment(token);
        publicmultysale.removeTokenForPrepayment(token);
    }

    function testSendPrepayment() public {
        address alice = address(10);
        address bob = address(11);
        publicmultysale.addTokenForPrepayment(token);
        token.mint(alice, 100);
        publicmultysale.transferOwnership(bob);
        uint bobsBalanceBefore = token.balanceOf(bob);
        console.log(bobsBalanceBefore);
        vm.startPrank(alice);
        token.increaseAllowance(address(publicmultysale), 100);
        publicmultysale.sendPrepayment(token, 100);
        uint bobsBalanceAfter = token.balanceOf(bob);
        console.log(bobsBalanceAfter);
    }

    function testAddToken() public {
        address alice = address(10);
        address bob = address(11);
        publicmultysale.addTokenForPrepayment(token);
        token.mint(alice, 110);
        publicmultysale.transferOwnership(bob);
        vm.startPrank(alice);
        token.increaseAllowance(address(publicmultysale), 100);
        publicmultysale.sendPrepayment(token, 100);
        token.increaseAllowance(address(publicmultysale), 100);
        publicmultysale.addToken(100, 100, token);
    }

    function testBuy() public {
        address alice = address(10);
        address bob = address(11);
        token2.mint(bob, 100);
        publicmultysale.addTokenForPrepayment(token);
        token.mint(alice, 110);
        publicmultysale.transferOwnership(bob);
        vm.startPrank(alice);
        token.increaseAllowance(address(publicmultysale), 100);
        publicmultysale.sendPrepayment(token, 100);
        token.increaseAllowance(address(publicmultysale), 100);
        publicmultysale.addToken(100, 100, token);
        vm.stopPrank();
        vm.startPrank(bob);
        token2.increaseAllowance(address(publicmultysale), 100);
        publicmultysale.buy(token, token2, 100);
    }
}
