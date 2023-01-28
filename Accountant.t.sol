//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import { Test } from "forge-std/Test.sol"; 
import { console } from "forge-std/console.sol"; 
import { Accountant } from "../src/Accountant.sol";

contract AccountantTest is Test {
    Accountant public accountant; 

    function setUp() public {
        accountant = new Accountant();
        accountant.addCategory("Food");
        accountant.addCategory("Car");
        accountant.addCategory("Cat");
    }

    function testAddCategory() public {
        accountant.addCategory("Test"); 
    }

    function testFailAddCategory() public {
        vm.prank(address(0));
        accountant.addCategory("Water"); 
    }

    function testAddIncome() public {
        address alice = address(10);
        vm.startPrank(alice);
        accountant.addIncome(100, Accountant.incomeName(0));
        int temp = accountant.viewIncome(Accountant.incomeName(0));
        int temp2 = accountant.viewBalance();
        console.logInt(temp); 
        console.logInt(temp2); 
    }

    function testFailAddIncome() public {
        //adding 0 amount to income
        address alice = address(10);
        vm.startPrank(alice);
        accountant.addIncome(0, Accountant.incomeName(0));
        int temp = accountant.viewIncome(Accountant.incomeName(0));
        int temp2 = accountant.viewBalance();
        console.logInt(temp); 
        console.logInt(temp2);
    }

    function testAddSpending() public { 
        address alice = address(10);
        vm.startPrank(alice);
        accountant.addSpending(111, "Food");
        int temp = accountant.viewCategorySpendings("Food");
        int temp2 = accountant.viewBalance();
        console.logInt(temp);
        console.logInt(temp2);
    }

    function testFailAddSpending() public {
        //trying to reach undefined catigory
        accountant.addSpending(111, "Presents");
        int temp = accountant.viewCategorySpendings("Presents");
        console.logInt(temp);
    }

    function testFailAddSpending2() public {
        //adding 0 amount to spending
        accountant.addSpending(0, "Food");
        int temp = accountant.viewCategorySpendings("Food");
        console.logInt(temp);
    }

    function testViewCategories() public view {
        string[] memory tempArr = accountant.viewCatigories(); 
        console.log(tempArr[0], tempArr[1], tempArr[2]);
    }

    function testDifferentIncomesAndSpendings() public {
        address alice = address(10);
        address bob = address(11); 
        vm.startPrank(alice); 
        accountant.addIncome(100, Accountant.incomeName(0)); 
        accountant.addIncome(200, Accountant.incomeName(1)); 
        accountant.addIncome(300, Accountant.incomeName(2));
        accountant.addSpending(55, "Food");  
        accountant.addSpending(120, "Car"); 
        accountant.addSpending(183, "Cat");
        int aliceTotalBalance = accountant.viewBalance(); 
        console.logInt(aliceTotalBalance);
        vm.stopPrank(); 
        vm.startPrank(bob); 
        accountant.addIncome(335, Accountant.incomeName(0)); 
        accountant.addSpending(145, "Food");
        accountant.addSpending(382, "Car");
        accountant.addIncome(1000, Accountant.incomeName(1)); 
        accountant.addIncome(550, Accountant.incomeName(2));
        accountant.addSpending(324, "Cat");
        int bobTotalBalance = accountant.viewBalance(); 
        console.logInt(bobTotalBalance);
    }
}
