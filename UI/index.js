import { ethers } from "https://cdn-cors.ethers.io/lib/ethers-5.5.4.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const addTaskButton = document.getElementById("add-task-button");
const textArea = document.getElementById("text-box");
const listcontainer = document.getElementById("list-container");


addTaskButton.onclick = addTask;
connectButton.onclick = connectAndLoadTasks;


let tasks = [];


const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, abi, signer);

window.addEventListener('load', async () => {
    await connectAndLoadTasks();
});


async function connectAndLoadTasks() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" });
            connectButton.innerHTML = "Connected";
            updateTaskList();
        } catch (error) {
            console.log(error);
            connectButton.innerHTML = "Connect";
        }
    } else {
        connectButton.innerHTML = "Please install MetaMask";
    }
}

async function addTask() {
    if (textArea.value === '') {
        alert("You cannot add an empty task");
    }
    else {
        console.log("Adding Task");
        const task = textArea.value;
        const tx = await contract.addTask(
            task,
            { value: ethers.utils.parseEther("0.01") }
        );
        await tx.wait(1);
        console.log("Task Added");
        textArea.value = "";
    }
    updateTaskList();
}



listcontainer.addEventListener("click", async function (e) {
    if (e.target.tagName === 'LI') {
        const taskId = e.target.getAttribute('data-id');
        if (tasks[taskId][2] === true) {
            await markAsUncompleted(taskId);
            e.target.classList.toggle("unchecked");
        }
        else {
            await markAsCompleted(taskId);
            e.target.classList.toggle("checked");
        }
    }
    if (e.target.tagName === 'SPAN') {
        const taskId = e.target.parentNode.getAttribute('data-id');
        await deleteTask(taskId);
    }
});

async function markAsCompleted(id) {
    console.log("Marking task id: ", id, " as Completed");
    const tx = await contract.markAsCompleted(id);
    await tx.wait(1);
    console.log("Task Marked as Completed");
    updateTaskList();
}


async function markAsUncompleted(id) {
    console.log("Marking task id: ", id, " as Uncompleted");
    const tx = await contract.markAsUncompleted(id);
    await tx.wait(1);
    console.log("Task Marked as Uncompleted");
    updateTaskList();
}

async function deleteTask(id) {
    console.log("Deleting Task id:", id);
    const tx = await contract.deleteTask(id);
    await tx.wait(1);
    console.log("Task Deleted");
    updateTaskList();
}

async function updateTaskList() {
    console.log("Updating Task List");
    tasks = await contract.retrieveTasks();
    console.log("The tasks are ", tasks);
    updateUI(tasks);
}

function updateUI(tasks) {

    listcontainer.innerHTML = "";

    for (let i = 0; i < tasks.length; i++) {
        let li = document.createElement("li");
        li.innerHTML = tasks[i][1];
        li.setAttribute('data-id', i);
        li.classList.add(tasks[i][2] ? "checked" : "unchecked");
        listcontainer.appendChild(li);
        let span = document.createElement("span");
        span.innerHTML = "\u00d7";
        li.appendChild(span);
    }
}