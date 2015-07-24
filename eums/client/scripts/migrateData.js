var jsonToMigrate = process.argv[2];
var json = require(jsonToMigrate);
var destinationJsonFile = process.argv[3];
var jf = require('jsonfile');

var migrationSourceJson = [];
var migrated = [];

migrate(json);

jf.writeFile(destinationJsonFile, migrated, function(err) {
  if(err === null) {
    console.log('Save to file succeeded: ' + destinationJsonFile);
  }
  else {
    console.log(err);
  }
});

function generateNodeRuns(dPlanNode, migrationSourceJson) {
  var nodeRuns = [];
//Find rename and connect the nodelineitemrun objects
  for (var objectIx in migrationSourceJson) {
    var obj = migrationSourceJson[objectIx];
    if ((obj.model == 'eums.nodelineitemrun') && obj.fields.node_line_item == dPlanNode.fields["temp_lineitempk"]) {
      //copy fields to it
      var nodeRun = obj;
      nodeRun.model = "eums.noderun";
      delete nodeRun.fields.node_line_item;
      nodeRun.fields.node = dPlanNode.pk;
      nodeRuns.push(nodeRun);
    }
  }
  return nodeRuns;
}



function generateDistributionPlanNode(dpLineItem, dPlanNodesJson) {
  //find the distribution plan node
  for (var objectIx in dPlanNodesJson) {
    var obj = dPlanNodesJson[objectIx];
    if ((obj.model == 'eums.distributionplannode') && obj.pk == dpLineItem.fields.distribution_plan_node) {
      var dPlan = obj;
      dPlan.fields["targeted_quantity"] = dpLineItem.fields["targeted_quantity"];
      dPlan.fields["remark"] = dpLineItem.fields["remark"];
      dPlan.fields["delivery_date"] = dpLineItem.fields["delivery_date"];
      dPlan.fields["targeted_quantity"] = dpLineItem.fields["targeted_quantity"];
      dPlan.fields["track"] = dpLineItem.fields["track"];
      dPlan.fields["item"] = dpLineItem.fields["item"];
      dPlan.fields["temp_lineitempk"] = dpLineItem.pk;
      return dPlan;
    }
  }
  return NULL;
}

function migrate(sourceJson) {

  sourceJson.forEach(function(object) {
    if ((object.model == 'eums.distributionplanlineitem') ||
        (object.model == 'eums.distributionplannode') ||
        (object.model == 'eums.nodelineitemrun')) {
      migrationSourceJson.push(object);
    }
    else {
      var modelStr = String(object.model);
      //console.log(modelStr);
      if(modelStr.indexOf('answer')>0){
        object.fields.node_run = object.fields.line_item_run;
        delete object.fields.line_item_run;
      }
      migrated.push(object);
    }
  });

  migrationSourceJson.forEach(function(object){
    if(object.model == 'eums.distributionplanlineitem'){
      var dPlanNode = generateDistributionPlanNode(object, migrationSourceJson);
      if(dPlanNode){
        var nodeRuns = generateNodeRuns(dPlanNode, migrationSourceJson);
        Array.prototype.push.apply(migrated,nodeRuns);
        delete dPlanNode.fields["temp_lineitempk"];
        migrated.push(dPlanNode);
      }
    }
  })
}

