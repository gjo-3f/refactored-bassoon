const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const fs = require("fs");
const path = require("path");
const pathToFile = path.resolve("./data.json");

const getResources = () => JSON.parse(fs.readFileSync(pathToFile));

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World");
});

// GET ALL RESOURCES
app.get("/api/resources", (req, res) => {
  const resources = getResources();
  res.send(resources);
});

// GET ACTIVE RESOURCE
app.get("/api/activeresource", (req, res) => {
  const resources = getResources();
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );
  res.send(activeResource);
});

// GET ONE RESOURCE BY ID
app.get("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const resource = resources.find((resource) => resource.id === id);
  res.send(resource);
});

// UPDATE RESOURCE
app.patch("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const index = resources.findIndex((resource) => resource.id === id);
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );

  resources[index] = req.body;

  if (resources[index].status === "complete") {
    return res.status(422).send("resource is complete and cannot be changed.");
  }

  if (req.body.status === "active") {
    if (activeResource) {
      return res.status(422).send("already an active resource");
    }
    resources[index].status = "active";
    resources[index].activationTime = new Date();
  }

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file!");
    }

    return res.send("Data has been updated!");
  });
});

// POST NEW RESOURCE
app.post("/api/resources", (req, res) => {
  const resources = getResources();
  const resource = req.body;
  resource.createdAt = new Date();
  resource.status = "inactive";
  resource.id = Date.now().toString();
  resources.unshift(resource);
  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file!");
    }
    return res.send("Data has been saved!");
  });
});

app.listen(PORT, () => {
  console.log("Server is listening on port:" + PORT);
});
