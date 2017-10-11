var Promise = require('bluebird');
var Mustache = require('mustache')
var Chance = require('chance');
var chance = new Chance();
var fs = require('fs');
var template = fs.readFileSync(__dirname + '/project-template.json').toString();
var words = require(__dirname + '/words.json');
var NUM = 5;
var INIT_AUTOINC_PROJ = 4000;
var projectAutoIdx = INIT_AUTOINC_PROJ;

Mustache.parse(template);

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

function getTemplateData() {
  return {
    id: ++projectAutoIdx,
    project: randomizeProject(),
    user: randomizeUser(),
    domain: 'http://192.168.1.67:3000'
  };
}

function getPopulatedTemplate() {
  var json = Mustache.render(template, getTemplateData());
  return JSON.parse(json);
}

// console.log(words, getPopulatedTemplate());
module.exports = function(db) {
  projectAutoIdx = INIT_AUTOINC_PROJ;

  var projects = db.collection('projects');

  function insertAsync(data) {
    return new Promise((resolve, reject) => {
      projects.insertOne(data, function(err, r) {
       if (err) return reject(err);
       resolve(r);
      });
    });
  }

  var seeds = [];
  for(i = 0 ; i < NUM ; i++) {
    seeds.push(getPopulatedTemplate());
  }

  projects.remove();
  return Promise.reduce(seeds, (carry, seed) => {
    return insertAsync(seed)
    .then(item => {
      return carry.concat(item);
    });
  }, [])
  .then(fakeProjects => {
    // console.log(fakeProjects.map((proj, i) => {
    //   return seeds[i].id + ' ' + seeds[i].name_with_namespace;
    // }));
  })

  // insertAsync(getTemplateData());

  // function 


};