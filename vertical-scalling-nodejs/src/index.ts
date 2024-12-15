import express from "express";
import cluster from "cluster";
import os from "os";

// getting total cpus that we can use.
const totalCPUs = 4 ;//os.cpus().length;

const port = 3000;

if (cluster.isPrimary) {
  console.log(`Number of CPU's is ${totalCPUs}`);
  console.log(`Primary process id is ${process.pid}`);

  // Forking workers:
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  // Fork another cluster if a worker dies
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
  const app = express();
  app.use(express.json());
  console.log(`Worker with process id: ${process.pid} started.`);

  app.get(`/`, (req, res) => {
    res.json({ message: "Hello!" });
    return;
  });

  app.get(`/api/:num`, (req, res) => {
    let num = parseInt(req.params.num);
    let count = 0;

    if (num > 100000) num = 100000;

    for (let i = 1; i <= num; i++) {
      count += i;
    }

    res.send(`Final count is ${count}, counted on process -> ${process.pid}`);
    return;
  });

  app.listen(port, () => {
    console.log(`Server started at port: ${port}`);
  });
}
