import { Sequelize } from 'sequelize';
import moment from 'moment';
import db from '../database/models';

const RequestService = {
  async getOneRequest(condition) {
    const request = await db.Requests.findOne({ where: condition, raw: true, });
    if (request) {
      request.Trips = await db.Trips.findAll({
        where: { RequestId: request.id },
        attributes: { exclude: ['RequestId', 'createdAt', 'accommodationId'] },
      });
    }
    return request;
  },
  async getOnetrip(condition) {
    const trip = await db.Trips.findOne({ where: condition, raw: true });
    return trip;
  },

  async updateRequest(data, condition) {
    const request = await db.Requests.update(data, {
      where: condition, returning: true, plain: true, raw: true,
    });
    return request[1];
  },

  async updateTrip(data, condition) {
    const trip = await db.Trips.update(data, {
      where: condition, returning: true, plain: true, raw: true,
    });
    return trip[1];
  },

  getTripOwner: async (id) => {
    const { RequestId } = await db.Trips.findOne({ where: { id }, attributes: ['RequestId'] });
    const { UserId } = await db.Requests.findOne({ where: { id: RequestId }, attributes: ['UserId'] });
    return UserId;
  },

  async findAllTrips(reqCondition) {
    const trip = await db.Requests.findAll({
      where: reqCondition,
      raw: true,
    });
    return trip;
  },
  async createRequest(request) {
    const requestResult = await db.Requests.create(request);
    return requestResult.get({ plain: true });
  },

  async createTrip(trip) {
    const requestResult = await db.Trips.create(trip);
    return requestResult.get({ plain: true });
  },
  async getRequestByManagerId(id, status) {
    const includeUser = { model: db.Users, attributes: ['id', 'email', 'lineManager'], where: { lineManager: id } };
    let requests;
    if (status) {
      requests = await db.Requests.findAll({
        where: { status },
        include: [includeUser],
      });
    } else {
      requests = await db.Requests.findAll({
        include: [includeUser]
      });
    }
    return requests;
  },
  async searchRequest(reqData, tripData) {
    return db.Requests.findAll({
      where: reqData,
      include: [{ model: db.Trips, where: tripData, required: true }]
    });
  },
  async getAllRequestByUserId(userId) {
    const result = await db.Requests.findAll({
      where: { UserId: userId },
      include: { model: db.Trips, attributes: { exclude: ['RequestId'] } } });
    return result;
  },
  async getTraveledDestinations() {
    // eslint-disable-next-line no-return-await
    return await db.Trips.findAll({
      where: Sequelize.where(Sequelize.fn('date', Sequelize.col('Trips.createdAt')), '<=', Sequelize.fn('date', moment().format('YYYY-MM-DD'))),
      attributes: ['country', 'city', [Sequelize.fn('COUNT', 'city'), 'N of visitors']],
      group: ['Trips.city', 'Trips.country'],
      order: [[Sequelize.fn('COUNT', 'Trips.city'), 'DESC']]
    });
  }
};

export default RequestService;
