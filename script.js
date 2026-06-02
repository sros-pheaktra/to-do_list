window.onload = () => {
    const taskListContainer = document.getElementById("task-container")
    const tasks = JSON.parse(localStorage.getItem("tasks")) || []
    const form = document.getElementById("form")
    let taskId = tasks.length
        ? Math.max(...tasks.map(task => task.id)) + 1
        : 1

    updateUI()

    form.addEventListener("submit", (e) =>{
        e.preventDefault();
        const taskName = form.elements["inputName"].value
        createTask(taskName)

        form.reset()
        })

    taskListContainer.addEventListener('click', (e) =>{
        const li = e.target.closest("li")

        const id = Number(li.dataset.id)
        if(e.target.classList.contains("completeBtn")){
            const task = tasks.find(t => t.id === id)
            task.complete = !task.complete
        }
        if(e.target.classList.contains("deleteBtn")){
            const index = tasks.findIndex(t => t.id === id)
            tasks.splice(index, 1)
        }

        saveTask()
        updateUI()
        })
    function createTask(taskName){
        if (!taskName) return
        let task = {
            id: taskId++,
            name: taskName,
            complete: false,
            date: Date.now(),
        }
        console.log(taskId)
        tasks.push(task);
        saveTask()
        updateUI()
    }
    function saveTask(){
        localStorage.setItem('tasks', JSON.stringify(tasks))
    }
    function updateUI(){
        taskListContainer.innerHTML = tasks.map(task => 
            `
            <li data-id="${task.id}">
                <p style="text-decoration: ${task.complete ? "line-through" : "none"}">
                    ${task.name}
                </p>
                <button class="completeBtn">Complete</button>
                <button class="deleteBtn">Delete</button>
            </li>`).join("");
    }
}
