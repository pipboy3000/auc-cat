<search>
  <input class="input__text +luminous" type="text" name="keyword" placeholder="search keyword">
  <div class="message">{this.message}</div>

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

  var keywordBus = new Bacon.Bus()
  keywordBus.plug(keywordValue())
  keywordBus.onValue((keyword) => {
    request.get(`${opts.uri}/search/keyword/${keyword}`)
    .end((err, res) => {
      if (err) {
        this.message = err
      }

      if (res.status === 200) {
        if (res.body.length > 0) {
          this.message = `${res.body.length} Hit!`
        } else {
          this.message = "Not found..."
        }
        opts.observer.trigger('update', res.body);
      }

      this.update()
    })
  })
</search>
