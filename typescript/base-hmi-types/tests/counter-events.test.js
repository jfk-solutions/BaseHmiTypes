import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HmiProjectBase,HmiEventBinding} from '../dist/index.js';
test('counter actions retain native owner metadata without entering global events',()=>{
  class EmptyProject extends HmiProjectBase {}
  assert.deepEqual(new EmptyProject().counterEvents,[]);
  const binding=new HmiEventBinding();binding.eventName='Overflow';
  Object.assign(binding.sourceProperties,{NativeArchiveSlot:'2',NativeArchiveName:'ARCHIV_3'});
  class CounterProject extends HmiProjectBase {get counterEvents(){return [binding];}}
  const project=new CounterProject(),json=JSON.parse(JSON.stringify(project.counterEvents));
  assert.equal(json[0].eventName,'Overflow');assert.equal(json[0].sourceProperties.NativeArchiveSlot,'2');
  assert.equal(json[0].sourceProperties.NativeArchiveName,'ARCHIV_3');assert.deepEqual(project.globalEvents,[]);
});
