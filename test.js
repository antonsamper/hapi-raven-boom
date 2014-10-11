'use strict';

var chai   = require('chai').use(require('sinon-chai'));
var expect = chai.expect;
var hapi   = require('hapi');
var raven  = require('raven');
var sinon  = require('sinon');

/* globals describe:false, beforeEach:false, afterEach:false, it:false */

describe('hapi-raven', function () {

  var server;
  beforeEach(function () {
    server = new hapi.Server();
  });

  var options = {
    raven: {
      dsn: 'dsn'
    }
  };

  describe('Initialization', function () {

    beforeEach(function () {
      sinon.stub(raven, 'Client');
    });

    afterEach(function () {
      raven.Client.restore();
    });

    it('can be configured with the DSN directly', function (done) {
      server.pack.register({
        plugin: require('./'),
        options: {
          raven: 'dsn'
        }
      },
      function () {
        expect(raven.Client).to.have.been.calledWith('dsn', null);
        done();
      });
    });

    it('can be configured with options', function (done) {
      server.pack.register({
        plugin: require('./'),
        options: options
      },
      function () {
        expect(raven.Client).to.have.been.calledWith('dsn', options.raven);
        done();
      });
    });
    
  });

  describe('Usage', function () {

    var client;
    beforeEach(function (done) {
      sinon.stub(raven, 'Client');
      server.pack.register({
        plugin: require('./'),
        options: options
      },
      function () {
        client = raven.Client.firstCall.returnValue;
        done();
      });
    });

    afterEach(function () {
      raven.Client.restore();
    });

    it('sends internal errors with the request', function (done) {
      var err = new Error();
      var request = {};
      client.captureError = sinon.spy(function () {
        expect(client.captureError).to.have.been.calledWith(err, {
          request: request
        });
        done();
      });
      server.emit('internalError', request, err);
    });

  });

});