'use strict';

function dumpItem(item) {
   console.log( item.id + '. ' + item.name_with_namespace + '\n' );
}
function dumpItems(label, items) {
   console.log('#### ' + label + ' ####\n');
   items.forEach(dumpItem);
}

function projectHandler (db) {
   var projects = db.collection('projects');

   this.getProjects = function (req, res) {

      var projectProjection = { '_id': false };

      projects.find({}).toArray(function (err, records) {
         if (err) {
            throw err;
         }

         if (records) {
            records.forEach((record, idx) => {
               delete records[idx]._id;
            });
            dumpItems('getProjects', records);
            // res.set("Access-Control-Allow-Origin", "*");
            res.json(records);
         }
      });
   };

   this.addProject = function (req, res) {
      projects.findAndModify({}, { '_id': 1 }, { $inc: { 'projects': 1 }}, function (err, result) {
         if (err) {
            throw err;
         }

         res.json(result);
      });
   };

   this.resetProjects = function (req, res) {
      projects.update({}, { 'projects': 0 }, function (err, result) {
         if (err) {
            throw err;
         }
         res.json(result);
      });
   };


   // GET
   this.getProject = function (req, res) {
      projects.findOne({ id: parseInt(req.params.id) }, function (err, result) {
         if (err) {
            console.error('getProject err', err);
            throw err;
         }
         if( ! result) {
            return res.status(404).json({ error: 'not found' });
         }
         res.json(result);
      });
   };

   this.updateProject = function (req, res) {
      console.log('update query', { id: req.params.id })
      projects.findAndModify({ id: parseInt(req.params.id) }, {}, { $set: req.body }, { 'new': true }, function (err, result) {
         if (err) {
            console.error('updateProject err', err);
            throw err;
         }
         if(! result.value) {
            return res.status(404).json({ error: 'not found' });
         }
         var updatedProject = result.value;
         delete updatedProject._id;
         // res.set("Access-Control-Allow-Origin", "*");
         res.json(updatedProject);
      });
   };

   this.deleteProject = function (req, res) {
      projects.deleteOne({ id: parseInt(req.params.id) }, function (err, result) {
         if (err) {
            console.error('deleteProject err', err);
            throw err;
         }
         if(! result.result.ok) {
            return res.status(500).json({ error: 'unexpected' });
         }
         if(result.result.n === 0) {
            return res.status(404).json({ error: 'not found' });
         }
         // console.log('deleteProject result for ' + req.params.id, result, result.result);
         res.json({ success: true });
      });
   };
}

module.exports = projectHandler;
