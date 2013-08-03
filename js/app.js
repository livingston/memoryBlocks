/*! Memory Blocks

    @author Livingston Samuel
    @version 0.6
*/

requirejs(['game/config', 'game/MemoryBlocks'], function (settings, MemoryBlocks) {
  var body = document.body;

  if (!document.createElement('canvas').getContext || !('bind' in Function.prototype)) {
    body.style.cssText = 'text-align:center';
    body.appendChild(document.createTextNode('Your browser doesn\'t support "Memory Blocks".'));
    return null;
  }

  var mb = new MemoryBlocks(settings);
});
