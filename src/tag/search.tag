<search>
  <input class="input__text +luminous" type="text" name="keyword" placeholder="search keyword">

  var Bacon = require('baconjs')
  var request = require('superagent')
  
  var keywordValue = () => {
    return Bacon.fromEvent(this.keyword, 'keyup')
                .throttle(1500)
                .map(e => e.target.value)
                .skipDuplicates()
                .filter(v => v.length > 2)
                .toProperty()
  }

  var loadingBus = new Bacon.Bus()
  loadingBus.plug(keywordValue())
  loadingBus.onValue(keyword => {
    opts.observer.trigger('messageUpdate', `Search keyword ${keyword}`);
  })

  var keywordBus = new Bacon.Bus()
  keywordBus.plug(keywordValue())
  keywordBus.onValue(keyword => {
    request.get(`${opts.uri}/search/keyword/${keyword}`)
    .end((err, res) => {
      if (err) opts.observer.trigger('messageUpdate', err)

      if (res.status === 200) {
        if (res.body.length > 0) {
          opts.observer.trigger('messageUpdate', `${res.body.length} Hit!`)
        } else {
          opts.observer.trigger('messageUpdate', "Not found...")
        }
        opts.observer.trigger('listUpdate', res.body);
      }
    })
  })

</search>
