import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HmiCharacterScreen,HmiEventBinding} from '../dist/index.js';
test('character field actions retain source owners in the paired JSON contract',()=>{
  const screen=new HmiCharacterScreen(),binding=new HmiEventBinding();binding.eventName='SelectField';
  Object.assign(binding.sourceProperties,{NativeFieldGroupSlot:'2',NativeFieldIndex:'1'});screen.fieldEvents.push(binding);
  const json=JSON.parse(JSON.stringify(screen));assert.equal(json.fieldEvents[0].eventName,'SelectField');
  assert.equal(json.fieldEvents[0].sourceProperties.NativeFieldGroupSlot,'2');
  assert.deepEqual(new HmiCharacterScreen().fieldEvents,[]);assert.deepEqual(screen.events,[]);
});
