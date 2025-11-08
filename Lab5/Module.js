const module = {
  id: 1,
  name: "Module 1",
  description: "Create a NodeJS server with ExpressJS",
  course: "CS5610",
};
export default function WorkingWithObjects(app) {
  const getModule = (req, res) => {
    res.json(module);
  };
  const getModuleName = (req, res) => {
    res.json(module.name);
  };

  const setModuleName = (req, res) => {
    const { newName } = req.params;
    module.name = newName;
    res.json(module);
  };
  const setModuleDescription = (req, res) => {
    const { newDescription } = req.params;
    module.description = newDescription;
    res.json(module);
  };
  app.get("/lab5/module/name/:newName", setModuleName);
  app.get("/lab5/module", getModule);
  app.get("/lab5/module/name", getModuleName);
  app.get("/lab5/module/description/:newDescription", setModuleDescription);
};
