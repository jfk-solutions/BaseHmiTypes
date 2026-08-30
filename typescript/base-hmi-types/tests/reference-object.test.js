import assert from "node:assert/strict";
import test from "node:test";

import {
  HmiButton,
  HmiGroup,
  HmiReferenceObjectSettings,
  HmiReferenceParameter,
  HmiScreenParameter,
} from "../dist/index.js";

test("reference object settings retain parameter assignments", () => {
  const settings = new HmiReferenceObjectSettings();
  settings.source = "Library.Motor";
  const parameter = new HmiReferenceParameter();
  parameter.name = "#1";
  parameter.description = "Motor tag";
  parameter.value = "[PLC]Motor1";
  settings.parameters.push(parameter);

  assert.deepEqual(settings.parameters, [parameter]);
});

test("reference object settings separate shared and materialized objects", () => {
  const shared = new HmiButton();
  shared.name = "#1 shared";
  const materialized = new HmiButton();
  materialized.name = "Motor shared";
  const settings = new HmiReferenceObjectSettings();
  settings.resolvedObject = shared;
  settings.materializedObject = materialized;

  assert.equal(settings.resolvedObject, shared);
  assert.equal(settings.materializedObject, materialized);
  assert.notEqual(settings.resolvedObject, settings.materializedObject);
});

test("screen item retains global object parameter definitions", () => {
  const item = new HmiGroup();
  const parameter = new HmiScreenParameter();
  parameter.name = "#1";
  parameter.description = "Motor tag";
  item.parameters.push(parameter);

  assert.deepEqual(item.parameters, [parameter]);
  assert.equal(item.referenceObject, undefined);
});
