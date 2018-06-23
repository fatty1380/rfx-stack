import { action, computed, extendObservable, observable, toJS } from 'mobx';
import _ from 'lodash';

import { service } from '@/shared/app';

const log = logdown.getChildLogger('stores.base');

export default class BaseStore {
  constructor({
    serviceName,
    baseItem,
    cacheSize = 0,
    searchFields = ['title'],
  }) {
    log.verbose(`Initializing new ${serviceName} instance of BaseStore`);
    extendObservable(this.baseItem, toJS(baseItem));
    this.serviceName = serviceName;
    this.cacheSize = cacheSize;
    this.searchFields = searchFields;

    this.cachedItems = observable.map({ cachedAt: new Date() });

    extendObservable(this.selected, _.clone(this.baseItem));

    this.log.debug(
      `Initialized new instance of the BaseStore for "${serviceName}"`,
    );

    return this;
  }

  _log;

  @computed
  get log() {
    if (_.isEmpty(this._log) || !_.isFunction(this._log.debug)) {
      this._log = logdown.getChildLogger(
        `stores.${this.serviceName || 'BaseStore'}`,
      );
    }

    return this._log;
  }

  set log(val) {
    this._log = val;
  }

  @observable serviceName = 'service';

  static BASE_ITEM = {
    uuid: null,
    createdAt: null,
    updatedAt: null,
  };

  @observable baseItem = _.clone(BaseStore.BASE_ITEM);

  query = {};

  @observable sort = {};

  @observable searchFields = [];

  @observable searchValue = '';

  @observable list = [];

  @observable selected = _.clone(this.baseItem);

  @observable cacheSize = 0;

  @observable cachedItems = new Map();

  @observable isLoading = false;

  /*
    "total": "<total number of records>",
    "limit": "<max number of items per page>",
    "skip": "<number of skipped items (offset)>",
    "current": "<current page number>"
    "pages": "<total number of pages>"
  */
  @observable $pagination = {};

  init() {
    // run events on client side-only
    if (global.TYPE === 'CLIENT') this.initEvents();
  }

  initEvents() {
    service(this.serviceName).on('created', action(this.onCreated)); // onCreated = (data, params) => {}
    service(this.serviceName).on('updated', action(this.onUpdated)); // onUpdated = (data) => {}
    service(this.serviceName).on('patched', action(this.onPatched)); // onPatched = (id, data) => {}
    service(this.serviceName).on('removed', action(this.onRemoved));
  }

  listenerRegistration = {};

  @action
  registerEventListener({ onCreated, onUpdated, onPatched, onRemoved, id }) {
    if (global.TYPE !== 'CLIENT') return null;

    const listeners = {
      created: _.isFunction(onCreated) && onCreated,
      updated: _.isFunction(onUpdated) && onUpdated,
      patchd: _.isFunction(onPatched) && onPatched,
      removed: _.isFunction(onRemoved) && onRemoved,
      id: id || Date.now(),
    };

    _.map(listeners, (val, key) => {
      if (_.isFunction(val) && key !== 'id') {
        service(this.serviceName).on(key, val);
        log.debug(`registering ${key} listener`);
      }
    });

    this.listenerRegistration[listeners.id] = listeners;

    return listeners.id;
  }

  deregisterEventListener(id) {
    const listeners = this.listenerRegistration[id];

    if (_.isEmpty(listeners)) return;

    _.map(listeners, (val, key) => {
      if (_.isFunction(val)) {
        service(this.serviceName).removeListener(key, val);
        log.debug(`deregistering ${key} listener`);
      }
    });
  }

  @action
  updateList(json) {
    this.list = json.data;
    this.$pagination = _.omit(json, 'data');

    this.log.debug(`Loaded ${this.serviceName}: `, this.list, this.query.query);

    return Promise.resolve(this.list);
  }

  @computed
  get pagination() {
    const { total = 0, limit = 1, skip = 0 } = this.$pagination;
    return _.extend(this.$pagination, {
      pages: Math.ceil(total / limit),
      current: Math.ceil((skip - 1) / limit) + 1,
    });
  }

  @action
  emptyList() {
    this.list = [];
  }

  isItemMatch(item, matchQuery) {
    let query = _.defaults({ uuid: item.uuid, $limit: 0 }, this.query.query);
    if (!!matchQuery && _.keys(matchQuery).lenth > 1) {
      query = matchQuery;
    }
    return service(this.serviceName)
      .find({ query })
      .then(res => !!res.total);
  }

  addItem(item) {
    log.info(`Adding new ${this.serviceName}: `, { item });
    if (!_.isEmpty(this.query.query)) {
      this.isItemMatch(item).then(isMatch => {
        if (isMatch) {
          this.pushItem(item);
        }
      });
    }
  }

  @action
  pushItem(item) {
    if (this.list.length >= this.$pagination.limit) this.list.pop();
    this.list.unshift(item);
    this.$pagination.total += 1;
  }

  @action
  removeItem(item) {
    _.remove(this.list, { uuid: item.uuid });
    this.$pagination.total -= 1;
  }

  create({ data = {}, params = {} }) {
    if (_.isEmpty(data)) {
      return Promise.reject(new Error('No Data Specified'));
    }

    this.log.debug(`Creating new ${this.serviceName}: `, { data, params });
    return service(this.serviceName)
      .create(data, params)
      .then(res => {
        log.info(`Created new ${this.serviceName}: `, res);
        return res;
      })
      .catch(err => this.logAndThrow(err));
  }

  update({ data = {}, params, id = data.uuid }) {
    if (_.isEmpty(id)) {
      this.log.error('No ID Specified in request', data);
      return Promise.reject(
        new Error(`No ${this.serviceName} ID Specified in method call`),
      );
    }

    return service(this.serviceName)
      .patch(id, data, params)
      .catch(err => this.logAndThrow(err));
  }

  findByCompany({ company, query = {}, opts = {} }) {
    const companyUUID = _.isString(company) ? company : company.uuid;
    return this.find(
      { query: _.extend({ companies: companyUUID }, query) },
      _.extend({ clear: true }, opts),
    );
  }

  runQuery(query) {
    return service(this.serviceName)
      .find({ query })
      .catch(err => this.logAndThrow(err));
  }

  @action
  sortBy(sortBy, { noQuery = false, setOnly = false } = {}) {
    if (_.isEmpty(sortBy)) {
      this.sort = undefined;
    } else {
      this.sort = sortBy;
    }

    if (setOnly) {
      return Promise.resolve(this.sort);
    }

    if (noQuery) {
      return Promise.resolve(
        _.orderBy(
          this.list,
          _.keys(this.sort),
          _.map(this.sort, val => (val > 0 ? 'asc' : 'desc')),
        ),
      );
    }

    return this.find();
  }

  preservedFields = [];

  @action
  find(query = {}, { save = true, clear = false, noQuery = false } = {}) {
    this.isLoading = !noQuery;

    const baseQuery = _.isUndefined(query.query) ? { query } : query;
    if (clear) {
      this.resetSearch();
      this.query = baseQuery;
    } else {
      _.merge(this.query, baseQuery);
    }

    if (_.isEmpty(query) && !this.query.query.$limit) {
      this.query.query.$limit = 100; // TODO: make configurable on new
    }

    _(baseQuery.query)
      .keys()
      .each(key => {
        if (_.isUndefined(baseQuery.query[key])) {
          delete this.query.query[key];
        }
      });

    if (baseQuery.$sort) {
      this.sortBy(baseQuery.$sort, { setOnly: true });
    }

    this.query.query.$sort = this.sort;

    if (noQuery) {
      return Promise.resolve(this.query);
    }

    this.log.debug(`Querying ${this.serviceName} on query:`, this.query.query);

    return service(this.serviceName)
      .find(this.query)
      .then(json => (save ? this.updateList(json) : json.data))
      .catch(err => {
        // eslint-disable-next-line no-param-reassign
        err.query = this.query;

        throw err;
      })
      .finally(
        action(() => {
          this.isLoading = false;
        }),
      );
  }

  findOne({ query = {} }) {
    if (_.isEmpty(query)) {
      return Promise.reject(new Error('Empty Query'));
    }

    return service(this.serviceName)
      .find({ query: _.extend({ $limit: 1 }, query) })
      .then(response => _.first(response.data));
  }

  get(id, { select = true, query } = {}) {
    return service(this.serviceName)
      .get(id, { query })
      .then(res => (select ? this.setSelected(res) : res))
      .catch(err => {
        if (/NotFound/i.test(err.name) && select) {
          return this.setSelected({});
        }
        throw err;
      })
      .catch(err => this.logAndThrow(err));
  }

  /**
   * lookup
   *
   * Preforms a cache-first lookup of an item based on its ID
   */

  _getLocal(id, query) {
    return this.get(id, query);
  }

  @action getLocal = _.memoize(this._getLocal);

  remove(uuid) {
    if (_.isEmpty(uuid)) {
      return Promise.reject(new Error('No UUID Specified for Removal'));
    }

    return service(this.serviceName)
      .remove(uuid)
      .then(json => {
        this.log.debug(`Removed Item with result: ${json.uuid}`, json);
        this.removeItem(json);
      });
  }

  /* Actions */

  @action
  setSelected(json = {}) {
    if (_.isEmpty(json)) {
      return this.clearSelected();
    }

    if (_.isString(json)) {
      return this.get(json);
    }

    this.log.debug('Setting Selected %s: %o', this.serviceName, json);
    this.selected = json;

    return Promise.resolve(this.selected);
  }

  @action
  clearSelected() {
    this.selected = {};

    return Promise.resolve(this.selected);
  }

  /* EVENTS */

  onCreated = item => this.addItem(item);

  @action
  onUpdated = data => {
    if (_.isEmpty(data)) {
      // For some reason, the jobs service is
      // sending events with a null object
      // To avoid throwing an error when getting 'data.uuid'
      // Adding a check here
      return false;
    }
    this.log.debug('Received %s Update: %O', this.serviceName, data);

    // Update Cached Item if already present. Ignore uncached item updates
    if (this.isInCache(data.uuid)) {
      this.setInCache(data.uuid, _.extend(data, { cachedAt: new Date() }));
    }

    this.setInCache(data.uuid, _.extend(data, { cachedAt: new Date() }));

    const existing = _.find(this.list, { uuid: data.uuid });
    if (existing) {
      if (_.isBoolean(data.deleted) && data.deleted) {
        this.list.remove(existing);
      } else {
        extendObservable(existing, data);
      }
    }

    if (_.get(this.selected, 'uuid') === data.uuid) {
      extendObservable(this.selected, data);
    }

    return true;
  };

  onPatched = this.onUpdated;

  onRemoved = (id, params) => {
    this.log.info('Item %s was removed', id, params);

    if (this.selected.uuid === id) {
      this.clearSelected();
    }
    this.removeItem(id);
  };

  /* ACTIONS */

  @action
  page(page = 1) {
    const skipPage = this.$pagination.limit * (page - 1);
    const { pages } = this.$pagination;
    if (skipPage < 0 || page > pages) return null;
    return this.find({ query: { $skip: skipPage } });
  }

  @action
  search(search = null, searchQuery = {}) {
    this.searchValue = search || '';

    const query = _.extend({ $skip: 0 }, searchQuery);

    _.each(this.searchFields, field => {
      query[field] = {
        $regex: `.*${this.searchValue}.*`,
        $options: 'i',
      };
    });

    return this.find({ query });
  }

  @action
  clearSearch() {
    this.searchValue = '';
  }

  @action
  resetSearch({ preserve = [] } = {}) {
    this.query = {
      query: _.pick(this.query.query, _.union(preserve, this.preservedFields)),
    };

    this.searchValue = '';
  }

  @action
  filterBy() {
    return Promise.reject(
      new Error(
        'NotImplemented: BaseStore "FilterBy" has no default Impementation',
      ),
    );
  }

  logAndThrow(err) {
    if (!_.isEmpty(err.errors)) {
      this.log.error(
        `Caught Error: ${err.message}, %s`,
        _.map(err.errors, 'message').join('\n'),
        err,
      );
    } else {
      this.log.error(err.message, err);
    }
    throw err;
  }
}
