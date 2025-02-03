# 📊 Stock Trading Web Portal

This project is a **Stock Trading Web Portal** where users can perform Buy and Sell operations with stocks using **FIFO (First-In-First-Out)** and **LIFO (Last-In-First-Out)** methods.  
The backend is powered by **Node.js** with **MongoDB**, and the frontend provides a demo interface to interact with the trading system.  

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

Use the following command to clone the repository to your local machine:

```bash
git clone https://github.com/alan-awadhiya007/trading_portal.git
```

### 2️⃣ Install Dependencies

Navigate to the project folder and install all required Node.js dependencies:

```bash
cd stock-trading-web-portal
npm install
```

---

### 3️⃣ Set Up Environment Variables

Create a `.env` file in the root directory and add your environment variables:

```env
DATABASE="mongodb://localhost:27017/stock_trading"
MS_TRADE_PORTAL_HOST=0.0.0.0
MS_TRADE_PORTAL_PORT=9000
```

- **DATABASE:** MongoDB connection string  
- **MS_TRADE_PORTAL_PORT:** Port number for running the server  

---

### 4️⃣ Start the Node.js Application

Run the application using the following command:

```bash
npm start
```

This will start the Node.js server on `http://localhost:9000` (or the port defined in `.env`).

---

### 5️⃣ View the Demo

After starting the server:  

1. Navigate to the `view` folder.  
2. Open the `demo.html` file directly in your browser.  

This file demonstrates the Buy/Sell trade functionality with **FIFO** and **LIFO** sell types.

---

## 📂 Project Structure

```
stock-trading-web-portal/
├── configs/          # Configuration files
├── controllers/      # API controllers
├── models/           # Database models (Mongoose schemas)
├── routes/           # API routes
├── services/         # Business logic and external services
├── utils/            # Helper utilities
├── view/             # Frontend demo (demo.html)
├── .env              # Environment variables
├── .gitignore        # Git ignore rules
├── README.md         # Project documentation
├── app.js            # Entry point of the application
├── package.json      # Project metadata and dependencies
└── package-lock.json # Dependency lock file
```

---

## 📝 Features

- ✅ **Buy/Sell Trade Functionality**  
- 🔄 **FIFO & LIFO Selling Methods**  
- ⚡ **RESTful APIs with Node.js & MongoDB**  
- 💻 **Frontend Demo in HTML (demo.html)**  

---

## 📸 Screenshots

### 1️⃣ Cloning the Repository

![Clone Repository](./screenshots/clone-command.png)

---

### 2️⃣ Installing Dependencies

![NPM Install](./screenshots/npm-install.png)

---

### 3️⃣ Running the Application & Demo

![Run Application](./screenshots/run-app.png)

---

## 💡 Usage Summary

```bash
# Clone the repository
git clone https://github.com/alan-awadhiya007/trading_portal.git

# Navigate to the project directory
cd stock-trading-web-portal

# Install dependencies
npm install

# Set up environment variables in .env file
DATABASE="mongodb://localhost:27017/stock_trading"
MS_TRADE_PORTAL_HOST=0.0.0.0
MS_TRADE_PORTAL_PORT=9000

# Start the Node.js server
npm start

# Open demo.html from the view folder to interact with the trading system
```

---

## 👨‍💻 Contributing

1. Fork the repository  
2. Create your feature branch (`git checkout -b feature/new-feature`)  
3. Commit your changes (`git commit -m 'Add new feature'`)  
4. Push to the branch (`git push origin feature/new-feature`)  
5. Open a Pull Request  

---

## 📬 Contact

For any questions or suggestions, feel free to reach out!

---

⚡ **Happy Trading! 🚀**
```

### 🔑 Key Points:
- Add your actual GitHub repository URL in the `git clone` command.  
- Place the screenshots (`clone-command.png`, `npm-install.png`, `run-app.png`) inside the `screenshots` folder.  
- Update environment variable values in `.env` as per your local setup.  

Let me know if you need further adjustments! 🚀
