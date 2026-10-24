import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HmiProjectBase,HmiFieldOwner,HmiEventBinding} from '../dist/index.js';
test('source field owners retain unresolved associations and expose their actions',()=>{
  class EmptyProject extends HmiProjectBase {}
  assert.deepEqual(new EmptyProject().fieldOwners,[]);assert.deepEqual(new EmptyProject().fieldEvents,[]);
  const owner=Object.assign(new HmiFieldOwner(),{id:'source/Fields/2/0',sourceFormat:'ProTool.CEintragData',sourceData:new Uint8Array([42,0])});
  owner.sourceProperties.OwnerScreenAssociation='Unresolved';
  class FieldProject extends HmiProjectBase {get fieldOwners(){return [owner];}}
  const project=new FieldProject();assert.deepEqual(project.fieldEvents,[]);
  const binding=Object.assign(new HmiEventBinding(),{eventName:'SelectField'});owner.events.push(binding);
  assert.equal(project.fieldEvents[0],binding);assert.deepEqual(project.globalEvents,[]);
  const json=JSON.parse(JSON.stringify(project.fieldOwners));assert.equal(json[0].sourceProperties.OwnerScreenAssociation,'Unresolved');
  assert.equal(json[0].events[0].eventName,'SelectField');
});
