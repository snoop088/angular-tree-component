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
        this._isLoc = false;
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
        // Used to set if a folder containes localised items
        if (this.data['isloc']) {
            this._isLoc = true;
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
    Object.defineProperty(TreeNode.prototype, "isLoc", {
        get: function () {
            return this._isLoc;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9tb2RlbHMvdHJlZS1ub2RlLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFXLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUk3RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFbEQsT0FBTyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUM7QUFDcEIsSUFBQSxlQUFLLEVBQUUsYUFBSSxDQUFPO0FBRTFCO0lBbUNFLGtCQUFtQixJQUFTLEVBQVMsTUFBZ0IsRUFBUyxTQUFvQixFQUFFLEtBQWE7UUFBakcsaUJBaUJDO1FBakJrQixTQUFJLEdBQUosSUFBSSxDQUFLO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBVTtRQUFTLGNBQVMsR0FBVCxTQUFTLENBQVc7UUEzQnRFLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFlakIsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUNsQixXQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLG9CQUFvQjtRQUNaLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBMko3QixjQUFTLEdBQUcsVUFBQyxPQUFPLEVBQUUsTUFBTztZQUMzQixFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztnQkFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxLQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM3RSxDQUFDLENBQUE7UUFwSkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFB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O0lBQ0QsU0FBUztJQUNULHlCQUFNLEdBQU4sVUFBTyxPQUFlO1FBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUN6QixJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVLLGdDQUFhLEdBQWI7UUFBUixpQkFHQztRQUZDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7YUFDdEMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxFQUFFLEtBQUssSUFBSyxPQUFBLElBQUksUUFBUSxDQUFDLENBQUMsRUFBRSxLQUFJLEVBQUUsS0FBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBNUMsQ0FBNEMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFDSCxlQUFDO0FBQUQsQ0FqWEEsQUFpWEMsSUFBQTs7QUFoWFc7SUFBVCxRQUFROzs7d0NBQXlEO0FBQ3hEO0lBQVQsUUFBUTs7OzBDQUE2RDtBQUM1RDtJQUFULFFBQVE7Ozt3Q0FBeUQ7QUFDeEQ7SUFBVCxRQUFROzs7eUNBQStEO0FBRTVEO0lBQVgsVUFBVTs7MENBQXNCO0FBQ3JCO0lBQVgsVUFBVTs7dUNBQWU7QUFDZDtJQUFYLFVBQVU7OzBDQUFjO0FBQ2I7SUFBWCxVQUFVOzt3Q0FBZ0I7QUFDakI7SUFBVCxRQUFROzs7cUNBRVI7QUFDUztJQUFULFFBQVE7OztvQ0FFUjtBQWtHUztJQUFULFFBQVE7OzsrQ0FFUjtBQTBQTztJQUFQLE1BQU07Ozs7NkNBR047QUFHSDtJQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxjQUFjLENBQUMsQ0FBQztBQUNwRCxDQUFDIiwiZmlsZSI6InRyZWUtbm9kZS5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBvYnNlcnZhYmxlLCBjb21wdXRlZCwgYXV0b3J1biwgYWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBUcmVlTW9kZWwgfSBmcm9tICcuL3RyZWUubW9kZWwnO1xuaW1wb3J0IHsgVHJlZU9wdGlvbnMgfSBmcm9tICcuL3RyZWUtb3B0aW9ucy5tb2RlbCc7XG5pbXBvcnQgeyBJVHJlZU5vZGUgfSBmcm9tICcuLi9kZWZzL2FwaSc7XG5pbXBvcnQgeyBUUkVFX0VWRU5UUyB9IGZyb20gJy4uL2NvbnN0YW50cy9ldmVudHMnO1xuXG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5jb25zdCB7IGZpcnN0LCBsYXN0IH0gPSBfO1xuXG5leHBvcnQgY2xhc3MgVHJlZU5vZGUgaW1wbGVtZW50cyBJVHJlZU5vZGUge1xuICBAY29tcHV0ZWQgZ2V0IGlzSGlkZGVuKCkgeyByZXR1cm4gdGhpcy50cmVlTW9kZWwuaXNIaWRkZW4odGhpcyk7IH07XG4gIEBjb21wdXRlZCBnZXQgaXNFeHBhbmRlZCgpIHsgcmV0dXJuIHRoaXMudHJlZU1vZGVsLmlzRXhwYW5kZWQodGhpcyk7IH07XG4gIEBjb21wdXRlZCBnZXQgaXNBY3RpdmUoKSB7IHJldHVybiB0aGlzLnRyZWVNb2RlbC5pc0FjdGl2ZSh0aGlzKTsgfTtcbiAgQGNvbXB1dGVkIGdldCBpc0ZvY3VzZWQoKSB7IHJldHVybiB0aGlzLnRyZWVNb2RlbC5pc05vZGVGb2N1c2VkKHRoaXMpOyB9O1xuXG4gIEBvYnNlcnZhYmxlIGNoaWxkcmVuOiBUcmVlTm9kZVtdO1xuICBAb2JzZXJ2YWJsZSBpbmRleDogbnVtYmVyO1xuICBAb2JzZXJ2YWJsZSBwb3NpdGlvbiA9IDA7XG4gIEBvYnNlcnZhYmxlIGhlaWdodDogbnVtYmVyO1xuICBAY29tcHV0ZWQgZ2V0IGxldmVsKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQubGV2ZWwgKyAxIDogMDtcbiAgfVxuICBAY29tcHV0ZWQgZ2V0IHBhdGgoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLnBhcmVudCA/IFsuLi50aGlzLnBhcmVudC5wYXRoLCB0aGlzLmlkXSA6IFtdO1xuICB9XG5cbiAgZ2V0IGVsZW1lbnRSZWYoKTogYW55IHtcbiAgICB0aHJvdyBgRWxlbWVudCBSZWYgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCBzaW5jZSBpbnRyb2R1Y2luZyB2aXJ0dWFsIHNjcm9sbFxcblxuICAgICAgWW91IG1heSB1c2UgYSB0ZW1wbGF0ZSB0byBvYnRhaW4gYSByZWZlcmVuY2UgdG8gdGhlIGVsZW1lbnRgO1xuICB9XG5cbiAgcHJpdmF0ZSBfb3JpZ2luYWxOb2RlOiBhbnk7XG4gIHByaXZhdGUgX2lzRm9sZGVyID0gZmFsc2U7XG4gIHByaXZhdGUgX2lzTG9jID0gZmFsc2U7XG4gIC8vIE9QRU4gQ09OVEVYVCBGTEFHXG4gIHByaXZhdGUgX29wZW5Db250ZXh0ID0gZmFsc2U7XG4gIGdldCBvcGVuQ29udGV4dCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fb3BlbkNvbnRleHQ7XG4gIH1cbiAgc2V0IG9wZW5Db250ZXh0KHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fb3BlbkNvbnRleHQgPSB2YWx1ZTtcbiAgfVxuICBnZXQgb3JpZ2luYWxOb2RlKCkgeyByZXR1cm4gdGhpcy5fb3JpZ2luYWxOb2RlOyB9O1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBkYXRhOiBhbnksIHB1YmxpYyBwYXJlbnQ6IFRyZWVOb2RlLCBwdWJsaWMgdHJlZU1vZGVsOiBUcmVlTW9kZWwsIGluZGV4OiBudW1iZXIpIHtcbiAgICBpZiAodGhpcy5pZCA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuaWQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuaWQgPSB1dWlkKCk7XG4gICAgfSAvLyBNYWtlIHN1cmUgdGhlcmUncyBhIHVuaXF1ZSBpZCB3aXRob3V0IG92ZXJyaWRpbmcgZXhpc3RpbmcgaWRzIHRvIHdvcmsgd2l0aCBpbW11dGFibGUgZGF0YSBzdHJ1Y3R1cmVzXG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuXG4gICAgaWYgKHRoaXMuZ2V0RmllbGQoJ2NoaWxkcmVuJykpIHtcbiAgICAgIHRoaXMuX2luaXRDaGlsZHJlbigpO1xuICAgIH1cbiAgICAvLyBDSEVDSyBmb3IgdGFnIGluIGRhdGFcbiAgICBpZiAodGhpcy5kYXRhWydmb2xkZXInXSkge1xuICAgICAgdGhpcy5faXNGb2xkZXIgPSB0cnVlO1xuICAgIH1cbiAgICAvLyBVc2VkIHRvIHNldCBpZiBhIGZvbGRlciBjb250YWluZXMgbG9jYWxpc2VkIGl0ZW1zXG4gICAgaWYgKHRoaXMuZGF0YVsnaXNsb2MnXSkge1xuICAgICAgdGhpcy5faXNMb2MgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIGhlbHBlciBnZXQgZnVuY3Rpb25zOlxuICBnZXQgaGFzQ2hpbGRyZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKHRoaXMuZGF0YS5oYXNDaGlsZHJlbiB8fCAodGhpcy5jaGlsZHJlbiAmJiB0aGlzLmNoaWxkcmVuLmxlbmd0aCA+IDApKTtcbiAgfVxuICBnZXQgaXNDb2xsYXBzZWQoKTogYm9vbGVhbiB7IHJldHVybiAhdGhpcy5pc0V4cGFuZGVkOyB9XG4gIGdldCBpc0xlYWYoKTogYm9vbGVhbiB7IHJldHVybiAhdGhpcy5oYXNDaGlsZHJlbjsgfVxuICBnZXQgaXNSb290KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5wYXJlbnQuZGF0YS52aXJ0dWFsOyB9XG4gIGdldCByZWFsUGFyZW50KCk6IFRyZWVOb2RlIHsgcmV0dXJuIHRoaXMuaXNSb290ID8gbnVsbCA6IHRoaXMucGFyZW50OyB9XG5cbiAgLy8gcHJveHkgZnVuY3Rpb25zOlxuICBnZXQgb3B0aW9ucygpOiBUcmVlT3B0aW9ucyB7IHJldHVybiB0aGlzLnRyZWVNb2RlbC5vcHRpb25zOyB9XG4gIGZpcmVFdmVudChldmVudCkgeyB0aGlzLnRyZWVNb2RlbC5maXJlRXZlbnQoZXZlbnQpOyB9XG5cbiAgLy8gZmllbGQgYWNjZXNzb3JzOlxuICBnZXQgZGlzcGxheUZpZWxkKCkge1xuICAgIHJldHVybiB0aGlzLmdldEZpZWxkKCdkaXNwbGF5Jyk7XG4gIH1cblxuICBnZXQgaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RmllbGQoJ2lkJyk7XG4gIH1cbiAgZ2V0IGlzRm9sZGVyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0ZvbGRlciB8fCB0aGlzLmhhc0NoaWxkcmVuO1xuICB9XG4gIGdldCBpc0xvYygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNMb2M7XG4gIH1cblxuICBzZXQgaWQodmFsdWUpIHtcbiAgICB0aGlzLnNldEZpZWxkKCdpZCcsIHZhbHVlKTtcbiAgfVxuXG4gIGdldEZpZWxkKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRhdGFbdGhpcy5vcHRpb25zW2Ake2tleX1GaWVsZGBdXTtcbiAgfVxuXG4gIHNldEZpZWxkKGtleSwgdmFsdWUpIHtcbiAgICB0aGlzLmRhdGFbdGhpcy5vcHRpb25zW2Ake2tleX1GaWVsZGBdXSA9IHZhbHVlO1xuICB9XG5cbiAgLy8gdHJhdmVyc2luZzpcbiAgX2ZpbmRBZGphY2VudFNpYmxpbmcoc3RlcHMsIHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IHNpYmxpbmdzID0gdGhpcy5fZ2V0UGFyZW50c0NoaWxkcmVuKHNraXBIaWRkZW4pO1xuXG4gICAgcmV0dXJuIHNpYmxpbmdzLmxlbmd0aCA+IHRoaXMuaW5kZXggKyBzdGVwcyA/IHNpYmxpbmdzW3RoaXMuaW5kZXggKyBzdGVwc10gOiBudWxsO1xuICB9XG5cbiAgZmluZE5leHRTaWJsaW5nKHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIHJldHVybiB0aGlzLl9maW5kQWRqYWNlbnRTaWJsaW5nKCsxLCBza2lwSGlkZGVuKTtcbiAgfVxuXG4gIGZpbmRQcmV2aW91c1NpYmxpbmcoc2tpcEhpZGRlbiA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbmRBZGphY2VudFNpYmxpbmcoLTEsIHNraXBIaWRkZW4pO1xuICB9XG5cbiAgZ2V0VmlzaWJsZUNoaWxkcmVuKCkge1xuICAgIHJldHVybiB0aGlzLnZpc2libGVDaGlsZHJlbjtcbiAgfVxuXG4gIEBjb21wdXRlZCBnZXQgdmlzaWJsZUNoaWxkcmVuKCkge1xuICAgIHJldHVybiAodGhpcy5jaGlsZHJlbiB8fCBbXSkuZmlsdGVyKChub2RlKSA9PiAhbm9kZS5pc0hpZGRlbik7XG4gIH1cblxuICBnZXRGaXJzdENoaWxkKHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIGxldCBjaGlsZHJlbiA9IHNraXBIaWRkZW4gPyB0aGlzLnZpc2libGVDaGlsZHJlbiA6IHRoaXMuY2hpbGRyZW47XG5cbiAgICByZXR1cm4gZmlyc3QoY2hpbGRyZW4gfHwgW10pO1xuICB9XG5cbiAgZ2V0TGFzdENoaWxkKHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIGxldCBjaGlsZHJlbiA9IHNraXBIaWRkZW4gPyB0aGlzLnZpc2libGVDaGlsZHJlbiA6IHRoaXMuY2hpbGRyZW47XG5cbiAgICByZXR1cm4gbGFzdChjaGlsZHJlbiB8fCBbXSk7XG4gIH1cblxuICBmaW5kTmV4dE5vZGUoZ29JbnNpZGUgPSB0cnVlLCBza2lwSGlkZGVuID0gZmFsc2UpIHtcbiAgICByZXR1cm4gZ29JbnNpZGUgJiYgdGhpcy5pc0V4cGFuZGVkICYmIHRoaXMuZ2V0Rmlyc3RDaGlsZChza2lwSGlkZGVuKSB8fFxuICAgICAgICAgICB0aGlzLmZpbmROZXh0U2libGluZyhza2lwSGlkZGVuKSB8fFxuICAgICAgICAgICB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5maW5kTmV4dE5vZGUoZmFsc2UsIHNraXBIaWRkZW4pO1xuICB9XG5cbiAgZmluZFByZXZpb3VzTm9kZShza2lwSGlkZGVuID0gZmFsc2UpIHtcbiAgICBsZXQgcHJldmlvdXNTaWJsaW5nID0gdGhpcy5maW5kUHJldmlvdXNTaWJsaW5nKHNraXBIaWRkZW4pO1xuICAgIGlmICghcHJldmlvdXNTaWJsaW5nKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWFsUGFyZW50O1xuICAgIH1cbiAgICByZXR1cm4gcHJldmlvdXNTaWJsaW5nLl9nZXRMYXN0T3BlbkRlc2NlbmRhbnQoc2tpcEhpZGRlbik7XG4gIH1cblxuICBfZ2V0TGFzdE9wZW5EZXNjZW5kYW50KHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IGxhc3RDaGlsZCA9IHRoaXMuZ2V0TGFzdENoaWxkKHNraXBIaWRkZW4pO1xuICAgIHJldHVybiAodGhpcy5pc0NvbGxhcHNlZCB8fCAhbGFzdENoaWxkKVxuICAgICAgPyB0aGlzXG4gICAgICA6IGxhc3RDaGlsZC5fZ2V0TGFzdE9wZW5EZXNjZW5kYW50KHNraXBIaWRkZW4pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UGFyZW50c0NoaWxkcmVuKHNraXBIaWRkZW4gPSBmYWxzZSk6IGFueVtdIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMucGFyZW50ICYmXG4gICAgICAoc2tpcEhpZGRlbiA/IHRoaXMucGFyZW50LmdldFZpc2libGVDaGlsZHJlbigpIDogdGhpcy5wYXJlbnQuY2hpbGRyZW4pO1xuXG4gICAgcmV0dXJuIGNoaWxkcmVuIHx8IFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRJbmRleEluUGFyZW50KHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRQYXJlbnRzQ2hpbGRyZW4oc2tpcEhpZGRlbikuaW5kZXhPZih0aGlzKTtcbiAgfVxuXG4gIGlzRGVzY2VuZGFudE9mKG5vZGU6IFRyZWVOb2RlKSB7XG4gICAgaWYgKHRoaXMgPT09IG5vZGUpIHJldHVybiB0cnVlO1xuICAgIGVsc2UgcmV0dXJuIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LmlzRGVzY2VuZGFudE9mKG5vZGUpO1xuICB9XG5cbiAgZ2V0Tm9kZVBhZGRpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmxldmVsUGFkZGluZyAqICh0aGlzLmxldmVsIC0gMSkgKyAncHgnO1xuICB9XG5cbiAgZ2V0Q2xhc3MoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gW3RoaXMub3B0aW9ucy5ub2RlQ2xhc3ModGhpcyksIGB0cmVlLW5vZGUtbGV2ZWwtJHsgdGhpcy5sZXZlbCB9YF0uam9pbignICcpO1xuICB9XG5cbiAgb25Ecm9wKCRldmVudCkge1xuICAgIHRoaXMubW91c2VBY3Rpb24oJ2Ryb3AnLCAkZXZlbnQuZXZlbnQsIHtcbiAgICAgIGZyb206ICRldmVudC5lbGVtZW50LFxuICAgICAgdG86IHsgcGFyZW50OiB0aGlzLCBpbmRleDogMCwgZHJvcE9uTm9kZTogdHJ1ZSB9XG4gICAgfSk7XG4gIH1cblxuICBhbGxvd0Ryb3AgPSAoZWxlbWVudCwgJGV2ZW50PykgPT4ge1xuICAgIGlmICh0aGlzLm9wdGlvbnMucmVhZE9ubHkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmFsbG93RHJvcChlbGVtZW50LCB7IHBhcmVudDogdGhpcywgaW5kZXg6IDAgfSwgJGV2ZW50KTtcbiAgfVxuXG4gIGFsbG93RHJhZygpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmFsbG93RHJhZyh0aGlzKTtcbiAgfVxuXG5cbiAgLy8gaGVscGVyIG1ldGhvZHM6XG4gIGxvYWROb2RlQ2hpbGRyZW4oKSB7XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuZ2V0Q2hpbGRyZW4pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTsgLy8gTm90IGdldENoaWxkcmVuIG1ldGhvZCAtIGZvciB1c2luZyByZWR1eFxuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMub3B0aW9ucy5nZXRDaGlsZHJlbih0aGlzKSlcbiAgICAgIC50aGVuKChjaGlsZHJlbikgPT4ge1xuICAgICAgICBpZiAoY2hpbGRyZW4pIHtcbiAgICAgICAgICB0aGlzLnNldEZpZWxkKCdjaGlsZHJlbicsIGNoaWxkcmVuKTtcbiAgICAgICAgICB0aGlzLl9pbml0Q2hpbGRyZW4oKTtcbiAgICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hpbGQuZ2V0RmllbGQoJ2lzRXhwYW5kZWQnKSAmJiBjaGlsZC5oYXNDaGlsZHJlbikge1xuICAgICAgICAgICAgICBjaGlsZC5leHBhbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgIH19KS50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5maXJlRXZlbnQoe1xuICAgICAgICAgIGV2ZW50TmFtZTogVFJFRV9FVkVOVFMubG9hZE5vZGVDaGlsZHJlbixcbiAgICAgICAgICBub2RlOiB0aGlzXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBleHBhbmQoKSB7XG4gICAgaWYgKCF0aGlzLmlzRXhwYW5kZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZUV4cGFuZGVkKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgY29sbGFwc2UoKSB7XG4gICAgaWYgKHRoaXMuaXNFeHBhbmRlZCkge1xuICAgICAgdGhpcy50b2dnbGVFeHBhbmRlZCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZG9Gb3JBbGwoZm46IChub2RlOiBJVHJlZU5vZGUpID0+IGFueSkge1xuICAgIFByb21pc2UucmVzb2x2ZShmbih0aGlzKSkudGhlbigoKSA9PiB7XG4gICAgICBpZiAodGhpcy5jaGlsZHJlbikge1xuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiBjaGlsZC5kb0ZvckFsbChmbikpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kQWxsKCkge1xuICAgIHRoaXMuZG9Gb3JBbGwoKG5vZGUpID0+IG5vZGUuZXhwYW5kKCkpO1xuICB9XG5cbiAgY29sbGFwc2VBbGwoKSB7XG4gICAgdGhpcy5kb0ZvckFsbCgobm9kZSkgPT4gbm9kZS5jb2xsYXBzZSgpKTtcbiAgfVxuXG4gIGVuc3VyZVZpc2libGUoKSB7XG4gICAgaWYgKHRoaXMucmVhbFBhcmVudCkge1xuICAgICAgdGhpcy5yZWFsUGFyZW50LmV4cGFuZCgpO1xuICAgICAgdGhpcy5yZWFsUGFyZW50LmVuc3VyZVZpc2libGUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRvZ2dsZUV4cGFuZGVkKCkge1xuICAgIHJldHVybiB0aGlzLnNldElzRXhwYW5kZWQoIXRoaXMuaXNFeHBhbmRlZCk7XG4gIH1cblxuICBzZXRJc0V4cGFuZGVkKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuaGFzQ2hpbGRyZW4pIHtcbiAgICAgIHRoaXMudHJlZU1vZGVsLnNldEV4cGFuZGVkTm9kZSh0aGlzLCB2YWx1ZSk7XG5cbiAgICAgIGlmICghdGhpcy5jaGlsZHJlbiAmJiB0aGlzLmhhc0NoaWxkcmVuICYmIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvYWROb2RlQ2hpbGRyZW4oKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH07XG5cbiAgc2V0SXNBY3RpdmUodmFsdWUsIG11bHRpID0gZmFsc2UpIHtcbiAgICB0aGlzLnRyZWVNb2RlbC5zZXRBY3RpdmVOb2RlKHRoaXMsIHZhbHVlLCBtdWx0aSk7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLmZvY3VzKHRoaXMub3B0aW9ucy5zY3JvbGxPblNlbGVjdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0b2dnbGVBY3RpdmF0ZWQobXVsdGkgPSBmYWxzZSkge1xuICAgIHRoaXMuc2V0SXNBY3RpdmUoIXRoaXMuaXNBY3RpdmUsIG11bHRpKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0QWN0aXZlQW5kVmlzaWJsZShtdWx0aSA9IGZhbHNlKSB7XG4gICAgdGhpcy5zZXRJc0FjdGl2ZSh0cnVlLCBtdWx0aSlcbiAgICAgIC5lbnN1cmVWaXNpYmxlKCk7XG5cbiAgICBzZXRUaW1lb3V0KHRoaXMuc2Nyb2xsSW50b1ZpZXcuYmluZCh0aGlzKSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNjcm9sbEludG9WaWV3KGZvcmNlID0gZmFsc2UpIHtcbiAgICB0aGlzLnRyZWVNb2RlbC52aXJ0dWFsU2Nyb2xsLnNjcm9sbEludG9WaWV3KHRoaXMsIGZvcmNlKTtcbiAgfVxuXG4gIGZvY3VzKHNjcm9sbCA9IHRydWUpIHtcbiAgICBsZXQgcHJldmlvdXNOb2RlID0gdGhpcy50cmVlTW9kZWwuZ2V0Rm9jdXNlZE5vZGUoKTtcbiAgICB0aGlzLnRyZWVNb2RlbC5zZXRGb2N1c2VkTm9kZSh0aGlzKTtcbiAgICBpZiAoc2Nyb2xsKSB7XG4gICAgICB0aGlzLnNjcm9sbEludG9WaWV3KCk7XG4gICAgfVxuICAgIGlmIChwcmV2aW91c05vZGUpIHtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KHsgZXZlbnROYW1lOiBUUkVFX0VWRU5UUy5ibHVyLCBub2RlOiBwcmV2aW91c05vZGUgfSk7XG4gICAgfVxuICAgIHRoaXMuZmlyZUV2ZW50KHsgZXZlbnROYW1lOiBUUkVFX0VWRU5UUy5mb2N1cywgbm9kZTogdGhpcyB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYmx1cigpIHtcbiAgICBsZXQgcHJldmlvdXNOb2RlID0gdGhpcy50cmVlTW9kZWwuZ2V0Rm9jdXNlZE5vZGUoKTtcbiAgICB0aGlzLnRyZWVNb2RlbC5zZXRGb2N1c2VkTm9kZShudWxsKTtcbiAgICBpZiAocHJldmlvdXNOb2RlKSB7XG4gICAgICB0aGlzLmZpcmVFdmVudCh7IGV2ZW50TmFtZTogVFJFRV9FVkVOVFMuYmx1ciwgbm9kZTogdGhpcyB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldElzSGlkZGVuKHZhbHVlKSB7XG4gICAgdGhpcy50cmVlTW9kZWwuc2V0SXNIaWRkZW4odGhpcywgdmFsdWUpO1xuICB9XG5cbiAgaGlkZSgpIHtcbiAgICB0aGlzLnNldElzSGlkZGVuKHRydWUpO1xuICB9XG5cbiAgc2hvdygpIHtcbiAgICB0aGlzLnNldElzSGlkZGVuKGZhbHNlKTtcbiAgfVxuXG4gIG1vdXNlQWN0aW9uKGFjdGlvbk5hbWU6IHN0cmluZywgJGV2ZW50LCBkYXRhOiBhbnkgPSBudWxsKSB7XG4gICAgdGhpcy50cmVlTW9kZWwuc2V0Rm9jdXModHJ1ZSk7XG5cbiAgICBjb25zdCBhY3Rpb25NYXBwaW5nID0gdGhpcy5vcHRpb25zLmFjdGlvbk1hcHBpbmcubW91c2U7XG4gICAgY29uc3QgYWN0aW9uID0gYWN0aW9uTWFwcGluZ1thY3Rpb25OYW1lXTtcblxuICAgIGlmIChhY3Rpb24pIHtcbiAgICAgIGFjdGlvbih0aGlzLnRyZWVNb2RlbCwgdGhpcywgJGV2ZW50LCBkYXRhKTtcbiAgICB9XG4gIH1cblxuICBnZXRTZWxmSGVpZ2h0KCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMubm9kZUhlaWdodCh0aGlzKTtcbiAgfVxuICAgIC8vIFRPR0dMRSBDT05URVhUXG4gICAgdG9nZ2xlQ29udGV4dCgkZXZlbnQpIHtcbiAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKHRoaXMudHJlZU1vZGVsLmNvbnRleHRNZW51Tm9kZSAmJiAodGhpcy50cmVlTW9kZWwuY29udGV4dE1lbnVOb2RlLmlkICE9PSB0aGlzLmlkKSkge1xuICAgICAgICB0aGlzLnRyZWVNb2RlbC5jb250ZXh0TWVudU5vZGUub3BlbkNvbnRleHQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRoaXMudHJlZU1vZGVsLmNvbnRleHRNZW51Tm9kZSA9IHRoaXM7XG4gICAgICB0aGlzLl9vcGVuQ29udGV4dCA9ICF0aGlzLl9vcGVuQ29udGV4dDtcbiAgICAgIC8vIHJlc2V0IGNvbnRleHQgb2YgcHJldmlvdXMsIHNob3cgdGhpcyBjb250ZXh0XG4gICAgfVxuICAgIC8vIFJFTkFNRVxuICAgIHJlbmFtZShuZXdOYW1lOiBzdHJpbmcpIHtcbiAgICAgIHRoaXMuZGF0YS5uYW1lID0gbmV3TmFtZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KHsgZXZlbnROYW1lOiBUUkVFX0VWRU5UUy51cGRhdGVEYXRhLCBub2RlOiB0aGlzIH0pO1xuICAgIH1cblxuICBAYWN0aW9uIF9pbml0Q2hpbGRyZW4oKSB7XG4gICAgdGhpcy5jaGlsZHJlbiA9IHRoaXMuZ2V0RmllbGQoJ2NoaWxkcmVuJylcbiAgICAgIC5tYXAoKGMsIGluZGV4KSA9PiBuZXcgVHJlZU5vZGUoYywgdGhpcywgdGhpcy50cmVlTW9kZWwsIGluZGV4KSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdXVpZCgpIHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDAwMDAwMDAwKTtcbn1cbiJdfQ==