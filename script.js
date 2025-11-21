let addTaskBtn = document.getElementById("addTaskBtn");
let taskInput = document.getElementById("taskInput");
let dateInput = document.getElementById("taskDate");
let timeInput = document.getElementById("taskTime");
let taskList = document.getElementById("taskList");
let clearAllBtn = document.getElementById("clearAllBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function getTimeRemaining(date, time) {
  let now = new Date();
  let taskDateTime = new Date(`${date}T${time}`);
  let diff = taskDateTime - now; 

  if (diff <= 0) return "Time over";

  let hours = Math.floor(diff / (1000 * 60 * 60));
  let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0 && minutes === 0) return "Less than 1 min left";
  if (hours === 0) return `${minutes} min left`;
  return `${hours}h ${minutes}m left`;
}

function displayTasks() {
  let taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    let li = document.createElement("li");

    let now = new Date();
    let taskDateTime = new Date(`${task.date}T${task.time}`);
    let remaining = getTimeRemaining(task.date, task.time);
    let isPast = taskDateTime < now;
    
    if (task.completed) {
      li.style.backgroundColor = "#44fa36ff";
    } else if (isPast) {
      li.style.backgroundColor = "#fd2f40ff";
    } else {
      li.style.backgroundColor = "#ebe850ff"; 
    }

    li.innerHTML = `
      <strong>🎯 ${task.text}</strong><br>
      📅 ${task.date} ⏰ ${task.time}<br>
      🕒 Added on: ${task.createdAt}<br>
      ⏳ Status: <em>${task.completed ? "✅ Completed" : remaining}</em>
      <div class="actions"></div>
    `;

    let completeBtn = document.createElement("button");
    completeBtn.textContent = task.completed ? "Undo" : "Done";
    completeBtn.className = "completeBtn";
    completeBtn.onclick = function () {
      tasks[index].completed = !tasks[index].completed;
      localStorage.setItem("tasks", JSON.stringify(tasks));
      displayTasks();
    };

    let editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "editBtn";
    editBtn.onclick = function () {
      let newTask = prompt("Edit task:", task.text);
      let newDate = prompt("Edit date (YYYY-MM-DD):", task.date);
      let newTime = prompt("Edit time (HH:MM):", task.time);
      if (newTask && newDate && newTime) {
        tasks[index] = { ...task, text: newTask, date: newDate, time: newTime };
        localStorage.setItem("tasks", JSON.stringify(tasks));
        displayTasks();
      }
    };

    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "deleteBtn";
    deleteBtn.onclick = function () {
      if (confirm("Delete this task?")) {
        tasks.splice(index, 1);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        displayTasks();
      }
    };

    li.querySelector(".actions").appendChild(completeBtn);
    li.querySelector(".actions").appendChild(editBtn);
    li.querySelector(".actions").appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

addTaskBtn.onclick = function () {
  let text = taskInput.value.trim();
  let date = document.getElementById("taskDate").value;
  let time = document.getElementById("taskTime").value;

  if (text && date && time) {
    let now = new Date();
    let createdAt = now.toISOString().slice(0, 10) + " " + now.toTimeString().slice(0, 5);
    tasks.push({ text, date, time, createdAt, completed: false });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayTasks();

    taskInput.value = "";
    document.getElementById("taskDate").value = "";
    document.getElementById("taskTime").value = "";
  } else {
    alert("Please fill all fields!");
  }
};

clearAllBtn.onclick = function () {
  if (confirm("Clear all tasks?")) {
    tasks = [];
    localStorage.removeItem("tasks");
    displayTasks();
  }
};

displayTasks();
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const closeSidebar = document.getElementById("closeSidebar");
menuBtn.onclick = () => {
  sidebar.style.left = "0px";
  overlay.style.display = "block";
};

closeSidebar.onclick = () => {
  sidebar.style.left = "-250px";
  overlay.style.display = "none";
};

overlay.onclick = () => {
  sidebar.style.left = "-250px";
  overlay.style.display = "none";
};
