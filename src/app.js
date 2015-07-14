'use strict';

var riot = require('riot'); 

require('./tag/search.tag');
require('./tag/list.tag');
require('./tag/message.tag');

var api = {
  uri: 'https://auc-cat.herokuapp.com/',
  observer: new Observer()
};

if (process.env.NODE_ENV === 'development') {
  api.uri = 'http://localhost:9292';
}

riot.mount('search', api);
var listTags = riot.mount('list');
var messageTags =riot.mount('message');

function Observer() {
  riot.observable(this);

  this.on('listUpdate', data => {
    listTags[0].update(data);
  });

  this.on('messageUpdate', text => {
    messageTags[0].update(text);
  });
}
