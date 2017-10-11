'use strict';

function issueHandler (db) {
   var issues = db.collection('issues');

   this.getProjectIssues = function (req, res) {

      // var issueProjection = { '_id': false };

      issues.find({ project_id: parseInt(req.params.id) }).toArray(function (err, records) {
         if (err) {
            throw err;
         }

         if (records) {
            records.forEach((record, idx) => {
               delete records[idx]._id;
            });
            res.json(records);
         }
      });
   };

   this.getAllIssues = function (req, res) {

      // var issueProjection = { '_id': false };
      console.log('getAllIssues', req.query);

      issues.find({  }).toArray(function (err, records) {
         if (err) {
            throw err;
         }

         if (records) {
            records.forEach((record, idx) => {
               delete records[idx]._id;
            });
            res.json(records);
         }
      });
   };

   // GET
   this.getProjectIssue = function (req, res) {
      issues.findOne({
         project_id: parseInt(req.params.id),
         iid: parseInt(req.params.iid)
      }, function (err, result) {
         if (err) {
            console.error('getIssue err', err);
            throw err;
         }
         if( ! result) {
            return res.status(404).json({ error: 'not found' });
         }
         res.json(result);
      });
   };

   this.updateProjectIssue = function (req, res) {
      console.log('update query', { id: req.params.id })
      issues.findAndModify({
         project_id: parseInt(req.params.id),
         iid: parseInt(req.params.iid)
      }, {}, { $set: req.body }, { 'new': true }, function (err, result) {
         if (err) {
            console.error('updateIssue err', err);
            throw err;
         }
         if(! result.value) {
            return res.status(404).json({ error: 'not found' });
         }
         var updatedIssue = result.value;
         delete updatedIssue._id;
         res.json(updatedIssue);
      });
   };

   this.deleteProjectIssue = function (req, res) {
      issues.deleteOne({
         project_id: parseInt(req.params.id),
         iid: parseInt(req.params.iid)
      }, function (err, result) {
         if (err) {
            console.error('deleteIssue err', err);
            throw err;
         }
         if(! result.result.ok) {
            return res.status(500).json({ error: 'unexpected' });
         }
         if(result.result.n === 0) {
            return res.status(404).json({ error: 'not found' });
         }
         // console.log('deleteIssue result for ' + req.params.id, result, result.result);
         res.json({ success: true });
      });
   };
}

module.exports = issueHandler;
