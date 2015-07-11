<app>
  <div class="@header">
    <h1 class="heading --logo">Yahoo Auction Category Search</h1>

    <div class="container">
      <input class="input__text +luminous" type="text" name="keyword" placeholder="search keyword">
    </div>
  </div>

  <list data={ results }>

  var Bacon = require('baconjs')
  var request = require('superagent')

  this.results = []

  var keywordValue = () => {
    return Bacon.fromEvent(this.keyword, 'keyup')
                .throttle(1500)
                .map(e => e.target.value)
                .filter(v => v.length > 2)
                .toProperty()
  }

  var keywordBus = new Bacon.Bus()
  keywordBus.plug(keywordValue())
  keywordBus.onValue((keyword) => {
    request.get(`${opts.api_uri}/search/keyword/${keyword}`)
    .end((err, res) => {
      if (err) {
        console.log(err)
        return
      }

      if (res.status === 200) {
        // console.log(res)
        this.results = res.body
        this.update()
      }
    })
  })
</app>
