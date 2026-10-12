

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim().toLowerCase();
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const message = document.getElementById("signupMessage");

        // Check passwords
        if (password !== confirmPassword) {
            message.innerText = "Passwords do not match!";
            message.style.color = "red";
            return;
        }

        // Get existing users
        let users = JSON.parse(localStorage.getItem("users")) || [];

        // Check if email already exists
        const existingUser = users.find(function(user) {
            return user.email === email;
        });

        if (existingUser) {
            message.innerText = "Email already registered!";
            message.style.color = "red";
            return;
        }

        // Create user
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password
        };

        // Add user
        users.push(newUser);

        // Save users
        localStorage.setItem("users", JSON.stringify(users));

        message.innerText = "Account created successfully!";
        message.style.color = "green";

        // Clear form
        signupForm.reset();

        // Go to login
        setTimeout(function() {
            window.location.href = "index.html";
        }, 1000);
    });
}


// ===============================
// LOGIN
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(e) {

        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        const message = document.getElementById("loginMessage");

        // Get users
        const users = JSON.parse(localStorage.getItem("users")) || [];

        // Find user
        const user = users.find(function(user) {
            return user.email === email &&
                   user.password === password;
        });

        // User not found
        if (!user) {
            message.innerText = "Invalid email or password!";
            message.style.color = "red";
            return;
        }

        // Save logged-in user
        localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );

        message.innerText = "Login successful!";
        message.style.color = "green";

        // Open dashboard
        setTimeout(function() {
            window.location.href = "dashboard.html";
        }, 500);

    });
}


// ===============================
// DASHBOARD
// ===============================

if (window.location.pathname.includes("dashboard.html")) {

    const currentUser =
        JSON.parse(localStorage.getItem("currentUser"));

    // If not logged in
    if (!currentUser) {

        window.location.href = "index.html";

    } else {

        const welcomeUser =
            document.getElementById("welcomeUser");

        if (welcomeUser) {
            welcomeUser.innerText =
                "Welcome, " + currentUser.name;
        }

        loadTransactions();
    }
}


// ===============================
// ADD TRANSACTION
// ===============================

const transactionForm =
    document.getElementById("transactionForm");

if (transactionForm) {

    transactionForm.addEventListener("submit", function(e) {

        e.preventDefault();

        const currentUser =
            JSON.parse(localStorage.getItem("currentUser"));

        if (!currentUser) {
            window.location.href = "index.html";
            return;
        }

        const type =
            document.getElementById("transactionType").value;

        const title =
            document.getElementById("transactionTitle").value.trim();

        const amount =
            Number(
                document.getElementById("transactionAmount").value
            );

        if (title === "" || amount <= 0) {
            alert("Please enter valid information.");
            return;
        }

        let transactions =
            JSON.parse(
                localStorage.getItem("transactions")
            ) || [];

        const transaction = {
            id: Date.now(),
            userId: currentUser.id,
            type: type,
            title: title,
            amount: amount
        };

        transactions.push(transaction);

        localStorage.setItem(
            "transactions",
            JSON.stringify(transactions)
        );

        transactionForm.reset();

        loadTransactions();

    });
}


// ===============================
// LOAD TRANSACTIONS
// ===============================

function loadTransactions() {

    const currentUser =
        JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        return;
    }

    const allTransactions =
        JSON.parse(
            localStorage.getItem("transactions")
        ) || [];

    const transactions =
        allTransactions.filter(function(transaction) {
            return transaction.userId === currentUser.id;
        });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }

    });

    const balance = totalIncome - totalExpense;

    document.getElementById("totalIncome").innerText =
        formatMoney(totalIncome);

    document.getElementById("totalExpense").innerText =
        formatMoney(totalExpense);

    document.getElementById("balance").innerText =
        formatMoney(balance);

    displayTransactions(transactions);
}


// ===============================
// DISPLAY TRANSACTIONS
// ===============================

function displayTransactions(transactions) {

    const list =
        document.getElementById("transactionList");

    if (!list) {
        return;
    }

    if (transactions.length === 0) {

        list.innerHTML =
            '<p class="empty">No transactions yet.</p>';

        return;
    }

    const reversed =
        [...transactions].reverse();

    list.innerHTML =
        reversed.map(function(transaction) {

            const isIncome =
                transaction.type === "income";

            return `
                <div class="transaction">

                    <div>
                        <div class="transaction-title">
                            ${transaction.title}
                        </div>

                        <div class="transaction-type">
                            ${isIncome ? "Income" : "Expense"}
                        </div>
                    </div>

                    <div class="${isIncome ? "green" : "red"}">
                        ${isIncome ? "+" : "-"}
                        ${formatMoney(transaction.amount)}
                    </div>

                    <button
                        class="delete-button"
                        onclick="deleteTransaction(${transaction.id})">
                        Delete
                    </button>

                </div>
            `;

        }).join("");
}


// ===============================
// DELETE TRANSACTION
// ===============================

function deleteTransaction(id) {

    let transactions =
        JSON.parse(
            localStorage.getItem("transactions")
        ) || [];

    transactions =
        transactions.filter(function(transaction) {
            return transaction.id !== id;
        });

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    loadTransactions();
}


// ===============================
// LOGOUT
// ===============================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", function() {

        localStorage.removeItem("currentUser");

        window.location.href = "index.html";

    });
}


// ===============================
// MONEY FORMAT
// ===============================

function formatMoney(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(amount);

}
