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
        this._isLocked = false;
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
        this._isLocked = !!this.data['isLocked'];
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
    Object.defineProperty(TreeNode.prototype, "isLocked", {
        get: function () {
            return this._isLocked;
        },
        set: function (value) {
            if (this._isLocked !== value) {
                this.data.isLocked = value;
                this.fireEvent({ eventName: TREE_EVENTS.updateData, node: this });
            }
        },
        enumerable: true,
        configurable: true
    });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9tb2RlbHMvdHJlZS1ub2RlLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFXLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUk3RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFbEQsT0FBTyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUM7QUFDcEIsSUFBQSxlQUFLLEVBQUUsYUFBSSxDQUFPO0FBRTFCO0lBb0NFLGtCQUFtQixJQUFTLEVBQVMsTUFBZ0IsRUFBUyxTQUFvQixFQUFFLEtBQWE7UUFBakcsaUJBa0JDO1FBbEJrQixTQUFJLEdBQUosSUFBSSxDQUFLO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBVTtRQUFTLGNBQVMsR0FBVCxTQUFTLENBQVc7UUE1QnRFLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFlakIsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUNsQixXQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ2YsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUMxQixvQkFBb0I7UUFDWixpQkFBWSxHQUFHLEtBQUssQ0FBQztRQXFLN0IsY0FBUyxHQUFHLFVBQUMsT0FBTyxFQUFFLE1BQU87WUFDM0IsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7Z0JBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUN4QyxNQUFNLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDN0UsQ0FBQyxDQUFBO1FBOUpDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM5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NkQ7QUFDNUQ7SUFBVCxRQUFROzs7d0NBQXlEO0FBQ3hEO0lBQVQsUUFBUTs7O3lDQUErRDtBQUU1RDtJQUFYLFVBQVU7OzBDQUFzQjtBQUNyQjtJQUFYLFVBQVU7O3VDQUFlO0FBQ2Q7SUFBWCxVQUFVOzswQ0FBYztBQUNiO0lBQVgsVUFBVTs7d0NBQWdCO0FBQ2pCO0lBQVQsUUFBUTs7O3FDQUVSO0FBQ1M7SUFBVCxRQUFROzs7b0NBRVI7QUE2R1M7SUFBVCxRQUFROzs7K0NBRVI7QUEwUE87SUFBUCxNQUFNOzs7OzZDQUdOO0FBR0g7SUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsY0FBYyxDQUFDLENBQUM7QUFDcEQsQ0FBQyIsImZpbGUiOiJ0cmVlLW5vZGUubW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgb2JzZXJ2YWJsZSwgY29tcHV0ZWQsIGF1dG9ydW4sIGFjdGlvbiB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHsgVHJlZU1vZGVsIH0gZnJvbSAnLi90cmVlLm1vZGVsJztcbmltcG9ydCB7IFRyZWVPcHRpb25zIH0gZnJvbSAnLi90cmVlLW9wdGlvbnMubW9kZWwnO1xuaW1wb3J0IHsgSVRyZWVOb2RlIH0gZnJvbSAnLi4vZGVmcy9hcGknO1xuaW1wb3J0IHsgVFJFRV9FVkVOVFMgfSBmcm9tICcuLi9jb25zdGFudHMvZXZlbnRzJztcblxuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuY29uc3QgeyBmaXJzdCwgbGFzdCB9ID0gXztcblxuZXhwb3J0IGNsYXNzIFRyZWVOb2RlIGltcGxlbWVudHMgSVRyZWVOb2RlIHtcbiAgQGNvbXB1dGVkIGdldCBpc0hpZGRlbigpIHsgcmV0dXJuIHRoaXMudHJlZU1vZGVsLmlzSGlkZGVuKHRoaXMpOyB9O1xuICBAY29tcHV0ZWQgZ2V0IGlzRXhwYW5kZWQoKSB7IHJldHVybiB0aGlzLnRyZWVNb2RlbC5pc0V4cGFuZGVkKHRoaXMpOyB9O1xuICBAY29tcHV0ZWQgZ2V0IGlzQWN0aXZlKCkgeyByZXR1cm4gdGhpcy50cmVlTW9kZWwuaXNBY3RpdmUodGhpcyk7IH07XG4gIEBjb21wdXRlZCBnZXQgaXNGb2N1c2VkKCkgeyByZXR1cm4gdGhpcy50cmVlTW9kZWwuaXNOb2RlRm9jdXNlZCh0aGlzKTsgfTtcblxuICBAb2JzZXJ2YWJsZSBjaGlsZHJlbjogVHJlZU5vZGVbXTtcbiAgQG9ic2VydmFibGUgaW5kZXg6IG51bWJlcjtcbiAgQG9ic2VydmFibGUgcG9zaXRpb24gPSAwO1xuICBAb2JzZXJ2YWJsZSBoZWlnaHQ6IG51bWJlcjtcbiAgQGNvbXB1dGVkIGdldCBsZXZlbCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LmxldmVsICsgMSA6IDA7XG4gIH1cbiAgQGNvbXB1dGVkIGdldCBwYXRoKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQgPyBbLi4udGhpcy5wYXJlbnQucGF0aCwgdGhpcy5pZF0gOiBbXTtcbiAgfVxuXG4gIGdldCBlbGVtZW50UmVmKCk6IGFueSB7XG4gICAgdGhyb3cgYEVsZW1lbnQgUmVmIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQgc2luY2UgaW50cm9kdWNpbmcgdmlydHVhbCBzY3JvbGxcXG5cbiAgICAgIFlvdSBtYXkgdXNlIGEgdGVtcGxhdGUgdG8gb2J0YWluIGEgcmVmZXJlbmNlIHRvIHRoZSBlbGVtZW50YDtcbiAgfVxuXG4gIHByaXZhdGUgX29yaWdpbmFsTm9kZTogYW55O1xuICBwcml2YXRlIF9pc0ZvbGRlciA9IGZhbHNlO1xuICBwcml2YXRlIF9pc0xvYyA9IGZhbHNlO1xuICBwcml2YXRlIF9pc0xvY2tlZCA9IGZhbHNlO1xuICAvLyBPUEVOIENPTlRFWFQgRkxBR1xuICBwcml2YXRlIF9vcGVuQ29udGV4dCA9IGZhbHNlO1xuICBnZXQgb3BlbkNvbnRleHQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX29wZW5Db250ZXh0O1xuICB9XG4gIHNldCBvcGVuQ29udGV4dCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX29wZW5Db250ZXh0ID0gdmFsdWU7XG4gIH1cbiAgZ2V0IG9yaWdpbmFsTm9kZSgpIHsgcmV0dXJuIHRoaXMuX29yaWdpbmFsTm9kZTsgfTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZGF0YTogYW55LCBwdWJsaWMgcGFyZW50OiBUcmVlTm9kZSwgcHVibGljIHRyZWVNb2RlbDogVHJlZU1vZGVsLCBpbmRleDogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuaWQgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmlkID09PSBudWxsKSB7XG4gICAgICB0aGlzLmlkID0gdXVpZCgpO1xuICAgIH0gLy8gTWFrZSBzdXJlIHRoZXJlJ3MgYSB1bmlxdWUgaWQgd2l0aG91dCBvdmVycmlkaW5nIGV4aXN0aW5nIGlkcyB0byB3b3JrIHdpdGggaW1tdXRhYmxlIGRhdGEgc3RydWN0dXJlc1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcblxuICAgIGlmICh0aGlzLmdldEZpZWxkKCdjaGlsZHJlbicpKSB7XG4gICAgICB0aGlzLl9pbml0Q2hpbGRyZW4oKTtcbiAgICB9XG4gICAgLy8gQ0hFQ0sgZm9yIHRhZyBpbiBkYXRhXG4gICAgaWYgKHRoaXMuZGF0YVsnZm9sZGVyJ10pIHtcbiAgICAgIHRoaXMuX2lzRm9sZGVyID0gdHJ1ZTtcbiAgICB9XG4gICAgLy8gVXNlZCB0byBzZXQgaWYgYSBmb2xkZXIgY29udGFpbmVzIGxvY2FsaXNlZCBpdGVtc1xuICAgIGlmICh0aGlzLmRhdGFbJ2lzbG9jJ10pIHtcbiAgICAgIHRoaXMuX2lzTG9jID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy5faXNMb2NrZWQgPSAhIXRoaXMuZGF0YVsnaXNMb2NrZWQnXTtcbiAgfVxuXG4gIHNldCBpc0xvY2tlZCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9pc0xvY2tlZCAhPT0gdmFsdWUpIHtcbiAgICAgIHRoaXMuZGF0YS5pc0xvY2tlZCA9IHZhbHVlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoeyBldmVudE5hbWU6IFRSRUVfRVZFTlRTLnVwZGF0ZURhdGEsIG5vZGU6IHRoaXMgfSk7XG4gICAgfVxuICB9XG4gIC8vIGhlbHBlciBnZXQgZnVuY3Rpb25zOlxuICBnZXQgaGFzQ2hpbGRyZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKHRoaXMuZGF0YS5oYXNDaGlsZHJlbiB8fCAodGhpcy5jaGlsZHJlbiAmJiB0aGlzLmNoaWxkcmVuLmxlbmd0aCA+IDApKTtcbiAgfVxuICBnZXQgaXNDb2xsYXBzZWQoKTogYm9vbGVhbiB7IHJldHVybiAhdGhpcy5pc0V4cGFuZGVkOyB9XG4gIGdldCBpc0xlYWYoKTogYm9vbGVhbiB7IHJldHVybiAhdGhpcy5oYXNDaGlsZHJlbjsgfVxuICBnZXQgaXNSb290KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5wYXJlbnQuZGF0YS52aXJ0dWFsOyB9XG4gIGdldCByZWFsUGFyZW50KCk6IFRyZWVOb2RlIHsgcmV0dXJuIHRoaXMuaXNSb290ID8gbnVsbCA6IHRoaXMucGFyZW50OyB9XG5cbiAgLy8gcHJveHkgZnVuY3Rpb25zOlxuICBnZXQgb3B0aW9ucygpOiBUcmVlT3B0aW9ucyB7IHJldHVybiB0aGlzLnRyZWVNb2RlbC5vcHRpb25zOyB9XG4gIGZpcmVFdmVudChldmVudCkgeyB0aGlzLnRyZWVNb2RlbC5maXJlRXZlbnQoZXZlbnQpOyB9XG5cbiAgLy8gZmllbGQgYWNjZXNzb3JzOlxuICBnZXQgZGlzcGxheUZpZWxkKCkge1xuICAgIHJldHVybiB0aGlzLmdldEZpZWxkKCdkaXNwbGF5Jyk7XG4gIH1cblxuICBnZXQgaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RmllbGQoJ2lkJyk7XG4gIH1cbiAgZ2V0IGlzRm9sZGVyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0ZvbGRlciB8fCB0aGlzLmhhc0NoaWxkcmVuO1xuICB9XG4gIGdldCBpc0xvYygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNMb2M7XG4gIH1cbiAgZ2V0IGlzTG9ja2VkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0xvY2tlZDtcbiAgfVxuXG4gIHNldCBpZCh2YWx1ZSkge1xuICAgIHRoaXMuc2V0RmllbGQoJ2lkJywgdmFsdWUpO1xuICB9XG5cbiAgZ2V0RmllbGQoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YVt0aGlzLm9wdGlvbnNbYCR7a2V5fUZpZWxkYF1dO1xuICB9XG5cbiAgc2V0RmllbGQoa2V5LCB2YWx1ZSkge1xuICAgIHRoaXMuZGF0YVt0aGlzLm9wdGlvbnNbYCR7a2V5fUZpZWxkYF1dID0gdmFsdWU7XG4gIH1cblxuICAvLyB0cmF2ZXJzaW5nOlxuICBfZmluZEFkamFjZW50U2libGluZyhzdGVwcywgc2tpcEhpZGRlbiA9IGZhbHNlKSB7XG4gICAgY29uc3Qgc2libGluZ3MgPSB0aGlzLl9nZXRQYXJlbnRzQ2hpbGRyZW4oc2tpcEhpZGRlbik7XG5cbiAgICByZXR1cm4gc2libGluZ3MubGVuZ3RoID4gdGhpcy5pbmRleCArIHN0ZXBzID8gc2libGluZ3NbdGhpcy5pbmRleCArIHN0ZXBzXSA6IG51bGw7XG4gIH1cblxuICBmaW5kTmV4dFNpYmxpbmcoc2tpcEhpZGRlbiA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbmRBZGphY2VudFNpYmxpbmcoKzEsIHNraXBIaWRkZW4pO1xuICB9XG5cbiAgZmluZFByZXZpb3VzU2libGluZyhza2lwSGlkZGVuID0gZmFsc2UpIHtcbiAgICByZXR1cm4gdGhpcy5fZmluZEFkamFjZW50U2libGluZygtMSwgc2tpcEhpZGRlbik7XG4gIH1cblxuICBnZXRWaXNpYmxlQ2hpbGRyZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaWJsZUNoaWxkcmVuO1xuICB9XG5cbiAgQGNvbXB1dGVkIGdldCB2aXNpYmxlQ2hpbGRyZW4oKSB7XG4gICAgcmV0dXJuICh0aGlzLmNoaWxkcmVuIHx8IFtdKS5maWx0ZXIoKG5vZGUpID0+ICFub2RlLmlzSGlkZGVuKTtcbiAgfVxuXG4gIGdldEZpcnN0Q2hpbGQoc2tpcEhpZGRlbiA9IGZhbHNlKSB7XG4gICAgbGV0IGNoaWxkcmVuID0gc2tpcEhpZGRlbiA/IHRoaXMudmlzaWJsZUNoaWxkcmVuIDogdGhpcy5jaGlsZHJlbjtcblxuICAgIHJldHVybiBmaXJzdChjaGlsZHJlbiB8fCBbXSk7XG4gIH1cblxuICBnZXRMYXN0Q2hpbGQoc2tpcEhpZGRlbiA9IGZhbHNlKSB7XG4gICAgbGV0IGNoaWxkcmVuID0gc2tpcEhpZGRlbiA/IHRoaXMudmlzaWJsZUNoaWxkcmVuIDogdGhpcy5jaGlsZHJlbjtcblxuICAgIHJldHVybiBsYXN0KGNoaWxkcmVuIHx8IFtdKTtcbiAgfVxuXG4gIGZpbmROZXh0Tm9kZShnb0luc2lkZSA9IHRydWUsIHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIHJldHVybiBnb0luc2lkZSAmJiB0aGlzLmlzRXhwYW5kZWQgJiYgdGhpcy5nZXRGaXJzdENoaWxkKHNraXBIaWRkZW4pIHx8XG4gICAgICAgICAgIHRoaXMuZmluZE5leHRTaWJsaW5nKHNraXBIaWRkZW4pIHx8XG4gICAgICAgICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LmZpbmROZXh0Tm9kZShmYWxzZSwgc2tpcEhpZGRlbik7XG4gIH1cblxuICBmaW5kUHJldmlvdXNOb2RlKHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIGxldCBwcmV2aW91c1NpYmxpbmcgPSB0aGlzLmZpbmRQcmV2aW91c1NpYmxpbmcoc2tpcEhpZGRlbik7XG4gICAgaWYgKCFwcmV2aW91c1NpYmxpbmcpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlYWxQYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBwcmV2aW91c1NpYmxpbmcuX2dldExhc3RPcGVuRGVzY2VuZGFudChza2lwSGlkZGVuKTtcbiAgfVxuXG4gIF9nZXRMYXN0T3BlbkRlc2NlbmRhbnQoc2tpcEhpZGRlbiA9IGZhbHNlKSB7XG4gICAgY29uc3QgbGFzdENoaWxkID0gdGhpcy5nZXRMYXN0Q2hpbGQoc2tpcEhpZGRlbik7XG4gICAgcmV0dXJuICh0aGlzLmlzQ29sbGFwc2VkIHx8ICFsYXN0Q2hpbGQpXG4gICAgICA/IHRoaXNcbiAgICAgIDogbGFzdENoaWxkLl9nZXRMYXN0T3BlbkRlc2NlbmRhbnQoc2tpcEhpZGRlbik7XG4gIH1cblxuICBwcml2YXRlIF9nZXRQYXJlbnRzQ2hpbGRyZW4oc2tpcEhpZGRlbiA9IGZhbHNlKTogYW55W10ge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5wYXJlbnQgJiZcbiAgICAgIChza2lwSGlkZGVuID8gdGhpcy5wYXJlbnQuZ2V0VmlzaWJsZUNoaWxkcmVuKCkgOiB0aGlzLnBhcmVudC5jaGlsZHJlbik7XG5cbiAgICByZXR1cm4gY2hpbGRyZW4gfHwgW107XG4gIH1cblxuICBwcml2YXRlIGdldEluZGV4SW5QYXJlbnQoc2tpcEhpZGRlbiA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFBhcmVudHNDaGlsZHJlbihza2lwSGlkZGVuKS5pbmRleE9mKHRoaXMpO1xuICB9XG5cbiAgaXNEZXNjZW5kYW50T2Yobm9kZTogVHJlZU5vZGUpIHtcbiAgICBpZiAodGhpcyA9PT0gbm9kZSkgcmV0dXJuIHRydWU7XG4gICAgZWxzZSByZXR1cm4gdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQuaXNEZXNjZW5kYW50T2Yobm9kZSk7XG4gIH1cblxuICBnZXROb2RlUGFkZGluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMubGV2ZWxQYWRkaW5nICogKHRoaXMubGV2ZWwgLSAxKSArICdweCc7XG4gIH1cblxuICBnZXRDbGFzcygpOiBzdHJpbmcge1xuICAgIHJldHVybiBbdGhpcy5vcHRpb25zLm5vZGVDbGFzcyh0aGlzKSwgYHRyZWUtbm9kZS1sZXZlbC0keyB0aGlzLmxldmVsIH1gXS5qb2luKCcgJyk7XG4gIH1cblxuICBvbkRyb3AoJGV2ZW50KSB7XG4gICAgdGhpcy5tb3VzZUFjdGlvbignZHJvcCcsICRldmVudC5ldmVudCwge1xuICAgICAgZnJvbTogJGV2ZW50LmVsZW1lbnQsXG4gICAgICB0bzogeyBwYXJlbnQ6IHRoaXMsIGluZGV4OiAwLCBkcm9wT25Ob2RlOiB0cnVlIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFsbG93RHJvcCA9IChlbGVtZW50LCAkZXZlbnQ/KSA9PiB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5yZWFkT25seSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuYWxsb3dEcm9wKGVsZW1lbnQsIHsgcGFyZW50OiB0aGlzLCBpbmRleDogMCB9LCAkZXZlbnQpO1xuICB9XG5cbiAgYWxsb3dEcmFnKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuYWxsb3dEcmFnKHRoaXMpO1xuICB9XG5cblxuICAvLyBoZWxwZXIgbWV0aG9kczpcbiAgbG9hZE5vZGVDaGlsZHJlbigpIHtcbiAgICBpZiAoIXRoaXMub3B0aW9ucy5nZXRDaGlsZHJlbikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpOyAvLyBOb3QgZ2V0Q2hpbGRyZW4gbWV0aG9kIC0gZm9yIHVzaW5nIHJlZHV4XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5vcHRpb25zLmdldENoaWxkcmVuKHRoaXMpKVxuICAgICAgLnRoZW4oKGNoaWxkcmVuKSA9PiB7XG4gICAgICAgIGlmIChjaGlsZHJlbikge1xuICAgICAgICAgIHRoaXMuc2V0RmllbGQoJ2NoaWxkcmVuJywgY2hpbGRyZW4pO1xuICAgICAgICAgIHRoaXMuX2luaXRDaGlsZHJlbigpO1xuICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgICAgIGlmIChjaGlsZC5nZXRGaWVsZCgnaXNFeHBhbmRlZCcpICYmIGNoaWxkLmhhc0NoaWxkcmVuKSB7XG4gICAgICAgICAgICAgIGNoaWxkLmV4cGFuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfX0pLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmZpcmVFdmVudCh7XG4gICAgICAgICAgZXZlbnROYW1lOiBUUkVFX0VWRU5UUy5sb2FkTm9kZUNoaWxkcmVuLFxuICAgICAgICAgIG5vZGU6IHRoaXNcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZCgpIHtcbiAgICBpZiAoIXRoaXMuaXNFeHBhbmRlZCkge1xuICAgICAgcmV0dXJuIHRoaXMudG9nZ2xlRXhwYW5kZWQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICBjb2xsYXBzZSgpIHtcbiAgICBpZiAodGhpcy5pc0V4cGFuZGVkKSB7XG4gICAgICB0aGlzLnRvZ2dsZUV4cGFuZGVkKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkb0ZvckFsbChmbjogKG5vZGU6IElUcmVlTm9kZSkgPT4gYW55KSB7XG4gICAgUHJvbWlzZS5yZXNvbHZlKGZuKHRoaXMpKS50aGVuKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmNoaWxkcmVuKSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IGNoaWxkLmRvRm9yQWxsKGZuKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBleHBhbmRBbGwoKSB7XG4gICAgdGhpcy5kb0ZvckFsbCgobm9kZSkgPT4gbm9kZS5leHBhbmQoKSk7XG4gIH1cblxuICBjb2xsYXBzZUFsbCgpIHtcbiAgICB0aGlzLmRvRm9yQWxsKChub2RlKSA9PiBub2RlLmNvbGxhcHNlKCkpO1xuICB9XG5cbiAgZW5zdXJlVmlzaWJsZSgpIHtcbiAgICBpZiAodGhpcy5yZWFsUGFyZW50KSB7XG4gICAgICB0aGlzLnJlYWxQYXJlbnQuZXhwYW5kKCk7XG4gICAgICB0aGlzLnJlYWxQYXJlbnQuZW5zdXJlVmlzaWJsZSgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdG9nZ2xlRXhwYW5kZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0SXNFeHBhbmRlZCghdGhpcy5pc0V4cGFuZGVkKTtcbiAgfVxuXG4gIHNldElzRXhwYW5kZWQodmFsdWUpIHtcbiAgICBpZiAodGhpcy5oYXNDaGlsZHJlbikge1xuICAgICAgdGhpcy50cmVlTW9kZWwuc2V0RXhwYW5kZWROb2RlKHRoaXMsIHZhbHVlKTtcblxuICAgICAgaWYgKCF0aGlzLmNoaWxkcmVuICYmIHRoaXMuaGFzQ2hpbGRyZW4gJiYgdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9hZE5vZGVDaGlsZHJlbigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfTtcblxuICBzZXRJc0FjdGl2ZSh2YWx1ZSwgbXVsdGkgPSBmYWxzZSkge1xuICAgIHRoaXMudHJlZU1vZGVsLnNldEFjdGl2ZU5vZGUodGhpcywgdmFsdWUsIG11bHRpKTtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMuZm9jdXModGhpcy5vcHRpb25zLnNjcm9sbE9uU2VsZWN0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRvZ2dsZUFjdGl2YXRlZChtdWx0aSA9IGZhbHNlKSB7XG4gICAgdGhpcy5zZXRJc0FjdGl2ZSghdGhpcy5pc0FjdGl2ZSwgbXVsdGkpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRBY3RpdmVBbmRWaXNpYmxlKG11bHRpID0gZmFsc2UpIHtcbiAgICB0aGlzLnNldElzQWN0aXZlKHRydWUsIG11bHRpKVxuICAgICAgLmVuc3VyZVZpc2libGUoKTtcblxuICAgIHNldFRpbWVvdXQodGhpcy5zY3JvbGxJbnRvVmlldy5iaW5kKHRoaXMpKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2Nyb2xsSW50b1ZpZXcoZm9yY2UgPSBmYWxzZSkge1xuICAgIHRoaXMudHJlZU1vZGVsLnZpcnR1YWxTY3JvbGwuc2Nyb2xsSW50b1ZpZXcodGhpcywgZm9yY2UpO1xuICB9XG5cbiAgZm9jdXMoc2Nyb2xsID0gdHJ1ZSkge1xuICAgIGxldCBwcmV2aW91c05vZGUgPSB0aGlzLnRyZWVNb2RlbC5nZXRGb2N1c2VkTm9kZSgpO1xuICAgIHRoaXMudHJlZU1vZGVsLnNldEZvY3VzZWROb2RlKHRoaXMpO1xuICAgIGlmIChzY3JvbGwpIHtcbiAgICAgIHRoaXMuc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICB9XG4gICAgaWYgKHByZXZpb3VzTm9kZSkge1xuICAgICAgdGhpcy5maXJlRXZlbnQoeyBldmVudE5hbWU6IFRSRUVfRVZFTlRTLmJsdXIsIG5vZGU6IHByZXZpb3VzTm9kZSB9KTtcbiAgICB9XG4gICAgdGhpcy5maXJlRXZlbnQoeyBldmVudE5hbWU6IFRSRUVfRVZFTlRTLmZvY3VzLCBub2RlOiB0aGlzIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBibHVyKCkge1xuICAgIGxldCBwcmV2aW91c05vZGUgPSB0aGlzLnRyZWVNb2RlbC5nZXRGb2N1c2VkTm9kZSgpO1xuICAgIHRoaXMudHJlZU1vZGVsLnNldEZvY3VzZWROb2RlKG51bGwpO1xuICAgIGlmIChwcmV2aW91c05vZGUpIHtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KHsgZXZlbnROYW1lOiBUUkVFX0VWRU5UUy5ibHVyLCBub2RlOiB0aGlzIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0SXNIaWRkZW4odmFsdWUpIHtcbiAgICB0aGlzLnRyZWVNb2RlbC5zZXRJc0hpZGRlbih0aGlzLCB2YWx1ZSk7XG4gIH1cblxuICBoaWRlKCkge1xuICAgIHRoaXMuc2V0SXNIaWRkZW4odHJ1ZSk7XG4gIH1cblxuICBzaG93KCkge1xuICAgIHRoaXMuc2V0SXNIaWRkZW4oZmFsc2UpO1xuICB9XG5cbiAgbW91c2VBY3Rpb24oYWN0aW9uTmFtZTogc3RyaW5nLCAkZXZlbnQsIGRhdGE6IGFueSA9IG51bGwpIHtcbiAgICB0aGlzLnRyZWVNb2RlbC5zZXRGb2N1cyh0cnVlKTtcblxuICAgIGNvbnN0IGFjdGlvbk1hcHBpbmcgPSB0aGlzLm9wdGlvbnMuYWN0aW9uTWFwcGluZy5tb3VzZTtcbiAgICBjb25zdCBhY3Rpb24gPSBhY3Rpb25NYXBwaW5nW2FjdGlvbk5hbWVdO1xuXG4gICAgaWYgKGFjdGlvbikge1xuICAgICAgYWN0aW9uKHRoaXMudHJlZU1vZGVsLCB0aGlzLCAkZXZlbnQsIGRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIGdldFNlbGZIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5ub2RlSGVpZ2h0KHRoaXMpO1xuICB9XG4gICAgLy8gVE9HR0xFIENPTlRFWFRcbiAgICB0b2dnbGVDb250ZXh0KCRldmVudCkge1xuICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZiAodGhpcy50cmVlTW9kZWwuY29udGV4dE1lbnVOb2RlICYmICh0aGlzLnRyZWVNb2RlbC5jb250ZXh0TWVudU5vZGUuaWQgIT09IHRoaXMuaWQpKSB7XG4gICAgICAgIHRoaXMudHJlZU1vZGVsLmNvbnRleHRNZW51Tm9kZS5vcGVuQ29udGV4dCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgdGhpcy50cmVlTW9kZWwuY29udGV4dE1lbnVOb2RlID0gdGhpcztcbiAgICAgIHRoaXMuX29wZW5Db250ZXh0ID0gIXRoaXMuX29wZW5Db250ZXh0O1xuICAgICAgLy8gcmVzZXQgY29udGV4dCBvZiBwcmV2aW91cywgc2hvdyB0aGlzIGNvbnRleHRcbiAgICB9XG4gICAgLy8gUkVOQU1FXG4gICAgcmVuYW1lKG5ld05hbWU6IHN0cmluZykge1xuICAgICAgdGhpcy5kYXRhLm5hbWUgPSBuZXdOYW1lO1xuICAgICAgdGhpcy5maXJlRXZlbnQoeyBldmVudE5hbWU6IFRSRUVfRVZFTlRTLnVwZGF0ZURhdGEsIG5vZGU6IHRoaXMgfSk7XG4gICAgfVxuXG4gIEBhY3Rpb24gX2luaXRDaGlsZHJlbigpIHtcbiAgICB0aGlzLmNoaWxkcmVuID0gdGhpcy5nZXRGaWVsZCgnY2hpbGRyZW4nKVxuICAgICAgLm1hcCgoYywgaW5kZXgpID0+IG5ldyBUcmVlTm9kZShjLCB0aGlzLCB0aGlzLnRyZWVNb2RlbCwgaW5kZXgpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB1dWlkKCkge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDAwMDAwMDAwMDApO1xufVxuIl19