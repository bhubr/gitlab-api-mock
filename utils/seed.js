var Promise = require('bluebird');
var Mustache = require('mustache')
var Chance = require('chance');
var chance = new Chance();
var fs = require('fs');

var issueTemplate = fs.readFileSync(__dirname + '/issue-template.json').toString();
var projectTemplate = fs.readFileSync(__dirname + '/project-template.json').toString();
var words = require(__dirname + '/words.json');
var NUM_PROJECTS = 5;
var NUM_ISSUES_PER_PROJ = 6;
var INIT_AUTOINC_PROJ = 4000;
var INIT_AUTOINC_ISSUE = 13000;
var SEED_FILE = 'seed.json';
var projectAutoIdx = INIT_AUTOINC_PROJ;
var issueAutoIdx = INIT_AUTOINC_ISSUE;
var issueSeedIid = 0;
var seed;

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
    iid: ++issueSeedIid,
    title: chance.pick(words.verbs) + ' ' + chance.pick(words.adjectives) + ' ' + chance.pick(words.monsters)
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
  var json = Mustache.render(issueTemplate, getIssueData(project));
  return JSON.parse(json);
}

function getProjectSeeds() {
  var projectSeeds = [];
  for(i = 0 ; i < NUM_PROJECTS ; i++) {
    projectSeeds.push(getPopulatedProjectTemplate());
  }
  return projectSeeds;
}

function getIssueSeeds(projSeed) {
  var issueSeeds = [];
  issueSeedIid = 0;
  for(i = 0 ; i < NUM_ISSUES_PER_PROJ ; i++) {
    issueSeeds.push(getPopulatedIssueTemplate(projSeed));
  }
  return issueSeeds;
}

function generateSeedFile() {
  seed = {
    projects: getProjectSeeds(),
    issues: []
  };
  seed.projects.forEach( proj => {
    seed.issues = seed.issues.concat( getIssueSeeds( proj ) )
  } );
  fs.writeFileSync( SEED_FILE, JSON.stringify( seed ) );
}

if( ! fs.existsSync( SEED_FILE ) ) {
  generateSeedFile();
}
else {
  seed = JSON.parse(
    fs.readFileSync( SEED_FILE ).toString()
  );
}


// console.log(words, getPopulatedProjectTemplate());
module.exports = function reset(db) {
  // projectAutoIdx = INIT_AUTOINC_PROJ;
  // issueAutoIdx = INIT_AUTOINC_ISSUE;

  var projects = db.collection('projects');
  var issues = db.collection('issues');
  projects.remove();
  issues.remove();
  console.log('removed all');

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

  return Promise.reduce(
    seed.projects,
    (carry, projSeed) => insertProjectAsync(projSeed),
    []
  )
  .then(() => Promise.reduce(
    seed.issues,
    (carry, issueSeed) => insertIssueAsync(issueSeed),
    []
  ))

};