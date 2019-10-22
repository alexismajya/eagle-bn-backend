import express from 'express';
import requestController from '../controllers/requestController';
import { isUserVerifiedAndRequester } from '../middlewares';
import valid from '../validation';
import { validateTrips, validateAccommodation } from '../validation/trips';
import reqMidd from '../middlewares/requestMiddlware';
import userMidd from '../middlewares/userMiddlware';
import roles from '../middlewares/rolesMiddlewares';

const app = express.Router();

const { checkExistingTrip, checkLineManager, checkManagerId } = reqMidd;
const { changeRequestStatus, getManagerRequests } = requestController;
const { checkManager } = roles;
const { checkToken } = userMidd;
const { tripValidation } = valid;

app.get('/', isUserVerifiedAndRequester, requestController.getRequest);
/* eslint-disable max-len */
app.post('/', isUserVerifiedAndRequester, valid.request, validateTrips, validateAccommodation, requestController.postRequest);
app.get('/managers/:managerId', checkToken, checkManager, checkManagerId, getManagerRequests);
app.patch('/:requestId/:status', checkToken, checkManager, checkExistingTrip, checkLineManager, tripValidation, changeRequestStatus);

export default app;
