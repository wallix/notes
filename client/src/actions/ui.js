import { alertConstants, uiConstants } from "../constants";

export const uiActions = {
  success,
  error,
  clear,
  openModal,
  closeModal
};

function success(message) {
  return { type: alertConstants.SUCCESS, message };
}

function error(message) {
  return { type: alertConstants.ERROR, message };
}

function clear() {
  return { type: alertConstants.CLEAR };
}

function openModal(id) {
  return {
    type: uiConstants.OPEN_MODAL,
    id: id
  };
}

function closeModal(id) {
  return {
    type: uiConstants.CLOSE_MODAL,
    id: id
  };
}
