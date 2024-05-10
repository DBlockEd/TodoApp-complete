// SPDX-License-Identifier: MIT

pragma solidity ^0.8.25;

import './ownable.sol';

contract TodoApp is Ownable {

    uint256 public todoPrice = 0.01 ether;
    
    struct Task {
        uint id;
        string task;
        bool completed;
    }
    
    // Mapping to store user-specific tasks
    mapping(address => Task[]) public userTasks;

    // Function to add a new task for the caller
    function addTask(string memory _newTask) public payable {
        require(msg.value >= todoPrice, "Eth sent is less than todoPrice");
        
        Task memory newTask = Task(userTasks[msg.sender].length, _newTask, false);
        userTasks[msg.sender].push(newTask);
    }

    // Function to mark a specific task as completed
    function markAsCompleted(uint _id) public {
        require(_id < userTasks[msg.sender].length, "Task ID does not exist");
        
        Task storage targetTask = userTasks[msg.sender][_id];
        require(!targetTask.completed, "Task is already complete");
        
        targetTask.completed = true;
    }

    // Function to mark a specific task as uncompleted
    function markAsUncompleted(uint _id) public {
        require(_id < userTasks[msg.sender].length, "Task ID does not exist");
        
        Task storage targetTask = userTasks[msg.sender][_id];
        require(targetTask.completed, "Task is already uncomplete");
        
        targetTask.completed = false;
    }

    // Function to delete a specific task by index
    function deleteTask(uint _id) public {
        require(_id < userTasks[msg.sender].length, "Task ID does not exist");
        
        // Shift the tasks to the left to remove the deleted task
        for (uint i = _id; i < userTasks[msg.sender].length - 1; i++) {
            userTasks[msg.sender][i] = userTasks[msg.sender][i + 1];
        }
        
        // Pop the last element after shifting
        userTasks[msg.sender].pop();
    }

    // Function to retrieve all tasks for the caller
    function retrieveTasks() public view returns (Task[] memory) {
        return userTasks[msg.sender];
    }

    function changeTodoPrice(uint256 _newTodoPrice) public onlyOwner {
        todoPrice = _newTodoPrice;
    }

    // Function to get the contract's ETH balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Function to withdraw the contract's ETH balance to the owner's address
    function withdrawBalance() public onlyOwner {
        require(address(this).balance > 0, "No balance to withdraw");
        payable(owner()).transfer(address(this).balance);
    }
    
}
