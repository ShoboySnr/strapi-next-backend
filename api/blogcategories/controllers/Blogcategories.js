'use strict';

/**
 * Blogcategories.js controller
 *
 * @description: A set of functions called "actions" for managing `Blogcategories`.
 */

module.exports = {

  /**
   * Retrieve blogcategories records.
   *
   * @return {Object|Array}
   */

  find: async (ctx, next, { populate } = {}) => {
    if (ctx.query._q) {
      return strapi.services.blogcategories.search(ctx.query);
    } else {
      return strapi.services.blogcategories.fetchAll(ctx.query, populate);
    }
  },

  /**
   * Retrieve a blogcategories record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    return strapi.services.blogcategories.fetch(ctx.params);
  },

  /**
   * Count blogcategories records.
   *
   * @return {Number}
   */

  count: async (ctx, next, { populate } = {}) => {
    return strapi.services.blogcategories.count(ctx.query, populate);
  },

  /**
   * Create a/an blogcategories record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.blogcategories.add(ctx.request.body);
  },

  /**
   * Update a/an blogcategories record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.blogcategories.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an blogcategories record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.blogcategories.remove(ctx.params);
  }
};
