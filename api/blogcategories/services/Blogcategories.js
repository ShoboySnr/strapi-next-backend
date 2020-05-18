/* global Blogcategories */
'use strict';

/**
 * Blogcategories.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

// Public dependencies.
const _ = require('lodash');

// Strapi utilities.
const utils = require('strapi-hook-bookshelf/lib/utils/');
const { convertRestQueryParams, buildQuery } = require('strapi-utils');


module.exports = {

  /**
   * Promise to fetch all blogcategories.
   *
   * @return {Promise}
   */

  fetchAll: (params, populate) => {
    // Select field to populate.
    const withRelated = populate || Blogcategories.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias);

    const filters = convertRestQueryParams(params);

    return Blogcategories.query(buildQuery({ model: Blogcategories, filters }))
      .fetchAll({ withRelated })
      .then(data => data.toJSON());
  },

  /**
   * Promise to fetch a/an blogcategories.
   *
   * @return {Promise}
   */

  fetch: (params) => {
    // Select field to populate.
    const populate = Blogcategories.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias);

    return Blogcategories.forge(_.pick(params, 'id')).fetch({
      withRelated: populate
    });
  },

  /**
   * Promise to count a/an blogcategories.
   *
   * @return {Promise}
   */

  count: (params) => {
    // Convert `params` object to filters compatible with Bookshelf.
    const filters = convertRestQueryParams(params);

    return Blogcategories.query(buildQuery({ model: Blogcategories, filters: _.pick(filters, 'where') })).count();
  },

  /**
   * Promise to add a/an blogcategories.
   *
   * @return {Promise}
   */

  add: async (values) => {
    // Extract values related to relational data.
    const relations = _.pick(values, Blogcategories.associations.map(ast => ast.alias));
    const data = _.omit(values, Blogcategories.associations.map(ast => ast.alias));

    // Create entry with no-relational data.
    const entry = await Blogcategories.forge(data).save();

    // Create relational data and return the entry.
    return Blogcategories.updateRelations({ id: entry.id , values: relations });
  },

  /**
   * Promise to edit a/an blogcategories.
   *
   * @return {Promise}
   */

  edit: async (params, values) => {
    // Extract values related to relational data.
    const relations = _.pick(values, Blogcategories.associations.map(ast => ast.alias));
    const data = _.omit(values, Blogcategories.associations.map(ast => ast.alias));

    // Create entry with no-relational data.
    const entry = await Blogcategories.forge(params).save(data);

    // Create relational data and return the entry.
    return Blogcategories.updateRelations(Object.assign(params, { values: relations }));
  },

  /**
   * Promise to remove a/an blogcategories.
   *
   * @return {Promise}
   */

  remove: async (params) => {
    params.values = {};
    Blogcategories.associations.map(association => {
      switch (association.nature) {
        case 'oneWay':
        case 'oneToOne':
        case 'manyToOne':
        case 'oneToManyMorph':
          params.values[association.alias] = null;
          break;
        case 'oneToMany':
        case 'manyToMany':
        case 'manyToManyMorph':
          params.values[association.alias] = [];
          break;
        default:
      }
    });

    await Blogcategories.updateRelations(params);

    return Blogcategories.forge(params).destroy();
  },

  /**
   * Promise to search a/an blogcategories.
   *
   * @return {Promise}
   */

  search: async (params) => {
    // Convert `params` object to filters compatible with Bookshelf.
    const filters = strapi.utils.models.convertParams('blogcategories', params);
    // Select field to populate.
    const populate = Blogcategories.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias);

    const associations = Blogcategories.associations.map(x => x.alias);
    const searchText = Object.keys(Blogcategories._attributes)
      .filter(attribute => attribute !== Blogcategories.primaryKey && !associations.includes(attribute))
      .filter(attribute => ['string', 'text'].includes(Blogcategories._attributes[attribute].type));

    const searchInt = Object.keys(Blogcategories._attributes)
      .filter(attribute => attribute !== Blogcategories.primaryKey && !associations.includes(attribute))
      .filter(attribute => ['integer', 'decimal', 'float'].includes(Blogcategories._attributes[attribute].type));

    const searchBool = Object.keys(Blogcategories._attributes)
      .filter(attribute => attribute !== Blogcategories.primaryKey && !associations.includes(attribute))
      .filter(attribute => ['boolean'].includes(Blogcategories._attributes[attribute].type));

    const query = (params._q || '').replace(/[^a-zA-Z0-9.-\s]+/g, '');

    return Blogcategories.query(qb => {
      if (!_.isNaN(_.toNumber(query))) {
        searchInt.forEach(attribute => {
          qb.orWhereRaw(`${attribute} = ${_.toNumber(query)}`);
        });
      }

      if (query === 'true' || query === 'false') {
        searchBool.forEach(attribute => {
          qb.orWhereRaw(`${attribute} = ${_.toNumber(query === 'true')}`);
        });
      }

      // Search in columns with text using index.
      switch (Blogcategories.client) {
        case 'mysql':
          qb.orWhereRaw(`MATCH(${searchText.join(',')}) AGAINST(? IN BOOLEAN MODE)`, `*${query}*`);
          break;
        case 'pg': {
          const searchQuery = searchText.map(attribute =>
            _.toLower(attribute) === attribute
              ? `to_tsvector(${attribute})`
              : `to_tsvector('${attribute}')`
          );

          qb.orWhereRaw(`${searchQuery.join(' || ')} @@ to_tsquery(?)`, query);
          break;
        }
      }

      if (filters.sort) {
        qb.orderBy(filters.sort.key, filters.sort.order);
      }

      if (filters.skip) {
        qb.offset(_.toNumber(filters.skip));
      }

      if (filters.limit) {
        qb.limit(_.toNumber(filters.limit));
      }
    }).fetchAll({
      withRelated: populate
    });
  }
};
