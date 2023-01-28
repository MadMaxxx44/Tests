// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import { Test } from "forge-std/Test.sol"; 
import { console } from "forge-std/console.sol"; 
import { SimpleWallet } from "../src/SimpleWallet.sol";
import { MaximumToken } from "../src/MaximumToken.sol"; 

contract SimpleWalletTest is Test {
    SimpleWallet public wallet; 
    MaximumToken public token; 

    function setUp() public {
        wallet = new SimpleWallet();
        token = new MaximumToken();  
    }

    ///////////////////////////////////EtherTests//////////////////////////////////////
    
    function testDepositEther() public {
        address alice = address(10);  
        vm.deal(alice, 100 ether/1e18);  
        vm.startPrank(alice); 
        wallet.depositEther{value: 11}(); 
        console.log(address(alice).balance);
    }

    function testFailDepositEther() public {
        address alice = address(10);
        vm.deal(alice, 100 ether/1e18);
        vm.startPrank(alice);
        wallet.depositEther{value: 0}();
    }

    function testWithdrawEther() public {
        address alice = address(10);
        vm.deal(alice, 100 ether/1e18);
        vm.startPrank(alice);
        wallet.depositEther{value: 11}();
        wallet.withdrawEther(alice, 11);
    }

    function testWithdrawEtherOwner() public {
        address alice = address(10);
        wallet.transferOwnership(alice);
        vm.deal(alice, 100 ether/1e18);
        vm.startPrank(alice);
        wallet.depositEther{value: 15}();
        wallet.withdrawEther(wallet.owner(), 15); 
    }

    function testFailWithdrawEtherZeroAmount() public {
        address alice = address(10);
        vm.deal(alice, 100 ether/1e18);
        vm.startPrank(alice);
        wallet.depositEther{value: 11}();
        wallet.withdrawEther(alice, 0);
    }

    function testFailWithdrawEther2() public {
        //reason trying to withdraw more then deposited
        address alice = address(10);
        vm.deal(alice, 100 ether/1e18);
        vm.startPrank(alice);
        wallet.depositEther{value: 11}();
        wallet.withdrawEther(alice, 12);
    }

    //////////////////////////////////TokenTests/////////////////////////////////

     function testAddToken() public {
        wallet.addToken(address(10)); 
    }

    function testFailAddToken() public {
        vm.prank(address(0)); 
        wallet.addToken(address(10)); 
    }

    function testDepositTokenOwner() public {
        address alice = address(10);
        wallet.transferOwnership(alice);
        token.transfer(alice, 100);
        vm.startPrank(alice);
        wallet.addToken(address(token));
        token.increaseAllowance(address(wallet), 100);
        wallet.depositToken(address(token), 100);
        uint a = wallet.viewTokensBalance(address(token));
        console.log(a); 
    }

    function testDepositTokenUser() public {
        address alice = address(10);
        address bob = address(123);
        wallet.transferOwnership(alice);
        token.transfer(alice, 100);
        token.transfer(bob, 100);
        vm.startPrank(alice);
        wallet.addToken(address(token));
        vm.stopPrank();
        vm.startPrank(bob);
        token.increaseAllowance(address(wallet), 100);
        wallet.depositToken(address(token), 100);
        console.log(wallet.userBalance(address(token)));
    }

    function testFailDepositTokenUser() public {
        //fails when user trying to deposit more tokens then he has
        address alice = address(10);
        address bob = address(123);
        wallet.transferOwnership(alice);
        token.transfer(alice, 100);
        token.transfer(bob, 1);
        vm.startPrank(alice);
        wallet.addToken(address(token));
        vm.stopPrank();
        vm.startPrank(bob);
        token.increaseAllowance(address(wallet), 100);
        wallet.depositToken(address(token), 100);
        uint a = wallet.viewTokensBalance(address(bob));
        console.log(a);
    }

    function testFailDepositZeroAmountUser() public {
        address alice = address(10);
        address bob = address(123);
        wallet.transferOwnership(alice);
        token.transfer(alice, 100);
        token.transfer(bob, 100);
        vm.startPrank(alice);
        wallet.addToken(address(token));
        vm.stopPrank();
        vm.startPrank(bob);
        token.increaseAllowance(address(wallet), 100);
        wallet.depositToken(address(token), 0);
        uint a = wallet.viewTokensBalance(address(bob));
        console.log(a);
    }

    function testWithdrawTokenOwner() public {
        address alice = address(10);
        wallet.transferOwnership(alice);
        token.transfer(alice, 100);
        vm.startPrank(alice);
        wallet.addToken(address(token));
        token.increaseAllowance(address(wallet), 100);
        wallet.depositToken(address(token), 100);
        console.log(wallet.userBalance(address(token)));

        wallet.withdrawToken(address(token), 100);
        console.log(wallet.userBalance(address(token)));
    }

    function testFailWithdrawTokenOwner() public {
        address alice = address(10);
        wallet.transferOwnership(alice);
        token.transfer(alice, 100);
        vm.startPrank(alice);
        wallet.addToken(address(token));
        token.increaseAllowance(address(wallet), 100);
        wallet.depositToken(address(token), 100);
        console.log(wallet.userBalance(address(token)));

        wallet.withdrawToken(address(token), 10000);
        console.log(wallet.userBalance(address(token)));
    }

    function testWithdrawTokenUser() public {
        address alice = address(10);
        address bob = address(123);
        wallet.transferOwnership(alice);
        token.transfer(alice, 100);
        token.transfer(bob, 100);
        vm.startPrank(alice);
        wallet.addToken(address(token));
        vm.stopPrank();
        vm.startPrank(bob);
        token.increaseAllowance(address(wallet), 100);
        wallet.depositToken(address(token), 100);
        console.log(wallet.userBalance(address(token))); 

        wallet.withdrawToken(address(token), 100);
        console.log(wallet.userBalance(address(token)));
    }

    function testFailWithdrawTokenUser() public {
        address alice = address(10);
        address bob = address(123);
        wallet.transferOwnership(alice);
        token.transfer(alice, 100);
        token.transfer(bob, 100);
        vm.startPrank(alice);
        wallet.addToken(address(token));
        vm.stopPrank();
        vm.startPrank(bob);
        token.increaseAllowance(address(wallet), 100);
        wallet.depositToken(address(token), 100);
        console.log(wallet.userBalance(address(token))); 

        wallet.withdrawToken(address(token), 100000);
        console.log(wallet.userBalance(address(token)));
    }
}
