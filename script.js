let addTaskBtn = document.getElementById("addTaskBtn");
let taskInput = document.getElementById("taskInput");
let taskList = document.getElementById("taskList");



addTaskBtn.onclick = function () {
  let taskValue = taskInput.value.trim();
  if (taskValue) {
    let li = document.createElement("li");
    li.textContent = taskValue;
    taskList.appendChild(li);
    tasks.push(taskValue);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    taskInput.value = "";
  } else {
    alert("Please enter a task!");
  }
};

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
tasks.forEach(function (task) {
  let li = document.createElement("li");
  li.textContent = task;
  taskList.appendChild(li);
});
