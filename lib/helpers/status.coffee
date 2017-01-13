module.exports =
class Status
  constructor: (message) ->
    @statusBar = document.querySelector('status-bar')

    if @statusBar
      @item = document.createElement('div')
      @item.classList.add('inline-block')
      @msg(message)

      @tile = @statusBar.addLeftTile({@item})

  remove: ->
    @tile?.destroy()

  msg: (text) ->
    @item.innerHTML = text if @statusBar