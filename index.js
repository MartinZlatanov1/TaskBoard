const form = document.querySelector("form");
const todoContainer = document.querySelector("#todo-container");
const inProgressContainer = document.querySelector("#in-progress-container");
const doneContainer = document.querySelector("#done-container");
const moveToInProgressBtn = document.querySelector("#move-in-progress");
const moveToDoneBtn = document.querySelector("#move-done");

// Create a new task card
const createTaskCard = (title, description) => {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");

    const titleEl = document.createElement("h3");
    titleEl.innerText = title;

    const descEl = document.createElement("p");
    descEl.innerText = description;

    taskCard.appendChild(titleEl);
    taskCard.appendChild(descEl);
    taskCard.classList.add("card")

    taskCard.addEventListener("click", (e) => {
        e.currentTarget.classList.toggle("selected");
    });

    return taskCard;
}

// Send a request to the server
const sendRequest = (url, method, body, onSuccess) => {
    fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Could not complete request");
            }
            return res.json();
        })
        .then(onSuccess)
        .catch((err) => console.error(err));
};

// Handle form submission
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const title = formData.get("title");
    const description = formData.get("description");

    const requestBody = { title, description, completed: false, isInProgress: false };
    sendRequest("http://localhost:3000/tasks", "POST", requestBody, (data) => {
        const { id } = data;
        const taskCard = createTaskCard(title, description);
        taskCard.dataset.id = id;
        todoContainer.appendChild(taskCard);
    });

    e.target.reset();
});

// Handle moving tasks to in-progress column
moveToInProgressBtn.addEventListener("click", () => {
    const selectedCards = todoContainer.querySelectorAll(".selected");
    selectedCards.forEach((card) => {
        const { id } = card.dataset;
        const [titleEl, descEl] = card.children;
        const title = titleEl.innerText;
        const description = descEl.innerText;
        const requestBody = { title, description, completed: false, inProgress: true };

        sendRequest(`http://localhost:3000/tasks/${id}`, "PUT", requestBody, (_) => {
            todoContainer.removeChild(card);
            inProgressContainer.appendChild(card);
            card.classList.remove("selected");
        });
    });
});

// Handle moving tasks to done column
moveToDoneBtn.addEventListener("click", () => {
    const selectedCards = inProgressContainer.querySelectorAll(".selected");
    selectedCards.forEach((card) => {
        const { id } = card.dataset;
        const [titleEl, descEl] = card.children;
        const title = titleEl.innerText;
        const description = descEl.innerText;
        const requestBody = { title, description, completed: true, inProgress: false };

        sendRequest(`http://localhost:3000/tasks/${id}`, "PUT", requestBody, (_) => {
            inProgressContainer.removeChild(card);
            doneContainer.appendChild(card);
            card.classList.remove("selected");
        });
    });
});

// Load tasks from server on page load
fetch("http://localhost:3000/tasks")
    .then((res) => res.json())
    .then((tasks) => {
        tasks.forEach((task) => {
            const { id, title, description, completed, isInProgress } = task;
            const taskCard = createTaskCard(title, description);
            taskCard.dataset.id = id;

            if (completed) {
                doneContainer.appendChild(taskCard);
            } else if (isInProgress) {
                inProgressContainer.appendChild(taskCard);
            } else {
                todoContainer.appendChild(taskCard);
            }
        });
    });
