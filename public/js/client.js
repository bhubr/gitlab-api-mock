'use strict';

(function ($) {

   var addButton = document.querySelector('.btn-add');
   var deleteButton = document.querySelector('.btn-delete');
   var clickNbr = document.querySelector('#click-nbr');
   var apiUrl = 'http://localhost:3000/api/v4';

   var $projEditor = $('#project-editor');
   var $projForm = $projEditor.find('form');
   var $inputProjName = $projForm.find('input[name="name_with_namespace"]');
   var $inputProjId = $projForm.find('input[name="project_id"]');


   var $issueEditor = $('#issue-editor');
   var $issueForm = $issueEditor.find('form');
   var $inputIssueTitle = $issueForm.find('input[name="title"]');
   var $inputIssueDesc = $issueForm.find('textarea[name="description"]');
   var $inputIssueIid = $issueForm.find('input[name="issue_iid"]');
   var $inputIssuePid = $issueForm.find('input[name="issue_pid"]');

   function ready (fn) {
      if (typeof fn !== 'function') {
         return;
      }

      if (document.readyState === 'complete') {
         return fn();
      }

      document.addEventListener('DOMContentLoaded', fn, false);
   }

   function openProjectEditor(evt) {
      var value = evt.target.innerHTML;
      $projEditor.removeClass('hidden');
      $inputProjName.val(value);
      $inputProjId.val($(evt.target).data('id'));
   }

   function openIssueEditor(evt) {
      var value = evt.target.innerHTML;
      $issueEditor.removeClass('hidden');
      $inputIssueTitle.val(value);
      $inputIssueDesc.val($(evt.target).data('description'));
      $inputIssueIid.val($(evt.target).data('iid'));
      $inputIssuePid.val($(evt.target).data('pid'));
   }

   function ajaxPut(url, data, callback) {
      $.ajax({
         type: 'PUT',
         url: url,
         data: JSON.stringify(data),
         headers: {
            'Content-Type': 'application/json'
         },
         success: callback,
         dataType: 'json'
      });
   }

   function submitProjectName(evt) {
      evt.preventDefault();
      $projEditor.addClass('hidden');
      var id = $inputProjId.val();
      var name = $inputProjName.val();
      ajaxPut(apiUrl + '/projects/' + id,
         { name_with_namespace: name },
         function(p) {
            $('#project-' + id).html(p.name_with_namespace);
         }
      );
   }

   function submitIssue(evt) {
      evt.preventDefault();
      $issueEditor.addClass('hidden');
      var iid = $inputIssueIid.val();
      var projectId = $inputIssuePid.val();
      var title = $inputIssueTitle.val();
      var description = $inputIssueDesc.val();
      ajaxPut(apiUrl + '/projects/' + projectId + '/issues/' + iid,
         { title, description },
         function(i) {
            $('#issue-' + id).html(t.title);
            $('#issue-' + id).data('description', t.description);
         }
      );
   }

   function populateProjects (projects) {
      console.log('populateProjects', projects);
      projects.forEach(p => {
         $('#projects').append('<li id="project-' + p.id + '" data-id="' + p.id + '">' + p.name_with_namespace + '</li>');
      })
      $('#projects').find('li').on('click', openProjectEditor);
   }

   function populateIssues (issues) {
      console.log('populateIssues', issues);
      issues.forEach(i => {
         $('#issues').append('<li data-description="' + i.description + '" data-iid="' + i.iid + '" ' + '" data-pid="' + i.project_id + '">' + i.title + '</li>');
      })
      $('#issues').find('li').on('click', openIssueEditor);
   }

   $.get(apiUrl + '/projects', populateProjects, 'json');

   $.get(apiUrl + '/issues', populateIssues, 'json');

   $('#project-editor').find('form').submit(submitProjectName);
   $('#issue-editor').find('form').submit(submitIssue);

   // addButton.addEventListener('click', function () {

   //    ajaxRequest('POST', apiUrl, function () {
   //       ajaxRequest('GET', apiUrl, updateClickCount);
   //    });

   // }, false);

   // deleteButton.addEventListener('click', function () {

   //    ajaxRequest('DELETE', apiUrl, function () {
   //       ajaxRequest('GET', apiUrl, updateClickCount);
   //    });

   // }, false);

})(Zepto);
