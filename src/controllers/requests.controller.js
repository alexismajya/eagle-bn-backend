/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
import moment from 'moment';
import Sequelize from 'sequelize';
import sendResult from '../utils/sendResult';
import allRequest from '../utils/request.util';
import requestData from '../utils/getReqWithTrip';
import RequestService from '../services/request.service';
import NotificationService from '../services/notifications.service';
import UserService from '../services/user.service';
import EmailService from '../services/email.service';
import NotificationUtil from '../utils/notification.util';

const { Op } = Sequelize;

const Request = {
  async getRequest(req, res) {
    try {
      const requests = await RequestService.getAllRequestByUserId(req.userData.userId);
      return sendResult(res, 200, 'Requests', requests);
    } catch (err) {
      return sendResult(res, 400, 'something went wrong!');
    }
  },

  async postRequest(req, res) {
    const { country, city, returnTime, trips, timeZone, rememberMe } = req.body;
    const request = {};
    request.country = country;
    request.city = city;
    request.UserId = req.userData.userId;
    request.status = 'pending';
    request.timeZone = timeZone;
    if (returnTime) request.returnTime = returnTime;
    const Req = await RequestService.createRequest(request);
    const Trips = [];
    let index = 0;
    for (const trip of trips) {
      const single = {};
      single.country = trip.country;
      single.city = trip.city;
      single.reason = trip.reason;
      single.departureTime = trip.departureTime;
      single.RequestId = Req.id;
      // eslint-disable-next-line no-await-in-loop
      Trips[index] = await RequestService.createTrip(single);
      index += 1;
    }
    Req.trips = Trips;

    // GETTING LINEMANAGER OF THE REQUESTER
    const { lineManager } = await UserService.getUser({ id: Req.UserId });
    // CREATING NOTIFICATION OF THIS NEW REQUEST FOR THE MANAGER
    const notification = await NotificationService.createNotification({
      modelName: 'Requests',
      modelId: Req.id,
      type: 'new_request',
      userId: lineManager,
    });
    NotificationUtil.echoNotification(req, notification, 'new_request', lineManager);
    // CHECK IF MANAGER IS SUBSCRIBED TO EMAIL NOTIFICATION
    const user = await UserService.getUser({ id: lineManager });
    if (user.recieveEmails) {
      // SENDING NOTIFICATION TO THE MANAGER
      await EmailService.sendNewRequestEmail(req, Req.id, req.userData.email, user);
    }
    if (req.userData.rememberMe !== rememberMe) {
      await UserService.updateUserById(req.userData.userId, { rememberMe });
    }
    return sendResult(res, 201, `A request created successfully. Remember me for future request? ${rememberMe}`, Req);
  },

  async changeRequestStatus(req, res) {
    const { status } = req.params;
    const { request } = req;
    if (request.status === 'pending') {
      const newRequest = await RequestService.updateRequest({ status }, { id: request.id });
      req.user = await UserService.getUser({ id: newRequest.UserId });
      await EmailService.sendRequestedStatusUpdatedEmail(req, newRequest);
      return sendResult(res, 200, 'updated successfully', newRequest);
    }
    return sendResult(res, 403, 'this request is already approved/rejected');
  },

  async getSingleRequest(req, res) {
    sendResult(res, 200, 'request data', req.request);
  },

  async getManagerRequests(req, res) {
    const { status } = req.query;
    const { managerId } = req.params;
    const requests = await RequestService.getRequestByManagerId(managerId, status);
    sendResult(res, 200, 'request list', requests);
  },

  async search(req, res) {
    const { tripData, reqData } = requestData(req);
    if (req.user.role !== 'admin' && req.user.role !== 'Tadmin') {
      reqData.UserId = req.user.userId;
    }
    const request = await RequestService.searchRequest(reqData, tripData);

    return sendResult(res, 200, 'Search results', request);
  },

  async updateRequest(req, res) {
    const { country, city, returnTime, trip, timeZone } = req.body;
    const { requestId, tripId } = req.params;
    let request = {
      country, city, returnTime: new Date(returnTime).toJSON(), timeZone
    };
    let trips = {
      country: trip.country,
      city: trip.city,
      departureTime: new Date(trip.departureTime).toJSON(),
      reason: trip.reason
    };
    const reqData = allRequest.getProvidedData(request);
    const tripData = allRequest.getProvidedData(trips);
    if (reqData) {
      const condition = { id: requestId, UserId: req.user.id, status: 'pending' };
      request = await RequestService.updateRequest(reqData, condition);
    }
    if (tripData) {
      const condition = { id: tripId };
      trips = await RequestService.updateTrip(tripData, condition);
      request.trip = trips;
    }
    return sendResult(res, 200, 'request update successful', request);
  },

  async stats(req, res) {
    const days = new Date(moment().subtract('1', 'days'));
    const weeks = new Date(moment().subtract('7', 'days'));
    const months = new Date(moment().subtract('1', 'months'));
    const lastMonth = await RequestService.findAllTrips(req.reqCondition, {
      departureTime: { [Op.gte]: months }
    });
    const lastWweek = await RequestService.findAllTrips(req.reqCondition, {
      departureTime: { [Op.gte]: weeks }
    });
    const yestarday = await RequestService.findAllTrips(req.reqCondition, {
      departureTime: { [Op.gte]: days }
    });

    return sendResult(res, 200, 'all trip statistics', { days: {
      period_name: 'days',
      period_num: '1',
      num_trips: yestarday.length || 0,
      period_from: days,
      period_to: new Date()
    },
    weeks: {
      period_name: 'weeks',
      period_num: '1',
      num_trips: lastWweek.length || 0,
      period_from: weeks,
      period_to: new Date()
    },
    months: {
      period_name: 'months',
      period_num: '1',
      num_trips: lastMonth.length || 0,
      period_from: months,
      period_to: new Date()
    }
    });
  }
};

export default Request;