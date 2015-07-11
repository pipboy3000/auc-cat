'use strict';

var riot = require('riot'); 

require('./tag/app.tag');
require('./tag/list.tag');

var api_uri = 'https://auc-cat.herokuapp.com/';

if (process.env.NODE_ENV === 'development') {
  api_uri = 'http://localhost:9292';
}

riot.mount('app', {api_uri: api_uri});
