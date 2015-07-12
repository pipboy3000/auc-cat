'use strict';

var riot = require('riot'); 

require('./tag/search.tag');
require('./tag/list.tag');

var api = {
  uri: 'https://auc-cat.herokuapp.com/',
  observer: new Results()
};

if (process.env.NODE_ENV === 'development') {
  api.uri = 'http://localhost:9292';
}

riot.mount('search', api);
var listTags = riot.mount('list');

function Results() {
  riot.observable(this);

  this.on('update', function(data) {
    listTags[0].update(data);
  });
}
