import { PayloadAction } from "@reduxjs/toolkit";
import axios, { CancelTokenSource } from "axios";
import { SagaIterator } from "redux-saga";
import {
  call,
  cancel,
  cancelled,
  put,
  race,
  select,
  take,
  takeEvery,
} from "redux-saga/effects";

import { HoldReservation } from "../../../../../shared/types";
import { showToast } from "../../toast/redux/toastSlice";
import { ToastOptions } from "../../toast/types";
import {
  cancelPurchaseServerCall,
  releaseServerCall,
  reserveTicketServerCall,
} from "../api";
import { TicketAction } from "../types";
import {
  endTransaction,
  holdTickets,
  PurchasePayload,
  ReleasePayload,
  resetTransaction,
  selectors,
  startTicketAbort,
  startTicketPurchase,
  startTicketRelease,
} from "./ticketSlice";
import { expectSaga } from "redux-saga-test-plan";
import {
  generateErrorToastOptions,
  cancelTransaction,
  purchaseTickets,
  ticketFlow,
} from "./ticketSaga";

import {
  holdReservation,
  purchaseReservation,
  purchasePayload,
} from "../../../test-utils/fake-data";
import * as matcher from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
const holdAction = {
  type: "test",
  payload: holdReservation,
};
describe("common to all flows", () => {
  test("starts with hold call to server", () => {
    return expectSaga(ticketFlow, holdAction)
      .provide([
        [matcher.call.fn(reserveTicketServerCall), null],
        [matcher.call.fn(releaseServerCall), null],
      ])
      .dispatch(
        startTicketAbort({
          reservation: holdReservation,
          reason: "Abort! Abort",
        })
      )
      .call(reserveTicketServerCall, holdReservation)
      .run();
  });

  test("show error toast and clean up after server error", () => {
    return expectSaga(ticketFlow, holdAction)
      .provide([
        [
          matcher.call.fn(reserveTicketServerCall),
          throwError(new Error("It did not work")),
        ],
        [matcher.select.selector(selectors.getTicketAction), TicketAction.hold],
        [matcher.call.fn(releaseServerCall), null],
      ])
      .put(
        showToast(
          generateErrorToastOptions("It did not work", TicketAction.hold)
        )
      )
      .call(releaseServerCall, holdReservation)
      .put(resetTransaction())
      .run();
  });
});
