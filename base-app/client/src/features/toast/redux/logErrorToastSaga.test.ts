import { call } from "redux-saga/effects";
import { expectSaga } from "redux-saga-test-plan";

import { ToastOptions } from "../types";
import { logErrorToasts, logErrorToast } from "./LogErrorToastSaga";

const errorToastOptions = {
  title: "Its time to panick",
  status: "error",
};

const errorToastAction: ToastOptions = {
  type: "test",
  payload: errorToastOptions,
};

test("saga calls analytic engine when we receive error toast", () => {
  return expectSaga(logErrorToasts, errorToastAction)
    .call(logErrorToast, "Its time to panick")
    .run();
});

const infoToastOptions: ToastOptions = {
  title: "Time to relax",
  satus: "info",
};

const infoToastAction = {
  type: "test",
  payload: infoToastOptions,
};

test("non-error toast does not trigger analytics call", () => {
  return expectSaga(logErrorToasts, infoToastAction)
    .not.call.fn(logErrorToast)
    .run();
});
