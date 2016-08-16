'use strict';

function isObjectEmpty(obj) {
  if (!obj) {
    return true;
  }
  return Object.getOwnPropertyNames(obj).length === 0;
}

function getObjectPropNames(obj) {
  if (!obj) {
    return [];
  }
  return Object.getOwnPropertyNames(obj);
}
