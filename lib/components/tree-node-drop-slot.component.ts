import { Component, Input, ViewEncapsulation } from '@angular/core';
import { TreeNode } from '../models/tree-node.model';

@Component({
  selector: 'TreeNodeDropSlot, tree-node-drop-slot',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: `
    <div
      class="node-drop-slot"
      (treeDrop)="onDrop($event)"
      [treeAllowDrop]="allowDrop.bind(this)">
    </div>
  `
})
export class TreeNodeDropSlot {
  @Input() node: TreeNode;
  @Input() dropIndex: number;

  onDrop($event) {
    this.node.mouseAction('drop', $event.event, {
      from: $event.element,
      to: { parent: this.node, index: this.dropIndex }
    });
  }

  allowDrop(element, $event) {
    if (this.node.options.readOnly) return false;
    return this.node.options.allowDrop(element, { parent: this.node, index: this.dropIndex }, $event);
  }
}
