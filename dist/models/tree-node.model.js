var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { observable, computed, action } from 'mobx';
import { TREE_EVENTS } from '../constants/events';
import * as _ from 'lodash';
var first = _.first, last = _.last;
var TreeNode = (function () {
    function TreeNode(data, parent, treeModel, index) {
        var _this = this;
        this.data = data;
        this.parent = parent;
        this.treeModel = treeModel;
        this.position = 0;
        this._isFolder = false;
        // OPEN CONTEXT FLAG
        this._openContext = false;
        this.allowDrop = function (element, $event) {
            if (_this.options.readOnly)
                return false;
            return _this.options.allowDrop(element, { parent: _this, index: 0 }, $event);
        };
        if (this.id === undefined || this.id === null) {
            this.id = uuid();
        } // Make sure there's a unique id without overriding existing ids to work with immutable data structures
        this.index = index;
        if (this.getField('children')) {
            this._initChildren();
        }
        // CHECK for tag in data
        if (this.data['folder']) {
            this._isFolder = true;
        }
    }
    Object.defineProperty(TreeNode.prototype, "isHidden", {
        get: function () { return this.treeModel.isHidden(this); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "isExpanded", {
        get: function () { return this.treeModel.isExpanded(this); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "isActive", {
        get: function () { return this.treeModel.isActive(this); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "isFocused", {
        get: function () { return this.treeModel.isNodeFocused(this); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "level", {
        get: function () {
            return this.parent ? this.parent.level + 1 : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "path", {
        get: function () {
            return this.parent ? this.parent.path.concat([this.id]) : [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "elementRef", {
        get: function () {
            throw "Element Ref is no longer supported since introducing virtual scroll\n\n      You may use a template to obtain a reference to the element";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "openContext", {
        get: function () {
            return this._openContext;
        },
        set: function (value) {
            this._openContext = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "originalNode", {
        get: function () { return this._originalNode; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "hasChildren", {
        // helper get functions:
        get: function () {
            return !!(this.data.hasChildren || (this.children && this.children.length > 0));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "isCollapsed", {
        get: function () { return !this.isExpanded; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "isLeaf", {
        get: function () { return !this.hasChildren; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "isRoot", {
        get: function () { return this.parent.data.virtual; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "realParent", {
        get: function () { return this.isRoot ? null : this.parent; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "options", {
        // proxy functions:
        get: function () { return this.treeModel.options; },
        enumerable: true,
        configurable: true
    });
    TreeNode.prototype.fireEvent = function (event) { this.treeModel.fireEvent(event); };
    Object.defineProperty(TreeNode.prototype, "displayField", {
        // field accessors:
        get: function () {
            return this.getField('display');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "id", {
        get: function () {
            return this.getField('id');
        },
        set: function (value) {
            this.setField('id', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "isFolder", {
        get: function () {
            return this._isFolder || this.hasChildren;
        },
        enumerable: true,
        configurable: true
    });
    TreeNode.prototype.getField = function (key) {
        return this.data[this.options[key + "Field"]];
    };
    TreeNode.prototype.setField = function (key, value) {
        this.data[this.options[key + "Field"]] = value;
    };
    // traversing:
    TreeNode.prototype._findAdjacentSibling = function (steps, skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var siblings = this._getParentsChildren(skipHidden);
        return siblings.length > this.index + steps ? siblings[this.index + steps] : null;
    };
    TreeNode.prototype.findNextSibling = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        return this._findAdjacentSibling(+1, skipHidden);
    };
    TreeNode.prototype.findPreviousSibling = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        return this._findAdjacentSibling(-1, skipHidden);
    };
    TreeNode.prototype.getVisibleChildren = function () {
        return this.visibleChildren;
    };
    Object.defineProperty(TreeNode.prototype, "visibleChildren", {
        get: function () {
            return (this.children || []).filter(function (node) { return !node.isHidden; });
        },
        enumerable: true,
        configurable: true
    });
    TreeNode.prototype.getFirstChild = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var children = skipHidden ? this.visibleChildren : this.children;
        return first(children || []);
    };
    TreeNode.prototype.getLastChild = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var children = skipHidden ? this.visibleChildren : this.children;
        return last(children || []);
    };
    TreeNode.prototype.findNextNode = function (goInside, skipHidden) {
        if (goInside === void 0) { goInside = true; }
        if (skipHidden === void 0) { skipHidden = false; }
        return goInside && this.isExpanded && this.getFirstChild(skipHidden) ||
            this.findNextSibling(skipHidden) ||
            this.parent && this.parent.findNextNode(false, skipHidden);
    };
    TreeNode.prototype.findPreviousNode = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var previousSibling = this.findPreviousSibling(skipHidden);
        if (!previousSibling) {
            return this.realParent;
        }
        return previousSibling._getLastOpenDescendant(skipHidden);
    };
    TreeNode.prototype._getLastOpenDescendant = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var lastChild = this.getLastChild(skipHidden);
        return (this.isCollapsed || !lastChild)
            ? this
            : lastChild._getLastOpenDescendant(skipHidden);
    };
    TreeNode.prototype._getParentsChildren = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var children = this.parent &&
            (skipHidden ? this.parent.getVisibleChildren() : this.parent.children);
        return children || [];
    };
    TreeNode.prototype.getIndexInParent = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        return this._getParentsChildren(skipHidden).indexOf(this);
    };
    TreeNode.prototype.isDescendantOf = function (node) {
        if (this === node)
            return true;
        else
            return this.parent && this.parent.isDescendantOf(node);
    };
    TreeNode.prototype.getNodePadding = function () {
        return this.options.levelPadding * (this.level - 1) + 'px';
    };
    TreeNode.prototype.getClass = function () {
        return [this.options.nodeClass(this), "tree-node-level-" + this.level].join(' ');
    };
    TreeNode.prototype.onDrop = function ($event) {
        this.mouseAction('drop', $event.event, {
            from: $event.element,
            to: { parent: this, index: 0, dropOnNode: true }
        });
    };
    TreeNode.prototype.allowDrag = function () {
        return this.options.allowDrag(this);
    };
    // helper methods:
    TreeNode.prototype.loadNodeChildren = function () {
        var _this = this;
        if (!this.options.getChildren) {
            return Promise.resolve(); // Not getChildren method - for using redux
        }
        return Promise.resolve(this.options.getChildren(this))
            .then(function (children) {
            if (children) {
                _this.setField('children', children);
                _this._initChildren();
                _this.children.forEach(function (child) {
                    if (child.getField('isExpanded') && child.hasChildren) {
                        child.expand();
                    }
                });
            }
        }).then(function () {
            _this.fireEvent({
                eventName: TREE_EVENTS.loadNodeChildren,
                node: _this
            });
        });
    };
    TreeNode.prototype.expand = function () {
        if (!this.isExpanded) {
            return this.toggleExpanded();
        }
        return Promise.resolve();
    };
    TreeNode.prototype.collapse = function () {
        if (this.isExpanded) {
            this.toggleExpanded();
        }
        return this;
    };
    TreeNode.prototype.doForAll = function (fn) {
        var _this = this;
        Promise.resolve(fn(this)).then(function () {
            if (_this.children) {
                _this.children.forEach(function (child) { return child.doForAll(fn); });
            }
        });
    };
    TreeNode.prototype.expandAll = function () {
        this.doForAll(function (node) { return node.expand(); });
    };
    TreeNode.prototype.collapseAll = function () {
        this.doForAll(function (node) { return node.collapse(); });
    };
    TreeNode.prototype.ensureVisible = function () {
        if (this.realParent) {
            this.realParent.expand();
            this.realParent.ensureVisible();
        }
        return this;
    };
    TreeNode.prototype.toggleExpanded = function () {
        return this.setIsExpanded(!this.isExpanded);
    };
    TreeNode.prototype.setIsExpanded = function (value) {
        if (this.hasChildren) {
            this.treeModel.setExpandedNode(this, value);
            if (!this.children && this.hasChildren && value) {
                return this.loadNodeChildren();
            }
        }
        return Promise.resolve();
    };
    ;
    TreeNode.prototype.setIsActive = function (value, multi) {
        if (multi === void 0) { multi = false; }
        this.treeModel.setActiveNode(this, value, multi);
        if (value) {
            this.focus(this.options.scrollOnSelect);
        }
        return this;
    };
    TreeNode.prototype.toggleActivated = function (multi) {
        if (multi === void 0) { multi = false; }
        this.setIsActive(!this.isActive, multi);
        return this;
    };
    TreeNode.prototype.setActiveAndVisible = function (multi) {
        if (multi === void 0) { multi = false; }
        this.setIsActive(true, multi)
            .ensureVisible();
        setTimeout(this.scrollIntoView.bind(this));
        return this;
    };
    TreeNode.prototype.scrollIntoView = function (force) {
        if (force === void 0) { force = false; }
        this.treeModel.virtualScroll.scrollIntoView(this, force);
    };
    TreeNode.prototype.focus = function (scroll) {
        if (scroll === void 0) { scroll = true; }
        var previousNode = this.treeModel.getFocusedNode();
        this.treeModel.setFocusedNode(this);
        if (scroll) {
            this.scrollIntoView();
        }
        if (previousNode) {
            this.fireEvent({ eventName: TREE_EVENTS.blur, node: previousNode });
        }
        this.fireEvent({ eventName: TREE_EVENTS.focus, node: this });
        return this;
    };
    TreeNode.prototype.blur = function () {
        var previousNode = this.treeModel.getFocusedNode();
        this.treeModel.setFocusedNode(null);
        if (previousNode) {
            this.fireEvent({ eventName: TREE_EVENTS.blur, node: this });
        }
        return this;
    };
    TreeNode.prototype.setIsHidden = function (value) {
        this.treeModel.setIsHidden(this, value);
    };
    TreeNode.prototype.hide = function () {
        this.setIsHidden(true);
    };
    TreeNode.prototype.show = function () {
        this.setIsHidden(false);
    };
    TreeNode.prototype.mouseAction = function (actionName, $event, data) {
        if (data === void 0) { data = null; }
        this.treeModel.setFocus(true);
        var actionMapping = this.options.actionMapping.mouse;
        var action = actionMapping[actionName];
        if (action) {
            action(this.treeModel, this, $event, data);
        }
    };
    TreeNode.prototype.getSelfHeight = function () {
        return this.options.nodeHeight(this);
    };
    // TOGGLE CONTEXT
    TreeNode.prototype.toggleContext = function ($event) {
        $event.preventDefault();
        if (this.treeModel.contextMenuNode && (this.treeModel.contextMenuNode.id !== this.id)) {
            this.treeModel.contextMenuNode.openContext = false;
        }
        this.treeModel.contextMenuNode = this;
        this._openContext = !this._openContext;
        // reset context of previous, show this context
    };
    // RENAME
    TreeNode.prototype.rename = function (newName) {
        this.data.name = newName;
        this.fireEvent({ eventName: TREE_EVENTS.updateData, node: this });
    };
    TreeNode.prototype._initChildren = function () {
        var _this = this;
        this.children = this.getField('children')
            .map(function (c, index) { return new TreeNode(c, _this, _this.treeModel, index); });
    };
    return TreeNode;
}());
export { TreeNode };
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TreeNode.prototype, "isHidden", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TreeNode.prototype, "isExpanded", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TreeNode.prototype, "isActive", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TreeNode.prototype, "isFocused", null);
__decorate([
    observable,
    __metadata("design:type", Array)
], TreeNode.prototype, "children", void 0);
__decorate([
    observable,
    __metadata("design:type", Number)
], TreeNode.prototype, "index", void 0);
__decorate([
    observable,
    __metadata("design:type", Object)
], TreeNode.prototype, "position", void 0);
__decorate([
    observable,
    __metadata("design:type", Number)
], TreeNode.prototype, "height", void 0);
__decorate([
    computed,
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], TreeNode.prototype, "level", null);
__decorate([
    computed,
    __metadata("design:type", Array),
    __metadata("design:paramtypes", [])
], TreeNode.prototype, "path", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TreeNode.prototype, "visibleChildren", null);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TreeNode.prototype, "_initChildren", null);
function uuid() {
    return Math.floor(Math.random() * 10000000000000);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9tb2RlbHMvdHJlZS1ub2RlLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFXLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUk3RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFbEQsT0FBTyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUM7QUFDcEIsSUFBQSxlQUFLLEVBQUUsYUFBSSxDQUFPO0FBRTFCO0lBa0NFLGtCQUFtQixJQUFTLEVBQVMsTUFBZ0IsRUFBUyxTQUFvQixFQUFFLEtBQWE7UUFBakcsaUJBYUM7UUFia0IsU0FBSSxHQUFKLElBQUksQ0FBSztRQUFTLFdBQU0sR0FBTixNQUFNLENBQVU7UUFBUyxjQUFTLEdBQVQsU0FBUyxDQUFXO1FBMUJ0RSxhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBZWpCLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFDMUIsb0JBQW9CO1FBQ1osaUJBQVksR0FBRyxLQUFLLENBQUM7UUFvSjdCLGNBQVMsR0FBRyxVQUFDLE9BQU8sRUFBRSxNQUFPO1lBQzNCLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDeEMsTUFBTSxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdFLENBQUMsQ0FBQTtRQTdJQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQztRQUNuQixDQUFDLENBQUMs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QUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7YUFDdEMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxFQUFFLEtBQUssSUFBSyxPQUFBLElBQUksUUFBUSxDQUFDLENBQUMsRUFBRSxLQUFJLEVBQUUsS0FBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBNUMsQ0FBNEMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFDSCxlQUFDO0FBQUQsQ0F6V0EsQUF5V0MsSUFBQTs7QUF4V1c7SUFBVCxRQUFROzs7d0NBQXlEO0FBQ3hEO0lBQVQsUUFBUTs7OzBDQUE2RDtBQUM1RDtJQUFULFFBQVE7Ozt3Q0FBeUQ7QUFDeEQ7SUFBVCxRQUFROzs7eUNBQStEO0FBRTVEO0lBQVgsVUFBVTs7MENBQXNCO0FBQ3JCO0lBQVgsVUFBVTs7dUNBQWU7QUFDZDtJQUFYLFVBQVU7OzBDQUFjO0FBQ2I7SUFBWCxVQUFVOzt3Q0FBZ0I7QUFDakI7SUFBVCxRQUFROzs7cUNBRVI7QUFDUztJQUFULFFBQVE7OztvQ0FFUjtBQTBGUztJQUFULFFBQVE7OzsrQ0FFUjtBQTBQTztJQUFQLE1BQU07Ozs7NkNBR047QUFHSDtJQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxjQUFjLENBQUMsQ0FBQztBQUNwRCxDQUFDIiwiZmlsZSI6InRyZWUtbm9kZS5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBvYnNlcnZhYmxlLCBjb21wdXRlZCwgYXV0b3J1biwgYWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBUcmVlTW9kZWwgfSBmcm9tICcuL3RyZWUubW9kZWwnO1xuaW1wb3J0IHsgVHJlZU9wdGlvbnMgfSBmcm9tICcuL3RyZWUtb3B0aW9ucy5tb2RlbCc7XG5pbXBvcnQgeyBJVHJlZU5vZGUgfSBmcm9tICcuLi9kZWZzL2FwaSc7XG5pbXBvcnQgeyBUUkVFX0VWRU5UUyB9IGZyb20gJy4uL2NvbnN0YW50cy9ldmVudHMnO1xuXG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5jb25zdCB7IGZpcnN0LCBsYXN0IH0gPSBfO1xuXG5leHBvcnQgY2xhc3MgVHJlZU5vZGUgaW1wbGVtZW50cyBJVHJlZU5vZGUge1xuICBAY29tcHV0ZWQgZ2V0IGlzSGlkZGVuKCkgeyByZXR1cm4gdGhpcy50cmVlTW9kZWwuaXNIaWRkZW4odGhpcyk7IH07XG4gIEBjb21wdXRlZCBnZXQgaXNFeHBhbmRlZCgpIHsgcmV0dXJuIHRoaXMudHJlZU1vZGVsLmlzRXhwYW5kZWQodGhpcyk7IH07XG4gIEBjb21wdXRlZCBnZXQgaXNBY3RpdmUoKSB7IHJldHVybiB0aGlzLnRyZWVNb2RlbC5pc0FjdGl2ZSh0aGlzKTsgfTtcbiAgQGNvbXB1dGVkIGdldCBpc0ZvY3VzZWQoKSB7IHJldHVybiB0aGlzLnRyZWVNb2RlbC5pc05vZGVGb2N1c2VkKHRoaXMpOyB9O1xuXG4gIEBvYnNlcnZhYmxlIGNoaWxkcmVuOiBUcmVlTm9kZVtdO1xuICBAb2JzZXJ2YWJsZSBpbmRleDogbnVtYmVyO1xuICBAb2JzZXJ2YWJsZSBwb3NpdGlvbiA9IDA7XG4gIEBvYnNlcnZhYmxlIGhlaWdodDogbnVtYmVyO1xuICBAY29tcHV0ZWQgZ2V0IGxldmVsKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQubGV2ZWwgKyAxIDogMDtcbiAgfVxuICBAY29tcHV0ZWQgZ2V0IHBhdGgoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLnBhcmVudCA/IFsuLi50aGlzLnBhcmVudC5wYXRoLCB0aGlzLmlkXSA6IFtdO1xuICB9XG5cbiAgZ2V0IGVsZW1lbnRSZWYoKTogYW55IHtcbiAgICB0aHJvdyBgRWxlbWVudCBSZWYgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCBzaW5jZSBpbnRyb2R1Y2luZyB2aXJ0dWFsIHNjcm9sbFxcblxuICAgICAgWW91IG1heSB1c2UgYSB0ZW1wbGF0ZSB0byBvYnRhaW4gYSByZWZlcmVuY2UgdG8gdGhlIGVsZW1lbnRgO1xuICB9XG5cbiAgcHJpdmF0ZSBfb3JpZ2luYWxOb2RlOiBhbnk7XG4gIHByaXZhdGUgX2lzRm9sZGVyID0gZmFsc2U7XG4gIC8vIE9QRU4gQ09OVEVYVCBGTEFHXG4gIHByaXZhdGUgX29wZW5Db250ZXh0ID0gZmFsc2U7XG4gIGdldCBvcGVuQ29udGV4dCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fb3BlbkNvbnRleHQ7XG4gIH1cbiAgc2V0IG9wZW5Db250ZXh0KHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fb3BlbkNvbnRleHQgPSB2YWx1ZTtcbiAgfVxuICBnZXQgb3JpZ2luYWxOb2RlKCkgeyByZXR1cm4gdGhpcy5fb3JpZ2luYWxOb2RlOyB9O1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBkYXRhOiBhbnksIHB1YmxpYyBwYXJlbnQ6IFRyZWVOb2RlLCBwdWJsaWMgdHJlZU1vZGVsOiBUcmVlTW9kZWwsIGluZGV4OiBudW1iZXIpIHtcbiAgICBpZiAodGhpcy5pZCA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuaWQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuaWQgPSB1dWlkKCk7XG4gICAgfSAvLyBNYWtlIHN1cmUgdGhlcmUncyBhIHVuaXF1ZSBpZCB3aXRob3V0IG92ZXJyaWRpbmcgZXhpc3RpbmcgaWRzIHRvIHdvcmsgd2l0aCBpbW11dGFibGUgZGF0YSBzdHJ1Y3R1cmVzXG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuXG4gICAgaWYgKHRoaXMuZ2V0RmllbGQoJ2NoaWxkcmVuJykpIHtcbiAgICAgIHRoaXMuX2luaXRDaGlsZHJlbigpO1xuICAgIH1cbiAgICAvLyBDSEVDSyBmb3IgdGFnIGluIGRhdGFcbiAgICBpZiAodGhpcy5kYXRhWydmb2xkZXInXSkge1xuICAgICAgdGhpcy5faXNGb2xkZXIgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIGhlbHBlciBnZXQgZnVuY3Rpb25zOlxuICBnZXQgaGFzQ2hpbGRyZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKHRoaXMuZGF0YS5oYXNDaGlsZHJlbiB8fCAodGhpcy5jaGlsZHJlbiAmJiB0aGlzLmNoaWxkcmVuLmxlbmd0aCA+IDApKTtcbiAgfVxuICBnZXQgaXNDb2xsYXBzZWQoKTogYm9vbGVhbiB7IHJldHVybiAhdGhpcy5pc0V4cGFuZGVkOyB9XG4gIGdldCBpc0xlYWYoKTogYm9vbGVhbiB7IHJldHVybiAhdGhpcy5oYXNDaGlsZHJlbjsgfVxuICBnZXQgaXNSb290KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5wYXJlbnQuZGF0YS52aXJ0dWFsOyB9XG4gIGdldCByZWFsUGFyZW50KCk6IFRyZWVOb2RlIHsgcmV0dXJuIHRoaXMuaXNSb290ID8gbnVsbCA6IHRoaXMucGFyZW50OyB9XG5cbiAgLy8gcHJveHkgZnVuY3Rpb25zOlxuICBnZXQgb3B0aW9ucygpOiBUcmVlT3B0aW9ucyB7IHJldHVybiB0aGlzLnRyZWVNb2RlbC5vcHRpb25zOyB9XG4gIGZpcmVFdmVudChldmVudCkgeyB0aGlzLnRyZWVNb2RlbC5maXJlRXZlbnQoZXZlbnQpOyB9XG5cbiAgLy8gZmllbGQgYWNjZXNzb3JzOlxuICBnZXQgZGlzcGxheUZpZWxkKCkge1xuICAgIHJldHVybiB0aGlzLmdldEZpZWxkKCdkaXNwbGF5Jyk7XG4gIH1cblxuICBnZXQgaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RmllbGQoJ2lkJyk7XG4gIH1cbiAgZ2V0IGlzRm9sZGVyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0ZvbGRlciB8fCB0aGlzLmhhc0NoaWxkcmVuO1xuICB9XG5cbiAgc2V0IGlkKHZhbHVlKSB7XG4gICAgdGhpcy5zZXRGaWVsZCgnaWQnLCB2YWx1ZSk7XG4gIH1cblxuICBnZXRGaWVsZChrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhW3RoaXMub3B0aW9uc1tgJHtrZXl9RmllbGRgXV07XG4gIH1cblxuICBzZXRGaWVsZChrZXksIHZhbHVlKSB7XG4gICAgdGhpcy5kYXRhW3RoaXMub3B0aW9uc1tgJHtrZXl9RmllbGRgXV0gPSB2YWx1ZTtcbiAgfVxuXG4gIC8vIHRyYXZlcnNpbmc6XG4gIF9maW5kQWRqYWNlbnRTaWJsaW5nKHN0ZXBzLCBza2lwSGlkZGVuID0gZmFsc2UpIHtcbiAgICBjb25zdCBzaWJsaW5ncyA9IHRoaXMuX2dldFBhcmVudHNDaGlsZHJlbihza2lwSGlkZGVuKTtcblxuICAgIHJldHVybiBzaWJsaW5ncy5sZW5ndGggPiB0aGlzLmluZGV4ICsgc3RlcHMgPyBzaWJsaW5nc1t0aGlzLmluZGV4ICsgc3RlcHNdIDogbnVsbDtcbiAgfVxuXG4gIGZpbmROZXh0U2libGluZyhza2lwSGlkZGVuID0gZmFsc2UpIHtcbiAgICByZXR1cm4gdGhpcy5fZmluZEFkamFjZW50U2libGluZygrMSwgc2tpcEhpZGRlbik7XG4gIH1cblxuICBmaW5kUHJldmlvdXNTaWJsaW5nKHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIHJldHVybiB0aGlzLl9maW5kQWRqYWNlbnRTaWJsaW5nKC0xLCBza2lwSGlkZGVuKTtcbiAgfVxuXG4gIGdldFZpc2libGVDaGlsZHJlbigpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpYmxlQ2hpbGRyZW47XG4gIH1cblxuICBAY29tcHV0ZWQgZ2V0IHZpc2libGVDaGlsZHJlbigpIHtcbiAgICByZXR1cm4gKHRoaXMuY2hpbGRyZW4gfHwgW10pLmZpbHRlcigobm9kZSkgPT4gIW5vZGUuaXNIaWRkZW4pO1xuICB9XG5cbiAgZ2V0Rmlyc3RDaGlsZChza2lwSGlkZGVuID0gZmFsc2UpIHtcbiAgICBsZXQgY2hpbGRyZW4gPSBza2lwSGlkZGVuID8gdGhpcy52aXNpYmxlQ2hpbGRyZW4gOiB0aGlzLmNoaWxkcmVuO1xuXG4gICAgcmV0dXJuIGZpcnN0KGNoaWxkcmVuIHx8IFtdKTtcbiAgfVxuXG4gIGdldExhc3RDaGlsZChza2lwSGlkZGVuID0gZmFsc2UpIHtcbiAgICBsZXQgY2hpbGRyZW4gPSBza2lwSGlkZGVuID8gdGhpcy52aXNpYmxlQ2hpbGRyZW4gOiB0aGlzLmNoaWxkcmVuO1xuXG4gICAgcmV0dXJuIGxhc3QoY2hpbGRyZW4gfHwgW10pO1xuICB9XG5cbiAgZmluZE5leHROb2RlKGdvSW5zaWRlID0gdHJ1ZSwgc2tpcEhpZGRlbiA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIGdvSW5zaWRlICYmIHRoaXMuaXNFeHBhbmRlZCAmJiB0aGlzLmdldEZpcnN0Q2hpbGQoc2tpcEhpZGRlbikgfHxcbiAgICAgICAgICAgdGhpcy5maW5kTmV4dFNpYmxpbmcoc2tpcEhpZGRlbikgfHxcbiAgICAgICAgICAgdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQuZmluZE5leHROb2RlKGZhbHNlLCBza2lwSGlkZGVuKTtcbiAgfVxuXG4gIGZpbmRQcmV2aW91c05vZGUoc2tpcEhpZGRlbiA9IGZhbHNlKSB7XG4gICAgbGV0IHByZXZpb3VzU2libGluZyA9IHRoaXMuZmluZFByZXZpb3VzU2libGluZyhza2lwSGlkZGVuKTtcbiAgICBpZiAoIXByZXZpb3VzU2libGluZykge1xuICAgICAgcmV0dXJuIHRoaXMucmVhbFBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIHByZXZpb3VzU2libGluZy5fZ2V0TGFzdE9wZW5EZXNjZW5kYW50KHNraXBIaWRkZW4pO1xuICB9XG5cbiAgX2dldExhc3RPcGVuRGVzY2VuZGFudChza2lwSGlkZGVuID0gZmFsc2UpIHtcbiAgICBjb25zdCBsYXN0Q2hpbGQgPSB0aGlzLmdldExhc3RDaGlsZChza2lwSGlkZGVuKTtcbiAgICByZXR1cm4gKHRoaXMuaXNDb2xsYXBzZWQgfHwgIWxhc3RDaGlsZClcbiAgICAgID8gdGhpc1xuICAgICAgOiBsYXN0Q2hpbGQuX2dldExhc3RPcGVuRGVzY2VuZGFudChza2lwSGlkZGVuKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFBhcmVudHNDaGlsZHJlbihza2lwSGlkZGVuID0gZmFsc2UpOiBhbnlbXSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnBhcmVudCAmJlxuICAgICAgKHNraXBIaWRkZW4gPyB0aGlzLnBhcmVudC5nZXRWaXNpYmxlQ2hpbGRyZW4oKSA6IHRoaXMucGFyZW50LmNoaWxkcmVuKTtcblxuICAgIHJldHVybiBjaGlsZHJlbiB8fCBbXTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0SW5kZXhJblBhcmVudChza2lwSGlkZGVuID0gZmFsc2UpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0UGFyZW50c0NoaWxkcmVuKHNraXBIaWRkZW4pLmluZGV4T2YodGhpcyk7XG4gIH1cblxuICBpc0Rlc2NlbmRhbnRPZihub2RlOiBUcmVlTm9kZSkge1xuICAgIGlmICh0aGlzID09PSBub2RlKSByZXR1cm4gdHJ1ZTtcbiAgICBlbHNlIHJldHVybiB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5pc0Rlc2NlbmRhbnRPZihub2RlKTtcbiAgfVxuXG4gIGdldE5vZGVQYWRkaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5sZXZlbFBhZGRpbmcgKiAodGhpcy5sZXZlbCAtIDEpICsgJ3B4JztcbiAgfVxuXG4gIGdldENsYXNzKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFt0aGlzLm9wdGlvbnMubm9kZUNsYXNzKHRoaXMpLCBgdHJlZS1ub2RlLWxldmVsLSR7IHRoaXMubGV2ZWwgfWBdLmpvaW4oJyAnKTtcbiAgfVxuXG4gIG9uRHJvcCgkZXZlbnQpIHtcbiAgICB0aGlzLm1vdXNlQWN0aW9uKCdkcm9wJywgJGV2ZW50LmV2ZW50LCB7XG4gICAgICBmcm9tOiAkZXZlbnQuZWxlbWVudCxcbiAgICAgIHRvOiB7IHBhcmVudDogdGhpcywgaW5kZXg6IDAsIGRyb3BPbk5vZGU6IHRydWUgfVxuICAgIH0pO1xuICB9XG5cbiAgYWxsb3dEcm9wID0gKGVsZW1lbnQsICRldmVudD8pID0+IHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnJlYWRPbmx5KSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5hbGxvd0Ryb3AoZWxlbWVudCwgeyBwYXJlbnQ6IHRoaXMsIGluZGV4OiAwIH0sICRldmVudCk7XG4gIH1cblxuICBhbGxvd0RyYWcoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5hbGxvd0RyYWcodGhpcyk7XG4gIH1cblxuXG4gIC8vIGhlbHBlciBtZXRob2RzOlxuICBsb2FkTm9kZUNoaWxkcmVuKCkge1xuICAgIGlmICghdGhpcy5vcHRpb25zLmdldENoaWxkcmVuKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7IC8vIE5vdCBnZXRDaGlsZHJlbiBtZXRob2QgLSBmb3IgdXNpbmcgcmVkdXhcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLm9wdGlvbnMuZ2V0Q2hpbGRyZW4odGhpcykpXG4gICAgICAudGhlbigoY2hpbGRyZW4pID0+IHtcbiAgICAgICAgaWYgKGNoaWxkcmVuKSB7XG4gICAgICAgICAgdGhpcy5zZXRGaWVsZCgnY2hpbGRyZW4nLCBjaGlsZHJlbik7XG4gICAgICAgICAgdGhpcy5faW5pdENoaWxkcmVuKCk7XG4gICAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAgICAgaWYgKGNoaWxkLmdldEZpZWxkKCdpc0V4cGFuZGVkJykgJiYgY2hpbGQuaGFzQ2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgY2hpbGQuZXhwYW5kKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICB9fSkudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuZmlyZUV2ZW50KHtcbiAgICAgICAgICBldmVudE5hbWU6IFRSRUVfRVZFTlRTLmxvYWROb2RlQ2hpbGRyZW4sXG4gICAgICAgICAgbm9kZTogdGhpc1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kKCkge1xuICAgIGlmICghdGhpcy5pc0V4cGFuZGVkKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2dnbGVFeHBhbmRlZCgpO1xuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIGNvbGxhcHNlKCkge1xuICAgIGlmICh0aGlzLmlzRXhwYW5kZWQpIHtcbiAgICAgIHRoaXMudG9nZ2xlRXhwYW5kZWQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRvRm9yQWxsKGZuOiAobm9kZTogSVRyZWVOb2RlKSA9PiBhbnkpIHtcbiAgICBQcm9taXNlLnJlc29sdmUoZm4odGhpcykpLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuY2hpbGRyZW4pIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4gY2hpbGQuZG9Gb3JBbGwoZm4pKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZEFsbCgpIHtcbiAgICB0aGlzLmRvRm9yQWxsKChub2RlKSA9PiBub2RlLmV4cGFuZCgpKTtcbiAgfVxuXG4gIGNvbGxhcHNlQWxsKCkge1xuICAgIHRoaXMuZG9Gb3JBbGwoKG5vZGUpID0+IG5vZGUuY29sbGFwc2UoKSk7XG4gIH1cblxuICBlbnN1cmVWaXNpYmxlKCkge1xuICAgIGlmICh0aGlzLnJlYWxQYXJlbnQpIHtcbiAgICAgIHRoaXMucmVhbFBhcmVudC5leHBhbmQoKTtcbiAgICAgIHRoaXMucmVhbFBhcmVudC5lbnN1cmVWaXNpYmxlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0b2dnbGVFeHBhbmRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5zZXRJc0V4cGFuZGVkKCF0aGlzLmlzRXhwYW5kZWQpO1xuICB9XG5cbiAgc2V0SXNFeHBhbmRlZCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLmhhc0NoaWxkcmVuKSB7XG4gICAgICB0aGlzLnRyZWVNb2RlbC5zZXRFeHBhbmRlZE5vZGUodGhpcywgdmFsdWUpO1xuXG4gICAgICBpZiAoIXRoaXMuY2hpbGRyZW4gJiYgdGhpcy5oYXNDaGlsZHJlbiAmJiB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2FkTm9kZUNoaWxkcmVuKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9O1xuXG4gIHNldElzQWN0aXZlKHZhbHVlLCBtdWx0aSA9IGZhbHNlKSB7XG4gICAgdGhpcy50cmVlTW9kZWwuc2V0QWN0aXZlTm9kZSh0aGlzLCB2YWx1ZSwgbXVsdGkpO1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdGhpcy5mb2N1cyh0aGlzLm9wdGlvbnMuc2Nyb2xsT25TZWxlY3QpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdG9nZ2xlQWN0aXZhdGVkKG11bHRpID0gZmFsc2UpIHtcbiAgICB0aGlzLnNldElzQWN0aXZlKCF0aGlzLmlzQWN0aXZlLCBtdWx0aSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEFjdGl2ZUFuZFZpc2libGUobXVsdGkgPSBmYWxzZSkge1xuICAgIHRoaXMuc2V0SXNBY3RpdmUodHJ1ZSwgbXVsdGkpXG4gICAgICAuZW5zdXJlVmlzaWJsZSgpO1xuXG4gICAgc2V0VGltZW91dCh0aGlzLnNjcm9sbEludG9WaWV3LmJpbmQodGhpcykpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzY3JvbGxJbnRvVmlldyhmb3JjZSA9IGZhbHNlKSB7XG4gICAgdGhpcy50cmVlTW9kZWwudmlydHVhbFNjcm9sbC5zY3JvbGxJbnRvVmlldyh0aGlzLCBmb3JjZSk7XG4gIH1cblxuICBmb2N1cyhzY3JvbGwgPSB0cnVlKSB7XG4gICAgbGV0IHByZXZpb3VzTm9kZSA9IHRoaXMudHJlZU1vZGVsLmdldEZvY3VzZWROb2RlKCk7XG4gICAgdGhpcy50cmVlTW9kZWwuc2V0Rm9jdXNlZE5vZGUodGhpcyk7XG4gICAgaWYgKHNjcm9sbCkge1xuICAgICAgdGhpcy5zY3JvbGxJbnRvVmlldygpO1xuICAgIH1cbiAgICBpZiAocHJldmlvdXNOb2RlKSB7XG4gICAgICB0aGlzLmZpcmVFdmVudCh7IGV2ZW50TmFtZTogVFJFRV9FVkVOVFMuYmx1ciwgbm9kZTogcHJldmlvdXNOb2RlIH0pO1xuICAgIH1cbiAgICB0aGlzLmZpcmVFdmVudCh7IGV2ZW50TmFtZTogVFJFRV9FVkVOVFMuZm9jdXMsIG5vZGU6IHRoaXMgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGJsdXIoKSB7XG4gICAgbGV0IHByZXZpb3VzTm9kZSA9IHRoaXMudHJlZU1vZGVsLmdldEZvY3VzZWROb2RlKCk7XG4gICAgdGhpcy50cmVlTW9kZWwuc2V0Rm9jdXNlZE5vZGUobnVsbCk7XG4gICAgaWYgKHByZXZpb3VzTm9kZSkge1xuICAgICAgdGhpcy5maXJlRXZlbnQoeyBldmVudE5hbWU6IFRSRUVfRVZFTlRTLmJsdXIsIG5vZGU6IHRoaXMgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRJc0hpZGRlbih2YWx1ZSkge1xuICAgIHRoaXMudHJlZU1vZGVsLnNldElzSGlkZGVuKHRoaXMsIHZhbHVlKTtcbiAgfVxuXG4gIGhpZGUoKSB7XG4gICAgdGhpcy5zZXRJc0hpZGRlbih0cnVlKTtcbiAgfVxuXG4gIHNob3coKSB7XG4gICAgdGhpcy5zZXRJc0hpZGRlbihmYWxzZSk7XG4gIH1cblxuICBtb3VzZUFjdGlvbihhY3Rpb25OYW1lOiBzdHJpbmcsICRldmVudCwgZGF0YTogYW55ID0gbnVsbCkge1xuICAgIHRoaXMudHJlZU1vZGVsLnNldEZvY3VzKHRydWUpO1xuXG4gICAgY29uc3QgYWN0aW9uTWFwcGluZyA9IHRoaXMub3B0aW9ucy5hY3Rpb25NYXBwaW5nLm1vdXNlO1xuICAgIGNvbnN0IGFjdGlvbiA9IGFjdGlvbk1hcHBpbmdbYWN0aW9uTmFtZV07XG5cbiAgICBpZiAoYWN0aW9uKSB7XG4gICAgICBhY3Rpb24odGhpcy50cmVlTW9kZWwsIHRoaXMsICRldmVudCwgZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0U2VsZkhlaWdodCgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLm5vZGVIZWlnaHQodGhpcyk7XG4gIH1cbiAgICAvLyBUT0dHTEUgQ09OVEVYVFxuICAgIHRvZ2dsZUNvbnRleHQoJGV2ZW50KSB7XG4gICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmICh0aGlzLnRyZWVNb2RlbC5jb250ZXh0TWVudU5vZGUgJiYgKHRoaXMudHJlZU1vZGVsLmNvbnRleHRNZW51Tm9kZS5pZCAhPT0gdGhpcy5pZCkpIHtcbiAgICAgICAgdGhpcy50cmVlTW9kZWwuY29udGV4dE1lbnVOb2RlLm9wZW5Db250ZXh0ID0gZmFsc2U7XG4gICAgICB9XG4gICAgICB0aGlzLnRyZWVNb2RlbC5jb250ZXh0TWVudU5vZGUgPSB0aGlzO1xuICAgICAgdGhpcy5fb3BlbkNvbnRleHQgPSAhdGhpcy5fb3BlbkNvbnRleHQ7XG4gICAgICAvLyByZXNldCBjb250ZXh0IG9mIHByZXZpb3VzLCBzaG93IHRoaXMgY29udGV4dFxuICAgIH1cbiAgICAvLyBSRU5BTUVcbiAgICByZW5hbWUobmV3TmFtZTogc3RyaW5nKSB7XG4gICAgICB0aGlzLmRhdGEubmFtZSA9IG5ld05hbWU7XG4gICAgICB0aGlzLmZpcmVFdmVudCh7IGV2ZW50TmFtZTogVFJFRV9FVkVOVFMudXBkYXRlRGF0YSwgbm9kZTogdGhpcyB9KTtcbiAgICB9XG5cbiAgQGFjdGlvbiBfaW5pdENoaWxkcmVuKCkge1xuICAgIHRoaXMuY2hpbGRyZW4gPSB0aGlzLmdldEZpZWxkKCdjaGlsZHJlbicpXG4gICAgICAubWFwKChjLCBpbmRleCkgPT4gbmV3IFRyZWVOb2RlKGMsIHRoaXMsIHRoaXMudHJlZU1vZGVsLCBpbmRleCkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHV1aWQoKSB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwMDAwMDAwMCk7XG59XG4iXX0=