'use strict';

var ProjectHandler = require(process.cwd() + '/app/controllers/projectHandler.server.js');
var IssueHandler = require(process.cwd() + '/app/controllers/issueHandler.server.js');
var seed = require('../../utils/seed');

module.exports = function (app, db) {
  var projectHandler = new ProjectHandler(db);
  var issueHandler = new IssueHandler(db);

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

  app.route('/api/v4/projects/:id/issues')
      .get(issueHandler.getProjectIssues);

  app.route('/api/v4/projects/:id/issues/:iid')
      .get(issueHandler.getProjectIssue)
      .put(issueHandler.updateProjectIssue);

  app.route('/api/v4/issues')
      .get(issueHandler.getAllIssues);

  // app.route('/api/v4/issues/:id')
  //     .get(issueHandler.getIssue)
  //     .put(issueHandler.updateIssue)
  //     .delete(issueHandler.deleteIssue);

};
