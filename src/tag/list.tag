<list>
  <ul>
    <li each={ opts.data } class="listItem">
      <span class="listItem__head">{id}</span>
      <span class="listItem__content"><a href="http://category.auctions.yahoo.co.jp/list/{id}/" class="link" target="_blank">{title}</a></span>
    </li>
  </ul>

  <style scoped>
    :scope {
      display: block;
      overflow: hidden;
    }
  </style>
</list>
