var Promise = require('bluebird');
var Mustache = require('mustache')
var Chance = require('chance');
var chance = new Chance();
var fs = require('fs');

var issueTemplate = fs.readFileSync(__dirname + '/issue-template.json').toString();
var projectTemplate = fs.readFileSync(__dirname + '/project-template.json').toString();
var words = require(__dirname + '/words.json');
var NUM = 5;
var INIT_AUTOINC_PROJ = 4000;
var projectAutoIdx = INIT_AUTOINC_PROJ;
var INIT_AUTOINC_ISSUE = 100000;
var issueAutoIdx = INIT_AUTOINC_PROJ;
var issueSeedIid = 0;

Mustache.parse(projectTemplate);

function randomizeProject() {
  var name = chance.pick(words.adjectives) + ' ' + chance.pick(words.monsters);
  var slug = name.toLowerCase().replace(/ /g, '-');
  return { name, slug };
}

function randomizeUser() {
  var name = chance.name();
  var username = name.toLowerCase().replace(/ /g, '');
  return {
    id: chance.fbid(),
    name,
    username
  };
}

function randomizeIssue() {
  return {
    id: ++issueAutoIdx,
    iid: ++issueSeedIid
  }
}

function getIssueData(project) {
  return {
    domain: 'http://192.168.1.67:3000',
    project,
    issue: randomizeIssue()
  }
}

function getProjectData() {
  return {
    id: ++projectAutoIdx,
    project: randomizeProject(),
    user: randomizeUser(),
    domain: 'http://192.168.1.67:3000'
  };
}

function getPopulatedProjectTemplate() {
  var json = Mustache.render(projectTemplate, getProjectData());
  return JSON.parse(json);
}

function getPopulatedIssueTemplate(project) {
  console.log(project);
  var json = Mustache.render(issueTemplate, getIssueData(project));
  console.log(json);
  return JSON.parse(json);
}

function getProjectSeeds() {
  var projectSeeds = [];
  for(i = 0 ; i < NUM ; i++) {
    projectSeeds.push(getPopulatedProjectTemplate());
  }
  return projectSeeds;
}

function getIssueSeeds(projSeed) {
  var issueSeeds = [];
  issueSeedIid = 0;
  for(i = 0 ; i < NUM ; i++) {
    issueSeeds.push(getPopulatedIssueTemplate(projSeed));
  }
  return issueSeeds;
}

// console.log(words, getPopulatedProjectTemplate());
module.exports = function(db) {
  projectAutoIdx = INIT_AUTOINC_PROJ;
  issueAutoIdx = INIT_AUTOINC_ISSUE;

  var projects = db.collection('projects');
  var issues = db.collection('issues');

  function insertProjectAsync(data) {
    return new Promise((resolve, reject) => {
      projects.insertOne(data, function(err, r) {
       if (err) return reject(err);
       resolve(r);
      });
    });
  }

  function insertIssueAsync(data) {
    return new Promise((resolve, reject) => {
      issues.insertOne(data, function(err, r) {
       if (err) return reject(err);
       resolve(r);
      });
    });
  }

  projects.remove();
  issues.remove();
  return Promise.reduce(
    getProjectSeeds(),
    (carry, projSeed) =>
      insertProjectAsync(projSeed)
      .then(project => Promise.reduce(
        getIssueSeeds(projSeed), 
        (carry, issueSeed) => insertIssueAsync(issueSeed), []
      )
    ), []
  )
  .then(fakeProjects => {
    // console.log(fakeProjects.map((proj, i) => {
    //   return seeds[i].id + ' ' + seeds[i].name_with_namespace;
    // }));
  })

};