<message>
  <div class="message">
    <span name="messageText" class="message__text">{ opts.text }</span>
  </div>

  this.on('update', text => {
    if (text) {
      this.opts.text = text
      this.trigger('effect')
    }
  })

  this.on('effect', (e) => {
    setTimeout(() => {
      this.messageText.classList.remove('--show')
      setTimeout(() => {
        this.messageText.classList.add('--show')
      }, 0)
    }, 0)
  })
</message>
