'use strict';

var ProjectHandler = require(process.cwd() + '/app/controllers/projectHandler.server.js');
var seed = require('../../utils/seed');

module.exports = function (app, db) {
  var projectHandler = new ProjectHandler(db);

  app.route('/')
      .get(function (req, res) {
         res.sendFile(process.cwd() + '/public/index.html');
      });

  app.post('/reset', function(req, res) {
      console.log('RESET HIT');
      seed(db)
      .then(projects => res.json(projects));
  })


  app.route('/api/v4/projects')
      .get(projectHandler.getProjects)
      .post(projectHandler.addProject)
      .delete(projectHandler.resetProjects);

  app.route('/api/v4/projects/:id')
      .get(projectHandler.getProject)
      .put(projectHandler.updateProject)
      .delete(projectHandler.deleteProject);

};
