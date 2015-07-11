'use strict';

var riot = require('riot'); 

require('./tag/app.tag');
require('./tag/list.tag');

riot.mount('app', {api_uri: 'http://localhost:9292'});
