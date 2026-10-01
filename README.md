# 🔍 AlgoLens

### Visualize. Understand. Master Algorithms.

**AlgoLens** is an interactive algorithm visualization platform designed to make complex algorithms easier to understand through step-by-step animations, visual representations, and algorithmic explanations.

Instead of simply showing the final output, AlgoLens lets users **see how an algorithm thinks and operates at every step**.

🌐 **Live Demo:** https://algolens-smoky.vercel.app/learn

---

## ✨ Features

* 🎯 **Step-by-step algorithm visualization**
* ▶️ Play, pause, resume and reset animations
* ⏮️ Move through algorithm steps manually
* 🎚️ Adjustable visualization speed
* 📊 Visual representation of array operations
* 🌳 Interactive tree visualizations
* 🔎 Visual searching algorithms
* 🔀 Visual sorting algorithms
* 📚 Algorithm explanations and complexity analysis
* 💡 Beginner-friendly learning interface
* 📱 Responsive UI
* ⚡ Fast and interactive frontend

---

## 🧠 Algorithms Covered

### 🔀 Sorting Algorithms

| Algorithm   |        Best |    Average | Worst |    Space |
| ----------- | ----------: | ---------: | ----: | -------: |
| Quick Sort  |  O(n log n) | O(n log n) | O(n²) | O(log n) |
| Radix Sort  |       O(nk) |      O(nk) | O(nk) |   O(n+k) |
| Bucket Sort |      O(n+k) |     O(n+k) | O(n²) |   O(n+k) |
| Shell Sort  | O(n log n)* |      O(n²) | O(n²) |     O(1) |

> *Shell Sort complexity depends on the chosen gap sequence.

### 🔎 Searching Algorithms

* Linear Search
* Binary Search
* Interpolation Search

### 🌳 Tree Data Structures

* Binary Tree
* Binary Search Tree
* Tree traversal visualization
* Node insertion and relationships

---

## 🎨 How Visualization Works

AlgoLens does not simply animate the final result.

Each algorithm is divided into a sequence of **algorithmic states**.

For example, during Quick Sort:

```text
Input
  ↓
Select Pivot
  ↓
Compare Elements
  ↓
Move Smaller Elements
  ↓
Partition Array
  ↓
Recursively Sort Partitions
  ↓
Sorted Array
```

Each state is represented visually so that the user can understand **what is happening and why it is happening**.

---

## 🧩 Example: Quick Sort Visualization

Given:

```text
[8, 3, 5, 1, 9, 2]
```

AlgoLens can visualize:

```text
Choose Pivot
       ↓
[8, 3, 5, 1, 9, 2]
             ↑
           Pivot

Compare elements
       ↓

[3, 5, 1, 2] [8] [9]

Continue recursively
       ↓

[1, 2, 3, 5, 8, 9]
```

The visualization helps users understand:

* Pivot selection
* Comparisons
* Swapping
* Partitioning
* Recursive sub-problems
* Final sorted state

---

## 🏗️ Project Architecture

```text
                    ┌───────────────────┐
                    │      AlgoLens      │
                    │    Web Interface   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Algorithm Engine  │
                    └─────────┬─────────┘
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
        Sorting           Searching           Trees
             │                │                │
             ▼                ▼                ▼
        Step States       Step States       Step States
             │                │                │
             └────────────────┼────────────────┘
                              ▼
                    ┌───────────────────┐
                    │ Visualization UI  │
                    └───────────────────┘
```

---

## ⚙️ Core Visualization Concept

The key idea behind AlgoLens is separating the **algorithm logic** from the **visualization layer**.

Instead of directly modifying the UI during execution, algorithms generate a sequence of states.

Example:

```javascript
[
  {
    array: [8, 3, 5, 1],
    comparing: [0, 1],
    action: "compare"
  },
  {
    array: [3, 8, 5, 1],
    comparing: [0, 1],
    action: "swap"
  }
]
```

The visualization engine then renders these states one by one.

This makes it possible to:

* Pause execution
* Move forward/backward
* Change animation speed
* Replay algorithms
* Explain individual operations

---

## 🛠️ Tech Stack

### Frontend

* React
* Next.js
* TypeScript
* Tailwind CSS

### Visualization

* CSS animations
* React state management
* Dynamic data visualization
* Interactive components

### Deployment

* Vercel

---

## 📂 Project Structure

```text
algolens/
│
├── app/
│   ├── learn/
│   ├── algorithms/
│   └── ...
│
├── components/
│   ├── visualizer/
│   ├── algorithms/
│   ├── trees/
│   └── ui/
│
├── lib/
│   ├── algorithms/
│   ├── visualization/
│   └── utilities/
│
├── public/
│
├── package.json
├── tsconfig.json
└── README.md
```

> The exact structure may vary depending on the current implementation.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

### 2. Navigate to the project

```bash
cd algolens
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Open in your browser

```text
http://localhost:3000
```

---

## 🎮 How to Use

1. Open **AlgoLens**
2. Navigate to the **Learn** section
3. Select an algorithm
4. Enter or generate input
5. Start the visualization
6. Use the controls to:

   * ▶️ Play
   * ⏸️ Pause
   * ⏭️ Next Step
   * ⏮️ Previous Step
   * 🔄 Reset
   * 🎚️ Adjust Speed
7. Observe the algorithm's operations visually
8. Review its time and space complexity

---

## 📈 Educational Goals

AlgoLens is designed to help students understand algorithms beyond memorizing code.

### Traditional Learning

```text
Algorithm
   ↓
Code
   ↓
Output
```

### AlgoLens

```text
Algorithm
   ↓
Concept
   ↓
Step
   ↓
Operation
   ↓
Visualization
   ↓
Code
   ↓
Complexity
```

This makes it particularly useful for learning:

* Data Structures
* Algorithms
* Advanced Data Structures
* Searching
* Sorting
* Tree operations
* Algorithm complexity

---

## 🧪 Future Improvements

Planned improvements include:

* [ ] More sorting algorithms
* [ ] More searching algorithms
* [ ] Graph algorithms
* [ ] BFS visualization
* [ ] DFS visualization
* [ ] Dijkstra's algorithm
* [ ] Prim's algorithm
* [ ] Kruskal's algorithm
* [ ] AVL Tree visualization
* [ ] Red-Black Tree visualization
* [ ] Heap visualization
* [ ] Hash Table visualization
* [ ] Algorithm code synchronization
* [ ] Custom input generation
* [ ] Interactive quizzes
* [ ] Progress tracking
* [ ] Algorithm comparison mode
* [ ] Performance benchmarking

---

## 🎓 Academic Use

AlgoLens can be used as a **Project-Based Learning (PBL)** project for an Advanced Data Structures course.

It demonstrates practical understanding of:

* Algorithm implementation
* Data structures
* Complexity analysis
* Recursion
* Searching and sorting
* Tree structures
* State management
* Interactive visualization
* Web application development

---

## 🌟 Why AlgoLens?

Most algorithm resources answer:

> **"What is the algorithm?"**

AlgoLens focuses on:

> **"What is the algorithm doing at this exact moment?"**

By converting algorithmic operations into visual states, AlgoLens attempts to bridge the gap between **theoretical understanding and practical intuition**.

---

## 📸 Screenshots

Add screenshots of the application here:

```text
/docs/screenshots/
├── home.png
├── quick-sort.png
├── radix-sort.png
├── interpolation-search.png
└── tree.png
```

Example:

```markdown
![Quick Sort Visualization](./docs/screenshots/quick-sort.png)
```

---

## 🤝 Contributing

Contributions are welcome.

```bash
# Fork the repository

# Create a feature branch
git checkout -b feature/new-algorithm

# Commit your changes
git commit -m "Add new algorithm visualization"

# Push the branch
git push origin feature/new-algorithm
```

Then open a Pull Request.

---

## 📄 License

This project is intended for educational and learning purposes.

---

## 👨‍💻 Author

**Viven G**

CS Student | Full-Stack Developer | DSA Learner

🔗 **Live Project:** https://algolens-smoky.vercel.app/learn

---

### ⭐ If AlgoLens helped you understand algorithms, consider starring the repository!
