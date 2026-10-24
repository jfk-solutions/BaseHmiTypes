import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HmiDiscreteAlarm,HmiEventBinding} from '../dist/index.js';

test('alarm events and source metadata share the C# camelCase JSON contract',()=>{
  const alarm=new HmiDiscreteAlarm();alarm.alarmId=3;alarm.displayNumber=0;alarm.sourceProperties.NativeMessageSlot='2';
  const event=new HmiEventBinding();event.eventName='MessageArrives';alarm.events.push(event);
  const json=JSON.parse(JSON.stringify(alarm));
  assert.equal(json.alarmId,3);assert.equal(json.sourceProperties.NativeMessageSlot,'2');assert.equal(json.events[0].eventName,'MessageArrives');
  assert.equal(json.displayNumber,0);
  const other=new HmiDiscreteAlarm();assert.deepEqual(other.events,[]);assert.deepEqual(other.sourceProperties,{});
  assert.equal(other.displayNumber,undefined);
});
