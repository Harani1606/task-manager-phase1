$(document).ready(function() {

  // ===================== Page Navigation =====================
  $('#showRegister').click(function() {
    $('#loginPage').removeClass('active');
    $('#registerPage').addClass('active');
  });

  $('#showLogin').click(function() {
    $('#registerPage').removeClass('active');
    $('#loginPage').addClass('active');
  });

  // ===================== Register User =====================
  $('#registerBtn').click(function() {
    let username = $('#regUsername').val().trim();
    let password = $('#regPassword').val().trim();

    if(username === '' || password === '') {
      alert('Please enter username and password!');
      return;
    }

    let users = JSON.parse(localStorage.getItem('users') || '{}');

    if(users[username]) {
      alert('Username already exists!');
    } else {
      users[username] = { password: password };
      localStorage.setItem('users', JSON.stringify(users));
      alert('Registration successful! You can now login.');
      $('#registerPage').removeClass('active');
      $('#loginPage').addClass('active');
    }
  });

  // ===================== Login User =====================
  $('#loginBtn').click(function() {
    let username = $('#username').val().trim();
    let password = $('#password').val().trim();

    let users = JSON.parse(localStorage.getItem('users') || '{}');

    if(users[username] && users[username].password === password) {
      localStorage.setItem('currentUser', username);
      $('#loginPage, #registerPage').removeClass('active');
      $('#dashboard').addClass('active');
      $('#displayUser').text(username);

      loadTasks();
      requestNotificationPermission();
      startReminderCheck();
    } else {
      alert('Invalid username or password!');
    }
  });

  // ===================== Logout =====================
  $('#logoutBtn').click(function() {
    localStorage.removeItem('currentUser');
    $('#dashboard').removeClass('active');
    $('#loginPage').addClass('active');
    stopReminderCheck();
  });

  // ===================== Add Task =====================
  $('#addTaskBtn').click(function() {
    let taskName = $('#taskName').val().trim();
    let taskDate = $('#taskDate').val();
    let startTime = $('#startTime').val();
    let endTime = $('#endTime').val();
    let note = $('#taskNote').val().trim();
    let reminder = parseInt($('#reminderTime').val());

    if(taskName === '' || taskDate === '' || startTime === '' || endTime === '') {
      alert('Please fill task name, date, start and end time!');
      return;
    }

    let duration = calculateDuration(startTime, endTime);

    let task = {
      name: taskName,
      date: taskDate,
      start: startTime,
      end: endTime,
      note: note,
      duration: duration,
      reminder: reminder || 0, // minutes before
      status: 'Pending'
    };

    saveTask(task);
    addTaskToDOM(task);
    clearTaskForm();
  });

  // ===================== Helper Functions =====================
  function calculateDuration(start, end) {
    let [sh, sm] = start.split(':').map(Number);
    let [eh, em] = end.split(':').map(Number);

    let startMinutes = sh*60 + sm;
    let endMinutes = eh*60 + em;
    let diffMinutes = endMinutes - startMinutes;

    if(diffMinutes < 0) diffMinutes += 24*60;

    let hours = Math.floor(diffMinutes / 60);
    let minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  function saveTask(task) {
    let currentUser = localStorage.getItem('currentUser');
    let tasks = JSON.parse(localStorage.getItem(currentUser + '_tasks') || '[]');
    tasks.push(task);
    localStorage.setItem(currentUser + '_tasks', JSON.stringify(tasks));
  }

  function loadTasks() {
    let currentUser = localStorage.getItem('currentUser');
    let tasks = JSON.parse(localStorage.getItem(currentUser + '_tasks') || '[]');

    // update expired status
    tasks = tasks.map(checkTaskExpiry);
    localStorage.setItem(currentUser + '_tasks', JSON.stringify(tasks));

    $('#tasksContainer').empty();
    tasks.forEach(task => addTaskToDOM(task));
  }

  function addTaskToDOM(task) {
  let color = '#3498db'; // default pending
  let emoji = '⏳';

  if(task.status === 'Completed') {
    color = '#2ecc71';
    emoji = '✅';
  } else if(task.status === 'Expired') {
    color = '#e74c3c';
    emoji = '⚠️';
  }

  let li = $(`
    <li class="task" style="background-color:${color};">
      <div class="task-info">
        <span>${emoji} <b>${task.name}</b> (${task.duration}) - ${task.status}</span>
        <div class="task-meta">
          🕒 ${task.start} - ${task.end} | 🔔 Reminder: ${task.reminder || 0} min | 📝 ${task.note || 'No notes'}
        </div>
      </div>
      <div class="task-buttons">
        ${task.status === 'Pending' ? '<button class="completeBtn">✅ Complete</button>' : ''}
        <button class="deleteBtn">🗑️ Delete</button>
      </div>
    </li>
  `);

  li.find('.completeBtn').click(function() {
    task.status = 'Completed';
    saveTaskUpdate(task);
    loadTasks();
  });

  li.find('.deleteBtn').click(function() {
    if(confirm('Are you sure to delete this task?')) {
      deleteTask(task);
      loadTasks();
    }
  });

  $('#tasksContainer').append(li);
}

  function saveTaskUpdate(updatedTask) {
    let currentUser = localStorage.getItem('currentUser');
    let tasks = JSON.parse(localStorage.getItem(currentUser + '_tasks') || '[]');
    tasks = tasks.map(t => t.name === updatedTask.name && t.start === updatedTask.start ? updatedTask : t);
    localStorage.setItem(currentUser + '_tasks', JSON.stringify(tasks));
  }

  function deleteTask(taskToDelete) {
    let currentUser = localStorage.getItem('currentUser');
    let tasks = JSON.parse(localStorage.getItem(currentUser + '_tasks') || '[]');
    tasks = tasks.filter(t => !(t.name === taskToDelete.name && t.start === taskToDelete.start));
    localStorage.setItem(currentUser + '_tasks', JSON.stringify(tasks));
  }

  function clearTaskForm() {
    $('#taskName').val('');
    $('#taskDate').val('');
    $('#startTime').val('');
    $('#endTime').val('');
    $('#taskNote').val('');
    $('#reminderTime').val('');
  }

  // ===================== Expiry Check =====================
  function checkTaskExpiry(task) {
    const now = new Date();
    const taskEnd = new Date(`${task.date}T${task.end}`);
    if(task.status !== 'Completed' && now > taskEnd) {
      task.status = 'Expired';
    }
    return task;
  }

  // ===================== Notification API =====================
  let reminderInterval;

  function requestNotificationPermission() {
    if("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }

  function startReminderCheck() {
    reminderInterval = setInterval(() => {
      let currentUser = localStorage.getItem('currentUser');
      let tasks = JSON.parse(localStorage.getItem(currentUser + '_tasks') || '[]');

      const now = new Date();

      tasks.forEach(task => {
        if(task.status === 'Pending' && task.reminder > 0) {
          const taskTime = new Date(`${task.date}T${task.start}`);
          const reminderTime = new Date(taskTime.getTime() - task.reminder*60000);

          if(now >= reminderTime && now < taskTime) {
            showNotification(task);
            task.reminder = 0; // prevent multiple notifications
            saveTaskUpdate(task);
          }
        }
      });
    }, 60000); // every minute
  }

  function stopReminderCheck() {
    clearInterval(reminderInterval);
  }

  function showNotification(task) {
    if(Notification.permission === 'granted') {
      new Notification(`Task Reminder`, {
        body: `Your task "${task.name}" starts at ${task.start}!`,
        icon: ''
      });
    }
  }

});
